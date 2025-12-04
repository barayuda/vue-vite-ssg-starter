import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useResponsive } from '../useResponsive'

describe('useResponsive', () => {
  let responsive: ReturnType<typeof useResponsive>

  beforeEach(() => {
    responsive = useResponsive()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with default values', () => {
    expect(responsive.width.value).toBeGreaterThan(0)
    expect(responsive.height.value).toBeGreaterThan(0)
  })

  it('should detect xs breakpoint', () => {
    // Mock window.innerWidth to be less than 600px
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500,
    })

    // Trigger resize event
    window.dispatchEvent(new Event('resize'))

    // Note: This test may need adjustment based on actual implementation
    // The computed values update reactively
    expect(responsive.isXs.value).toBe(true)
  })

  it('should provide all breakpoint flags', () => {
    expect(responsive.isXs).toBeDefined()
    expect(responsive.isSm).toBeDefined()
    expect(responsive.isMd).toBeDefined()
    expect(responsive.isLg).toBeDefined()
    expect(responsive.isXl).toBeDefined()
  })

  it('should provide width and height refs', () => {
    expect(responsive.width).toBeDefined()
    expect(responsive.height).toBeDefined()
    expect(typeof responsive.width.value).toBe('number')
    expect(typeof responsive.height.value).toBe('number')
  })
})
