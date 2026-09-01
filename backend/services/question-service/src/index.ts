import { createApp } from './app.js';
import { env } from './config/env.js';
import { prisma } from './config/prisma.js';
import { redis } from './config/redis.js';
import { connectKafka, disconnectKafka } from './config/kafka.js';
import { startQuestionConsumer } from './kafka/question.consumer.js';
import { ViewCounterService } from './services/view-counter.service.js';

async function bootstrap() {
  console.log('🚀 Initializing DevFlow Question Service v2 (TypeScript)...');

  // 1. Connect to Kafka
  await connectKafka();
  startQuestionConsumer().catch((err) => console.warn('Kafka consumer init warning:', err));

  // 2. Start Asynchronous View Counter Flusher
  ViewCounterService.startBatchFlusher();

  // 3. Initialize Express App
  const app = createApp();
  const PORT = parseInt(env.PORT, 10) || 5005;

  const server = app.listen(PORT, () => {
    console.log(` Question Service v2 is listening on port ${PORT}`);
    console.log(`Prometheus Metrics available at http://localhost:${PORT}/metrics`);
    console.log(` Health check available at http://localhost:${PORT}/health`);
  });

  // Graceful Shutdown
  const shutdown = async (signal: string) => {
    console.log(`\nReceived ${signal}. Starting graceful shutdown...`);

    server.close(async () => {
      console.log('HTTP server closed.');

      // Stop view flusher & flush remaining views
      ViewCounterService.stop();
      await ViewCounterService.flushViewsToDatabase();

      // Disconnect infrastructure
      await disconnectKafka();
      await redis.quit();
      await prisma.$disconnect();

      console.log(' All connections cleanly closed. Exiting process.');
      process.exit(0);
    });

    setTimeout(() => {
      console.error('Forcefully shutting down after timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch((err) => {
  console.error('Fatal error during bootstrap:', err);
  process.exit(1);
});
