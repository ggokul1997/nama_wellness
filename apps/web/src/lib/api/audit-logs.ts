import { apiFetch } from './client';
import type { AuditLogEntry } from '@nama/shared';

export const auditLogsApi = {
  getLogs: (params?: { type?: string; dateFrom?: string; dateTo?: string; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.type && params.type !== 'ALL') searchParams.append('type', params.type);
    if (params?.dateFrom) searchParams.append('dateFrom', params.dateFrom);
    if (params?.dateTo) searchParams.append('dateTo', params.dateTo);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    
    const queryString = searchParams.toString();
    const endpoint = `/admin/audit-logs${queryString ? `?${queryString}` : ''}`;
    
    return apiFetch<{ events: AuditLogEntry[], total: number, page: number, limit: number }>(endpoint);
  }
};
