import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { COOKIE_NAME } from './lib/auth/simple';

export function middleware(request: NextRequest) {
  const isAdmin = request.cookies.get(COOKIE_NAME);

  if (!isAdmin) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }
}

export const config = {
  matcher: ['/admin/:path*'], // protects all /admin routes except login
};