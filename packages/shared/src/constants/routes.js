"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROUTES = exports.API_VERSION = void 0;
// API base path
exports.API_VERSION = '/api/v1';
// Frontend route paths (used by Next.js middleware and Link components)
exports.ROUTES = {
    // Public
    HOME: '/',
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REGISTER_CORPORATE: '/auth/register/corporate',
    VERIFY_EMAIL: '/auth/verify-email',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    // Student portal
    STUDENT_DASHBOARD: '/student/dashboard',
    STUDENT_COURSES: '/student/courses',
    STUDENT_BOOKINGS: '/student/bookings',
    STUDENT_CERTIFICATES: '/student/certificates',
    STUDENT_CHAT: '/student/chat',
    STUDENT_ORDERS: '/student/orders',
    STUDENT_PROFILE: '/student/profile',
    // Teacher portal
    TEACHER_DASHBOARD: '/teacher/dashboard',
    TEACHER_ONBOARDING: '/teacher/onboarding',
    TEACHER_COURSES: '/teacher/courses',
    TEACHER_AVAILABILITY: '/teacher/availability',
    TEACHER_BOOKINGS: '/teacher/bookings',
    TEACHER_EARNINGS: '/teacher/earnings',
    TEACHER_CHAT: '/teacher/chat',
    TEACHER_PROFILE: '/teacher/profile',
    // Admin portal
    ADMIN_DASHBOARD: '/admin/dashboard',
    ADMIN_USERS: '/admin/users',
    ADMIN_TEACHERS: '/admin/teachers',
    ADMIN_CATEGORIES: '/admin/categories',
    ADMIN_COURSES: '/admin/courses',
    ADMIN_COMPANIES: '/admin/companies',
    ADMIN_PAYMENTS: '/admin/payments',
    ADMIN_PAYOUTS: '/admin/payouts',
    ADMIN_ANALYTICS: '/admin/analytics',
    ADMIN_AUDIT_LOGS: '/admin/audit-logs',
    // Corporate portals
    COMPANY_ADMIN_DASHBOARD: '/company-admin/dashboard',
    EMPLOYEE_DASHBOARD: '/employee/dashboard',
};
//# sourceMappingURL=routes.js.map