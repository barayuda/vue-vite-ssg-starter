import { describe, expect, it } from 'vitest'
import {
  createApiError,
  createNetworkError,
  createUnknownError,
  isApiError,
  isFetchError,
  isNetworkError,
  isUnknownError,
} from '../errors'

describe('error Types', () => {
  describe('createNetworkError', () => {
    it('should create a NetworkError from TypeError', () => {
      const originalError = new TypeError('Failed to fetch')
      const error = createNetworkError(originalError)

      expect(isNetworkError(error)).toBe(true)
      expect(error.type).toBe('network')
      expect(error.message).toBe('Network error: Unable to connect to the server')
      expect(error.originalError).toBe(originalError)
      expect(error.timestamp).toBeInstanceOf(Date)
    })
  })

  describe('createApiError', () => {
    it('should create an ApiError with all properties', () => {
      const error = createApiError(
        404,
        'Not Found',
        { detail: 'Resource not found' },
        'https://api.example.com/resource',
        'GET',
      )

      expect(isApiError(error)).toBe(true)
      expect(error.type).toBe('api')
      expect(error.status).toBe(404)
      expect(error.statusText).toBe('Not Found')
      expect(error.details).toEqual({ detail: 'Resource not found' })
      expect(error.url).toBe('https://api.example.com/resource')
      expect(error.method).toBe('GET')
      expect(error.timestamp).toBeInstanceOf(Date)
    })

    it('should create an ApiError with minimal properties', () => {
      const error = createApiError(500, 'Internal Server Error')

      expect(isApiError(error)).toBe(true)
      expect(error.status).toBe(500)
      expect(error.statusText).toBe('Internal Server Error')
    })
  })

  describe('createUnknownError', () => {
    it('should create an UnknownError from Error', () => {
      const originalError = new Error('Something went wrong')
      const error = createUnknownError(originalError)

      expect(isUnknownError(error)).toBe(true)
      expect(error.type).toBe('unknown')
      expect(error.message).toBe('Something went wrong')
      expect(error.originalError).toBe(originalError)
    })

    it('should create an UnknownError from non-Error value', () => {
      const error = createUnknownError('String error')

      expect(isUnknownError(error)).toBe(true)
      expect(error.message).toBe('String error')
    })
  })

  describe('type Guards', () => {
    it('isNetworkError should correctly identify NetworkError', () => {
      const error = createNetworkError(new TypeError('Failed to fetch'))
      expect(isNetworkError(error)).toBe(true)
      expect(isApiError(error)).toBe(false)
      expect(isUnknownError(error)).toBe(false)
    })

    it('isApiError should correctly identify ApiError', () => {
      const error = createApiError(404, 'Not Found')
      expect(isApiError(error)).toBe(true)
      expect(isNetworkError(error)).toBe(false)
      expect(isUnknownError(error)).toBe(false)
    })

    it('isUnknownError should correctly identify UnknownError', () => {
      const error = createUnknownError(new Error('Unknown'))
      expect(isUnknownError(error)).toBe(true)
      expect(isNetworkError(error)).toBe(false)
      expect(isApiError(error)).toBe(false)
    })

    it('isFetchError should identify all error types', () => {
      const networkError = createNetworkError(new TypeError('Failed to fetch'))
      const apiError = createApiError(500, 'Server Error')
      const unknownError = createUnknownError(new Error('Unknown'))

      expect(isFetchError(networkError)).toBe(true)
      expect(isFetchError(apiError)).toBe(true)
      expect(isFetchError(unknownError)).toBe(true)
      expect(isFetchError({ type: 'invalid' })).toBe(false)
    })
  })
})
