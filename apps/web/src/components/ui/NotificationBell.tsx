'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { engagementApi } from '@/lib/api/engagement';
import type { Notification } from '@nama/shared';
import { useSocket } from '@/components/providers/SocketProvider';

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { socket } = useSocket();

  useEffect(() => {
    // Initial fetch on mount
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (notification: Notification) => {
      setNotifications(prev => [notification, ...prev]);
    };

    socket.on('new_notification', handleNewNotification);

    return () => {
      socket.off('new_notification', handleNewNotification);
    };
  }, [socket]);

  const fetchNotifications = async () => {
    try {
      const res = await engagementApi.getMyNotifications();
      setNotifications(res.data || []);
    } catch (err) {
      console.error('Failed to load notifications', err);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await engagementApi.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div style={{ position: 'relative' }}>
      <button 
        onClick={() => setOpen(!open)}
        style={{ 
          background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', 
          fontSize: '1.25rem', position: 'relative', padding: '0.5rem' 
        }}
      >
        🔔
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: 0, right: 0, background: '#ef4444', 
            color: 'white', borderRadius: '50%', width: '18px', height: '18px', 
            fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 'bold'
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="glass-card" style={{
          position: 'absolute', top: '100%', right: 0, width: '350px', 
          maxHeight: '400px', overflowY: 'auto', zIndex: 1000,
          marginTop: '0.5rem', display: 'flex', flexDirection: 'column'
        }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--surface-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ margin: 0, fontWeight: 600 }}>Notifications</h4>
            {unreadCount > 0 && (
              <button 
                onClick={async () => {
                  await engagementApi.markAllAsRead();
                  setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                }}
                style={{ background: 'none', border: 'none', color: 'var(--brand-500)', fontSize: '0.75rem', cursor: 'pointer' }}
              >
                Mark all read
              </button>
            )}
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                No notifications
              </div>
            ) : (
              notifications.map(notification => (
                <div 
                  key={notification.id} 
                  onClick={() => {
                    if (!notification.isRead) handleMarkAsRead(notification.id);
                    setOpen(false);
                    if (notification.message.toLowerCase().includes('certificate') || notification.title.toLowerCase().includes('certificate')) {
                      router.push('/student/certificates');
                    }
                  }}
                  style={{ 
                    padding: '1rem', borderBottom: '1px solid var(--surface-border)',
                    background: notification.isRead ? 'transparent' : 'rgba(255,255,255,0.05)',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.25rem', color: notification.isRead ? 'var(--text-secondary)' : 'var(--text-primary)' }}>
                    {notification.title}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {notification.message}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
