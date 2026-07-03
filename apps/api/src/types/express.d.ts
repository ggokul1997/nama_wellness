import type { JWTPayload } from '@nama/shared';

// Augment the Express Request interface globally so req.user is typed everywhere
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
      id: string;
    }
  }
}

export {};
