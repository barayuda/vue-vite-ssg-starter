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
import { ref } from 'vue'
import PageLoader from '/@/components/PageLoader.vue'
import { usePageLoader } from '/@/composables/usePageLoader'

useHead({
  title: 'Page Loader Demo',
  meta: [
    { name: 'description', content: 'Simple demo page to test and simulate the PageLoader component' },
  ],
})

const loader = usePageLoader()
const spinnerLoader = usePageLoader()

// Demo states
const isSimulating = ref(false)
const demoMessage = ref('Loading...')
const demoProgress = ref(0)
const showSpinnerDemo = ref(false)

/**
 * Simple demo: Show loader for 3 seconds
 */
function simpleDemo() {
  loader.show('Loading data...')
  setTimeout(() => {
    loader.hide()
  }, 3000)
}

/**
 * Demo with progress: Simulate progress updates
 */
function progressDemo() {
  isSimulating.value = true
  demoProgress.value = 0
  loader.show('Processing...')
  loader.setProgress(0)

  const interval = setInterval(() => {
    demoProgress.value += 10
    loader.setProgress(demoProgress.value)
    loader.setMessage(`Loading... ${demoProgress.value}%`)

    if (demoProgress.value >= 100) {
      clearInterval(interval)
      setTimeout(() => {
        loader.hide()
        isSimulating.value = false
        demoProgress.value = 0
      }, 500)
    }
  }, 200)
}

/**
 * Simulate API call with multiple steps
 */
async function apiCallDemo() {
  isSimulating.value = true
  loader.show('Connecting to server...')
  await new Promise(resolve => setTimeout(resolve, 800))

  loader.setMessage('Fetching data...')
  loader.setProgress(30)
  await new Promise(resolve => setTimeout(resolve, 1000))

  loader.setMessage('Processing response...')
  loader.setProgress(60)
  await new Promise(resolve => setTimeout(resolve, 800))

  loader.setMessage('Almost done...')
  loader.setProgress(90)
  await new Promise(resolve => setTimeout(resolve, 500))

  loader.setProgress(100)
  loader.setMessage('Complete!')
  await new Promise(resolve => setTimeout(resolve, 300))

  loader.hide()
  isSimulating.value = false
}

/**
 * Quick flash demo (tests minimum display time)
 */
function quickFlashDemo() {
  loader.show('Quick operation')
  setTimeout(() => {
    loader.hide()
  }, 100) // Very quick, but loader will stay for minDisplayTime (300ms)
}

/**
 * Demo without logo (shows spinner)
 */
function demoWithoutLogo() {
  showSpinnerDemo.value = true
  spinnerLoader.show('Loading with spinner...')

  setTimeout(() => {
    spinnerLoader.hide()
    setTimeout(() => {
      showSpinnerDemo.value = false
    }, 500)
  }, 3000)
}

/**
 * Demo without logo with progress
 */
function demoWithoutLogoProgress() {
  showSpinnerDemo.value = true
  demoProgress.value = 0
  spinnerLoader.show('Processing with spinner...')
  spinnerLoader.setProgress(0)

  const interval = setInterval(() => {
    demoProgress.value += 10
    spinnerLoader.setProgress(demoProgress.value)
    spinnerLoader.setMessage(`Loading... ${demoProgress.value}%`)

    if (demoProgress.value >= 100) {
      clearInterval(interval)
      setTimeout(() => {
        spinnerLoader.hide()
        setTimeout(() => {
          showSpinnerDemo.value = false
          demoProgress.value = 0
        }, 500)
      }, 500)
    }
  }, 200)
}
</script>

<template>
  <div class="mx-auto max-w-4xl px-4 py-12 space-y-8">
    <!-- Demo PageLoader without logo (for spinner demo) -->
    <PageLoader
      v-if="showSpinnerDemo"
      :logo="undefined"
      :show-progress="demoProgress > 0"
      :progress="demoProgress"
    />
    <div class="space-y-2">
      <h1 class="section-title">
        Page Loader Demo
      </h1>
      <p class="text-slate-600">
        Test and simulate the PageLoader component. Click the buttons below to see different loading scenarios.
      </p>
    </div>

    <!-- Demo Controls -->
    <div class="card space-y-4">
      <div>
        <h2 class="text-lg font-semibold">
          Try It Out
        </h2>
        <p class="text-sm text-slate-600 mt-1">
          Current setup: <strong>With Logo</strong> (spinner hidden, logo glow effect visible)
        </p>
      </div>

      <div class="p-3 bg-blue-50 rounded-lg border border-blue-200">
        <p class="text-xs text-blue-800">
          <strong>ℹ️ Note:</strong> These demos show the loader <strong>with logo</strong> behavior (no spinner).
          The logo appears with a high-tech shimmer glow effect. To see the spinner version, remove the <code class="bg-blue-100 px-1 rounded">logo</code> prop from PageLoader in <code class="bg-blue-100 px-1 rounded">App.vue</code>.
        </p>
      </div>

      <div class="space-y-3">
        <div>
          <p class="text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">
            With Logo (Current Setup)
          </p>
          <div class="grid gap-3 md:grid-cols-2">
            <button
              class="btn btn-primary relative"
              :disabled="isSimulating"
              @click="simpleDemo"
            >
              <span>Simple Loader (3s)</span>
              <span class="absolute -top-1 -right-1 size-2 bg-blue-500 rounded-full" />
            </button>

            <button
              class="btn btn-primary relative"
              :disabled="isSimulating"
              @click="progressDemo"
            >
              <span>Progress Loader</span>
              <span class="absolute -top-1 -right-1 size-2 bg-blue-500 rounded-full" />
            </button>

            <button
              class="btn btn-primary relative"
              :disabled="isSimulating"
              @click="apiCallDemo"
            >
              <span>Simulate API Call</span>
              <span class="absolute -top-1 -right-1 size-2 bg-blue-500 rounded-full" />
            </button>

            <button
              class="btn btn-ghost relative"
              :disabled="isSimulating"
              @click="quickFlashDemo"
            >
              <span>Quick Flash Test</span>
              <span class="absolute -top-1 -right-1 size-2 bg-blue-500 rounded-full" />
            </button>
          </div>
          <p class="text-xs text-slate-500 mt-2">
            Shows: Logo with glow effect + Message (no spinner)
          </p>
        </div>

        <div class="pt-3 border-t border-slate-200">
          <p class="text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">
            Without Logo (Spinner Version)
          </p>
          <div class="grid gap-3 md:grid-cols-2">
            <button
              class="btn btn-primary relative"
              :disabled="isSimulating || showSpinnerDemo"
              @click="demoWithoutLogo"
            >
              <span>Simple Loader with Spinner</span>
              <span class="absolute -top-1 -right-1 size-2 bg-purple-500 rounded-full" />
            </button>

            <button
              class="btn btn-primary relative"
              :disabled="isSimulating || showSpinnerDemo"
              @click="demoWithoutLogoProgress"
            >
              <span>Progress with Spinner</span>
              <span class="absolute -top-1 -right-1 size-2 bg-purple-500 rounded-full" />
            </button>
          </div>
          <p class="text-xs text-slate-500 mt-2">
            Shows: Spinner + Message (no logo)
          </p>
        </div>
      </div>

      <div
        v-if="isSimulating"
        class="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200"
      >
        <p class="text-sm text-blue-800">
          <strong>Simulating:</strong> {{ demoMessage }}
          <span v-if="demoProgress > 0"> - {{ demoProgress }}%</span>
        </p>
      </div>
    </div>

    <!-- Current Status -->
    <div class="card bg-green-50 border-green-200">
      <div class="flex items-start gap-3">
        <div class="text-green-600 text-xl">
          ✓
        </div>
        <div>
          <h3 class="font-semibold text-green-900 mb-1">
            PageLoader is Active
          </h3>
          <p class="text-sm text-green-700">
            The PageLoader component is already integrated in <code class="text-xs bg-green-100 px-1 rounded">App.vue</code> with logo support.
            Click the buttons above to see it in action!
          </p>
        </div>
      </div>
    </div>

    <!-- Spinner Behavior Explanation -->
    <div class="card space-y-4">
      <div>
        <p class="eyebrow">
          Important
        </p>
        <h2 class="section-title">
          Spinner Display Logic
        </h2>
        <p class="text-slate-600 text-sm">
          The PageLoader automatically shows or hides the spinner based on whether a logo is provided.
        </p>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <!-- With Logo (No Spinner) -->
        <div class="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div class="flex items-center gap-2 mb-2">
            <div class="size-2 rounded-full bg-blue-500" />
            <h3 class="font-semibold text-blue-900">
              With Logo (No Spinner)
            </h3>
          </div>
          <p class="text-sm text-blue-800 mb-3">
            When a logo is provided, the spinner is automatically hidden. The logo's high-tech glow effect serves as the visual indicator.
          </p>
          <div class="bg-white p-3 rounded border border-blue-100">
            <pre class="text-xs overflow-x-auto"><code>&lt;PageLoader
  logo="/logo.png"
  logo-alt="Logo"
  logo-size="100px"
/&gt;</code></pre>
          </div>
          <p class="text-xs text-blue-700 mt-2">
            Result: Logo with glow effect + Message (no spinner)
          </p>
        </div>

        <!-- Without Logo (With Spinner) -->
        <div class="p-4 bg-purple-50 rounded-lg border border-purple-200">
          <div class="flex items-center gap-2 mb-2">
            <div class="size-2 rounded-full bg-purple-500" />
            <h3 class="font-semibold text-purple-900">
              Without Logo (With Spinner)
            </h3>
          </div>
          <p class="text-sm text-purple-800 mb-3">
            When no logo is provided, the spinner is automatically shown on the left of the message.
          </p>
          <div class="bg-white p-3 rounded border border-purple-100">
            <pre class="text-xs overflow-x-auto"><code>&lt;PageLoader /&gt;</code></pre>
          </div>
          <p class="text-xs text-purple-700 mt-2">
            Result: Spinner + Message (no logo)
          </p>
        </div>
      </div>

      <div class="p-4 bg-amber-50 rounded-lg border border-amber-200">
        <p class="text-sm text-amber-800">
          <strong>💡 Note:</strong> The current PageLoader in <code class="text-xs bg-amber-100 px-1 rounded">App.vue</code> has a logo configured, so you'll see the logo with glow effect (no spinner) when testing the buttons above.
        </p>
      </div>
    </div>

    <!-- Usage Examples -->
    <div class="card space-y-4">
      <h2 class="text-lg font-semibold">
        How to Use
      </h2>

      <div class="space-y-4">
        <div>
          <h3 class="font-semibold mb-2">
            1. Basic Usage
          </h3>
          <pre class="bg-slate-100 p-4 rounded-lg overflow-x-auto text-sm"><code>import { usePageLoader } from '/@/composables/usePageLoader'

const loader = usePageLoader()

// Show loader
loader.show('Loading data...')

// Hide loader
loader.hide()</code></pre>
        </div>

        <div>
          <h3 class="font-semibold mb-2">
            2. With Progress
          </h3>
          <pre class="bg-slate-100 p-4 rounded-lg overflow-x-auto text-sm"><code>const loader = usePageLoader()

loader.show('Processing...')
loader.setProgress(25)
loader.setProgress(50)
loader.setProgress(100)
loader.hide()</code></pre>
        </div>

        <div>
          <h3 class="font-semibold mb-2">
            3. With Logo (No Spinner)
          </h3>
          <pre class="bg-slate-100 p-4 rounded-lg overflow-x-auto text-sm"><code>&lt;PageLoader
  logo="/android-chrome-192x192.png"
  logo-alt="Company Logo"
  logo-size="100px"
/&gt;</code></pre>
          <p class="text-sm text-slate-600 mt-2">
            When a logo is provided, the spinner is automatically hidden. The logo displays with a high-tech shimmer glow effect.
          </p>
        </div>

        <div>
          <h3 class="font-semibold mb-2">
            4. Without Logo (With Spinner)
          </h3>
          <pre class="bg-slate-100 p-4 rounded-lg overflow-x-auto text-sm"><code>&lt;PageLoader /&gt;</code></pre>
          <p class="text-sm text-slate-600 mt-2">
            When no logo is provided, the spinner is automatically shown on the left of the message text.
          </p>
        </div>

        <div>
          <h3 class="font-semibold mb-2">
            5. Simulate API Call
          </h3>
          <pre class="bg-slate-100 p-4 rounded-lg overflow-x-auto text-sm"><code>async function loadData() {
  const loader = usePageLoader()

  loader.show('Loading...')
  try {
    const data = await fetch('/api/data').then(r => r.json())
    // Use data
  } finally {
    loader.hide()
  }
}</code></pre>
        </div>
      </div>
    </div>

    <!-- Component Props -->
    <div class="card space-y-4">
      <div>
        <h2 class="text-lg font-semibold">
          Component Props
        </h2>
        <p class="text-sm text-slate-600 mt-1">
          The spinner is automatically hidden when a logo is provided.
        </p>
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
                <code>logo</code>
              </td>
              <td class="p-2">
                string
              </td>
              <td class="p-2">
                undefined
              </td>
              <td class="p-2">
                Logo image URL
              </td>
            </tr>
            <tr class="border-b">
              <td class="p-2">
                <code>logoAlt</code>
              </td>
              <td class="p-2">
                string
              </td>
              <td class="p-2">
                "Logo"
              </td>
              <td class="p-2">
                Logo alt text
              </td>
            </tr>
            <tr class="border-b">
              <td class="p-2">
                <code>logoSize</code>
              </td>
              <td class="p-2">
                string | number
              </td>
              <td class="p-2">
                "80px"
              </td>
              <td class="p-2">
                Logo size (CSS value or pixels)
              </td>
            </tr>
            <tr class="border-b">
              <td class="p-2">
                <code>message</code>
              </td>
              <td class="p-2">
                string
              </td>
              <td class="p-2">
                undefined
              </td>
              <td class="p-2">
                Custom message (overrides store)
              </td>
            </tr>
            <tr class="border-b">
              <td class="p-2">
                <code>showProgress</code>
              </td>
              <td class="p-2">
                boolean
              </td>
              <td class="p-2">
                false
              </td>
              <td class="p-2">
                Show progress indicator
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
