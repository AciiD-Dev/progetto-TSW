import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';

const PUBLIC_PATHS = [
  '/login',
  '/favicon.ico',
  '/sw.js',
  '/manifest.json',
  '/robots.txt',
  '/sitemap.xml',
];

const PUBLIC_PREFIXES = [
  '/api/',
  '/_next/',
  '/fonts/',
  '/icons/',
  '/images/',
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public exact paths
  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  // Allow public prefixes (API routes, Next internals, static assets)
  if (PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  const session = request.cookies.get(COOKIE_NAME);

  if (!session) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  const payload = await verifyToken(session.value);

  if (!payload) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  const response = NextResponse.next();
  response.headers.set('X-User-Id', String(payload.userId));
  response.headers.set('X-User-Email', payload.email);
  return response;
}

export const config = {
  /*
   * Next.js 16 official pattern: use 'missing' to skip the proxy for
   * prefetch requests entirely (before the function body runs).
   *
   * IMPORTANT: Next.js STRIPS RSC/Flight headers (rsc, next-router-state-tree,
   * next-router-prefetch) before they reach the proxy function, so you CANNOT
   * detect RSC requests inside the function — use the matcher config instead.
   *
   * Source: proxy.md docs, "RSC requests and rewrites" + "Negative matching"
   */
  matcher: [
    // Non-prefetch requests — proxy runs normally
    {
      source:
        '/((?!api|_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
    // Prefetch requests — also run proxy so auth cookie is checked
    {
      source:
        '/((?!api|_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt).*)',
      has: [{ type: 'header', key: 'next-router-prefetch' }],
    },
    {
      source:
        '/((?!api|_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt).*)',
      has: [{ type: 'header', key: 'purpose', value: 'prefetch' }],
    },
  ],
};
