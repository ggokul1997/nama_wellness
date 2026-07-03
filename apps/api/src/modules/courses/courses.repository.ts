import type { Prisma } from '@prisma/client';
import { prisma } from '../../infrastructure/database/prisma.client.js';

export const coursesRepository = {
  async findAllByTeacher(teacherId: string) {
    return prisma.course.findMany({
      where: { teacherId },
      include: { category: true, pricings: { where: { isCurrent: true } } },
      orderBy: { createdAt: 'desc' },
    });
  },

  async findAllByStatus(status: Prisma.CourseWhereInput['status']) {
    return prisma.course.findMany({
      where: { status },
      include: { category: true, teacher: { include: { profile: true } }, pricings: { where: { isCurrent: true } } },
      orderBy: { createdAt: 'desc' },
    });
  },

  async findAllSubmitted() {
    return prisma.course.findMany({
      where: { status: { not: 'DRAFT' } },
      include: { category: true, teacher: { include: { profile: true } }, pricings: { where: { isCurrent: true } } },
      orderBy: { createdAt: 'desc' },
    });
  },

  async findAllPublished() {
    return prisma.course.findMany({
      where: { status: 'PUBLISHED' },
      include: { category: true, teacher: { include: { profile: true } }, pricings: { where: { isCurrent: true } } },
      orderBy: { createdAt: 'desc' },
    });
  },

  async findPublishedBySlug(slug: string) {
    return prisma.course.findUnique({
      where: { slug, status: 'PUBLISHED' },
      include: { 
        category: true, 
        teacher: { include: { profile: true } }, 
        pricings: { where: { isCurrent: true } },
        modules: {
          orderBy: { sortOrder: 'asc' },
          include: {
            lessons: {
              orderBy: { sortOrder: 'asc' },
            }
          }
        }
      },
    });
  },

  async findById(id: string) {
    return prisma.course.findUnique({
      where: { id },
      include: { 
        category: true,
        pricings: { where: { isCurrent: true } }
      },
    });
  },

  async create(data: Prisma.CourseUncheckedCreateInput) {
    return prisma.course.create({
      data,
      include: { category: true },
    });
  },

  async update(id: string, data: Prisma.CourseUncheckedUpdateInput) {
    return prisma.course.update({
      where: { id },
      data,
      include: { category: true },
    });
  },

  async updateCoverImage(id: string, coverImageUrl: string) {
    return prisma.course.update({
      where: { id },
      data: { coverImageUrl },
    });
  },

  async delete(id: string) {
    return prisma.course.delete({
      where: { id },
    });
  },
};
