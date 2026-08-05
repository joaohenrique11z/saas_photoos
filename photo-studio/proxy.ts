import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = ['/clientes', '/atendimentos', '/financeiro'];

export function middleware(req: NextRequest) {
  const sessionToken = req.cookies.get('photo_studio_session')?.value;
  const { pathname } = req.nextUrl;

  // Protect routes and root path
  if (protectedRoutes.some(route => pathname.startsWith(route)) || pathname === '/') {
    if (!sessionToken) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  // Redirect to home if logged in and trying to access login
  if (pathname === '/login' && sessionToken) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|logo.png).*)'],
};
