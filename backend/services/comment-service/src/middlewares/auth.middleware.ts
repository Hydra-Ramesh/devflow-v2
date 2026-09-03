import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ status: "error", message: "No authorization token provided" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      id: string;
      email?: string;
    };
    (req as any).user = { id: decoded.id, email: decoded.email };
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ status: "error", message: "Invalid or expired token" });
  }
};
