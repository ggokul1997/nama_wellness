import { prisma } from '../../infrastructure/database/prisma.client.js';

export const studyMaterialsRepository = {
  async create(data: {
    courseId: string;
    title: string;
    fileUrl: string;
    fileName: string;
    mimeType: string;
    fileSizeBytes: number;
    uploadedBy: string;
  }) {
    return prisma.studyMaterial.create({
      data,
      include: {
        uploader: { include: { profile: true } }
      }
    });
  },

  async findByCourse(courseId: string) {
    return prisma.studyMaterial.findMany({
      where: { courseId },
      orderBy: { createdAt: 'desc' },
      include: {
        uploader: { include: { profile: true } }
      }
    });
  },

  async findPending() {
    return prisma.studyMaterial.findMany({
      where: { approvalStatus: 'PENDING' },
      orderBy: { createdAt: 'desc' },
      include: {
        course: true,
        uploader: { include: { profile: true } }
      }
    });
  },

  async findById(id: string) {
    return prisma.studyMaterial.findUnique({
      where: { id },
      include: {
        course: true
      }
    });
  },

  async updateStatus(id: string, status: 'APPROVED' | 'REJECTED', approvedBy: string) {
    return prisma.studyMaterial.update({
      where: { id },
      data: {
        approvalStatus: status,
        approvedBy,
        approvedAt: new Date()
      },
      include: {
        course: true
      }
    });
  }
};
