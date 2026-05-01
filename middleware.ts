/**
 * Next.js Middleware
 * 
 * Applies Clerk authentication and security headers to all HTTP responses
 */

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { securityHeaders } from './lib/middleware/securityHeaders'

// Define protected routes that require authentication
const isProtectedRoute = createRouteMatcher([
  '/users(.*)',
  '/admin(.*)',
])

export default clerkMiddleware((auth, request) => {
  const pathname = request.nextUrl.pathname
  
  // Check if user is authenticated
  const { userId } = auth()
  
  // If protected route and not authenticated, redirect to sign-in
  if (isProtectedRoute(request) && !userId) {
    const signInUrl = new URL('/sign-in', request.url)
    signInUrl.searchParams.set('redirect_url', request.url)
    const redirectResponse = NextResponse.redirect(signInUrl)
    
    // Set noindex header on redirect response for protected routes
    redirectResponse.headers.set('X-Robots-Tag', 'noindex, nofollow')
    
    // Apply other security headers
    return securityHeaders.applySecurityHeaders(redirectResponse, request)
  }
  
  // Create normal response
  let response = NextResponse.next()
  
  // Set X-Robots-Tag header based on route
  if (pathname.startsWith('/admin') || pathname.startsWith('/users') || pathname.startsWith('/api')) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow')
  } else {
    response.headers.set('X-Robots-Tag', 'index, follow')
  }
  
  // Apply other security headers
  return securityHeaders.applySecurityHeaders(response, request)
})

// Apply to all routes
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
