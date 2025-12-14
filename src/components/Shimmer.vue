<script setup lang="ts">
import { computed } from 'vue'

/**
 * @type {('card' | 'list' | 'text' | 'custom')}
 */
type ShimmerVariant = 'card' | 'list' | 'text' | 'custom'

interface Props {
  /** Variant of shimmer (card, list, text, or custom) */
  variant?: ShimmerVariant
  /** Number of shimmer lines (for text/list variants) */
  lines?: number
  /** Width of shimmer (CSS value or percentage) */
  width?: string
  /** Height of shimmer (CSS value) */
  height?: string
  /** Border radius (CSS value) */
  borderRadius?: string
  /** Custom class for additional styling */
  class?: string
  /** Whether to show animated shimmer effect */
  animated?: boolean
  /** Number of shimmer items to render (for card/list variants) */
  count?: number
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'text',
  lines: 3,
  width: '100%',
  height: undefined,
  borderRadius: '0.5rem',
  class: '',
  animated: true,
  count: 1,
})

// Computed styles for custom variant
const customStyle = computed(() => {
  if (props.variant !== 'custom')
    return {}

  return {
    width: props.width,
    height: props.height || '1rem',
    borderRadius: props.borderRadius,
  }
})

// Computed classes
const shimmerClasses = computed(() => {
  const base = 'shimmer'
  const variant = `shimmer--${props.variant}`
  const animated = props.animated ? 'shimmer--animated' : ''
  return [base, variant, animated, props.class].filter(Boolean).join(' ')
})

// Line widths for text variant (different widths for visual interest)
function getLineWidth(index: number, total: number) {
  if (index === 0)
    return '100%'
  if (index === total - 1)
    return '60%'
  return `${85 - (index * 5)}%`
}
</script>

<template>
  <div :class="shimmerClasses">
    <!-- Card Variant -->
    <template v-if="variant === 'card'">
      <div
        v-for="i in count"
        :key="i"
        class="shimmer__card"
      >
        <div class="shimmer__card-header">
          <div class="shimmer__line shimmer__line--title" />
          <div class="shimmer__line shimmer__line--badge" />
        </div>
        <div class="shimmer__line shimmer__line--body" />
        <div class="shimmer__line shimmer__line--body" />
        <div class="shimmer__line shimmer__line--short" />
        <div class="shimmer__tags">
          <div class="shimmer__tag" />
          <div class="shimmer__tag" />
          <div class="shimmer__tag" />
        </div>
      </div>
    </template>

    <!-- List Variant -->
    <template v-else-if="variant === 'list'">
      <div
        v-for="i in count"
        :key="i"
        class="shimmer__list-item"
      >
        <div class="shimmer__line shimmer__line--avatar" />
        <div class="shimmer__list-content">
          <div class="shimmer__line shimmer__line--title" />
          <div class="shimmer__line shimmer__line--body" />
        </div>
      </div>
    </template>

    <!-- Text Variant -->
    <template v-else-if="variant === 'text'">
      <div
        v-for="i in lines"
        :key="i"
        class="shimmer__line"
        :style="{ width: getLineWidth(i - 1, lines) }"
      />
    </template>

    <!-- Custom Variant -->
    <template v-else>
      <div
        class="shimmer__line shimmer__line--custom"
        :style="customStyle"
      />
    </template>
  </div>
</template>

<style scoped>
.shimmer {
  width: 100%;
}

/* Base shimmer line */
.shimmer__line {
  height: 1rem;
  background: linear-gradient(
    90deg,
    rgba(148, 163, 184, 0.2) 0%,
    rgba(148, 163, 184, 0.3) 50%,
    rgba(148, 163, 184, 0.2) 100%
  );
  background-size: 200% 100%;
  border-radius: 0.5rem;
  margin-bottom: 0.75rem;
}

.shimmer__line:last-child {
  margin-bottom: 0;
}

/* Animated shimmer effect */
.shimmer--animated .shimmer__line,
.shimmer--animated .shimmer__card,
.shimmer--animated .shimmer__list-item,
.shimmer--animated .shimmer__tag {
  animation: shimmer-animate 1.5s ease-in-out infinite;
}

@keyframes shimmer-animate {
  0% {
    background-position: -200% 0;
  }

  100% {
    background-position: 200% 0;
  }
}

/* Card Variant */
.shimmer__card {
  background: white;
  border: 1px solid rgb(226, 232, 240);
  border-radius: 1rem;
  padding: 1.25rem;
  margin-bottom: 1rem;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.shimmer__card:last-child {
  margin-bottom: 0;
}

.shimmer__card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.shimmer__line--title {
  flex: 1;
  height: 1.25rem;
  max-width: 60%;
}

.shimmer__line--badge {
  width: 4rem;
  height: 1.5rem;
  border-radius: 9999px;
}

.shimmer__line--body {
  height: 0.875rem;
  margin-bottom: 0.5rem;
}

.shimmer__line--short {
  height: 0.875rem;
  width: 70%;
  margin-bottom: 0.75rem;
}

.shimmer__tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 0.75rem;
}

.shimmer__tag {
  width: 4rem;
  height: 1.5rem;
  border-radius: 9999px;
  background: linear-gradient(
    90deg,
    rgba(148, 163, 184, 0.2) 0%,
    rgba(148, 163, 184, 0.3) 50%,
    rgba(148, 163, 184, 0.2) 100%
  );
  background-size: 200% 100%;
}

/* List Variant */
.shimmer__list-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid rgb(226, 232, 240);
}

.shimmer__list-item:last-child {
  border-bottom: none;
}

.shimmer__line--avatar {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  flex-shrink: 0;
  margin-bottom: 0;
}

.shimmer__list-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.shimmer__list-content .shimmer__line--title {
  max-width: 40%;
  height: 1rem;
}

.shimmer__list-content .shimmer__line--body {
  max-width: 80%;
  height: 0.875rem;
  margin-bottom: 0;
}

/* Text Variant */
.shimmer--text {
  display: flex;
  flex-direction: column;
}

/* Custom Variant */
.shimmer__line--custom {
  margin-bottom: 0;
}

/* Grid layout for multiple cards */
.shimmer--card {
  display: grid;
  gap: 1rem;
}

@media (width >= 768px) {
  .shimmer--card {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
}

/* Performance optimizations */
.shimmer__line,
.shimmer__card,
.shimmer__list-item,
.shimmer__tag {
  will-change: background-position;
}

/* Reduce motion for accessibility */
@media (prefers-reduced-motion: reduce) {
  .shimmer--animated .shimmer__line,
  .shimmer--animated .shimmer__card,
  .shimmer--animated .shimmer__list-item,
  .shimmer--animated .shimmer__tag {
    animation: none;
    background: rgba(148, 163, 184, 0.2);
  }
}
</style>
