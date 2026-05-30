import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/login', '/database-unavailable', '/not-found-flat', '/inactive-flat', '/_next', '/api', '/icons', '/manifest.json', '/site.webmanifest', '/sw.js', '/favicon.ico'];
const isProduction = process.env.NODE_ENV === 'production';

function extractTenantSlug(request: NextRequest): string | null {
  const host = request.headers.get('host') || '';
  const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN;

  // Production tenant subdomain.
  if (appDomain && host.endsWith(`.${appDomain}`)) {
    const subdomain = host.replace(`.${appDomain}`, '');
    if (subdomain && subdomain !== 'www' && subdomain !== 'admin') {
      return subdomain;
    }
    return null;
  }

  // Local dev tenant subdomain.
  if (!isProduction && host.includes('.localhost')) {
    const parts = host.split('.');
    if (parts.length >= 2) return parts[0];
  }

  // Fallback: ?tenant=abc
  const url = new URL(request.url);
  const tenantParam = url.searchParams.get('tenant');
  if (!isProduction && tenantParam) return tenantParam;

  return null;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Always skip static assets
  const staticPaths = ['/_next', '/api', '/icons', '/manifest.json', '/site.webmanifest', '/sw.js', '/favicon.ico'];
  if (staticPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  const slug = extractTenantSlug(request);

  // No subdomain → root domain (super admin / main portal) — let everything through
  if (!slug) {
    return NextResponse.next();
  }

  // Subdomain detected — validate tenant with backend
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) return NextResponse.next();
    const res = await fetch(`${apiUrl}/tenant/by-slug/${slug}`, { cache: 'no-store' });

    if (res.status === 503) {
      const url = request.nextUrl.clone();
      url.pathname = '/database-unavailable';
      url.searchParams.delete('tenant');
      return NextResponse.redirect(url);
    }

    if (!res.ok) {
      const url = request.nextUrl.clone();
      url.pathname = '/not-found-flat';
      url.searchParams.delete('tenant');
      return NextResponse.redirect(url);
    }

    const tenant = await res.json();

    if (tenant.status === 'INACTIVE') {
      const url = request.nextUrl.clone();
      url.pathname = '/inactive-flat';
      return NextResponse.redirect(url);
    }

    // Redirect flat subdomain root (/) → /login
    if (pathname === '/') {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      const response = NextResponse.redirect(url);
      response.cookies.set('tenant-slug', slug, { path: '/', httpOnly: false, sameSite: 'lax' });
      return response;
    }

    // Set tenant cookie on all other pages so API client picks it up
    const response = NextResponse.next();
    response.cookies.set('tenant-slug', slug, { path: '/', httpOnly: false, sameSite: 'lax' });
    response.headers.set('x-tenant-slug', slug);
    return response;
  } catch {
    const url = request.nextUrl.clone();
    url.pathname = '/database-unavailable';
    url.searchParams.delete('tenant');
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: ['/((?!_next|api|icons|manifest.json|site.webmanifest|sw.js|favicon.ico).*)'],
};
