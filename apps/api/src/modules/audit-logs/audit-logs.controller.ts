import type { Request, Response } from 'express';
import { auditLogsService } from './audit-logs.service.js';

export const auditLogsController = {
  async getAuditLogs(req: Request, res: Response): Promise<void> {
    const filters = {
      type: req.query.type as string,
      dateFrom: req.query.dateFrom as string,
      dateTo: req.query.dateTo as string,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 30
    };

    const { events, total } = await auditLogsService.getAuditLogs(filters);

    res.status(200).json({
      success: true,
      data: {
        events,
        total,
        page: filters.page,
        limit: filters.limit
      }
    });
  }
};
