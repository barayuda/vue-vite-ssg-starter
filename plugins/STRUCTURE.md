# Plugins Directory Structure

This directory contains all custom Vite plugins and their utilities, organized for better maintainability and reusability.

## Directory Structure

```
plugins/
├── index.ts                          # Main exports - import from '@plugins'
├── utils/                             # Plugin utilities (internal use)
│   ├── index.ts                      # Utility exports
│   ├── api-middleware.ts             # API middleware utilities
│   ├── rate-limiter.ts               # Rate limiting utilities
│   └── env-security.ts               # Environment variable security
├── vite-plugin-api-middleware.ts     # API middleware plugin
├── vite-plugin-move-static-html.ts   # Static HTML mover plugin
├── vite-plugin-ssg-dynamic-routes.ts # SSG dynamic routes plugin
├── vite-plugin-ssg-dynamic-routes-generator.ts
├── vite-plugin-ssg-ensure-dynamic-routes.ts
├── README.md                          # Plugin documentation
└── STRUCTURE.md                       # This file
```

## Import Patterns

### Using the `@plugins/` Alias

The `@plugins/` alias is configured in both `vite.config.ts` and `tsconfig.json` for clean imports:

```typescript
// Import plugins from main index
import { apiMiddlewarePlugin, moveStaticHtmlPlugin } from '@plugins'

// Import from specific plugin file
import { getGuideSlugsSync } from '@plugins/vite-plugin-ssg-dynamic-routes'

// Import utilities (for use in plugins only)
import { createRateLimiter, validateEnvironmentVariables } from '@plugins/utils'
```

### Direct Imports (Also Supported)

```typescript
// Direct relative imports still work
import { apiMiddlewarePlugin } from './plugins/vite-plugin-api-middleware'
```

## Plugin Utilities

Utilities in `plugins/utils/` are designed for use within plugins, not in application code. They provide:

### `api-middleware.ts`
- `createApiMiddleware()` - Creates Express-style middleware for API requests
- `logRequest()` - Logs HTTP requests with colored status codes
- `addResponseHeaders()` - Adds custom headers to responses

### `rate-limiter.ts`
- `createRateLimiter()` - Creates rate limiting middleware
- `resetRateLimit()` - Resets rate limit for a client (testing)
- `clearRateLimitStore()` - Clears all rate limit entries (testing)
- `getRateLimitInfo()` - Gets rate limit info for debugging

### `env-security.ts`
- `validateEnvironmentVariables()` - Validates env vars for security
- `getSecureEnvVar()` - Safely gets environment variables
- `sanitizeEnvForClient()` - Creates sanitized env object for client

## Creating New Plugins

1. **Create plugin file**: `plugins/vite-plugin-<name>.ts`
2. **Export plugin function**: Must return a `Plugin` object
3. **Add to index**: Export in `plugins/index.ts`
4. **Use in config**: Import with `@plugins/` alias in `vite.config.ts`

### Example

```typescript
// plugins/vite-plugin-example.ts
import type { Plugin } from 'vite'

export interface ExamplePluginOptions {
  enabled?: boolean
}

export function examplePlugin(options: ExamplePluginOptions = {}): Plugin {
  return {
    name: 'vite-plugin-example',
    apply: 'serve', // or 'build' or undefined for both
    configureServer(server) {
      // Plugin implementation
    },
  }
}

// plugins/index.ts
export { examplePlugin } from './vite-plugin-example'
export type { ExamplePluginOptions } from './vite-plugin-example'

// vite.config.ts
import { examplePlugin } from '@plugins'

export default defineConfig({
  plugins: [
    examplePlugin({ enabled: true }),
  ],
})
```

## Best Practices

1. **Use `@plugins/` alias** for consistency and cleaner imports
2. **Keep utilities in `plugins/utils/`** - don't mix with application utilities
3. **Document plugins** - Add JSDoc comments and examples
4. **Export types** - Export TypeScript interfaces/types for plugin options
5. **Test plugins** - Create tests alongside plugin files if needed
6. **Follow naming** - Use `vite-plugin-<name>.ts` convention

## Migration Notes

If you have old imports from `src/utils/`, they should be updated:

```typescript
// Old (still works, but deprecated)
import { createApiMiddleware } from '../src/utils/api-middleware'

// New (recommended)
import { createApiMiddleware } from '@plugins/utils/api-middleware'
```

The old files in `src/utils/` can be kept for backward compatibility or removed if not used elsewhere.

