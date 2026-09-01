import { Request, Response, NextFunction } from "express";

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const correlationId = (req.headers["x-correlation-id"] as string) || "N/A";
  const statusCode =
    err.statusCode || (err.status ? parseInt(err.status) : 500);
  const message = err.message || "Internal Server Error";

  console.error(
    `[${correlationId}] Error ${statusCode}: ${message}`,
    err.stack || err,
  );

  res.status(statusCode).json({
    success: false,
    status: "error",
    message,
    traceId: correlationId,
    timestamp: new Date().toISOString(),
  });
}
