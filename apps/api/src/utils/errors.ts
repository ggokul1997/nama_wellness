// Application error class used throughout the API.
// Controllers catch these and errorHandler maps them to HTTP responses.

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: Record<string, string[]>;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode = 500,
    code = 'INTERNAL_ERROR',
    details?: Record<string, string[]>,
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;

    // Maintain proper stack trace in V8
    Error.captureStackTrace(this, this.constructor);
  }
}

// Pre-defined error factories for common cases
export const Errors = {
  badRequest: (message: string, details?: Record<string, string[]>) =>
    new AppError(message, 400, 'BAD_REQUEST', details),

  unauthorized: (message = 'Authentication required') =>
    new AppError(message, 401, 'UNAUTHORIZED'),

  forbidden: (message = 'You do not have permission to perform this action') =>
    new AppError(message, 403, 'FORBIDDEN'),

  notFound: (resource: string) =>
    new AppError(`${resource} not found`, 404, 'NOT_FOUND'),

  conflict: (message: string) =>
    new AppError(message, 409, 'CONFLICT'),

  tooManyRequests: (message = 'Too many requests, please try again later') =>
    new AppError(message, 429, 'TOO_MANY_REQUESTS'),

  internal: (message = 'An unexpected error occurred') =>
    new AppError(message, 500, 'INTERNAL_ERROR'),
} as const;
