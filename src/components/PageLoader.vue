<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { usePageLoaderStore } from '/@/stores/page-loader.store'

interface Props {
  /** Show full page overlay loader */
  fullPage?: boolean
  /** Custom message to display */
  message?: string
  /** Size of the loader */
  size?: 'sm' | 'md' | 'lg'
  /** Delay before showing loader (ms) */
  delay?: number
  /** Minimum display time (ms) to prevent flash */
  minDisplayTime?: number
  /** Show progress indicator */
  showProgress?: boolean
  /** Custom progress value (0-100) */
  progress?: number
  /** Logo image URL to display above the loader */
  logo?: string
  /** Logo alt text */
  logoAlt?: string
  /** Logo size (width in pixels or CSS value) */
  logoSize?: string | number
}

const props = withDefaults(defineProps<Props>(), {
  fullPage: true,
  message: undefined,
  size: 'md',
  delay: 0,
  minDisplayTime: 300,
  showProgress: false,
  progress: undefined,
  logo: undefined,
  logoAlt: 'Logo',
  logoSize: '80px',
})

const store = usePageLoaderStore()
const displayMessage = computed(() => props.message || store.message)

// Local visibility state to handle delays
const isVisible = ref(false)
let showTimer: ReturnType<typeof setTimeout> | null = null
let hideTimer: ReturnType<typeof setTimeout> | null = null
let displayStartTime: number | null = null

// Watch for loading state changes and apply minimum display time
watch(
  () => store.isLoading,
  (newValue) => {
    if (showTimer)
      clearTimeout(showTimer)
    if (hideTimer)
      clearTimeout(hideTimer)

    if (newValue) {
      // Show with delay
      showTimer = setTimeout(() => {
        isVisible.value = true
        displayStartTime = Date.now()
      }, props.delay)
    }
    else {
      // Calculate remaining minimum display time
      const elapsed = displayStartTime ? Date.now() - displayStartTime : 0
      const remainingTime = Math.max(0, props.minDisplayTime - elapsed)

      // Hide with minimum display time
      hideTimer = setTimeout(() => {
        isVisible.value = false
        displayStartTime = null
      }, remainingTime)
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  if (showTimer)
    clearTimeout(showTimer)
  if (hideTimer)
    clearTimeout(hideTimer)
})
</script>

<template>
  <Teleport to="body">
    <Transition
      name="page-loader"
      enter-active-class="page-loader-enter-active"
      leave-active-class="page-loader-leave-active"
    >
      <div
        v-if="isVisible"
        class="page-loader" :class="[
          {
            'page-loader--full-page': fullPage,
          },
        ]"
        role="status"
        aria-live="polite"
        :aria-label="displayMessage || 'Loading content'"
      >
        <div class="page-loader__overlay" />
        <div class="page-loader__content">
          <!-- Logo with high-tech shimmer glow effect -->
          <div
            v-if="logo"
            class="page-loader__logo-wrapper"
          >
            <!-- Outer glow layers -->
            <div class="page-loader__logo-glow page-loader__logo-glow--outer" />
            <div class="page-loader__logo-glow page-loader__logo-glow--middle" />
            <div class="page-loader__logo-glow page-loader__logo-glow--inner" />

            <!-- Shimmer sweep effect -->
            <div class="page-loader__logo-shimmer" />

            <!-- Logo image -->
            <img
              :src="logo"
              :alt="logoAlt"
              class="page-loader__logo"
              :style="{ width: typeof logoSize === 'number' ? `${logoSize}px` : logoSize }"
            >

            <!-- Light rays effect -->
            <div class="page-loader__logo-rays">
              <div class="page-loader__logo-ray page-loader__logo-ray--1" />
              <div class="page-loader__logo-ray page-loader__logo-ray--2" />
              <div class="page-loader__logo-ray page-loader__logo-ray--3" />
              <div class="page-loader__logo-ray page-loader__logo-ray--4" />
            </div>
          </div>

          <!-- Spinner and Message Container -->
          <div class="page-loader__spinner-message">
            <!-- Spinner - only show if no logo -->
            <div
              v-if="!logo"
              class="page-loader__spinner" :class="[
                `page-loader__spinner--${size}`,
              ]"
            >
              <svg
                class="page-loader__spinner-svg"
                viewBox="0 0 50 50"
                aria-hidden="true"
              >
                <circle
                  class="page-loader__spinner-circle"
                  cx="25"
                  cy="25"
                  r="20"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="4"
                  stroke-linecap="round"
                />
              </svg>
            </div>

            <!-- Message -->
            <p
              v-if="displayMessage"
              class="page-loader__message"
            >
              {{ displayMessage }}
            </p>
          </div>

          <!-- Progress indicator -->
          <div
            v-if="showProgress"
            class="page-loader__progress"
          >
            <div
              class="page-loader__progress-bar"
              :style="{ width: `${progress ?? store.progress}%` }"
            />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.page-loader {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.page-loader--full-page {
  pointer-events: all;
}

.page-loader__overlay {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
}

@media (prefers-color-scheme: dark) {
  .page-loader__overlay {
    background: rgba(15, 23, 42, 0.9);
  }
}

.page-loader__content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 2rem;
}

/* Logo Styles with High-Tech Shimmer Glow */
.page-loader__logo-wrapper {
  position: relative;
  display: inline-block;
  filter: drop-shadow(0 0 20px rgba(37, 99, 235, 0.5));
}

.page-loader__logo {
  position: relative;
  z-index: 5;
  max-width: 100%;
  height: auto;
  object-fit: contain;
  animation: page-loader-logo-fade-in 0.5s ease-in-out;
  filter: brightness(1.1) contrast(1.1);
}

/* Multi-layer glow effect */
.page-loader__logo-glow {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  pointer-events: none;
  z-index: 1;
}

.page-loader__logo-glow--outer {
  inset: -30%;
  background: radial-gradient(
    circle,
    rgba(37, 99, 235, 0.6) 0%,
    rgba(59, 130, 246, 0.4) 30%,
    rgba(37, 99, 235, 0.2) 50%,
    transparent 80%
  );
  animation: page-loader-glow-pulse 3s ease-in-out infinite;
}

.page-loader__logo-glow--middle {
  inset: -15%;
  background: radial-gradient(
    circle,
    rgba(59, 130, 246, 0.5) 0%,
    rgba(37, 99, 235, 0.3) 40%,
    transparent 70%
  );
  animation: page-loader-glow-pulse 2.5s ease-in-out infinite 0.3s;
}

.page-loader__logo-glow--inner {
  inset: -5%;
  background: radial-gradient(
    circle,
    rgba(96, 165, 250, 0.7) 0%,
    rgba(59, 130, 246, 0.4) 50%,
    transparent 80%
  );
  animation: page-loader-glow-pulse 2s ease-in-out infinite 0.6s;
}

/* Shimmer sweep effect */
.page-loader__logo-shimmer {
  position: absolute;
  inset: -40%;
  z-index: 4;
  border-radius: 50%;
  background: linear-gradient(
    135deg,
    transparent 0%,
    transparent 40%,
    rgba(255, 255, 255, 0.3) 45%,
    rgba(96, 165, 250, 0.6) 50%,
    rgba(255, 255, 255, 0.3) 55%,
    transparent 60%,
    transparent 100%
  );
  background-size: 200% 200%;
  animation: page-loader-shimmer-sweep 2.5s ease-in-out infinite;
  pointer-events: none;
  mix-blend-mode: overlay;
}

/* Light rays effect */
.page-loader__logo-rays {
  position: absolute;
  inset: -50%;
  z-index: 0;
  pointer-events: none;
}

.page-loader__logo-ray {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 2px;
  height: 60%;
  background: linear-gradient(
    to bottom,
    transparent,
    rgba(59, 130, 246, 0.6),
    rgba(96, 165, 250, 0.8),
    rgba(59, 130, 246, 0.6),
    transparent
  );
  transform-origin: center bottom;
  opacity: 0.6;
}

.page-loader__logo-ray--1 {
  transform: translate(-50%, -50%) rotate(0deg);
  animation: page-loader-ray-pulse 2s ease-in-out infinite;
}

.page-loader__logo-ray--2 {
  transform: translate(-50%, -50%) rotate(90deg);
  animation: page-loader-ray-pulse 2s ease-in-out infinite 0.5s;
}

.page-loader__logo-ray--3 {
  transform: translate(-50%, -50%) rotate(180deg);
  animation: page-loader-ray-pulse 2s ease-in-out infinite 1s;
}

.page-loader__logo-ray--4 {
  transform: translate(-50%, -50%) rotate(270deg);
  animation: page-loader-ray-pulse 2s ease-in-out infinite 1.5s;
}

/* Spinner and Message Container */
.page-loader__spinner-message {
  display: flex;
  align-items: center;
  gap: 1rem;
  justify-content: center;
}

/* When logo exists (no spinner), center message only */
.page-loader__logo-wrapper ~ .page-loader__spinner-message {
  justify-content: center;
}

/* When no logo (spinner exists), spinner and message are side by side */
.page-loader__spinner-message:has(.page-loader__spinner) {
  justify-content: center;
}

/* Message alignment when no spinner (logo only) */
.page-loader__logo-wrapper ~ .page-loader__spinner-message .page-loader__message {
  text-align: center;
}

/* Spinner Styles */
.page-loader__spinner {
  color: var(--color-primary, #2563EB);
  animation: page-loader-spin 1s linear infinite;
  will-change: transform;
}

.page-loader__spinner-svg {
  display: block;
  width: 100%;
  height: 100%;
}

.page-loader__spinner-circle {
  stroke-dasharray: 90, 150;
  stroke-dashoffset: 0;
  animation: page-loader-dash 1.5s ease-in-out infinite;
}

.page-loader__spinner--sm {
  width: 2rem;
  height: 2rem;
}

.page-loader__spinner--md {
  width: 3rem;
  height: 3rem;
}

.page-loader__spinner--lg {
  width: 4rem;
  height: 4rem;
}

/* Message Styles */
.page-loader__message {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 500;
  color: rgb(51, 65, 85);
  text-align: left;
  white-space: nowrap;
}

@media (prefers-color-scheme: dark) {
  .page-loader__message {
    color: rgb(203, 213, 225);
  }
}

/* Progress Styles */
.page-loader__progress {
  width: 100%;
  max-width: 20rem;
  height: 0.25rem;
  background: rgba(148, 163, 184, 0.2);
  border-radius: 9999px;
  overflow: hidden;
}

.page-loader__progress-bar {
  height: 100%;
  background: linear-gradient(
    90deg,
    var(--color-primary, #2563EB),
    rgb(59, 130, 246)
  );
  border-radius: 9999px;
  transition: width 0.3s ease-out;
  animation: page-loader-progress-pulse 2s ease-in-out infinite;
}

/* Animations */
@keyframes page-loader-spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes page-loader-dash {
  0% {
    stroke-dasharray: 1, 150;
    stroke-dashoffset: 0;
  }

  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -35;
  }

  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -124;
  }
}

@keyframes page-loader-progress-pulse {
  0%, 100% {
    opacity: 1;
  }

  50% {
    opacity: 0.7;
  }
}

@keyframes page-loader-logo-fade-in {
  from {
    opacity: 0;
    transform: scale(0.9);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* High-tech glow animations */
@keyframes page-loader-glow-pulse {
  0%, 100% {
    opacity: 0.5;
    transform: scale(1);
  }

  50% {
    opacity: 1;
    transform: scale(1.15);
  }
}

@keyframes page-loader-shimmer-sweep {
  0% {
    background-position: -200% -200%;
    opacity: 0;
  }

  50% {
    opacity: 1;
  }

  100% {
    background-position: 200% 200%;
    opacity: 0;
  }
}

@keyframes page-loader-ray-pulse {
  0%, 100% {
    opacity: 0.3;
    transform: translate(-50%, -50%) scaleY(0.8);
  }

  50% {
    opacity: 0.8;
    transform: translate(-50%, -50%) scaleY(1.2);
  }
}

/* Transitions */
.page-loader-enter-active,
.page-loader-leave-active {
  transition: opacity 0.3s ease-in-out;
}

.page-loader-enter-active .page-loader__content,
.page-loader-leave-active .page-loader__content {
  transition: transform 0.3s ease-in-out, opacity 0.3s ease-in-out;
}

.page-loader-enter-from,
.page-loader-leave-to {
  opacity: 0;
}

.page-loader-enter-from .page-loader__content,
.page-loader-leave-to .page-loader__content {
  transform: scale(0.95);
  opacity: 0;
}

/* Performance optimizations */
.page-loader,
.page-loader__overlay,
.page-loader__content {
  will-change: opacity, transform;
}

.page-loader__logo-glow,
.page-loader__logo-shimmer,
.page-loader__logo-ray {
  will-change: opacity, transform, background-position;
}

/* Reduce motion for accessibility */
@media (prefers-reduced-motion: reduce) {
  .page-loader__spinner,
  .page-loader__progress-bar,
  .page-loader__logo-glow,
  .page-loader__logo-shimmer,
  .page-loader__logo-ray {
    animation: none;
  }

  .page-loader-enter-active,
  .page-loader-leave-active {
    transition: opacity 0.1s ease-in-out;
  }

  .page-loader-enter-active .page-loader__content,
  .page-loader-leave-active .page-loader__content {
    transition: opacity 0.1s ease-in-out;
  }
}
</style>
