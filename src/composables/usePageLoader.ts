/**
 * @module composables/usePageLoader
 * @description Composable for easy integration with the page loader system.
 * Provides convenient methods to show/hide loaders and track loading states.
 */

import { onScopeDispose, watch } from 'vue'
import { usePageLoaderStore } from '/@/stores/page-loader.store'

/**
 * @interface UsePageLoaderOptions
 * @description Configuration options for the usePageLoader composable.
 */
export interface UsePageLoaderOptions {
  /** Automatically show loader when isLoading becomes true */
  autoShow?: boolean
  /** Automatically hide loader when isLoading becomes false */
  autoHide?: boolean
  /** Initial message to display */
  message?: string
  /** Delay before showing loader (ms) */
  delay?: number
}

/**
 * @interface UsePageLoaderReturn
 * @description Return type for the usePageLoader composable.
 */
export interface UsePageLoaderReturn {
  /** Show the loader */
  show: (message?: string) => void
  /** Hide the loader */
  hide: () => void
  /** Set loading message */
  setMessage: (message: string | null) => void
  /** Set progress (0-100) */
  setProgress: (progress: number) => void
  /** Whether loader is currently active */
  isLoading: ReturnType<typeof usePageLoaderStore>['isLoading']
  /** Current loading message */
  message: ReturnType<typeof usePageLoaderStore>['message']
  /** Current progress value */
  progress: ReturnType<typeof usePageLoaderStore>['progress']
}

/**
 * @function usePageLoader
 * @description Composable for easy integration with the page loader system.
 * Provides convenient methods and automatic cleanup on component unmount.
 *
 * @param {UsePageLoaderOptions} [options] - Configuration options
 * @param {Ref<boolean> | (() => boolean)} [isLoading] - Reactive loading state to sync with
 * @returns {UsePageLoaderReturn} Object with loader methods and state
 *
 * @example
 * ```typescript
 * // Basic usage
 * const { show, hide } = usePageLoader()
 * show('Loading...')
 * hide()
 *
 * // Auto-sync with loading state
 * const { isLoading } = useFetch('/api/data')
 * usePageLoader({ autoShow: true, autoHide: true }, isLoading)
 *
 * // With message
 * const loader = usePageLoader({ message: 'Initializing...' })
 * loader.show()
 * ```
 */
export function usePageLoader(
  options: UsePageLoaderOptions = {},
  isLoading?: import('vue').Ref<boolean> | (() => boolean),
): UsePageLoaderReturn {
  const {
    autoShow = false,
    autoHide = false,
    message: initialMessage,
    delay = 0,
  } = options

  const store = usePageLoaderStore()

  // Set initial message if provided
  if (initialMessage)
    store.setMessage(initialMessage)

  // Auto-sync with external loading state
  if (isLoading) {
    const getLoadingState = typeof isLoading === 'function' ? isLoading : () => isLoading.value

    let showTimer: ReturnType<typeof setTimeout> | null = null

    const stopWatcher = watch(
      getLoadingState,
      (loading) => {
        if (showTimer)
          clearTimeout(showTimer)

        if (loading) {
          if (autoShow) {
            showTimer = setTimeout(() => {
              store.show()
            }, delay)
          }
        }
        else {
          if (autoHide)
            store.hide()
        }
      },
      { immediate: true },
    )

    onScopeDispose(() => {
      stopWatcher()
      if (showTimer)
        clearTimeout(showTimer)
      store.hide()
    })
  }

  return {
    show: (message?: string) => store.show(message),
    hide: () => store.hide(),
    setMessage: (msg: string | null) => store.setMessage(msg),
    setProgress: (progress: number) => store.setProgress(progress),
    isLoading: store.isLoading,
    message: store.message,
    progress: store.progress,
  }
}
