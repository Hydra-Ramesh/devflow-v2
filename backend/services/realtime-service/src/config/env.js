import dotenv from 'dotenv';
dotenv.config();

export const PORT = process.env.PORT || 5023;
export const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
export const KAFKA_BROKER = (process.env.KAFKA_BROKER || 'localhost:9092').split(',');
export const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';