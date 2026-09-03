import { Redis } from 'ioredis';
import { env } from './env.js';

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

export const pubClient = redis.duplicate();
export const subClient = redis.duplicate();

redis.on('connect', () => {
  console.log(' Connected to Redis Notification Service');
});

redis.on('error', (err) => {
  console.error(' Redis error:', err);
});
