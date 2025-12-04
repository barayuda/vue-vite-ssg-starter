import { useWindowSize } from '@vueuse/core'
import { computed } from 'vue'

const breakpoints = {
  xs: 0,
  sm: 600,
  md: 960,
  lg: 1264,
  xl: 1904,
} as const

export function useResponsive() {
  const { width, height } = useWindowSize()

  // isMobile: xs
  const isXs = computed(() => width.value < breakpoints.sm)

  // isTablet: sm
  const isSm = computed(() => width.value >= breakpoints.sm && width.value < breakpoints.md)

  // isMediumScreen: md
  const isMd = computed(() => width.value >= breakpoints.md && width.value < breakpoints.lg)

  // isLargeScreen: lg
  const isLg = computed(() => width.value >= breakpoints.lg && width.value < breakpoints.xl)

  // isExtraLargeScreen: xl
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
