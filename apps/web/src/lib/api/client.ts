import type { ApiResponse } from '@nama/shared';

const API_URL = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000/api/v1';

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
}

export async function apiFetch<T>(
  path: string,
  options: FetchOptions = {},
): Promise<ApiResponse<T>> {
  const { auth = true, ...init } = options;

  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');

  if (auth) {
    const token = await getServerAccessToken();
    if (token) {
      headers.set('Cookie', `nama_access_token=${token}`);
    }
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: 'include', // Important for sending cookies from the browser
    headers,
  });

  const data = (await response.json()) as ApiResponse<T>;

  if (!data.success) {
    throw new ApiError(
      data.error?.code ?? 'UNKNOWN_ERROR',
      data.error?.message ?? 'An error occurred',
      response.status,
      data.error?.details,
    );
  }

  return data;
}
