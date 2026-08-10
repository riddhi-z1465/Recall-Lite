import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    const sessionCookie = request.cookies.get('firebase_session')?.value;
    let isLoggedIn = false;

    if (sessionCookie) {
        try {
            const parsed = JSON.parse(sessionCookie);
            if (parsed?.uid) {
                isLoggedIn = true;
            }
        } catch (e) {
            isLoggedIn = false;
        }
    }

    const pathname = request.nextUrl.pathname;

    // Protect dashboard and chat routes
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/chat')) {
        if (!isLoggedIn) {
            const url = request.nextUrl.clone();
            url.pathname = '/login';
            return NextResponse.redirect(url);
        }
    }

    // Redirect to dashboard if logged in and visiting login
    if (pathname.startsWith('/login')) {
        if (isLoggedIn) {
            const url = request.nextUrl.clone();
            url.pathname = '/dashboard';
            return NextResponse.redirect(url);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}

