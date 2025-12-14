<script setup lang="ts">
import { defineAsyncComponent, onMounted } from 'vue'
import ErrorBoundary from './components/ErrorBoundary.vue'
import Notifications from './components/Notifications.vue'
import PageLoader from './components/PageLoader.vue'
import SiteFooter from './components/SiteFooter.vue'
import SiteHeader from './components/SiteHeader.vue'

import globalNotification from '/@/composables/useNotification'
import PageLoaderUtil from '/@/utils/pageloader.module'

// Dynamic imports for non-critical components
const BackToTop = defineAsyncComponent(() => import('./components/BackToTop.vue'))

onMounted(() => {
  globalNotification.clearAll()
  PageLoaderUtil.hide(500)
})
</script>

<template>
  <div class="min-h-screen bg-surface text-slate-900 flex flex-col">
    <PageLoader
      logo="/android-chrome-192x192.png"
      logo-alt="App Logo"
      logo-size="100px"
    />
    <Notifications />
    <SiteHeader />
    <ErrorBoundary
      :show-notifications="true"
      :log-errors="true"
    >
      <main class="flex-1">
        <router-view />
      </main>
    </ErrorBoundary>
    <SiteFooter />
    <BackToTop
      :threshold="240"
      variant="circle"
      theme="gradient"
      :show-progress="true"
    />
  </div>
</template>
