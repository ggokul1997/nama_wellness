export interface Company {
  id: string;
  name: string;
  adminId: string;
  domain: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyEmployee {
  id: string;
  companyId: string;
  userId: string;
  joinedAt: string;
  user?: {
    email: string;
    profile?: {
      firstName: string;
      lastName: string;
    } | null;
  };
}

export interface CompanyLicense {
  id: string;
  companyId: string;
  courseId: string;
  totalSeats: number;
  usedSeats: number;
  createdAt: string;
  updatedAt: string;
  course?: {
    title: string;
    coverImageUrl?: string | null;
  };
}

export interface CompanyDashboardSummary {
  totalEmployees: number;
  totalLicenses: number;
  usedSeats: number;
  availableSeats: number;
}
