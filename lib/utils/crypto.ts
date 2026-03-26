/**
 * Crypto Utilities
 * 
 * Edge Runtime compatible crypto functions
 * Works in both Node.js and Edge Runtime environments
 */

/**
 * Generate random bytes as hex string
 * Compatible with both Node.js and Edge Runtime
 * 
 * @param length - Number of bytes to generate
 * @returns Hex string
 */
export function randomBytes(length: number): string {
  // Check if we're in Edge Runtime or Node.js
  if (typeof globalThis.crypto !== 'undefined' && globalThis.crypto.getRandomValues) {
    // Edge Runtime / Browser - use Web Crypto API
    const bytes = new Uint8Array(length)
    globalThis.crypto.getRandomValues(bytes)
    return Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  } else {
    // Node.js - use crypto module
    const crypto = require('crypto')
    return crypto.randomBytes(length).toString('hex')
  }
}

/**
 * Generate a random UUID
 * Compatible with both Node.js and Edge Runtime
 * 
 * @returns UUID string
 */
export function randomUUID(): string {
  // Check if we're in Edge Runtime or Node.js
  if (typeof globalThis.crypto !== 'undefined' && globalThis.crypto.randomUUID) {
    // Edge Runtime / Browser - use Web Crypto API
    return globalThis.crypto.randomUUID()
  } else {
    // Node.js - use crypto module
    const crypto = require('crypto')
    return crypto.randomUUID()
  }
}

/**
 * Generate a correlation ID (16 bytes hex)
 * Compatible with both Node.js and Edge Runtime
 * 
 * @returns 32-character hex string
 */
export function generateCorrelationId(): string {
  return randomBytes(16)
}

/**
 * Generate a session ID (32 bytes hex)
 * Compatible with both Node.js and Edge Runtime
 * 
 * @returns 64-character hex string
 */
export function generateSessionId(): string {
  return randomBytes(32)
}

/**
 * Generate a random token (variable length)
 * Compatible with both Node.js and Edge Runtime
 * 
 * @param length - Number of bytes
 * @returns Hex string
 */
export function generateToken(length: number = 32): string {
  return randomBytes(length)
}
