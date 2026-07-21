import { certificatesRepository } from './certificates.repository.js';
import { enrollmentsRepository } from '../enrollments/enrollments.repository.js';
import { Errors } from '../../utils/errors.js';
import { notificationsService } from '../notifications/notifications.service.js';
import { prisma } from '../../infrastructure/database/prisma.client.js';
import { logger } from '../../infrastructure/logger/logger.js';

export const certificatesService = {
  async issueCertificate(studentId: string, courseId: string) {
    const enrollment = await enrollmentsRepository.getEnrollment(studentId, courseId);
    
    if (!enrollment) {
      throw Errors.notFound('Enrollment not found.');
    }

    if (enrollment.status !== 'COMPLETED') {
      throw Errors.forbidden('You must complete the course to earn a certificate.');
    }

    const existingCert = await certificatesRepository.findCertificateByEnrollment(enrollment.id);
    if (existingCert) {
      return existingCert; // Already issued
    }

    const certificate = await certificatesRepository.issueCertificate({
      courseId,
      studentId,
      enrollmentId: enrollment.id,
    });

    // Fire notification
    await notificationsService.createNotification({
      userId: studentId,
      title: 'Certificate Earned!',
      message: `Congratulations! You have earned your certificate for "${certificate.course.title}".`,
      link: '/student/dashboard', // Add a link so it's clickable in the bell
      type: 'SUCCESS'
    });

    // Notify company admins if the student belongs to any companies
    try {
      const employeeRecords = await prisma.companyEmployee.findMany({
        where: { userId: studentId },
        include: { company: true }
      });

      for (const record of employeeRecords) {
        await notificationsService.createNotification({
          userId: record.company.adminId,
          title: 'Employee Completed Course 🎓',
          message: `An employee has completed "${certificate.course.title}".`,
          link: '/company-admin/employees',
          type: 'SUCCESS'
        });
      }
    } catch (err) {
      logger.error({ err, studentId }, 'Failed to notify company admins of certificate');
    }

    return certificate;
  },

  async getMyCertificates(studentId: string) {
    return certificatesRepository.getStudentCertificates(studentId);
  }
};
