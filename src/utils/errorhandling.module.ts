/**
 * Creates a wrapper function that catches errors and provides fallback behavior
 * @param {Function} fn - The function to wrap with error handling
 * @param {Function} fallbackFn - The fallback function to call if an error occurs
 * @param {Function} errorHandler - Optional function to handle the error
 * @returns {Function} A wrapped function with error handling
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
 * Creates a safe version of a component method that won't crash the component
 * @param {object} component - The component instance
 * @param {string} methodName - The name of the method to make safe
 * @param {Function} fallbackFn - Optional fallback function
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
 * Safely executes a function and returns a default value if it fails
 * @param {Function} fn - The function to execute
 * @param {*} defaultValue - The default value to return if the function fails
 * @param {object} context - The context to bind the function to
 * @returns {*} The result of the function or the default value
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
 * Creates a safe version of a computed property that won't crash the component
 * @param {Function} computedFn - The computed property function
 * @param {*} fallbackValue - The fallback value to use if the computed property throws an error
 * @returns {Function} A safe computed property function
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
