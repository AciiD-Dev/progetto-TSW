/**
 * proxy.ts — Next.js 16 "Proxy" (formerly middleware)
 *
 * Delegates authentication to Auth.js v5.
 * The `auth` function reads the session from the `authjs.session-token`
 * cookie (JWT strategy), so we no longer need the old hh_token system.
 */

import { auth } from '@/auth';
import { NextResponse } from 'next/server';

console.log('[Middleware] Execution started');

const PUBLIC_PATHS = [
  '/login',
  '/register',
  '/favicon.ico',
  '/sw.js',
  '/manifest.json',
  '/robots.txt',
  '/sitemap.xml',
  '/pricing',
  '/privacy',
  '/terms',
  '/support',
];

const PUBLIC_PREFIXES = [
  '/api/',
  '/_next/',
  '/fonts/',
  '/icons/',
  '/images/',
];

const middleware = auth((req) => {
  const { pathname } = req.nextUrl;

  // Allow public exact paths
  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  // Allow public prefixes (API routes, Next internals, static assets)
  if (PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  // Check Auth.js session (injected by the auth() wrapper)
  console.log('[Middleware] Path:', pathname, '| Auth session present:', !!req.auth);
  if (!req.auth) {
    const loginUrl = new URL('/login', req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export default middleware;
export { middleware as proxy };

export const config = {
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
