// User roles matching the Prisma Role enum
export const ROLES = {
  STUDENT: 'STUDENT',
  TEACHER: 'TEACHER',
  ADMIN: 'ADMIN',
  EMPLOYEE: 'EMPLOYEE',
  COMPANY_ADMIN: 'COMPANY_ADMIN',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

// Product variants
export const PRODUCT_VARIANTS = {
  EDPRO: 'EDPRO',
  CORPORATE: 'CORPORATE',
} as const;

export type ProductVariant = (typeof PRODUCT_VARIANTS)[keyof typeof PRODUCT_VARIANTS];

// User account statuses
export const USER_STATUS = {
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
} as const;

export type UserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS];

// OTP purposes
export const OTP_PURPOSE = {
  EMAIL_VERIFICATION: 'EMAIL_VERIFICATION',
  PHONE_VERIFICATION: 'PHONE_VERIFICATION',
  PASSWORD_RESET: 'PASSWORD_RESET',
} as const;

export type OTPPurpose = (typeof OTP_PURPOSE)[keyof typeof OTP_PURPOSE];
