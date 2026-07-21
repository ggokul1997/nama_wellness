import { prisma } from '../../infrastructure/database/prisma.client.js';
import type { AuditLogEntry } from '@nama/shared';

export class AuditLogsService {
  async getAuditLogs(filters: { type?: string, dateFrom?: string, dateTo?: string, page?: number, limit?: number }) {
    const page = filters.page || 1;
    const limit = filters.limit || 30;
    const skip = (page - 1) * limit;

    let events: AuditLogEntry[] = [];

    // Query 1: User Registrations & Suspensions
    if (!filters.type || filters.type === 'USER_REGISTERED' || filters.type === 'SUSPENSION') {
      const users = await prisma.user.findMany({
        where: {
          ...(filters.dateFrom && { createdAt: { gte: new Date(filters.dateFrom) } }),
          ...(filters.dateTo && { createdAt: { lte: new Date(filters.dateTo) } })
        },
        include: { profile: true, roles: true }
      });
      
      for (const user of users) {
        if (!filters.type || filters.type === 'USER_REGISTERED') {
          events.push({
            id: `usr_reg_${user.id}`,
            type: 'USER_REGISTERED',
            description: `New user registered: ${user.email}`,
            actorName: user.profile?.firstName ? `${user.profile.firstName} ${user.profile.lastName}` : user.email,
            targetName: 'Platform',
            timestamp: user.createdAt.toISOString(),
            metadata: { roles: user.roles.map(r => r.role) }
          });
        }
        
        if (user.status === 'SUSPENDED' && (!filters.type || filters.type === 'SUSPENSION')) {
          events.push({
            id: `usr_sus_${user.id}`,
            type: 'SUSPENSION',
            description: `User account suspended: ${user.email}`,
            actorName: 'System/Admin',
            targetName: user.profile?.firstName ? `${user.profile.firstName} ${user.profile.lastName}` : user.email,
            timestamp: user.updatedAt.toISOString(),
          });
        }
      }
    }

    // Query 2: Teacher Applications
    if (!filters.type || filters.type === 'TEACHER_APPLICATION') {
      const applications = await prisma.teacherApplication.findMany({
        where: {
          ...(filters.dateFrom && { createdAt: { gte: new Date(filters.dateFrom) } }),
          ...(filters.dateTo && { createdAt: { lte: new Date(filters.dateTo) } })
        },
        include: { user: { include: { profile: true } } }
      });

      for (const app of applications) {
        events.push({
          id: `app_${app.id}`,
          type: 'TEACHER_APPLICATION',
          description: `Teacher application ${app.status.toLowerCase()}`,
          actorName: app.user.profile?.firstName ? `${app.user.profile.firstName} ${app.user.profile.lastName}` : app.user.email,
          targetName: 'Teacher Onboarding',
          timestamp: app.updatedAt.toISOString(),
          metadata: { status: app.status }
        });
      }
    }

    // Query 3: Course Publications
    if (!filters.type || filters.type === 'COURSE_PUBLISHED') {
      const courses = await prisma.course.findMany({
        where: {
          status: 'PUBLISHED',
          ...(filters.dateFrom && { updatedAt: { gte: new Date(filters.dateFrom) } }),
          ...(filters.dateTo && { updatedAt: { lte: new Date(filters.dateTo) } })
        },
        include: { teacher: { include: { profile: true } } }
      });

      for (const course of courses) {
        events.push({
          id: `course_pub_${course.id}`,
          type: 'COURSE_PUBLISHED',
          description: `Course published: ${course.title}`,
          actorName: course.teacher?.profile?.firstName ? `${course.teacher.profile.firstName} ${course.teacher.profile.lastName}` : (course.teacher?.email || 'Unknown'),
          targetName: course.title,
          timestamp: course.updatedAt.toISOString()
        });
      }
    }

    // Query 4: Enrollments
    if (!filters.type || filters.type === 'ENROLLMENT') {
      const enrollments = await prisma.enrollment.findMany({
        where: {
          ...(filters.dateFrom && { enrolledAt: { gte: new Date(filters.dateFrom) } }),
          ...(filters.dateTo && { enrolledAt: { lte: new Date(filters.dateTo) } })
        },
        include: { user: { include: { profile: true } }, course: true }
      });

      for (const enrollment of enrollments) {
        events.push({
          id: `enr_${enrollment.id}`,
          type: 'ENROLLMENT',
          description: `Student enrolled in course`,
          actorName: enrollment.user.profile?.firstName ? `${enrollment.user.profile.firstName} ${enrollment.user.profile.lastName}` : enrollment.user.email,
          targetName: enrollment.course.title,
          timestamp: enrollment.enrolledAt.toISOString()
        });
      }
    }

    // Query 5: Payouts
    if (!filters.type || filters.type === 'PAYOUT_GENERATED') {
      const payouts = await prisma.payout.findMany({
        where: {
          ...(filters.dateFrom && { createdAt: { gte: new Date(filters.dateFrom) } }),
          ...(filters.dateTo && { createdAt: { lte: new Date(filters.dateTo) } })
        },
        include: { teacher: { include: { profile: true } } }
      });

      for (const payout of payouts) {
        events.push({
          id: `pay_${payout.id}`,
          type: 'PAYOUT_GENERATED',
          description: `Payout generated for ${payout.amount} ${payout.currency}`,
          actorName: 'System',
          targetName: payout.teacher.profile?.firstName ? `${payout.teacher.profile.firstName} ${payout.teacher.profile.lastName}` : payout.teacher.email,
          timestamp: payout.createdAt.toISOString(),
          metadata: { amount: payout.amount, status: payout.status }
        });
      }
    }

    // Sort all events descending by timestamp
    events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const total = events.length;
    const paginatedEvents = events.slice(skip, skip + limit);

    return {
      events: paginatedEvents,
      total
    };
  }
}

export const auditLogsService = new AuditLogsService();
