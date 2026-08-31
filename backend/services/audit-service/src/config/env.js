import dotenv from 'dotenv';
dotenv.config();

export const env = {
    PORT: process.env.PORT || '5022',
    NODE_ENV: process.env.NODE_ENV || 'development',
    MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/audit-service',
    KAFKA_BROKERS: process.env.KAFKA_BROKERS || process.env.KAFKA_BROKER || 'localhost:9092',
    JWT_SECRET: process.env.JWT_SECRET || 'supersecretkeythatisverylongandsecurebecausejwtneedsit',
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
};