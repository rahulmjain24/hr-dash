import type { NextRequest } from 'next/server';
import { auth } from './middleware/auth';

export function middleware(request: NextRequest) {
  return auth(request);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};