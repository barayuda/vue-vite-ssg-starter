/**
 * @module plugins/vite-api-middleware
 * @description Vite plugin for adding API middleware to the development server.
 * Handles custom API routes, CORS, rate limiting, and request/response logging during development.
 *
 * @packageDocumentation
 * This plugin can be published as a standalone npm package: `vite-plugin-api-middleware`
 */

import type { Plugin } from 'vite'
import type { ApiMiddlewarePluginOptions } from './types'

import { createApiMiddleware, logRequest } from './utils'

// Export types for external use
export type { RateLimitOptions } from './rate-limiter'
export type { ApiMiddlewarePluginOptions }

/**
 * @function apiMiddlewarePlugin
 * @description Creates a Vite plugin that adds API middleware to the development server.
 * Provides custom API route handling, CORS support, rate limiting, and request logging.
 *
 * @param {ApiMiddlewarePluginOptions} [options] - Plugin configuration options
 * @returns {Plugin} Vite plugin instance
 *
 * @example
 * ```typescript
 * // In vite.config.ts
 * import { apiMiddlewarePlugin } from '@plugins'
 *
 * export default defineConfig({
 *   plugins: [
 *     apiMiddlewarePlugin({
 *       enableLogging: true,
 *       enableCors: true,
 *       rateLimit: {
 *         windowMs: 15 * 60 * 1000, // 15 minutes
 *         max: 100 // limit each IP to 100 requests per windowMs
 *       },
 *       customRoutes: {
 *         '/api/health': (req, res) => {
 *           res.writeHead(200, { 'Content-Type': 'application/json' })
 *           res.end(JSON.stringify({ status: 'ok' }))
 *         }
 *       }
 *     })
 *   ]
 * })
 * ```
 *
 * @remarks
 * - Only active during development (serve command)
 * - Applies request logging middleware first
 * - Then applies API middleware with CORS, rate limiting, and custom routes
 * - Custom routes take precedence over proxy forwarding
 */
export function apiMiddlewarePlugin(options: ApiMiddlewarePluginOptions = {}): Plugin {
  const {
    enableLogging = true,
    enableCors = true,
    customRoutes = {},
  } = options

  return {
    name: 'vite-plugin-api-middleware',
    configureServer(server) {
      // Apply request logging middleware
      server.middlewares.use((req, res, next) => {
        if (enableLogging && req.url?.startsWith('/api/')) {
          logRequest(req, res)
        }
        next()
      })

      // Apply API middleware
      const apiMiddleware = createApiMiddleware({
        enableLogging,
        enableCors,
        customRoutes,
        rateLimit: options.rateLimit,
      })

      server.middlewares.use(apiMiddleware)
    },
  }
}
