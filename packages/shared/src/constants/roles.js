"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OTP_PURPOSE = exports.USER_STATUS = exports.PRODUCT_VARIANTS = exports.ROLES = void 0;
// User roles matching the Prisma Role enum
exports.ROLES = {
    STUDENT: 'STUDENT',
    TEACHER: 'TEACHER',
    ADMIN: 'ADMIN',
    EMPLOYEE: 'EMPLOYEE',
    COMPANY_ADMIN: 'COMPANY_ADMIN',
};
// Product variants
exports.PRODUCT_VARIANTS = {
    EDPRO: 'EDPRO',
    CORPORATE: 'CORPORATE',
};
// User account statuses
exports.USER_STATUS = {
    ACTIVE: 'ACTIVE',
    SUSPENDED: 'SUSPENDED',
};
// OTP purposes
exports.OTP_PURPOSE = {
    EMAIL_VERIFICATION: 'EMAIL_VERIFICATION',
    PHONE_VERIFICATION: 'PHONE_VERIFICATION',
    PASSWORD_RESET: 'PASSWORD_RESET',
};
//# sourceMappingURL=roles.js.map