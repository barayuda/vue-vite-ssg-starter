/**
 * @module components/__tests__/PageLoader.test
 * @description Unit tests for the PageLoader component.
 */

import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import PageLoader from '../PageLoader.vue'
import { usePageLoaderStore } from '/@/stores/page-loader.store'

describe('pageLoader', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should render when loading', async () => {
    const store = usePageLoaderStore()
    store.show()

    const wrapper = mount(PageLoader, {
      global: {
        plugins: [createPinia()],
      },
    })

    await nextTick()

    expect(wrapper.find('.page-loader').exists()).toBe(true)
  })

  it('should not render when not loading', async () => {
    const store = usePageLoaderStore()
    store.hide()

    const wrapper = mount(PageLoader, {
      global: {
        plugins: [createPinia()],
      },
    })

    await nextTick()

    expect(wrapper.find('.page-loader').exists()).toBe(false)
  })

  it('should display custom message', async () => {
    const store = usePageLoaderStore()
    store.show('Custom loading message')

    const wrapper = mount(PageLoader, {
      props: {
        message: 'Custom message',
      },
      global: {
        plugins: [createPinia()],
      },
    })

    await nextTick()

    const message = wrapper.find('.page-loader__message')
    expect(message.exists()).toBe(true)
    expect(message.text()).toBe('Custom message')
  })

  it('should display store message when prop not provided', async () => {
    const store = usePageLoaderStore()
    store.show('Store message')

    const wrapper = mount(PageLoader, {
      global: {
        plugins: [createPinia()],
      },
    })

    await nextTick()

    const message = wrapper.find('.page-loader__message')
    expect(message.exists()).toBe(true)
    expect(message.text()).toBe('Store message')
  })

  it('should render spinner variant', async () => {
    const store = usePageLoaderStore()
    store.show()

    const wrapper = mount(PageLoader, {
      props: {
        variant: 'spinner',
      },
      global: {
        plugins: [createPinia()],
      },
    })

    await nextTick()

    expect(wrapper.find('.page-loader__spinner').exists()).toBe(true)
    expect(wrapper.find('.page-loader__shimmer-container').exists()).toBe(false)
  })

  it('should render shimmer variant', async () => {
    const store = usePageLoaderStore()
    store.show()

    const wrapper = mount(PageLoader, {
      props: {
        variant: 'shimmer',
      },
      global: {
        plugins: [createPinia()],
      },
    })

    await nextTick()

    expect(wrapper.find('.page-loader__spinner').exists()).toBe(false)
    expect(wrapper.find('.page-loader__shimmer-container').exists()).toBe(true)
  })

  it('should render both variants by default', async () => {
    const store = usePageLoaderStore()
    store.show()

    const wrapper = mount(PageLoader, {
      global: {
        plugins: [createPinia()],
      },
    })

    await nextTick()

    expect(wrapper.find('.page-loader__spinner').exists()).toBe(true)
    expect(wrapper.find('.page-loader__shimmer-container').exists()).toBe(true)
  })

  it('should apply size classes', async () => {
    const store = usePageLoaderStore()
    store.show()

    const wrapper = mount(PageLoader, {
      props: {
        size: 'lg',
      },
      global: {
        plugins: [createPinia()],
      },
    })

    await nextTick()

    expect(wrapper.find('.page-loader__spinner--lg').exists()).toBe(true)
  })

  it('should show progress bar when enabled', async () => {
    const store = usePageLoaderStore()
    store.show()
    store.setProgress(50)

    const wrapper = mount(PageLoader, {
      props: {
        showProgress: true,
      },
      global: {
        plugins: [createPinia()],
      },
    })

    await nextTick()

    const progressBar = wrapper.find('.page-loader__progress-bar')
    expect(progressBar.exists()).toBe(true)
    expect(progressBar.attributes('style')).toContain('width: 50%')
  })

  it('should use custom progress value when provided', async () => {
    const store = usePageLoaderStore()
    store.show()
    store.setProgress(30)

    const wrapper = mount(PageLoader, {
      props: {
        showProgress: true,
        progress: 75,
      },
      global: {
        plugins: [createPinia()],
      },
    })

    await nextTick()

    const progressBar = wrapper.find('.page-loader__progress-bar')
    expect(progressBar.attributes('style')).toContain('width: 75%')
  })

  it('should have proper accessibility attributes', async () => {
    const store = usePageLoaderStore()
    store.show('Loading content')

    const wrapper = mount(PageLoader, {
      global: {
        plugins: [createPinia()],
      },
    })

    await nextTick()

    const loader = wrapper.find('.page-loader')
    expect(loader.attributes('role')).toBe('status')
    expect(loader.attributes('aria-live')).toBe('polite')
    expect(loader.attributes('aria-label')).toBe('Loading content')
  })

  it('should apply full-page class when fullPage is true', async () => {
    const store = usePageLoaderStore()
    store.show()

    const wrapper = mount(PageLoader, {
      props: {
        fullPage: true,
      },
      global: {
        plugins: [createPinia()],
      },
    })

    await nextTick()

    expect(wrapper.find('.page-loader--full-page').exists()).toBe(true)
  })
})
