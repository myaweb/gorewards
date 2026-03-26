/**
 * Security Headers Middleware
 * 
 * Implements comprehensive security headers for HTTP responses
 * including HTTPS enforcement, CSP, and anti-clickjacking protection
 */

import { NextRequest, NextResponse } from 'next/server'
import { securityLogger } from '@/lib/services/securityLogger'
import { generateCorrelationId } from '@/lib/utils/crypto'

export interface SecurityHeadersConfig {
  enforceHttps: boolean
  contentSecurityPolicy: string | null
  hstsMaxAge: number
  includeSubdomains: boolean
  preload: boolean
}

export class SecurityHeadersService {
  private readonly config: SecurityHeadersConfig

  constructor(config?: Partial<SecurityHeadersConfig>) {
    this.config = {
      enforceHttps: process.env.NODE_ENV === 'production',
      contentSecurityPolicy: this.getDefaultCSP(),
      hstsMaxAge: 31536000, // 1 year
      includeSubdomains: true,
      preload: true,
      ...config
    }
  }

  /**
   * Apply security headers to response
   */
  applySecurityHeaders(response: NextResponse, request?: NextRequest): NextResponse {
    const correlationId = generateCorrelationId()

    // HTTPS Enforcement with HSTS
    if (this.config.enforceHttps) {
      let hstsValue = `max-age=${this.config.hstsMaxAge}`
      if (this.config.includeSubdomains) {
        hstsValue += '; includeSubDomains'
      }
      if (this.config.preload) {
        hstsValue += '; preload'
      }
      response.headers.set('Strict-Transport-Security', hstsValue)
    }

    // Content Security Policy
    if (this.config.contentSecurityPolicy) {
      response.headers.set('Content-Security-Policy', this.config.contentSecurityPolicy)
    }

    // X-Frame-Options (Clickjacking Protection)
    response.headers.set('X-Frame-Options', 'DENY')

    // X-Content-Type-Options (MIME Sniffing Protection)
    response.headers.set('X-Content-Type-Options', 'nosniff')

    // Referrer-Policy
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

    // X-XSS-Protection (Legacy browsers)
    response.headers.set('X-XSS-Protection', '1; mode=block')

    // Permissions-Policy (Feature Policy)
    response.headers.set(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=(), interest-cohort=()'
    )

    // Log security headers application
    if (request) {
      securityLogger.logInfo('Security headers applied', {
        endpoint: request.nextUrl.pathname,
        method: request.method,
        correlationId,
        headers: {
          hsts: this.config.enforceHttps,
          csp: !!this.config.contentSecurityPolicy,
          xFrameOptions: true,
          xContentTypeOptions: true
        }
      })
    }

    return response
  }

  /**
   * Check for security header violations
   */
  async checkSecurityViolations(request: NextRequest): Promise<string[]> {
    const violations: string[] = []
    const correlationId = generateCorrelationId()

    // Check for HTTPS in production
    if (this.config.enforceHttps && request.nextUrl.protocol === 'http:') {
      violations.push('HTTP request in production (HTTPS required)')
      
      await securityLogger.logSecurityViolation({
        type: 'SUSPICIOUS_ACTIVITY',
        severity: 'MEDIUM',
        description: 'HTTP request received in production environment',
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        endpoint: request.nextUrl.pathname,
        correlationId,
        metadata: {
          protocol: request.nextUrl.protocol,
          host: request.nextUrl.host,
          violation: 'HTTPS_REQUIRED'
        }
      })
    }

    // Check for missing security headers in request
    const requiredHeaders = ['user-agent']
    for (const header of requiredHeaders) {
      if (!request.headers.get(header)) {
        violations.push(`Missing required header: ${header}`)
      }
    }

    // Log violations
    if (violations.length > 0) {
      securityLogger.logWarn('Security header violations detected', {
        violations,
        endpoint: request.nextUrl.pathname,
        correlationId
      })
    }

    return violations
  }

  /**
   * Get default Content Security Policy
   */
  private getDefaultCSP(): string {
    const directives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://js.stripe.com https://challenges.cloudflare.com https://*.clerk.accounts.dev https://cdn.plaid.com https://us-assets.i.posthog.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://api.stripe.com https://api.clerk.com https://clerk.CreditRich.app https://*.clerk.accounts.dev https://production.plaid.com https://sandbox.plaid.com https://cdn.plaid.com https://generativelanguage.googleapis.com https://us.i.posthog.com https://us-assets.i.posthog.com",
      "frame-src 'self' https://js.stripe.com https://challenges.cloudflare.com https://accounts.google.com https://*.clerk.accounts.dev https://cdn.plaid.com",
      "worker-src 'self' blob:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests"
    ]

    return directives.join('; ')
  }

  /**
   * Create middleware wrapper for routes
   */
  withSecurityHeaders(
    handler: (req: NextRequest) => Promise<NextResponse>
  ): (req: NextRequest) => Promise<NextResponse> {
    return async (req: NextRequest) => {
      // Check for violations
      await this.checkSecurityViolations(req)

      // Execute handler
      const response = await handler(req)

      // Apply security headers
      return this.applySecurityHeaders(response, req)
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): SecurityHeadersConfig {
    return { ...this.config }
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<SecurityHeadersConfig>): void {
    Object.assign(this.config, config)
    securityLogger.logInfo('Security headers configuration updated', { config })
  }
}

// Singleton instance
export const securityHeaders = new SecurityHeadersService()

/**
 * Middleware wrapper for easy integration
 */
export function withSecurityHeaders(
  handler: (req: NextRequest) => Promise<NextResponse>
): (req: NextRequest) => Promise<NextResponse> {
  return securityHeaders.withSecurityHeaders(handler)
}

/**
 * Apply security headers to any response
 */
export function applySecurityHeaders(
  response: NextResponse,
  request?: NextRequest
): NextResponse {
  return securityHeaders.applySecurityHeaders(response, request)
}
