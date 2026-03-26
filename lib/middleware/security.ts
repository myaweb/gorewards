/**
 * Security Middleware
 * 
 * Comprehensive security middleware that applies input validation,
 * rate limiting, and security logging to all API routes.
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { rateLimiter } from '@/lib/services/rateLimiter'
import { inputValidator } from '@/lib/services/inputValidator'
import { securityLogger } from '@/lib/services/securityLogger'
import { generateCorrelationId } from '@/lib/utils/crypto'

/**
 * Apply rate limiting to a request
 */
export async function withRateLimit(
  request: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  const correlationId = generateCorrelationId()
  const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  const endpoint = request.nextUrl.pathname
  const { userId } = auth()

  try {
    // Check IP-based rate limit first
    const ipAllowed = await rateLimiter.checkIPLimit(ipAddress)
    if (!ipAllowed) {
      return NextResponse.json(
        {
          error: 'Too many requests from this IP address',
          code: 'RATE_LIMIT_EXCEEDED',
          retryAfter: 60
        },
        {
          status: 429,
          headers: {
            'Retry-After': '60',
            'X-RateLimit-Limit': '100',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(Date.now() + 60000).toISOString()
          }
        }
      )
    }

    // Check endpoint-specific rate limit
    if (userId) {
      const result = await rateLimiter.checkCombinedLimit(userId, ipAddress, endpoint)
      
      if (!result.allowed) {
        return NextResponse.json(
          {
            error: 'Rate limit exceeded',
            code: 'RATE_LIMIT_EXCEEDED',
            retryAfter: result.retryAfter
          },
          {
            status: 429,
            headers: {
              'Retry-After': result.retryAfter?.toString() || '60',
              'X-RateLimit-Remaining': result.remaining.toString(),
              'X-RateLimit-Reset': result.resetTime.toISOString()
            }
          }
        )
      }
    }

    // Rate limit passed - proceed with request
    return handler(request)

  } catch (error) {
    securityLogger.logError('Rate limit middleware error', error as Error, {
      endpoint,
      ipAddress,
      correlationId
    })

    // On error, allow request but log the issue
    return handler(request)
  }
}

/**
 * Apply input validation to request body
 */
export async function withInputValidation(
  request: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  const correlationId = generateCorrelationId()
  const endpoint = request.nextUrl.pathname

  try {
    // Only validate POST, PUT, PATCH requests with body
    if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
      const contentType = request.headers.get('content-type')
      
      if (contentType?.includes('application/json')) {
        try {
          const body = await request.json()
          
          // Validate spending amounts if present
          if (body.amount !== undefined) {
            if (!inputValidator.validateSpendingAmount(body.amount)) {
              await securityLogger.logInputValidationFailure(
                JSON.stringify(body.amount),
                'Invalid spending amount',
                endpoint,
                correlationId
              )

              return NextResponse.json(
                {
                  error: 'Invalid spending amount',
                  code: 'INVALID_INPUT',
                  details: 'Amount must be between 0 and 1,000,000'
                },
                { status: 400 }
              )
            }
          }

          // Sanitize text inputs
          const sanitizedBody = sanitizeObject(body)
          
          // Create new request with sanitized body
          const sanitizedRequest = new NextRequest(request.url, {
            method: request.method,
            headers: request.headers,
            body: JSON.stringify(sanitizedBody)
          })

          return handler(sanitizedRequest)

        } catch (error) {
          // Invalid JSON
          await securityLogger.logInputValidationFailure(
            'invalid-json',
            'Request body is not valid JSON',
            endpoint,
            correlationId
          )

          return NextResponse.json(
            {
              error: 'Invalid request body',
              code: 'INVALID_JSON'
            },
            { status: 400 }
          )
        }
      }
    }

    // No validation needed or validation passed
    return handler(request)

  } catch (error) {
    securityLogger.logError('Input validation middleware error', error as Error, {
      endpoint,
      correlationId
    })

    // On error, allow request but log the issue
    return handler(request)
  }
}

/**
 * Apply comprehensive security (rate limiting + input validation)
 */
export async function withSecurity(
  request: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  // Apply rate limiting first
  return withRateLimit(request, async (rateLimitedReq) => {
    // Then apply input validation
    return withInputValidation(rateLimitedReq, handler)
  })
}

/**
 * Sanitize an object recursively
 */
function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    return inputValidator.sanitizeTextInput(obj)
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item))
  }

  if (obj !== null && typeof obj === 'object') {
    const sanitized: any = {}
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value)
    }
    return sanitized
  }

  return obj
}

/**
 * Create a secured route handler
 */
export function createSecureRoute(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    return withSecurity(req, handler)
  }
}

/**
 * Webhook validation middleware
 */
export async function withWebhookValidation(
  request: NextRequest,
  source: 'STRIPE' | 'CLERK' | 'PLAID',
  handler: (req: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  const correlationId = generateCorrelationId()
  const endpoint = request.nextUrl.pathname

  try {
    const body = await request.json()

    // Validate webhook payload structure
    const isValid = inputValidator.validateWebhookPayload(body, source)

    if (!isValid) {
      await securityLogger.logSecurityViolation({
        type: 'WEBHOOK_VERIFICATION_FAILURE',
        severity: 'HIGH',
        description: `Invalid ${source} webhook payload`,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        endpoint,
        correlationId
      })

      return NextResponse.json(
        {
          error: 'Invalid webhook payload',
          code: 'INVALID_WEBHOOK'
        },
        { status: 400 }
      )
    }

    // Create new request with validated body
    const validatedRequest = new NextRequest(request.url, {
      method: request.method,
      headers: request.headers,
      body: JSON.stringify(body)
    })

    return handler(validatedRequest)

  } catch (error) {
    securityLogger.logError('Webhook validation error', error as Error, {
      source,
      endpoint,
      correlationId
    })

    return NextResponse.json(
      {
        error: 'Webhook validation failed',
        code: 'VALIDATION_ERROR'
      },
      { status: 500 }
    )
  }
}

/**
 * Create a secured webhook route handler
 */
export function createSecureWebhookRoute(
  source: 'STRIPE' | 'CLERK' | 'PLAID',
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    return withWebhookValidation(req, source, handler)
  }
}
