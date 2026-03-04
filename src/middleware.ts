import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const session = request.cookies.get('discipline_session')
    const { pathname } = request.nextUrl
    const isLoginPage = pathname === '/login'
    const isApiAuth = pathname.startsWith('/api/auth')
    const isNotificationApi = pathname.startsWith('/api/notifications')
    const isStaticAsset = pathname.startsWith('/_next') || pathname.startsWith('/favicon') || pathname.startsWith('/sounds')

    // Allow login page, auth API, notification cron API, and static assets through
    if (isLoginPage || isApiAuth || isNotificationApi || isStaticAsset) {
        return NextResponse.next()
    }

    // Block everything else if no valid session
    if (!session?.value) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // If going to root, redirect to war-room 
    if (pathname === '/') {
        return NextResponse.redirect(new URL('/war-room', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|sounds).*)'],
}
