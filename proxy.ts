import { NextRequest, NextResponse } from 'next/server';

export const proxy = (request: NextRequest) => {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // check if user is trying to access a protected dashboard route
  const isDashboardRoute = pathname.startsWith('/dashboard');

  // check if user is visiting authentication pages
  const isAuthRoute = pathname === '/login' || pathname === '/register';

  // if user tries to login without token, redirect to login page
  if (isDashboardRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // if logged-in user tries to access login page, redirect to dashboard
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
};

// tells next.js which routes the proxy should run on
export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register'],
};
