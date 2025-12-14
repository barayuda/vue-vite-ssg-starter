# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev              # Start dev server with host exposure
pnpm build            # Generate static site (uses vite-ssg build)
pnpm preview          # Build then preview
pnpm preview:dist     # Preview existing build
pnpm lint             # ESLint with caching
pnpm lint:stylelint   # Stylelint for Vue/CSS files
pnpm test             # Vitest in watch mode
pnpm test:run         # Single test run
pnpm test:ui          # Vitest UI
pnpm test:coverage    # Coverage report
```

## Architecture

### Static Site Generation (ViteSSG)

This is a **static-first** site using ViteSSG. The app pre-renders all pages at build time.

- **Entry point**: `src/main.ts` exports `createApp` via ViteSSG and an `includedRoutes` function for dynamic route pre-rendering
- **Dynamic routes**: The `includedRoutes` function in `src/main.ts` resolves dynamic routes (e.g., `/guides/:slug`) at build time using `src/utils/ssg-routes.ts`
- **State hydration**: Pinia state is serialized during SSR and rehydrated on client via `ctx.initialState`

### File-Based Routing

Routes are auto-generated from `src/pages/` using `vite-plugin-pages` with Nuxt-style conventions:
- `index.vue` → `/`
- `guides/index.vue` → `/guides`
- `guides/[slug].vue` → `/guides/:slug` (dynamic)
- `.md` files are also valid route pages via `unplugin-vue-markdown`

Layouts wrap routes via `vite-plugin-vue-layouts` from `src/layouts/`.

### Vite Plugins (Custom)

Located in `/plugins/`:
- `vite-plugin-move-static-html.ts` — Post-build hook that moves HTML files into subfolders for SSG hosting
- `vite-plugin-ssg-dynamic-routes.ts` — Provides `getGuideSlugsSync()` for build-time dynamic route resolution
- `vite-plugin-ssg-ensure-dynamic-routes.ts` — Ensures dynamic routes are available during SSG build

### Key Directories

- `src/composables/` — Reusable composition functions (useFetch, useNotification, useResponsive)
- `src/stores/` — Pinia stores (showcase.store.ts manages mock API data)
- `src/data/mock-api.ts` — Local mock data for offline development
- `src/modules/` — Auto-installed modules (e.g., nprogress.ts) loaded via glob in main.ts
- `src/types/` — TypeScript type definitions

### Path Alias

Use `/@/` to reference `src/` (configured in both vite.config.ts and vitest.config.ts).

### Testing

Tests use Vitest with happy-dom. Test files follow the pattern `*.test.ts` or `*.spec.ts` and live alongside source files in `__tests__/` subdirectories.

Setup file: `src/__tests__/setup.ts`

## Code Style

- Vue Composition API with `<script setup>` syntax
- TypeScript everywhere; prefer interfaces over types
- Functional/declarative patterns; avoid classes
- Tailwind CSS for styling with mobile-first approach
- Use VueUse composables where applicable
- Lowercase with dashes for directory names (e.g., `components/auth-wizard`)
- Named exports for functions

## Environment Variables

Client-side variables must be prefixed with `VITE_`. Key variables:
- `VITE_APP_BASE_URL` — Base URL for sitemap/previews
- `VITE_RECAPTCHA_SITE_KEY` — Recaptcha demo on `/plugins`
- `VITE_GUIDES_API_*` — Optional API config for real dynamic routes (see docs/API_CONFIGURATION.md)
