/**
 * @module stores/__tests__/page-loader.store.test
 * @description Unit tests for the page loader store.
 */

import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { usePageLoaderStore } from '../page-loader.store'

describe('usePageLoaderStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should initialize with correct default state', () => {
    const store = usePageLoaderStore()

    expect(store.isLoading).toBe(false)
    expect(store.message).toBeNull()
    expect(store.progress).toBe(0)
    expect(store.startTime).toBeNull()
    expect(store.hasMessage).toBe(false)
    expect(store.loadingDuration).toBe(0)
  })

  it('should show loader and set start time', () => {
    const store = usePageLoaderStore()
    const beforeTime = Date.now()

    store.show()

    expect(store.isLoading).toBe(true)
    expect(store.startTime).not.toBeNull()
    if (store.startTime)
      expect(store.startTime).toBeGreaterThanOrEqual(beforeTime)
  })

  it('should show loader with message', () => {
    const store = usePageLoaderStore()

    store.show('Loading data...')

    expect(store.isLoading).toBe(true)
    expect(store.message).toBe('Loading data...')
    expect(store.hasMessage).toBe(true)
  })

  it('should stack multiple show calls', () => {
    const store = usePageLoaderStore()

    store.show()
    expect(store.isLoading).toBe(true)

    store.show()
    expect(store.isLoading).toBe(true)

    store.hide()
    expect(store.isLoading).toBe(true) // Still loading

    store.hide()
    expect(store.isLoading).toBe(false) // Now hidden
  })

  it('should hide loader and reset state', () => {
    const store = usePageLoaderStore()

    store.show('Loading...')
    store.setProgress(50)
    store.hide()

    expect(store.isLoading).toBe(false)
    expect(store.message).toBeNull()
    expect(store.progress).toBe(0)
    expect(store.startTime).toBeNull()
  })

  it('should update message', () => {
    const store = usePageLoaderStore()

    store.setMessage('Initial message')
    expect(store.message).toBe('Initial message')

    store.setMessage('Updated message')
    expect(store.message).toBe('Updated message')

    store.setMessage(null)
    expect(store.message).toBeNull()
  })

  it('should set progress within valid range', () => {
    const store = usePageLoaderStore()

    store.setProgress(0)
    expect(store.progress).toBe(0)

    store.setProgress(50)
    expect(store.progress).toBe(50)

    store.setProgress(100)
    expect(store.progress).toBe(100)

    store.setProgress(75.7)
    expect(store.progress).toBe(76) // Rounded
  })

  it('should throw error for invalid progress values', () => {
    const store = usePageLoaderStore()

    expect(() => store.setProgress(-1)).toThrow('Progress must be between 0 and 100')
    expect(() => store.setProgress(101)).toThrow('Progress must be between 0 and 100')
  })

  it('should calculate loading duration', async () => {
    const store = usePageLoaderStore()

    store.show()
    const startTime = store.startTime

    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 10))

    expect(store.loadingDuration).toBeGreaterThan(0)
    if (startTime)
      expect(store.loadingDuration).toBeGreaterThanOrEqual(Date.now() - startTime)
  })

  it('should reset all state', () => {
    const store = usePageLoaderStore()

    store.show('Loading...')
    store.setProgress(50)
    store.reset()

    expect(store.isLoading).toBe(false)
    expect(store.message).toBeNull()
    expect(store.progress).toBe(0)
    expect(store.startTime).toBeNull()
  })

  it('should update message when showing multiple times', () => {
    const store = usePageLoaderStore()

    store.show('First message')
    expect(store.message).toBe('First message')

    store.show('Second message')
    expect(store.message).toBe('Second message')
  })

  it('should not update message if undefined', () => {
    const store = usePageLoaderStore()

    store.show('Initial message')
    store.show() // No message parameter
    expect(store.message).toBe('Initial message')
  })
})
