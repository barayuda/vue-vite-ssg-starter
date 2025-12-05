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
import { useFetch } from '/@/composables/useFetch'
import { useNotification } from '/@/composables/useNotification'
import { useResponsive } from '/@/composables/useResponsive'

useHead({
  title: 'Composables Examples · Vite SSG Starter',
  meta: [
    { name: 'description', content: 'Practical examples of reusable composables: useFetch, useNotification, and useResponsive.' },
  ],
})

const { success, error, warning, info } = useNotification()
const { width, height, isXs, isSm, isMd, isLg, isXl } = useResponsive()

// useFetch example - fetching from a mock API endpoint
const fetchUrl = ref('https://jsonplaceholder.typicode.com/posts/1')
const { data: fetchData, isLoading: isFetching, isError: hasFetchError, error: fetchError } = useFetch(fetchUrl)

// Notification examples
function triggerSuccess() {
  success('Operation completed successfully!')
}

function triggerError() {
  error('Something went wrong. Please try again.')
}

function triggerWarning() {
  warning('This action requires your attention.')
}

function triggerInfo() {
  info('Here is some helpful information.')
}

// Fetch example actions
async function fetchPost() {
  fetchUrl.value = 'https://jsonplaceholder.typicode.com/posts/1'
}

async function fetchUser() {
  fetchUrl.value = 'https://jsonplaceholder.typicode.com/users/1'
}

async function fetchInvalid() {
  fetchUrl.value = 'https://jsonplaceholder.typicode.com/invalid-endpoint'
}
</script>

<template>
  <div class="mx-auto max-w-5xl px-4 py-12 space-y-10">
    <header class="space-y-2">
      <p class="eyebrow">
        Composables
      </p>
      <h1 class="text-3xl font-bold text-slate-900">
        Reusable composables examples
      </h1>
      <p class="text-slate-700 text-base">
        Practical examples of composables you can use throughout your application. Each composable is fully typed and ready to use.
      </p>
    </header>

    <!-- useNotification Example -->
    <section class="card space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <p class="eyebrow">
            useNotification
          </p>
          <h2 class="section-title">
            Toast notifications system
          </h2>
          <p class="text-slate-600 text-sm mt-1">
            Display success, error, warning, and info messages to users.
          </p>
        </div>
        <code class="px-2 py-1 rounded bg-slate-100 text-xs">src/composables/useNotification.ts</code>
      </div>

      <div class="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <button
          type="button"
          class="btn btn-primary"
          @click="triggerSuccess"
        >
          Success
        </button>
        <button
          type="button"
          class="btn bg-red-500 hover:bg-red-600 text-white"
          @click="triggerError"
        >
          Error
        </button>
        <button
          type="button"
          class="btn bg-amber-500 hover:bg-amber-600 text-white"
          @click="triggerWarning"
        >
          Warning
        </button>
        <button
          type="button"
          class="btn btn-ghost"
          @click="triggerInfo"
        >
          Info
        </button>
      </div>

      <div class="rounded-lg bg-slate-50 p-4 text-sm text-slate-700 space-y-2">
        <p class="font-semibold">
          Usage:
        </p>
        <pre class="overflow-x-auto"><code>const { success, error, warning, info } = useNotification()

success('Operation completed!')
error('Something went wrong')
warning('Please review this')
info('Helpful information')</code></pre>
      </div>
    </section>

    <!-- useFetch Example -->
    <section class="card space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <p class="eyebrow">
            useFetch
          </p>
          <h2 class="section-title">
            HTTP requests with error handling
          </h2>
          <p class="text-slate-600 text-sm mt-1">
            Fetch data from APIs with automatic loading states, error handling, and sanitization.
          </p>
        </div>
        <code class="px-2 py-1 rounded bg-slate-100 text-xs">src/composables/useFetch.ts</code>
      </div>

      <div class="flex flex-wrap gap-3">
        <button
          type="button"
          class="btn btn-primary"
          :disabled="isFetching"
          @click="fetchPost"
        >
          {{ isFetching ? 'Loading...' : 'Fetch Post' }}
        </button>
        <button
          type="button"
          class="btn btn-ghost"
          :disabled="isFetching"
          @click="fetchUser"
        >
          Fetch User
        </button>
        <button
          type="button"
          class="btn bg-red-500 hover:bg-red-600 text-white"
          :disabled="isFetching"
          @click="fetchInvalid"
        >
          Test Error
        </button>
      </div>

      <div v-if="isFetching" class="rounded-lg bg-blue-50 p-4 text-sm text-blue-700">
        Loading data...
      </div>

      <div v-else-if="hasFetchError" class="rounded-lg bg-red-50 p-4 text-sm text-red-700 space-y-2">
        <p class="font-semibold">
          Error:
        </p>
        <pre class="overflow-x-auto text-xs">{{ fetchError }}</pre>
      </div>

      <div v-else-if="fetchData" class="rounded-lg bg-slate-50 p-4 text-sm text-slate-700 space-y-2">
        <p class="font-semibold">
          Response:
        </p>
        <pre class="overflow-x-auto text-xs">{{ JSON.stringify(fetchData, null, 2) }}</pre>
      </div>

      <div class="rounded-lg bg-slate-50 p-4 text-sm text-slate-700 space-y-2">
        <p class="font-semibold">
          Usage:
        </p>
        <pre class="overflow-x-auto"><code>const { data, isLoading, isError, error } = useFetch('https://api.example.com/data')

// Reactive URL
const url = ref('https://api.example.com/posts/1')
const { data } = useFetch(url)

// With options
const { data } = useFetch('/api/users', {
  method: 'POST',
  body: { name: 'John' },
  query: { page: 1 }
})</code></pre>
      </div>
    </section>

    <!-- useResponsive Example -->
    <section class="card space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <p class="eyebrow">
            useResponsive
          </p>
          <h2 class="section-title">
            Responsive breakpoints
          </h2>
          <p class="text-slate-600 text-sm mt-1">
            Reactively track viewport size and breakpoint states.
          </p>
        </div>
        <code class="px-2 py-1 rounded bg-slate-100 text-xs">src/composables/useResponsive.ts</code>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <div class="space-y-3">
          <div class="flex items-center justify-between p-3 rounded-lg bg-slate-50">
            <span class="text-sm font-medium text-slate-700">Viewport Width</span>
            <span class="text-sm font-semibold text-slate-900">{{ width }}px</span>
          </div>
          <div class="flex items-center justify-between p-3 rounded-lg bg-slate-50">
            <span class="text-sm font-medium text-slate-700">Viewport Height</span>
            <span class="text-sm font-semibold text-slate-900">{{ height }}px</span>
          </div>
        </div>

        <div class="space-y-3">
          <div class="flex items-center justify-between p-3 rounded-lg" :class="isXs ? 'bg-blue-100' : 'bg-slate-50'">
            <span class="text-sm font-medium text-slate-700">Extra Small (XS)</span>
            <span class="text-sm font-semibold" :class="isXs ? 'text-blue-700' : 'text-slate-500'">
              {{ isXs ? 'Active' : 'Inactive' }}
            </span>
          </div>
          <div class="flex items-center justify-between p-3 rounded-lg" :class="isSm ? 'bg-blue-100' : 'bg-slate-50'">
            <span class="text-sm font-medium text-slate-700">Small (SM)</span>
            <span class="text-sm font-semibold" :class="isSm ? 'text-blue-700' : 'text-slate-500'">
              {{ isSm ? 'Active' : 'Inactive' }}
            </span>
          </div>
          <div class="flex items-center justify-between p-3 rounded-lg" :class="isMd ? 'bg-blue-100' : 'bg-slate-50'">
            <span class="text-sm font-medium text-slate-700">Medium (MD)</span>
            <span class="text-sm font-semibold" :class="isMd ? 'text-blue-700' : 'text-slate-500'">
              {{ isMd ? 'Active' : 'Inactive' }}
            </span>
          </div>
          <div class="flex items-center justify-between p-3 rounded-lg" :class="isLg ? 'bg-blue-100' : 'bg-slate-50'">
            <span class="text-sm font-medium text-slate-700">Large (LG)</span>
            <span class="text-sm font-semibold" :class="isLg ? 'text-blue-700' : 'text-slate-500'">
              {{ isLg ? 'Active' : 'Inactive' }}
            </span>
          </div>
          <div class="flex items-center justify-between p-3 rounded-lg" :class="isXl ? 'bg-blue-100' : 'bg-slate-50'">
            <span class="text-sm font-medium text-slate-700">Extra Large (XL)</span>
            <span class="text-sm font-semibold" :class="isXl ? 'text-blue-700' : 'text-slate-500'">
              {{ isXl ? 'Active' : 'Inactive' }}
            </span>
          </div>
        </div>
      </div>

      <div class="rounded-lg bg-slate-50 p-4 text-sm text-slate-700 space-y-2">
        <p class="font-semibold">
          Usage:
        </p>
        <pre class="overflow-x-auto"><code>const { width, height, isXs, isSm, isMd, isLg, isXl } = useResponsive()

// Conditionally render based on breakpoint
&lt;div v-if="isXs"&gt;Mobile content&lt;/div&gt;
&lt;div v-else-if="isMd"&gt;Tablet content&lt;/div&gt;
&lt;div v-else&gt;Desktop content&lt;/div&gt;</code></pre>
      </div>
    </section>

    <section class="card space-y-4">
      <div>
        <p class="eyebrow">
          Next Steps
        </p>
        <h2 class="section-title">
          Build your own composables
        </h2>
        <p class="text-slate-600 text-sm mt-1">
          Composables are reusable pieces of logic that can be shared across components. They follow the <code class="px-1 py-0.5 rounded bg-slate-100 text-xs">use*</code> naming convention and live in <code class="px-1 py-0.5 rounded bg-slate-100 text-xs">src/composables</code>.
        </p>
      </div>

      <div class="rounded-lg bg-slate-50 p-4 text-sm text-slate-700 space-y-2">
        <p class="font-semibold">
          Example composable structure:
        </p>
        <pre class="overflow-x-auto"><code>// src/composables/useExample.ts
import { ref, computed } from 'vue'

export function useExample() {
  const state = ref(initialValue)
  const computedValue = computed(() => state.value * 2)

  function updateState(newValue: number) {
    state.value = newValue
  }

  return {
    state,
    computedValue,
    updateState,
  }
}</code></pre>
      </div>
    </section>
  </div>
</template>
