'use server';

import { getAccessToken } from './cookies';
import type { AuthUser } from './types';

const API_URL = process.env.API_URL || 'http://localhost:4000';

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const accessToken = await getAccessToken();

    if (!accessToken) {
      console.log('[Session] No access token found');
      return null;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error('[Session] Error response:', response.status);
      return null;
    }

    const data = await response.json();
    return data.user;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error('[Session] Request timeout');
    } else {
      console.error('[Session] Error:', error.message);
    }
    return null;
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null;
}

export async function isEmailVerified(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.emailVerified ?? false;
}

export async function getTokensForRefresh() {
  const accessToken = await getAccessToken();
  const refreshToken = await getRefreshToken();
  return { accessToken, refreshToken };
}
