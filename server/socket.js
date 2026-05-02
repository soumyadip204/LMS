import { Server } from 'socket.io';
import ForumThread from './models/ForumThread.js';

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected to socket:', socket.id);

    // Join a specific course forum room
    socket.on('joinCourseForum', (courseId) => {
      socket.join(courseId);
      console.log(`Socket ${socket.id} joined course forum: ${courseId}`);
    });

    // Handle new reply
    socket.on('newReply', async (data) => {
      try {
        const { threadId, courseId, user, content } = data;
        
        // Optionally save to database here, or let the REST API save it and then emit an event
        // We'll let the REST API save the reply and then emit it to others, 
        // OR we can save it directly here.
        // Doing it directly here is faster for real-time.
        const thread = await ForumThread.findById(threadId);
        if (thread) {
          const reply = {
            user: user._id, // User object sent from frontend
            content,
            createdAt: new Date()
          };
          thread.replies.push(reply);
          await thread.save();

          // Re-populate user details for the emitted message
          const populatedThread = await ForumThread.findById(threadId).populate('replies.user', 'name avatar role');
          const newReply = populatedThread.replies[populatedThread.replies.length - 1];

          // Emit to everyone in the room
          io.to(courseId).emit('receiveReply', {
            threadId,
            reply: newReply
          });
        }
      } catch (error) {
        console.error('Socket newReply error:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};
