'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/session';
import { getTeacherAvailability, updateTeacherAvailability } from '@/lib/api/bookings';

import { toast } from 'react-hot-toast';

const DAYS_OF_WEEK = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

export default function TeacherAvailabilityPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // We'll manage a local state of slots to edit easily
  const [slots, setSlots] = useState<{ dayOfWeek: number; startTime: string; endTime: string; isAvailable: boolean }[]>([]);
  const [advanceNoticeHours, setAdvanceNoticeHours] = useState<number | ''>(24);

  useEffect(() => {
    if (user?.id) {
      loadAvailability();
    }
  }, [user]);

  const loadAvailability = async () => {
    try {
      setIsLoading(true);
      const res = await getTeacherAvailability(user!.id);
      
      // Initialize slots, ensuring all 7 days have at least one entry
      const apiSlots = res.data?.availability || [];
      setAdvanceNoticeHours(res.data?.advanceNoticeHours ?? 24);
      const initialSlots = DAYS_OF_WEEK.map((_, index) => {
        const existing = apiSlots.find(s => s.dayOfWeek === index);
        if (existing) {
          return { dayOfWeek: index, startTime: existing.startTime, endTime: existing.endTime, isAvailable: existing.isAvailable };
        }
        return { dayOfWeek: index, startTime: '09:00', endTime: '17:00', isAvailable: false };
      });

      setSlots(initialSlots);
    } catch (err: any) {
      toast.error('Failed to load availability');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      // Only send available slots or all slots? API accepts an array, we'll send all so teacher can toggle
      const finalNoticeHours = advanceNoticeHours === '' ? 0 : advanceNoticeHours;
      await updateTeacherAvailability({ slots, advanceNoticeHours: finalNoticeHours });
      toast.success('Availability updated successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save availability');
    } finally {
      setIsSaving(false);
    }
  };

  const updateSlot = (dayOfWeek: number, field: string, value: any) => {
    setSlots(prev => prev.map(s => {
      if (s.dayOfWeek === dayOfWeek) {
        return { ...s, [field]: value };
      }
      return s;
    }));
  };

  if (isLoading) {
    return <div className="page-content text-center p-8 text-muted">Loading availability...</div>;
  }

  return (
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>My Availability</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', maxWidth: '800px' }}>
          Set your weekly recurring availability for 1-on-1 sessions. Students will only be able to book you during these hours. Times are in your local timezone.
        </p>
      </div>

      <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Booking Preferences</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem' }}>
          <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Advance Notice Required (Hours):</label>
          <input 
            type="number" 
            min="0" 
            max="168" 
            value={advanceNoticeHours} 
            onChange={(e) => {
              const val = e.target.value;
              setAdvanceNoticeHours(val === '' ? '' : parseInt(val));
            }}
            className="input"
            style={{ width: '120px' }}
          />
          <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>How much lead time you need before a session.</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {DAYS_OF_WEEK.map((day, index) => {
          const slot = slots.find(s => s.dayOfWeek === index);
          if (!slot) return null;

          return (
            <div key={index} className="glass-card availability-card">
              <div className="availability-day">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={slot.isAvailable}
                    onChange={(e) => updateSlot(index, 'isAvailable', e.target.checked)}
                    style={{ width: '1.25rem', height: '1.25rem', accentColor: 'var(--brand-500)', cursor: 'pointer' }}
                  />
                  <span style={{ fontWeight: 600, color: slot.isAvailable ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                    {day}
                  </span>
                </label>
              </div>

              <div className="availability-times" style={{ opacity: slot.isAvailable ? 1 : 0.4 }}>
                <div className="availability-time-block">
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>From</span>
                  <input 
                    type="time" 
                    value={slot.startTime}
                    onChange={(e) => updateSlot(index, 'startTime', e.target.value)}
                    className="input"
                    style={{ width: '120px' }}
                    disabled={!slot.isAvailable}
                    step={1800}
                  />
                </div>
                <div className="availability-time-block">
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>To</span>
                  <input 
                    type="time" 
                    value={slot.endTime}
                    onChange={(e) => updateSlot(index, 'endTime', e.target.value)}
                    className="input"
                    style={{ width: '120px' }}
                    disabled={!slot.isAvailable}
                    step={1800}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="btn btn-primary"
        >
          {isSaving ? 'Saving...' : 'Save Availability'}
        </button>
      </div>
    </div>
  );
}
