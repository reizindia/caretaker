'use client';
import { useEffect } from 'react';
import { useTenantStore } from '@/lib/store/tenant.store';
import apiClient from '@/lib/api/client';

export function useTenant() {
  const { tenant, slug, setTenant, setSlug } = useTenantStore();

  useEffect(() => {
    const cookieSlug = document.cookie.match(/tenant-slug=([^;]+)/)?.[1] ||
                       new URLSearchParams(window.location.search).get('tenant');

    if (cookieSlug && !tenant) {
      setSlug(cookieSlug);
      apiClient.get(`/tenant/by-slug/${cookieSlug}`).then((res) => {
        setTenant(res.data);
      }).catch(() => {});
    }
  }, [tenant, setTenant, setSlug]);

  return { tenant, slug };
}
