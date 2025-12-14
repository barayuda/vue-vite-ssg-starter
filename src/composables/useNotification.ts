/**
 * @module composables/useNotification
 * @description Centralized notification system for displaying user messages.
 * Provides a reactive notification queue with auto-dismiss functionality, type-based styling,
 * and keyboard accessibility support.
 */

import { reactive, readonly, ref } from 'vue'

/**
 * @constant NotificationType
 * @description Notification types map for better type safety and tree-shaking.
 * Used to categorize notifications and apply appropriate styling.
 */
export const NotificationType = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
} as const

/**
 * @typedef {string} NotificationTypeValue
 * @description Union type of all valid notification type values.
 */
export type NotificationTypeValue = typeof NotificationType[keyof typeof NotificationType]

/**
 * @function useNotification
 * @description Creates a notification system instance with methods to display and manage notifications.
 * Each instance maintains its own notification queue. A global instance is exported for app-wide use.
 *
 * @returns {object} Notification system API with state and methods:
 *   - {Readonly<Ref<Array>>} notifications - Readonly reactive array of active notifications
 *   - {Function} notify - Add a new notification with full options
 *   - {Function} showNotification - Alias for notify (backward compatibility)
 *   - {Function} dismiss - Dismiss a notification by ID
 *   - {Function} clearAll - Clear all notifications
 *   - {Function} success - Convenience method for success notifications
 *   - {Function} error - Convenience method for error notifications
 *   - {Function} warning - Convenience method for warning notifications
 *   - {Function} info - Convenience method for info notifications
 *
 * @example
 * ```typescript
 * // Using the global instance
 * import { useNotification } from '@/composables/useNotification'
 * const { success, error } = useNotification()
 *
 * success('Operation completed successfully!')
 * error('Something went wrong', 0) // 0 = no auto-dismiss
 *
 * // Or create a local instance
 * const notification = useNotification()
 * notification.notify({
 *   type: NotificationType.WARNING,
 *   message: 'Please review your changes',
 *   timeout: 7000
 * })
 * ```
 *
 * @remarks
 * - Notifications are automatically removed from the queue when dismissed
 * - Auto-dismiss timeout can be set per notification (0 = no auto-dismiss)
 * - Invalid messages are rejected with console warnings
 * - Notifications include timestamps for tracking
 */
export function useNotification() {
  // Private state
  const notifications = ref([])
  const notificationId = ref(0)

  /**
   * @function notify
   * @description Adds a new notification to the queue with specified options.
   *
   * @param {object} notification - Notification configuration object
   * @param {NotificationTypeValue} [notification.type] - Notification type
   * @param {string} notification.message - Notification message text (required, non-empty)
   * @param {number} [notification.timeout] - Auto-dismiss timeout in milliseconds (0 = no auto-dismiss)
   * @param {boolean} [notification.dismissible] - Whether notification can be manually dismissed
   * @returns {number|null} ID of the created notification, or null if message is invalid
   *
   * @throws {Error} Logs warning to console if message is invalid or type is invalid
   *
   * @example
   * ```typescript
   * const id = notify({
   *   type: NotificationType.SUCCESS,
   *   message: 'Saved successfully!',
   *   timeout: 3000,
   *   dismissible: true
   * })
   * ```
   */
  function notify({ type = NotificationType.INFO, message, timeout = 5000, dismissible = true }: { type: NotificationTypeValue, message: string, timeout?: number, dismissible?: boolean }): number | null {
    // Validate message
    if (!message || typeof message !== 'string' || message.trim() === '') {
      console.warn('Invalid or empty notification message. Notification will not be displayed.')
      return null
    }

    // Validate type
    if (!Object.values(NotificationType).includes(type)) {
      console.warn(`Invalid notification type: ${type}. Defaulting to 'info'.`)
      type = NotificationType.INFO
    }

    // Create notification object
    const id = ++notificationId.value
    const notification = reactive({
      id,
      type,
      message: message.trim(),
      dismissible,
      timestamp: new Date(),
    })

    // Add to notifications list
    notifications.value = [...notifications.value, notification as never]

    // Set auto-dismiss timeout if specified
    if (timeout > 0) {
      setTimeout(() => {
        dismiss(id)
      }, timeout)
    }

    return id
  }

  /**
   * @function dismiss
   * @description Removes a notification from the queue by its ID.
   *
   * @param {number} id - The notification ID to dismiss
   * @returns {boolean} True if notification was found and dismissed, false otherwise
   *
   * @example
   * ```typescript
   * const id = success('Message')
   * // Later...
   * dismiss(id)
   * ```
   */
  function dismiss(id: number): boolean {
    const index = notifications.value.findIndex((n: { id: number }) => n.id === id)
    if (index !== -1) {
      notifications.value.splice(index, 1)
      return true
    }
    return false
  }

  /**
   * @function clearAll
   * @description Removes all notifications from the queue.
   * Useful for clearing notifications when navigating between routes or resetting state.
   *
   * @example
   * ```typescript
   * // Clear all notifications on route change
   * router.afterEach(() => {
   *   clearAll()
   * })
   * ```
   */
  function clearAll() {
    notifications.value = []
  }

  /**
   * @function success
   * @description Convenience method for displaying success notifications.
   *
   * @param {string} message - Success message to display
   * @param {number} [timeout] - Auto-dismiss timeout in milliseconds
   * @returns {number|null} Notification ID or null if message is invalid
   *
   * @example
   * ```typescript
   * success('Data saved successfully!')
   * ```
   */
  function success(message: string, timeout: number = 5000): number | null {
    return notify({ type: NotificationType.SUCCESS, message, timeout })
  }

  /**
   * @function error
   * @description Convenience method for displaying error notifications.
   * By default, error notifications do not auto-dismiss (timeout = 0).
   *
   * @param {string} message - Error message to display
   * @param {number} [timeout] - Auto-dismiss timeout in milliseconds (0 = no auto-dismiss)
   * @returns {number|null} Notification ID or null if message is invalid
   *
   * @example
   * ```typescript
   * error('Failed to save data', 0) // No auto-dismiss
   * error('Temporary error', 5000) // Auto-dismiss after 5 seconds
   * ```
   */
  function error(message: string, timeout: number = 0): number | null {
    return notify({ type: NotificationType.ERROR, message, timeout })
  }

  /**
   * @function warning
   * @description Convenience method for displaying warning notifications.
   *
   * @param {string} message - Warning message to display
   * @param {number} [timeout] - Auto-dismiss timeout in milliseconds
   * @returns {number|null} Notification ID or null if message is invalid
   *
   * @example
   * ```typescript
   * warning('Please review your changes before submitting')
   * ```
   */
  function warning(message: string, timeout: number = 7000): number | null {
    return notify({ type: NotificationType.WARNING, message, timeout })
  }

  /**
   * @function info
   * @description Convenience method for displaying informational notifications.
   *
   * @param {string} message - Info message to display
   * @param {number} [timeout] - Auto-dismiss timeout in milliseconds
   * @returns {number|null} Notification ID or null if message is invalid
   *
   * @example
   * ```typescript
   * info('New features available')
   * ```
   */
  function info(message: string, timeout: number = 5000): number | null {
    return notify({ type: NotificationType.INFO, message, timeout })
  }

  /**
   * @function showNotification
   * @description Alias for `notify` function to maintain backward compatibility.
   *
   * @param {object} notification - Notification configuration object
   * @param {NotificationTypeValue} notification.type - Notification type
   * @param {string} notification.message - Notification message
   * @param {number} [notification.timeout] - Auto-dismiss timeout in milliseconds
   * @param {boolean} [notification.dismissible] - Whether notification can be manually dismissed
   * @returns {number|null} Notification ID or null if message is invalid
   *
   * @see {@link notify} for detailed documentation
   */
  function showNotification(notification: { type: NotificationTypeValue, message: string, timeout?: number, dismissible?: boolean }): number | null {
    return notify(notification)
  }

  return {
    // State (readonly to prevent external modification)
    notifications: readonly(notifications),

    // Methods
    notify,
    showNotification,
    dismiss,
    clearAll,
    success,
    error,
    warning,
    info,
  }
}

/**
 * @constant globalNotification
 * @description Global notification instance for app-wide use.
 * This instance is shared across all components that import the default export.
 */
const globalNotification = useNotification()

/**
 * @default
 * @description Default export of the global notification instance.
 * Use this for app-wide notification management.
 */
export default globalNotification

/**
 * @function showNotification
 * @description Convenience export of the global notification's showNotification method.
 * Allows direct usage without importing the full instance.
 *
 * @example
 * ```typescript
 * import { showNotification } from '@/composables/useNotification'
 * showNotification({ type: 'success', message: 'Done!' })
 * ```
 */
export const showNotification = globalNotification.showNotification
