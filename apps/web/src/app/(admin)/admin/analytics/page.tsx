'use client';

import { useState, useEffect } from 'react';
import { analyticsApi } from '@/lib/api/analytics';
import type { AdminAnalyticsResponse } from '@nama/shared';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

export default function AdminAnalytics() {
  const [data, setData] = useState<AdminAnalyticsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await analyticsApi.getAnalytics(days);
        if (response.success && response.data) {
          setData(response.data);
        }
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [days]);

  if (isLoading && !data) {
    return <div className="page-content"><p>Loading analytics...</p></div>;
  }

  if (!data) return null;

  return (
    <div className="page-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>Analytics & Reporting 📊</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.375rem' }}>Deep insights into platform growth and revenue.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {[7, 30, 365].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`btn ${days === d ? 'btn-primary' : 'btn-outline'}`}
            >
              {d === 365 ? '12 Months' : `${d} Days`}
            </button>
          ))}
        </div>
      </div>

      {/* Revenue Over Time */}
      <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>Revenue Trends (₹)</h3>
        <div style={{ height: 300, width: '100%' }}>
          <ResponsiveContainer>
            <AreaChart data={data.revenue} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorStandard" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorCorporate" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorBooking" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--surface-border-strong)" />
              <XAxis dataKey="date" stroke="var(--text-muted)" tick={{fill: 'var(--text-muted)'}} />
              <YAxis stroke="var(--text-muted)" tick={{fill: 'var(--text-muted)'}} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--surface-base)', borderColor: 'var(--surface-border)' }}
                itemStyle={{ color: 'var(--text-primary)' }}
              />
              <Legend />
              <Area type="monotone" dataKey="standardRevenue" name="B2C Revenue" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorStandard)" />
              <Area type="monotone" dataKey="corporateRevenue" name="B2B Revenue" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorCorporate)" />
              <Area type="monotone" dataKey="bookingRevenue" name="1-on-1 Sessions" stroke="#f59e0b" fillOpacity={1} fill="url(#colorBooking)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        {/* User Growth */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>User Growth</h3>
          <div style={{ height: 300, width: '100%' }}>
            <ResponsiveContainer>
              <BarChart data={data.userGrowth} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--surface-border-strong)" />
                <XAxis dataKey="date" stroke="var(--text-muted)" tick={{fill: 'var(--text-muted)'}} />
                <YAxis stroke="var(--text-muted)" tick={{fill: 'var(--text-muted)'}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--surface-base)', borderColor: 'var(--surface-border)' }}
                  cursor={{fill: 'var(--surface-border)'}}
                />
                <Legend />
                <Bar dataKey="students" name="Students" stackId="a" fill="#38bdf8" />
                <Bar dataKey="corporateClients" name="Corporate Clients" stackId="a" fill="#a78bfa" />
                <Bar dataKey="teachers" name="Teachers" stackId="a" fill="#fbbf24" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Courses */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Top Performing Courses</h3>
          <div className="table-responsive">
            <table className="data-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--surface-border)' }}>
                  <th style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Course</th>
                  <th style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Enrollments</th>
                  <th style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Rating</th>
                  <th style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {data.topCourses.map((c) => (
                  <tr key={c.courseId} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                    <td style={{ padding: '0.75rem' }}>
                      <div style={{ fontWeight: 600 }}>{c.title}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{c.teacherName}</div>
                    </td>
                    <td style={{ padding: '0.75rem' }}>{c.enrollmentCount}</td>
                    <td style={{ padding: '0.75rem' }}>{c.averageRating > 0 ? `⭐ ${c.averageRating}` : '—'}</td>
                    <td style={{ padding: '0.75rem', color: 'var(--brand-500)', fontWeight: 600 }}>₹{c.totalRevenue.toLocaleString()}</td>
                  </tr>
                ))}
                {data.topCourses.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No published courses yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
