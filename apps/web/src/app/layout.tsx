import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth/session';
import { Navigation } from '@/components/ui/Navigation';

export const metadata: Metadata = {
  title: {
    default: 'Nama Wellness — Learn, Teach, Thrive',
    template: '%s | Nama Wellness',
  },
  description:
    'A wellness and learning marketplace connecting students, teachers, and organizations through live and recorded experiences in yoga, meditation, music, arts, and more.',
  keywords: ['wellness', 'yoga', 'meditation', 'online learning', 'courses', 'teachers'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <AuthProvider>
          <div className="layout-wrapper">
            <Navigation />
            
            <main className="main-content">
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
