/**
 * @module plugins/vite-api-middleware/types
 * @description Type definitions for vite-plugin-api-middleware
 */

import type { IncomingMessage, ServerResponse } from 'node:http'
import type { RateLimitOptions } from './rate-limiter'

/**
 * @interface ApiMiddlewarePluginOptions
 * @description Configuration options for the API middleware plugin.
 */
export interface ApiMiddlewarePluginOptions {
  /** Enable request/response logging (default: true) */
  enableLogging?: boolean
  /** Enable CORS headers (default: true) */
  enableCors?: boolean
  /** Custom route handlers for specific API paths */
  customRoutes?: Record<string, (req: IncomingMessage, res: ServerResponse) => void>
  /** Rate limiting configuration, or false to disable */
  rateLimit?: RateLimitOptions | false
}
