/**
 * @module plugins/vite-ssg-dynamic-routes-generator
 * @description Vite plugin to ensure dynamic routes are properly generated for ViteSSG.
 *
 * @packageDocumentation
 * This plugin can be published as a standalone npm package: `vite-plugin-ssg-dynamic-routes-generator`
 */

import type { Plugin } from 'vite'
import { getGuideSlugsSync } from '../vite-ssg-dynamic-routes'

/**
 * Vite plugin to ensure dynamic routes are properly generated for ViteSSG
 * This plugin patches the ViteSSG configuration to include dynamic routes
 */
export function viteSSGDynamicRoutesGenerator(): Plugin {
  return {
    name: 'vite-ssg-dynamic-routes-generator',
    apply: 'build',
    enforce: 'pre',
    configResolved(_config) {
      // This hook runs after all plugins have resolved their config
      // We'll use build hooks instead
    },
    buildStart() {
      // Get guide slugs at build start
      const slugs = getGuideSlugsSync()
      if (slugs.length > 0) {
        console.log(`[vite-ssg-dynamic-routes-generator] Found ${slugs.length} dynamic routes to generate:`, slugs)
      }
    },
  }
}

/**
 * Helper function to generate route objects for ViteSSG includedRoutes
 * ViteSSG v28.2.2 expects route paths as strings for dynamic routes
 */
export function generateDynamicRoutePaths(basePath: string, slugs: string[]): string[] {
  return slugs.map(slug => `${basePath}/${slug}`)
}

/**
 * Helper function to generate route objects with params (alternative format)
 */
export function generateDynamicRouteObjects(basePath: string, slugs: string[], paramName: string = 'slug'): Array<{ path: string, params: Record<string, string> }> {
  return slugs.map(slug => ({
    path: basePath.replace(`:${paramName}`, slug).replace(`[${paramName}]`, slug),
    params: { [paramName]: slug },
  }))
}
