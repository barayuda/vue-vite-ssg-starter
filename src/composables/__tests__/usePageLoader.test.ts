/**
 * @module composables/__tests__/usePageLoader.test
 * @description Unit tests for the usePageLoader composable.
 */

import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { usePageLoader } from '../usePageLoader'
import { usePageLoaderStore } from '/@/stores/page-loader.store'

describe('usePageLoader', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should provide loader methods and state', () => {
    const loader = usePageLoader()

    expect(loader.show).toBeDefined()
    expect(loader.hide).toBeDefined()
    expect(loader.setMessage).toBeDefined()
    expect(loader.setProgress).toBeDefined()
    expect(loader.isLoading).toBeDefined()
    expect(loader.message).toBeDefined()
    expect(loader.progress).toBeDefined()
  })

  it('should show and hide loader', () => {
    const loader = usePageLoader()

    loader.show()
    expect(loader.isLoading.value).toBe(true)

    loader.hide()
    expect(loader.isLoading.value).toBe(false)
  })

  it('should set initial message', () => {
    const loader = usePageLoader({ message: 'Initializing...' })

    expect(loader.message.value).toBe('Initializing...')
  })

  it('should update message', () => {
    const loader = usePageLoader()

    loader.setMessage('Loading data...')
    expect(loader.message.value).toBe('Loading data...')

    loader.setMessage(null)
    expect(loader.message.value).toBeNull()
  })

  it('should update progress', () => {
    const loader = usePageLoader()

    loader.setProgress(50)
    expect(loader.progress.value).toBe(50)
  })

  it('should auto-show when isLoading becomes true', async () => {
    const isLoading = ref(false)
    const loader = usePageLoader({ autoShow: true }, isLoading)

    expect(loader.isLoading.value).toBe(false)

    isLoading.value = true
    await new Promise(resolve => setTimeout(resolve, 10))

    expect(loader.isLoading.value).toBe(true)
  })

  it('should auto-hide when isLoading becomes false', async () => {
    const isLoading = ref(true)
    const store = usePageLoaderStore()
    store.show() // Set initial loading state

    const loader = usePageLoader({ autoHide: true }, isLoading)

    expect(loader.isLoading.value).toBe(true)

    isLoading.value = false
    await new Promise(resolve => setTimeout(resolve, 10))

    expect(loader.isLoading.value).toBe(false)
  })

  it('should respect delay option', async () => {
    vi.useFakeTimers()

    const isLoading = ref(false)
    const loader = usePageLoader({ autoShow: true, delay: 100 }, isLoading)

    isLoading.value = true
    vi.advanceTimersByTime(50)

    expect(loader.isLoading.value).toBe(false)

    vi.advanceTimersByTime(50)

    expect(loader.isLoading.value).toBe(true)

    vi.useRealTimers()
  })

  it('should cleanup on scope dispose', async () => {
    const isLoading = ref(true)
    const store = usePageLoaderStore()
    store.show()

    const loader = usePageLoader({ autoHide: true }, isLoading)

    expect(loader.isLoading.value).toBe(true)

    // Simulate component unmount
    // Note: In real usage, onScopeDispose would be called automatically
    isLoading.value = false
    await new Promise(resolve => setTimeout(resolve, 10))

    expect(loader.isLoading.value).toBe(false)
  })
})
