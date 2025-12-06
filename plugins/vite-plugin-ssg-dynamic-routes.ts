import type { Plugin } from 'vite'
import fs from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'

/**
 * Configuration options for the SSG dynamic routes plugin
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
 * Vite plugin to extend dynamic routes for SSG pre-rendering
 *
 * This plugin can read from either a mock API file or a real API endpoint
 * to generate dynamic routes for SSG pre-rendering.
 *
 * @param _options - Configuration options for the plugin (reserved for future use)
 * @returns {Plugin} A Vite plugin that extends routes for SSG
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
 * Get all guide slugs from mock API file
 * This is used as a fallback when no API endpoint is provided
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
 * Fetch guides from a real API endpoint
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
 * Get cached slugs from file
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
 * Save slugs to cache file
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
 * Get all guide slugs from either mock API or real API
 * This is used to generate dynamic routes for SSG pre-rendering
 *
 * @param options - Configuration options
 * @returns Array of guide slugs
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
 * Synchronous version for use in vite.config.ts extendRoute hook
 * This will use mock API or cached data only
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
