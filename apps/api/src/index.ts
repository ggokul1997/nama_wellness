import 'dotenv/config';
import { createApp } from './app.js';
import { config } from './config/index.js';
import { logger } from './infrastructure/logger/logger.js';
import { connectDatabase, disconnectDatabase } from './infrastructure/database/prisma.client.js';
import { connectRedis, disconnectRedis } from './infrastructure/redis/redis.client.js';
import type { Server } from 'http';

let server: Server;

async function start(): Promise<void> {
  // Connect infrastructure before accepting requests
  await connectDatabase();
  await connectRedis();

  const app = createApp();

  server = app.listen(config.PORT, () => {
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
  logger.error({ reason }, 'Unhandled promise rejection');
  process.exit(1);
});

start().catch((err) => {
  logger.error(err, 'Failed to start server');
  process.exit(1);
});
