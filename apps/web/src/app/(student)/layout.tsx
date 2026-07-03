import { QueryProvider } from '@/providers/QueryProvider';
import { Sidebar } from '@/components/layout/Sidebar';
import { ROUTES } from '@nama/shared';

const STUDENT_NAV = [
  { href: ROUTES.STUDENT_DASHBOARD, label: 'Dashboard', icon: '🏠' },
  { href: ROUTES.STUDENT_COURSES, label: 'My Courses', icon: '📚' },
  { href: ROUTES.STUDENT_BOOKINGS, label: 'Bookings', icon: '📅' },
  { href: ROUTES.STUDENT_CERTIFICATES, label: 'Certificates', icon: '🎓' },
  { href: ROUTES.STUDENT_CHAT, label: 'Chat', icon: '💬' },
  { href: ROUTES.STUDENT_ORDERS, label: 'Orders', icon: '🧾' },
  { href: ROUTES.STUDENT_PROFILE, label: 'Profile', icon: '👤' },
];

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <div className="layout-with-sidebar">
        <Sidebar navItems={STUDENT_NAV} portalName="Student" portalIcon="🎓" />
        <main className="main-content">{children}</main>
      </div>
    </QueryProvider>
  );
}
