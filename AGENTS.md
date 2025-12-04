# Repository Guidelines

## Project Structure & Module Organization
- `src/main.ts` wires Vue 3, ViteSSG, file-based routing (`vite-plugin-pages`), layouts, Pinia hydration, and optional Recaptcha plugin. Routes live in `src/pages` (dynamic examples under `src/pages/guides/[slug].vue`), with shared shells in `src/layouts`.
- `src/components` holds header/footer, notifications, and primitives; `src/modules` registers global modules (e.g., `nprogress`); `src/stores` keeps Pinia state (see `showcase.store.ts`); `src/data/mock-api.ts` centralizes mock API data for demos; `src/styles` contains Tailwind v4 entrypoint and tokens.
- Static assets belong in `src/assets` when bundled or `public/` when copied verbatim. Build artifacts emit to `dist/`. Custom tooling sits in `scripts/post-build.mjs` (moves static HTML into subfolders post-SSG).

## Build, Test, and Development Commands
- `pnpm dev` — start the Vite dev server with host exposure.
- `pnpm build` — generate the static site via `vite-ssg` into `dist/`.
- `pnpm preview` — build then serve the production bundle locally; use `pnpm preview:dist` to serve an existing `dist/`.
- `pnpm lint` — run ESLint (Antfu config; pre-commit via `simple-git-hooks` + `lint-staged`). Stylelint is available via `pnpm lint:stylelint` if you add custom CSS lint rules.

## Coding Style & Naming Conventions
- TypeScript-first, `<script setup>` in Vue SFCs; prefer 2-space indentation and trailing commas per the Antfu ESLint preset. Avoid arbitrary console logging in final code.
- Components use `PascalCase` filenames; composables follow `useThing.ts`; Pinia stores use `useThingStore`. Route files mirror URL segments (e.g., `src/pages/guides/[slug].vue`).
- Keep styles scoped when possible; shared tokens and typography live in `src/styles/*.css` with Tailwind v4 utilities.

## Testing Guidelines
- No automated test suite exists yet; rely on linting plus manual QA. Before PRs, run `pnpm lint` and `pnpm build`, then sanity-check critical routes via `pnpm preview`.
- When adding tests, colocate under `src/__tests__` or near the feature directory, and mirror the filename of the unit under test.

## Commit & Pull Request Guidelines
- Follow Conventional Commit semantics seen in history (`feat:`, `chore:`, `fix:`, `docs:`). Keep scopes small and messages action-oriented.
- PRs should include: clear summary of changes, linked issue/task IDs, and screenshots or GIFs for UI-facing updates. List verification steps (lint/build/preview) and note any environment prerequisites.

## Security & Configuration Tips
- Environment settings live in `.env.development` and `.env.production` (`VITE_APP_BASE_URL`, `VITE_APP_ENV`, optional `VITE_RECAPTCHA_SITE_KEY`). Keep secrets out of git; all runtime vars must be prefixed with `VITE_`.
- Require Node 22+ and pnpm 10+ (per `package.json`). Reinstall hooks with `pnpm install` if pre-commit checks are missing.
