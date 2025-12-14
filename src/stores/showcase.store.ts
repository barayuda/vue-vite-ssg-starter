/**
 * @module stores/showcase
 * @description Pinia store for managing showcase data (guides and projects).
 * Provides reactive state management with loading states, error handling, and computed properties.
 */

import type { Guide, Project } from '/@/data/mock-api'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { fetchGuideBySlug, fetchGuides, fetchProjects } from '/@/data/mock-api'

/**
 * @constant RequestState
 * @description Request state constants for tracking async operation status.
 */
const RequestState = {
  IDLE: 'idle',
  LOADING: 'loading',
  ERROR: 'error',
} as const

/**
 * @typedef {string} RequestStateValue
 * @description Union type of all valid request state values.
 */
type RequestStateValue = typeof RequestState[keyof typeof RequestState]

export { RequestState }

/**
 * @function useShowcaseStore
 * @description Pinia store for managing showcase content (guides and projects).
 * Provides methods to load data, track loading states, and access computed properties.
 *
 * @returns {object} Store API with state and methods
 * @returns {Ref<Guide[]>} returns.guides - Array of all loaded guides
 * @returns {Ref<Project[]>} returns.projects - Array of all loaded projects
 * @returns {Ref<RequestStateValue>} returns.state - Current request state (idle, loading, error)
 * @returns {Ref<string | null>} returns.error - Error message if request failed
 * @returns {ComputedRef<Guide[]>} returns.featuredGuides - First 2 guides (featured)
 * @returns {ComputedRef<Project[]>} returns.inProgressProjects - Projects that are not shipped
 * @returns {Function} returns.loadGuides - Load all guides from API
 * @returns {Function} returns.loadProjects - Load all projects from API
 * @returns {Function} returns.getGuideBySlug - Get a guide by slug (loads if not cached)
 *
 * @example
 * ```typescript
 * const store = useShowcaseStore()
 *
 * // Load guides
 * await store.loadGuides()
 *
 * // Access featured guides
 * const featured = store.featuredGuides
 *
 * // Get specific guide
 * const guide = await store.getGuideBySlug('file-based-routing')
 * ```
 *
 * @remarks
 * - State is automatically hydrated during SSR
 * - Guides are cached after first load
 * - Error state is cleared when starting new requests
 * - All methods are async and update state accordingly
 */
export const useShowcaseStore = defineStore('showcase', () => {
  const guides = ref<Guide[]>([])
  const projects = ref<Project[]>([])
  const state = ref<RequestStateValue>(RequestState.IDLE)
  const error = ref<string | null>(null)

  const featuredGuides = computed(() => guides.value.slice(0, 2))
  const inProgressProjects = computed(() => projects.value.filter(project => project.status !== 'shipped'))

  /**
   * @function loadGuides
   * @description Loads all guides from the API and updates the store state.
   * Sets loading state, handles errors, and populates the guides array.
   *
   * @returns {Promise<void>} Resolves when guides are loaded or error occurs
   *
   * @throws {Error} Updates error state if fetch fails
   *
   * @example
   * ```typescript
   * await store.loadGuides()
   * if (store.state === 'idle') {
   *   console.log('Loaded', store.guides.length, 'guides')
   * }
   * ```
   */
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

  /**
   * @function loadProjects
   * @description Loads all projects from the API and updates the store state.
   * Sets loading state, handles errors, and populates the projects array.
   *
   * @returns {Promise<void>} Resolves when projects are loaded or error occurs
   *
   * @throws {Error} Updates error state if fetch fails
   */
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

  /**
   * @function getGuideBySlug
   * @description Gets a guide by its slug. Returns cached guide if available, otherwise fetches from API.
   * Updates loading state and caches the guide after fetching.
   *
   * @param {string} slug - The slug of the guide to retrieve
   * @returns {Promise<Guide | null>} The guide object, or null if not found or error occurred
   *
   * @example
   * ```typescript
   * const guide = await store.getGuideBySlug('file-based-routing')
   * if (guide) {
   *   console.log(guide.title)
   * }
   * ```
   */
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
