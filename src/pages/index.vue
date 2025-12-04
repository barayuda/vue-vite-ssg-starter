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
import { computed, onMounted } from 'vue'

import { useNotification } from '/@/composables/useNotification'
import { useShowcaseStore } from '/@/stores/showcase.store'

useHead({
  title: 'Vite SSG Vue Starter',
  meta: [
    { name: 'description', content: 'Static-first Vue 3 starter with file-based routing, Pinia, Tailwind, and mock APIs.' },
  ],
})

const store = useShowcaseStore()
const { error: notifyError } = useNotification()

const projects = computed(() => store.projects)
const guides = computed(() => store.featuredGuides)

onMounted(async () => {
  try {
    if (!store.projects.length)
      await store.loadProjects()
    if (!store.guides.length)
      await store.loadGuides()

    if (store.error)
      notifyError(store.error)
  }
  catch (error) {
    notifyError((error as Error).message || 'Failed to load data')
  }
})
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-12 space-y-14">
    <section class="grid gap-8 md:grid-cols-[1.2fr_1fr] items-center">
      <div class="space-y-5">
        <p class="text-primary font-semibold uppercase tracking-[0.2em] text-xs">
          Boilerplate
        </p>
        <h1 class="text-4xl md:text-5xl font-bold leading-tight text-slate-900">
          Launch a static-first Vue 3 app with file-based + dynamic routing.
        </h1>
        <p class="text-lg text-slate-700">
          Vite, ViteSSG, Pinia, Tailwind v4, and Vue Devtools are wired up. Add routes by creating files in
          <code class="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-100 text-sm">src/pages</code> or dynamic segments like
          <code class="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-100 text-sm">guides/[slug].vue</code>.
        </p>
        <div class="flex flex-wrap gap-3">
          <router-link to="/guides" class="btn btn-primary">
            Read the guides
          </router-link>
          <router-link to="/plugins" class="btn btn-ghost">
            Plugin usage
          </router-link>
        </div>
      </div>
      <div class="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 space-y-4">
        <p class="text-sm font-semibold text-slate-600">
          Stack snapshot
        </p>
        <ul class="grid grid-cols-2 gap-2 text-sm text-slate-800">
          <li class="chip">
            Vite 7 + Vue 3
          </li>
          <li class="chip">
            Vite SSG
          </li>
          <li class="chip">
            Pinia
          </li>
          <li class="chip">
            Tailwind v4
          </li>
          <li class="chip">
            File-based routing
          </li>
          <li class="chip">
            Vue Devtools
          </li>
          <li class="chip">
            Recaptcha v2 plugin
          </li>
          <li class="chip">
            Markdown pages
          </li>
        </ul>
      </div>
    </section>

    <section class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <p class="eyebrow">
            Projects
          </p>
          <h2 class="section-title">
            Starter-friendly modules
          </h2>
          <p class="text-slate-600 text-sm">
            Templates you can clone or replace when bootstrapping a new app.
          </p>
        </div>
        <router-link to="/guides" class="text-primary text-sm font-semibold hover:underline">
          See routing demo
        </router-link>
      </div>
      <div class="grid gap-4 md:grid-cols-3">
        <article
          v-for="project in projects"
          :key="project.slug"
          class="card h-full flex flex-col"
        >
          <div class="flex items-center justify-between gap-2">
            <h3 class="font-semibold text-lg text-slate-900">
              {{ project.name }}
            </h3>
            <span class="badge" :data-status="project.status">
              {{ project.status }}
            </span>
          </div>
          <p class="text-slate-700 text-sm leading-relaxed flex-1">
            {{ project.description }}
          </p>
          <div class="flex flex-wrap gap-2 text-xs text-slate-600 mt-3">
            <span v-for="stack in project.stack" :key="stack" class="tag">
              {{ stack }}
            </span>
          </div>
          <router-link
            :to="project.href"
            class="mt-4 inline-flex items-center gap-2 text-primary font-semibold text-sm hover:underline"
          >
            View demo
            <span aria-hidden="true">→</span>
          </router-link>
        </article>
      </div>
    </section>

    <section class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <p class="eyebrow">
            Guides
          </p>
          <h2 class="section-title">
            Dynamic routes + mock API
          </h2>
          <p class="text-slate-600 text-sm">
            Sample content from a mock API to keep the starter offline-friendly.
          </p>
        </div>
        <router-link to="/guides" class="text-primary text-sm font-semibold hover:underline">
          All guides
        </router-link>
      </div>
      <div class="grid gap-4 md:grid-cols-2">
        <article
          v-for="guide in guides"
          :key="guide.slug"
          class="card space-y-3"
        >
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-slate-900">
              {{ guide.title }}
            </h3>
            <span class="text-xs text-slate-500">
              Updated {{ guide.updatedAt }}
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
    </section>
  </div>
</template>
