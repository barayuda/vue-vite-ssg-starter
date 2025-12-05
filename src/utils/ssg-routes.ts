/**
 * Get all dynamic routes that should be pre-rendered during SSG build
 * This function can use either mock API or real API to generate route paths
 *
 * Note: This is used during build time in main.ts includedRoutes hook
 * It supports both mock API (file-based) and real API (HTTP fetch)
 */
export async function getDynamicRoutes(): Promise<string[]> {
  try {
    // Import the async version of getGuideSlugs
    const { getGuideSlugs } = await import('../plugins/vite-plugin-ssg-dynamic-routes')

    // Import process module for environment variables
    const processModule = await import('node:process')
    const process = processModule.default

    // Read environment variables for API configuration
    // You can set these in .env.production or .env.development
    const apiEndpoint = process.env.VITE_GUIDES_API_ENDPOINT
    const apiMethod = (process.env.VITE_GUIDES_API_METHOD as 'GET' | 'POST') || 'GET'
    const responsePath = process.env.VITE_GUIDES_API_RESPONSE_PATH
    const slugField = process.env.VITE_GUIDES_API_SLUG_FIELD || 'slug'
    const timeout = Number.parseInt(process.env.VITE_GUIDES_API_TIMEOUT || '10000', 10)

    // Parse API headers from environment variable (JSON string)
    let apiHeaders: Record<string, string> = {}
    if (process.env.VITE_GUIDES_API_HEADERS) {
      try {
        apiHeaders = JSON.parse(process.env.VITE_GUIDES_API_HEADERS)
      }
      catch {
        console.warn('⚠️ Failed to parse VITE_GUIDES_API_HEADERS, using empty headers')
      }
    }

    // Parse API body from environment variable (JSON string, for POST requests)
    let apiBody: Record<string, unknown> | undefined
    if (process.env.VITE_GUIDES_API_BODY) {
      try {
        apiBody = JSON.parse(process.env.VITE_GUIDES_API_BODY)
      }
      catch {
        console.warn('⚠️ Failed to parse VITE_GUIDES_API_BODY, ignoring')
      }
    }

    // Fetch guide slugs (will use API if endpoint is provided, otherwise falls back to mock)
    const slugs = await getGuideSlugs({
      apiEndpoint,
      apiMethod,
      apiHeaders,
      apiBody,
      responsePath,
      slugField,
      timeout,
      cache: true, // Enable caching for build performance
    })

    return slugs.map(slug => `/guides/${slug}`)
  }
  catch (error) {
    console.warn('⚠️ Failed to extract guide routes for SSG:', error)
    return []
  }
}
