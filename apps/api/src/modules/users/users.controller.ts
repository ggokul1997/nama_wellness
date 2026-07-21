import type { Request, Response } from 'express';
import { prisma } from '../../infrastructure/database/prisma.client.js';
import type { ApiResponse, UpdateProfileRequest } from '@nama/shared';
import { updateProfileSchema } from '@nama/shared';
import { Errors } from '../../utils/errors.js';

export const usersController = {
  async getProfile(req: Request, res: Response): Promise<void> {
    const profile = await prisma.profile.findUnique({
      where: { userId: req.user!.sub },
    });

    if (!profile) throw Errors.notFound('Profile');

    const response: ApiResponse = { success: true, data: { profile } };
    res.status(200).json(response);
  },

  async updateProfile(req: Request, res: Response): Promise<void> {
    const data = updateProfileSchema.parse(req.body) as UpdateProfileRequest;

    const profile = await prisma.profile.update({
      where: { userId: req.user!.sub },
      data: {
        ...(data.firstName !== undefined && { firstName: data.firstName }),
        ...(data.lastName !== undefined && { lastName: data.lastName }),
        ...(data.bio !== undefined && { bio: data.bio }),
        ...(data.timezone !== undefined && { timezone: data.timezone }),
      },
    });

    const response: ApiResponse = { success: true, data: { profile }, message: 'Profile updated' };
    res.status(200).json(response);
  },

  async getTeacherProfile(req: Request, res: Response): Promise<void> {
    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId: req.user!.sub },
    });
    
    // If it doesn't exist, return defaults so UI can display 0
    if (!teacherProfile) {
      res.status(200).json({ 
        success: true, 
        data: { 
          teacherProfile: { averageRating: 0, totalReviews: 0 } 
        } 
      });
      return;
    }

    res.status(200).json({ success: true, data: { teacherProfile } });
  },

  async getAdminUsersList(req: Request, res: Response): Promise<void> {
    const search = req.query.search as string | undefined;
    const role = req.query.role as string | undefined;
    const status = req.query.status as string | undefined;

    const where: any = {};
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { profile: { firstName: { contains: search, mode: 'insensitive' } } },
        { profile: { lastName: { contains: search, mode: 'insensitive' } } }
      ];
    }
    if (role && role !== 'ALL') {
      where.roles = { some: { role } };
    }
    if (status && status !== 'ALL') {
      where.status = status;
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        status: true,
        createdAt: true,
        profile: {
          select: { firstName: true, lastName: true, avatarUrl: true }
        },
        roles: {
          select: { role: true }
        },
        _count: {
          select: { enrollments: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      firstName: user.profile?.firstName || '',
      lastName: user.profile?.lastName || '',
      avatarUrl: user.profile?.avatarUrl || null,
      status: user.status,
      roles: user.roles.map(r => r.role),
      enrollmentsCount: user._count.enrollments,
      joinedAt: user.createdAt.toISOString()
    }));

    const totalUsers = await prisma.user.count();
    const activeStudents = await prisma.user.count({ where: { status: 'ACTIVE', roles: { some: { role: 'STUDENT' } } } });
    const teachers = await prisma.user.count({ where: { roles: { some: { role: 'TEACHER' } } } });
    const admins = await prisma.user.count({ where: { roles: { some: { role: 'ADMIN' } } } });

    res.status(200).json({ 
      success: true, 
      data: {
        users: formattedUsers,
        summary: { totalUsers, activeStudents, teachers, admins }
      }
    });
  },

  async updateUserStatus(req: Request, res: Response): Promise<void> {
    const id = req.params.id as string;
    const status = req.body.status as any;
    
    if (!id || !status) throw Errors.badRequest('Missing id or status');

    await prisma.user.update({
      where: { id },
      data: { status }
    });

    res.status(200).json({ success: true, message: 'User status updated' });
  },
};
