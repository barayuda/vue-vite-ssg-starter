/**
 * @module utils/errorhandling
 * @description Error handling utilities for creating safe, fault-tolerant functions.
 * Provides wrappers and helpers to prevent errors from crashing components or breaking user experience.
 */

/**
 * @function withErrorHandling
 * @description Creates a wrapper function that catches errors and provides fallback behavior.
 * Useful for wrapping component methods or event handlers to prevent crashes.
 *
 * @template T - Array type of function arguments
 * @template R - Return type of the function
 * @param {(...args: T) => R} fn - The function to wrap with error handling
 * @param {((...args: [...T, Error]) => R) | null} fallbackFn - The fallback function to call if an error occurs
 * @param {(error: Error) => void} [errorHandler] - Optional function to handle the error
 * @returns {(...args: T) => R} A wrapped function with error handling
 *
 * @example
 * ```typescript
 * const safeHandler = withErrorHandling(
 *   (value: string) => {
 *     return processValue(value)
 *   },
 *   (value: string, error: Error) => {
 *     console.error('Error processing:', error)
 *     return defaultValue
 *   },
 *   (error) => {
 *     logError(error)
 *   }
 * )
 * ```
 *
 * @remarks
 * - If fallbackFn is null, returns undefined on error
 * - Error handler is called before fallback function
 * - Preserves function context (this binding)
 */
export function withErrorHandling<T extends unknown[], R>(
  fn: (...args: T) => R,
  fallbackFn: ((...args: [...T, Error]) => R) | null,
  errorHandler?: (error: Error) => void,
): (...args: T) => R {
  return function errorHandlingWrapper(this: any, ...args: T): R {
    try {
      return fn.apply(this, args)
    }
    catch (error) {
      // Call error handler if provided
      if (typeof errorHandler === 'function') {
        errorHandler(error instanceof Error ? error : new Error(String(error)))
      }
      else {
        console.error('Error in component function:', error)
      }

      // Return fallback value
      return typeof fallbackFn === 'function'
        ? fallbackFn.apply(this, [...args, error instanceof Error ? error : new Error(String(error))])
        : (undefined as R)
    }
  }
}

/**
 * @function makeSafeMethod
 * @description Creates a safe version of a component method that won't crash the component.
 * Wraps the method with error handling, replacing the original method in place.
 *
 * @param {Record<string, any>} component - The component instance
 * @param {string} methodName - The name of the method to make safe
 * @param {(...args: any[]) => any} [fallbackFn] - Optional fallback function
 *
 * @example
 * ```typescript
 * makeSafeMethod(this, 'handleClick', () => {
 *   console.log('Error in handleClick')
 * })
 * ```
 *
 * @remarks
 * - Does nothing if method doesn't exist
 * - Replaces the original method with the safe version
 * - Logs errors to console by default
 */
export function makeSafeMethod(
  component: Record<string, any>,
  methodName: string,
  fallbackFn: (...args: any[]) => any,
) {
  if (!component || typeof component[methodName] !== 'function') {
    return
  }

  const originalMethod = component[methodName]

  component[methodName] = withErrorHandling(
    originalMethod,
    fallbackFn || (() => {}),
    (error) => {
      console.error(`Error in ${methodName}:`, error)
    },
  )
}

/**
 * @function safeExecute
 * @description Safely executes a function and returns a default value if it fails.
 * Useful for safely calling functions that might throw errors.
 *
 * @template T - Return type of the function
 * @template Args - Array type of function arguments
 * @param {(...args: Args) => T} fn - The function to execute
 * @param {T} [defaultValue] - The default value to return if the function fails
 * @param {object | null} [context] - The context to bind the function to
 * @returns {T} The result of the function or the default value
 *
 * @example
 * ```typescript
 * const result = safeExecute(
 *   () => riskyOperation(),
 *   'default value'
 * )
 * ```
 *
 * @remarks
 * - Returns defaultValue if fn is not a function
 * - Logs errors to console
 * - Can bind function to a context object
 */
export function safeExecute<T, Args extends any[]>(fn: (...args: Args) => T, defaultValue: T = null as T, context: object | null = null): T {
  if (typeof fn !== 'function') {
    return defaultValue
  }

  try {
    return context ? fn.call(context, ...[] as unknown as Args) : fn(...[] as unknown as Args)
  }
  catch (error) {
    console.error('Error executing function:', error)
    return defaultValue
  }
}

/**
 * @function safeComputed
 * @description Creates a safe version of a computed property that won't crash the component.
 * Returns a function that wraps the computed logic with error handling.
 *
 * @template T - Return type of the computed property
 * @param {() => T} computedFn - The computed property function
 * @param {T} [fallbackValue] - The fallback value to use if the computed property throws an error
 * @returns {() => T} A safe computed property function
 *
 * @example
 * ```typescript
 * const safeComputedValue = safeComputed(
 *   () => complexCalculation(),
 *   'default'
 * )
 *
 * const value = safeComputedValue()
 * ```
 *
 * @remarks
 * - Logs errors to console
 * - Returns fallback value on error
 * - Preserves function context (this binding)
 */
export function safeComputed<T>(computedFn: () => T, fallbackValue: T = null as T): () => T {
  return function safeComputedWrapper(this: any) {
    try {
      return computedFn.call(this)
    }
    catch (error) {
      console.error('Error in computed property:', error)
      return fallbackValue
    }
  }
}

export default {
  withErrorHandling,
  makeSafeMethod,
  safeExecute,
  safeComputed,
}
