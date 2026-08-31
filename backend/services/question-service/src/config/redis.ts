import { Redis } from "ioredis";
import { env } from "./env.js";

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  retryStrategy(times: number) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  reconnectOnError(err: any) {
    const targetError = "READONLY";
    if (err.message.includes(targetError)) {
      return true;
    }
    return false;
  },
});

redis.on("connect", () => {
  console.log("Connected to Redis Question Service");
});

redis.on("error", (err) => {
  console.warn("Redis connection error (will retry):", err.message);
});

export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.warn(`Redis getCache failed for ${key}:`, err);
    return null;
  }
}

export async function setCache(
  key: string,
  value: any,
  ttlSeconds = 300,
): Promise<void> {
  try {
    const jitter =
      Math.floor(Math.random() * (ttlSeconds * 0.2)) - ttlSeconds * 0.1;
    const finalTtl = Math.max(10, Math.floor(ttlSeconds + jitter));
    await redis.setex(key, finalTtl, JSON.stringify(value));
  } catch (err) {
    console.warn(`Redis setCache failed for ${key}:`, err);
  }
}

export async function deleteCache(patternOrKey: string): Promise<void> {
  try {
    if (patternOrKey.includes("*")) {
      const keys = await redis.keys(patternOrKey);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } else {
      await redis.del(patternOrKey);
    }
  } catch (err) {
    console.warn(`Redis deleteCache failed for ${patternOrKey}:`, err);
  }
}
