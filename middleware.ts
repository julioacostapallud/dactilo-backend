// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  // Sólo interceptamos rutas que empiecen con /api/protected
  if (pathname.startsWith('/api/protected')) {
    const auth = req.headers.get('authorization') || '';
    if (!auth.startsWith('Bearer ')) {
      return new NextResponse(
        JSON.stringify({ error: 'No autorizado' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    const token = auth.split(' ')[1];
    try {
      jwt.verify(token, process.env.JWT_SECRET!);
      return NextResponse.next();
    } catch {
      return new NextResponse(
        JSON.stringify({ error: 'Token inválido' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: '/api/protected/:path*',
};
