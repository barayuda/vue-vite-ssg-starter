# Custom Vite Plugins

This directory contains custom Vite plugins for the project. Each plugin is self-contained in its own folder and can be published as a standalone npm package.

## Structure

```
plugins/
├── index.ts                    # Main exports - import from '@plugins'
├── vite-api-middleware/        # API middleware plugin
│   ├── index.ts               # Plugin entry point
│   ├── types.ts               # TypeScript types
│   ├── utils.ts              # API middleware utilities
│   └── rate-limiter.ts       # Rate limiting utilities
├── vite-move-static-html/      # Static HTML mover plugin
│   └── index.ts
├── vite-ssg-dynamic-routes/    # SSG dynamic routes plugin
│   └── index.ts
├── vite-ssg-dynamic-routes-generator/
│   └── index.ts
├── vite-ssg-ensure-dynamic-routes/
│   └── index.ts
├── _shared/                   # Shared utilities (not plugins)
│   └── env-security.ts       # Used by vite.config.ts
└── README.md                  # This file
```

## Importing Plugins

Use the `@plugins/` alias for clean imports:

```typescript
// Import plugins
import { apiMiddlewarePlugin, moveStaticHtmlPlugin } from '@plugins'

// Import from specific plugin
import { getGuideSlugsSync } from '@plugins/vite-ssg-dynamic-routes'

// Import types
import type { ApiMiddlewarePluginOptions, RateLimitOptions } from '@plugins/vite-api-middleware'

// Import shared utilities (used by vite.config.ts)
import { validateEnvironmentVariables } from '@plugins/_shared/env-security'
```

## Plugins

### `apiMiddlewarePlugin`

Adds API middleware to the development server with CORS, rate limiting, and custom routes.

**Usage:**

```typescript
import { apiMiddlewarePlugin } from '@plugins'

export default defineConfig({
  plugins: [
    apiMiddlewarePlugin({
      enableLogging: true,
      enableCors: true,
      rateLimit: {
        maxRequests: 100,
        windowMs: 60000,
      },
    }),
  ],
})
```

**When it runs:**
- Only during development (`command === 'serve'`)
- Applies middleware before proxy forwarding

**Publishing:**
This plugin can be published as `vite-plugin-api-middleware`

**Folder:** `plugins/vite-api-middleware/`

### `moveStaticHtmlPlugin`

Moves static HTML files (except `index.html` and `notfound.html`) into their own folders with `index.html` inside.

**Example:**
- `index.html` → Don't move
- `hotels.html` → Create folder `hotels`, rename `hotels.html` to `index.html` and move to `hotels/index.html`

**Usage:**

```typescript
import { moveStaticHtmlPlugin } from '@plugins'

export default defineConfig({
  plugins: [
    moveStaticHtmlPlugin(),
  ],
})
```

**When it runs:**
- Only during build (`apply: 'build'`)
- After all other plugins (`enforce: 'post'`)

**Publishing:**
This plugin can be published as `vite-plugin-move-static-html`

**Folder:** `plugins/vite-move-static-html/`

### `ssgDynamicRoutesPlugin`

Extends dynamic routes for SSG pre-rendering. Supports both mock API (file-based) and real API (HTTP fetch) to generate guide slugs for dynamic routes.

**Features:**
- Automatic fallback to mock API if real API fails
- 24-hour response caching for faster builds
- Supports GET/POST requests with custom headers
- Handles nested API responses via response path
- Configurable via environment variables

**Usage:**

```typescript
import { getGuideSlugsSync } from '@plugins/vite-ssg-dynamic-routes'

// In extendRoute hook
const guideSlugs = getGuideSlugsSync()
```

**Publishing:**
This plugin can be published as `vite-plugin-ssg-dynamic-routes`

**Folder:** `plugins/vite-ssg-dynamic-routes/`

## Adding New Plugins

1. Create a new folder: `plugins/vite-<plugin-name>/` (with 'vite-' prefix)
2. Create `index.ts` with your plugin function
3. Export the plugin function
4. Add the export to `plugins/index.ts`
5. Import and use in `vite.config.ts` using `@plugins/` alias

**Example:**

```typescript
// plugins/vite-my-plugin/index.ts
import type { Plugin } from 'vite'

export function myPlugin(options = {}): Plugin {
  return {
    name: 'vite-plugin-my-plugin',
    // ... plugin implementation
  }
}

// plugins/index.ts
export { myPlugin } from './vite-my-plugin'

// vite.config.ts
import { myPlugin } from '@plugins'
```

## Publishing Plugins

Each plugin folder is designed to be publishable as a standalone npm package:

1. **Create package.json** in the plugin folder:
   ```json
   {
     "name": "vite-plugin-api-middleware",
     "version": "1.0.0",
     "main": "index.ts",
     "types": "index.ts"
   }
   ```

2. **Add README.md** with plugin documentation

3. **Publish to npm**:
   ```bash
   cd plugins/vite-api-middleware
   npm publish
   ```

## Shared Utilities

The `_shared/` folder contains utilities used by `vite.config.ts` or multiple plugins, but are not part of any specific plugin:

- `env-security.ts` - Environment variable validation (used by vite.config.ts)

These are not meant to be published as separate packages.

## Best Practices

1. **Self-contained**: Each plugin should have all its dependencies in its own folder
2. **Type exports**: Export TypeScript types for plugin options
3. **Documentation**: Add JSDoc comments and examples
4. **Naming**: Use `vite-plugin-<name>` convention for npm packages
5. **Versioning**: Follow semantic versioning when publishing
