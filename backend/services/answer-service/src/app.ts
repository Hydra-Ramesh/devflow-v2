import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { answerRoutes } from './routes/answer.route.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { register } from './metrics/metrics.js';
import { traceStorage, logger } from './utils/logger.js';

export function createApp(): Express {
  const app = express();

  // Tracing Middleware
  app.use((req: Request, res: Response, next) => {
    const correlationId = req.headers['x-correlation-id'] as string || 'system-' + Date.now();
    traceStorage.run(correlationId, () => {
      logger.info(`Incoming ${req.method} request to ${req.url}`);
      next();
    });
  });

  app.use(helmet({ crossOriginResourcePolicy: false }));
  app.use(cors());
  app.use(compression());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({
      status: 'UP',
      service: 'answer-service',
    });
  });

  app.get('/metrics', async (_req: Request, res: Response) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  });

  app.use('/api/answers', answerRoutes);
  app.use('/api/v1/answers', answerRoutes);
  app.use('/', answerRoutes);

  app.use((req: Request, res: Response) => {
    res.status(404).json({ success: false, message: 'Route not found' });
  });

  app.use(errorHandler);

  return app;
}
