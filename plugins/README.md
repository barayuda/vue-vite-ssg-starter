# Custom Vite Plugins

This directory contains custom Vite plugins for the project.

## Plugins

### `moveStaticHtmlPlugin`

Moves static HTML files (except `index.html` and `notfound.html`) into their own folders with `index.html` inside.

**Example:**
- `index.html` → Don't move
- `hotels.html` → Create folder `hotels`, rename `hotels.html` to `index.html` and move to `hotels/index.html`

**Usage:**

```typescript
import { moveStaticHtmlPlugin } from './plugins'

export default defineConfig({
  plugins: [
    // ... other plugins
    moveStaticHtmlPlugin(),
  ],
})
```

**When it runs:**
- Only during build (`apply: 'build'`)
- After all other plugins (`enforce: 'post'`)

### `ssgDynamicRoutesPlugin`

Extends dynamic routes for SSG pre-rendering. Supports both mock API (file-based) and real API (HTTP fetch) to generate guide slugs for dynamic routes.

**Features:**
- Automatic fallback to mock API if real API fails
- 24-hour response caching for faster builds
- Supports GET/POST requests with custom headers
- Handles nested API responses via response path
- Configurable via environment variables

**Usage:**

The plugin provides two functions:

1. **`getGuideSlugsSync()`** - Synchronous version for use in `vite.config.ts`:
```typescript
import { getGuideSlugsSync } from './plugins/vite-plugin-ssg-dynamic-routes'

// In extendRoute hook
const guideSlugs = getGuideSlugsSync()
```

2. **`getGuideSlugs()`** - Async version for use in `src/utils/ssg-routes.ts`:
```typescript
import { getGuideSlugs } from './plugins/vite-plugin-ssg-dynamic-routes'

const slugs = await getGuideSlugs({
  apiEndpoint: process.env.VITE_GUIDES_API_ENDPOINT,
  apiMethod: 'GET',
  apiHeaders: { 'Authorization': 'Bearer TOKEN' },
  // ... other options
})
```

**Configuration:**

Set environment variables in `.env.development` or `.env.production`:

```bash
VITE_GUIDES_API_ENDPOINT=https://api.example.com/guides
VITE_GUIDES_API_HEADERS={"Authorization": "Bearer TOKEN"}
VITE_GUIDES_API_RESPONSE_PATH=data.guides
```

If no `VITE_GUIDES_API_ENDPOINT` is set, the plugin automatically uses the mock API from `src/data/mock-api.ts`.

**When it runs:**
- Only during build (`apply: 'build'`)
- Before other plugins (`enforce: 'pre'`)

**Documentation:**
See `docs/API_CONFIGURATION.md` for detailed configuration examples and troubleshooting.

## Adding New Plugins

1. Create a new file in this directory: `vite-plugin-<name>.ts`
2. Export the plugin function
3. Add the export to `index.ts`
4. Import and use in `vite.config.ts`

