import { createPinia } from 'pinia'
import { setupLayouts } from 'virtual:generated-layouts'
import generatedRoutes from 'virtual:generated-pages'
import { ViteSSG } from 'vite-ssg'
import { install } from 'vue3-recaptcha-v2'
import { useNotification } from './composables/useNotification'
/**
 * vite-plugin-pages:         Generating routing information
 * virtual:generated-pages:   It comes from tsconfig.json-compilerOptions-types -> "vite-plugin-pages/client"
 * virtual:generated-layouts: It comes from tsconfig.json-compilerOptions-types -> "vite-plugin-vue-layouts/client"
 */
import '/@/styles/font.css'
import '/@/styles/main.css'
import App from '/@/App.vue'

const routes = setupLayouts(generatedRoutes)

// Debug: Log all routes in development
if (import.meta.env.DEV) {
  console.log('[main.ts] Generated routes:')
  routes.forEach((r) => {
    console.log(`  - ${r.path} (name: ${r.name || 'N/A'}, component: ${r.component})`)
  })
}

interface Module extends Record<string, Record<string, UserModule>> {}

export const createApp = ViteSSG(
  App,
  { routes },
  (ctx) => {
    // Pinia
    const pinia = createPinia()
    ctx.app.use(pinia)
    const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY
    if (recaptchaSiteKey) {
      ctx.app.use(install, {
        sitekey: recaptchaSiteKey,
        cnDomains: false,
      })
    }

    if (import.meta.env.SSR) {
      ctx.onSSRAppRendered(() => {
        ctx.initialState.pinia = pinia.state.value
      })
    }
    else {
      pinia.state.value = ctx.initialState.pinia || {}
    }

    // Router
    ctx.router.beforeEach((to, from, next) => {
      // Smooth scroll to top when route changes (only in browser)
      if (typeof window !== 'undefined') {
        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        })
      }
      next()
    })
    ctx.router.afterEach(() => {
      const { clearAll } = useNotification()
      clearAll()
    })

    // Modules
    const modules: Module = import.meta.glob('./modules/*.ts', { eager: true })

    // install all modules under `modules/`
    Object.values(modules).map(m => m.install?.(ctx))
  },
)

/**
 * Export includedRoutes function to pre-render dynamic routes
 * According to ViteSSG docs: https://github.com/antfu-collective/vite-ssg
 * This function must be exported from main.ts to ensure it has access to Vite environment variables
 *
 * The function receives:
 * - paths: array of route paths (strings)
 * - routes: array of route records (objects with path, component, etc.)
 *
 * It should return an array of paths (strings) to pre-render
 */
export async function includedRoutes(paths: string[], routes: any[]) {
  console.log(`\n[includedRoutes] Called with ${paths.length} static paths and ${routes.length} route records`)

  // Use the existing getDynamicRoutes function which handles imports correctly
  const { getDynamicRoutes } = await import('./utils/ssg-routes')
  const dynamicRoutePaths = await getDynamicRoutes()

  console.log(`[includedRoutes] Found ${dynamicRoutePaths.length} dynamic routes:`, dynamicRoutePaths)

  // According to ViteSSG docs example, use routes.flatMap() to transform route records
  // This is the recommended approach from the official documentation
  const allRoutes = routes.flatMap((route) => {
    // For the guides dynamic route, return all the specific slug paths
    if (route.path === '/guides/:slug' || route.path === '/guides/[slug]') {
      return dynamicRoutePaths
    }
    // For other routes, return their path as-is
    return route.path
  })

  console.log(`[includedRoutes] Returning ${allRoutes.length} total routes to pre-render`)
  console.log(`[includedRoutes] Routes:`, allRoutes.slice(0, 5), allRoutes.length > 5 ? '...' : '')
  console.log()

  return allRoutes
}
