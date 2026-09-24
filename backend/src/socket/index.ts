import { Server as SocketIOServer, Socket } from 'socket.io';
import { verifyToken } from '../utils/jwt';
import { prisma } from '../prisma/client';

export const setupSocketHandlers = (io: SocketIOServer) => {
  // Socket auth middleware
  io.use(async (socket: Socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) {
        return next(new Error('Authentication required for websocket connection.'));
      }

      const payload = verifyToken(token as string);
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { id: true, name: true, email: true, role: true }
      });

      if (!user) {
        return next(new Error('User not found.'));
      }

      (socket as any).user = user;
      next();
    } catch (err) {
      next(new Error('Invalid token.'));
    }
  });

  io.on('connection', async (socket: Socket) => {
    const user = (socket as any).user;
    if (!user) return;

    console.log(`🔌 User connected to Socket: ${user.name} (${user.id})`);

    // Join personal room for private notifications & messages
    socket.join(`user_${user.id}`);

    // Update status to ONLINE in DB and broadcast
    await prisma.user.update({
      where: { id: user.id },
      data: { onlineStatus: 'ONLINE' }
    });
    io.emit('user_status_changed', { userId: user.id, status: 'ONLINE' });

    // Join specific conversation room
    socket.on('join_conversation', (conversationId: string) => {
      socket.join(`conversation_${conversationId}`);
      console.log(`User ${user.name} joined conversation room: ${conversationId}`);
    });

    // Leave conversation room
    socket.on('leave_conversation', (conversationId: string) => {
      socket.leave(`conversation_${conversationId}`);
    });

    // Send real-time chat message
    socket.on('send_message', async (data: { conversationId: string; content: string; files?: any[] }) => {
      try {
        const { conversationId, content, files } = data;

        const newMessage = await prisma.message.create({
          data: {
            conversationId,
            senderId: user.id,
            content: content || '',
            files: files && Array.isArray(files) ? {
              create: files.map(f => ({
                filename: f.filename,
                originalName: f.originalName || f.filename,
                fileUrl: f.fileUrl,
                fileType: f.fileType,
                fileSize: f.fileSize
              }))
            } : undefined
          },
          include: {
            sender: { select: { id: true, name: true, avatarUrl: true, role: true } },
            files: true
          }
        });

        await prisma.conversation.update({
          where: { id: conversationId },
          data: { updatedAt: new Date() }
        });

        // Broadcast to everyone in conversation room
        io.to(`conversation_${conversationId}`).emit('new_message', newMessage);
      } catch (err) {
        console.error('Socket send_message error:', err);
      }
    });

    // Typing indicators
    socket.on('typing_start', ({ conversationId }: { conversationId: string }) => {
      socket.to(`conversation_${conversationId}`).emit('user_typing', {
        userId: user.id,
        userName: user.name,
        conversationId
      });
    });

    socket.on('typing_stop', ({ conversationId }: { conversationId: string }) => {
      socket.to(`conversation_${conversationId}`).emit('user_stop_typing', {
        userId: user.id,
        conversationId
      });
    });

    // Disconnect
    socket.on('disconnect', async () => {
      console.log(`🔌 User disconnected: ${user.name}`);
      await prisma.user.update({
        where: { id: user.id },
        data: { onlineStatus: 'OFFLINE' }
      });
      io.emit('user_status_changed', { userId: user.id, status: 'OFFLINE' });
    });
  });
};
