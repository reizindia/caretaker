import { NextRequest, NextResponse } from 'next/server';

const DEFAULT_ICON = '/icons/icon-512x512.png';

function getTenantSlug(host: string) {
  const hostname = host.split(':')[0];
  const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN;

  if (appDomain && hostname.endsWith(`.${appDomain}`)) {
    const slug = hostname.replace(`.${appDomain}`, '');
    if (slug && slug !== 'www' && slug !== 'admin') return slug;
  }

  return null;
}

function appUrl(request: NextRequest) {
  const forwardedProto = request.headers.get('x-forwarded-proto');
  const proto = forwardedProto || request.nextUrl.protocol.replace(':', '') || 'https';
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || request.nextUrl.host;
  return `${proto}://${host}`;
}

export async function GET(request: NextRequest) {
  const origin = appUrl(request);
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || '';
  const slug = getTenantSlug(host);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  let tenant: any = null;

  if (slug && apiUrl) {
    try {
      const response = await fetch(`${apiUrl}/tenant/by-slug/${slug}`, { cache: 'no-store' });
      if (response.ok) tenant = await response.json();
    } catch {
      tenant = null;
    }
  }

  const appName = tenant?.flatName || process.env.NEXT_PUBLIC_APP_NAME || 'CareTaker';
  const themeColor = tenant?.themeColor || '#3B82F6';
  const iconUrl = tenant?.logoUrl || DEFAULT_ICON;
  const startUrl = tenant ? `${origin}/login` : `${origin}/login`;

  return NextResponse.json(
    {
      name: appName,
      short_name: appName.length > 12 ? appName.slice(0, 12) : appName,
      description: tenant ? `${appName} society portal` : 'Smart Apartment Management Platform',
      start_url: startUrl,
      scope: `${origin}/`,
      id: tenant ? `${origin}/?tenant=${tenant.slug}` : `${origin}/`,
      display: 'standalone',
      background_color: '#ffffff',
      theme_color: themeColor,
      orientation: 'portrait-primary',
      icons: [
        {
          src: iconUrl,
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any maskable',
        },
        {
          src: iconUrl,
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable',
        },
      ],
      categories: ['productivity', 'utilities'],
      lang: 'en',
    },
    {
      headers: {
        'Content-Type': 'application/manifest+json',
        'Cache-Control': 'no-store',
      },
    },
  );
}
