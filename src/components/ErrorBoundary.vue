<script setup lang="ts">
import { onErrorCaptured, ref } from 'vue'
import { useNotification } from '/@/composables/useNotification'

interface Props {
  /**
   * Custom fallback content to display when an error occurs
   */
  fallback?: object | ((error: Error, componentStack: string, resetError: () => void) => any) | null
  /**
   * Whether to log errors to console
   */
  logErrors?: boolean
  /**
   * Whether to show error notifications
   */
  showNotifications?: boolean
  /**
   * Custom error handler function
   */
  onError?: ((error: Error, instance: any, info: string) => void) | null
}

const props = withDefaults(defineProps<Props>(), {
  fallback: null,
  logErrors: true,
  showNotifications: true,
  onError: null,
})

const error = ref<Error | null>(null)
const componentStack = ref<string | null>(null)
const notification = useNotification()

/**
 * Reset the error state
 */
function resetError() {
  error.value = null
  componentStack.value = null
}

/**
 * Handle errors captured within the component tree
 */
onErrorCaptured((err, instance, info) => {
  error.value = err
  componentStack.value = info

  // Log error to console if enabled
  if (props.logErrors) {
    console.error('Error captured by boundary:', err)
    console.info('Component stack:', info)
  }

  // Show notification if enabled
  if (props.showNotifications) {
    notification.error(
      `Component Error: ${err.message || 'An unexpected error occurred'}`,
      0, // No auto-dismiss for errors
    )
  }

  // Call custom error handler if provided
  if (typeof props.onError === 'function') {
    props.onError(err, instance, info)
  }

  // Prevent error from propagating further
  return false
})
</script>

<template>
  <div v-if="error" class="error-boundary-fallback w-screen h-screen flex items-center justify-center">
    <!-- Custom fallback component -->
    <component
      :is="fallback"
      v-if="fallback && typeof fallback !== 'function'"
      :error="error"
      :component-stack="componentStack"
      :reset-error="resetError"
    />

    <!-- Default fallback UI -->
    <div v-else-if="!fallback || typeof fallback !== 'function'" class="error-boundary-container">
      <h2 class="error-boundary-title">
        Something went wrong
      </h2>
      <p class="error-boundary-message">
        {{ error?.message || 'An unexpected error occurred' }}
      </p>
      <button class="error-boundary-button" @click="resetError">
        Try Again
      </button>
    </div>
  </div>

  <!-- No error, render the default slot -->
  <slot v-else />
</template>
