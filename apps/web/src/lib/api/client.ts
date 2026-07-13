import type { ApiResponse } from '@nama/shared';

const isBrowser = typeof window !== 'undefined';
// Server components need an absolute URL. Client components should use the relative Next.js rewrite to avoid cross-origin SameSite=Lax cookie drops.
const API_URL = isBrowser 
  ? '/api/v1' 
  : (process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000/api/v1');

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number,
    public details?: Record<string, string[]>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Retrieves the stored access token from cookies if on the server
async function getServerAccessToken(): Promise<string | null> {
  if (typeof window === 'undefined') {
    try {
      const { cookies } = await import('next/headers');
      const cookieStore = await cookies();
      return cookieStore.get('nama_access_token')?.value || null;
    } catch {
      return null;
    }
  }
  return null;
}

interface FetchOptions extends RequestInit {
  auth?: boolean; // attach Bearer token (default: true if token exists)
  absoluteUrl?: boolean; // force absolute URL (bypassing proxy) to receive Set-Cookie
}

export async function apiFetch<T>(
  path: string,
  options: FetchOptions = {},
): Promise<ApiResponse<T>> {
  const { auth = true, absoluteUrl = false, ...init } = options;

  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');

  if (auth) {
    const token = await getServerAccessToken();
    if (token) {
      headers.set('Cookie', `nama_access_token=${token}`);
    }
    init.cache = init.cache || 'no-store';
  }

  // Force cache bust for authenticated requests in the browser
  let finalPath = path;
  if (auth && isBrowser) {
    const separator = path.includes('?') ? '&' : '?';
    finalPath = `${path}${separator}_t=${Date.now()}`;
  }

  if (process.env.NODE_ENV === 'development') {
    console.log(`[DEBUG] apiFetch starting for ${path}`, { auth, finalPath, isBrowser, cookies: isBrowser ? document.cookie : 'server' });
  }

  const baseUrl = absoluteUrl ? (process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000/api/v1') : API_URL;

  const response = await fetch(`${baseUrl}${finalPath}`, {
    ...init,
    credentials: 'include',
    headers,
  });

  const data = (await response.json()) as ApiResponse<T>;
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`[DEBUG] apiFetch completed for ${path}`, { status: response.status, success: data.success, data });
  }

  if (!data.success) {
    // Automatic token refresh interceptor for client-side requests
    if (response.status === 401 && isBrowser && path !== '/auth/refresh' && path !== '/auth/login' && auth) {
      try {
        console.log(`[AUTH] Token expired, attempting refresh for ${path}...`);
        // Call the refresh endpoint
        const refreshRes = await fetch(`${baseUrl}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (refreshRes.ok) {
          console.log(`[AUTH] Refresh successful, retrying original request...`);
          // Retry the original request
          const retryResponse = await fetch(`${baseUrl}${finalPath}`, {
            ...init,
            credentials: 'include',
            headers,
          });
          const retryData = (await retryResponse.json()) as ApiResponse<T>;
          if (retryData.success) {
            return retryData;
          }
        }
      } catch (err) {
        console.error('[AUTH] Silent refresh failed', err);
      }
      // If refresh fails, let it fall through and throw the 401
    }

    throw new ApiError(
      data.error?.code ?? 'UNKNOWN_ERROR',
      data.error?.message ?? 'An error occurred',
      response.status,
      data.error?.details,
    );
  }

  return data;
}
