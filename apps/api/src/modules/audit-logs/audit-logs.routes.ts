import { Router } from 'express';
import { auditLogsController } from './audit-logs.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';

export const auditLogsRouter: Router = Router();

// All audit logs routes are admin-only
auditLogsRouter.use(authenticate);
auditLogsRouter.use(authorize('ADMIN'));

auditLogsRouter.get('/', auditLogsController.getAuditLogs);
