import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  // Only protect /admin and /dashboard routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/dashboard')) {
    const token = req.cookies.get('auth_token')?.value;
    if (!token) {
      // Not authenticated
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*'],
};
