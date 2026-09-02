import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import hpp from 'hpp';
import questionRoutes from './routes/question.route.js';
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

  // Security Hardening
  app.use(helmet({ crossOriginResourcePolicy: false }));
  app.use(hpp());
  app.use(cors());
  app.use(compression());

  // Body parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Observability & Health
  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({
      status: 'UP',
      service: 'question-service-v2',
      timestamp: new Date().toISOString(),
    });
  });

  app.get('/metrics', async (_req: Request, res: Response) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  });

  // Dual-prefix routing compatibility
  app.use('/api/questions', questionRoutes);
  app.use('/api/v1/questions', questionRoutes);
  app.use('/', questionRoutes);

  // 404 Fallback
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      status: 'error',
      message: `Route ${req.method} ${req.originalUrl} not found`,
    });
  });

  // Global Error Handler
  app.use(errorHandler);

  return app;
}
