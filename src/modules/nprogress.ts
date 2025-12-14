/**
 * @module modules/nprogress
 * @description NProgress module for showing loading progress during route navigation.
 * Automatically shows/hides progress bar when navigating between routes.
 */

import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

/**
 * @function install
 * @description Installs NProgress to show loading progress during route navigation.
 * Only runs on client-side (not during SSR).
 *
 * @param {object} context - Module installation context
 * @param {boolean} context.isClient - Whether code is running on client
 * @param {import('vue-router').Router} context.router - Vue Router instance
 *
 * @example
 * ```typescript
 * // Automatically installed when module is loaded
 * // No manual setup required
 * ```
 *
 * @remarks
 * - Progress bar starts before route navigation
 * - Progress bar completes after route navigation
 * - Only active on client-side (browser)
 */
export const install: UserModule = ({ isClient, router }) => {
  if (isClient) {
    router.beforeEach(() => {
      NProgress.start()
    })
    router.afterEach(() => {
      NProgress.done()
    })
  }
}
