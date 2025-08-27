import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Obtener el origen de la request
  const origin = request.headers.get('origin') || '';
  
  // Lista de orígenes permitidos
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://dactilografia.vercel.app',
    'https://dactilo.vercel.app',
    'https://www.dactilo.com.ar',
    'https://dactilo.com.ar'
  ];

  // Verificar si el origen está permitido
  const isAllowedOrigin = allowedOrigins.includes(origin);

  // Crear la respuesta
  const response = NextResponse.next();

  // Agregar headers de CORS
  if (isAllowedOrigin) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }
  
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Allow-Credentials', 'true');

  // Manejar preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 200, headers: response.headers });
  }

  return response;
}

export const config = {
  matcher: '/api/:path*',
};
