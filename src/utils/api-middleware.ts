/**
 * @module utils/api-middleware
 * @description API middleware for Vite development server.
 * Provides request/response logging, CORS handling, error management, and custom API route support.
 */

import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Connect } from 'vite'
import type { RateLimitOptions } from './rate-limiter'
import { createRateLimiter } from './rate-limiter'

/**
 * @interface ApiMiddlewareOptions
 * @description Configuration options for API middleware.
 */
interface ApiMiddlewareOptions {
  /** Enable request/response logging (default: true) */
  enableLogging?: boolean
  /** Enable CORS headers (default: true) */
  enableCors?: boolean
  /** Custom route handlers for specific API paths */
  customRoutes?: Record<string, (req: IncomingMessage, res: ServerResponse) => void>
  /** Rate limiting configuration (optional) */
  rateLimit?: RateLimitOptions | false
}

/**
 * @function createApiMiddleware
 * @description Creates Express-style middleware for handling API requests in Vite dev server.
 * Handles CORS, logging, custom routes, and passes other requests to the next middleware (proxy).
 *
 * @param {ApiMiddlewareOptions} [options] - Middleware configuration options
 * @returns {Function} Express-style middleware function (req, res, next)
 *
 * @example
 * ```typescript
 * const middleware = createApiMiddleware({
 *   enableLogging: true,
 *   enableCors: true,
 *   customRoutes: {
 *     '/api/health': (req, res) => {
 *       res.writeHead(200, { 'Content-Type': 'application/json' })
 *       res.end(JSON.stringify({ status: 'ok' }))
 *     }
 *   }
 * })
 *
 * server.middlewares.use(middleware)
 * ```
 *
 * @remarks
 * - Only processes requests starting with `/api/`
 * - Handles OPTIONS preflight requests automatically
 * - Custom routes take precedence over proxy forwarding
 * - Errors in custom routes are caught and handled gracefully
 */
export function createApiMiddleware(options: ApiMiddlewareOptions = {}) {
  const {
    enableLogging = true,
    enableCors = true,
    customRoutes = {},
    rateLimit,
  } = options

  // Create rate limiter if configured
  const rateLimiter = rateLimit !== false && rateLimit
    ? createRateLimiter(rateLimit)
    : null

  return (req: IncomingMessage, res: ServerResponse, next: Connect.NextFunction) => {
    // Skip non-API requests
    if (!req.url?.startsWith('/api/')) {
      return next()
    }

    // Apply rate limiting if configured
    if (rateLimiter) {
      return rateLimiter(req, res, () => {
        // Continue to main middleware after rate limit check passes
        processMiddleware()
      })
    }
    else {
      // No rate limiting, continue directly
      processMiddleware()
    }

    function processMiddleware() {
    // Handle CORS
      if (enableCors) {
        const origin = req.headers.origin || '*'
        res.setHeader('Access-Control-Allow-Origin', origin)
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
        res.setHeader('Access-Control-Allow-Credentials', 'true')
        res.setHeader('Access-Control-Max-Age', '86400')

        // Handle preflight requests
        if (req.method === 'OPTIONS') {
          res.writeHead(200)
          res.end()
          return
        }
      }

      // Log request
      if (enableLogging) {
        const timestamp = new Date().toISOString()
        const method = req.method || 'GET'
        const url = req.url
        console.log(`[API] ${timestamp} ${method} ${url}`)
      }

      // Check for custom route handlers
      const routePath = req.url?.split('?')[0] || '' // Remove query string
      const customHandler = customRoutes[routePath]

      if (customHandler) {
        try {
          customHandler(req, res)
        }
        catch (error) {
          handleError(error, res, enableLogging)
        }
        return
      }

      // Default: pass to next middleware (proxy will handle it)
      next()
    }
  }
}

/**
 * @function handleError
 * @private
 * @description Internal error handler for API middleware.
 * Logs errors and sends standardized error responses.
 *
 * @param {unknown} error - The error that occurred
 * @param {ServerResponse} res - HTTP response object
 * @param {boolean} enableLogging - Whether to log the error
 *
 * @remarks
 * - Always sends 500 status code
 * - Includes error message and timestamp in response
 * - Logs stack trace if available and logging is enabled
 */
function handleError(
  error: unknown,
  res: ServerResponse,
  enableLogging: boolean,
) {
  const statusCode = 500
  const errorMessage = error instanceof Error ? error.message : 'Internal Server Error'
  const errorStack = error instanceof Error ? error.stack : undefined

  if (enableLogging) {
    console.error('[API Error]', {
      message: errorMessage,
      stack: errorStack,
      timestamp: new Date().toISOString(),
    })
  }

  res.writeHead(statusCode, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({
    error: {
      message: errorMessage,
      statusCode,
      timestamp: new Date().toISOString(),
    },
  }))
}

/**
 * @function logRequest
 * @description Logs HTTP requests with colored status codes and response times.
 * Attaches a listener to the response 'finish' event to log after the request completes.
 *
 * @param {IncomingMessage} req - HTTP request object
 * @param {ServerResponse} res - HTTP response object
 *
 * @example
 * ```typescript
 * server.middlewares.use((req, res, next) => {
 *   logRequest(req, res)
 *   next()
 * })
 * ```
 *
 * @remarks
 * - Status codes are color-coded: green (2xx), cyan (3xx), yellow (4xx), red (5xx)
 * - Logs include method, URL, status code, and duration
 * - Only logs after response is sent (via 'finish' event)
 */
export function logRequest(req: IncomingMessage, res: ServerResponse) {
  const startTime = Date.now()

  res.on('finish', () => {
    const duration = Date.now() - startTime
    const method = req.method || 'GET'
    const url = req.url || ''
    const statusCode = res.statusCode

    const statusColor = statusCode >= 500
      ? '\x1B[31m' // Red
      : statusCode >= 400
        ? '\x1B[33m' // Yellow
        : statusCode >= 300
          ? '\x1B[36m' // Cyan
          : '\x1B[32m' // Green

    console.log(
      `${statusColor}${method}\x1B[0m ${url} \x1B[90m${statusCode}\x1B[0m - ${duration}ms`,
    )
  })
}

/**
 * @function addResponseHeaders
 * @description Adds custom headers to an HTTP response.
 * Useful for adding security headers, CORS headers, or custom metadata.
 *
 * @param {ServerResponse} res - HTTP response object
 * @param {Record<string, string>} headers - Object mapping header names to values
 *
 * @example
 * ```typescript
 * addResponseHeaders(res, {
 *   'X-Custom-Header': 'value',
 *   'Cache-Control': 'no-cache'
 * })
 * ```
 */
export function addResponseHeaders(
  res: ServerResponse,
  headers: Record<string, string>,
) {
  Object.entries(headers).forEach(([key, value]) => {
    res.setHeader(key, value)
  })
}
