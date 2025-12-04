/* eslint-disable regexp/no-unused-capturing-group */
/**
 * Page Loader Utility
 * Provides optimized methods for handling the page loader
 */
export const PageLoader = {
  /**
   * Hide the page loader with optimized animation
   * @param {number} delay - Optional delay before hiding the loader (in ms)
   */
  hide(delay: number = 0) {
    return new Promise<void>((resolve) => {
      const loader = document.getElementById('page-loader')
      if (!loader) {
        resolve()
        return
      }

      // Use requestAnimationFrame for smoother animation
      setTimeout(() => {
        // Add will-change to optimize the animation
        loader.style.willChange = 'opacity'

        requestAnimationFrame(() => {
          // Trigger opacity transition
          loader.style.opacity = '0'

          // Wait for transition to complete
          loader.addEventListener('transitionend', function onTransitionEnd() {
            // Clean up
            loader.removeEventListener('transitionend', onTransitionEnd)
            loader.style.display = 'none'
            loader.style.willChange = 'auto'
            resolve()
          }, { once: true })

          // Fallback in case transitionend doesn't fire
          setTimeout(() => {
            if (loader.style.display !== 'none') {
              loader.style.display = 'none'
              loader.style.willChange = 'auto'
              resolve()
            }
          }, 350) // Slightly longer than the CSS transition
        })
      }, delay)
    })
  },

  /**
   * Show the page loader
   * @param {number} delay - Optional delay before showing the loader (in ms)
   */
  show(delay: number = 0) {
    return new Promise<void>((resolve) => {
      const loader = document.getElementById('page-loader')
      if (!loader) {
        resolve()
        return
      }

      setTimeout(() => {
        // Reset styles
        loader.style.willChange = 'opacity'
        loader.style.display = 'flex'

        // Force reflow
        void loader.offsetWidth

        requestAnimationFrame(() => {
          loader.style.opacity = '1'

          loader.addEventListener('transitionend', function onTransitionEnd() {
            loader.removeEventListener('transitionend', onTransitionEnd)
            loader.style.willChange = 'auto'
            resolve()
          }, { once: true })

          // Fallback
          setTimeout(() => {
            loader.style.willChange = 'auto'
            resolve()
          }, 350)
        })
      }, delay)
    })
  },

  /**
   * Preload critical resources to improve initial load time
   * @param {Array<string>} resources - Array of resource URLs to preload
   */
  preloadResources(resources: Array<string> = []) {
    if (!resources.length)
      return

    resources.forEach((resource) => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.href = resource

      // Determine resource type from extension
      if (resource.endsWith('.js')) {
        link.as = 'script'
      }
      else if (resource.endsWith('.css')) {
        link.as = 'style'
      }
      else if (/\.(png|jpe?g|gif|svg|webp)$/i.test(resource)) {
        link.as = 'image'
      }
      else if (/\.(woff2?|ttf|otf|eot)$/i.test(resource)) {
        link.as = 'font'
        link.crossOrigin = 'anonymous'
      }

      document.head.appendChild(link)
    })
  },
}

export default PageLoader
