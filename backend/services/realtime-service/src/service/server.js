import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { pubClient, subClient } from '../config/redis.js';
import { socketAuthMiddleware } from '../middleware/auth.middleware.js';
import { registerSocketHandlers } from './handler.js';

export let io;

export const initSocketServer = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.adapter(createAdapter(pubClient, subClient));
  io.use(socketAuthMiddleware);

  io.on('connection', (socket) => {
    registerSocketHandlers(io, socket);
  });
  return io;
};
