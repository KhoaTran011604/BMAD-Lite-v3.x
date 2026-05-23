import { NextRequest, NextResponse } from 'next/server';

const SESSION_COOKIE_NAME = 'agrikeep_session';

const isPrivateRoute = (pathname: string): boolean =>
  pathname === '/' ||
  pathname === '/catalog' ||
  pathname.startsWith('/catalog/') ||
  pathname === '/history' ||
  pathname.startsWith('/history/');

const isAuthRoute = (pathname: string): boolean =>
  pathname === '/login' || pathname === '/register';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const isAuthenticated = Boolean(sessionCookie);

  if (isPrivateRoute(pathname) && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isAuthRoute(pathname) && isAuthenticated) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/catalog/:path*', '/history/:path*', '/login', '/register'],
};
