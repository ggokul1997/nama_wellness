import { QueryProvider } from '@/providers/QueryProvider';

// Public layout — no sidebar, just the page content
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <QueryProvider>{children}</QueryProvider>;
}
