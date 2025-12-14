/**
 * @module plugins
 * @description Custom Vite plugins for the project.
 *
 * Each plugin is self-contained in its own folder and can be published as a standalone npm package.
 * Use the @plugins/ alias for imports:
 *
 * @example
 * ```typescript
 * import { apiMiddlewarePlugin } from '@plugins'
 * import { moveStaticHtmlPlugin } from '@plugins'
 * ```
 */

// Shared utilities (used by vite.config.ts, not part of any plugin)
export { validateEnvironmentVariables } from './_shared/env-security'
export type { EnvSecurityOptions } from './_shared/env-security'

// Vite Plugins - Each plugin is in its own folder with 'vite-' prefix
export { apiMiddlewarePlugin } from './vite-api-middleware'

export type { ApiMiddlewarePluginOptions, RateLimitOptions } from './vite-api-middleware'

export { moveStaticHtmlPlugin } from './vite-move-static-html'

export { getGuideSlugs, getGuideSlugsSync, ssgDynamicRoutesPlugin } from './vite-ssg-dynamic-routes'

export { generateDynamicRouteObjects, generateDynamicRoutePaths, viteSSGDynamicRoutesGenerator } from './vite-ssg-dynamic-routes-generator'
export { viteSSGEnsureDynamicRoutes } from './vite-ssg-ensure-dynamic-routes'
