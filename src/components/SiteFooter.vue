<script setup lang="ts">
const stacks = ['Vue 3', 'Vite', 'ViteSSG', 'Pinia', 'Tailwind v4', 'Vue Devtools', 'vue3-recaptcha-v2']
</script>

<template>
  <footer class="border-t border-slate-200 bg-white">
    <div class="mx-auto max-w-6xl px-4 py-10 grid gap-6 md:grid-cols-3 items-start">
      <div class="space-y-2">
        <p class="text-sm uppercase tracking-[0.2em] text-primary font-semibold">
          Stack
        </p>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="stack in stacks"
            :key="stack"
            class="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
          >
            {{ stack }}
          </span>
        </div>
      </div>
      <div class="space-y-2">
        <p class="text-sm uppercase tracking-[0.2em] text-slate-600 font-semibold">
          Links
        </p>
        <ul class="space-y-1 text-sm text-slate-700">
          <li>
            <router-link to="/guides" class="hover:text-primary">
              Guides
            </router-link>
          </li>
          <li>
            <router-link to="/plugins" class="hover:text-primary">
              Plugins
            </router-link>
          </li>
          <li>
            <a href="https://github.com/" target="_blank" rel="noreferrer" class="hover:text-primary">
              GitHub
            </a>
          </li>
        </ul>
      </div>
      <div class="space-y-2 text-sm text-slate-600">
        <p class="font-semibold text-slate-800">
          Ready for the next project
        </p>
        <p>
          Use this starter to bootstrap a static-first Vue app with API-friendly patterns and dynamic routes.
        </p>
        <p class="text-xs text-slate-500">
          Node 22+ · pnpm 10+ · SSG-first
        </p>
      </div>
    </div>
  </footer>
</template>
