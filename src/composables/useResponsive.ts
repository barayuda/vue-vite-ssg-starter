/**
 * @module composables/useResponsive
 * @description Responsive design composable for detecting screen sizes and breakpoints.
 * Provides reactive breakpoint detection based on Material Design breakpoint system.
 */

import { useWindowSize } from '@vueuse/core'
import { computed } from 'vue'

/**
 * @constant breakpoints
 * @description Material Design breakpoint values in pixels.
 * Used to determine current screen size category.
 */
const breakpoints = {
  xs: 0,
  sm: 600,
  md: 960,
  lg: 1264,
  xl: 1904,
} as const

/**
 * @function useResponsive
 * @description Creates reactive breakpoint detection based on current window size.
 * Returns computed properties that automatically update when the window is resized.
 *
 * @returns {object} Responsive state object:
 *   - {Ref<number>} width - Current window width in pixels
 *   - {Ref<number>} height - Current window height in pixels
 *   - {ComputedRef<boolean>} isXs - True if width < 600px (extra small/mobile)
 *   - {ComputedRef<boolean>} isSm - True if width >= 600px and < 960px (small/tablet)
 *   - {ComputedRef<boolean>} isMd - True if width >= 960px and < 1264px (medium/tablet landscape)
 *   - {ComputedRef<boolean>} isLg - True if width >= 1264px and < 1904px (large/desktop)
 *   - {ComputedRef<boolean>} isXl - True if width >= 1904px (extra large/wide desktop)
 *
 * @example
 * ```typescript
 * const { isXs, isSm, isMd, isLg, isXl, width } = useResponsive()
 *
 * // Conditional rendering
 * <div v-if="isXs">Mobile content</div>
 * <div v-else-if="isLg || isXl">Desktop content</div>
 *
 * // Dynamic classes
 * :class="{ 'mobile-layout': isXs, 'desktop-layout': isLg }"
 * ```
 *
 * @remarks
 * - Uses `@vueuse/core`'s `useWindowSize` for efficient window size tracking
 * - Breakpoints follow Material Design guidelines
 * - All properties are reactive and update automatically on window resize
 * - Only one breakpoint will be true at a time (mutually exclusive)
 */
export function useResponsive() {
  const { width, height } = useWindowSize()

  /** Extra small screens (mobile): width < 600px */
  const isXs = computed(() => width.value < breakpoints.sm)

  /** Small screens (tablet): 600px <= width < 960px */
  const isSm = computed(() => width.value >= breakpoints.sm && width.value < breakpoints.md)

  /** Medium screens (tablet landscape): 960px <= width < 1264px */
  const isMd = computed(() => width.value >= breakpoints.md && width.value < breakpoints.lg)

  /** Large screens (desktop): 1264px <= width < 1904px */
  const isLg = computed(() => width.value >= breakpoints.lg && width.value < breakpoints.xl)

  /** Extra large screens (wide desktop): width >= 1904px */
  const isXl = computed(() => width.value >= breakpoints.xl)

  return {
    width,
    height,
    isXs, // isMobile
    isSm, // isTablet
    isMd, // isMediumScreen
    isLg, // isLargeScreen
    isXl, // isExtraLargeScreen
  }
}
