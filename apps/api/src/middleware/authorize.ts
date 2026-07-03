import type { Request, Response, NextFunction } from 'express';
import type { Role } from '@nama/shared';
import { Errors } from '../utils/errors.js';

// RBAC middleware — checks that the authenticated user has one of the required roles.
// Must be used AFTER authenticate().
//
// Usage: router.get('/admin/users', authenticate, authorize('ADMIN'), handler)
// Usage with multiple roles: authorize('ADMIN', 'TEACHER')
export function authorize(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw Errors.unauthorized();
    }

    const userRoles = req.user.roles;
    const hasRole = allowedRoles.some((role) => userRoles.includes(role));

    if (!hasRole) {
      throw Errors.forbidden(
        `This action requires one of: ${allowedRoles.join(', ')}. Your role(s): ${userRoles.join(', ')}`,
      );
    }

    next();
  };
}
