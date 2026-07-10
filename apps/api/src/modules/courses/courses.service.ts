import { coursesRepository } from './courses.repository.js';
import { modulesRepository } from './modules.repository.js';
import { lessonsRepository } from './lessons.repository.js';
import { pricingRepository } from './pricing.repository.js';
import { Errors } from '../../utils/errors.js';
import { s3Utils } from '../../utils/s3.js';
import { v4 as uuidv4 } from 'uuid';
import type { CreateCourseInput, UpdateCourseInput, CreateModuleInput, UpdateModuleInput, CreateLessonInput, UpdateLessonInput, ProposePricingInput, ReviewCourseInput, UpdateCorporateSettingsInput } from '@nama/shared';
import { prisma } from '../../infrastructure/database/prisma.client.js';

export const coursesService = {
  async getMyCourses(userId: string) {
    const courses = await coursesRepository.findAllByTeacher(userId);
    // Sign cover images if they exist
    for (const course of courses) {
      if (course.coverImageUrl) {
        course.coverImageUrl = await s3Utils.signDocumentUrl(course.coverImageUrl);
      }
    }
    return courses;
  },

  async getPublicCourses() {
    const courses = await coursesRepository.findAllPublished();
    for (const course of courses) {
      if (course.coverImageUrl) {
        course.coverImageUrl = await s3Utils.signDocumentUrl(course.coverImageUrl);
      }
    }
    return courses;
  },

  async getCorporateCourses() {
    const courses = await coursesRepository.findAllCorporateCourses();
    for (const course of courses) {
      if (course.coverImageUrl) {
        course.coverImageUrl = await s3Utils.signDocumentUrl(course.coverImageUrl);
      }
    }
    return courses;
  },

  async getPublicCourseBySlug(slug: string) {
    const course = await coursesRepository.findPublishedBySlug(slug);
    if (!course) throw Errors.notFound('Course not found');

    if (course.coverImageUrl) {
      course.coverImageUrl = await s3Utils.signDocumentUrl(course.coverImageUrl);
    }

    // Strip sensitive information from lessons (like contentUrl) for public viewing
    if (course.modules) {
      type PublicLesson = Omit<(typeof course.modules)[number]['lessons'][number], 'contentUrl'>;
      type PublicModule = Omit<(typeof course.modules)[number], 'lessons'> & { lessons: PublicLesson[] };
      const publicModules: PublicModule[] = course.modules.map(mod => ({
        ...mod,
        lessons: mod.lessons.map(({ contentUrl: _omitted, ...publicLessonData }) => publicLessonData),
      }));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      course.modules = publicModules as any;
    }

    return course;
  },

  async getPublicCourseById(id: string) {
    const course = await coursesRepository.findPublishedById(id);
    if (!course) throw Errors.notFound('Course not found');

    if (course.coverImageUrl) {
      course.coverImageUrl = await s3Utils.signDocumentUrl(course.coverImageUrl);
    }

    return course;
  },

  async getCourseById(id: string, userId: string) {
    const course = await coursesRepository.findById(id);
    if (!course) throw Errors.notFound('Course not found');
    if (course.teacherId !== userId) throw Errors.forbidden('Access denied');
    
    if (course.coverImageUrl) {
      course.coverImageUrl = await s3Utils.signDocumentUrl(course.coverImageUrl);
    }
    return course;
  },

  async createCourse(teacherId: string, data: CreateCourseInput) {
    // Generate a unique slug
    const baseSlug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const slug = `${baseSlug}-${uuidv4().substring(0, 8)}`;

    return coursesRepository.create({
      ...data,
      slug,
      teacherId,
      status: 'DRAFT',
    });
  },

  async updateCourse(id: string, teacherId: string, data: UpdateCourseInput) {
    const existing = await coursesRepository.findById(id);
    if (!existing) throw Errors.notFound('Course not found');
    if (existing.teacherId !== teacherId) throw Errors.forbidden('Access denied');

    let slug = existing.slug;
    if (data.title && data.title !== existing.title) {
      const baseSlug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      slug = `${baseSlug}-${uuidv4().substring(0, 8)}`;
    }

    return coursesRepository.update(id, { ...data, slug });
  },

  async updateCorporateSettings(id: string, _adminId: string, data: UpdateCorporateSettingsInput) {
    // Only accessible via ADMIN route, but double check role if needed.
    // Assuming the controller ensures user is ADMIN.
    const course = await coursesRepository.findById(id);
    if (!course) throw Errors.notFound('Course not found');

    return coursesRepository.update(id, data);
  },

  async getPresignedCoverUrl(courseId: string, teacherId: string, mimeType: string, fileSizeBytes: number) {
    const course = await coursesRepository.findById(courseId);
    if (!course) throw Errors.notFound('Course not found');
    if (course.teacherId !== teacherId) throw Errors.forbidden('Access denied');

    if (fileSizeBytes > 1024 * 1024) {
      throw Errors.badRequest('File size must be under 1MB');
    }

    const ext = mimeType.split('/')[1] || 'jpeg';
    const key = `courses/${courseId}/cover-${uuidv4()}.${ext}`;

    const { uploadUrl, fileUrl } = await s3Utils.generatePresignedUploadUrl(key, mimeType);

    await coursesRepository.updateCoverImage(courseId, fileUrl);

    return { uploadUrl, fileUrl };
  },

  async deleteCourse(id: string, teacherId: string) {
    const course = await coursesRepository.findById(id);
    if (!course) throw Errors.notFound('Course not found');
    if (course.teacherId !== teacherId) throw Errors.forbidden('Access denied');

    return coursesRepository.delete(id);
  },

  // Modules
  async getModulesByCourseId(courseId: string, teacherId: string) {
    const course = await coursesRepository.findById(courseId);
    if (!course) throw Errors.notFound('Course not found');
    if (course.teacherId !== teacherId) throw Errors.forbidden('Access denied');
    
    return modulesRepository.findAllByCourse(courseId);
  },

  async createModule(courseId: string, teacherId: string, data: CreateModuleInput) {
    const course = await coursesRepository.findById(courseId);
    if (!course) throw Errors.notFound('Course not found');
    if (course.teacherId !== teacherId) throw Errors.forbidden('Access denied');

    return modulesRepository.create({
      ...data,
      courseId,
    });
  },

  async updateModule(courseId: string, moduleId: string, teacherId: string, data: UpdateModuleInput) {
    const module = await modulesRepository.findById(moduleId);
    if (!module || module.courseId !== courseId) throw Errors.notFound('Module not found');
    
    const course = await coursesRepository.findById(courseId);
    if (!course || course.teacherId !== teacherId) throw Errors.forbidden('Access denied');

    return modulesRepository.update(moduleId, data);
  },

  async deleteModule(courseId: string, moduleId: string, teacherId: string) {
    const module = await modulesRepository.findById(moduleId);
    if (!module || module.courseId !== courseId) throw Errors.notFound('Module not found');
    
    const course = await coursesRepository.findById(courseId);
    if (!course || course.teacherId !== teacherId) throw Errors.forbidden('Access denied');

    return modulesRepository.delete(moduleId);
  },

  // Lessons
  async createLesson(courseId: string, moduleId: string, teacherId: string, data: CreateLessonInput) {
    const module = await modulesRepository.findById(moduleId);
    if (!module || module.courseId !== courseId) throw Errors.notFound('Module not found');
    
    const course = await coursesRepository.findById(courseId);
    if (!course || course.teacherId !== teacherId) throw Errors.forbidden('Access denied');

    return lessonsRepository.create({
      ...data,
      moduleId,
    });
  },

  async updateLesson(courseId: string, moduleId: string, lessonId: string, teacherId: string, data: UpdateLessonInput) {
    const lesson = await lessonsRepository.findById(lessonId);
    if (!lesson || lesson.moduleId !== moduleId) throw Errors.notFound('Lesson not found');
    
    const module = await modulesRepository.findById(moduleId);
    if (!module || module.courseId !== courseId) throw Errors.notFound('Module not found');
    
    const course = await coursesRepository.findById(courseId);
    if (!course || course.teacherId !== teacherId) throw Errors.forbidden('Access denied');

    return lessonsRepository.update(lessonId, data);
  },

  async deleteLesson(courseId: string, moduleId: string, lessonId: string, teacherId: string) {
    const lesson = await lessonsRepository.findById(lessonId);
    if (!lesson || lesson.moduleId !== moduleId) throw Errors.notFound('Lesson not found');
    
    const module = await modulesRepository.findById(moduleId);
    if (!module || module.courseId !== courseId) throw Errors.notFound('Module not found');
    
    const course = await coursesRepository.findById(courseId);
    if (!course || course.teacherId !== teacherId) throw Errors.forbidden('Access denied');

    return lessonsRepository.delete(lessonId);
  },

  async getPresignedLessonUrl(courseId: string, moduleId: string, lessonId: string, teacherId: string, mimeType: string, fileSizeBytes: number) {
    const lesson = await lessonsRepository.findById(lessonId);
    if (!lesson || lesson.moduleId !== moduleId) throw Errors.notFound('Lesson not found');
    
    const module = await modulesRepository.findById(moduleId);
    if (!module || module.courseId !== courseId) throw Errors.notFound('Module not found');
    
    const course = await coursesRepository.findById(courseId);
    if (!course || course.teacherId !== teacherId) throw Errors.forbidden('Access denied');

    // Add reasonable file size limits for videos and documents
    if (fileSizeBytes > 1024 * 1024 * 500) { // 500MB limit
      throw Errors.badRequest('File size must be under 500MB');
    }

    const ext = mimeType.split('/')[1] || 'bin';
    const key = `courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/${uuidv4()}.${ext}`;

    const { uploadUrl, fileUrl } = await s3Utils.generatePresignedUploadUrl(key, mimeType);

    // Don't update the lesson's contentUrl yet; wait for the client to confirm upload success
    // The client will call updateLesson with the new contentUrl.

    return { uploadUrl, fileUrl, key };
  },

  async streamLessonVideo(lessonId: string, userId: string, req: any, res: any) {
    const lesson = await lessonsRepository.findById(lessonId);
    if (!lesson) throw Errors.notFound('Lesson not found');
    if (!lesson.contentUrl) throw Errors.notFound('Video content not uploaded yet');

    const module = await modulesRepository.findById(lesson.moduleId);
    if (!module) throw Errors.notFound('Module not found');

    const course = await coursesRepository.findById(module.courseId);
    if (!course) throw Errors.notFound('Course not found');

    // Authorization: Must be the teacher OR an enrolled active/completed student
    if (course.teacherId !== userId) {
      const enrollment = await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId, courseId: course.id } }
      });
      if (!enrollment || (enrollment.status !== 'ACTIVE' && enrollment.status !== 'COMPLETED')) {
        throw Errors.forbidden('You do not have active access to this course material');
      }
    }

    // Proxy the stream with Range support
    const rangeHeader = req.headers.range;
    await s3Utils.streamObject(lesson.contentUrl, rangeHeader, res);
  },

  // Pricing & Review Workflow
  async proposePricing(courseId: string, teacherId: string, data: ProposePricingInput) {
    const course = await coursesRepository.findById(courseId);
    if (!course) throw Errors.notFound('Course not found');
    if (course.teacherId !== teacherId) throw Errors.forbidden('Access denied');
    if (course.status !== 'DRAFT' && course.status !== 'CHANGES_REQUESTED') {
      throw Errors.badRequest('Can only propose pricing for drafts or when changes are requested');
    }

    return pricingRepository.create({
      courseId,
      amount: data.amount,
      currency: data.currency,
      proposedBy: teacherId,
      approvalStatus: 'PENDING',
    });
  },

  async deletePricing(courseId: string, teacherId: string) {
    const course = await coursesRepository.findById(courseId);
    if (!course) throw Errors.notFound('Course not found');
    if (course.teacherId !== teacherId) throw Errors.forbidden('Access denied');
    if (course.status !== 'DRAFT' && course.status !== 'CHANGES_REQUESTED') {
      throw Errors.badRequest('Cannot change pricing while course is under review or published');
    }

    const currentPrice = await pricingRepository.findCurrentByCourse(courseId);
    if (currentPrice) {
      await pricingRepository.delete(currentPrice.id);
    }
  },

  async submitForReview(courseId: string, teacherId: string) {
    const course = await coursesRepository.findById(courseId);
    if (!course) throw Errors.notFound('Course not found');
    if (course.teacherId !== teacherId) throw Errors.forbidden('Access denied');
    
    // Must have pricing proposed
    const currentPrice = await pricingRepository.findCurrentByCourse(courseId);
    if (!currentPrice) {
      throw Errors.badRequest('Course must have a proposed price before submission');
    }

    return coursesRepository.update(courseId, { status: 'PENDING_REVIEW' });
  },

  async adminGetPendingCourses() {
    return coursesRepository.findAllSubmitted();
  },

  async adminGetCourse(courseId: string) {
    const course = await coursesRepository.findById(courseId);
    if (!course) throw Errors.notFound('Course not found');
    
    const modules = await modulesRepository.findAllByCourse(courseId);
    
    return { ...course, modules };
  },

  async adminReviewCourse(courseId: string, adminId: string, data: ReviewCourseInput) {
    const course = await coursesRepository.findById(courseId);
    if (!course) throw Errors.notFound('Course not found');

    const currentPrice = await pricingRepository.findCurrentByCourse(courseId);
    
    if (data.status === 'APPROVED') {
      if (currentPrice) {
        await pricingRepository.update(currentPrice.id, {
          approvalStatus: 'APPROVED',
          approvedBy: adminId,
          amount: data.finalPrice !== undefined ? data.finalPrice : currentPrice.amount,
          effectiveAt: new Date(),
        });
      }
      return coursesRepository.update(courseId, { status: data.status }); // Allow skipping APPROVED directly to PUBLISHED
    } else if (data.status === 'CHANGES_REQUESTED') {
      if (currentPrice) {
        await pricingRepository.update(currentPrice.id, {
          approvalStatus: 'REJECTED',
          approvedBy: adminId,
        });
      }
      return coursesRepository.update(courseId, { 
        status: 'CHANGES_REQUESTED',
        rejectedReason: data.rejectionReason || null
      });
    } else {
      return coursesRepository.update(courseId, { 
        status: 'REJECTED',
        rejectedReason: data.rejectionReason || null
      });
    }
  },

  async clearCourseFeedback(courseId: string, teacherId: string) {
    const course = await coursesRepository.findById(courseId);
    if (!course) throw Errors.notFound('Course not found');
    if (course.teacherId !== teacherId) throw Errors.forbidden('Access denied');

    return coursesRepository.update(courseId, { rejectedReason: null });
  },
  
  async adminPublishCourse(courseId: string) {
    const course = await coursesRepository.findById(courseId);
    if (!course) throw Errors.notFound('Course not found');
    if (course.status !== 'APPROVED') {
      throw Errors.badRequest('Course must be approved before publishing');
    }
    
    return coursesRepository.update(courseId, { status: 'PUBLISHED' });
  }
};
