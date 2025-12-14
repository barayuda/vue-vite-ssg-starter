/**
 * @module types/errors
 * @description Type-safe error definitions for fetch operations and API interactions.
 * Provides structured error types with type guards and factory functions for creating errors.
 */

/**
 * @interface BaseError
 * @extends Error
 * @description Base interface for all custom error types in the application.
 */
export interface BaseError extends Error {
  /** Type discriminator for error classification */
  type: ErrorType
  /** Original error that caused this error (if any) */
  originalError?: Error
  /** Timestamp when the error occurred */
  timestamp?: Date
}

/**
 * @interface NetworkError
 * @extends BaseError
 * @description Error type for network-related failures (offline, CORS, connection refused, etc.).
 */
export interface NetworkError extends BaseError {
  type: 'network'
  message: string
  /** Original TypeError from fetch (usually "Failed to fetch") */
  originalError: TypeError
}

/**
 * @interface ApiError
 * @extends BaseError
 * @description Error type for API responses with error status codes (4xx, 5xx).
 */
export interface ApiError extends BaseError {
  type: 'api'
  /** HTTP status code from the response */
  status: number
  /** HTTP status text from the response */
  statusText: string
  /** Additional error details from the response body */
  details?: unknown
  /** URL that was requested */
  url?: string
  /** HTTP method used for the request */
  method?: string
  /** Original error object */
  originalError: Error
}

/**
 * @interface UnknownError
 * @extends BaseError
 * @description Error type for unexpected or unclassified errors.
 */
export interface UnknownError extends BaseError {
  type: 'unknown'
  message: string
  /** Original error that caused this error (if any) */
  originalError?: Error
}

/**
 * @typedef {('network' | 'api' | 'unknown')} ErrorType
 * @description Union type of all possible error type discriminator values.
 */
export type ErrorType = 'network' | 'api' | 'unknown'

/**
 * @typedef {(NetworkError | ApiError | UnknownError)} FetchError
 * @description Union type of all fetch-related error types.
 */
export type FetchError = NetworkError | ApiError | UnknownError

/**
 * @function isNetworkError
 * @description Type guard to check if an error is a NetworkError.
 *
 * @param {unknown} error - The error to check
 * @returns {error is NetworkError} True if the error is a NetworkError
 *
 * @example
 * ```typescript
 * if (isNetworkError(error)) {
 *   console.log('Network error:', error.originalError)
 * }
 * ```
 */
export function isNetworkError(error: unknown): error is NetworkError {
  return (
    typeof error === 'object'
    && error !== null
    && 'type' in error
    && (error as BaseError).type === 'network'
  )
}

/**
 * @function isApiError
 * @description Type guard to check if an error is an ApiError.
 *
 * @param {unknown} error - The error to check
 * @returns {error is ApiError} True if the error is an ApiError
 *
 * @example
 * ```typescript
 * if (isApiError(error)) {
 *   console.log('API error:', error.status, error.statusText)
 * }
 * ```
 */
export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object'
    && error !== null
    && 'type' in error
    && (error as BaseError).type === 'api'
  )
}

/**
 * @function isUnknownError
 * @description Type guard to check if an error is an UnknownError.
 *
 * @param {unknown} error - The error to check
 * @returns {error is UnknownError} True if the error is an UnknownError
 */
export function isUnknownError(error: unknown): error is UnknownError {
  return (
    typeof error === 'object'
    && error !== null
    && 'type' in error
    && (error as BaseError).type === 'unknown'
  )
}

/**
 * @function isFetchError
 * @description Type guard to check if an error is any type of FetchError.
 *
 * @param {unknown} error - The error to check
 * @returns {error is FetchError} True if the error is a FetchError (any type)
 */
export function isFetchError(error: unknown): error is FetchError {
  return isNetworkError(error) || isApiError(error) || isUnknownError(error)
}

/**
 * @function createNetworkError
 * @description Factory function to create a NetworkError from a TypeError.
 * Typically used when fetch fails due to network issues (offline, CORS, connection refused).
 *
 * @param {TypeError} originalError - The original TypeError from fetch
 * @returns {NetworkError} A properly formatted NetworkError object
 *
 * @example
 * ```typescript
 * try {
 *   await fetch('https://api.example.com/data')
 * } catch (e) {
 *   if (e instanceof TypeError && e.message.includes('Failed to fetch')) {
 *     const networkError = createNetworkError(e)
 *     // Handle network error
 *   }
 * }
 * ```
 */
export function createNetworkError(originalError: TypeError): NetworkError {
  return {
    name: 'NetworkError',
    type: 'network',
    message: 'Network error: Unable to connect to the server',
    originalError,
    timestamp: new Date(),
  }
}

/**
 * @function createApiError
 * @description Factory function to create an ApiError from HTTP response details.
 * Used when the server returns an error status code (4xx, 5xx).
 *
 * @param {number} status - HTTP status code
 * @param {string} statusText - HTTP status text
 * @param {unknown} [details] - Additional error details from response body
 * @param {string} [url] - URL that was requested
 * @param {string} [method] - HTTP method used
 * @param {Error} [originalError] - Original error object
 * @returns {ApiError} A properly formatted ApiError object
 *
 * @example
 * ```typescript
 * const response = await fetch('/api/users')
 * if (!response.ok) {
 *   const errorBody = await response.json()
 *   const apiError = createApiError(
 *     response.status,
 *     response.statusText,
 *     errorBody,
 *     response.url,
 *     'GET'
 *   )
 *   // Handle API error
 * }
 * ```
 */
export function createApiError(
  status: number,
  statusText: string,
  details?: unknown,
  url?: string,
  method?: string,
  originalError?: Error,
): ApiError {
  return {
    name: 'ApiError',
    type: 'api',
    status,
    statusText,
    message: `API Error: ${statusText || 'Unknown error'}`,
    details,
    url,
    method,
    originalError: originalError || new Error(statusText),
    timestamp: new Date(),
  }
}

/**
 * @function createUnknownError
 * @description Factory function to create an UnknownError from any error.
 * Used as a fallback for errors that don't fit into NetworkError or ApiError categories.
 *
 * @param {Error | unknown} error - The error to convert
 * @returns {UnknownError} A properly formatted UnknownError object
 *
 * @example
 * ```typescript
 * try {
 *   // Some operation
 * } catch (e) {
 *   const unknownError = createUnknownError(e)
 *   // Handle unknown error
 * }
 * ```
 */
export function createUnknownError(error: Error | unknown): UnknownError {
  const originalError = error instanceof Error ? error : new Error(String(error))
  return {
    name: 'UnknownError',
    type: 'unknown',
    message: originalError.message || 'An unknown error occurred',
    originalError,
    timestamp: new Date(),
  }
}
