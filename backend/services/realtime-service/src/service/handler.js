export const registerSocketHandlers = (io, socket) => {
  console.log(`Socket connected: ${socket.id}`);
  socket.on('join_question', (questionId) => {
    const room = `question_${questionId}`;
    socket.join(room);
    
    const roomSize = io.sockets.adapter.rooms.get(room)?.size || 0;
    io.to(room).emit('live_viewers_count', { questionId, count: roomSize });
    console.log(`Socket ${socket.id} joined ${room} (Size: ${roomSize})`);
  });
  socket.on('leave_question', (questionId) => {
    const room = `question_${questionId}`;
    socket.leave(room);

    const roomSize = io.sockets.adapter.rooms.get(room)?.size || 0;
    io.to(room).emit('live_viewers_count', { questionId, count: roomSize });
    console.log(`Socket ${socket.id} left ${room} (Size: ${roomSize})`);
  });
  
  if (socket.user) {
    const userRoom = `user_${socket.user.userId}`;
    socket.join(userRoom);
    console.log(`Socket ${socket.id} joined ${userRoom}`);
  }

  socket.on('disconnecting', () => {
    for (const room of socket.rooms) {
      if (room.startsWith('question_')) {
        const questionId = room.replace('question_', '');
        const roomSize = Math.max((io.sockets.adapter.rooms.get(room)?.size || 0) - 1, 0);
        io.to(room).emit('live_viewers_count', { questionId, count: roomSize });
      }
    }
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
};
