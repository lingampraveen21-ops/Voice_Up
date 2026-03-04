import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL?.startsWith('http') ? process.env.NEXT_PUBLIC_SUPABASE_URL : 'https://placeholder.supabase.co',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder',
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({ name, value, ...options })
                    supabaseResponse = NextResponse.next({
                        request: { headers: request.headers },
                    })
                    supabaseResponse.cookies.set({ name, value, ...options })
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({ name, value: '', ...options })
                    supabaseResponse = NextResponse.next({
                        request: { headers: request.headers },
                    })
                    supabaseResponse.cookies.set({ name, value: '', ...options })
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()
    const path = request.nextUrl.pathname

    // Public paths that do not require authentication
    const isPublicAuthPath = path.startsWith('/login') || path.startsWith('/signup') || path.startsWith('/auth')
    const isRootPaths = path === '/'

    // Guest-friendly learn paths
    const isGuestLessonPath = path.startsWith('/learn/lesson-1') || path.startsWith('/learn/lesson-2')

    if (!user && !isPublicAuthPath && !isRootPaths && !isGuestLessonPath && !path.startsWith('/_next')) {
        // Attempting to access protected paths without user -> redirect to login
        return NextResponse.redirect(new URL('/login', request.url))
    }

    if (user) {
        if (isPublicAuthPath && !path.startsWith('/auth/reset-password')) {
            // Logged in users trying to access login/signup -> redirect to dashboard
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }

        /* 
         * Requirement: Redirect to /onboarding if placement_done is false.
         * We selectively query the profiles table to see placement_done status. 
         * To prevent an infinite redirect loop, we don't do this if they're already on /onboarding.
         */
        if (path !== '/onboarding' && !path.startsWith('/_next') && !path.startsWith('/auth/callback')) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('placement_done')
                .eq('id', user.id)
                .single()

            if (profile && profile.placement_done === false) {
                return NextResponse.redirect(new URL('/onboarding', request.url))
            }
        }
    }

    return supabaseResponse
}
