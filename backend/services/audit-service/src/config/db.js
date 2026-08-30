import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

export async function connectDB() {
  try {
    await mongoose.connect(env.MONGO_URI, {
      maxPoolSize: 50,
      serverSelectionTimeoutMS: 5000,
    });
    logger.info(`Connected to MongoDB Audit Database: ${env.MONGO_URI}`);
  } catch (err) {
    logger.error('MongoDB Connection Error (will retry):', { error: err.message });
  }

  mongoose.connection.on('error', (err) => {
    logger.error('MongoDB runtime error:', { error: err.message });
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected. Attempting reconnection...');
  });
}

export async function disconnectDB() {
  try {
    await mongoose.disconnect();
    logger.info('MongoDB disconnected cleanly');
  } catch (err) {
    logger.error('Error disconnecting MongoDB:', { error: err.message });
  }
}
