import Redis from 'ioredis';
import {REDIS_URL} from './env.js';

export const pubClient = new Redis(REDIS_URL);
export const subClient= pubClient.duplicate();

pubClient.on('error', (err) => {
  console.error('Redis Pub Client Error:', err);
});

subClient.on('error', (err) => {
  console.error('Redis Sub Client Error:', err);
});