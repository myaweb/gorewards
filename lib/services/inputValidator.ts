/**
 * Input Validator Service
 * 
 * Provides comprehensive input validation and sanitization
 * to prevent XSS, injection attacks, and invalid data.
 */

import { 
  InputValidator, 
  ValidationResult, 
  ValidationError, 
  ValidationSchema, 
  WebhookSource 
} from '@/lib/types/security'
import { securityLogger } from './securityLogger'
import { generateCorrelationId, generateSessionId } from '../utils/crypto'

export class InputValidatorService implements InputValidator {
  private readonly maxSpendingAmount = 1000000 // $1M CAD
  private readonly minSpendingAmount = 0

  // XSS patterns to detect and block
  private readonly xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi, // Event handlers like onclick=
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
    /eval\(/gi,
    /expression\(/gi
  ]

  // SQL injection patterns
  private readonly sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/gi,
    /(--|\;|\/\*|\*\/)/g,
    /(\bOR\b.*=.*)/gi,
    /(\bAND\b.*=.*)/gi
  ]

  /**
   * Validate and sanitize input based on schema
   */
  validateAndSanitize(input: any, schema: ValidationSchema): ValidationResult {
    const errors: ValidationError[] = []
    let sanitizedData = input

    try {
      // Type validation
      if (schema.type === 'string' && typeof input !== 'string') {
        errors.push({
          field: 'input',
          message: 'Input must be a string',
          code: 'INVALID_TYPE'
        })
        return { isValid: false, sanitizedData: null, errors }
      }

      if (schema.type === 'number' && typeof input !== 'number') {
        errors.push({
          field: 'input',
          message: 'Input must be a number',
          code: 'INVALID_TYPE'
        })
        return { isValid: false, sanitizedData: null, errors }
      }

      // String validations
      if (schema.type === 'string' && typeof input === 'string') {
        // Length validation
        if (schema.minLength && input.length < schema.minLength) {
          errors.push({
            field: 'input',
            message: `Input must be at least ${schema.minLength} characters`,
            code: 'MIN_LENGTH'
          })
        }

        if (schema.maxLength && input.length > schema.maxLength) {
          errors.push({
            field: 'input',
            message: `Input must be at most ${schema.maxLength} characters`,
            code: 'MAX_LENGTH'
          })
        }

        // Pattern validation
        if (schema.pattern && !schema.pattern.test(input)) {
          errors.push({
            field: 'input',
            message: 'Input does not match required pattern',
            code: 'INVALID_PATTERN'
          })
        }

        // Sanitize string
        sanitizedData = this.sanitizeTextInput(input)
      }

      // Number validations
      if (schema.type === 'number' && typeof input === 'number') {
        if (schema.min !== undefined && input < schema.min) {
          errors.push({
            field: 'input',
            message: `Input must be at least ${schema.min}`,
            code: 'MIN_VALUE'
          })
        }

        if (schema.max !== undefined && input > schema.max) {
          errors.push({
            field: 'input',
            message: `Input must be at most ${schema.max}`,
            code: 'MAX_VALUE'
          })
        }
      }

      // Object validation
      if (schema.type === 'object' && schema.properties) {
        const objectErrors: ValidationError[] = []
        const sanitizedObject: any = {}

        for (const [key, propSchema] of Object.entries(schema.properties)) {
          if (propSchema.required && !(key in input)) {
            objectErrors.push({
              field: key,
              message: `Field ${key} is required`,
              code: 'REQUIRED_FIELD'
            })
          } else if (key in input) {
            const result = this.validateAndSanitize(input[key], propSchema)
            if (!result.isValid) {
              objectErrors.push(...result.errors)
            }
            sanitizedObject[key] = result.sanitizedData
          }
        }

        errors.push(...objectErrors)
        sanitizedData = sanitizedObject
      }

      return {
        isValid: errors.length === 0,
        sanitizedData,
        errors
      }

    } catch (error) {
      securityLogger.logError('Input validation error', error as Error)
      return {
        isValid: false,
        sanitizedData: null,
        errors: [{
          field: 'input',
          message: 'Validation failed',
          code: 'VALIDATION_ERROR'
        }]
      }
    }
  }

  /**
   * Validate spending amount
   */
  validateSpendingAmount(amount: number): boolean {
    if (typeof amount !== 'number' || isNaN(amount)) {
      return false
    }

    if (amount < this.minSpendingAmount || amount > this.maxSpendingAmount) {
      return false
    }

    // Check for reasonable decimal places (max 2 for currency)
    const decimalPlaces = (amount.toString().split('.')[1] || '').length
    if (decimalPlaces > 2) {
      return false
    }

    return true
  }

  /**
   * Validate webhook payload
   */
  validateWebhookPayload(payload: any, source: WebhookSource): boolean {
    const correlationId = generateCorrelationId()

    try {
      if (!payload || typeof payload !== 'object') {
        securityLogger.logInputValidationFailure(
          JSON.stringify(payload),
          'Webhook payload must be an object',
          `/webhook/${source.toLowerCase()}`,
          correlationId
        )
        return false
      }

      // Source-specific validation
      switch (source) {
        case 'STRIPE':
          return this.validateStripeWebhook(payload, correlationId)
        case 'CLERK':
          return this.validateClerkWebhook(payload, correlationId)
        case 'PLAID':
          return this.validatePlaidWebhook(payload, correlationId)
        default:
          return false
      }

    } catch (error) {
      securityLogger.logError('Webhook validation error', error as Error, {
        source,
        correlationId
      })
      return false
    }
  }

  /**
   * Sanitize text input to prevent XSS
   */
  sanitizeTextInput(text: string): string {
    if (typeof text !== 'string') {
      return ''
    }

    let sanitized = text

    // Remove XSS patterns
    for (const pattern of this.xssPatterns) {
      sanitized = sanitized.replace(pattern, '')
    }

    // HTML encode special characters
    sanitized = sanitized
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')

    // Remove null bytes
    sanitized = sanitized.replace(/\0/g, '')

    // Trim whitespace
    sanitized = sanitized.trim()

    return sanitized
  }

  /**
   * Prevent XSS attacks
   */
  preventXSS(input: string): string {
    return this.sanitizeTextInput(input)
  }

  /**
   * Validate HTML content
   */
  validateHTML(html: string): boolean {
    // Check for dangerous patterns
    for (const pattern of this.xssPatterns) {
      if (pattern.test(html)) {
        return false
      }
    }

    return true
  }

  /**
   * Check for SQL injection patterns
   */
  private containsSQLInjection(input: string): boolean {
    for (const pattern of this.sqlPatterns) {
      if (pattern.test(input)) {
        return true
      }
    }
    return false
  }

  /**
   * Validate Stripe webhook payload
   */
  private validateStripeWebhook(payload: any, correlationId: string): boolean {
    // Stripe webhooks must have these fields
    const requiredFields = ['id', 'object', 'type', 'data']

    for (const field of requiredFields) {
      if (!(field in payload)) {
        securityLogger.logInputValidationFailure(
          JSON.stringify(payload),
          `Missing required field: ${field}`,
          '/webhook/stripe',
          correlationId
        )
        return false
      }
    }

    // Validate event type format
    if (typeof payload.type !== 'string' || !payload.type.includes('.')) {
      securityLogger.logInputValidationFailure(
        JSON.stringify(payload),
        'Invalid Stripe event type format',
        '/webhook/stripe',
        correlationId
      )
      return false
    }

    return true
  }

  /**
   * Validate Clerk webhook payload
   */
  private validateClerkWebhook(payload: any, correlationId: string): boolean {
    // Clerk webhooks must have these fields
    const requiredFields = ['type', 'data']

    for (const field of requiredFields) {
      if (!(field in payload)) {
        securityLogger.logInputValidationFailure(
          JSON.stringify(payload),
          `Missing required field: ${field}`,
          '/webhook/clerk',
          correlationId
        )
        return false
      }
    }

    // Validate event type
    if (typeof payload.type !== 'string') {
      securityLogger.logInputValidationFailure(
        JSON.stringify(payload),
        'Invalid Clerk event type',
        '/webhook/clerk',
        correlationId
      )
      return false
    }

    return true
  }

  /**
   * Validate Plaid webhook payload
   */
  private validatePlaidWebhook(payload: any, correlationId: string): boolean {
    // Plaid webhooks must have these fields
    const requiredFields = ['webhook_type', 'webhook_code', 'item_id']

    for (const field of requiredFields) {
      if (!(field in payload)) {
        securityLogger.logInputValidationFailure(
          JSON.stringify(payload),
          `Missing required field: ${field}`,
          '/webhook/plaid',
          correlationId
        )
        return false
      }
    }

    return true
  }

  /**
   * Validate email format
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * Validate URL format
   */
  validateURL(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  /**
   * Get validation configuration
   */
  getConfig() {
    return {
      maxSpendingAmount: this.maxSpendingAmount,
      minSpendingAmount: this.minSpendingAmount,
      xssPatternsCount: this.xssPatterns.length,
      sqlPatternsCount: this.sqlPatterns.length
    }
  }
}

// Singleton instance
export const inputValidator = new InputValidatorService()
