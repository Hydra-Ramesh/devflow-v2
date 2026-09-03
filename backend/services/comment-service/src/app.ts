import "express-async-errors";
import express from "express";
import cors from "cors";
import { commentRoutes } from "./routes/comment.route.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { NotFoundError } from "./utils/error.js";
import { register } from './metrics/metrics.js';
import { traceStorage, logger } from './utils/logger.js';

export function createApp() {
  const app = express();

  // Tracing Middleware
  app.use((req, res, next) => {
    const correlationId = req.headers['x-correlation-id'] as string || 'system-' + Date.now();
    traceStorage.run(correlationId, () => {
      logger.info(`Incoming ${req.method} request to ${req.url}`);
      next();
    });
  });

  app.use(cors());
  app.use(express.json());

  app.get('/metrics', async (_req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  });

  app.use("/api/comments", commentRoutes);

  app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok", service: "comment-service-v2" });
  });

  app.all("*", (req, res) => {
    throw new NotFoundError(`Can't find ${req.originalUrl}`);
  });

  app.use(errorHandler);

  return app;
}
