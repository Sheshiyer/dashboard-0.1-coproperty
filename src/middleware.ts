/**
 * Simplified middleware for the new Cloudflare Workers architecture.
 * 
 * Since we're using simple API key authentication with Workers,
 * the frontend doesn't need complex auth middleware.
 * 
 * This middleware only handles:
 * 1. Redirect rules for protected routes
 * 2. Setting response headers
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function middleware(_request: NextRequest) {
    const response = NextResponse.next()

    // Add security headers
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

    // For now, all routes are accessible
    // TODO: Add session-based auth if needed
    // Example: check for session cookie or redirect to login

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!_next/static|_next/image|favicon.ico|public/).*)',
    ],
}
