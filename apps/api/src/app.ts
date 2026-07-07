import 'express-async-errors'; // patches express to forward async errors to next()
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { config } from './config/index.js';
import { requestId } from './middleware/requestId.js';
import { errorHandler } from './middleware/errorHandler.js';
import { v1Router } from './routes/index.js';

export function createApp(): express.Express {
  const app = express();

  // Security headers
  app.use(helmet());

  // CORS — allow configured origins
  app.use(
    cors({
      origin: config.CORS_ORIGINS.split(',').map((o) => o.trim()),
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id', 'X-Active-Role'],
    }),
  );

  // Compression
  app.use(compression());

  // Body parsing
  app.use(express.json({ 
    limit: '10mb',
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    }
  }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Request ID — must come before routes
  app.use(requestId);

  // API routes
  app.use('/api/v1', v1Router);

  // 404 handler for unknown routes
  app.use((_req, res) => {
    res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Route not found' },
    });
  });

  // Global error handler — must be last
  app.use(errorHandler);

  return app;
}
