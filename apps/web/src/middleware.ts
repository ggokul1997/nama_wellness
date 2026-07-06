import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require a specific role — checked via stored token in cookies
// Note: Full token verification happens in the API on every request.
// This middleware handles redirects only (UX, not security).

const PUBLIC_PATHS = [
  '/',
  '/courses',
  '/auth/login',
  '/auth/register',
  '/auth/verify-email',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/register/corporate',
];

const ROLE_PATHS: Record<string, string> = {
  '/student': 'STUDENT',
  '/teacher': 'TEACHER',
  '/admin': 'ADMIN',
  '/employee': 'EMPLOYEE',
  '/company-admin': 'COMPANY_ADMIN',
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.next();
  }

  // Allow Next.js internals
  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.includes('.')) {
    return NextResponse.next();
  }

  // Check for auth token in localStorage is not possible in middleware (server-side).
  // We store a lightweight cookie ('nama_auth_role') set by the client after login.
  const authRole = request.cookies.get('nama_auth_role')?.value;

  if (!authRole) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check role-specific paths
  for (const [prefix, requiredRole] of Object.entries(ROLE_PATHS)) {
    if (pathname.startsWith(prefix) && authRole !== requiredRole) {
      // EXCEPTION: Allow anyone authenticated to access /teacher/onboarding to apply
      if (pathname === '/teacher/onboarding') {
        continue;
      }

      // Redirect to the user's own portal dashboard
      const portalEntry = Object.entries(ROLE_PATHS).find(([, role]) => role === authRole);
      if (portalEntry) {
        return NextResponse.redirect(new URL(`${portalEntry[0]}/dashboard`, request.url));
      }
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
