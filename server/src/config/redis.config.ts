import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379"

export const RedisClient = new Redis(redisUrl)

RedisClient.on("ready", () => {
    console.log("Redis connected successfully")
})

RedisClient.on("error", () => {
    console.error("Failed to connect to redis")
})