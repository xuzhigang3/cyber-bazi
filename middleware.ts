import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Protect all /admin routes except the login API route and login page itself
    // Actually we will put the login page inside /admin/login later
    if (pathname.startsWith('/admin')) {
        // Skip middleware for login API and login page
        if (pathname === '/api/admin/login' || pathname === '/admin/login') {
            return NextResponse.next();
        }

        const authCookie = request.cookies.get('admin_session');

        if (!authCookie || authCookie.value !== 'authenticated') {
            // Redirect to login page if not authenticated
            const loginUrl = new URL('/admin/login', request.url);
            return NextResponse.redirect(loginUrl);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*'],
};
