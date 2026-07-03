import type { Prisma } from '@prisma/client';
import { prisma } from '../../infrastructure/database/prisma.client.js';

export const pricingRepository = {
  async findCurrentByCourse(courseId: string) {
    return prisma.coursePricing.findFirst({
      where: { courseId, isCurrent: true },
    });
  },

  async create(data: Prisma.CoursePricingUncheckedCreateInput) {
    return prisma.$transaction(async (tx) => {
      // Set all existing prices for this course to not current
      await tx.coursePricing.updateMany({
        where: { courseId: data.courseId, isCurrent: true },
        data: { isCurrent: false },
      });

      // Create the new current price
      return tx.coursePricing.create({
        data: { ...data, isCurrent: true },
      });
    });
  },

  async update(id: string, data: Prisma.CoursePricingUncheckedUpdateInput) {
    return prisma.coursePricing.update({
      where: { id },
      data,
    });
  },

  async delete(id: string) {
    return prisma.coursePricing.delete({
      where: { id },
    });
  },
};
