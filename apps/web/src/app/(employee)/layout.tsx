'use client';

import { useState } from 'react';
import { QueryProvider } from '@/providers/QueryProvider';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileHeader } from '@/components/layout/MobileHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { DesktopNotification } from '@/components/layout/DesktopNotification';

const EMPLOYEE_NAV = [
  { href: '/courses', label: 'Explore Courses', icon: '🔍' },
  { href: '/employee/dashboard', label: 'Dashboard', icon: '🏠' },
];

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <QueryProvider>
      <MobileHeader 
        onMenuClick={() => setIsSidebarOpen(true)} 
        portalName="Employee" 
        portalIcon="💼" 
      />
      <div 
        className={`sidebar-overlay ${isSidebarOpen ? 'is-open' : ''}`} 
        onClick={() => setIsSidebarOpen(false)} 
      />

      <div className="layout-with-sidebar">
        <Sidebar 
          navItems={EMPLOYEE_NAV} 
          portalName="Employee" 
          portalIcon="💼" 
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        <main className="main-content">
          <DesktopNotification />
          {children}
        </main>
      </div>

      <BottomNav navItems={EMPLOYEE_NAV} />
    </QueryProvider>
  );
}
