/**
 * @module stores/page-loader
 * @description Pinia store for managing global page loader state.
 * Provides centralized loading state management with progress tracking and message display.
 */

import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

/**
 * @interface _LoadingState
 * @description Represents the current loading state with optional metadata.
 * @private
 */
interface _LoadingState {
  /** Whether the loader is currently active */
  isLoading: boolean
  /** Optional message to display */
  message?: string
  /** Progress value (0-100) */
  progress?: number
  /** Timestamp when loading started */
  startTime?: number
}

/**
 * @function usePageLoaderStore
 * @description Pinia store for managing global page loader state.
 * Provides reactive loading state, progress tracking, and message management.
 *
 * @returns {object} Store API with state and methods
 * @returns {Ref<boolean>} returns.isLoading - Whether loader is currently active
 * @returns {Ref<string | null>} returns.message - Current loading message
 * @returns {Ref<number>} returns.progress - Current progress (0-100)
 * @returns {ComputedRef<boolean>} returns.hasMessage - Whether a message is set
 * @returns {Function} returns.show - Show the loader with optional message
 * @returns {Function} returns.hide - Hide the loader
 * @returns {Function} returns.setProgress - Update progress value
 * @returns {Function} returns.setMessage - Update loading message
 * @returns {Function} returns.reset - Reset all state to initial values
 *
 * @example
 * ```typescript
 * const loader = usePageLoaderStore()
 *
 * // Show loader with message
 * loader.show('Loading data...')
 *
 * // Update progress
 * loader.setProgress(50)
 *
 * // Hide loader
 * loader.hide()
 * ```
 *
 * @remarks
 * - State is automatically hydrated during SSR
 * - Progress is automatically reset when hiding
 * - Multiple show() calls stack (requires equal hide() calls)
 * - Provides loading duration tracking
 */
export const usePageLoaderStore = defineStore('pageLoader', () => {
  const loadingStack = ref<number>(0)
  const message = ref<string | null>(null)
  const progress = ref<number>(0)
  const startTime = ref<number | null>(null)

  const isLoading = computed(() => loadingStack.value > 0)
  const hasMessage = computed(() => message.value !== null && message.value.length > 0)
  const loadingDuration = computed(() => {
    if (!startTime.value)
      return 0
    return Date.now() - startTime.value
  })

  /**
   * @function show
   * @description Show the page loader. Can be called multiple times (stacks).
   * Only hides when hide() is called an equal number of times.
   *
   * @param {string} [msg] - Optional message to display
   * @returns {void}
   *
   * @example
   * ```typescript
   * loader.show('Loading...')
   * // Later...
   * loader.show('Still loading...') // Updates message but doesn't change state
   * ```
   */
  function show(msg?: string) {
    if (loadingStack.value === 0) {
      startTime.value = Date.now()
      progress.value = 0
    }

    loadingStack.value++
    if (msg !== undefined)
      message.value = msg
  }

  /**
   * @function hide
   * @description Hide the page loader. Must be called equal times to show().
   * Only actually hides when stack reaches 0.
   *
   * @returns {void}
   *
   * @example
   * ```typescript
   * loader.show()
   * loader.show() // Stack = 2
   * loader.hide() // Stack = 1, still loading
   * loader.hide() // Stack = 0, now hidden
   * ```
   */
  function hide() {
    if (loadingStack.value > 0)
      loadingStack.value--

    if (loadingStack.value === 0) {
      message.value = null
      progress.value = 0
      startTime.value = null
    }
  }

  /**
   * @function setProgress
   * @description Update the progress value (0-100).
   *
   * @param {number} value - Progress value between 0 and 100
   * @returns {void}
   *
   * @throws {Error} If value is not between 0 and 100
   *
   * @example
   * ```typescript
   * loader.setProgress(50) // 50% complete
   * ```
   */
  function setProgress(value: number) {
    if (value < 0 || value > 100)
      throw new Error('Progress must be between 0 and 100')

    progress.value = Math.round(value)
  }

  /**
   * @function setMessage
   * @description Update the loading message.
   *
   * @param {string | null} msg - Message to display, or null to clear
   * @returns {void}
   *
   * @example
   * ```typescript
   * loader.setMessage('Processing...')
   * loader.setMessage(null) // Clear message
   * ```
   */
  function setMessage(msg: string | null) {
    message.value = msg
  }

  /**
   * @function reset
   * @description Reset all state to initial values.
   * Forces hide and clears all data.
   *
   * @returns {void}
   *
   * @example
   * ```typescript
   * loader.reset() // Force reset everything
   * ```
   */
  function reset() {
    loadingStack.value = 0
    message.value = null
    progress.value = 0
    startTime.value = null
  }

  return {
    isLoading,
    message,
    progress,
    startTime,
    hasMessage,
    loadingDuration,
    show,
    hide,
    setProgress,
    setMessage,
    reset,
  }
})
