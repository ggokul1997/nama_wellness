import { prisma } from '../../infrastructure/database/prisma.client.js';

export const certificatesRepository = {
  async issueCertificate(data: { courseId: string; studentId: string; enrollmentId: string }) {
    return prisma.certificate.create({
      data,
      include: {
        course: { select: { title: true } },
      },
    });
  },

  async findCertificateByEnrollment(enrollmentId: string) {
    return prisma.certificate.findUnique({
      where: { enrollmentId },
      include: {
        course: { select: { title: true } },
      },
    });
  },

  async getStudentCertificates(studentId: string) {
    return prisma.certificate.findMany({
      where: { studentId },
      orderBy: { issuedAt: 'desc' },
      include: {
        course: { select: { title: true } },
      },
    });
  },
};
