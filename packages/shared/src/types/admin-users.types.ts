import type { Role, UserStatus } from '../constants/roles.js';

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  status: UserStatus;
  roles: Role[];
  enrollmentsCount: number;
  joinedAt: string;
}

export interface AdminUsersSummary {
  totalUsers: number;
  activeStudents: number;
  teachers: number;
  admins: number;
}
