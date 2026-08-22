import { RateLimiterRedis } from 'rate-limiter-flexible';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/errorApi.js';
import { Redis } from 'ioredis';
import { isConnected, redisConfig } from '../config/redisConnection.js';

const host = process.env.REDIS_HOST || "127.0.0.1";
const port = process.env.REDIS_PORT
    ? parseInt(process.env.REDIS_PORT, 10)
    : 6379;

export const redisClientForLimit: Redis = new Redis({
  host: host,
  port: port,
});

const rateLimit = new RateLimiterRedis({
    storeClient: isConnected ? redisConfig : redisClientForLimit,
    keyPrefix: "token_bucket",
    points: 50,
    duration: 60,
    blockDuration: 30,
});

const rateLimitMiddleware = asyncHandler(async (req, res, next) => {
    try {
        
        const clientIp = req.ip || 'unknown';
            const { remainingPoints } = await rateLimit.consume(clientIp);
            console.log(`Rate limit remaining points for ${clientIp}: ${remainingPoints}`);
        
        next();
    } catch (error) {
        console.log("Rate limit error :: ", error);
        throw new ApiError(429, "Too many requests, please try again later.");
    }
});

export {
    rateLimitMiddleware
}

