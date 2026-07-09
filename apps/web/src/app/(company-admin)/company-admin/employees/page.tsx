'use client';

import { useState, useEffect } from 'react';
import { companiesApi } from '@/lib/api/companies';
import { getErrorMessage } from '@/lib/error';
import type { CompanyEmployee } from '@nama/shared';

export default function CompanyEmployeesPage() {
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
    const email = prompt('Enter employee email to invite:');
    if (!email) return;

    try {
      await companiesApi.inviteEmployee(email);
      alert(`Successfully invited ${email}`);
      fetchEmployees();
    } catch (err: unknown) {
      alert(getErrorMessage(err, 'Failed to invite employee'));
    }
  };

  const handleDelete = async (userId: string, email: string) => {
    if (!confirm(`Are you sure you want to delete the employee ${email}? This action is permanent and will restore any consumed licenses.`)) {
      return;
    }
    
    try {
      await companiesApi.deleteEmployee(userId);
      alert(`Successfully deleted ${email}`);
      fetchEmployees();
    } catch (err: unknown) {
      alert(getErrorMessage(err, 'Failed to delete employee'));
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr', padding: '0.75rem 1rem', borderBottom: '1px solid var(--surface-border)', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 600 }}>
              <div>Name</div>
              <div>Email</div>
              <div>Joined</div>
              <div>Status</div>
              <div style={{ textAlign: 'right' }}>Actions</div>
            </div>
            {employees.map(emp => {
              const isPending = (emp.user as any)?.passwordHash === 'invitation-pending';
              
              return (
                <div key={emp.id} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr', padding: '1rem', alignItems: 'center', background: 'var(--surface-hover)', borderRadius: '0.5rem' }}>
                  <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                    {emp.user?.profile?.firstName} {emp.user?.profile?.lastName}
                  </div>
                  <div style={{ color: 'var(--text-secondary)' }}>
                    {emp.user?.email}
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    {new Date(emp.joinedAt).toLocaleDateString()}
                  </div>
                  <div>
                    {isPending ? (
                      <span style={{ background: 'var(--warning-bg)', color: 'var(--warning)', padding: '0.25rem 0.5rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 600 }}>
                        Pending
                      </span>
                    ) : (
                      <span style={{ background: 'var(--success-bg)', color: 'var(--success)', padding: '0.25rem 0.5rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 600 }}>
                        Joined
                      </span>
                    )}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <button 
                      onClick={() => handleDelete(emp.userId, emp.user?.email || '')} 
                      className="btn btn-secondary btn-sm"
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
