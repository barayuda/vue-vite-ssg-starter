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
  {
    routes,
    // Configure includedRoutes to pre-render all guide routes during SSG build
    // This only affects build-time pre-rendering, not runtime routing
    async includedRoutes(routes) {
      // Only add dynamic routes during SSG build
      if (import.meta.env.SSR) {
        try {
          // Get all guide slugs from mock API
          const { getDynamicRoutes } = await import('./utils/ssg-routes')
          const dynamicRoutes = await getDynamicRoutes()

          // Combine static routes with dynamic guide routes for pre-rendering
          return [...routes, ...dynamicRoutes]
        }
        catch (error) {
          console.warn('⚠️ Failed to load dynamic routes for SSG:', error)
          return routes
        }
      }
      // In client/dev mode, return routes as-is (dynamic routes are handled by vite-plugin-pages)
      return routes
    },
  },
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
