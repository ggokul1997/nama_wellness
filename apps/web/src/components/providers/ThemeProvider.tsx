'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/session';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || isLoading) return;

    if (!user) {
      document.body.removeAttribute('data-theme');
      return;
    }

    const role = user.roles?.[0]?.role;
    
    switch (role) {
      case 'TEACHER':
        document.body.setAttribute('data-theme', 'teacher');
        break;
      case 'COMPANY_ADMIN':
        document.body.setAttribute('data-theme', 'company_admin');
        break;
      case 'EMPLOYEE':
        document.body.setAttribute('data-theme', 'employee');
        break;
      case 'ADMIN':
        document.body.setAttribute('data-theme', 'admin');
        break;
      case 'STUDENT':
      default:
        document.body.removeAttribute('data-theme'); // Student uses default theme
        break;
    }
  }, [user, isLoading, mounted]);

  return <>{children}</>;
}
