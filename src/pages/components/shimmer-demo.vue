<route>
{
  meta: {
    subfolder: false,
    prerendered: false,
  }
}
</route>

<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { onMounted, ref } from 'vue'
import Shimmer from '/@/components/Shimmer.vue'
import { useFetch } from '/@/composables/useFetch'

useHead({
  title: 'Shimmer Component Demo',
  meta: [
    { name: 'description', content: 'Demo page showing how to use the Shimmer component for loading states' },
  ],
})

// Example 1: Simulate loading cards
const cardsLoading = ref(true)
const cards = ref<Array<{ id: number, title: string, description: string, tags: string[] }>>([])

async function loadCards() {
  cardsLoading.value = true
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 2000))
  cards.value = [
    { id: 1, title: 'Card 1', description: 'This is the first card with some description text.', tags: ['Vue', 'TypeScript'] },
    { id: 2, title: 'Card 2', description: 'This is the second card with different content.', tags: ['React', 'JavaScript'] },
    { id: 3, title: 'Card 3', description: 'This is the third card showing more examples.', tags: ['Angular', 'TypeScript'] },
  ]
  cardsLoading.value = false
}

// Example 2: Simulate loading list
const listLoading = ref(true)
const listItems = ref<Array<{ id: number, name: string, email: string }>>([])

async function loadList() {
  listLoading.value = true
  await new Promise(resolve => setTimeout(resolve, 1500))
  listItems.value = [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com' },
  ]
  listLoading.value = false
}

// Example 3: Real API call with useFetch
const { data: apiData, isLoading: apiLoading } = useFetch<{ message: string, data: Array<{ id: number, name: string }> }>('/api/demo')

// Example 4: Custom shimmer
const customLoading = ref(true)
const customContent = ref('')

async function loadCustom() {
  customLoading.value = true
  await new Promise(resolve => setTimeout(resolve, 1800))
  customContent.value = 'Custom content loaded!'
  customLoading.value = false
}

// Example 5: Mixed content
const mixedLoading = ref(true)
const mixedData = ref<{ title: string, items: string[] } | null>(null)

async function loadMixed() {
  mixedLoading.value = true
  await new Promise(resolve => setTimeout(resolve, 2000))
  mixedData.value = {
    title: 'Mixed Content Example',
    items: ['Item 1', 'Item 2', 'Item 3'],
  }
  mixedLoading.value = false
}

onMounted(() => {
  // Auto-load examples
  loadCards()
  loadList()
  loadCustom()
  loadMixed()
})
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-12 space-y-12">
    <div class="space-y-2">
      <h1 class="section-title">
        Shimmer Component Demo
      </h1>
      <p class="text-slate-600">
        Reusable shimmer component for showing loading states while fetching data from APIs.
      </p>
    </div>

    <!-- Example 1: Card Shimmer -->
    <section class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <p class="eyebrow">
            Example 1
          </p>
          <h2 class="section-title">
            Card Shimmer
          </h2>
          <p class="text-slate-600 text-sm">
            Perfect for loading card grids. Matches the structure of your actual cards.
          </p>
        </div>
        <button
          class="btn btn-ghost"
          @click="loadCards"
        >
          Reload
        </button>
      </div>

      <div v-if="cardsLoading">
        <Shimmer
          variant="card"
          :count="3"
        />
      </div>
      <div
        v-else
        class="grid gap-4 md:grid-cols-3"
      >
        <article
          v-for="card in cards"
          :key="card.id"
          class="card"
        >
          <h3 class="font-semibold text-lg mb-2">
            {{ card.title }}
          </h3>
          <p class="text-slate-700 text-sm mb-3">
            {{ card.description }}
          </p>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="tag in card.tags"
              :key="tag"
              class="tag"
            >
              {{ tag }}
            </span>
          </div>
        </article>
      </div>
    </section>

    <!-- Example 2: List Shimmer -->
    <section class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <p class="eyebrow">
            Example 2
          </p>
          <h2 class="section-title">
            List Shimmer
          </h2>
          <p class="text-slate-600 text-sm">
            Great for loading user lists, comments, or any list-based content.
          </p>
        </div>
        <button
          class="btn btn-ghost"
          @click="loadList"
        >
          Reload
        </button>
      </div>

      <div class="card p-0 overflow-hidden">
        <div v-if="listLoading">
          <Shimmer
            variant="list"
            :count="3"
          />
        </div>
        <div
          v-else
          class="divide-y divide-slate-200"
        >
          <div
            v-for="item in listItems"
            :key="item.id"
            class="p-4 flex items-center gap-4"
          >
            <div class="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
              {{ item.name.charAt(0) }}
            </div>
            <div>
              <p class="font-semibold">
                {{ item.name }}
              </p>
              <p class="text-sm text-slate-600">
                {{ item.email }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Example 3: Text Shimmer -->
    <section class="space-y-4">
      <div>
        <p class="eyebrow">
          Example 3
        </p>
        <h2 class="section-title">
          Text Shimmer
        </h2>
        <p class="text-slate-600 text-sm">
          Simple text lines for loading paragraphs or descriptions.
        </p>
      </div>

      <div class="card">
        <div v-if="customLoading">
          <Shimmer
            variant="text"
            :lines="4"
          />
        </div>
        <div v-else>
          <p class="text-slate-700">
            {{ customContent }}
          </p>
          <p class="text-slate-700 mt-2">
            This is example content that replaces the shimmer when loaded.
          </p>
        </div>
      </div>
    </section>

    <!-- Example 4: Custom Shimmer -->
    <section class="space-y-4">
      <div>
        <p class="eyebrow">
          Example 4
        </p>
        <h2 class="section-title">
          Custom Shimmer
        </h2>
        <p class="text-slate-600 text-sm">
          Create custom shimmer shapes with specific dimensions.
        </p>
      </div>

      <div class="card space-y-4">
        <div>
          <h3 class="font-semibold mb-2">
            Custom Width & Height
          </h3>
          <Shimmer
            variant="custom"
            width="200px"
            height="40px"
            border-radius="8px"
          />
        </div>

        <div>
          <h3 class="font-semibold mb-2">
            Full Width Bar
          </h3>
          <Shimmer
            variant="custom"
            width="100%"
            height="8px"
            border-radius="4px"
          />
        </div>

        <div>
          <h3 class="font-semibold mb-2">
            Circular Shimmer
          </h3>
          <Shimmer
            variant="custom"
            width="80px"
            height="80px"
            border-radius="50%"
          />
        </div>
      </div>
    </section>

    <!-- Example 5: Real API Integration -->
    <section class="space-y-4">
      <div>
        <p class="eyebrow">
          Example 5
        </p>
        <h2 class="section-title">
          With useFetch Composable
        </h2>
        <p class="text-slate-600 text-sm">
          Automatically show shimmer while fetching data from API.
        </p>
      </div>

      <div class="card">
        <div v-if="apiLoading">
          <Shimmer
            variant="text"
            :lines="3"
          />
        </div>
        <div v-else-if="apiData">
          <p class="text-slate-700">
            {{ apiData.message || 'Data loaded successfully!' }}
          </p>
        </div>
        <div v-else>
          <p class="text-red-600">
            Failed to load data
          </p>
        </div>
      </div>
    </section>

    <!-- Example 6: Mixed Content -->
    <section class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <p class="eyebrow">
            Example 6
          </p>
          <h2 class="section-title">
            Mixed Content
          </h2>
          <p class="text-slate-600 text-sm">
            Combine different shimmer types for complex layouts.
          </p>
        </div>
        <button
          class="btn btn-ghost"
          @click="loadMixed"
        >
          Reload
        </button>
      </div>

      <div class="card space-y-4">
        <div v-if="mixedLoading">
          <!-- Title shimmer -->
          <Shimmer
            variant="custom"
            width="60%"
            height="1.5rem"
            border-radius="0.5rem"
          />
          <!-- List items shimmer -->
          <div class="space-y-2 mt-4">
            <Shimmer
              variant="text"
              :lines="3"
            />
          </div>
        </div>
        <div v-else-if="mixedData">
          <h3 class="text-lg font-semibold">
            {{ mixedData.title }}
          </h3>
          <ul class="list-disc list-inside space-y-1 mt-2">
            <li
              v-for="(item, index) in mixedData.items"
              :key="index"
            >
              {{ item }}
            </li>
          </ul>
        </div>
      </div>
    </section>

    <!-- Usage Guide -->
    <section class="card space-y-4">
      <div>
        <p class="eyebrow">
          Usage Guide
        </p>
        <h2 class="section-title">
          How to Use
        </h2>
      </div>

      <div class="space-y-6">
        <div>
          <h3 class="font-semibold mb-2">
            1. Card Variant
          </h3>
          <pre class="bg-slate-100 p-4 rounded-lg overflow-x-auto text-sm"><code>&lt;Shimmer variant="card" :count="3" /&gt;</code></pre>
          <p class="text-sm text-slate-600 mt-2">
            Use for loading card grids. The count prop determines how many card placeholders to show.
          </p>
        </div>

        <div>
          <h3 class="font-semibold mb-2">
            2. List Variant
          </h3>
          <pre class="bg-slate-100 p-4 rounded-lg overflow-x-auto text-sm"><code>&lt;Shimmer variant="list" :count="5" /&gt;</code></pre>
          <p class="text-sm text-slate-600 mt-2">
            Perfect for user lists, comments, or any list-based content with avatars.
          </p>
        </div>

        <div>
          <h3 class="font-semibold mb-2">
            3. Text Variant
          </h3>
          <pre class="bg-slate-100 p-4 rounded-lg overflow-x-auto text-sm"><code>&lt;Shimmer variant="text" :lines="4" /&gt;</code></pre>
          <p class="text-sm text-slate-600 mt-2">
            Simple text lines for loading paragraphs or descriptions.
          </p>
        </div>

        <div>
          <h3 class="font-semibold mb-2">
            4. Custom Variant
          </h3>
          <pre class="bg-slate-100 p-4 rounded-lg overflow-x-auto text-sm"><code>&lt;Shimmer
  variant="custom"
  width="200px"
  height="40px"
  border-radius="8px"
/&gt;</code></pre>
          <p class="text-sm text-slate-600 mt-2">
            Create custom shimmer shapes with specific dimensions.
          </p>
        </div>

        <div>
          <h3 class="font-semibold mb-2">
            5. With API Loading
          </h3>
          <pre class="bg-slate-100 p-4 rounded-lg overflow-x-auto text-sm"><code>&lt;template&gt;
  &lt;div v-if="isLoading"&gt;
    &lt;Shimmer variant="card" :count="3" /&gt;
  &lt;/div&gt;
  &lt;div v-else&gt;
    &lt;!-- Your content --&gt;
  &lt;/div&gt;
&lt;/template&gt;

&lt;script setup&gt;
import { useFetch } from '/@/composables/useFetch'
const { data, isLoading } = useFetch('/api/data')
&lt;/script&gt;</code></pre>
          <p class="text-sm text-slate-600 mt-2">
            Use with <code class="text-xs bg-slate-200 px-1 rounded">useFetch</code> or any loading state.
          </p>
        </div>
      </div>
    </section>

    <!-- Props Table -->
    <section class="card space-y-4">
      <div>
        <p class="eyebrow">
          Component Props
        </p>
        <h2 class="section-title">
          API Reference
        </h2>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b">
              <th class="text-left p-2">
                Prop
              </th>
              <th class="text-left p-2">
                Type
              </th>
              <th class="text-left p-2">
                Default
              </th>
              <th class="text-left p-2">
                Description
              </th>
            </tr>
          </thead>
          <tbody>
            <tr class="border-b">
              <td class="p-2">
                <code>variant</code>
              </td>
              <td class="p-2">
                'card' | 'list' | 'text' | 'custom'
              </td>
              <td class="p-2">
                'text'
              </td>
              <td class="p-2">
                Shimmer variant type
              </td>
            </tr>
            <tr class="border-b">
              <td class="p-2">
                <code>lines</code>
              </td>
              <td class="p-2">
                number
              </td>
              <td class="p-2">
                3
              </td>
              <td class="p-2">
                Number of lines (text variant)
              </td>
            </tr>
            <tr class="border-b">
              <td class="p-2">
                <code>count</code>
              </td>
              <td class="p-2">
                number
              </td>
              <td class="p-2">
                1
              </td>
              <td class="p-2">
                Number of items (card/list variants)
              </td>
            </tr>
            <tr class="border-b">
              <td class="p-2">
                <code>width</code>
              </td>
              <td class="p-2">
                string
              </td>
              <td class="p-2">
                '100%'
              </td>
              <td class="p-2">
                Width (custom variant)
              </td>
            </tr>
            <tr class="border-b">
              <td class="p-2">
                <code>height</code>
              </td>
              <td class="p-2">
                string
              </td>
              <td class="p-2">
                undefined
              </td>
              <td class="p-2">
                Height (custom variant)
              </td>
            </tr>
            <tr class="border-b">
              <td class="p-2">
                <code>borderRadius</code>
              </td>
              <td class="p-2">
                string
              </td>
              <td class="p-2">
                '0.5rem'
              </td>
              <td class="p-2">
                Border radius (custom variant)
              </td>
            </tr>
            <tr class="border-b">
              <td class="p-2">
                <code>animated</code>
              </td>
              <td class="p-2">
                boolean
              </td>
              <td class="p-2">
                true
              </td>
              <td class="p-2">
                Enable shimmer animation
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>
