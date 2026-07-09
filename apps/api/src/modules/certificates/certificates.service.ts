import { certificatesRepository } from './certificates.repository.js';
import { enrollmentsRepository } from '../enrollments/enrollments.repository.js';
import { Errors } from '../../utils/errors.js';
import { notificationsService } from '../notifications/notifications.service.js';

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
      message: `Congratulations! You have earned your certificate for ${certificate.course.title}.`,
      type: 'SUCCESS'
    });

    return certificate;
  },

  async getMyCertificates(studentId: string) {
    return certificatesRepository.getStudentCertificates(studentId);
  }
};
