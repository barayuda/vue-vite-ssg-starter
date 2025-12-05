# Vite SSG Vue Starter

Static-first boilerplate using Vite, Vue 3, ViteSSG, Pinia, Tailwind v4, file-based routing (with dynamic segments), and vue3-recaptcha-v2. Markdown pages are supported out of the box.

## Quick start

```bash
pnpm install
pnpm dev         # Start dev server
pnpm build       # Generate static site with vite-ssg
pnpm preview     # Serve the production bundle
pnpm lint        # ESLint (pre-commit hook runs this)
```

Requirements: Node 22+, pnpm 10+.

## Project structure

- `src/pages` — File-based routes; dynamic demos live in `src/pages/guides/[slug].vue`.
- `src/stores/showcase.store.ts` — Pinia store wiring mock API data for guides/projects.
- `src/data/mock-api.ts` — Local mock data + async helpers to keep the starter offline-friendly.
- `src/components` — Shared UI (header, footer, notifications, back-to-top, error boundary).
- `src/styles/main.css` — Tailwind v4 entry, tokens, and small UI primitives.
- `scripts/post-build.mjs` — Moves built HTML into subfolders for SSG-friendly hosting.

## Environment

Duplicate `.env.development` for new environments. Variables used:

- `VITE_APP_BASE_URL` — Base URL for sitemap generation and previews.
- `VITE_APP_ENV` / `VITE_APP_PROXY_URL` — Reserved for future proxying.
- `VITE_RECAPTCHA_SITE_KEY` — Required to render the Recaptcha demo (`src/pages/plugins.vue`).

### Dynamic Routes API Configuration

To use a real API instead of the mock API for generating dynamic routes, configure these variables:

- `VITE_GUIDES_API_ENDPOINT` — API endpoint to fetch guides (e.g., `https://api.example.com/guides`)
- `VITE_GUIDES_API_METHOD` — HTTP method (default: `GET`)
- `VITE_GUIDES_API_HEADERS` — JSON string of headers (e.g., `{"Authorization": "Bearer TOKEN"}`)
- `VITE_GUIDES_API_RESPONSE_PATH` — Path to guides array in response (e.g., `data.guides`)
- `VITE_GUIDES_API_SLUG_FIELD` — Field name containing slug (default: `slug`)
- `VITE_GUIDES_API_TIMEOUT` — Request timeout in ms (default: `10000`)

See [docs/API_CONFIGURATION.md](docs/API_CONFIGURATION.md) for detailed configuration examples.

All client-side variables must be prefixed with `VITE_`.

## Features to reuse

- File-based + dynamic routing (via `vite-plugin-pages`) and layout support (via `vite-plugin-vue-layouts`).
- Pinia state hydration inside `src/main.ts` for SSG/SPA parity.
- Tailwind v4 + `@theme` tokens; Markdown routes via `unplugin-vue-markdown`.
- Vue Devtools enabled in Vite config; NProgress module registered in `src/modules/nprogress.ts`.
- Example plugin usage page (`/plugins`) showing Recaptcha wiring and other installed plugins.
