import { QueryProvider } from '@/providers/QueryProvider';
import { Navigation } from '@/components/ui/Navigation';

// Public layout
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <Navigation />
      {children}
    </QueryProvider>
  );
}
