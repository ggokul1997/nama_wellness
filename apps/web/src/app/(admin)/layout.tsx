'use client';

import { useState } from 'react';
import { QueryProvider } from '@/providers/QueryProvider';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileHeader } from '@/components/layout/MobileHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { ROUTES } from '@nama/shared';
import { DesktopNotification } from '@/components/layout/DesktopNotification';

const ADMIN_NAV = [
  { href: '/courses', label: 'Explore Courses', icon: '🔍' },
  { href: ROUTES.ADMIN_DASHBOARD, label: 'Dashboard', icon: '🏠' },
  { href: ROUTES.ADMIN_USERS, label: 'Users', icon: '👥' },
  { href: ROUTES.ADMIN_TEACHERS, label: 'Teachers', icon: '🧑‍🏫' },
  { href: '/admin/teacher-applications', label: 'Teacher Apps', icon: '📝' },
  { href: ROUTES.ADMIN_CATEGORIES, label: 'Categories', icon: '🏷️' },
  { href: ROUTES.ADMIN_COURSES, label: 'Courses', icon: '📚' },
  { href: '/admin/study-materials', label: 'Study Materials', icon: '📄' },
  { href: '/admin/enrollments', label: 'Enrollments', icon: '🎓' },
  { href: ROUTES.ADMIN_COMPANIES, label: 'Companies', icon: '🏢' },
  { href: ROUTES.ADMIN_PAYMENTS, label: 'Payments', icon: '💳' },
  { href: ROUTES.ADMIN_PAYOUTS, label: 'Payouts', icon: '💸' },
  { href: ROUTES.ADMIN_ANALYTICS, label: 'Analytics', icon: '📊' },
  { href: ROUTES.ADMIN_AUDIT_LOGS, label: 'Audit Logs', icon: '📋' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Admin bottom nav (limit to 5)
  const ADMIN_BOTTOM_NAV = [
    { href: ROUTES.ADMIN_DASHBOARD, label: 'Dashboard', icon: '🏠' },
    { href: ROUTES.ADMIN_COURSES, label: 'Courses', icon: '📚' },
    { href: '/admin/teacher-applications', label: 'Apps', icon: '📝' },
    { href: '/admin/enrollments', label: 'Enrollments', icon: '🎓' },
    { href: ROUTES.ADMIN_CATEGORIES, label: 'Categories', icon: '🏷️' },
  ];

  return (
    <QueryProvider>
      <MobileHeader 
        onMenuClick={() => setIsSidebarOpen(true)} 
        portalName="Admin" 
        portalIcon="⚙️" 
      />
      <div 
        className={`sidebar-overlay ${isSidebarOpen ? 'is-open' : ''}`} 
        onClick={() => setIsSidebarOpen(false)} 
      />

      <div className="layout-with-sidebar">
        <Sidebar 
          navItems={ADMIN_NAV} 
          portalName="Admin" 
          portalIcon="⚙️" 
          accentColor="#f59e0b"
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        <main className="main-content">
          <DesktopNotification />
          {children}
        </main>
      </div>

      <BottomNav navItems={ADMIN_BOTTOM_NAV} />
    </QueryProvider>
  );
}
