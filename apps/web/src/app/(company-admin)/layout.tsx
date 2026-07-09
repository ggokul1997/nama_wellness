'use client';

import { QueryProvider } from '@/providers/QueryProvider';
import { Sidebar } from '@/components/layout/Sidebar';

const COMPANY_ADMIN_NAV = [
  { href: '/company-admin/dashboard', label: 'Dashboard', icon: '🏢' },
  { href: '/company-admin/licenses', label: 'Licenses', icon: '🔑' },
  { href: '/company-admin/employees', label: 'Employees', icon: '👥' },
];

export default function CompanyAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <div className="layout-with-sidebar">
        <Sidebar navItems={COMPANY_ADMIN_NAV} portalName="Corporate" portalIcon="🏢" />
        <main className="main-content">{children}</main>
      </div>
    </QueryProvider>
  );
}
