import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Middleware for basic route protection
 *
 * Note: This middleware runs on the server side and does NOT have access to
 * localStorage. Therefore, we can only do basic pattern matching here.
 * The actual authentication check is done client-side by the withAuth HOC.
 *
 * Purpose:
 * 1. Redirect authenticated users away from auth pages (login/signup)
 * 2. Provide basic protection for protected routes (actual check in withAuth)
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // For now, we don't have access to httpOnly cookies, so we can't check auth status
  // The real protection happens in withAuth HOC on the client side

  // This middleware primarily serves to:
  // 1. Prevent authenticated users from seeing login/signup pages
  //    (but we can't check this server-side with localStorage tokens)
  // 2. Provide a consistent entry point for future server-side auth (httpOnly cookies)

  // For Phase 1, we'll keep this minimal and let withAuth HOC handle protection
  return NextResponse.next();
}

// Configure which routes this middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
  ],
};
