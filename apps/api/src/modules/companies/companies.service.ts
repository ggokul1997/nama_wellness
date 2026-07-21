import { companiesRepository } from './companies.repository.js';
import { Errors } from '../../utils/errors.js';
import { authRepository } from '../auth/auth.repository.js';
import { generateOTP } from '../../utils/crypto.js';
import { emailService } from '../../infrastructure/email/email.service.js';
import { logger } from '../../infrastructure/logger/logger.js';
import { notificationsService } from '../notifications/notifications.service.js';

export const companiesService = {
  async getCompanyByAdmin(adminId: string) {
    const company = await companiesRepository.getCompanyByAdminId(adminId);
    if (!company) {
      throw Errors.notFound('Company not found for this admin');
    }
    return company;
  },

  async getDashboard(adminId: string) {
    const company = await this.getCompanyByAdmin(adminId);
    const dashboard = await companiesRepository.getCompanyDashboard(company.id);
    if (!dashboard) {
      throw Errors.notFound('Company not found');
    }
    return dashboard;
  },

  async getEmployees(adminId: string) {
    const company = await this.getCompanyByAdmin(adminId);
    return companiesRepository.getEmployees(company.id);
  },

  async getLicenses(adminId: string) {
    const company = await this.getCompanyByAdmin(adminId);
    return companiesRepository.getLicenses(company.id);
  },

  async inviteEmployee(adminId: string, email: string) {
    const company = await this.getCompanyByAdmin(adminId);

    // 1. Check if user exists
    let user = await authRepository.findUserByEmail(email);

    if (!user) {
      // Create skeleton user for the employee
      user = await authRepository.createUser({
        email,
        passwordHash: 'invitation-pending',
        role: 'EMPLOYEE',
        firstName: 'Invited',
        lastName: 'Employee',
      });
      
      // Generate setup OTP
      const otp = generateOTP();
      const expiresAt = new Date(Date.now() + 15 * 60_000); // 15 mins
      await authRepository.upsertOTP({
        identifier: email,
        purpose: 'PASSWORD_RESET', // Treat it as a password reset to set initial password
        otp,
        expiresAt,
      });

      logger.info({ email, otp }, `🔑 [DEV] Employee Invitation OTP code for ${email} is: ${otp}`);

      try {
        await emailService.sendEmployeeInviteOTP(email, otp, company.name);
      } catch (err) {
        logger.error({ err, email }, '📧 Failed to send invitation email');
      }
    }

    // 2. Check if already in company
    const existingEmployee = await companiesRepository.findEmployee(company.id, user.id);
    if (existingEmployee) {
      throw Errors.conflict('Employee is already part of the company');
    }

    // 3. Add to company
    const result = await companiesRepository.addEmployee(company.id, user.id);

    notificationsService.createNotification({
      userId: user.id,
      title: 'Welcome to the Company!',
      message: `You have been added to ${company.name}'s corporate portal.`,
      link: '/employee/dashboard',
      type: 'INFO'
    }).catch(err => logger.error({ err }, 'Failed to notify employee'));

    notificationsService.createNotification({
      userId: adminId,
      title: 'Employee Added',
      message: `${user.email} has been successfully added to your company.`,
      link: '/company-admin/employees',
      type: 'SUCCESS'
    }).catch(err => logger.error({ err }, 'Failed to notify admin'));

    return result;
  },

  async deleteEmployee(adminId: string, employeeUserId: string) {
    const company = await this.getCompanyByAdmin(adminId);
    
    const existingEmployee = await companiesRepository.findEmployee(company.id, employeeUserId);
    if (!existingEmployee) {
      throw Errors.notFound('Employee not found in your company');
    }

    await companiesRepository.deleteEmployee(company.id, employeeUserId);

    notificationsService.createNotification({
      userId: employeeUserId,
      title: 'Removed from Company',
      message: `You have been removed from ${company.name}'s corporate portal.`,
      link: '/employee/dashboard',
      type: 'WARNING'
    }).catch(err => logger.error({ err }, 'Failed to notify employee'));

    notificationsService.createNotification({
      userId: adminId,
      title: 'Employee Removed',
      message: `An employee has been removed from your company.`,
      link: '/company-admin/employees',
      type: 'INFO'
    }).catch(err => logger.error({ err }, 'Failed to notify admin'));
  },
};
