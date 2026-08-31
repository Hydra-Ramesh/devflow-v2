import express from 'express';
import { createServer } from 'http';
import { PORT } from './config/env.js';
import { initSocketServer } from './service/server.js';
import { startKafkaConsumer, stopKafkaConsumer } from './kafka/kafka.js';
import { pubClient, subClient } from './config/redis.js';
import cors from 'cors';
import healthRouter from './routes/health.js';

const app = express();
app.use(cors());

const httpServer = createServer(app);

initSocketServer(httpServer);


app.use('/health', healthRouter);

httpServer.listen(PORT, async () => {
  console.log(`[Realtime Service v2] Running on port ${PORT}`);
  await startKafkaConsumer();
});

const shutdown = async () => {
  console.log('Shutting down gracefully...');
  await stopKafkaConsumer();
  pubClient.quit();
  subClient.quit();
  httpServer.close(() => {
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
