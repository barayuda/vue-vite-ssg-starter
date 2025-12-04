<script setup lang="ts">
import { useWindowScroll } from '@vueuse/core'
import { computed, ref } from 'vue'

interface Props {
  threshold?: number
  variant?: 'circle' | 'pill' | 'minimal'
  theme?: 'primary' | 'white' | 'gradient'
  showProgress?: boolean
  animation?: 'fade' | 'slide' | 'bounce'
}

const props = withDefaults(defineProps<Props>(), {
  threshold: 400,
  variant: 'circle',
  theme: 'primary',
  showProgress: true,
  animation: 'fade',
})

const { y: scrollY } = useWindowScroll()

const isScrolling = ref(false)

const isVisible = computed(() => scrollY.value > props.threshold)

const scrollProgress = computed(() => {
  if (!props.showProgress)
    return 0

  const documentHeight = document.documentElement.scrollHeight - window.innerHeight
  if (documentHeight <= 0)
    return 0

  return Math.min((scrollY.value / documentHeight) * 100, 100)
})

function scrollToTop() {
  if (isScrolling.value)
    return

  isScrolling.value = true

  // Use native smooth scroll behavior for better performance
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: 'smooth',
  })

  // Reset scrolling state after animation completes
  setTimeout(() => {
    isScrolling.value = false
  }, 800)
}

function handleKeydown(event: KeyboardEvent) {
  // Allow Enter and Space to trigger scroll to top
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    scrollToTop()
  }
}
</script>

<template>
  <Transition
    :name="animation"
    enter-active-class="transition-all duration-300 ease-out"
    leave-active-class="transition-all duration-200 ease-in"
    enter-from-class="opacity-0 transform translate-y-4 scale-95"
    enter-to-class="opacity-100 transform translate-y-0 scale-100"
    leave-from-class="opacity-100 transform translate-y-0 scale-100"
    leave-to-class="opacity-0 transform translate-y-4 scale-95"
  >
    <div
      v-show="isVisible"
      class="fixed bottom-6 right-6 z-50 group cursor-pointer"
      :class="{
        'animate-bounce': animation === 'bounce' && isVisible,
      }"
    >
      <!-- Main Button -->
      <button
        :disabled="isScrolling"
        class="relative cursor-pointer overflow-hidden transition-all duration-300 transform hover:scale-110 hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-primary/30 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
        :class="[
          // Variant styles
          {
            'w-14 h-14 rounded-full': variant === 'circle',
            'px-6 py-3 rounded-full': variant === 'pill',
            'w-12 h-12 rounded-lg': variant === 'minimal',
          },
          // Theme styles
          {
            'bg-primary text-white border-2 border-primary': theme === 'primary',
            'bg-white text-primary border-2 border-gray-200 hover:border-primary': theme === 'white',
            'bg-gradient-to-r from-primary to-blue-600 text-white border-0': theme === 'gradient',
          },
        ]"
        :aria-label="`Scroll to top${showProgress ? ` - ${Math.round(scrollProgress)}% scrolled` : ''}`"
        @click="scrollToTop"
        @keydown="handleKeydown"
      >
        <!-- Progress Circle (only for circle variant with progress) -->
        <svg
          v-if="showProgress && variant === 'circle'"
          class="absolute inset-0 w-full h-full -rotate-90"
          viewBox="0 0 56 56"
        >
          <circle
            cx="28"
            cy="28"
            r="26"
            fill="none"
            :stroke="theme === 'white' ? '#e5e7eb' : 'rgba(255,255,255,0.2)'"
            stroke-width="2"
          />
          <circle
            cx="28"
            cy="28"
            r="26"
            fill="none"
            :stroke="theme === 'white' ? '#0C4B90' : '#ffffff'"
            stroke-width="2"
            stroke-linecap="round"
            :stroke-dasharray="163.36"
            :stroke-dashoffset="163.36 - (163.36 * scrollProgress / 100)"
            class="transition-all duration-150 ease-out"
          />
        </svg>

        <!-- Arrow Icon -->
        <div class="relative z-10 flex items-center justify-center">
          <svg
            class="transition-transform duration-300 group-hover:-translate-y-0.5"
            :class="{
              'w-6 h-6': variant === 'circle',
              'w-5 h-5 mr-2': variant === 'pill',
              'w-5 h-5': variant === 'minimal',
            }"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7" />
          </svg>

          <!-- Text for pill variant -->
          <span v-if="variant === 'pill'" class="font-secondary text-sm font-medium">
            Top
          </span>
        </div>

        <!-- Ripple Effect -->
        <div class="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300">
          <div class="absolute inset-0 bg-white rounded-full transform scale-0 group-hover:scale-100 transition-transform duration-500" />
        </div>
      </button>

      <!-- Progress Text (for minimal variant) -->
      <div
        v-if="showProgress && variant === 'minimal'"
        class="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
      >
        <div class="bg-gray-800 text-white px-2 py-1 rounded text-xs font-medium whitespace-nowrap">
          {{ Math.round(scrollProgress) }}%
        </div>
      </div>

      <!-- Tooltip -->
      <div class="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        <div class="bg-gray-800 text-white px-3 py-1 rounded-lg text-sm font-medium whitespace-nowrap">
          Back to top
          <div class="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800" />
        </div>
      </div>

      <!-- Loading Spinner (when scrolling) -->
      <div
        v-if="isScrolling"
        class="absolute inset-0 flex items-center justify-center bg-inherit rounded-inherit"
      >
        <svg class="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    </div>
  </Transition>
</template>
