import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';

// Validates req.body against a Zod schema.
// Throws ZodError on failure — caught by errorHandler.
export function validate(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    schema.parse(req.body);
    next();
  };
}

// Validates query params
export function validateQuery(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    req.query = schema.parse(req.query) as typeof req.query;
    next();
  };
}
