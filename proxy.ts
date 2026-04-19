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
  '/public/',
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths exactly
  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  // Allow public prefixes (static assets, API, Next internals)
  if (PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  // Allow Next.js RSC / prefetch internal requests
  // These are identified by ?_rsc= query param or specific headers
  const isRSC = request.headers.get('rsc') === '1'
    || request.nextUrl.searchParams.has('_rsc')
    || request.headers.get('next-router-state-tree') !== null;

  const session = request.cookies.get(COOKIE_NAME);

  // For RSC/internal requests, if cookie missing just pass through
  // (the page itself is protected — this avoids ERR_FAILED loops)
  if (isRSC && !session) {
    return NextResponse.next();
  }

  if (!session) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.search = '';
    return NextResponse.redirect(loginUrl);
  }

  const payload = await verifyToken(session.value);

  if (!payload) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.search = '';
    return NextResponse.redirect(loginUrl);
  }

  const response = NextResponse.next();
  response.headers.set('X-User-Id', String(payload.userId));
  response.headers.set('X-User-Email', payload.email);
  return response;
}

export const config = {
  // Exclude static files, images, and Next.js internals from middleware
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)).*)',
  ],
};
