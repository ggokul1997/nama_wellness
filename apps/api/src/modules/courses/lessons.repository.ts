import type { Prisma } from '@prisma/client';
import { prisma } from '../../infrastructure/database/prisma.client.js';

export const lessonsRepository = {
  async findById(id: string) {
    return prisma.lesson.findUnique({
      where: { id },
    });
  },

  async create(data: Prisma.LessonUncheckedCreateInput) {
    return prisma.lesson.create({
      data,
    });
  },

  async update(id: string, data: Prisma.LessonUncheckedUpdateInput) {
    return prisma.lesson.update({
      where: { id },
      data,
    });
  },

  async delete(id: string) {
    return prisma.lesson.delete({
      where: { id },
    });
  },
};
