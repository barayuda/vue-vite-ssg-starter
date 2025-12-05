<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

interface FrontmatterProps {
  title?: string
  summary?: string
  tags?: string[]
  updatedAt?: string
}

const props = withDefaults(defineProps<{
  frontmatter?: FrontmatterProps
}>(), {
  frontmatter: undefined,
})

const route = useRoute()

// Get frontmatter from props, route meta, or fallback
const frontmatter = computed(() => {
  // Priority: props > route meta > undefined
  return props.frontmatter || (route.meta?.frontmatter as FrontmatterProps | undefined)
})

// Determine parent route for navigation
const parentRoute = computed(() => {
  const path = route.path
  if (path.startsWith('/guides/')) {
    return '/guides'
  }
  return '/'
})

const parentLabel = computed(() => {
  if (route.path.startsWith('/guides/')) {
    return 'Back to guides'
  }
  return 'Home'
})

// Set page title from frontmatter
const pageTitle = computed(() => {
  if (frontmatter.value?.title) {
    const section = route.path.startsWith('/guides/') ? 'Guides' : ''
    return section ? `${frontmatter.value.title} · ${section}` : `${frontmatter.value.title} · Vite SSG Starter`
  }
  return 'Vite SSG Starter'
})

useHead(() => ({
  title: pageTitle.value,
}))
</script>

<template>
  <div class="mx-auto max-w-4xl px-4 py-12 space-y-8">
    <!-- Header with frontmatter -->
    <header v-if="frontmatter" class="space-y-2">
      <p class="eyebrow">
        {{ route.path.startsWith('/guides/') ? 'Guide' : 'Page' }}
      </p>
      <h1 class="text-3xl md:text-4xl font-bold text-slate-900">
        {{ frontmatter.title }}
      </h1>
      <p v-if="frontmatter.updatedAt" class="text-sm text-slate-500">
        Updated {{ frontmatter.updatedAt }}
      </p>
      <div v-if="frontmatter.tags && frontmatter.tags.length > 0" class="flex flex-wrap gap-2 text-xs text-slate-600">
        <span
          v-for="tag in frontmatter.tags"
          :key="tag"
          class="tag"
        >
          {{ tag }}
        </span>
      </div>
    </header>

    <!-- Markdown content -->
    <div class="prose prose-slate max-w-none">
      <slot />
    </div>

    <!-- Navigation links -->
    <div class="flex items-center gap-4 text-sm">
      <router-link :to="parentRoute" class="text-primary font-semibold hover:underline">
        ← {{ parentLabel }}
      </router-link>
      <router-link to="/" class="text-slate-600 hover:text-primary">
        Home
      </router-link>
    </div>
  </div>
</template>
