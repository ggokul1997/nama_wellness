import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { logger } from '../logger/logger.js';
import { config } from '../../config/index.js';
import jwt from 'jsonwebtoken';

class SocketService {
  private io: Server | null = null;

  public initialize(httpServer: HttpServer): void {
    this.io = new Server(httpServer, {
      cors: {
        origin: config.CORS_ORIGINS || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true
      },
      pingTimeout: 60000,
    });

    // Authentication middleware
    this.io.use((socket, next) => {
      try {
        const cookieStr = socket.request.headers.cookie || '';
        const tokenMatch = cookieStr.match(/nama_access_token=([^;]+)/);
        const token = tokenMatch ? tokenMatch[1] : null;
        
        if (!token) {
          return next(new Error('Authentication error: Token missing'));
        }

        const decoded = jwt.verify(token, config.JWT_ACCESS_SECRET) as { sub: string };
        if (!decoded || !decoded.sub) {
          return next(new Error('Authentication error: Invalid token'));
        }

        // Attach userId to socket
        socket.data.userId = decoded.sub;
        next();
      } catch (error) {
        return next(new Error('Authentication error: Invalid token'));
      }
    });

    this.io.on('connection', (socket: Socket) => {
      logger.info({ socketId: socket.id, userId: socket.data.userId }, 'Socket connected');

      // Automatically join a personal room for user-directed events
      socket.join(socket.data.userId);

      // Join room for specific chat session
      socket.on('join_room', (sessionId: string) => {
        socket.join(sessionId);
        logger.debug({ socketId: socket.id, sessionId }, 'Socket joined room');
      });

      // Leave room
      socket.on('leave_room', (sessionId: string) => {
        socket.leave(sessionId);
        logger.debug({ socketId: socket.id, sessionId }, 'Socket left room');
      });

      socket.on('disconnect', (reason) => {
        logger.info({ socketId: socket.id, reason }, 'Socket disconnected');
      });
    });

    logger.info('Socket.io server initialized');
  }

  public getIo(): Server {
    if (!this.io) {
      throw new Error('Socket.io server has not been initialized. Call initialize(httpServer) first.');
    }
    return this.io;
  }
}

export const socketService = new SocketService();
