import Redis from "ioredis";
import { env } from "./env.config.js";

const redis = new Redis(env.redisUrl, {
  retryStrategy(times) {
    return Math.min(times * 50, 2000);
  },
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
});

redis.on("connect", () => {
  console.log("Redis connected");
});

redis.on("error", (err) => {
  console.error("Redis error:", err);
});

export default redis;
