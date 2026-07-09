'use client';

import { QueryProvider } from '@/providers/QueryProvider';
import { Sidebar } from '@/components/layout/Sidebar';

const EMPLOYEE_NAV = [
  { href: '/employee/dashboard', label: 'Dashboard', icon: '🏠' },
  { href: '/courses', label: 'Browse Courses', icon: '📚' },
];

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <div className="layout-with-sidebar">
        <Sidebar navItems={EMPLOYEE_NAV} portalName="Employee" portalIcon="💼" />
        <main className="main-content">{children}</main>
      </div>
    </QueryProvider>
  );
}
