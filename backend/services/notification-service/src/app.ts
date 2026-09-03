import "express-async-errors";
import express from "express";
import cors from "cors";
import { errorHandler } from "./middlewares/error.middleware.js";
import { NotFoundError } from "./utils/error.js";
import notificationRoutes from "./routes/notification.route.js";

import { traceStorage, logger } from './utils/logger.js';
import { register } from './metrics/metrics.js';

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use((req, res, next) => {
    const traceId = req.headers['x-correlation-id'] || 'no-trace';
    traceStorage.run(traceId as string, () => {
      logger.info(`Incoming ${req.method} request to ${req.url}`);
      next();
    });
  });

  app.get('/metrics', async (req, res) => {
    try {
      res.set('Content-Type', register.contentType);
      res.end(await register.metrics());
    } catch (ex) {
      res.status(500).end(ex);
    }
  });

  app.use("/api/notifications", notificationRoutes);

  app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok", service: "notification-service" });
  });

  app.all("*", (req, res) => {
    throw new NotFoundError(`Can't find ${req.originalUrl}`);
  });

  app.use(errorHandler);

  return app;
}
