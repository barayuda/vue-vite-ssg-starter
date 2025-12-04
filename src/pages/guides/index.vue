<route>
{
  meta: {
    subfolder: true,
    prerendered: true,
  }
}
</route>

<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { computed, onMounted } from 'vue'

import { useShowcaseStore } from '/@/stores/showcase.store'

useHead({
  title: 'Guides · Vite SSG Starter',
})

const store = useShowcaseStore()
const guides = computed(() => store.guides)
const state = computed(() => store.state)

onMounted(async () => {
  if (!store.guides.length)
    await store.loadGuides()
})
</script>

<template>
  <div class="mx-auto max-w-5xl px-4 py-12 space-y-8">
    <header class="space-y-3">
      <p class="eyebrow">
        Guides
      </p>
      <h1 class="text-3xl md:text-4xl font-bold text-slate-900">
        Dynamic routing + SSG examples
      </h1>
      <p class="text-slate-700 text-base">
        Routes are generated from the file system. The mock API powers this list and the detail pages.
        Add more guides by extending <code class="px-2 py-1 rounded bg-slate-100 text-sm">src/data/mock-api.ts</code>.
      </p>
    </header>

    <div v-if="state === 'loading'" class="text-sm text-slate-600">
      Loading guides…
    </div>

    <div v-else class="grid gap-4 md:grid-cols-2">
      <article
        v-for="guide in guides"
        :key="guide.slug"
        class="card space-y-3"
      >
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-semibold text-slate-900">
            {{ guide.title }}
          </h2>
          <span class="text-xs text-slate-500">
            {{ guide.updatedAt }}
          </span>
        </div>
        <p class="text-slate-700 text-sm leading-relaxed">
          {{ guide.summary }}
        </p>
        <div class="flex flex-wrap gap-2 text-xs text-slate-600">
          <span v-for="tag in guide.tags" :key="tag" class="tag">
            {{ tag }}
          </span>
        </div>
        <router-link
          :to="`/guides/${guide.slug}`"
          class="inline-flex items-center gap-2 text-primary font-semibold text-sm hover:underline"
        >
          Open guide
          <span aria-hidden="true">→</span>
        </router-link>
      </article>
    </div>
  </div>
</template>
