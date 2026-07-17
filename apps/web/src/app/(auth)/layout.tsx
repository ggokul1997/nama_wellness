import { Navigation } from '@/components/ui/Navigation';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navigation />
      {children}
    </>
  );
}
