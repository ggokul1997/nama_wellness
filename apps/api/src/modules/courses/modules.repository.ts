import type { Prisma } from '@prisma/client';
import { prisma } from '../../infrastructure/database/prisma.client.js';

export const modulesRepository = {
  async findAllByCourse(courseId: string) {
    return prisma.courseModule.findMany({
      where: { courseId },
      include: { lessons: { orderBy: { sortOrder: 'asc' } } },
      orderBy: { sortOrder: 'asc' },
    });
  },

  async findById(id: string) {
    return prisma.courseModule.findUnique({
      where: { id },
      include: { lessons: { orderBy: { sortOrder: 'asc' } } },
    });
  },

  async create(data: Prisma.CourseModuleUncheckedCreateInput) {
    return prisma.courseModule.create({
      data,
    });
  },

  async update(id: string, data: Prisma.CourseModuleUncheckedUpdateInput) {
    return prisma.courseModule.update({
      where: { id },
      data,
    });
  },

  async delete(id: string) {
    return prisma.courseModule.delete({
      where: { id },
    });
  },
};
