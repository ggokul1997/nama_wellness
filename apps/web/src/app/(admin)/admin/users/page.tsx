"use client";

import { useEffect, useState, useCallback } from 'react';
import { useDialog } from '@/components/providers/DialogProvider';
import { usersApi } from '@/lib/api/users';
import type { AdminUser, AdminUsersSummary, UserStatus } from '@nama/shared';
import { MagnifyingGlassIcon, EllipsisVerticalIcon, ShieldCheckIcon, UserIcon, BookOpenIcon, UserMinusIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function AdminUsersPage() {
  const { confirm, alert } = useDialog();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [summary, setSummary] = useState<AdminUsersSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await usersApi.adminList({
        search: search.length >= 3 ? search : undefined,
        role: roleFilter,
        status: statusFilter
      });
      if (res.success && res.data) {
        setUsers(res.data.users);
        setSummary(res.data.summary);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load users';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, statusFilter]);

  useEffect(() => {
    // Debounce search slightly
    const timer = setTimeout(() => {
      fetchData();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchData]);

  const handleUpdateStatus = async (user: AdminUser, newStatus: UserStatus) => {
    const actionLabel = newStatus === 'SUSPENDED' ? 'Suspend' : 'Activate';
    const isConfirmed = await confirm({
      title: `${actionLabel} User`,
      message: `Are you sure you want to ${actionLabel.toLowerCase()} ${user.firstName || user.email}?`,
      isDestructive: newStatus === 'SUSPENDED',
      confirmText: actionLabel
    });
    
    if (isConfirmed) {
      try {
        await usersApi.adminUpdateStatus(user.id, newStatus);
        fetchData();
      } catch (err) {
        console.error(err);
        await alert({ title: 'Error', message: `Failed to ${actionLabel.toLowerCase()} user` });
      }
    }
  };

  return (
    <div className="page-content">
      <div style={{ marginBottom: '2rem' }} className="animate-fade-up">
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          User Management 👥
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.375rem' }}>
          View, search, and moderate all platform users.
        </p>
      </div>

      {summary && (
        <div className="responsive-grid animate-fade-up stagger-1" style={{ marginBottom: '2rem' }}>
          <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Total Users</span>
            <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{summary.totalUsers}</span>
          </div>
          <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Active Students</span>
            <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--brand-400)' }}>{summary.activeStudents}</span>
          </div>
          <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Teachers</span>
            <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--brand-400)' }}>{summary.teachers}</span>
          </div>
          <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Admins</span>
            <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{summary.admins}</span>
          </div>
        </div>
      )}

      <div className="glass-card animate-fade-up stagger-2" style={{ padding: '1rem', marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
          <MagnifyingGlassIcon style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', width: '1.25rem', height: '1.25rem' }} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input"
            style={{ paddingLeft: '2.5rem', width: '100%', margin: 0 }}
          />
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <select 
            value={roleFilter} 
            onChange={(e) => setRoleFilter(e.target.value)}
            className="input"
            style={{ width: 'auto', margin: 0 }}
          >
            <option value="ALL">All Roles</option>
            <option value="STUDENT">Students</option>
            <option value="TEACHER">Teachers</option>
            <option value="ADMIN">Admins</option>
          </select>

          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input"
            style={{ width: 'auto', margin: 0 }}
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>
      </div>

      {error ? (
        <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--danger-400)' }}>
          {error}
        </div>
      ) : loading ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Loading users...
        </div>
      ) : users.length === 0 ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          No users found.
        </div>
      ) : (
        <div className="responsive-grid animate-fade-up stagger-3">
          {users.map(user => (
            <div key={user.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ 
                    width: '3rem', height: '3rem', borderRadius: '50%', 
                    background: 'var(--bg-card-hover)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.25rem', color: 'var(--brand-400)'
                  }}>
                    {user.firstName ? user.firstName.charAt(0).toUpperCase() : <UserIcon style={{ width: '1.5rem', height: '1.5rem' }}/>}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontWeight: 600, color: 'var(--text-primary)' }}>
                      {user.firstName || user.lastName ? `${user.firstName} ${user.lastName}` : 'No Name Set'}
                    </h3>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{user.email}</div>
                  </div>
                </div>

                <div style={{ position: 'relative' }} className="dropdown-container">
                  <button className="btn-icon" aria-label="Menu">
                    <EllipsisVerticalIcon style={{ width: '1.5rem', height: '1.5rem' }} />
                  </button>
                  <div className="dropdown-menu glass-card">
                    {user.status === 'ACTIVE' ? (
                      <button 
                        onClick={() => handleUpdateStatus(user, 'SUSPENDED')}
                        className="danger"
                      >
                        <UserMinusIcon style={{ width: '1.25rem', height: '1.25rem' }} /> Suspend User
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleUpdateStatus(user, 'ACTIVE')}
                        className="success"
                      >
                        <CheckCircleIcon style={{ width: '1.25rem', height: '1.25rem' }} /> Activate User
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {user.roles.map(role => (
                  <span key={role} style={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    background: role === 'ADMIN' ? 'rgba(239, 68, 68, 0.1)' : role === 'TEACHER' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                    color: role === 'ADMIN' ? 'var(--danger-400)' : role === 'TEACHER' ? 'var(--brand-400)' : 'var(--success-400)'
                  }}>
                    {role === 'ADMIN' && <ShieldCheckIcon style={{ marginRight: '0.25rem', display: 'inline', width: '1rem', height: '1rem' }} />}
                    {role}
                  </span>
                ))}
                {user.status === 'SUSPENDED' && (
                  <span style={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    background: 'rgba(239, 68, 68, 0.1)',
                    color: 'var(--danger-400)'
                  }}>
                    Suspended
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Enrollments</div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <BookOpenIcon style={{ color: 'var(--brand-400)', width: '1.25rem', height: '1.25rem' }} />
                    {user.enrollmentsCount}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Joined</div>
                  <div style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>
                    {new Date(user.joinedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .dropdown-container:hover .dropdown-menu {
          display: block;
        }
        .dropdown-menu {
          display: none;
          position: absolute;
          right: 0;
          top: 100%;
          min-width: 160px;
          z-index: 10;
          padding: 0.5rem 0;
        }
        .dropdown-menu button:hover {
          background: var(--bg-card-hover) !important;
        }
      `}</style>
    </div>
  );
}
