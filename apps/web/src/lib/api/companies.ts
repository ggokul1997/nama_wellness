import { apiFetch } from './client';
import type { CompanyDashboardSummary, CompanyEmployee, CompanyLicense } from '@nama/shared';

export const companiesApi = {
  getDashboard: () =>
    apiFetch<{
      company: any;
      stats: CompanyDashboardSummary;
    }>('/companies/dashboard'),

  getEmployees: () =>
    apiFetch<{ employees: CompanyEmployee[] }>('/companies/employees'),

  getLicenses: () =>
    apiFetch<{ licenses: CompanyLicense[] }>('/companies/licenses'),

  purchaseLicense: (data: { courseId: string; seats: number }) =>
    apiFetch<CompanyLicense>('/companies/licenses/purchase', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  inviteEmployee: (email: string) =>
    apiFetch<CompanyEmployee>('/companies/employees/invite', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  deleteEmployee: (employeeId: string) =>
    apiFetch<void>(`/companies/employees/${employeeId}`, {
      method: 'DELETE',
    }),
};
