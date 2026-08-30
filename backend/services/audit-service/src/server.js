import { createApp } from './app.js';
import { env } from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';
import { connectKafka, disconnectKafka } from './config/kafka.js';
import { logger } from './utils/logger.js';

async function bootstrap() {
  logger.info('Starting DevFlow Audit & Security Compliance Service v2...');

  // 1. Connect to isolated MongoDB Audit Database
  await connectDB();

  // 2. Connect Kafka Consumer and subscribe to critical event streams
  await connectKafka();

  // 3. Start Express HTTP Server
  const app = createApp();
  const PORT = parseInt(env.PORT, 10) || 5022;

  const server = app.listen(PORT, () => {
    logger.info(` Audit Service v2 running on port ${PORT}`);
    logger.info(` Prometheus metrics at http://localhost:${PORT}/metrics`);
    logger.info(` Health check at http://localhost:${PORT}/health`);
  });

  // Graceful Shutdown
  const shutdown = async (signal) => {
    logger.info(` Received ${signal}. Shutting down gracefully...`);

    server.close(async () => {
      logger.info('HTTP server closed.');
      await disconnectKafka();
      await disconnectDB();
      logger.info('All resources cleanly closed. Exiting process.');
      process.exit(0);
    });

    setTimeout(() => {
      logger.error('Forcefully terminating after timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch((err) => {
  logger.error('Fatal error during Audit Service startup:', { error: err.message, stack: err.stack });
  process.exit(1);
});
