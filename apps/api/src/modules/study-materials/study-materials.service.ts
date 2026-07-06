import { studyMaterialsRepository } from './study-materials.repository.js';
import { coursesRepository } from '../courses/courses.repository.js';
import { s3Utils } from '../../utils/s3.js';
import { Errors } from '../../utils/errors.js';
import type { CreateStudyMaterialInput, ReviewStudyMaterialInput } from '@nama/shared';

export const studyMaterialsService = {
  async getPresignedUploadUrl(courseId: string, teacherId: string, mimeType: string, fileSizeBytes: number) {
    const course = await coursesRepository.findById(courseId);
    if (!course) throw Errors.notFound('Course not found');
    if (course.teacherId !== teacherId) throw Errors.forbidden('Not authorized to upload to this course');

    if (fileSizeBytes > 50 * 1024 * 1024) { // 50MB limit for study materials
      throw Errors.badRequest('File size exceeds 50MB limit');
    }

    const key = `courses/${courseId}/materials/${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const { uploadUrl, fileUrl, key: uploadKey } = await s3Utils.generatePresignedUploadUrl(key, mimeType);

    return { url: uploadUrl, fileUrl, key: uploadKey };
  },

  async createMaterial(courseId: string, teacherId: string, data: CreateStudyMaterialInput) {
    const course = await coursesRepository.findById(courseId);
    if (!course) throw Errors.notFound('Course not found');
    if (course.teacherId !== teacherId) throw Errors.forbidden('Not authorized to modify this course');

    return studyMaterialsRepository.create({
      courseId,
      uploadedBy: teacherId,
      title: data.title,
      fileUrl: data.fileUrl,
      fileName: data.fileName,
      mimeType: data.mimeType,
      fileSizeBytes: data.fileSizeBytes
    });
  },

  async getMaterialsForCourse(courseId: string, userId: string, role: string) {
    const course = await coursesRepository.findById(courseId);
    if (!course) throw Errors.notFound('Course not found');

    // Simple auth check: if teacher, must be the owner. If admin, allowed. (Enrollment check to be added later)
    if (role === 'TEACHER' && course.teacherId !== userId) {
      throw Errors.forbidden('Not authorized to view materials for this course');
    }

    const materials = await studyMaterialsRepository.findByCourse(courseId);
    
    // If student, only return APPROVED materials. For now, since enrollment isn't fully implemented,
    // we'll assume non-teachers/admins only see APPROVED.
    if (role !== 'TEACHER' && role !== 'ADMIN') {
      return materials.filter(m => m.approvalStatus === 'APPROVED');
    }

    return materials;
  },

  async getPendingMaterials() {
    return studyMaterialsRepository.findPending();
  },

  async reviewMaterial(id: string, adminId: string, data: ReviewStudyMaterialInput) {
    const material = await studyMaterialsRepository.findById(id);
    if (!material) throw Errors.notFound('Study material not found');
    if (material.approvalStatus !== 'PENDING') throw Errors.badRequest('Material has already been reviewed');

    return studyMaterialsRepository.updateStatus(id, data.status, adminId);
  },

  async getDownloadUrl(id: string, userId: string, role: string) {
    const material = await studyMaterialsRepository.findById(id);
    if (!material) throw Errors.notFound('Study material not found');

    // Access control: Teachers can download their own, Admins can download any, Students can download APPROVED if enrolled
    if (role === 'TEACHER' && material.course.teacherId !== userId) {
      throw Errors.forbidden('Not authorized');
    }
    
    if (role !== 'TEACHER' && role !== 'ADMIN' && material.approvalStatus !== 'APPROVED') {
      throw Errors.forbidden('Material is not approved for download');
    }

    // Generate a short-lived download URL (1 hour)
    const url = await s3Utils.signDocumentUrl(material.fileUrl);
    return { url };
  }
};
