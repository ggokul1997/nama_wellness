'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { coursesApi } from '@/lib/api/courses';
import { paymentsApi } from '@/lib/api/payments';
import type { Course } from '@nama/shared';
import { getErrorMessage } from '@/lib/error';
import { useAuth } from '@/lib/auth/session';
import Script from 'next/script';

export default function CorporateCheckoutPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = React.use(params);
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [seats, setSeats] = useState(1);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await coursesApi.getCorporateCourses();
        const availableCourses = res.data?.courses || [];
        const found = availableCourses.find(c => c.id === courseId);
        if (found) {
          setCourse(found);
        } else {
          setError('Course not found or not available for corporate purchase.');
        }
      } catch (err: unknown) {
        setError(getErrorMessage(err, 'Failed to load course details'));
      } finally {
        setLoading(false);
      }
    };
    if (!authLoading && courseId) {
      fetchCourse();
    }
  }, [courseId, authLoading]);

  const handleCheckout = async () => {
    if (seats <= 0) {
      setError('Please select a valid number of seats.');
      return;
    }

    setCheckoutLoading(true);
    setError('');
    
    try {
      const res = await paymentsApi.createB2BOrder({ courseId, seats });
      
      if (!res.data?.orderId) {
        setError('Failed to initiate checkout. Please try again.');
        setCheckoutLoading(false);
        return;
      }

      const { orderId, amount, currency } = res.data;

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: amount, 
        currency: currency,
        name: 'Nama Wellness Corporate',
        description: `B2B License: ${course?.title} (${seats} seats)`,
        order_id: orderId,
        handler: async function (response: any) {
          setCheckoutLoading(true);
          try {
            await paymentsApi.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            router.push('/company-admin/licenses');
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
          color: '#8b5cf6',
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
      setError(getErrorMessage(err, 'Failed to initiate checkout'));
      setCheckoutLoading(false);
    }
  };

  if (loading) return <div style={{ padding: '4rem', textAlign: 'center' }}>Loading checkout...</div>;
  if (error || !course) return <div style={{ padding: '4rem', textAlign: 'center', color: 'red' }}>{error || 'Course not found'}</div>;

  const priceAmount = course.corporatePrice ? parseFloat(course.corporatePrice.toString()) : 0;
  const totalDue = priceAmount * seats;

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className="page-content" style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1rem' }}>
        <button 
          onClick={() => router.push('/company-admin/licenses')} 
          className="btn btn-secondary btn-sm" 
          style={{ marginBottom: '2rem' }}
        >
          &larr; Back to Licenses
        </button>
        
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '2rem', color: 'var(--text-primary)' }}>Purchase Licenses</h1>

        <div className="glass-card" style={{ padding: '2.5rem' }}>
          <div style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '2.5rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
            {course.coverImageUrl ? (
              <img 
                src={course.coverImageUrl} 
                alt={course.title}
                style={{ width: '240px', height: '160px', objectFit: 'cover', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}
              />
            ) : (
              <div style={{ width: '240px', height: '160px', background: 'var(--surface-raised)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                No Cover Image
              </div>
            )}
            <div style={{ flex: 1, minWidth: '250px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>{course.title}</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.6 }}>{course.description}</p>
              
              <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--brand-500)' }}>
                ₹{priceAmount} <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 400 }}>per seat</span>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
              Number of Seats
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button 
                onClick={() => setSeats(Math.max(1, seats - 1))} 
                className="btn btn-secondary" 
                style={{ width: '48px', height: '48px', fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '0.5rem', background: 'var(--surface-hover)' }}
              >
                -
              </button>
              <input 
                type="number" 
                min="1" 
                value={seats} 
                onChange={(e) => setSeats(Math.max(1, parseInt(e.target.value) || 1))}
                className="input-field" 
                style={{ width: '100px', height: '48px', fontSize: '1.25rem', textAlign: 'center', margin: 0, fontWeight: 600 }}
              />
              <button 
                onClick={() => setSeats(seats + 1)} 
                className="btn btn-secondary" 
                style={{ width: '48px', height: '48px', fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '0.5rem', background: 'var(--surface-hover)' }}
              >
                +
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', padding: '1.5rem', background: 'var(--surface-raised)', borderRadius: '12px', border: '1px solid var(--surface-border)' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>Total Due</span>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--brand-500)' }}>
              ₹{totalDue}
            </span>
          </div>

          <button
            onClick={handleCheckout}
            disabled={checkoutLoading}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '1.25rem',
              fontSize: '1.125rem',
              fontWeight: 600,
              cursor: checkoutLoading ? 'not-allowed' : 'pointer',
              opacity: checkoutLoading ? 0.7 : 1
            }}
          >
            {checkoutLoading ? 'Processing...' : 'Proceed to Checkout'}
          </button>
        </div>
      </div>
    </>
  );
}
