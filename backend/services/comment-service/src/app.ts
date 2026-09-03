import "express-async-errors";
import express from "express";
import cors from "cors";
import { commentRoutes } from "./routes/comment.route.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { NotFoundError } from "./utils/error.js";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

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
