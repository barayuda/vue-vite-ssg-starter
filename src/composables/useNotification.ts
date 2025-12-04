import { reactive, readonly, ref } from 'vue'

/**
 * Notification types map for better type safety and tree-shaking
 */
export const NotificationType = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
} as const

export type NotificationTypeValue = typeof NotificationType[keyof typeof NotificationType]

/**
 * Notification system composable
 * Provides a centralized way to display notifications to users
 */
export function useNotification() {
  // Private state
  const notifications = ref([])
  const notificationId = ref(0)

  /**
   * Add a new notification
   * @param {object} notification - Notification object
   * @param {string} notification.type - Notification type (success, error, warning, info)
   * @param {string} notification.message - Notification message
   * @param {number} [notification.timeout] - Auto-dismiss timeout in ms (0 for no auto-dismiss)
   * @param {boolean} [notification.dismissible] - Whether notification can be manually dismissed
   * @returns {number|null} - ID of the created notification or null if invalid message
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
   * Dismiss a notification by ID
   * @param {number} id - Notification ID to dismiss
   * @returns {boolean} - Whether notification was found and dismissed
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
   * Clear all notifications
   */
  function clearAll() {
    notifications.value = []
  }

  /**
   * Convenience method for success notifications
   * @param {string} message - Success message
   * @param {number} [timeout] - Auto-dismiss timeout
   * @returns {number|null} - Notification ID or null if invalid message
   */
  function success(message: string, timeout: number = 5000): number | null {
    return notify({ type: NotificationType.SUCCESS, message, timeout })
  }

  /**
   * Convenience method for error notifications
   * @param {string} message - Error message
   * @param {number} [timeout] - Auto-dismiss timeout (0 = no auto-dismiss)
   * @returns {number|null} - Notification ID or null if invalid message
   */
  function error(message: string, timeout: number = 0): number | null {
    return notify({ type: NotificationType.ERROR, message, timeout })
  }

  /**
   * Convenience method for warning notifications
   * @param {string} message - Warning message
   * @param {number} [timeout] - Auto-dismiss timeout
   * @returns {number|null} - Notification ID or null if invalid message
   */
  function warning(message: string, timeout: number = 7000): number | null {
    return notify({ type: NotificationType.WARNING, message, timeout })
  }

  /**
   * Convenience method for info notifications
   * @param {string} message - Info message
   * @param {number} [timeout] - Auto-dismiss timeout
   * @returns {number|null} - Notification ID or null if invalid message
   */
  function info(message: string, timeout: number = 5000): number | null {
    return notify({ type: NotificationType.INFO, message, timeout })
  }

  /**
   * Alias for notify function to maintain backward compatibility
   * @param notification - Notification object
   * @param notification.type - Notification type
   * @param notification.message - Notification message
   * @param notification.timeout - Auto-dismiss timeout in ms
   * @param notification.dismissible - Whether notification can be manually dismissed
   * @returns Notification ID or null if invalid message
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

// Create a global notification instance
const globalNotification = useNotification()

// Export the global instance as default
export default globalNotification

// Also export showNotification from global instance for convenience
export const showNotification = globalNotification.showNotification
