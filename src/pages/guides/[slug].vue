<route>
{
  meta: {
    subfolder: true,
    prerendered: true,
  }
}
</route>

<script setup lang="ts">
import type { Guide } from '/@/data/mock-api'
import { useHead } from '@unhead/vue'
import { computed, onBeforeMount, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useNotification } from '/@/composables/useNotification'
import { useShowcaseStore } from '/@/stores/showcase.store'

const route = useRoute()
const router = useRouter()
const store = useShowcaseStore()
const current = ref<Guide | null>(null)
const isLoading = ref(false)
const { error: notifyError } = useNotification()

const title = computed(() => current.value ? `${current.value.title} · Guides` : 'Guide · Vite SSG Starter')

useHead(() => ({
  title: title.value,
}))

async function loadGuide(slug: string) {
  if (isLoading.value)
    return

  isLoading.value = true
  try {
    const guide = await store.getGuideBySlug(slug)
    if (!guide) {
      // Only show error and redirect on client side
      if (typeof window !== 'undefined') {
        notifyError('Guide not found. Returning to guides.')
        router.replace('/guides')
      }
      return
    }
    current.value = guide
  }
  finally {
    isLoading.value = false
  }
}

// Load guide data - this runs during SSR for SSG builds
async function initGuide() {
  const slug = route.params.slug
  if (typeof slug === 'string') {
    await loadGuide(slug)
  }
  else if (Array.isArray(slug) && slug.length > 0) {
    // Handle array case (shouldn't happen but be safe)
    await loadGuide(slug[0])
  }
}

// Load data - onBeforeMount runs during SSR, which is what we need for SSG
onBeforeMount(() => {
  initGuide()
})

// Also watch for route changes on client side
watch(
  () => route.params.slug,
  async (newSlug) => {
    if (typeof newSlug === 'string') {
      await loadGuide(newSlug)
    }
  },
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
