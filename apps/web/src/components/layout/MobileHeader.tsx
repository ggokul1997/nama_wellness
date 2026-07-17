'use client';

import React from 'react';

interface MobileHeaderProps {
  onMenuClick: () => void;
  portalName: string;
  portalIcon: string;
}

import { NotificationBell } from '@/components/ui/NotificationBell';

export function MobileHeader({ onMenuClick, portalName, portalIcon }: MobileHeaderProps) {
  return (
    <div className="mobile-header hide-desktop">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button 
          onClick={onMenuClick}
          style={{ 
            background: 'transparent', 
            border: 'none', 
            color: 'var(--text-primary)', 
            fontSize: '1.5rem', 
            cursor: 'pointer',
            padding: '0.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          aria-label="Open menu"
        >
          ☰
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: 'var(--gradient-brand)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.8rem', boxShadow: '0 0 8px rgba(139,92,246,0.35)',
          }}>🌿</div>
          <span style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)' }}>
            {portalIcon} {portalName}
          </span>
        </div>
      </div>
      
      <NotificationBell />
    </div>
  );
}
