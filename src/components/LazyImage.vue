<script setup lang="ts">
import { useIntersectionObserver } from '@vueuse/core'
import { computed, ref } from 'vue'

interface Props {
  src: string
  alt?: string
  width?: number | string
  height?: number | string
  placeholder?: string
  loadingClass?: string
  loadedClass?: string
  errorClass?: string
  transitionDuration?: string
  imgClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  alt: '',
  width: null,
  height: null,
  placeholder: null,
  loadingClass: 'opacity-0',
  loadedClass: 'opacity-100',
  errorClass: 'opacity-0',
  transitionDuration: '300ms',
  imgClass: '',
})

const isLoaded = ref(false)
const hasError = ref(false)
const imgRef = ref<HTMLImageElement | null>(null)

// Computed styles for the image
const imgStyle = computed(() => ({
  transition: `opacity ${props.transitionDuration} ease-in-out`,
}))

// Computed classes for the image
const imgClasses = computed(() => {
  return [
    props.imgClass,
    isLoaded.value && !hasError.value ? props.loadedClass : props.loadingClass,
    hasError.value ? props.errorClass : '',
  ].filter(Boolean).join(' ')
})

// Handle image load event
function handleLoad() {
  isLoaded.value = true
}

// Handle image error event
function handleError() {
  hasError.value = true
}

// Use VueUse's useIntersectionObserver for lazy loading
useIntersectionObserver(
  imgRef,
  ([{ isIntersecting }]) => {
    if (isIntersecting && imgRef.value && !imgRef.value.src) {
      imgRef.value.src = props.src
    }
  },
  {
    rootMargin: '50px 0px', // Start loading when image is 50px from viewport
    threshold: 0.01, // Trigger when 1% of the image is visible
  },
)
</script>

<template>
  <div class="lazy-image-container relative overflow-hidden">
    <!-- Placeholder while loading -->
    <img
      v-if="placeholder && !isLoaded"
      :src="placeholder"
      :alt="alt"
      class="placeholder-image absolute inset-0 size-full object-cover"
      aria-hidden="true"
    >

    <!-- Actual image -->
    <img
      ref="imgRef"
      :data-src="src"
      :alt="alt"
      :width="width"
      :height="height"
      :class="imgClasses"
      :style="imgStyle"
      loading="lazy"
      @load="handleLoad"
      @error="handleError"
    >

    <!-- Error state -->
    <div
      v-if="hasError"
      class="error-container absolute inset-0 flex items-center justify-center bg-gray-200"
    >
      <span class="text-red-500">Failed to load image</span>
    </div>
  </div>
</template>
