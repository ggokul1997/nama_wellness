'use client';

import { useState, useEffect } from 'react';
import { companiesApi } from '@/lib/api/companies';
import { getErrorMessage } from '@/lib/error';
import type { CompanyEmployee } from '@nama/shared';
import { useDialog } from '@/components/providers/DialogProvider';

export default function CompanyEmployeesPage() {
  const dialog = useDialog();
  const [employees, setEmployees] = useState<CompanyEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await companiesApi.getEmployees();
      setEmployees(res.data?.employees || []);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to load employees'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleInvite = async () => {
    const email = await dialog.prompt({ 
      title: 'Invite Employee', 
      message: 'Enter employee email to invite:',
      placeholder: 'employee@company.com'
    });
    if (!email) return;

    try {
      await companiesApi.inviteEmployee(email);
      await dialog.alert({ title: 'Notification', message: `Successfully invited ${email}` });
      fetchEmployees();
    } catch (err: unknown) {
      await dialog.alert({ title: 'Notification', message: getErrorMessage(err, 'Failed to invite employee') });
    }
  };

  const handleDelete = async (userId: string, email: string) => {
    const confirmed = await dialog.confirm({ title: 'Confirm', message: `Are you sure you want to delete the employee ${email}? This action is permanent and will restore any consumed licenses.`, isDestructive: true, confirmText: 'Delete' });
    if (!confirmed) {
      return;
    }
    
    try {
      await companiesApi.deleteEmployee(userId);
      await dialog.alert({ title: 'Notification', message: `Successfully deleted ${email}` });
      fetchEmployees();
    } catch (err: unknown) {
      await dialog.alert({ title: 'Notification', message: getErrorMessage(err, 'Failed to delete employee') });
    }
  };

  if (loading) {
    return (
      <div className="page-content" style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
        <div style={{ color: 'var(--text-secondary)' }}>Loading employees...</div>
      </div>
    );
  }

  return (
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>Employees</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Manage your team and invite new employees.
          </p>
        </div>
        <button onClick={handleInvite} className="btn btn-primary">
          Invite Employee
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="glass-card" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>Team Members</h2>
        
        {employees.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No employees found.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {employees.map(emp => {
              const isPending = (emp.user as any)?.passwordHash === 'invitation-pending';
              
              return (
                <div key={emp.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: 'var(--surface-hover)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {emp.user?.profile?.firstName} {emp.user?.profile?.lastName}
                      </h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                        {emp.user?.email}
                      </p>
                    </div>
                    <div>
                      {isPending ? (
                        <span style={{ background: 'var(--warning-bg)', color: 'var(--warning)', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 600 }}>
                          Pending
                        </span>
                      ) : (
                        <span style={{ background: 'var(--success-bg)', color: 'var(--success)', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 600 }}>
                          Joined
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--surface-border)' }}>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                      Joined: {new Date(emp.joinedAt).toLocaleDateString()}
                    </div>
                    <button 
                      onClick={() => handleDelete(emp.userId, emp.user?.email || '')} 
                      className="btn btn-ghost btn-sm"
                      style={{ color: 'var(--error)' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
