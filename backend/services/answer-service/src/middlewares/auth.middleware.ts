import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { UserTokenPayload } from "../types/index.js";

export interface AuthenticatedRequest extends Request {
  user?: UserTokenPayload;
}

export function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      status: "error",
      message: "Unauthorized: Authentication token is required",
    });
    return;
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as any;
    req.user = {
      id: decoded.id || decoded.sub || decoded.userId,
      email: decoded.email,
      role: decoded.role || "USER",
      sid: decoded.sid,
    };
    next();
  } catch (err: any) {
    res.status(401).json({
      success: false,
      status: "error",
      message: "Unauthorized: Invalid or expired token",
    });
  }
}

export function optionalAuth(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as any;
      req.user = {
        id: decoded.id || decoded.sub || decoded.userId,
        email: decoded.email,
        role: decoded.role || "USER",
        sid: decoded.sid,
      };
    } catch {
    }
  }
  next();
}
