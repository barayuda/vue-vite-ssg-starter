import type { Guide, Project } from '/@/data/mock-api'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { fetchGuideBySlug, fetchGuides, fetchProjects } from '/@/data/mock-api'

const RequestState = {
  IDLE: 'idle',
  LOADING: 'loading',
  ERROR: 'error',
} as const

type RequestStateValue = typeof RequestState[keyof typeof RequestState]

export { RequestState }

export const useShowcaseStore = defineStore('showcase', () => {
  const guides = ref<Guide[]>([])
  const projects = ref<Project[]>([])
  const state = ref<RequestStateValue>(RequestState.IDLE)
  const error = ref<string | null>(null)

  const featuredGuides = computed(() => guides.value.slice(0, 2))
  const inProgressProjects = computed(() => projects.value.filter(project => project.status !== 'shipped'))

  async function loadGuides() {
    state.value = RequestState.LOADING
    error.value = null
    try {
      guides.value = await fetchGuides()
      state.value = RequestState.IDLE
    }
    catch (err) {
      state.value = RequestState.ERROR
      error.value = (err as Error).message || 'Failed to load guides'
    }
  }

  async function loadProjects() {
    state.value = RequestState.LOADING
    error.value = null
    try {
      projects.value = await fetchProjects()
      state.value = RequestState.IDLE
    }
    catch (err) {
      state.value = RequestState.ERROR
      error.value = (err as Error).message || 'Failed to load projects'
    }
  }

  async function getGuideBySlug(slug: string) {
    const existing = guides.value.find(guide => guide.slug === slug)
    if (existing)
      return existing

    state.value = RequestState.LOADING
    error.value = null
    try {
      const guide = await fetchGuideBySlug(slug)
      state.value = RequestState.IDLE
      if (guide)
        guides.value.push(guide)
      return guide
    }
    catch (err) {
      state.value = RequestState.ERROR
      error.value = (err as Error).message || 'Failed to load guide'
      return null
    }
  }

  return {
    guides,
    projects,
    state,
    error,
    featuredGuides,
    inProgressProjects,
    loadGuides,
    loadProjects,
    getGuideBySlug,
  }
})
