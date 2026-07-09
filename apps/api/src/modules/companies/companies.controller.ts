import type { Request, Response } from 'express';
import { companiesService } from './companies.service.js';
import type { ApiResponse } from '@nama/shared';

export const companiesController = {
  async getDashboard(req: Request, res: Response): Promise<void> {
    const adminId = req.user!.sub;
    const dashboard = await companiesService.getDashboard(adminId);
    const response: ApiResponse = { success: true, data: dashboard };
    res.status(200).json(response);
  },

  async getEmployees(req: Request, res: Response): Promise<void> {
    const adminId = req.user!.sub;
    const employees = await companiesService.getEmployees(adminId);
    const response: ApiResponse = { success: true, data: { employees } };
    res.status(200).json(response);
  },

  async getLicenses(req: Request, res: Response): Promise<void> {
    const adminId = req.user!.sub;
    const licenses = await companiesService.getLicenses(adminId);
    const response: ApiResponse = { success: true, data: { licenses } };
    res.status(200).json(response);
  },

  async inviteEmployee(req: Request, res: Response): Promise<void> {
    const adminId = req.user!.sub;
    const { email } = req.body;
    const employee = await companiesService.inviteEmployee(adminId, email);
    const response: ApiResponse = { success: true, data: employee, message: 'Employee invited successfully' };
    res.status(200).json(response);
  },

  async deleteEmployee(req: Request, res: Response): Promise<void> {
    const adminId = req.user!.sub;
    const employeeId = req.params.employeeId as string;
    await companiesService.deleteEmployee(adminId, employeeId);
    const response: ApiResponse = { success: true, message: 'Employee deleted successfully' };
    res.status(200).json(response);
  },
};
