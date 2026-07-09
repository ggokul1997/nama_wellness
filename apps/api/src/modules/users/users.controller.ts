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
};
