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
          if (!['app', 'www', 'api', 'admin'].includes(potentialSlug)) {
            slug = potentialSlug;
          }
        }
      } else if (isLocalhost && parts.length > 1) {
        slug = parts[0];
      }

      if (slug) {
        setIsSubdomain(true);
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/tenants/lookup/${slug}`);
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
        let authToken: string | null = null;

        try {
          // Try to decode tenant info from access_token cookie
          const tokenMatch = document.cookie.match(/access_token=([^;]+)/);
          if (tokenMatch && tokenMatch[1]) {
            authToken = tokenMatch[1];
            // Decode JWT payload (base64)
            const payloadBase64 = authToken.split('.')[1];
            if (payloadBase64) {
              const payload = JSON.parse(atob(payloadBase64));
              if (payload.tenant_id && payload.tenant_name) {
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
          }

          // Fallback: fetch from API
          const headers: Record<string, string> = {};
          if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`;
          }

          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/tenants/current`, {
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
