'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/session';

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

interface SidebarProps {
  navItems: NavItem[];
  portalName: string;
  portalIcon: string;
  accentColor?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ navItems, portalName, portalIcon, accentColor = 'var(--brand-500)', isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    // the logout method itself redirects to /login.
  };

  return (
    <aside className={`sidebar ${isOpen ? 'is-open' : ''}`}>
      {/* Logo and Mobile Close Button */}
      <div style={{ padding: '0 1.25rem 1.5rem', borderBottom: '1px solid var(--surface-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'var(--gradient-brand)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1rem', boxShadow: '0 0 12px rgba(139,92,246,0.35)',
          }}>🌿</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
              Nama Wellness
            </div>
            <div style={{ fontSize: '0.75rem', color: accentColor, fontWeight: 500 }}>
              {portalIcon} {portalName}
            </div>
          </div>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="hide-desktop"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: '0.25rem',
              lineHeight: 1
            }}
            aria-label="Close menu"
          >
            ×
          </button>
        )}
        </div>
      </div>

      {/* User info */}
      {user?.profile && (
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--surface-border)' }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {user.profile.firstName} {user.profile.lastName}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>
            {user.email}
          </div>
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, padding: '0.75rem 0.75rem' }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => onClose?.()}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.625rem',
                padding: '0.625rem 0.875rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '0.25rem',
                background: isActive ? 'rgba(139,92,246,0.15)' : 'transparent',
                border: isActive ? '1px solid rgba(139,92,246,0.3)' : '1px solid transparent',
                color: isActive ? 'var(--brand-300)' : 'var(--text-secondary)',
                textDecoration: 'none',
                fontSize: '0.9rem',
                fontWeight: isActive ? 600 : 400,
                transition: 'all 0.15s ease',
              }}
            >
              <span style={{ width: 20, textAlign: 'center' }}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: '0.75rem', borderTop: '1px solid var(--surface-border)' }}>
        <button
          onClick={handleLogout}
          className="btn btn-danger btn-full"
          style={{ justifyContent: 'flex-start', gap: '0.625rem', fontSize: '0.9rem' }}
        >
          <span>🚪</span> Sign out
        </button>
      </div>
    </aside>
  );
}
