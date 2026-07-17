'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { paymentsApi } from '@/lib/api/payments';
import { getMyBookings } from '@/lib/api/bookings';
import type { IndividualSessionBooking } from '@nama/shared';
import Script from 'next/script';
import { useAuth } from '@/lib/auth/session';
import { format } from 'date-fns';

export default function BookingCheckoutPage({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = use(params);
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [booking, setBooking] = useState<IndividualSessionBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await getMyBookings();
        const found = res.data?.bookings?.find(b => b.id === bookingId);
        
        if (found) {
          if (found.status === 'CONFIRMED' || found.status === 'COMPLETED') {
            router.replace('/student/bookings');
            return;
          }
          setBooking(found);
        } else {
          setError('Booking not found');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load booking');
      } finally {
        setLoading(false);
      }
    };
    if (!authLoading && user) {
      fetchBooking();
    } else if (!authLoading && !user) {
      router.push(`/login?redirect=/checkout/booking/${bookingId}`);
    }
  }, [bookingId, user, authLoading, router]);

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    setError('');
    try {
      const res = await paymentsApi.createBookingOrder(bookingId);
      
      if (!res.data?.orderId) {
        setError('Failed to initiate checkout. Please try again.');
        setCheckoutLoading(false);
        return;
      }

      const { orderId, amount, currency } = res.data;

      // Handle Free Bookings
      if (orderId === 'FREE' || amount === 0) {
        router.push(`/student/bookings`);
        return;
      }

      // Initialize Razorpay Modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: amount, // Amount in paise
        currency: currency,
        name: 'Nama Wellness',
        description: `1-on-1 Session with Teacher`,
        order_id: orderId,
        handler: async function (response: any) {
          setCheckoutLoading(true);
          try {
            await paymentsApi.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            router.push(`/student/bookings`);
          } catch (err: any) {
            setError(err.message || 'Payment verification failed');
            setCheckoutLoading(false);
          }
        },
        prefill: {
          email: user?.email || '',
          contact: '9999999999'
        },
        theme: {
          color: '#34d399',
        },
        modal: {
          ondismiss: async function() {
            setCheckoutLoading(false);
            if (orderId) {
              try { await paymentsApi.cancelOrder(orderId); } catch(e) {}
            }
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', async function (response: any){
        setError(response.error.description || 'Payment Failed');
        setCheckoutLoading(false);
        if (orderId) {
          try { await paymentsApi.cancelOrder(orderId); } catch(e) {}
        }
      });
      rzp.open();
    } catch (err: any) {
      setError(err.message || 'Failed to initiate checkout');
      setCheckoutLoading(false);
    }
  };

  if (loading) return <div style={{ padding: '4rem', textAlign: 'center' }}>Loading checkout...</div>;
  if (error || !booking) return <div style={{ padding: '4rem', textAlign: 'center', color: 'red' }}>{error || 'Booking not found'}</div>;

  const currentPrice = booking.pricing;
  const priceAmount = currentPrice ? parseFloat(currentPrice.amount.toString()) : 0;
  const isFree = priceAmount === 0;

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div style={{ maxWidth: '800px', margin: '4rem auto', padding: '0 1rem', minHeight: '80vh' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '2rem', color: 'var(--text-primary)' }}>Complete Booking</h1>

        <div className="glass-card" style={{ padding: '2.5rem' }}>
          <div style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '2.5rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '250px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
                1-on-1 Session
              </h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', lineHeight: 1.6 }}>
                Teacher ID: {booking.teacherId}
              </p>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', lineHeight: 1.6 }}>
                Scheduled for: <strong>{format(new Date(booking.scheduledAt), 'PPp')}</strong>
              </p>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', lineHeight: 1.6 }}>
                Duration: {booking.durationMinutes} mins
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem', padding: '1.5rem', background: 'var(--surface-active)', borderRadius: '12px', border: '1px solid var(--surface-border)' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>Total Due</span>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--brand-500)' }}>
              {isFree ? 'Free' : `₹${priceAmount}`}
            </span>
          </div>

          <button
            onClick={handleCheckout}
            disabled={checkoutLoading}
            className="btn btn-primary w-full text-center"
            style={{
              padding: '1.25rem',
              fontSize: '1.125rem',
              cursor: checkoutLoading ? 'not-allowed' : 'pointer',
              opacity: checkoutLoading ? 0.7 : 1,
              display: 'block'
            }}
          >
            {checkoutLoading ? 'Processing...' : (isFree ? 'Confirm Booking' : 'Proceed to Payment')}
          </button>
        </div>
      </div>
    </>
  );
}
