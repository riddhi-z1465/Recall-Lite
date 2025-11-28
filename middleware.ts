import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()
    console.log('Middleware:', request.nextUrl.pathname, user ? 'User logged in' : 'No user')

    // Protect dashboard and chat routes
    if (request.nextUrl.pathname.startsWith('/dashboard') || request.nextUrl.pathname.startsWith('/chat')) {
        if (!user) {
            const url = request.nextUrl.clone()
            url.pathname = '/login'
            const redirectResponse = NextResponse.redirect(url)

            // Copy cookies from the response object (which might have refreshed session)
            // to the redirect response
            const allCookies = response.cookies.getAll()
            allCookies.forEach(cookie => {
                redirectResponse.cookies.set(cookie.name, cookie.value, cookie)
            })

            return redirectResponse
        }
    }

    // Redirect to dashboard if logged in and visiting login
    if (request.nextUrl.pathname.startsWith('/login')) {
        if (user) {
            const url = request.nextUrl.clone()
            url.pathname = '/dashboard'
            const redirectResponse = NextResponse.redirect(url)

            // Copy cookies here too just in case
            const allCookies = response.cookies.getAll()
            allCookies.forEach(cookie => {
                redirectResponse.cookies.set(cookie.name, cookie.value, cookie)
            })

            return redirectResponse
        }
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
