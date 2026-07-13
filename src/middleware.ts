import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  const { pathname } = req.nextUrl;

  // Paths that require auth
  const isProtectedPath =
    pathname.startsWith('/client-dashboard') ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/director') ||
    pathname.startsWith('/clients') ||
    pathname.startsWith('/company') ||
    pathname.startsWith('/shareholder') ||
    pathname.startsWith('/auditor') ||
    pathname.startsWith('/resolutions') ||
    pathname.startsWith('/annual-filings') ||
    pathname.startsWith('/share-capital') ||
    pathname.startsWith('/registered-office') ||
    pathname.startsWith('/share-transfer') ||
    pathname.startsWith('/share-certificate') ||
    pathname.startsWith('/alteration-moa-aoa') ||
    pathname.startsWith('/masters') ||
    pathname.startsWith('/templates') ||
    pathname.startsWith('/documents') ||
    pathname.startsWith('/users') ||
    pathname.startsWith('/reports') ||
    pathname.startsWith('/settings');

  // Login page access
  const isLoginPath = pathname.startsWith('/login');

  if (isProtectedPath && !token) {
    // Redirect to login if trying to access protected paths without token
    const loginUrl = new URL('/login', req.url);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoginPath && token) {
    try {
      const payloadBase64 = token.split('.')[1];
      const payload = JSON.parse(atob(payloadBase64));
      if (payload.role === 'client') {
        return NextResponse.redirect(new URL('/client-dashboard', req.url));
      } else {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    } catch (e) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
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