import { Redis } from 'ioredis';
import { env } from './env.js';

export const redis = new Redis(env.REDIS_URL);

redis.on('connect', () => {
  console.log('Connected to Redis Comment Service');
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err);
});

export async function deleteCache(pattern: string) {
  try {
    if (pattern.includes('*')) {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } else {
      await redis.del(pattern);
    }
  } catch (err) {
    console.warn(`Failed to delete cache ${pattern}`, err);
  }
}
