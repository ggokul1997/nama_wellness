'use client';

import { NotificationBell } from '@/components/ui/NotificationBell';

export function DesktopNotification() {
  return (
    <div 
      className="hide-mobile" 
      style={{ 
        width: '100%',
        display: 'flex',
        justifyContent: 'flex-end',
        padding: '1.5rem 1.5rem 0'
      }}
    >
      <NotificationBell />
    </div>
  );
}
