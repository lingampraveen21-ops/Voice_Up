import { type NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { updateSession } from './lib/supabase/middleware';
import { routing } from './navigation';

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
    // 1. Run next-intl middleware first to handle locale detection and redirection
    const response = intlMiddleware(request);

    // 2. Refresh the Supabase session and handle auth redirects
    // We pass the response from intlMiddleware so it keeps the locale cookies/headers
    return await updateSession(request, response);
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
