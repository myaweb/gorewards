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
  '/dashboard(.*)',
  '/admin(.*)',
  '/test-user-profile(.*)',
])

export default clerkMiddleware((auth, request) => {
  // Protect specific routes
  if (isProtectedRoute(request)) {
    auth().protect()
  }

  // Create response
  const response = NextResponse.next()
  
  // Apply security headers
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
