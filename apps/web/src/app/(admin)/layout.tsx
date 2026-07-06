import { QueryProvider } from '@/providers/QueryProvider';
import { Sidebar } from '@/components/layout/Sidebar';
import { ROUTES } from '@nama/shared';

const ADMIN_NAV = [
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
  return (
    <QueryProvider>
      <div className="layout-with-sidebar">
        <Sidebar navItems={ADMIN_NAV} portalName="Admin" portalIcon="⚙️" accentColor="#f59e0b" />
        <main className="main-content">{children}</main>
      </div>
    </QueryProvider>
  );
}
