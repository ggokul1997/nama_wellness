'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { coursesApi } from '@/lib/api/courses';
import { paymentsApi } from '@/lib/api/payments';
import { enrollmentsApi } from '@/lib/api/enrollments';
import type { Course } from '@nama/shared';
import Script from 'next/script';
import { useAuth } from '@/lib/auth/session';

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const courseId = params.courseId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await coursesApi.getPublicCourseById(courseId);
        const fetchedCourse = res.data?.course;
        if (fetchedCourse) {
          setCourse(fetchedCourse);
          
          // Verify they aren't already enrolled
          if (user) {
            try {
              const res = await enrollmentsApi.getCourseProgress(fetchedCourse.id);
              if (res.data?.enrollment) {
                // If successful, they are enrolled! Redirect them.
                router.replace(`/student/courses/${fetchedCourse.slug}/learn`);
                return; // Stop loading state from clearing, let it redirect
              }
            } catch (e) {
              // API failed
            }
          }
        } else {
          setError('Course not found');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load course');
      } finally {
        setLoading(false);
      }
    };
    if (!authLoading) {
      fetchCourse();
    }
  }, [courseId, user, authLoading, router]);

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    setError('');
    try {
      const res = await paymentsApi.createOrder(courseId);
      
      if (!res.data?.orderId) {
        setError('Failed to initiate checkout. Please try again.');
        setCheckoutLoading(false);
        return;
      }

      const { orderId, amount, currency } = res.data;

      // Handle Free Courses
      if (orderId === 'FREE' || amount === 0) {
        router.push(`/checkout/success?session_id=free_${courseId}`);
        return;
      }

      // Initialize Razorpay Modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: amount, // Amount in paise
        currency: currency,
        name: 'Nama Wellness',
        description: `Purchase: ${course?.title}`,
        order_id: orderId,
        handler: async function (response: any) {
          // Razorpay returns razorpay_payment_id, razorpay_order_id, razorpay_signature on success
          setCheckoutLoading(true);
          try {
            await paymentsApi.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            router.push(`/checkout/success?session_id=${response.razorpay_order_id}`);
          } catch (err: any) {
            setError(err.message || 'Payment verification failed');
            setCheckoutLoading(false);
          }
        },
        prefill: {
          email: user?.email || '',
          contact: '9999999999' // Dummy contact helps Razorpay show mobile-friendly payment methods like UPI
        },
        theme: {
          color: '#3399cc',
        },
        config: {
          display: {
            blocks: {
              upi: {
                name: 'Pay using UPI',
                instruments: [
                  {
                    method: 'upi'
                  }
                ]
              },
              other: {
                name: 'Other Payment Modes',
                instruments: [
                  { method: 'card' },
                  { method: 'netbanking' },
                  { method: 'wallet' }
                ]
              }
            },
            sequence: ['block.upi', 'block.other'],
            preferences: {
              show_default_blocks: true,
            }
          }
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
  if (error || !course) return <div style={{ padding: '4rem', textAlign: 'center', color: 'red' }}>{error || 'Course not found'}</div>;

  const currentPrice = course.pricings?.find((p: any) => p.isCurrent);
  const priceAmount = currentPrice ? parseFloat(currentPrice.amount.toString()) : 0;
  const isFree = priceAmount === 0;

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div style={{ maxWidth: '800px', margin: '4rem auto', padding: '0 1rem', minHeight: '80vh' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '2rem', color: 'var(--text-primary)' }}>Secure Checkout</h1>

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
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', padding: '1.5rem', background: 'var(--surface-raised)', borderRadius: '12px', border: '1px solid var(--surface-border)' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>Total Due</span>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--brand-500)' }}>
              {isFree ? 'Free' : `₹${priceAmount}`}
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
            {checkoutLoading ? 'Processing...' : (isFree ? 'Enroll for Free' : 'Proceed to Payment')}
          </button>
        </div>
      </div>
    </>
  );
}
