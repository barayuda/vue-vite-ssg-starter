<route>
{
  meta: {
    subfolder: false,
    prerendered: true,
  }
}
</route>

<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { ref } from 'vue'
import { RecaptchaV2, useRecaptcha } from 'vue3-recaptcha-v2'

useHead({
  title: 'Plugins · Vite SSG Starter',
})

const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || ''
const verifiedToken = ref('')
const recaptchaApi = siteKey ? useRecaptcha() : null

function handleVerify(token: string) {
  verifiedToken.value = token
}

function handleExpire() {
  verifiedToken.value = ''
}

function resetCaptcha() {
  recaptchaApi?.reset()
  verifiedToken.value = ''
}

const plugins = [
  { name: 'vite-plugin-pages', description: 'Generates routes from files in `src/pages`, supports dynamic segments.', link: 'https://github.com/hannoeru/vite-plugin-pages' },
  { name: 'vite-plugin-vue-layouts', description: 'Layout slots powered by filesystem conventions.', link: 'https://github.com/JohnCampionJr/vite-plugin-vue-layouts' },
  { name: 'vite-ssg', description: 'Static site generation with hydration-friendly state serialization.', link: 'https://github.com/antfu/vite-ssg' },
  { name: 'vite-plugin-vue-devtools', description: 'Vue Devtools integration while developing locally.', link: 'https://devtools-next.vuejs.org/' },
  { name: 'unplugin-vue-markdown', description: 'Write pages in Markdown; available via `*.md` inside `src/pages`.', link: 'https://github.com/unplugin/unplugin-vue-markdown' },
  { name: 'vue3-recaptcha-v2', description: 'Captcha widget ready for contact/lead forms; configured via `VITE_RECAPTCHA_SITE_KEY`.', link: 'https://github.com/AurityLab/vue3-recaptcha-v2' },
]
</script>

<template>
  <div class="mx-auto max-w-5xl px-4 py-12 space-y-10">
    <header class="space-y-2">
      <p class="eyebrow">
        Plugins
      </p>
      <h1 class="text-3xl font-bold text-slate-900">
        Tooling baked into the starter
      </h1>
      <p class="text-slate-700 text-base">
        Quick reference for what is installed and how to use it. See the Recaptcha example below for an in-page demo.
      </p>
    </header>

    <div class="grid gap-4 md:grid-cols-2">
      <article
        v-for="plugin in plugins"
        :key="plugin.name"
        class="card space-y-2"
      >
        <div class="flex items-center justify-between gap-3">
          <h2 class="text-lg font-semibold text-slate-900">
            {{ plugin.name }}
          </h2>
          <a :href="plugin.link" target="_blank" rel="noreferrer" class="text-primary text-sm font-semibold hover:underline">
            Docs
          </a>
        </div>
        <p class="text-slate-700 text-sm leading-relaxed">
          {{ plugin.description }}
        </p>
      </article>
    </div>

    <section class="card space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <p class="eyebrow">
            Custom Plugins
          </p>
          <h2 class="section-title">
            Project-specific Vite plugins
          </h2>
          <p class="text-slate-600 text-sm mt-1">
            Custom plugins built for this project, located in the <code class="px-1 py-0.5 rounded bg-slate-100 text-xs">plugins/</code> directory.
          </p>
        </div>
        <code class="px-2 py-1 rounded bg-slate-100 text-xs">plugins/</code>
      </div>

      <div class="space-y-4">
        <article class="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3">
          <div class="flex items-center justify-between gap-3">
            <div>
              <h3 class="text-lg font-semibold text-slate-900">
                moveStaticHtmlPlugin
              </h3>
              <p class="text-xs text-slate-500 mt-1">
                Version 0.0.1 · Build-time only
              </p>
            </div>
            <code class="px-2 py-1 rounded bg-white text-xs border border-slate-200">
              plugins/vite-plugin-move-static-html.ts
            </code>
          </div>
          <p class="text-slate-700 text-sm leading-relaxed">
            Moves static HTML files (except <code class="px-1 py-0.5 rounded bg-white text-xs">index.html</code> and <code class="px-1 py-0.5 rounded bg-white text-xs">notfound.html</code>) into their own folders with <code class="px-1 py-0.5 rounded bg-white text-xs">index.html</code> inside. This enables clean URLs for SSG-generated pages.
          </p>
          <div class="space-y-2">
            <p class="text-xs font-semibold text-slate-600">
              Example transformation:
            </p>
            <div class="rounded bg-white p-3 text-xs font-mono space-y-1 border border-slate-200">
              <div class="text-slate-600">
                <span class="text-slate-400">Before:</span> <code class="text-slate-700">hotels.html</code>
              </div>
              <div class="text-slate-400">
                ↓
              </div>
              <div class="text-slate-900">
                <span class="text-slate-400">After:</span> <code>hotels/index.html</code>
              </div>
            </div>
          </div>
          <div class="rounded-lg bg-white p-4 text-sm text-slate-700 space-y-2 border border-slate-200">
            <p class="font-semibold">
              Usage in vite.config.ts:
            </p>
            <pre class="overflow-x-auto text-xs"><code>import { moveStaticHtmlPlugin } from './plugins'

export default defineConfig({
  plugins: [
    // ... other plugins
    moveStaticHtmlPlugin(), // Only runs during build
  ],
})</code></pre>
          </div>
          <div class="flex flex-wrap gap-2 text-xs">
            <span class="px-2 py-1 rounded bg-blue-100 text-blue-700 font-medium">
              apply: 'build'
            </span>
            <span class="px-2 py-1 rounded bg-purple-100 text-purple-700 font-medium">
              enforce: 'post'
            </span>
            <span class="px-2 py-1 rounded bg-green-100 text-green-700 font-medium">
              SSG-friendly
            </span>
          </div>
        </article>

        <article class="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3">
          <div class="flex items-center justify-between gap-3">
            <div>
              <h3 class="text-lg font-semibold text-slate-900">
                ssgDynamicRoutesPlugin
              </h3>
              <p class="text-xs text-slate-500 mt-1">
                Version 0.0.1 · Build-time only
              </p>
            </div>
            <code class="px-2 py-1 rounded bg-white text-xs border border-slate-200">
              plugins/vite-plugin-ssg-dynamic-routes.ts
            </code>
          </div>
          <p class="text-slate-700 text-sm leading-relaxed">
            Extends dynamic routes for SSG pre-rendering. Supports both <strong>mock API</strong> (file-based) and <strong>real API</strong> (HTTP fetch) to generate guide slugs for dynamic routes like <code class="px-1 py-0.5 rounded bg-white text-xs">/guides/[slug]</code>.
          </p>
          <div class="space-y-2">
            <p class="text-xs font-semibold text-slate-600">
              Features:
            </p>
            <ul class="text-sm text-slate-700 space-y-1 list-disc list-inside">
              <li>Automatic fallback to mock API if real API fails</li>
              <li>24-hour response caching for faster builds</li>
              <li>Supports GET/POST requests with custom headers</li>
              <li>Handles nested API responses via response path</li>
              <li>Configurable via environment variables</li>
            </ul>
          </div>
          <div class="rounded-lg bg-white p-4 text-sm text-slate-700 space-y-2 border border-slate-200">
            <p class="font-semibold">
              Environment Variables (optional):
            </p>
            <pre class="overflow-x-auto text-xs"><code># Basic API endpoint
VITE_GUIDES_API_ENDPOINT=https://api.example.com/guides

# With authentication
VITE_GUIDES_API_HEADERS={"Authorization": "Bearer TOKEN"}

# POST request
VITE_GUIDES_API_METHOD=POST
VITE_GUIDES_API_BODY={"status": "published"}

# Nested response
VITE_GUIDES_API_RESPONSE_PATH=data.guides

# Custom slug field
VITE_GUIDES_API_SLUG_FIELD=slug

# Timeout (ms)
VITE_GUIDES_API_TIMEOUT=10000</code></pre>
            <p class="text-xs text-slate-500 mt-2">
              If no <code class="px-1 py-0.5 rounded bg-slate-100 text-xs">VITE_GUIDES_API_ENDPOINT</code> is set, the plugin automatically uses the mock API from <code class="px-1 py-0.5 rounded bg-slate-100 text-xs">src/data/mock-api.ts</code>.
            </p>
          </div>
          <div class="rounded-lg bg-white p-4 text-sm text-slate-700 space-y-2 border border-slate-200">
            <p class="font-semibold">
              Usage in vite.config.ts:
            </p>
            <pre class="overflow-x-auto text-xs"><code>import { getGuideSlugsSync } from './plugins/vite-plugin-ssg-dynamic-routes'

// In extendRoute hook:
if (route.path.includes('/guides/:slug')) {
  const guideSlugs = getGuideSlugsSync()
  // ... use slugs for pre-rendering
}</code></pre>
            <p class="font-semibold mt-3">
              Usage in src/utils/ssg-routes.ts:
            </p>
            <pre class="overflow-x-auto text-xs"><code>import { getGuideSlugs } from '../plugins/vite-plugin-ssg-dynamic-routes'

export async function getDynamicRoutes() {
  const slugs = await getGuideSlugs({
    apiEndpoint: process.env.VITE_GUIDES_API_ENDPOINT,
    // ... other options
  })
  return slugs.map(slug => `/guides/${slug}`)
}</code></pre>
          </div>
          <div class="flex flex-wrap gap-2 text-xs">
            <span class="px-2 py-1 rounded bg-blue-100 text-blue-700 font-medium">
              apply: 'build'
            </span>
            <span class="px-2 py-1 rounded bg-purple-100 text-purple-700 font-medium">
              enforce: 'pre'
            </span>
            <span class="px-2 py-1 rounded bg-green-100 text-green-700 font-medium">
              SSG-friendly
            </span>
            <span class="px-2 py-1 rounded bg-orange-100 text-orange-700 font-medium">
              API support
            </span>
            <span class="px-2 py-1 rounded bg-teal-100 text-teal-700 font-medium">
              Caching
            </span>
          </div>
          <div class="rounded-lg bg-blue-50 p-3 text-xs text-blue-800 border border-blue-200">
            <p class="font-semibold mb-1">
              📚 Documentation:
            </p>
            <p>
              See <code class="px-1 py-0.5 rounded bg-blue-100 text-xs">docs/API_CONFIGURATION.md</code> for detailed configuration examples and troubleshooting.
            </p>
          </div>
        </article>
      </div>
    </section>

    <section class="card space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <p class="eyebrow">
            Recaptcha v2
          </p>
          <h2 class="section-title">
            Add bot protection to forms
          </h2>
        </div>
        <code class="px-2 py-1 rounded bg-slate-100 text-xs">src/pages/plugins.vue</code>
      </div>
      <p class="text-sm text-slate-700">
        Set <code class="px-1 py-0.5 rounded bg-slate-100 text-xs">VITE_RECAPTCHA_SITE_KEY</code> in your <code class="px-1 py-0.5 rounded bg-slate-100 text-xs">.env.*</code> files. The plugin is registered in <code class="px-1 py-0.5 rounded bg-slate-100 text-xs">src/main.ts</code>.
      </p>

      <div v-if="siteKey" class="space-y-3">
        <RecaptchaV2
          :sitekey="siteKey"
          :load-recaptcha-script="true"
          theme="light"
          size="normal"
          class="inline-flex"
          @verify="handleVerify"
          @expire="handleExpire"
        />
        <div class="text-sm text-slate-700 flex items-center gap-3">
          <span class="font-semibold">Token:</span>
          <code class="px-2 py-1 rounded bg-slate-100 text-xs break-all min-h-6">{{ verifiedToken || 'complete the captcha to see the token' }}</code>
          <button
            class="btn btn-ghost"
            type="button"
            @click="resetCaptcha"
          >
            Reset
          </button>
        </div>
      </div>
      <div v-else class="text-sm text-slate-700">
        Recaptcha demo is disabled. Add <code class="px-1 py-0.5 rounded bg-slate-100 text-xs">VITE_RECAPTCHA_SITE_KEY</code> to your env files to enable the widget.
      </div>
    </section>
  </div>
</template>
