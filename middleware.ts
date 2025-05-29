import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the pathname of the request (e.g. /, /protected)
  const path = request.nextUrl.pathname;

  // Check if the path is a protected route
  const isProtectedRoute = path.startsWith('/protected');

  if (isProtectedRoute) {
    // Get the session cookie
    const sessionCookie = request.cookies.get('session');

    if (!sessionCookie) {
      // No session found, redirect to sign-in
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }

    try {
      // Parse the session data
      const sessionData = JSON.parse(sessionCookie.value);
      
      // Check if session is expired (24 hours)
      const sessionAge = Date.now() - sessionData.timestamp;
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      
      if (sessionAge > maxAge) {
        // Session expired, redirect to sign-in
        const response = NextResponse.redirect(new URL('/sign-in', request.url));
        response.cookies.delete('session');
        return response;
      }

      // Role-based route protection
      const userRole = sessionData.role;
      const userData = sessionData.userData;
      
      // Check specific role-based routes
      if (path.startsWith('/protected/dashboard/pengunjung') && userRole !== 'pengunjung') {
        return NextResponse.redirect(new URL('/protected', request.url));
      }
      
      if (path.startsWith('/protected/dashboard/dokter-hewan') && userRole !== 'dokter_hewan') {
        return NextResponse.redirect(new URL('/protected', request.url));
      }
      
      // For staff routes, check both role and specific staff type
      if (path.startsWith('/protected/dashboard/penjaga-hewan')) {
        if (userRole !== 'staff' || userData?.roleSpecificData?.peran !== 'penjaga') {
          return NextResponse.redirect(new URL('/protected', request.url));
        }
      }
      
      if (path.startsWith('/protected/dashboard/staf-administrasi')) {
        if (userRole !== 'staff' || userData?.roleSpecificData?.peran !== 'admin') {
          return NextResponse.redirect(new URL('/protected', request.url));
        }
      }
      
      if (path.startsWith('/protected/dashboard/staf-pelatih')) {
        if (userRole !== 'staff' || userData?.roleSpecificData?.peran !== 'pelatih') {
          return NextResponse.redirect(new URL('/protected', request.url));
        }
      }

    } catch (error) {
      // Invalid session data, redirect to sign-in
      const response = NextResponse.redirect(new URL('/sign-in', request.url));
      response.cookies.delete('session');
      return response;
    }
  }

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
};
