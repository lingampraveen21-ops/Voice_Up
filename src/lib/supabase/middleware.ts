import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest, response?: NextResponse) {
    const supabaseResponse = response || NextResponse.next({
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
                    supabaseResponse.cookies.set({ name, value, ...options })
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({ name, value: '', ...options })
                    supabaseResponse.cookies.set({ name, value: '', ...options })
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()
    const path = request.nextUrl.pathname

    // Extract locale from path (e.g., /en/dashboard -> /dashboard)
    const segments = path.split('/')
    const locale = segments[1]
    const locales = ['en', 'hi', 'es', 'pt', 'fr']
    const isLocalePath = locales.includes(locale)
    const subPath = isLocalePath ? '/' + segments.slice(2).join('/') : path

    // Public paths that do not require authentication
    const isPublicAuthPath = subPath.startsWith('/login') || subPath.startsWith('/signup') || subPath.startsWith('/auth')
    const isRootPaths = subPath === '/' || subPath === ''

    // Guest-friendly learn paths
    const isGuestLessonPath = subPath.startsWith('/learn/lesson-1') || subPath.startsWith('/learn/lesson-2')

    const isApiRoute = path.startsWith('/api')

    if (!user && !isPublicAuthPath && !isRootPaths && !isGuestLessonPath && !path.startsWith('/_next') && !isApiRoute) {
        // Attempting to access protected paths without user -> redirect to login
        const loginUrl = new URL(`/${isLocalePath ? locale : 'en'}/login`, request.url)
        return NextResponse.redirect(loginUrl)
    }

    if (user) {
        if (isPublicAuthPath && !subPath.startsWith('/auth/reset-password')) {
            // Logged in users trying to access login/signup -> redirect to dashboard
            const dashboardUrl = new URL(`/${isLocalePath ? locale : 'en'}/dashboard`, request.url)
            return NextResponse.redirect(dashboardUrl)
        }

        if (subPath !== '/onboarding' && !path.startsWith('/_next') && !subPath.startsWith('/auth/callback')) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('placement_done, preferred_language')
                .eq('id', user.id)
                .single()

            // Handle onboarding redirect
            if (profile && profile.placement_done === false) {
                const onboardingUrl = new URL(`/${locale || 'en'}/onboarding`, request.url)
                return NextResponse.redirect(onboardingUrl)
            }

            // Auto-detect language if profile has it and path doesn't match? 
            // next-intl handles the cookie, so we usually don't need to force redirect here
            // unless we want to sync the URL locale with the profile locale.
        }
    }

    return supabaseResponse
}
