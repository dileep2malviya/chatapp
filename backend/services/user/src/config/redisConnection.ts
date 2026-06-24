import {Redis} from 'ioredis'

const host = process.env.REDIS_HOST || '127.0.0.1'
const port = process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379
console.log("host ::",host)
const redisPublish: Redis  = new Redis({
    host,
    port,
})

const redisSubscribe: Redis = new Redis({
    host,
    port,
})

const clusterClient: Redis = new Redis({
    host,
    port,
})

const setRedisFunction = async (key: string, opt:string, ttl:number) => {
    await clusterClient.set(key, opt, "EX", ttl)
}

const getRedisFunction = async (key:string):Promise<string | null> => {
    return await clusterClient.get(key)
}

const checkRedisHealth = async () => {
    try {
        const result = await redisPublish.ping()
        console.log('Redis ping response:', result)
        return true
    } catch (error) {
        console.error('Redis health check failed:', error)
        return false
    }
}

export {
    redisPublish,
    redisSubscribe,
    clusterClient,
    checkRedisHealth,
    setRedisFunction,
    getRedisFunction
}