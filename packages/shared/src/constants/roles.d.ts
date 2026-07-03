export declare const ROLES: {
    readonly STUDENT: "STUDENT";
    readonly TEACHER: "TEACHER";
    readonly ADMIN: "ADMIN";
    readonly EMPLOYEE: "EMPLOYEE";
    readonly COMPANY_ADMIN: "COMPANY_ADMIN";
};
export type Role = (typeof ROLES)[keyof typeof ROLES];
export declare const PRODUCT_VARIANTS: {
    readonly EDPRO: "EDPRO";
    readonly CORPORATE: "CORPORATE";
};
export type ProductVariant = (typeof PRODUCT_VARIANTS)[keyof typeof PRODUCT_VARIANTS];
export declare const USER_STATUS: {
    readonly ACTIVE: "ACTIVE";
    readonly SUSPENDED: "SUSPENDED";
};
export type UserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS];
export declare const OTP_PURPOSE: {
    readonly EMAIL_VERIFICATION: "EMAIL_VERIFICATION";
    readonly PHONE_VERIFICATION: "PHONE_VERIFICATION";
    readonly PASSWORD_RESET: "PASSWORD_RESET";
};
export type OTPPurpose = (typeof OTP_PURPOSE)[keyof typeof OTP_PURPOSE];
//# sourceMappingURL=roles.d.ts.map