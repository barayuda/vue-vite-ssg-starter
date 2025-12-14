/**
 * @module utils/env-security
 * @description Environment variable security utilities.
 * Validates and warns about potentially insecure environment variable usage.
 */

import process from 'node:process'

/**
 * @interface EnvSecurityOptions
 * @description Configuration options for environment variable security checks.
 */
export interface EnvSecurityOptions {
  /** Whether to throw errors on security violations (default: false in dev, true in prod) */
  strict?: boolean
  /** Whether to log warnings (default: true) */
  logWarnings?: boolean
  /** Custom list of sensitive variable names to check */
  sensitivePatterns?: string[]
}

/**
 * Default patterns that indicate sensitive environment variables
 */
const DEFAULT_SENSITIVE_PATTERNS = [
  /password/i,
  /secret/i,
  /key/i,
  /token/i,
  /auth/i,
  /credential/i,
  /api[_-]?key/i,
  /private/i,
  /access[_-]?token/i,
  /refresh[_-]?token/i,
]

/**
 * @function isSensitiveVariable
 * @description Checks if a variable name indicates sensitive data.
 * @param {string} varName - Environment variable name
 * @param {RegExp[]} patterns - Patterns to match against
 * @returns {boolean} True if variable appears sensitive
 */
function isSensitiveVariable(varName: string, patterns: RegExp[]): boolean {
  return patterns.some(pattern => pattern.test(varName))
}

/**
 * @function checkVitePrefix
 * @description Checks if a variable uses VITE_ prefix (exposed to client).
 * @param {string} varName - Environment variable name
 * @returns {boolean} True if variable has VITE_ prefix
 */
function checkVitePrefix(varName: string): boolean {
  return varName.startsWith('VITE_')
}

/**
 * @function validateEnvironmentVariables
 * @description Validates environment variables for security issues.
 * Warns or throws errors for potentially insecure configurations.
 *
 * @param {EnvSecurityOptions} [options] - Validation options
 * @returns {void}
 *
 * @example
 * ```typescript
 * // In vite.config.ts
 * import { validateEnvironmentVariables } from './src/utils/env-security'
 *
 * validateEnvironmentVariables({
 *   strict: process.env.NODE_ENV === 'production',
 *   logWarnings: true
 * })
 * ```
 *
 * @remarks
 * - Checks for sensitive variables with VITE_ prefix (exposed to client)
 * - Warns about potential security issues
 * - Can throw errors in strict mode (recommended for production builds)
 */
export function validateEnvironmentVariables(options: EnvSecurityOptions = {}): void {
  const {
    strict = process.env.NODE_ENV === 'production',
    logWarnings = true,
    sensitivePatterns = DEFAULT_SENSITIVE_PATTERNS,
  } = options

  const violations: Array<{ name: string, reason: string }> = []

  // Check all environment variables
  for (const [key, value] of Object.entries(process.env)) {
    // Check if sensitive variable is exposed via VITE_ prefix
    if (checkVitePrefix(key) && isSensitiveVariable(key, sensitivePatterns)) {
      violations.push({
        name: key,
        reason: `Sensitive variable "${key}" uses VITE_ prefix and will be exposed to client code. Use a non-VITE_ variable for sensitive data.`,
      })
    }

    // Check if value contains sensitive-looking data
    if (value && value.length > 0) {
      // Check for common sensitive patterns in values
      if (/^[A-Z0-9]{32,}$/i.test(value) && isSensitiveVariable(key, sensitivePatterns)) {
        // Looks like a token/secret
        if (checkVitePrefix(key)) {
          violations.push({
            name: key,
            reason: `Variable "${key}" appears to contain sensitive data (token/secret) and uses VITE_ prefix. This will be exposed to client code.`,
          })
        }
      }
    }
  }

  // Handle violations
  if (violations.length > 0) {
    const message = `\n⚠️  Environment Variable Security Violations Detected:\n\n${violations.map(v => `  • ${v.name}: ${v.reason}`).join('\n')}\n\n`

    if (strict) {
      throw new Error(`Environment variable security violations:\n${message}\nFix these issues before building for production.`)
    }
    else if (logWarnings) {
      console.warn(`\x1B[33m${message}\x1B[0m`)
      console.warn('\x1B[33m⚠️  These variables will be exposed to client code. Consider using server-side environment variables instead.\x1B[0m\n')
    }
  }
}

/**
 * @function getSecureEnvVar
 * @description Safely gets an environment variable with validation.
 * Throws error if variable is required but not set (in strict mode).
 *
 * @param {string} varName - Environment variable name
 * @param {object} options - Options
 * @param {string} [options.defaultValue] - Default value if variable is not set
 * @param {boolean} [options.required] - Whether variable is required (default: false)
 * @param {boolean} [options.allowVitePrefix] - Whether to allow VITE_ prefix (default: true)
 * @returns {string | undefined} Environment variable value
 *
 * @example
 * ```typescript
 * // Safe: non-VITE_ variable (server-side only)
 * const apiKey = getSecureEnvVar('API_KEY', { required: true, allowVitePrefix: false })
 *
 * // Client-safe: VITE_ variable (exposed to client)
 * const apiUrl = getSecureEnvVar('VITE_API_URL', { defaultValue: 'http://localhost:3000' })
 * ```
 */
export function getSecureEnvVar(
  varName: string,
  options: {
    defaultValue?: string
    required?: boolean
    allowVitePrefix?: boolean
  } = {},
): string | undefined {
  const {
    defaultValue,
    required = false,
    allowVitePrefix = true,
  } = options

  const value = process.env[varName]

  // Check if variable is required but not set
  if (required && !value && !defaultValue) {
    throw new Error(`Required environment variable "${varName}" is not set`)
  }

  // Check if VITE_ prefix is allowed
  if (!allowVitePrefix && varName.startsWith('VITE_')) {
    throw new Error(`Environment variable "${varName}" uses VITE_ prefix which exposes it to client code. Use a non-VITE_ variable for sensitive data.`)
  }

  return value || defaultValue
}

/**
 * @function sanitizeEnvForClient
 * @description Creates a sanitized object of environment variables safe for client exposure.
 * Only includes VITE_ prefixed variables and removes sensitive data.
 *
 * @param {string[]} [additionalSensitiveKeys] - Additional keys to exclude
 * @returns {Record<string, string>} Sanitized environment variables
 *
 * @example
 * ```typescript
 * // In your app, expose only safe variables
 * const clientEnv = sanitizeEnvForClient(['VITE_API_URL'])
 * ```
 */
export function sanitizeEnvForClient(additionalSensitiveKeys: string[] = []): Record<string, string> {
  const sensitiveKeys = new Set([
    ...additionalSensitiveKeys,
    // Add common sensitive patterns
    ...Object.keys(process.env).filter(key =>
      isSensitiveVariable(key, DEFAULT_SENSITIVE_PATTERNS) && !key.startsWith('VITE_'),
    ),
  ])

  const clientEnv: Record<string, string> = {}

  for (const [key, value] of Object.entries(process.env)) {
    // Only include VITE_ prefixed variables
    if (key.startsWith('VITE_') && !sensitiveKeys.has(key)) {
      clientEnv[key] = value || ''
    }
  }

  return clientEnv
}
