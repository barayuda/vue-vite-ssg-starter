# Repository Guidelines

## Project Structure

- `src/` — Vue 3 + TypeScript app code.
  - `src/pages/` — File-based routes (Nuxt-style). Supports `.vue` and `.md`; dynamic routes use `[param]` (e.g. `src/pages/guides/[slug].vue`).
  - `src/layouts/` — Route layouts (via `vite-plugin-vue-layouts`).
  - `src/components/`, `src/composables/`, `src/stores/`, `src/modules/`, `src/utils/`, `src/styles/`.
  - Tests live alongside code in `src/**/__tests__/` with shared setup in `src/__tests__/setup.ts`.
- `public/` — Static assets copied as-is.
- `plugins/` — Custom Vite/ViteSSG plugins used during build/SSG.
- `docs/` — Configuration notes (API/ENV/security).
- Build output is `dist/` (gitignored).

## Build, Test, and Development

```bash
pnpm install
pnpm dev            # Vite dev server (host enabled)
pnpm build          # Static site build (vite-ssg)
pnpm preview        # Build + preview
pnpm lint           # ESLint
pnpm lint:stylelint # Stylelint for Vue/CSS
pnpm test           # Vitest watch
pnpm test:run       # Single run (CI-friendly)
pnpm test:coverage  # Coverage report
```

Node/pnpm versions: see `.nvmrc` and `package.json#engines` (Node 22+, pnpm 10+).

## Coding Style & Naming

- Indentation: 2 spaces (`.editorconfig`). TypeScript is `strict`.
- Vue: Composition API with `<script setup>`.
- Naming: components `PascalCase.vue` (`src/components/`), pages `kebab-case.vue` (`src/pages/`), composables `useX.ts`, stores `*.store.ts`.
- Imports: use `/@/` alias for `src/` (e.g. `import { useFetch } from '/@/composables'`).
- Styling: Tailwind entry is `src/styles/main.css`; keep custom CSS minimal and Stylelint-clean.

## Testing Guidelines

- Framework: Vitest + `happy-dom` with `@testing-library/vue` / `@vue/test-utils`.
- Location/pattern: `src/**/__tests__/**` and `*.test.ts` / `*.spec.ts`.
- Add/adjust tests when changing composables, stores, or route logic; run `pnpm test:run` before opening a PR.

## Commits & Pull Requests

- Prefer Conventional Commits as used in history: `feat: ...`, `fix(scope): ...`, `refactor: ...`, `docs: ...`, `chore(sync): ...`.
- Keep commits focused; avoid bundling unrelated changes.
- PRs: include a short summary, testing notes, and screenshots for UI changes; link related issues/docs when applicable.

## Configuration & Security

- All client-exposed env vars must be prefixed with `VITE_`; do not put secrets in `.env.*`.
- Dynamic guide route generation can use `VITE_GUIDES_API_*`; see `docs/API_CONFIGURATION.md` and `docs/ENVIRONMENT_VARIABLE_SECURITY.md`.
