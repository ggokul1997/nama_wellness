import type { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

declare global {
  namespace Express {
    interface Request {
      id: string;
    }
  }
}

// Attach a unique request ID to every incoming request.
// Used for correlating logs across a single request lifecycle.
export function requestId(req: Request, _res: Response, next: NextFunction): void {
  req.id = (req.headers['x-request-id'] as string | undefined) ?? uuidv4();
  next();
}
