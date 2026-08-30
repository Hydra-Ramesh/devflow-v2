import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      status: 'error',
      message: 'Unauthorized: Authentication token required',
    });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = {
      id: decoded.id || decoded.sub || decoded.userId,
      email: decoded.email,
      role: decoded.role || 'USER',
    };

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      status: 'error',
      message: 'Unauthorized: Invalid or expired token',
    });
  }
}
