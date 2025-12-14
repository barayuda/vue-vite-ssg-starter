/**
 * @module plugins/vite-ssg-dynamic-routes
 * @description Vite plugin for generating dynamic routes for static site generation.
 * Extracts route paths from mock API files or real API endpoints to pre-render during SSG build.
 *
 * @packageDocumentation
 * This plugin can be published as a standalone npm package: `vite-plugin-ssg-dynamic-routes`
 */

import type { Plugin } from 'vite'
import fs from 'node:fs'
import { dirname, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

// ESM-compatible __dirname replacement
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/**
 * @interface SSGDynamicRoutesOptions
 * @description Configuration options for the SSG dynamic routes plugin.
 */
export interface SSGDynamicRoutesOptions {
  /**
   * API endpoint to fetch guides from (e.g., 'https://api.example.com/guides')
   * If not provided, falls back to mock API file
   */
  apiEndpoint?: string

  /**
   * API endpoint method (default: 'GET')
   */
  apiMethod?: 'GET' | 'POST'

  /**
   * Additional headers for API requests
   */
  apiHeaders?: Record<string, string>

  /**
   * Request body for POST requests
   */
  apiBody?: Record<string, unknown>

  /**
   * Path to the response data (e.g., 'data.guides' for nested response)
   * If not provided, assumes the response is an array directly
   */
  responsePath?: string

  /**
   * Field name in the guide object that contains the slug (default: 'slug')
   */
  slugField?: string

  /**
   * Timeout for API requests in milliseconds (default: 10000)
   */
  timeout?: number

  /**
   * Enable caching of API responses (default: true)
   */
  cache?: boolean

  /**
   * Path to cache file (default: 'node_modules/.cache/ssg-routes.json')
   */
  cachePath?: string
}

/**
 * @function ssgDynamicRoutesPlugin
 * @description Creates a Vite plugin that extends dynamic routes for SSG pre-rendering.
 * This plugin can read from either a mock API file or a real API endpoint to generate
 * dynamic routes for SSG pre-rendering.
 *
 * @param {SSGDynamicRoutesOptions} [_options] - Configuration options for the plugin (reserved for future use)
 * @returns {Plugin} A Vite plugin that extends routes for SSG
 *
 * @example
 * ```typescript
 * // In vite.config.ts
 * import { ssgDynamicRoutesPlugin } from './plugins/vite-plugin-ssg-dynamic-routes'
 *
 * export default defineConfig({
 *   plugins: [
 *     ssgDynamicRoutesPlugin({
 *       apiEndpoint: 'https://api.example.com/guides',
 *       slugField: 'slug'
 *     })
 *   ]
 * })
 * ```
 *
 * @remarks
 * - Only runs during build (apply: 'build')
 * - Runs before other plugins (enforce: 'pre')
 * - Route extension is handled in vite.config.ts via extendRoute hook
 * - Currently uses mock API file extraction as primary method
 */
export function ssgDynamicRoutesPlugin(_options: SSGDynamicRoutesOptions = {}): Plugin {
  return {
    name: 'ssg-dynamic-routes',
    apply: 'build',
    enforce: 'pre',
    version: '0.0.1',
    // This plugin works with vite-plugin-pages' extendRoute hook
    // We'll handle route extension in vite.config.ts instead
  }
}

/**
 * @function getGuideSlugsFromMock
 * @description Gets all guide slugs from the mock API file.
 * This is used as a fallback when no API endpoint is provided.
 *
 * @returns {string[]} Array of guide slugs extracted from mock API file
 *
 * @remarks
 * - Uses multiple path resolution strategies for different build contexts
 * - Parses TypeScript file to extract slug values using regex
 * - Returns empty array if file not found or parsing fails
 * - Only extracts slugs from guides array, not projects
 */
function getGuideSlugsFromMock(): string[] {
  try {
    // Try multiple path resolution strategies to handle different build contexts
    let mockApiPath: string | null = null

    // Strategy 1: Relative to __dirname (works in source)
    const pathFromDirname = resolve(__dirname, '../src/data/mock-api.ts')
    if (fs.existsSync(pathFromDirname)) {
      mockApiPath = pathFromDirname
    }
    else {
      // Strategy 2: Relative to process.cwd() (works during build)
      const pathFromCwd = resolve(process.cwd(), 'src/data/mock-api.ts')
      if (fs.existsSync(pathFromCwd)) {
        mockApiPath = pathFromCwd
      }
    }

    if (!mockApiPath || !fs.existsSync(mockApiPath)) {
      console.warn(`⚠️ Mock API file not found. Tried: ${pathFromDirname} and ${resolve(process.cwd(), 'src/data/mock-api.ts')}`)
      return []
    }

    const mockApiContent = fs.readFileSync(mockApiPath, 'utf-8')

    // Find the section between "const guides:" and "const projects:" (or end of file)
    // This ensures we only extract slugs from the guides array, not from projects
    const guidesStart = mockApiContent.indexOf('const guides: Guide[] = [')
    if (guidesStart === -1)
      return []

    const projectsStart = mockApiContent.indexOf('const projects: Project[] = [')
    const guidesEnd = projectsStart !== -1 ? projectsStart : mockApiContent.length

    // Extract the guides section
    const guidesSection = mockApiContent.substring(guidesStart, guidesEnd)

    // Extract all slug values from the guides section
    // Match pattern: slug: 'value' or slug: "value"
    const slugMatches = guidesSection.matchAll(/slug:\s*['"]([^'"]+)['"]/g)
    const slugs: string[] = []

    for (const match of slugMatches) {
      slugs.push(match[1])
    }

    return slugs
  }
  catch (error) {
    console.warn('⚠️ Failed to extract guide slugs from mock API:', error)
    return []
  }
}

/**
 * @function fetchGuidesFromAPI
 * @description Fetches guides from a real API endpoint and extracts slugs.
 * Supports GET and POST requests with custom headers and body.
 *
 * @param {Required<Pick<SSGDynamicRoutesOptions, 'apiEndpoint' | 'apiMethod' | 'apiHeaders' | 'apiBody' | 'responsePath' | 'slugField' | 'timeout'>>} options - API request configuration
 * @returns {Promise<string[]>} Array of guide slugs extracted from API response
 *
 * @throws {Error} If API request fails or times out
 *
 * @remarks
 * - Supports timeout via AbortController
 * - Can handle nested response data via responsePath
 * - Extracts slug field from each guide object
 * - Returns empty array on error
 */
async function fetchGuidesFromAPI(options: Required<Pick<SSGDynamicRoutesOptions, 'apiEndpoint' | 'apiMethod' | 'apiHeaders' | 'apiBody' | 'responsePath' | 'slugField' | 'timeout'>>): Promise<string[]> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), options.timeout)

    const fetchOptions: RequestInit = {
      method: options.apiMethod,
      headers: {
        'Content-Type': 'application/json',
        ...options.apiHeaders,
      },
      signal: controller.signal,
    }

    if (options.apiMethod === 'POST' && options.apiBody) {
      fetchOptions.body = JSON.stringify(options.apiBody)
    }

    const response = await fetch(options.apiEndpoint, fetchOptions)
    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    // Navigate through response path if provided (e.g., 'data.guides')
    let guides = data
    if (options.responsePath) {
      const pathParts = options.responsePath.split('.')
      for (const part of pathParts) {
        guides = guides?.[part]
        if (!guides)
          throw new Error(`Response path '${options.responsePath}' not found in API response`)
      }
    }

    // Ensure guides is an array
    if (!Array.isArray(guides)) {
      throw new TypeError('API response is not an array or does not match the expected structure')
    }

    // Extract slugs from guides
    const slugs = guides
      .map((guide: Record<string, unknown>) => guide[options.slugField])
      .filter((slug): slug is string => typeof slug === 'string')

    return slugs
  }
  catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`API request timed out after ${options.timeout}ms`)
    }
    throw error
  }
}

/**
 * @function getCachedSlugs
 * @private
 * @description Retrieves cached guide slugs from a cache file.
 * Validates cache age and returns null if cache is expired or invalid.
 *
 * @param {string} cachePath - Path to the cache file
 * @returns {string[] | null} Cached slugs array, or null if cache is invalid/expired
 *
 * @remarks
 * - Cache is valid for 24 hours
 * - Returns null if file doesn't exist or is invalid
 * - Silently handles parse errors
 */
function getCachedSlugs(cachePath: string): string[] | null {
  try {
    if (!fs.existsSync(cachePath))
      return null

    const cacheContent = fs.readFileSync(cachePath, 'utf-8')
    const cache = JSON.parse(cacheContent)

    // Check if cache is still valid (24 hours)
    const cacheAge = Date.now() - cache.timestamp
    const maxAge = 24 * 60 * 60 * 1000 // 24 hours

    if (cacheAge > maxAge)
      return null

    return cache.slugs
  }
  catch {
    return null
  }
}

/**
 * @function saveCachedSlugs
 * @private
 * @description Saves guide slugs to a cache file with timestamp.
 * Creates cache directory if it doesn't exist.
 *
 * @param {string} cachePath - Path to the cache file
 * @param {string[]} slugs - Array of slugs to cache
 *
 * @remarks
 * - Creates cache directory recursively if needed
 * - Includes timestamp for cache validation
 * - Logs warning on failure but doesn't throw
 */
function saveCachedSlugs(cachePath: string, slugs: string[]): void {
  try {
    const cacheDir = resolve(cachePath, '..')
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true })
    }

    const cache = {
      timestamp: Date.now(),
      slugs,
    }

    fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2))
  }
  catch (error) {
    console.warn('⚠️ Failed to save cache:', error)
  }
}

/**
 * @function getGuideSlugs
 * @description Gets all guide slugs from either mock API or real API endpoint.
 * This is used to generate dynamic routes for SSG pre-rendering.
 * Supports caching and automatic fallback to mock API on error.
 *
 * @param {SSGDynamicRoutesOptions} [options] - Configuration options
 * @returns {Promise<string[]>} Array of guide slugs
 *
 * @example
 * ```typescript
 * const slugs = await getGuideSlugs({
 *   apiEndpoint: 'https://api.example.com/guides',
 *   slugField: 'slug',
 *   cache: true
 * })
 * ```
 *
 * @remarks
 * - Uses mock API if no apiEndpoint is provided
 * - Checks cache first if caching is enabled
 * - Falls back to mock API if API request fails
 * - Saves successful API responses to cache
 * - Logs progress and warnings for debugging
 */
export async function getGuideSlugs(options: SSGDynamicRoutesOptions = {}): Promise<string[]> {
  const {
    apiEndpoint,
    apiMethod = 'GET',
    apiHeaders = {},
    apiBody,
    responsePath,
    slugField = 'slug',
    timeout = 10000,
    cache = true,
    cachePath = resolve(process.cwd(), 'node_modules/.cache/ssg-routes.json'),
  } = options

  // If no API endpoint is provided, use mock API
  if (!apiEndpoint) {
    return getGuideSlugsFromMock()
  }

  // Check cache first if enabled
  if (cache) {
    const cachedSlugs = getCachedSlugs(cachePath)
    if (cachedSlugs) {
      console.log(`✅ Using cached guide slugs (${cachedSlugs.length} routes)`)
      return cachedSlugs
    }
  }

  try {
    console.log(`📡 Fetching guide slugs from API: ${apiEndpoint}`)

    const slugs = await fetchGuidesFromAPI({
      apiEndpoint,
      apiMethod,
      apiHeaders,
      apiBody: apiBody ?? {},
      responsePath: responsePath ?? '',
      slugField,
      timeout,
    })

    // Save to cache if enabled
    if (cache && slugs.length > 0) {
      saveCachedSlugs(cachePath, slugs)
    }

    console.log(`✅ Fetched ${slugs.length} guide slugs from API`)
    return slugs
  }
  catch (error) {
    console.warn(`⚠️ Failed to fetch guide slugs from API: ${error instanceof Error ? error.message : error}`)
    console.warn('⚠️ Falling back to mock API...')

    // Fallback to mock API on error
    return getGuideSlugsFromMock()
  }
}

/**
 * @function getGuideSlugsSync
 * @description Synchronous version for use in vite.config.ts extendRoute hook.
 * This will use mock API or cached data only (no async API calls).
 * Required because extendRoute hook cannot be async.
 *
 * @param {SSGDynamicRoutesOptions} [options] - Configuration options
 * @returns {string[]} Array of guide slugs
 *
 * @example
 * ```typescript
 * // In vite.config.ts extendRoute hook
 * const guideSlugs = getGuideSlugsSync()
 * if (route.path === '/guides/:slug') {
 *   // Use guideSlugs to extend route
 * }
 * ```
 *
 * @remarks
 * - Checks cache first if caching is enabled
 * - Falls back to mock API file extraction
 * - Cannot make async API calls (use getGuideSlugs for that)
 * - Used during build-time route generation
 */
export function getGuideSlugsSync(options: SSGDynamicRoutesOptions = {}): string[] {
  const { cachePath = resolve(process.cwd(), 'node_modules/.cache/ssg-routes.json') } = options

  // Try cache first
  if (options.cache !== false) {
    const cachedSlugs = getCachedSlugs(cachePath)
    if (cachedSlugs)
      return cachedSlugs
  }

  // Fallback to mock API
  return getGuideSlugsFromMock()
}
