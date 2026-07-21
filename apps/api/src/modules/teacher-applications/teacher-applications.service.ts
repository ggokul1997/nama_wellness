import { teacherApplicationsRepository } from './teacher-applications.repository.js';
import { prisma } from '../../infrastructure/database/prisma.client.js';
import { s3Utils } from '../../utils/s3.js';
import { Errors } from '../../utils/errors.js';
import { v4 as uuidv4 } from 'uuid';
import type { DocumentType } from '@prisma/client';

export const teacherApplicationsService = {
  async getMyApplication(userId: string) {
    const app = await teacherApplicationsRepository.findByUserId(userId);
    if (app?.documents) {
      for (const doc of app.documents) {
        doc.fileUrl = await s3Utils.signDocumentUrl(doc.fileUrl);
      }
    }
    return app;
  },

  async startApplication(userId: string) {
    const existing = await teacherApplicationsRepository.findByUserId(userId);
    if (existing) {
      return existing; // Return draft or whatever is in progress
    }
    return teacherApplicationsRepository.create({
      userId,
      status: 'DRAFT',
    });
  },

  async getPresignedUploadUrl(userId: string, applicationId: string, documentType: DocumentType, mimeType: string, fileSizeBytes: number) {
    const app = await teacherApplicationsRepository.findById(applicationId);
    if (!app || app.userId !== userId) {
      throw Errors.notFound('Application not found');
    }

    const ext = mimeType.split('/')[1] || 'bin';
    const key = `teacher-applications/${userId}/${documentType}-${uuidv4()}.${ext}`;
    
    const { uploadUrl, fileUrl } = await s3Utils.generatePresignedUploadUrl(key, mimeType);

    // Record the intent to upload the document
    const doc = await teacherApplicationsRepository.addDocument({
      applicationId,
      documentType,
      fileUrl,
      fileName: `${documentType}.${ext}`,
      mimeType,
      fileSizeBytes,
    });

    return { uploadUrl, fileUrl, documentId: doc.id };
  },

  async submitApplication(userId: string, applicationId: string, firstName: string, lastName: string, teachingSubject: string) {
    const app = await teacherApplicationsRepository.findById(applicationId);
    if (!app || app.userId !== userId) {
      throw Errors.notFound('Application not found');
    }

    if (app.status !== 'DRAFT') {
      throw Errors.badRequest('Application has already been submitted');
    }

    // In a real app, validate that necessary documents are uploaded
    if (app.documents.length === 0) {
      throw Errors.badRequest('Must upload at least one verification document');
    }
    if (!firstName || !lastName || !teachingSubject) {
      throw Errors.badRequest('First name, last name, and teaching subject are required');
    }

    // Update user profile
    await teacherApplicationsRepository.updateUserProfile(userId, firstName, lastName);

    return teacherApplicationsRepository.submit(applicationId, teachingSubject);
  },

  // Admin functions
  async listPendingApplications() {
    const apps = await teacherApplicationsRepository.findAllPending();
    for (const app of apps) {
      if (app.documents) {
        for (const doc of app.documents) {
          doc.fileUrl = await s3Utils.signDocumentUrl(doc.fileUrl);
        }
      }
    }
    return apps;
  },

  async reviewApplication(adminId: string, applicationId: string, approve: boolean, rejectionReason?: string) {
    const app = await teacherApplicationsRepository.findById(applicationId);
    if (!app) throw Errors.notFound('Application not found');

    const status = approve ? 'APPROVED' : 'REJECTED';
    
    const updatedApp = await teacherApplicationsRepository.updateStatus(applicationId, status, adminId, rejectionReason);

    if (approve) {
      await prisma.$transaction([
        prisma.userRole.upsert({
          where: { userId_role: { userId: app.userId, role: 'TEACHER' } },
          create: { userId: app.userId, role: 'TEACHER', productVariant: 'EDPRO' },
          update: {},
        }),
        prisma.teacherProfile.upsert({
          where: { userId: app.userId },
          create: { userId: app.userId, specialties: [] },
          update: {},
        }),
      ]);
    }

    return updatedApp;
  }
};
