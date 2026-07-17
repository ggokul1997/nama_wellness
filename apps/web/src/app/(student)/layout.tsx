'use client';

import { useState } from 'react';
import { QueryProvider } from '@/providers/QueryProvider';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileHeader } from '@/components/layout/MobileHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { DesktopNotification } from '@/components/layout/DesktopNotification';
import { ROUTES } from '@nama/shared';

const STUDENT_NAV = [
  { href: '/courses', label: 'Explore Courses', icon: '🔍' },
  { href: ROUTES.STUDENT_DASHBOARD, label: 'Dashboard', icon: '🏠' },
  { href: ROUTES.STUDENT_BOOKINGS, label: 'Bookings', icon: '📅' },
  { href: ROUTES.STUDENT_CERTIFICATES, label: 'Certificates', icon: '🎓' },
  { href: ROUTES.STUDENT_CHAT, label: 'Chat', icon: '💬' },
  { href: ROUTES.STUDENT_ORDERS, label: 'Orders', icon: '🧾' },
  { href: ROUTES.STUDENT_PROFILE, label: 'Profile', icon: '👤' },
];

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Student bottom nav (limit to 5)
  const STUDENT_BOTTOM_NAV = [
    { href: ROUTES.STUDENT_DASHBOARD, label: 'Dashboard', icon: '🏠' },
    { href: ROUTES.STUDENT_BOOKINGS, label: 'Bookings', icon: '📅' },
    { href: ROUTES.STUDENT_CHAT, label: 'Chat', icon: '💬' },
    { href: ROUTES.STUDENT_ORDERS, label: 'Orders', icon: '🧾' },
    { href: ROUTES.STUDENT_PROFILE, label: 'Profile', icon: '👤' },
  ];

  return (
    <QueryProvider>
      <MobileHeader 
        onMenuClick={() => setIsSidebarOpen(true)} 
        portalName="Student" 
        portalIcon="🎓" 
      />
      <div 
        className={`sidebar-overlay ${isSidebarOpen ? 'is-open' : ''}`} 
        onClick={() => setIsSidebarOpen(false)} 
      />

      <div className="layout-with-sidebar">
        <Sidebar 
          navItems={STUDENT_NAV} 
          portalName="Student" 
          portalIcon="🎓" 
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        <main className="main-content">
          <DesktopNotification />
          {children}
        </main>
      </div>

      <BottomNav navItems={STUDENT_BOTTOM_NAV} />
    </QueryProvider>
  );
}
