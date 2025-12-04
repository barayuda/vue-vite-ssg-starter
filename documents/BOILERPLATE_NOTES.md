# Boilerplate Implementation Notes

This branch is a neutral starter for Vue 3 + Vite + ViteSSG with file-based (including dynamic) routing, Pinia, Tailwind v4, Markdown pages, Vue Devtools, NProgress, and vue3-recaptcha-v2.

## Core setup
- Entry: `src/main.ts` creates the ViteSSG app, hydrates Pinia, wires router guards, registers NProgress (`src/modules/nprogress.ts`), and conditionally installs Recaptcha using `VITE_RECAPTCHA_SITE_KEY`.
- Routing: `vite-plugin-pages` generates routes from `src/pages` (Nuxt-style). Layouts via `vite-plugin-vue-layouts` with default passthrough layout. Dynamic demo route lives at `src/pages/guides/[slug].vue`.
- State: `src/stores/showcase.store.ts` fetches mock guides/projects and exposes featured/in-progress computed data. State is serialized in SSG via `ctx.initialState`.
- Mock API: `src/data/mock-api.ts` holds in-memory arrays plus async helpers simulating latency. Replace with real API calls later.

## Pages and components
- `src/pages/index.vue`: landing page showing stack, sample projects, and guides pulled from the store.
- `src/pages/guides/index.vue` and `src/pages/guides/[slug].vue`: list and dynamic detail routes backed by the mock API.
- `src/pages/plugins.vue`: documents installed plugins; includes Recaptcha demo (requires env key).
- `src/pages/notfound.vue`: lightweight 404.
- Shell UI: `src/components/SiteHeader.vue`, `SiteFooter.vue`, `Notifications.vue`, `ErrorBoundary.vue`, `BackToTop.vue`, `LazyImage.vue`.

## Styling
- Tailwind v4 is loaded in `src/styles/main.css` with `@theme` tokens (primary color, surface, font) plus small primitives (`.btn`, `.card`, `.tag`, etc.). Markdown styles live in `src/styles/markdown.css`.

## Environment and config
- `.env.development` / `.env.production`: `VITE_APP_ENV`, `VITE_APP_BASE_URL`, optional `VITE_APP_PROXY_URL`, `VITE_RECAPTCHA_SITE_KEY`.
- `vite.config.ts`: uses Pages, Layouts, Markdown (for `.md` routes), compression, vue-devtools, Tailwind, sitemap generation (hostname from `VITE_APP_BASE_URL`). Custom post-build mover exists both in config and `scripts/post-build.mjs`.
- Public: `robots.txt` and `sitemap.xml` point to `https://example.com` by default; update for real deployments.

## Commands and tooling
- `pnpm dev` / `pnpm build` / `pnpm preview` / `pnpm lint`. Pre-commit runs lint via `simple-git-hooks` + `lint-staged`.
- Build output goes to `dist/`; static HTMLs are moved into subfolders (e.g., `guides/index.html`) after SSG.

## Next steps for extension
- Swap `src/data/mock-api.ts` with real fetches (reuse `useFetch` composable if reintroduced) and extend Pinia stores.
- Add more dynamic routes by dropping files under `src/pages` (e.g., `blog/[slug].vue`); ensure SSG knows paths if prerendering.
- Replace branding (favicons, manifest) and tune `@theme` tokens/fonts in `src/styles/main.css`.

## Improvement ideas
- Add automated tests (unit for stores/components, e2e for dynamic routes) and a CI workflow for lint/build.
- Restore a lightweight fetch composable with error boundaries and SSR awareness for real APIs.
- Provide an `.env.example` and document deployment steps for static hosts (Netlify/Vercel/S3/CloudFront).
- Introduce storybook-style component previews or a `/ui` playground page seeded with the existing primitives.
- Wire analytics/telemetry behind an env flag and expose a config section in `vite.config.ts`.

## Codex Chat History
```bash
codex resume 019ac43c-a6b7-7653-a38a-cc8b5def4826
```
