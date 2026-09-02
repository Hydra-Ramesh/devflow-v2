import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import hpp from 'hpp';
import rateLimit from 'express-rate-limit';
import auditRoutes from './routes/audit.routes.js';
import { errorHandler } from './middleware/error.middleware.js';
import { register } from './metrics/metrics.js';

import { traceStorage, logger } from './utils/logger.js';

export function createApp() {
  const app = express();

  // Trust reverse proxy (API Gateway)
  app.set('trust proxy', 1);

  // Tracing Middleware
  app.use((req, res, next) => {
    const correlationId = req.headers['x-correlation-id'] || 'system-' + Date.now();
    traceStorage.run(correlationId, () => {
      logger.info(`Incoming ${req.method} request to ${req.url}`);
      next();
    });
  });

  // Security Hardening
  app.use(helmet());
  app.use(hpp());
  app.use(cors());
  app.use(compression());

  // Rate limiting for audit queries
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api/audit', limiter);

  // Body parsers
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Observability & Health
  app.get('/health', (_req, res) => {
    res.status(200).json({
      status: 'UP',
      service: 'audit-service',
      timestamp: new Date().toISOString(),
    });
  });

  app.get('/metrics', async (_req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  });

  // Dual-prefix routing compatibility
  app.use('/api/audit', auditRoutes);
  app.use('/api/v1/audit', auditRoutes);
  app.use('/', auditRoutes);

  // Global Error Handler
  app.use(errorHandler);

  return app;
}
