import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value;
  const pathname = request.nextUrl.pathname;

  console.log('=== MIDDLEWARE CHECK ===');
  console.log('Path:', pathname);
  console.log('Has session:', !!session);

  // Parse session if exists
  let sessionData = null;
  if (session) {
    try {
      sessionData = JSON.parse(session);
      
      // Check if session is expired (24 hours)
      const sessionAge = Date.now() - sessionData.timestamp;
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      
      if (sessionAge > maxAge) {
        console.log('Session expired');
        sessionData = null;
        // Clear expired session
        const response = NextResponse.redirect(new URL('/sign-in', request.url));
        response.cookies.delete('session');
        return response;
      }
    } catch (error) {
      console.log('Invalid session data');
      sessionData = null;
    }
  }

  // Protected routes - require authentication
  if (pathname.startsWith('/protected')) {
    if (!sessionData) {
      console.log('Redirecting to sign-in: No valid session');
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }
    console.log('Access granted to protected route');
    return NextResponse.next();
  }

  // Auth routes - redirect if already authenticated
  if (pathname === '/sign-in' || pathname === '/sign-up') {
    if (sessionData) {
      console.log('Redirecting to protected: Already authenticated');
      return NextResponse.redirect(new URL('/protected', request.url));
    }
    console.log('Access granted to auth route');
    return NextResponse.next();
  }

  // Root route - redirect based on auth status
  if (pathname === '/') {
    if (sessionData) {
      console.log('Redirecting authenticated user to protected area');
      return NextResponse.redirect(new URL('/protected', request.url));
    } else {
      console.log('Redirecting unauthenticated user to sign-in');
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }
  }

  console.log('Allowing access to public route');
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}