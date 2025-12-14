/**
 * @module composables/useFetch
 * @description Enhanced fetch composable with automatic reactivity, error handling, and XSS protection.
 * Provides a reactive wrapper around the Fetch API with built-in sanitization, loading states, and error management.
 */

import type { ComputedRef, Ref } from 'vue'
import type { FetchError } from '../types/errors'
import { computed, onScopeDispose, ref, toValue, watchEffect } from 'vue'
import { createApiError, createNetworkError, createUnknownError } from '../types/errors'
import { sanitizeObject, sanitizeUrlParams } from '../utils/sanitize.module.js'

/**
 * @interface IUseFetchReturn
 * @template T - The type of the response data
 * @description Return type for the `useFetch` composable, containing reactive state and computed properties.
 */
export interface IUseFetchReturn<T = unknown> {
  /** The response data, null until request completes */
  data: Ref<T | null>
  /** Error information if request fails, null on success */
  error: Ref<FetchError | null>
  /** HTTP status code from the response */
  statusCode: Ref<number>
  /** HTTP status text from the response */
  statusText: Ref<string>
  /** Loading state indicator, true while request is in progress */
  isLoading: Ref<boolean>
  /** Finished state indicator, true when request completes (success or error) */
  isFinished: Ref<boolean>
  /** Computed property indicating if there's an error */
  isError: ComputedRef<boolean>
  /** Computed property indicating if request was successful */
  isSuccess: ComputedRef<boolean>
}

/**
 * @interface FetchOptions
 * @description Configuration options for fetch requests.
 */
interface FetchOptions {
  /** HTTP method (GET, POST, PUT, DELETE, etc.) */
  method?: string
  /** Custom headers to include in the request */
  headers?: Record<string, string>
  /** Request body (will be JSON stringified and sanitized) */
  body?: unknown
  /** Query parameters to append to the URL */
  query?: Record<string, unknown>
  /** Path parameters to replace in the URL (e.g., :id -> value) */
  params?: Record<string, string>
}

/**
 * @function useFetch
 * @template T - The expected type of the response data
 * @description Enhanced fetch composable with automatic reactivity, error handling, and XSS protection.
 * Automatically refetches when URL or options change, sanitizes all inputs, and provides comprehensive error handling.
 *
 * @param {string | Ref<string>} url - The URL to fetch from (can be reactive)
 * @param {FetchOptions} [options] - Fetch configuration options
 * @returns {IUseFetchReturn<T>} Reactive state object with data, error, and loading indicators
 *
 * @example
 * ```typescript
 * // Basic usage
 * const { data, isLoading, error } = useFetch<User>('/api/user/123')
 *
 * // With query parameters
 * const { data } = useFetch('/api/search', {
 *   query: { q: 'vue', limit: 10 }
 * })
 *
 * // With path parameters
 * const { data } = useFetch('/api/users/:id', {
 *   params: { id: '123' }
 * })
 *
 * // POST request with body
 * const { data, isSuccess } = useFetch('/api/users', {
 *   method: 'POST',
 *   body: { name: 'John', email: 'john@example.com' }
 * })
 * ```
 *
 * @throws {NetworkError} When network request fails (offline, CORS, etc.)
 * @throws {ApiError} When server returns error status (4xx, 5xx)
 * @throws {UnknownError} For other unexpected errors
 *
 * @remarks
 * - Automatically watches URL and options for changes and refetches
 * - All inputs (body, query params, URL params) are sanitized to prevent XSS
 * - Cleans up watchers when component unmounts
 * - Handles both absolute and relative URLs
 * - Skips JSON parsing for 204 No Content responses
 */
export function useFetch<T = unknown>(url: string | Ref<string>, options: FetchOptions = {}): IUseFetchReturn<T> {
  const data = ref<T | null>(null)
  const error = ref<FetchError | null>(null)
  const statusCode = ref(200)
  const statusText = ref('')
  const isLoading = ref(false)
  const isFinished = ref(false)

  const stop = watchEffect(async () => {
    // reset state before fetching..
    data.value = null
    error.value = null
    isLoading.value = true
    isFinished.value = false

    const urlValue = toValue(url)
    const optionsValue = toValue(options)

    try {
      // Build URL with query parameters
      // Check if URL is absolute or relative
      let finalUrl
      try {
        // Try to create URL as absolute first
        finalUrl = new URL(urlValue)
      }
      catch {
        // Intentionally ignore error: fallback to relative URL if absolute URL creation fails
        // Only use window.location.origin in browser environment
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://api.pbahotels.com/megaworld/mtp'
        finalUrl = new URL(urlValue, baseUrl)
      }

      // Add sanitized query parameters
      if ('query' in optionsValue && optionsValue.query) {
        const sanitizedQuery = sanitizeUrlParams(optionsValue.query)
        Object.entries(sanitizedQuery).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            finalUrl.searchParams.append(key, value)
          }
        })
      }

      // Add sanitized path parameters (replace :param in URL)
      let urlWithParams = finalUrl.toString()
      if ('params' in optionsValue && optionsValue.params) {
        const sanitizedParams = sanitizeUrlParams(optionsValue.params)
        Object.entries(sanitizedParams).forEach(([key, value]) => {
          urlWithParams = urlWithParams.replace(`:${key}`, value)
        })
      }

      // Build fetch options
      const fetchOptions = {
        method: ('method' in optionsValue ? optionsValue.method : 'GET') as string,
        headers: {
          'Content-Type': 'application/json',
          ...('headers' in optionsValue && typeof optionsValue.headers === 'object' ? optionsValue.headers : {}),
        },
        ...('body' in optionsValue && typeof optionsValue.body === 'object' ? { body: JSON.stringify(optionsValue.body) } : {}),
      }

      // Add sanitized body for non-GET requests
      if ('body' in optionsValue && optionsValue.body && fetchOptions.method !== 'GET') {
        // Sanitize the request body to prevent XSS and injection attacks
        const sanitizedBody = sanitizeObject(optionsValue.body)
        fetchOptions.body = ('body' in optionsValue && typeof optionsValue.body === 'string')
          ? optionsValue.body
          : JSON.stringify(sanitizedBody)
      }

      // Execute the fetch request
      const res = await fetch(urlWithParams, fetchOptions)

      // Store status information
      statusCode.value = res.status
      statusText.value = res.statusText

      // Check if response is ok (status in the range 200-299)
      if (!res.ok) {
        // Create a more detailed error object
        const errorData = {
          status: res.status,
          statusText: res.statusText,
          url: urlWithParams,
          method: fetchOptions.method,
        }

        try {
          // Try to parse error response body
          (errorData as any).body = await res.json()
        }
        catch (parseError) {
          // If parsing fails, store the text or error
          try {
            (errorData as any).body = await res.text() || parseError
          }
          catch (textError) {
            (errorData as any).body = textError || 'Could not parse error response'
          }
        }

        throw new Error(JSON.stringify(errorData))
      }

      // Parse successful response
      if (res.status !== 204) { // Skip parsing for No Content responses
        data.value = await res.json()
      }
    }
    catch (e) {
      // Enhanced error handling with proper types
      if (e instanceof TypeError && e.message.includes('Failed to fetch')) {
        // Network error (offline, CORS, etc)
        error.value = createNetworkError(e)
      }
      else if ((e as Error).message && (e as Error).message.startsWith('{')) {
        // Our custom error with response details
        try {
          const parsedError = JSON.parse((e as Error).message)
          error.value = createApiError(
            parsedError.status,
            parsedError.statusText || 'Unknown error',
            parsedError.body,
            parsedError.url,
            parsedError.method,
            e as Error,
          )
        }
        catch (parseErr) {
          error.value = createUnknownError(parseErr)
        }
      }
      else {
        // Other errors
        error.value = createUnknownError(e)
      }
    }
    finally {
      isLoading.value = false
      isFinished.value = true
    }
  })

  // Cleanup watcher when component unmounts
  onScopeDispose(() => {
    stop()
  })

  return {
    data,
    error,
    statusCode,
    statusText,
    isLoading,
    isFinished,
    // Helper methods
    isError: computed(() => error.value !== null),
    isSuccess: computed(() => isFinished.value && error.value === null),
  }
}
