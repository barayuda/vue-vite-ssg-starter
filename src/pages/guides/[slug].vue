<route>
{
  meta: {
    subfolder: true,
    prerendered: false,
  }
}
</route>

<script setup lang="ts">
import type { Guide } from '/@/data/mock-api'
import { useHead } from '@unhead/vue'
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useNotification } from '/@/composables/useNotification'
import { useShowcaseStore } from '/@/stores/showcase.store'

const route = useRoute()
const router = useRouter()
const store = useShowcaseStore()
const current = ref<Guide | null>(null)
const { error: notifyError } = useNotification()

const title = computed(() => current.value ? `${current.value.title} · Guides` : 'Guide · Vite SSG Starter')

useHead(() => ({
  title: title.value,
}))

async function loadGuide(slug: string) {
  const guide = await store.getGuideBySlug(slug)
  if (!guide) {
    notifyError('Guide not found. Returning to guides.')
    router.replace('/guides')
    return
  }
  current.value = guide
}

watch(
  () => route.params.slug,
  (slug) => {
    if (typeof slug === 'string') {
      loadGuide(slug)
    }
  },
  { immediate: true },
)
</script>

<template>
  <div v-if="current" class="mx-auto max-w-4xl px-4 py-12 space-y-8">
    <header class="space-y-2">
      <p class="eyebrow">
        Guide
      </p>
      <h1 class="text-3xl md:text-4xl font-bold text-slate-900">
        {{ current.title }}
      </h1>
      <p class="text-sm text-slate-500">
        Updated {{ current.updatedAt }}
      </p>
      <div class="flex flex-wrap gap-2 text-xs text-slate-600">
        <span
          v-for="tag in current.tags"
          :key="tag"
          class="tag"
        >
          {{ tag }}
        </span>
      </div>
    </header>

    <div class="prose prose-slate max-w-none">
      <p v-for="paragraph in current.body" :key="paragraph">
        {{ paragraph }}
      </p>
    </div>

    <div class="flex items-center gap-4 text-sm">
      <router-link to="/guides" class="text-primary font-semibold hover:underline">
        ← Back to guides
      </router-link>
      <router-link to="/" class="text-slate-600 hover:text-primary">
        Home
      </router-link>
    </div>
  </div>

  <div v-else class="mx-auto max-w-4xl px-4 py-12 text-sm text-slate-600">
    Loading guide…
  </div>
</template>
