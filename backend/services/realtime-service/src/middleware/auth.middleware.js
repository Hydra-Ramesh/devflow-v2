import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env.js';

export const socketAuthMiddleware = (socket, next) => {
  const token = socket.handshake.auth?.token|| socket.handshake.query?.token;
  if (!token){
    return next();
  }

  try{
    const decoded = jwt.verify(token, JWT_SECRET);
    socket.user = decoded;
    next();
  }catch (err){
    console.error('Socket authentication error:', err);
    next(new Error('Authentication error'));
  }
};