import { NextResponse } from 'next/server';

export function middleware(request) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';

  // Intercept the root path (/) GET requests
  if (url.pathname === '/') {
    if (hostname.includes('bestnightlifethailand.com')) {
      console.log(`🌐 Next.js Edge Router: Rewriting root (/) to Concierge (/concierge) for host ${hostname}`);
      url.pathname = '/concierge';
      // Returns a seamless server-side rewrite (maintains the root URL in address bar!)
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

// Optimized matcher to only run on the root path (/)
// This guarantees that asset pipelines, API routes like /api/vip-inquiry,
// and other paths are completely bypassed and unaffected.
export const config = {
  matcher: '/',
};
