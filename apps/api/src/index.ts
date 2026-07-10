import 'dotenv/config';
import { createApp } from './app.js';
import { config } from './config/index.js';
import { logger } from './infrastructure/logger/logger.js';
import { connectDatabase, disconnectDatabase } from './infrastructure/database/prisma.client.js';
import { connectRedis, disconnectRedis } from './infrastructure/redis/redis.client.js';
import { socketService } from './infrastructure/socket/socket.service.js';
import type { Server } from 'http';
import { createServer } from 'http';

let server: Server;

async function start(): Promise<void> {
  // Connect infrastructure before accepting requests
  await connectDatabase();
  await connectRedis();

  const app = createApp();
  server = createServer(app);

  // Initialize WebSockets before listening
  socketService.initialize(server);

  server.listen(config.PORT, () => {
    logger.info(
      {
        port: config.PORT,
        env: config.NODE_ENV,
        health: `http://localhost:${config.PORT}/api/v1/health`,
      },
      '🚀 Nama Wellness API started',
    );
  });
}

async function shutdown(signal: string): Promise<void> {
  logger.info({ signal }, 'Shutdown signal received');
  server?.close(async () => {
    await disconnectDatabase();
    await disconnectRedis();
    logger.info('Graceful shutdown complete');
    process.exit(0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (reason) => {
  // Log the rejection but do NOT kill the process.
  // A single failed request (e.g. S3 timeout, bad DB query) should never
  // bring down the entire API for all other users/requests.
  logger.error({ reason }, 'Unhandled promise rejection — server continues running');
});

start().catch((err) => {
  logger.error(err, 'Failed to start server');
  process.exit(1);
});
