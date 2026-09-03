import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/error.js';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    if (err.isOperational) {
      console.warn(`[Operational Error]: ${err.message}`);
    }
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      ...(err.errors && { errors: err.errors })
    });
  }
  
  console.error(`[Unhandled Error] ${err.message}`, { stack: err.stack });
  res.status(500).json({ status: 'error', message: 'Internal Server Error' });
};
