'use client';

import { useState } from 'react';
import { QueryProvider } from '@/providers/QueryProvider';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileHeader } from '@/components/layout/MobileHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { DesktopNotification } from '@/components/layout/DesktopNotification';

const COMPANY_ADMIN_NAV = [
  { href: '/courses', label: 'Explore Courses', icon: '🔍' },
  { href: '/company-admin/dashboard', label: 'Dashboard', icon: '🏢' },
  { href: '/company-admin/licenses', label: 'Licenses', icon: '🔑' },
  { href: '/company-admin/employees', label: 'Employees', icon: '👥' },
];

export default function CompanyAdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <QueryProvider>
      <MobileHeader 
        onMenuClick={() => setIsSidebarOpen(true)} 
        portalName="Corporate" 
        portalIcon="🏢" 
      />
      <div 
        className={`sidebar-overlay ${isSidebarOpen ? 'is-open' : ''}`} 
        onClick={() => setIsSidebarOpen(false)} 
      />

      <div className="layout-with-sidebar">
        <Sidebar 
          navItems={COMPANY_ADMIN_NAV} 
          portalName="Corporate" 
          portalIcon="🏢" 
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        <main className="main-content">
          <DesktopNotification />
          {children}
        </main>
      </div>

      <BottomNav navItems={COMPANY_ADMIN_NAV} />
    </QueryProvider>
  );
}
