import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 200 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};