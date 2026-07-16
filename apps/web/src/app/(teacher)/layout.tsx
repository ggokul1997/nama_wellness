'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { QueryProvider } from '@/providers/QueryProvider';
import { Sidebar } from '@/components/layout/Sidebar';
import { ROUTES } from '@nama/shared';
import { teacherApplicationsApi } from '@/lib/api/teacher-applications';

const TEACHER_NAV = [
  { href: ROUTES.TEACHER_DASHBOARD, label: 'Dashboard', icon: '🏠' },
  { href: ROUTES.TEACHER_ONBOARDING, label: 'Onboarding', icon: '📋' },
  { href: ROUTES.TEACHER_COURSES, label: 'My Courses', icon: '📚' },
  { href: ROUTES.TEACHER_AVAILABILITY, label: 'Availability', icon: '🗓️' },
  { href: ROUTES.TEACHER_PRICING, label: 'Pricing', icon: '🏷️' },
  { href: ROUTES.TEACHER_BOOKINGS, label: 'Bookings', icon: '📅' },
  { href: ROUTES.TEACHER_EARNINGS, label: 'Earnings', icon: '💰' },
  { href: ROUTES.TEACHER_CHAT, label: 'Chat', icon: '💬' },
  { href: ROUTES.TEACHER_PROFILE, label: 'Profile', icon: '👤' },
];

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isApproved, setIsApproved] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    teacherApplicationsApi.getMyApplication()
      .then(res => {
        const approved = res.data?.application?.status === 'APPROVED';
        setIsApproved(approved);
        
        // If not approved and not on the apply page, redirect to apply page
        if (!approved && pathname !== ROUTES.TEACHER_ONBOARDING) {
          router.replace(ROUTES.TEACHER_ONBOARDING);
        }
      })
      .catch(err => {
        if (err?.status === 401) {
          router.push(ROUTES.LOGIN);
        } else {
          console.error(err);
        }
      })
      .finally(() => setLoading(false));
  }, [pathname, router]);

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Loading portal...</div>;
  }

  // Filter navigation: Only show 'Onboarding' if not approved
  const visibleNav = isApproved 
    ? TEACHER_NAV 
    : TEACHER_NAV.filter(item => item.href === ROUTES.TEACHER_ONBOARDING);

  return (
    <QueryProvider>
      <div className="layout-with-sidebar">
        <Sidebar navItems={visibleNav} portalName="Teacher" portalIcon="🧑‍🏫" accentColor="#34d399" />
        <main className="main-content">{children}</main>
      </div>
    </QueryProvider>
  );
}
