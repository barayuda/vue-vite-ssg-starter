/**
 * @module plugins/vite-api-middleware/rate-limiter
 * @description Rate limiting middleware for vite-plugin-api-middleware.
 * Implements token bucket algorithm to prevent API abuse.
 */

import type { IncomingMessage, ServerResponse } from 'node:http'
import process from 'node:process'

/**
 * @interface RateLimitOptions
 * @description Configuration options for rate limiting.
 */
export interface RateLimitOptions {
  /** Maximum number of requests allowed (default: 100) */
  maxRequests?: number
  /** Time window in milliseconds (default: 60000 = 1 minute) */
  windowMs?: number
  /** Message to return when rate limit is exceeded (default: 'Too many requests') */
  message?: string
  /** Whether to include rate limit headers in response (default: true) */
  includeHeaders?: boolean
  /** Function to get client identifier (default: uses IP address) */
  keyGenerator?: (req: IncomingMessage) => string
  /** Routes to skip rate limiting (default: []) */
  skip?: string[]
}

interface RateLimitStore {
  count: number
  resetTime: number
}

/**
 * In-memory store for rate limit data
 * In production, consider using Redis or a distributed cache
 */
const store = new Map<string, RateLimitStore>()

/**
 * Clean up expired entries periodically
 */
const cleanupInterval = setInterval(() => {
  const now = Date.now()
  for (const [key, value] of store.entries()) {
    if (now > value.resetTime) {
      store.delete(key)
    }
  }
}, 60000) // Clean up every minute

// Clean up interval on process exit
if (typeof process !== 'undefined') {
  process.on('SIGTERM', () => clearInterval(cleanupInterval))
  process.on('SIGINT', () => clearInterval(cleanupInterval))
}

/**
 * @function getClientIdentifier
 * @description Gets a unique identifier for the client (IP address).
 * @param {IncomingMessage} req - HTTP request object
 * @returns {string} Client identifier
 */
function getClientIdentifier(req: IncomingMessage): string {
  // Try to get real IP from various headers (for proxied requests)
  const forwarded = req.headers['x-forwarded-for']
  const realIp = req.headers['x-real-ip']
  const remoteAddress = req.socket.remoteAddress

  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwarded.toString().split(',')[0].trim()
  }

  if (realIp) {
    return realIp.toString()
  }

  return remoteAddress || 'unknown'
}

/**
 * @function createRateLimiter
 * @description Creates rate limiting middleware using token bucket algorithm.
 *
 * @param {RateLimitOptions} [options] - Rate limiting configuration
 * @returns {Function} Express-style middleware function (req, res, next)
 *
 * @example
 * ```typescript
 * const rateLimiter = createRateLimiter({
 *   maxRequests: 100,
 *   windowMs: 60000, // 1 minute
 *   skip: ['/api/health']
 * })
 *
 * server.middlewares.use(rateLimiter)
 * ```
 *
 * @remarks
 * - Uses in-memory storage (not suitable for distributed systems)
 * - Automatically cleans up expired entries
 * - Includes rate limit headers in responses
 * - Supports custom key generation for different identification strategies
 */
export function createRateLimiter(options: RateLimitOptions = {}) {
  const {
    maxRequests = 100,
    windowMs = 60000, // 1 minute
    message = 'Too many requests, please try again later',
    includeHeaders = true,
    keyGenerator = getClientIdentifier,
    skip = [],
  } = options

  return (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    // Skip rate limiting for specified routes
    if (req.url && skip.some(path => req.url?.startsWith(path))) {
      return next()
    }

    // Only apply to API routes
    if (!req.url?.startsWith('/api/')) {
      return next()
    }

    const key = keyGenerator(req)
    const now = Date.now()

    // Get or create rate limit entry
    let entry = store.get(key)

    if (!entry || now > entry.resetTime) {
      // Create new entry or reset expired entry
      entry = {
        count: 0,
        resetTime: now + windowMs,
      }
      store.set(key, entry)
    }

    // Increment request count
    entry.count++

    // Calculate remaining requests
    const remaining = Math.max(0, maxRequests - entry.count)
    const resetTime = entry.resetTime

    // Add rate limit headers
    if (includeHeaders) {
      res.setHeader('X-RateLimit-Limit', maxRequests.toString())
      res.setHeader('X-RateLimit-Remaining', remaining.toString())
      res.setHeader('X-RateLimit-Reset', new Date(resetTime).toISOString())
      res.setHeader('Retry-After', Math.ceil((resetTime - now) / 1000).toString())
    }

    // Check if rate limit exceeded
    if (entry.count > maxRequests) {
      res.writeHead(429, {
        'Content-Type': 'application/json',
      })
      res.end(JSON.stringify({
        error: {
          message,
          statusCode: 429,
          timestamp: new Date().toISOString(),
        },
      }))
      return
    }

    // Continue to next middleware
    next()
  }
}

/**
 * @function resetRateLimit
 * @description Resets rate limit for a specific client (useful for testing).
 * @param {string} key - Client identifier
 */
export function resetRateLimit(key: string): void {
  store.delete(key)
}

/**
 * @function clearRateLimitStore
 * @description Clears all rate limit entries (useful for testing).
 */
export function clearRateLimitStore(): void {
  store.clear()
}

/**
 * @function getRateLimitInfo
 * @description Gets current rate limit information for a client (useful for debugging).
 * @param {string} key - Client identifier
 * @returns {RateLimitStore | undefined} Rate limit information
 */
export function getRateLimitInfo(key: string): RateLimitStore | undefined {
  return store.get(key)
}
