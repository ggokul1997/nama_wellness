'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/session';
import { getTeacherPricing, createTeacherPricing, updateTeacherPricing } from '@/lib/api/bookings';
import { IndividualSessionPricing } from '@nama/shared';
import { toast } from 'react-hot-toast';
import { PlusIcon, PencilIcon } from '@heroicons/react/24/outline';

export default function TeacherPricingPage() {
  const { user } = useAuth();
  const [pricingList, setPricingList] = useState<IndividualSessionPricing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Add/Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{durationMinutes: number; amount: number | string; isActive: boolean}>({ durationMinutes: 30, amount: 0, isActive: true });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadPricing();
    }
  }, [user]);

  const loadPricing = async () => {
    try {
      setIsLoading(true);
      const res = await getTeacherPricing(user!.id);
      setPricingList(res.data?.pricing || []);
    } catch (err: any) {
      toast.error('Failed to load pricing');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (pricing?: IndividualSessionPricing) => {
    if (pricing) {
      setEditingId(pricing.id);
      setFormData({
        durationMinutes: pricing.durationMinutes,
        amount: Number(pricing.amount),
        isActive: pricing.isActive
      });
    } else {
      setEditingId(null);
      setFormData({ durationMinutes: 30, amount: '', isActive: true });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const payload = {
        durationMinutes: formData.durationMinutes,
        amount: Number(formData.amount),
        isActive: formData.isActive
      };
      
      if (editingId) {
        await updateTeacherPricing(editingId, payload);
        toast.success('Pricing updated');
      } else {
        await createTeacherPricing({ ...payload, currency: 'INR' });
        toast.success('Pricing added');
      }
      setIsModalOpen(false);
      loadPricing();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save pricing');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await updateTeacherPricing(id, { isActive: !currentStatus });
      loadPricing();
    } catch (err: any) {
      toast.error('Failed to update status');
    }
  };

  if (isLoading) {
    return <div className="page-content text-center p-8 text-muted">Loading pricing...</div>;
  }

  return (
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>1-on-1 Session Pricing</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', maxWidth: '800px' }}>
            Define durations and prices for your 1-on-1 coaching sessions. Students will select one of these options when booking you.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <PlusIcon style={{ width: '1.25rem', height: '1.25rem' }} />
          Add Pricing
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
        {pricingList.map(pricing => (
          <div key={pricing.id} className="glass-card" style={{ padding: '1.5rem', opacity: pricing.isActive ? 1 : 0.6, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>{pricing.durationMinutes} Minutes</h3>
                <p style={{ fontSize: '1.875rem', fontWeight: 900, color: 'var(--brand-500)', marginTop: '0.5rem' }}>
                  ₹{Number(pricing.amount).toLocaleString()}
                </p>
              </div>
              <div>
                <button
                  onClick={() => handleOpenModal(pricing)}
                  className="btn btn-ghost"
                  style={{ padding: '0.5rem' }}
                  title="Edit Pricing"
                >
                  <PencilIcon style={{ width: '1.25rem', height: '1.25rem' }} />
                </button>
              </div>
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Status</span>
              <label style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  style={{ opacity: 0, position: 'absolute', width: 0, height: 0 }}
                  checked={pricing.isActive}
                  onChange={() => toggleActive(pricing.id, pricing.isActive)}
                />
                <div style={{
                  width: '36px', height: '20px', 
                  background: pricing.isActive ? 'var(--brand-500)' : 'var(--surface-hover)', 
                  borderRadius: '999px',
                  position: 'relative',
                  transition: 'background 0.3s'
                }}>
                  <div style={{
                    content: '""',
                    position: 'absolute',
                    top: '2px',
                    left: pricing.isActive ? '18px' : '2px',
                    width: '16px',
                    height: '16px',
                    background: 'white',
                    borderRadius: '50%',
                    transition: 'left 0.3s'
                  }}></div>
                </div>
                <span style={{ marginLeft: '0.75rem', fontSize: '0.875rem', fontWeight: 500, color: pricing.isActive ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                  {pricing.isActive ? 'Active' : 'Inactive'}
                </span>
              </label>
            </div>
          </div>
        ))}
        {pricingList.length === 0 && (
          <div style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)', border: '1px dashed var(--surface-border)', borderRadius: 'var(--radius-xl)' }}>
            You haven't set up any pricing options yet.
          </div>
        )}
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-card" style={{ maxWidth: '400px', width: '100%', padding: '1.5rem', boxShadow: 'var(--shadow-lg)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
              {editingId ? 'Edit Pricing Option' : 'New Pricing Option'}
            </h2>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="label">
                  Duration (Minutes)
                </label>
                <select
                  required
                  value={formData.durationMinutes}
                  onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) })}
                  className="input"
                >
                  <option value={15}>15 Minutes</option>
                  <option value={30}>30 Minutes</option>
                  <option value={45}>45 Minutes</option>
                  <option value={60}>60 Minutes</option>
                  <option value={90}>90 Minutes</option>
                  <option value={120}>120 Minutes</option>
                </select>
              </div>

              <div>
                <label className="label">
                  Price (INR)
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>₹</span>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value === '' ? '' : parseFloat(e.target.value) })}
                    className="input"
                    style={{ paddingLeft: '2rem' }}
                    placeholder="500"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-ghost"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="btn btn-primary"
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
