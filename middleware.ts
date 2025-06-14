import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Check if the path is for dashboard
  const isDashboardPath = pathname.startsWith('/(dashboard)') || 
                         pathname.startsWith('/users') || 
                         pathname.startsWith('/withdrawals') ||
                         pathname.startsWith('/kyc') ||
                         pathname.startsWith('/plans') ||
                         pathname.startsWith('/tasks') ||
                         pathname.startsWith('/transactions') ||
                         pathname.startsWith('/notifications');

  // Check if the path is for authentication
  const isAuthPath = pathname.startsWith('/login');
  
  // Get user token
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  
  // Redirect logic
  if (isDashboardPath && !token) {
    // Redirect to login if trying to access dashboard without auth
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  if (isAuthPath && token) {
    // Redirect to dashboard if already authenticated
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Protected routes
    '/(dashboard)/:path*',
    '/users/:path*',
    '/withdrawals/:path*',
    '/kyc/:path*',
    '/plans/:path*',
    '/tasks/:path*',
    '/transactions/:path*',
    '/notifications/:path*',
    // Auth routes
    '/login'
  ],
};