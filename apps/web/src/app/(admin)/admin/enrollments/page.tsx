'use client';

import { useState, useEffect } from 'react';
import { enrollmentsApi } from '@/lib/api/enrollments';
import { apiFetch } from '@/lib/api/client';
import type { Course } from '@nama/shared';
import { getErrorMessage } from '@/lib/error';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

export default function AdminEnrollmentsPage() {
  const [userEmail, setUserEmail] = useState('');
  const [courseId, setCourseId] = useState('');
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Fetch published courses for the dropdown
    apiFetch<{ courses: Course[] }>('/courses/public').then(res => {
      setCourses(res.data?.courses || []);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userEmail.trim() || !courseId) return;

    try {
      setSubmitting(true);
      setError('');
      setSuccess('');
      
      await enrollmentsApi.adminAssign({ userEmail, courseId });
      
      setSuccess('User successfully enrolled in course!');
      setUserEmail('');
      setCourseId('');
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to assign course'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Manual Course Assignment</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Manually enroll a student in a published course. (e.g. For offline payments, corporate users, or support overrides).</p>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>{error}</div>}
      {success && <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>{success}</div>}

      <form onSubmit={handleSubmit} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '2rem' }}>
        <Input
          label="Student Email Address"
          type="email"
          value={userEmail}
          onChange={e => setUserEmail(e.target.value)}
          placeholder="student@example.com"
          required
          helperText="Enter the registered email address of the student."
        />

        <Select
          label="Select Course"
          value={courseId}
          onChange={e => setCourseId(e.target.value)}
          required
        >
          <option value="">-- Select a Published Course --</option>
          {courses.map(course => (
            <option key={course.id} value={course.id}>{course.title}</option>
          ))}
        </Select>

        <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--surface-border)' }}>
          <Button type="submit" disabled={submitting} fullWidth>
            {submitting ? 'Enrolling...' : 'Enroll User'}
          </Button>
        </div>
      </form>
    </div>
  );
}
