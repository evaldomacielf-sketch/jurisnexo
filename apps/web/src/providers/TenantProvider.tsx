'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  status: string;
}

interface TenantContextType {
  tenant: Tenant | null;
  loading: boolean;
  isSubdomain: boolean;
}

const TenantContext = createContext<TenantContextType>({
  tenant: null,
  loading: true,
  isSubdomain: false,
});

export function TenantProvider({ children }: { children: ReactNode }): React.ReactNode {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubdomain, setIsSubdomain] = useState(false);

  useEffect(() => {
    const resolveTenant = async () => {
      const hostname = window.location.hostname;

      const parts = hostname.split('.');
      let slug = '';

      const isLocalhost = hostname.includes('localhost');

      // Subdomain check
      if (hostname.includes('jurisnexo.canalterra.com')) {
        if (parts.length > 3) {
          const potentialSlug = parts[0];
          if (potentialSlug && !['app', 'www', 'api', 'admin'].includes(potentialSlug)) {
            slug = potentialSlug;
          }
        }
      } else if (isLocalhost && parts.length > 1) {
        const potentialSlug = parts[0];
        if (potentialSlug) {
          slug = potentialSlug;
        }
      }

      if (slug) {
        setIsSubdomain(true);
        const currentSlug: string = slug; // Type guard
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/tenants/lookup/${currentSlug}`
          );
          if (res.ok) {
            const data = await res.json();
            setTenant(data);
            console.log('[TenantProvider] Resolved tenant:', data.name);
          }
        } catch (err) {
          console.error('[TenantProvider] Error resolving tenant', err);
        }
      } else {
        // Try to get tenant from JWT cookie or API
        const AUTH_COOKIE = 'jurisnexo_session';
        let authToken: string | null = null;

        try {
          // Try to decode tenant info from session cookie
          const cookies = document.cookie.split('; ');
          const sessionCookie = cookies.find((c) => c.startsWith(`${AUTH_COOKIE}=`));

          if (sessionCookie) {
            authToken = sessionCookie.split('=')[1];

            // Robust JWT payload decoding
            try {
              const payloadPart = authToken.split('.')[1];
              if (payloadPart) {
                // Base64Url to Base64
                const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(
                  atob(base64)
                    .split('')
                    .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
                );

                const payload = JSON.parse(jsonPayload);

                // If we have full tenant info in JWT, skip API call
                if (payload.tenant_id && payload.tenant_name && authToken) {
                  setTenant({
                    id: String(payload.tenant_id),
                    name: String(payload.tenant_name),
                    slug: String(payload.tenant_slug || ''),
                    status: 'active',
                  });
                  console.log('[TenantProvider] Resolved tenant from JWT:', payload.tenant_name);
                  setLoading(false);
                  return;
                }
              }
            } catch (e) {
              console.warn('[TenantProvider] JWT parse warning:', e);
            }
          }

          // Fallback: fetch from API
          const headers: Record<string, string> = {
            'Content-Type': 'application/json',
          };
          if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`;
          }

          const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
          const res = await fetch(`${API_URL}/tenants/current`, {
            credentials: 'include',
            headers,
          });
          if (res.ok) {
            const data = await res.json();
            if (data) {
              setTenant(data);
              console.log('[TenantProvider] Resolved active tenant:', data.name);
            }
          }
        } catch (err) {
          console.error('[TenantProvider] Error getting current tenant', err);
        }
      }

      setLoading(false);
    };

    resolveTenant();
  }, []);

  return (
    <TenantContext.Provider value={{ tenant, loading, isSubdomain }}>
      {children}
    </TenantContext.Provider>
  );
}

export const useTenantContext = () => useContext(TenantContext);
