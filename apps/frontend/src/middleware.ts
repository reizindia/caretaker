import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ADMIN_PATHS = ['/admin'];
const PUBLIC_PATHS = ['/login', '/not-found-flat', '/inactive-flat', '/_next', '/api', '/icons', '/manifest.json', '/sw.js', '/favicon.ico'];

function extractTenantSlug(request: NextRequest): string | null {
  const host = request.headers.get('host') || '';
  const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || 'caretakerapp.com';

  // Production: abc.caretakerapp.com → abc
  if (host.endsWith(`.${appDomain}`)) {
    const subdomain = host.replace(`.${appDomain}`, '');
    if (subdomain && subdomain !== 'www' && subdomain !== 'admin') {
      return subdomain;
    }
    return null;
  }

  // Local dev: abc.localhost:3000 → abc
  if (host.includes('.localhost')) {
    const parts = host.split('.');
    if (parts.length >= 2) return parts[0];
  }

  // Fallback: ?tenant=abc
  const url = new URL(request.url);
  const tenantParam = url.searchParams.get('tenant');
  if (tenantParam) return tenantParam;

  return null;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip static files and public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Admin paths don't need tenant
  if (ADMIN_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const slug = extractTenantSlug(request);

  if (!slug) {
    // No tenant context — redirect to main domain or show landing
    if (pathname === '/') return NextResponse.next();
    return NextResponse.next();
  }

  // Validate tenant with backend
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    const res = await fetch(`${apiUrl}/tenant/by-slug/${slug}`, { cache: 'no-store' });

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

    const response = NextResponse.next();
    response.cookies.set('tenant-slug', slug, { path: '/', httpOnly: false, sameSite: 'lax' });
    response.headers.set('x-tenant-slug', slug);
    return response;
  } catch {
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
