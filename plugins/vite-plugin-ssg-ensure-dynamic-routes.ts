import type { Plugin } from 'vite'
import { getGuideSlugsSync } from './vite-plugin-ssg-dynamic-routes'

/**
 * Vite plugin to ensure dynamic routes are generated for ViteSSG
 * This plugin logs the dynamic routes to help debug ViteSSG's includedRoutes
 */
export function viteSSGEnsureDynamicRoutes(): Plugin {
  return {
    name: 'vite-ssg-ensure-dynamic-routes',
    apply: 'build',
    enforce: 'pre',

    buildStart() {
      // Get guide slugs at build start and log them
      const guideSlugs = getGuideSlugsSync()
      if (guideSlugs.length > 0) {
        const routes = guideSlugs.map(slug => `/guides/${slug}`)
        console.log(`\n[vite-ssg-ensure-dynamic-routes] Found ${guideSlugs.length} dynamic routes:`)
        routes.forEach(route => console.log(`  ✓ ${route}`))
        console.log(`\n💡 These routes should be returned by includedRoutes() in src/main.ts\n`)
      }
    },
  }
}
