import { Server } from 'socket.io';

let io: Server | null = null;

export const setIO = (socketIoInstance: Server) => {
  io = socketIoInstance;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};
