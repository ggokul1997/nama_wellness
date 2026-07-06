import type { Prisma, TeacherAppStatus, DocumentType } from '@prisma/client';
import { prisma } from '../../infrastructure/database/prisma.client.js';

export const teacherApplicationsRepository = {
  async findByUserId(userId: string) {
    return prisma.teacherApplication.findFirst({
      where: { userId },
      include: { documents: true },
      orderBy: { createdAt: 'desc' },
    });
  },

  async findById(id: string) {
    return prisma.teacherApplication.findUnique({
      where: { id },
      include: {
        user: { select: { email: true, profile: true } },
        documents: true,
      },
    });
  },

  async findAllPending() {
    return prisma.teacherApplication.findMany({
      where: { status: 'PENDING' },
      include: {
        user: { select: { email: true, profile: true } },
        documents: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  },

  async create(data: Prisma.TeacherApplicationUncheckedCreateInput) {
    return prisma.teacherApplication.create({
      data,
    });
  },

  async updateStatus(id: string, status: TeacherAppStatus, reviewerId?: string, rejectionReason?: string) {
    return prisma.teacherApplication.update({
      where: { id },
      data: {
        status,
        reviewedBy: reviewerId,
        reviewedAt: reviewerId ? new Date() : undefined,
        rejectionReason,
      },
    });
  },

  async submit(id: string, teachingSubject: string) {
    return prisma.teacherApplication.update({
      where: { id },
      data: {
        status: 'PENDING',
        teachingSubject,
        submittedAt: new Date(),
      },
    });
  },

  async updateUserProfile(userId: string, firstName: string, lastName: string) {
    return prisma.profile.update({
      where: { userId },
      data: { firstName, lastName },
    });
  },

  async deleteDocumentsByType(applicationId: string, documentType: DocumentType) {
    return prisma.teacherDocument.deleteMany({
      where: { applicationId, documentType },
    });
  },

  async addDocument(data: Prisma.TeacherDocumentUncheckedCreateInput) {
    // Remove any existing document of the same type first to prevent duplicates
    await prisma.teacherDocument.deleteMany({
      where: { 
        applicationId: data.applicationId, 
        documentType: data.documentType,
      },
    });
    return prisma.teacherDocument.create({
      data,
    });
  }
};
