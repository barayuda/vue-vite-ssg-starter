<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import globalNotification, { NotificationType } from '/@/composables/useNotification'

interface INotification {
  id: number
  message: string
  type: typeof NotificationType
  dismissible?: boolean
}

const notifications = computed((): INotification[] => {
  // Filter out any notifications with empty or invalid messages
  return globalNotification.notifications.value.filter((notification: INotification) =>
    notification.message
    && typeof notification.message === 'string'
    && notification.message.trim() !== '',
  )
})
const debugMode = ref(false)

// Log notifications for debugging
watch(notifications, (newNotifications) => {
  if (debugMode.value && newNotifications.length > 0) {
    // Debug mode enabled
  }
})

// Get SVG icon based on notification type
function getIcon(type: any) {
  switch (type) {
    case NotificationType.SUCCESS:
      return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`
    case NotificationType.ERROR:
      return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`
    case NotificationType.WARNING:
      return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`
    case NotificationType.INFO:
    default:
      return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`
  }
}

// Get CSS class based on notification type
function getTypeClass(type: any) {
  switch (type) {
    case NotificationType.SUCCESS:
      return 'bg-green-100 border-green-500 text-green-800'
    case NotificationType.ERROR:
      return 'bg-red-100 border-red-500 text-red-800'
    case NotificationType.WARNING:
      return 'bg-yellow-100 border-yellow-500 text-yellow-800'
    case NotificationType.INFO:
    default:
      return 'bg-blue-100 border-blue-500 text-blue-800'
  }
}

// Handle dismiss notification
function handleDismiss(id: number) {
  globalNotification.dismiss(id)
}

// Keyboard accessibility for dismissing notifications
function handleKeyDown(event: { key: string, preventDefault: () => void }, id: any) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    handleDismiss(id)
  }
}
</script>

<template>
  <div class="notifications-container fixed top-24 right-4 z-50 w-80 max-w-full space-y-8">
    <TransitionGroup name="notification" tag="div">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        class="notification-item border-l-4 p-4 rounded shadow-md mb-4" :class="[getTypeClass(notification.type)]"
        role="alert"
        aria-live="assertive"
      >
        <div class="flex items-start">
          <div class="flex-shrink-0 mr-3">
            <div class="notification-icon" aria-hidden="true" v-html="getIcon(notification.type)" />
          </div>
          <div class="flex-1">
            <p class="text-sm font-medium">
              {{ notification.message }}
            </p>
          </div>
          <div v-if="notification.dismissible" class="flex-shrink-0 ml-2">
            <button
              type="button"
              class="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded p-1 cursor-pointer"
              aria-label="Dismiss notification"
              @click="handleDismiss(notification.id)"
              @keydown="handleKeyDown($event, notification.id)"
            >
              <span aria-hidden="true" class="text-lg font-bold">&times;</span>
            </button>
          </div>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped></style>
