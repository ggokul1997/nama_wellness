import { cookies } from 'next/headers';
import { apiFetch } from '../api/client';
import type { AuthUser } from '@nama/shared';

export async function getServerSession() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('nama_access_token')?.value;
    
    if (!token) {
      return null;
    }

    const res = await apiFetch<{ user: AuthUser }>('/auth/me', {
      headers: {
        Cookie: `nama_access_token=${token}`
      }
    });

    return {
      user: res.data?.user || null,
      roles: res.data?.user?.roles || [],
    };
  } catch (err) {
    return null;
  }
}
