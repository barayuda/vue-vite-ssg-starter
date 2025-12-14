/**
 * @module utils/sanitize
 * @description XSS protection utilities for sanitizing user input and API responses.
 * Provides functions to remove dangerous HTML tags, scripts, and event handlers from strings and objects.
 */

/* eslint-disable regexp/no-super-linear-backtracking */

/**
 * @function sanitizeString
 * @description Sanitizes a string by removing potentially dangerous HTML tags and scripts.
 * When `allow_html` is true, only specified tags and attributes are preserved.
 * Scripts and event handlers are always removed unless `allow_script` is true.
 *
 * @param {string} str - The string to sanitize
 * @param {object} [options] - Configuration options
 * @param {boolean} [options.allow_html] - Whether to allow specific HTML tags
 * @param {boolean} [options.allow_script] - Whether to allow script tags and handlers
 * @param {string[]} [options.allowed_tags] - Array of allowed HTML tag names
 * @param {string[]} [options.allowed_attributes] - Array of allowed HTML attributes
 * @returns {string} The sanitized string
 *
 * @example
 * ```typescript
 * // Remove all HTML
 * sanitizeString('<script>alert("xss")</script>Hello')
 * // Returns: 'Hello'
 *
 * // Allow specific HTML tags
 * sanitizeString('<p>Hello <strong>world</strong></p>', {
 *   allow_html: true,
 *   allowed_tags: ['p', 'strong']
 * })
 * // Returns: '<p>Hello <strong>world</strong></p>'
 * ```
 *
 * @throws {TypeError} Returns input as-is if not a string
 *
 * @remarks
 * - Always removes script tags and javascript: URLs unless allow_script is true
 * - Removes inline event handlers (onclick, onerror, etc.) unless allow_script is true
 * - Preserves allowed attributes only when allow_html is true
 */
export function sanitizeString(str: string, options: {
  allow_html: boolean
  allow_script: boolean
  allowed_tags: string[]
  allowed_attributes: string[]
} = {
  allow_html: false,
  allow_script: false,
  allowed_tags: ['p', 'br', 'strong', 'em', 'u', 'span', 'a'],
  allowed_attributes: ['class', 'id'],
}): string {
  if (typeof str !== 'string')
    return str

  let sanitized = str

  if (options.allow_html && options.allowed_tags?.length > 0) {
    // Create regex pattern for allowed tags
    const allowedTagsPattern = options.allowed_tags.join('|')
    const tagRegex = new RegExp(`<(?!\/?(?:${allowedTagsPattern})(?:\\s[^>]*)?>)[^>]+>`, 'gi')

    // Remove only non-allowed HTML tags
    sanitized = sanitized.replace(tagRegex, '')

    // Clean up attributes if allowed_attributes is specified
    if (options.allowed_attributes?.length > 0) {
      const allowedAttrsPattern = options.allowed_attributes.join('|')
      const attrRegex = new RegExp(`\\s(?!(?:${allowedAttrsPattern})=)[\\w-]+=["\'][^"\']*["\']`, 'gi')
      sanitized = sanitized.replace(attrRegex, '')
    }
    else {
      // Remove all attributes if none are allowed
      sanitized = sanitized.replace(/(<[^>]+)\s[^>]*>/g, '$1>')
    }
  }
  else {
    // Remove all HTML tags
    sanitized = sanitized.replace(/<[^>]+(>|$)/g, '')
  }

  if (!options.allow_script) {
    // Remove script tags and their content
    sanitized = sanitized.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '')
    // Remove inline event handlers
    sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
    // Remove javascript: URLs
    sanitized = sanitized.replace(/javascript\s*:/gi, '')
  }

  return sanitized
}

interface SanitizeOptions {
  allow_html?: boolean
  allow_script?: boolean
  allowed_tags?: string[]
  allowed_attributes?: string[]
}

/**
 * @interface SanitizeOptions
 * @description Options for sanitization functions.
 */
interface SanitizeOptions {
  allow_html?: boolean
  allow_script?: boolean
  allowed_tags?: string[]
  allowed_attributes?: string[]
}

/**
 * @function sanitizeObject
 * @description Recursively sanitizes all string values in an object or array.
 * Creates a new object/array with sanitized values, leaving non-string values unchanged.
 *
 * @param {unknown[] | Record<string, unknown> | null} obj - The object or array to sanitize
 * @param {SanitizeOptions} [options] - Sanitization options to pass to sanitizeString
 * @returns {unknown} A new object/array with sanitized string values
 *
 * @example
 * ```typescript
 * const userInput = {
 *   name: '<script>alert("xss")</script>John',
 *   email: 'john@example.com',
 *   bio: '<p>My bio</p>'
 * }
 *
 * const sanitized = sanitizeObject(userInput)
 * // Returns: { name: 'John', email: 'john@example.com', bio: 'My bio' }
 * ```
 *
 * @remarks
 * - Returns input as-is if not an object or array
 * - Handles nested objects and arrays recursively
 * - Non-string values (numbers, booleans, null) are preserved
 */
export function sanitizeObject(obj: unknown[] | Record<string, unknown> | null, options: SanitizeOptions = {}): unknown {
  if (!obj || typeof obj !== 'object' || obj === null)
    return obj

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, options))
  }

  // Handle regular objects
  const result: Record<string, unknown> = {}
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key]

      if (typeof value === 'string') {
        result[key] = sanitizeString(value, {
          allow_html: false,
          allow_script: false,
          allowed_tags: ['p', 'br', 'strong', 'em', 'u', 'span', 'a'],
          allowed_attributes: ['class', 'id'],
          ...options,
        })
      }
      else if (typeof value === 'object' && value !== null) {
        result[key] = sanitizeObject(value, options)
      }
      else {
        result[key] = value
      }
    }
  }

  return result
}

/**
 * Sanitizes URL parameters to prevent injection attacks
 * @param params - The URL parameters object
 * @returns A sanitized URL parameters object
 */
export function sanitizeUrlParams(params: Record<string, unknown>): Record<string, unknown> {
  if (!params || typeof params !== 'object')
    return {}

  const result: Record<string, unknown> = {}
  for (const key in params) {
    if (Object.prototype.hasOwnProperty.call(params, key)) {
      const value = params[key]

      if (typeof value === 'string') {
        // Encode URI component and then sanitize the string
        result[key] = sanitizeString(encodeURIComponent(value))
      }
      else if (typeof value === 'number' || typeof value === 'boolean') {
        // Numbers and booleans are safe to pass directly
        result[key] = value
      }
      else if (value === null || value === undefined) {
        // Null and undefined are safe to pass directly
        result[key] = value
      }
      else {
        // For objects or arrays, stringify and sanitize
        result[key] = sanitizeString(JSON.stringify(sanitizeObject(value)))
      }
    }
  }

  return result
}
