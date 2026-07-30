import { Redis } from "ioredis";
import { ApiError } from "../utils/errorApi.js";

const host = process.env.REDIS_HOST || "127.0.0.1";
const port = process.env.REDIS_PORT
    ? parseInt(process.env.REDIS_PORT, 10)
    : 6379;

// Redis configuration - reusable for all Redis clients
const redisConfig = {
    host,
    port,
    retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
    maxRetriesPerRequest: 3,
    enableReadyCheck: false,
};

let redisClient: Redis | null = null;
let isConnected = false;

export async function connectRedis(): Promise<void> {
    if (isConnected) {
        console.log("Redis already connected");
        return;
    }

    try {
        redisClient = new Redis(redisConfig);
        await redisClient.ping();
        isConnected = true;
        console.log("Redis connected successfully");
    } catch (error) {
        console.error("Failed to connect to Redis:", error);
        throw error;
    }
}

const setRedisFunction = async (key: string, value: string, ttl: number): Promise<void> => {
    try {
        if (!redisClient) {
            throw new ApiError(503, "The service is temporarily down, try again later.");
        }
        await redisClient.set(key, value, "EX", ttl);
    } catch (error) {
        console.error(`Redis SET failed :`, error);
        throw error;
    }
};

const getRedisFunction = async (key: string): Promise<string | null> => {
    try {
        if (!redisClient) {
            throw new ApiError(503, "The service is temporarily down, try again later.");
        }
        const value = await redisClient.get(key);
        return value;
    } catch (error) {
        console.error(`Redis GET failed :`, error);
        throw error;
    }
};

export const checkRateLimit = async ({
    key,
    limit,
    ttl
}: {
    key: string
    limit: number
    ttl: number
}) => {
    if (!redisClient) {
        throw new ApiError(503, "The service is temporarily down, try again later.");
    }
    const count = await redisClient.incr(key);

    if (count === 1) {
        await redisClient.expire(key, ttl);
    }

    if (count > limit) {
        const retryAfter = await redisClient.ttl(key);
        throw new ApiError(
            429,
            `Too many requests. Try again after ${retryAfter} seconds.`,
        );
    }
};

const deleteDataFromRedis = async (key: string): Promise<number> => {
    try {
        if (!redisClient) {
            throw new ApiError(503, "The service is temporarily down, try again later.");
        }
        const deleted = await redisClient.del(key);
        return deleted;
    } catch (error) {
        console.error(`Redis DELETE failed :`, error);
        throw error;
    }
}

const checkRedisHealth = async (): Promise<boolean> => {
    try {
        if (!redisClient) {
            console.warn("Redis not initialized");
            return false;
        }
        const result = await redisClient.ping();
        console.log("Redis health check passed:", result);
        return true;
    } catch (error) {
        console.error("Redis health check failed:", error);
        return false;
    }
};

const disconnectRedis = async (): Promise<void> => {
    try {
        if (redisClient) await redisClient.quit();
        isConnected = false;
        console.log("Redis connection closed gracefully");
    } catch (error) {
        console.error("Error closing Redis connection:", error);
    }
}

export {
    redisClient,
    redisConfig,
    isConnected,
    checkRedisHealth,
    setRedisFunction,
    getRedisFunction,
    deleteDataFromRedis,
    disconnectRedis,

}