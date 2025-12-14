/**
 * @module utils/pageloader
 * @description Page loader utility for managing loading states with optimized animations.
 * Provides methods to show/hide page loaders and preload critical resources.
 */

/* eslint-disable regexp/no-unused-capturing-group */

/**
 * @namespace PageLoader
 * @description Utility object for managing the page loader element.
 * Provides optimized methods for showing/hiding loaders with smooth animations.
 */
export const PageLoader = {
  /**
   * @function hide
   * @description Hides the page loader with optimized fade-out animation.
   * Uses requestAnimationFrame for smooth transitions and handles edge cases.
   *
   * @param {number} [delay] - Optional delay before hiding the loader in milliseconds
   * @returns {Promise<void>} Resolves when the loader is fully hidden
   *
   * @example
   * ```typescript
   * await PageLoader.hide()
   * // Or with delay
   * await PageLoader.hide(500)
   * ```
   *
   * @remarks
   * - Uses CSS transitions for smooth animation
   * - Handles missing loader element gracefully
   * - Includes fallback timeout in case transitionend doesn't fire
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
   * @function show
   * @description Shows the page loader with optimized fade-in animation.
   * Resets styles and uses requestAnimationFrame for smooth transitions.
   *
   * @param {number} [delay] - Optional delay before showing the loader in milliseconds
   * @returns {Promise<void>} Resolves when the loader is fully visible
   *
   * @example
   * ```typescript
   * await PageLoader.show()
   * // Or with delay
   * await PageLoader.show(100)
   * ```
   *
   * @remarks
   * - Forces reflow before animation for consistent behavior
   * - Includes fallback timeout in case transitionend doesn't fire
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
   * @function preloadResources
   * @description Preloads critical resources to improve initial load time.
   * Automatically detects resource type from file extension and sets appropriate attributes.
   *
   * @param {string[]} [resources] - Array of resource URLs to preload
   *
   * @example
   * ```typescript
   * PageLoader.preloadResources([
   *   '/assets/critical.css',
   *   '/assets/main.js',
   *   '/images/hero.jpg'
   * ])
   * ```
   *
   * @remarks
   * - Supports: JS, CSS, images (png, jpg, gif, svg, webp), fonts (woff, woff2, ttf, otf, eot)
   * - Fonts are loaded with crossOrigin='anonymous' for CORS
   * - Does nothing if resources array is empty
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
