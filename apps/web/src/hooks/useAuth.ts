'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { deleteCookie, getCookie } from 'cookies-next';

export function useAuth() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Attempt to get token from localStorage or cookies
    const localToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    // Also check cookies if needed, but keeping it simple based on existing patterns
    if (localToken) {
      setToken(localToken);
      // Decode token or fetch user if needed, for now just setting token
    }
    setLoading(false);
  }, []);

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      deleteCookie('token');
    }
    setToken(null);
    setUser(null);
    router.push('/login');
  };

  return {
    token,
    user,
    loading,
    logout,
    isAuthenticated: !!token,
  };
}
