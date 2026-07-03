import Redis from 'ioredis';
import { config } from '../../config/index.js';
import { logger } from '../logger/logger.js';

// Singleton Redis client
let _redis: Redis | null = null;

export function getRedisClient(): Redis {
  if (_redis) return _redis;

  _redis = new Redis(config.REDIS_URL, {
    lazyConnect: true,
    maxRetriesPerRequest: 3,
    retryStrategy: (times: number) => {
      if (times >= 5) {
        logger.error('Redis: max retries reached');
        return null; // stop retrying
      }
      return Math.min(times * 200, 2000);
    },
  });

  _redis.on('connect', () => logger.info('Redis connected'));
  _redis.on('error', (err: Error) => logger.error({ err }, 'Redis error'));
  _redis.on('close', () => logger.warn('Redis connection closed'));

  return _redis;
}

export async function connectRedis(): Promise<void> {
  await getRedisClient().connect();
}

export async function disconnectRedis(): Promise<void> {
  if (_redis) {
    await _redis.quit();
    _redis = null;
  }
}
