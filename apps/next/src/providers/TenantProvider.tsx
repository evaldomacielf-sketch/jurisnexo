'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { usePathname } from 'next/navigation';

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
  const pathname = usePathname();

  useEffect(() => {
    const resolveTenant = async () => {
      const hostname = window.location.hostname;

      // Define base domain - logic to detect if we are on a subdomain
      // Localhost handling: usually localhost:3000. 
      // We can simulate subdomain via localtest.me or hosts file. 
      // Or just check if host parts > 2 (e.g. tenant.domain.com) and first part != 'app' or 'www'.

      const parts = hostname.split('.');
      let slug = '';

      // Example: slug.jurisnexo.canalterra.com (4 parts)
      // Example: slug.localhost (2 parts - requires specific handling)
      // Example: localhost (1 part)

      const isLocalhost = hostname.includes('localhost');

      // Assumption: Production domain is jurisnexo.canalterra.com -> parts length 3.
      // Subdomain: slug.jurisnexo.canalterra.com -> parts length 4.

      // For prompt "slug.jurisnexo.canalterra.com":
      if (hostname.includes('jurisnexo.canalterra.com')) {
        if (parts.length > 3) {
          const potentialSlug = parts[0];
          if (!['app', 'www', 'api', 'admin'].includes(potentialSlug)) {
            slug = potentialSlug;
          }
        }
      }
      // Local dev simulation: slug.localhost (needs etc/hosts)
      else if (isLocalhost && parts.length > 1) {
        slug = parts[0];
      }

      if (slug) {
        setIsSubdomain(true);
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/tenants/lookup/${slug}`);
          if (res.ok) {
            const data = await res.json();
            setTenant(data);
            console.log('[TenantProvider] Resolved tenant:', data.name);
          } else {
            console.error('[TenantProvider] Tenant lookup failed');
          }
        } catch (err) {
          console.error('[TenantProvider] Error resolving tenant', err);
        }
      } else {
        // Not a subdomain, try to get active tenant from session
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/tenants/current`, { credentials: 'include' });
          if (res.ok) {
            const data = await res.json();
            if (data) {
              setTenant(data);
              console.log('[TenantProvider] Resolved active tenant:', data.name);
            }
          }
        } catch (err) {
          // Ignore error, maybe not logged in
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
