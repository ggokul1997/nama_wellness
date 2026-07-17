import React, { useState, useEffect } from 'react';
import { getTeacherAvailability, getTeacherPricing, createBooking } from '@/lib/api/bookings';
import type { TeacherAvailability, IndividualSessionPricing } from '@nama/shared';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { format, addDays, startOfToday } from 'date-fns';

interface BookingCalendarModalProps {
  teacherId: string;
  onClose: () => void;
}

export function BookingCalendarModal({ teacherId, onClose }: BookingCalendarModalProps) {
  const router = useRouter();
  
  const [availability, setAvailability] = useState<TeacherAvailability[]>([]);
  const [advanceNoticeHours, setAdvanceNoticeHours] = useState<number>(24);
  const [pricing, setPricing] = useState<IndividualSessionPricing[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedPricingId, setSelectedPricingId] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>(''); // format HH:mm
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const [availRes, priceRes] = await Promise.all([
          getTeacherAvailability(teacherId),
          getTeacherPricing(teacherId)
        ]);
        setAvailability(availRes.data?.availability || []);
        setAdvanceNoticeHours(availRes.data?.advanceNoticeHours ?? 24);
        
        const activePricing = (priceRes.data?.pricing || []).filter(p => p.isActive);
        setPricing(activePricing);
        if (activePricing.length > 0) {
          setSelectedPricingId(activePricing[0]?.id || '');
        }
      } catch (err: any) {
        toast.error('Failed to load booking information');
        onClose();
      } finally {
        setLoading(false);
      }
    };
    fetchInfo();
  }, [teacherId, onClose]);

  // Generate available time slots for a given date
  const getAvailableSlotsForDate = (dateStr: string) => {
    if (!dateStr || !selectedPricingId) return [];
    
    const dateObj = new Date(dateStr);
    const dayOfWeek = dateObj.getDay();
    const dayAvail = availability.find(a => a.dayOfWeek === dayOfWeek && a.isAvailable);
    
    if (!dayAvail) return [];
    
    const priceOpt = pricing.find(p => p.id === selectedPricingId);
    if (!priceOpt) return [];
    
    const duration = priceOpt.durationMinutes;
    
    // Parse start and end times
    const [startH, startM] = dayAvail.startTime.split(':').map(Number);
    const [endH, endM] = dayAvail.endTime.split(':').map(Number);
    
    const startMinutes = (startH || 0) * 60 + (startM || 0);
    const endMinutes = (endH || 0) * 60 + (endM || 0);
    
    let alignedStart = startMinutes;
    if (alignedStart % 30 !== 0) {
      alignedStart += 30 - (alignedStart % 30);
    }
    
    const slots = [];
    const minTimeMs = Date.now() + advanceNoticeHours * 60 * 60 * 1000;

    for (let current = alignedStart; current <= endMinutes; current += 30) {
      const h = Math.floor(current / 60);
      const m = current % 60;
      
      const slotTimeMs = new Date(`${dateStr}T${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:00`).getTime();
      
      if (slotTimeMs >= minTimeMs) {
        slots.push({
          time: `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`,
          minutes: current,
          isValidStart: current + duration <= endMinutes
        });
      }
    }
    
    return slots;
  };

  const availableSlots = getAvailableSlotsForDate(selectedDate);

  const handleBook = async () => {
    if (!selectedDate || !selectedTime || !selectedPricingId) {
      toast.error('Please select a date, time, and pricing option');
      return;
    }
    
    try {
      setIsSubmitting(true);
      const scheduledAt = new Date(`${selectedDate}T${selectedTime}:00`).toISOString();
      const res = await createBooking({
        teacherId,
        pricingId: selectedPricingId,
        scheduledAt,
      });
      
      const bookingId = res.data?.booking.id;
      if (bookingId) {
        toast.success('Booking initiated!');
        router.push(`/checkout/booking/${bookingId}`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to create booking');
      setIsSubmitting(false);
    }
  };

  // Generate next 7 days for date selection
  const today = startOfToday();
  const dateOptions = Array.from({ length: 7 }).map((_, i) => addDays(today, i + 1));

  if (loading) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 1001, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        <div className="glass-card" style={{ maxWidth: '500px', width: '100%', padding: '2rem', textAlign: 'center', background: 'var(--surface-bg)' }}>
          <p style={{ color: 'var(--text-muted)' }}>Loading availability...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 1001, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="glass-card" style={{ maxWidth: '500px', width: '100%', padding: '1.5rem', maxHeight: '90vh', overflowY: 'auto', background: 'var(--surface-bg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>Book 1-on-1 Session</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.5rem', cursor: 'pointer', lineHeight: 1 }}>&times;</button>
        </div>

        {pricing.length === 0 || availability.every(a => !a.isAvailable) ? (
          <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
            This teacher is currently not accepting 1-on-1 bookings.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Step 1: Select Duration/Price */}
            <div>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>1. Select Duration</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                {pricing.map(p => (
                  <button
                    key={p.id}
                    onClick={() => { setSelectedPricingId(p.id); setSelectedTime(''); }}
                    style={{
                      padding: '0.75rem',
                      borderRadius: '0.5rem',
                      textAlign: 'left',
                      transition: 'all 0.2s',
                      cursor: 'pointer',
                      border: selectedPricingId === p.id ? '1px solid var(--brand-500)' : '1px solid var(--surface-border)',
                      background: selectedPricingId === p.id ? 'rgba(139,92,246,0.1)' : 'var(--surface-raised)',
                      color: selectedPricingId === p.id ? 'var(--brand-500)' : 'var(--text-secondary)'
                    }}
                  >
                    <div style={{ fontWeight: 700 }}>{p.durationMinutes} mins</div>
                    <div style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>₹{Number(p.amount)}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Select Date */}
            <div>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>2. Select Date</h3>
              <select
                value={selectedDate}
                onChange={(e) => { setSelectedDate(e.target.value); setSelectedTime(''); }}
                className="input"
                style={{ width: '100%' }}
              >
                <option value="">Choose a date...</option>
                {dateOptions.map(date => {
                  const dateString = format(date, 'yyyy-MM-dd');
                  const slotsForThisDate = getAvailableSlotsForDate(dateString).filter(s => s.isValidStart);
                  if (slotsForThisDate.length === 0) return null;
                  
                  return (
                    <option key={dateString} value={dateString}>
                      {format(date, 'EEEE, MMM d')}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Step 3: Select Time */}
            {selectedDate && (
              <div>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>3. Select Time</h3>
                {availableSlots.filter(s => s.isValidStart).length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No available slots on this date.</p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                    {availableSlots.map(slot => {
                      let isHighlighted = false;
                      if (selectedTime) {
                        const parts = selectedTime.split(':').map(Number);
                        const sh = parts[0] || 0;
                        const sm = parts[1] || 0;
                        const selectedMins = sh * 60 + sm;
                        const priceOpt = pricing.find(p => p.id === selectedPricingId);
                        const dur = priceOpt ? priceOpt.durationMinutes : 0;
                        if (slot.minutes >= selectedMins && slot.minutes <= selectedMins + dur) {
                          isHighlighted = true;
                        }
                      }
                      
                      return (
                        <button
                          key={slot.time}
                          disabled={!slot.isValidStart && !isHighlighted}
                          onClick={() => {
                            if (slot.isValidStart) setSelectedTime(slot.time);
                          }}
                          style={{
                            padding: '0.5rem',
                            textAlign: 'center',
                            borderRadius: '0.5rem',
                            transition: 'all 0.2s',
                            cursor: slot.isValidStart ? 'pointer' : 'default',
                            border: isHighlighted ? '1px solid var(--brand-500)' : '1px solid var(--surface-border)',
                            background: isHighlighted ? 'var(--brand-500)' : 'var(--surface-raised)',
                            color: isHighlighted ? 'white' : 'var(--text-secondary)',
                            opacity: (!slot.isValidStart && !isHighlighted) ? 0.3 : 1
                          }}
                        >
                          {slot.time}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            <div style={{ paddingTop: '1.5rem', marginTop: '0.5rem', borderTop: '1px solid var(--surface-border)' }}>
              <button
                onClick={handleBook}
                disabled={!selectedDate || !selectedTime || !selectedPricingId || isSubmitting}
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '1rem', fontSize: '1rem', opacity: (!selectedDate || !selectedTime || !selectedPricingId || isSubmitting) ? 0.5 : 1 }}
              >
                {isSubmitting ? 'Booking...' : 'Continue to Payment'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
