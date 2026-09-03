import "express-async-errors";
import express from "express";
import cors from "cors";
import { errorHandler } from "./middlewares/error.middleware.js";
import { NotFoundError } from "./utils/error.js";
import notificationRoutes from "./routes/notification.route.js";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

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
