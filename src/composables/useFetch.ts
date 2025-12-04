import type { ComputedRef, Ref } from 'vue'
import type { FetchError } from '../types/errors'
import { computed, onScopeDispose, ref, toValue, watchEffect } from 'vue'
import { createApiError, createNetworkError, createUnknownError } from '../types/errors'
import { sanitizeObject, sanitizeUrlParams } from '../utils/sanitize.module.js'

/**
 * Interface for the return object of useFetch composable
 */
export interface IUseFetchReturn<T = unknown> {
  /** The response data */
  data: Ref<T | null>
  /** Error information if request fails */
  error: Ref<FetchError | null>
  /** HTTP status code */
  statusCode: Ref<number>
  /** HTTP status text */
  statusText: Ref<string>
  /** Loading state indicator */
  isLoading: Ref<boolean>
  /** Finished state indicator */
  isFinished: Ref<boolean>
  /** Computed property indicating if there's an error */
  isError: ComputedRef<boolean>
  /** Computed property indicating if request was successful */
  isSuccess: ComputedRef<boolean>
}

interface FetchOptions {
  method?: string
  headers?: Record<string, string>
  body?: unknown
  query?: Record<string, unknown>
  params?: Record<string, string>
}

/**
 * Enhanced fetch composable with improved error handling
 * @param url - The URL to fetch from
 * @param options - Fetch options
 * @returns Fetch state and data
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
