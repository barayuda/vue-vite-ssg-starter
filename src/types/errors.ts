/**
 * Error type definitions for better type safety
 */

export interface BaseError extends Error {
  type: ErrorType
  originalError?: Error
  timestamp?: Date
}

export interface NetworkError extends BaseError {
  type: 'network'
  message: string
  originalError: TypeError
}

export interface ApiError extends BaseError {
  type: 'api'
  status: number
  statusText: string
  details?: unknown
  url?: string
  method?: string
  originalError: Error
}

export interface UnknownError extends BaseError {
  type: 'unknown'
  message: string
  originalError?: Error
}

export type ErrorType = 'network' | 'api' | 'unknown'

export type FetchError = NetworkError | ApiError | UnknownError

/**
 * Type guard to check if error is a NetworkError
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
 * Type guard to check if error is an ApiError
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
 * Type guard to check if error is an UnknownError
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
 * Type guard to check if error is a FetchError
 */
export function isFetchError(error: unknown): error is FetchError {
  return isNetworkError(error) || isApiError(error) || isUnknownError(error)
}

/**
 * Creates a NetworkError from a TypeError
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
 * Creates an ApiError from response details
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
 * Creates an UnknownError from an error
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
