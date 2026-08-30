import { logger } from '../utils/logger.js';

export function errorHandler(err, req, res, _next) {
  const correlationId = req.headers['x-correlation-id'] || 'N/A';
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  logger.error(`[${correlationId}] Error ${statusCode}: ${message}`, {
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
  });

  res.status(statusCode).json({
    success: false,
    status: 'error',
    message,
    traceId: correlationId,
    timestamp: new Date().toISOString(),
  });
}
