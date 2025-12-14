<script setup lang="ts">
/**
 * @component SiteHeader
 * @description Site header component with navigation links and branding.
 * Displays a sticky header with logo, navigation menu, and external documentation link.
 * Highlights the active route in the navigation.
 *
 * @example
 * ```vue
 * <SiteHeader />
 * ```
 *
 * @remarks
 * - Sticky positioning with backdrop blur effect
 * - Active route highlighting
 * - Responsive design with Tailwind CSS
 * - Accessible navigation with proper ARIA labels
 */
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const showComponentsMenu = ref(false)
const componentsMenuRef = ref<HTMLElement | null>(null)

/**
 * @constant links
 * @description Navigation links array for the header menu.
 * @type {Array<{label: string, to: string}>}
 */
const links = [
  { label: 'Home', to: '/' },
  { label: 'Guides', to: '/guides' },
  { label: 'Plugins', to: '/plugins' },
]

/**
 * @constant componentLinks
 * @description Component demo links for the dropdown menu.
 * @type {Array<{label: string, to: string}>}
 */
const componentLinks = [
  { label: 'Page Loader Demo', to: '/components/loader-demo' },
  { label: 'Shimmer Demo', to: '/components/shimmer-demo' },
  { label: 'Forms', to: '/components/forms' },
]

/**
 * @computed activePath
 * @description Reactive computed property that returns the current route path.
 * Used to highlight the active navigation link.
 */
const activePath = computed(() => route.path)

/**
 * @computed isComponentsActive
 * @description Checks if any component demo page is active.
 */
const isComponentsActive = computed(() => {
  return componentLinks.some(link => activePath.value === link.to)
})

/**
 * @function toggleComponentsMenu
 * @description Toggles the components dropdown menu.
 */
function toggleComponentsMenu() {
  showComponentsMenu.value = !showComponentsMenu.value
}

/**
 * @function closeComponentsMenu
 * @description Closes the components dropdown menu.
 */
function closeComponentsMenu() {
  showComponentsMenu.value = false
}

/**
 * @function handleClickOutside
 * @description Handles clicks outside the dropdown menu to close it.
 */
function handleClickOutside(event: MouseEvent) {
  if (componentsMenuRef.value && !componentsMenuRef.value.contains(event.target as Node)) {
    showComponentsMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
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

        <!-- Components Dropdown Menu -->
        <div
          ref="componentsMenuRef"
          class="relative"
        >
          <button
            type="button"
            class="px-3 py-2 rounded-lg transition hover:bg-primary/10 hover:text-primary flex items-center gap-1"
            :class="isComponentsActive ? 'bg-primary/10 text-primary' : ''"
            :aria-expanded="showComponentsMenu"
            aria-haspopup="true"
            @click="toggleComponentsMenu"
          >
            Components
            <svg
              class="size-4 transition-transform"
              :class="showComponentsMenu ? 'rotate-180' : ''"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          <!-- Dropdown Menu -->
          <Transition
            enter-active-class="transition ease-out duration-100"
            enter-from-class="transform opacity-0 scale-95"
            enter-to-class="transform opacity-100 scale-100"
            leave-active-class="transition ease-in duration-75"
            leave-from-class="transform opacity-100 scale-100"
            leave-to-class="transform opacity-0 scale-95"
          >
            <div
              v-if="showComponentsMenu"
              class="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50"
              @click.stop
            >
              <router-link
                v-for="componentLink in componentLinks"
                :key="componentLink.to"
                :to="componentLink.to"
                class="block px-4 py-2 text-sm text-slate-700 hover:bg-primary/10 hover:text-primary transition"
                :class="activePath === componentLink.to ? 'bg-primary/10 text-primary font-medium' : ''"
                @click="closeComponentsMenu"
              >
                {{ componentLink.label }}
              </router-link>
            </div>
          </Transition>
        </div>

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
