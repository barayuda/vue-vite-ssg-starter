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

## Adding New Plugins

1. Create a new file in this directory: `vite-plugin-<name>.ts`
2. Export the plugin function
3. Add the export to `index.ts`
4. Import and use in `vite.config.ts`

