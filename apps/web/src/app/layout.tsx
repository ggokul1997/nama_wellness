import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth/session';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { SocketProvider } from '@/components/providers/SocketProvider';
import { DialogProvider } from '@/components/providers/DialogProvider';
import { Toaster } from 'react-hot-toast';

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
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <AuthProvider>
          <SocketProvider>
            <ThemeProvider>
              <DialogProvider>
                <div className="layout-wrapper">
                <Toaster position="top-center" />
                <main className="main-content">
                  {children}
                </main>
                </div>
              </DialogProvider>
            </ThemeProvider>
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
