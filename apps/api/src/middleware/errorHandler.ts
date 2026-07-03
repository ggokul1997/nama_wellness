import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors.js';
import { logger } from '../infrastructure/logger/logger.js';
import type { ApiResponse } from '@nama/shared';
import { ZodError } from 'zod';

// Global error handler — must have 4 params for Express to recognise it.
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // Zod validation error
  if (err instanceof ZodError) {
    const details: Record<string, string[]> = {};
    for (const issue of err.issues) {
      const key = issue.path.join('.') || 'root';
      details[key] ??= [];
      details[key]!.push(issue.message);
    }

    const response: ApiResponse = {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details,
      },
    };
    res.status(400).json(response);
    return;
  }

  // Known operational error
  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error({ err, requestId: req.id }, err.message);
    } else {
      logger.warn({ statusCode: err.statusCode, code: err.code, requestId: req.id }, err.message);
    }

    const response: ApiResponse = {
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.details ? { details: err.details } : {}),
      },
    };
    res.status(err.statusCode).json(response);
    return;
  }

  // Unexpected / unhandled error
  logger.error({ err, requestId: req.id }, 'Unhandled error');
  const response: ApiResponse = {
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    },
  };
  res.status(500).json(response);
}
