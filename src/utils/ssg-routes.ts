/**
 * Get all dynamic routes that should be pre-rendered during SSG build
 * This function can use either mock API or real API to generate route paths
 *
 * Note: This is used during build time in main.ts includedRoutes hook
 * It supports both mock API (file-based) and real API (HTTP fetch)
 */
/**
 * Extract guide slugs directly from mock API file
 * This avoids import issues during SSR build
 */
async function getGuideSlugsFromMockAsync(): Promise<string[]> {
  try {
    // Use dynamic imports for Node.js modules (ESM compatible)
    const fs = await import('node:fs')
    const path = await import('node:path')
    const processModule = await import('node:process')
    const process = processModule.default || processModule

    // Try multiple path resolution strategies
    let mockApiPath: string | null = null

    // Strategy 1: Relative to process.cwd() (works during build)
    const pathFromCwd = path.resolve(process.cwd(), 'src/data/mock-api.ts')
    if (fs.existsSync(pathFromCwd)) {
      mockApiPath = pathFromCwd
    }
    else {
      // Strategy 2: Try __dirname approach (if available)
      try {
        const { fileURLToPath } = await import('node:url')
        const currentFile = fileURLToPath(import.meta.url)
        const currentDir = path.dirname(currentFile)
        const pathFromDir = path.resolve(currentDir, '../../src/data/mock-api.ts')
        if (fs.existsSync(pathFromDir)) {
          mockApiPath = pathFromDir
        }
      }
      catch {
        // Ignore
      }
    }

    if (!mockApiPath || !fs.existsSync(mockApiPath)) {
      console.warn(`[getDynamicRoutes] Mock API file not found. Tried: ${pathFromCwd}`)
      return []
    }

    const mockApiContent = fs.readFileSync(mockApiPath, 'utf-8')

    // Find the section between "const guides:" and "const projects:" (or end of file)
    const guidesStart = mockApiContent.indexOf('const guides: Guide[] = [')
    if (guidesStart === -1) {
      return []
    }

    const projectsStart = mockApiContent.indexOf('const projects: Project[] = [')
    const guidesEnd = projectsStart !== -1 ? projectsStart : mockApiContent.length

    // Extract the guides section
    const guidesSection = mockApiContent.substring(guidesStart, guidesEnd)

    // Extract all slug values from the guides section
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

export async function getDynamicRoutes(): Promise<string[]> {
  console.log(`[getDynamicRoutes] Starting, SSR: ${import.meta.env.SSR}`)

  try {
    // During SSR/build, extract slugs directly from mock API
    // This avoids import issues with the plugin module
    const slugs = await getGuideSlugsFromMockAsync()
    console.log(`[getDynamicRoutes] Found ${slugs.length} slugs from mock API:`, slugs)

    const routes = slugs.map(slug => `/guides/${slug}`)
    console.log(`[getDynamicRoutes] Generated ${routes.length} dynamic routes:`, routes)

    return routes
  }
  catch (error) {
    console.error('❌ Failed to extract guide routes for SSG:', error)
    return []
  }
}
