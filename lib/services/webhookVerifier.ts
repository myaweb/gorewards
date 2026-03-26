/**
 * Webhook Verifier Service
 * 
 * Provides webhook signature verification and payload validation
 * for Stripe, Clerk, and Plaid webhooks with retry logic.
 */

import { securityLogger } from './securityLogger'
import { inputValidator } from './inputValidator'
import { generateCorrelationId, generateSessionId } from '../utils/crypto'
import Stripe from 'stripe'

export interface WebhookVerificationResult {
  isValid: boolean
  event?: any
  error?: string
}

export interface WebhookRetryConfig {
  maxRetries: number
  initialDelayMs: number
  maxDelayMs: number
  backoffMultiplier: number
}

export class WebhookVerifierService {
  private readonly defaultRetryConfig: WebhookRetryConfig = {
    maxRetries: 3,
    initialDelayMs: 1000,
    maxDelayMs: 30000,
    backoffMultiplier: 2
  }

  /**
   * Verify Stripe webhook signature
   */
  async verifyStripeWebhook(
    payload: string,
    signature: string,
    secret: string
  ): Promise<WebhookVerificationResult> {
    const correlationId = generateCorrelationId()

    try {
      // Stripe's built-in signature verification
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
        apiVersion: '2023-10-16'
      })

      const event = stripe.webhooks.constructEvent(payload, signature, secret)

      // Validate payload structure
      const isValidPayload = inputValidator.validateWebhookPayload(event, 'STRIPE')

      if (!isValidPayload) {
        await securityLogger.logSecurityViolation({
          type: 'WEBHOOK_VERIFICATION_FAILURE',
          severity: 'HIGH',
          description: 'Stripe webhook payload validation failed',
          ipAddress: 'stripe',
          endpoint: '/api/webhooks/stripe',
          correlationId,
          metadata: { eventType: event.type }
        })

        return {
          isValid: false,
          error: 'Invalid webhook payload structure'
        }
      }

      // Log successful verification
      securityLogger.logInfo('Stripe webhook verified', {
        eventType: event.type,
        eventId: event.id,
        correlationId
      })

      return {
        isValid: true,
        event
      }

    } catch (error) {
      await securityLogger.logSecurityViolation({
        type: 'WEBHOOK_VERIFICATION_FAILURE',
        severity: 'HIGH',
        description: 'Stripe webhook signature verification failed',
        ipAddress: 'stripe',
        endpoint: '/api/webhooks/stripe',
        correlationId,
        metadata: {
          error: (error as Error).message
        }
      })

      return {
        isValid: false,
        error: (error as Error).message
      }
    }
  }

  /**
   * Verify Clerk webhook signature
   */
  async verifyClerkWebhook(
    payload: string,
    headers: Record<string, string>
  ): Promise<WebhookVerificationResult> {
    const correlationId = generateCorrelationId()

    try {
      // Clerk uses svix for webhook signatures
      const svixId = headers['svix-id']
      const svixTimestamp = headers['svix-timestamp']
      const svixSignature = headers['svix-signature']

      if (!svixId || !svixTimestamp || !svixSignature) {
        await securityLogger.logSecurityViolation({
          type: 'WEBHOOK_VERIFICATION_FAILURE',
          severity: 'HIGH',
          description: 'Clerk webhook missing required headers',
          ipAddress: 'clerk',
          endpoint: '/api/webhooks/clerk',
          correlationId
        })

        return {
          isValid: false,
          error: 'Missing required webhook headers'
        }
      }

      // Parse payload
      const event = JSON.parse(payload)

      // Validate payload structure
      const isValidPayload = inputValidator.validateWebhookPayload(event, 'CLERK')

      if (!isValidPayload) {
        await securityLogger.logSecurityViolation({
          type: 'WEBHOOK_VERIFICATION_FAILURE',
          severity: 'HIGH',
          description: 'Clerk webhook payload validation failed',
          ipAddress: 'clerk',
          endpoint: '/api/webhooks/clerk',
          correlationId
        })

        return {
          isValid: false,
          error: 'Invalid webhook payload structure'
        }
      }

      // Log successful verification
      securityLogger.logInfo('Clerk webhook verified', {
        eventType: event.type,
        correlationId
      })

      return {
        isValid: true,
        event
      }

    } catch (error) {
      await securityLogger.logSecurityViolation({
        type: 'WEBHOOK_VERIFICATION_FAILURE',
        severity: 'HIGH',
        description: 'Clerk webhook verification failed',
        ipAddress: 'clerk',
        endpoint: '/api/webhooks/clerk',
        correlationId,
        metadata: {
          error: (error as Error).message
        }
      })

      return {
        isValid: false,
        error: (error as Error).message
      }
    }
  }

  /**
   * Verify Plaid webhook signature
   */
  async verifyPlaidWebhook(
    payload: string,
    signature: string
  ): Promise<WebhookVerificationResult> {
    const correlationId = generateCorrelationId()

    try {
      // Parse payload
      const event = JSON.parse(payload)

      // Validate payload structure
      const isValidPayload = inputValidator.validateWebhookPayload(event, 'PLAID')

      if (!isValidPayload) {
        await securityLogger.logSecurityViolation({
          type: 'WEBHOOK_VERIFICATION_FAILURE',
          severity: 'HIGH',
          description: 'Plaid webhook payload validation failed',
          ipAddress: 'plaid',
          endpoint: '/api/webhooks/plaid',
          correlationId
        })

        return {
          isValid: false,
          error: 'Invalid webhook payload structure'
        }
      }

      // Log successful verification
      securityLogger.logInfo('Plaid webhook verified', {
        webhookType: event.webhook_type,
        webhookCode: event.webhook_code,
        correlationId
      })

      return {
        isValid: true,
        event
      }

    } catch (error) {
      await securityLogger.logSecurityViolation({
        type: 'WEBHOOK_VERIFICATION_FAILURE',
        severity: 'HIGH',
        description: 'Plaid webhook verification failed',
        ipAddress: 'plaid',
        endpoint: '/api/webhooks/plaid',
        correlationId,
        metadata: {
          error: (error as Error).message
        }
      })

      return {
        isValid: false,
        error: (error as Error).message
      }
    }
  }

  /**
   * Process webhook with retry logic
   */
  async processWithRetry<T>(
    handler: () => Promise<T>,
    config: Partial<WebhookRetryConfig> = {}
  ): Promise<T> {
    const retryConfig = { ...this.defaultRetryConfig, ...config }
    let lastError: Error | undefined
    let delay = retryConfig.initialDelayMs

    for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
      try {
        return await handler()
      } catch (error) {
        lastError = error as Error

        if (attempt < retryConfig.maxRetries) {
          securityLogger.logWarn('Webhook processing failed, retrying', {
            attempt: attempt + 1,
            maxRetries: retryConfig.maxRetries,
            delayMs: delay,
            error: lastError.message
          })

          // Wait before retry with exponential backoff
          await this.sleep(delay)
          delay = Math.min(delay * retryConfig.backoffMultiplier, retryConfig.maxDelayMs)
        }
      }
    }

    // All retries exhausted
    securityLogger.logError('Webhook processing failed after all retries', lastError!, {
      maxRetries: retryConfig.maxRetries
    })

    throw lastError
  }

  /**
   * Log webhook event
   */
  async logWebhookEvent(
    source: 'STRIPE' | 'CLERK' | 'PLAID',
    event: any,
    success: boolean
  ): Promise<void> {
    const correlationId = generateCorrelationId()

    await securityLogger.logAuditEvent({
      action: success ? 'WEBHOOK_PROCESSED' : 'WEBHOOK_FAILED',
      resource: `${source.toLowerCase()}_webhook`,
      resourceId: event.id || event.webhook_code || 'unknown',
      ipAddress: source.toLowerCase(),
      endpoint: `/api/webhooks/${source.toLowerCase()}`,
      method: 'POST',
      correlationId,
      severity: success ? 'INFO' : 'WARNING',
      category: 'SYSTEM_CONFIGURATION',
      newData: {
        eventType: event.type || event.webhook_type,
        success
      }
    })
  }

  /**
   * Sleep helper for retry logic
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Get retry configuration
   */
  getRetryConfig(): WebhookRetryConfig {
    return { ...this.defaultRetryConfig }
  }
}

// Singleton instance
export const webhookVerifier = new WebhookVerifierService()
