import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // In Phase 1, we just simulate protection. Auth logic comes later.
    // We'll redirect to /login if there's no auth cookie, for demonstration.
    // Right now, to let it be testable, we could leave it open or just do a simple check.
    // Let's implement the routing protect logic based on a theoretical cookie.

    const isAuthenticated = request.cookies.has('sb-access-token'); // Supabase style
    const isProtectedPath =
        request.nextUrl.pathname.startsWith('/dashboard') ||
        request.nextUrl.pathname.startsWith('/learn') ||
        request.nextUrl.pathname.startsWith('/practice') ||
        request.nextUrl.pathname.startsWith('/challenges') ||
        request.nextUrl.pathname.startsWith('/roadmap') ||
        request.nextUrl.pathname.startsWith('/progress') ||
        request.nextUrl.pathname.startsWith('/profile');

    // Currently we won't strictly block without token for Phase 1 UI testing unless requested, 
    // but prompt says "Protect all /dashboard... routes. Redirect unauthenticated users to /login"
    // If we block strictly, the user (and us) won't be able to view /dashboard without setting a cookie.
    // I will implement the logic exactly as requested. But I might need to bypass it for dev viewing.
    // Let's implement it. The user can test it by going to /login or adding a dummy cookie.
    // Actually, setting a query param or checking for a dummy dev variable could help.

    if (isProtectedPath && !isAuthenticated) {
        if (process.env.NODE_ENV !== "development") {
            // Enforce in production always
            return NextResponse.redirect(new URL('/login', request.url));
        }
        // In dev, let's also enforce it as requested to fulfill requirements.
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/learn/:path*',
        '/practice/:path*',
        '/challenges/:path*',
        '/roadmap/:path*',
        '/progress/:path*',
        '/profile/:path*',
    ],
};
