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

## Environment Setup

### Quick Setup

1. **Copy environment templates:**
   ```bash
   cp .env.development.example .env.development
   cp .env.production.example .env.production
   ```

2. **Customize** `.env.development` for your local setup

3. **Never commit** `.env.development` or `.env.production` to version control

### Environment Variables

#### Application Configuration
- `VITE_APP_BASE_URL` — Base URL for sitemap generation and previews
- `VITE_APP_ENV` — Environment identifier (`development`, `production`)
- `VITE_APP_PROXY_URL` — Legacy proxy URL (reserved)

#### API Proxy Configuration (Development)
- `VITE_API_TARGET` — API proxy target (e.g., `http://localhost:3000`)
- `VITE_API_WS_TARGET` — WebSocket proxy target (optional)
- `VITE_API_ENABLE_LOGGING` — Enable request/response logging
- `VITE_API_ENABLE_CORS` — Enable CORS headers

#### Rate Limiting Configuration
- `VITE_API_RATE_LIMIT_ENABLED` — Enable rate limiting (default: `true`)
- `VITE_API_RATE_LIMIT_MAX` — Max requests per window (default: `100`)
- `VITE_API_RATE_LIMIT_WINDOW` — Time window in ms (default: `60000`)

#### Dynamic Routes API Configuration
- `VITE_GUIDES_API_ENDPOINT` — API endpoint to fetch guides
- `VITE_GUIDES_API_METHOD` — HTTP method (default: `GET`)
- `VITE_GUIDES_API_HEADERS` — JSON string of headers
- `VITE_GUIDES_API_RESPONSE_PATH` — Path to guides array in response
- `VITE_GUIDES_API_SLUG_FIELD` — Field name containing slug (default: `slug`)
- `VITE_GUIDES_API_TIMEOUT` — Request timeout in ms (default: `10000`)

#### Third-Party Services
- `VITE_RECAPTCHA_SITE_KEY` — ReCAPTCHA public site key

### Security Notes

⚠️ **Important**: Variables prefixed with `VITE_` are **exposed to client code**. Never use `VITE_` prefix for:
- Passwords
- API secret keys
- Database credentials
- Private tokens
- Any sensitive data

See [docs/ENVIRONMENT_SETUP.md](docs/ENVIRONMENT_SETUP.md) for complete setup guide and [docs/ENVIRONMENT_VARIABLE_SECURITY.md](docs/ENVIRONMENT_VARIABLE_SECURITY.md) for security best practices.

## Features to reuse

- File-based + dynamic routing (via `vite-plugin-pages`) and layout support (via `vite-plugin-vue-layouts`).
- Pinia state hydration inside `src/main.ts` for SSG/SPA parity.
- Tailwind v4 + `@theme` tokens; Markdown routes via `unplugin-vue-markdown`.
- Vue Devtools enabled in Vite config; NProgress module registered in `src/modules/nprogress.ts`.
- Example plugin usage page (`/plugins`) showing Recaptcha wiring and other installed plugins.
