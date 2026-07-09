import { prisma } from '../../infrastructure/database/prisma.client.js';

export const companiesRepository = {
  async getCompanyByAdminId(adminId: string) {
    return prisma.company.findUnique({
      where: { adminId },
      include: {
        _count: {
          select: { employees: true },
        },
      },
    });
  },

  async getCompanyDashboard(companyId: string) {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        licenses: {
          include: {
            course: {
              select: { title: true, coverImageUrl: true },
            },
          },
        },
        _count: {
          select: { employees: true },
        },
      },
    });

    if (!company) return null;

    const totalLicenses = company.licenses.reduce((acc, curr) => acc + curr.totalSeats, 0);
    const usedSeats = company.licenses.reduce((acc, curr) => acc + curr.usedSeats, 0);

    return {
      company,
      stats: {
        totalEmployees: company._count.employees,
        totalLicenses,
        usedSeats,
        availableSeats: totalLicenses - usedSeats,
      },
    };
  },

  async getEmployees(companyId: string) {
    return prisma.companyEmployee.findMany({
      where: { companyId },
      include: {
        user: {
          select: {
            email: true,
            passwordHash: true,
            profile: { select: { firstName: true, lastName: true } },
          },
        },
      },
      orderBy: { joinedAt: 'desc' },
    });
  },

  async getLicenses(companyId: string) {
    return prisma.companyLicense.findMany({
      where: { companyId },
      include: {
        course: { select: { title: true, coverImageUrl: true } },
      },
    });
  },

  async purchaseLicense(companyId: string, courseId: string, seats: number) {
    const existing = await prisma.companyLicense.findFirst({
      where: { companyId, courseId },
    });

    if (existing) {
      return prisma.companyLicense.update({
        where: { id: existing.id },
        data: { totalSeats: existing.totalSeats + seats },
      });
    }

    return prisma.companyLicense.create({
      data: {
        companyId,
        courseId,
        totalSeats: seats,
      },
    });
  },

  async findEmployee(companyId: string, userId: string) {
    return prisma.companyEmployee.findUnique({
      where: {
        companyId_userId: {
          companyId,
          userId,
        },
      },
    });
  },

  async addEmployee(companyId: string, userId: string) {
    return prisma.companyEmployee.create({
      data: {
        companyId,
        userId,
      },
    });
  },

  async deleteEmployee(companyId: string, userId: string) {
    return prisma.$transaction(async (tx) => {
      // 1. Ensure the user is actually an employee of this company
      const employee = await tx.companyEmployee.findUnique({
        where: { companyId_userId: { companyId, userId } }
      });

      if (!employee) {
        throw new Error('Employee not found in this company');
      }

      // 2. Find all enrollments for this user
      const enrollments = await tx.enrollment.findMany({
        where: { userId }
      });

      // 3. Decrement seats for any courses the company holds a license for
      for (const enrollment of enrollments) {
        // Find if this company has a license for this course
        const license = await tx.companyLicense.findFirst({
          where: { companyId, courseId: enrollment.courseId }
        });

        if (license && license.usedSeats > 0) {
          // Decrement used seats safely
          await tx.companyLicense.updateMany({
            where: {
              id: license.id,
              usedSeats: { gt: 0 }
            },
            data: {
              usedSeats: { decrement: 1 }
            }
          });
        }
      }

      // 4. Delete the User (this will cascade delete enrollments, companyEmployee, profile, etc.)
      await tx.user.delete({
        where: { id: userId }
      });
    });
  },
};
