import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AUTH_COOKIE_NAME, PUBLIC_PATHS } from '@/lib/config';

export function auth(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authCookie = request.cookies.get(AUTH_COOKIE_NAME);
  const isPublicPage = PUBLIC_PATHS.some((path) => pathname.startsWith(path));
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');

  if (!authCookie && !isPublicPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (authCookie && isAuthPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};
