<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const links = [
  { label: 'Home', to: '/' },
  { label: 'Guides', to: '/guides' },
  { label: 'Plugins', to: '/plugins' },
]

const activePath = computed(() => route.path)
</script>

<template>
  <header class="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-slate-200">
    <div class="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between gap-4">
      <router-link to="/" class="flex items-center gap-2 text-lg font-semibold tracking-tight text-primary">
        <span class="inline-flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold">V</span>
        <span>Vite SSG Starter</span>
      </router-link>
      <nav class="flex items-center gap-3 text-sm font-medium text-slate-700">
        <router-link
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="px-3 py-2 rounded-lg transition hover:bg-primary/10 hover:text-primary"
          :class="(activePath === link.to || (link.to !== '/' && activePath.startsWith(link.to))) ? 'bg-primary/10 text-primary' : ''"
        >
          {{ link.label }}
        </router-link>
        <a
          class="ml-1 px-3 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition"
          href="https://vitejs.dev/"
          target="_blank"
          rel="noreferrer"
        >
          Docs
        </a>
      </nav>
    </div>
  </header>
</template>
