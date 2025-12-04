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
