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
  // First, determine if this is a protected route and set appropriate headers
  const pathname = request.nextUrl.pathname
  const needsAuth = isProtectedRoute(request)
  
  // Create response
  let response = NextResponse.next()
  
  // Set X-Robots-Tag header based on route BEFORE any redirect
  if (pathname.startsWith('/admin') || pathname.startsWith('/users') || pathname.startsWith('/api')) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow')
  } else {
    response.headers.set('X-Robots-Tag', 'index, follow')
  }
  
  // Apply other security headers
  response = securityHeaders.applySecurityHeaders(response, request)
  
  // Now handle authentication (this may redirect, but headers are already set)
  if (needsAuth) {
    auth().protect({
      unauthenticatedUrl: new URL('/sign-in', request.url).toString(),
    })
  }
  
  return response
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
