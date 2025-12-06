/**
 * Custom Vite plugins
 *
 * This directory contains custom Vite plugins for the project.
 */
export { moveStaticHtmlPlugin } from './vite-plugin-move-static-html'
export { getGuideSlugs, getGuideSlugsSync, ssgDynamicRoutesPlugin } from './vite-plugin-ssg-dynamic-routes'
export { generateDynamicRouteObjects, generateDynamicRoutePaths, viteSSGDynamicRoutesGenerator } from './vite-plugin-ssg-dynamic-routes-generator'
export { viteSSGEnsureDynamicRoutes } from './vite-plugin-ssg-ensure-dynamic-routes'
