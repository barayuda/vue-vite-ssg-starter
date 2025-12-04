import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as mockApi from '../../data/mock-api'
import { RequestState, useShowcaseStore } from '../showcase.store'

// Mock the mock-api module
vi.mock('../../data/mock-api', () => ({
  fetchGuides: vi.fn(),
  fetchProjects: vi.fn(),
  fetchGuideBySlug: vi.fn(),
}))

describe('useShowcaseStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('should initialize with empty state', () => {
    const store = useShowcaseStore()

    expect(store.guides).toEqual([])
    expect(store.projects).toEqual([])
    expect(store.state).toBe(RequestState.IDLE)
    expect(store.error).toBeNull()
  })

  it('should load guides successfully', async () => {
    const mockGuides = [
      {
        slug: 'test-guide',
        title: 'Test Guide',
        summary: 'Test summary',
        body: ['Test body'],
        tags: ['test'],
        updatedAt: '2025-01-01',
      },
    ]

    vi.mocked(mockApi.fetchGuides).mockResolvedValue(mockGuides)

    const store = useShowcaseStore()
    await store.loadGuides()

    expect(store.guides).toEqual(mockGuides)
    expect(store.state).toBe(RequestState.IDLE)
    expect(store.error).toBeNull()
  })

  it('should handle errors when loading guides', async () => {
    const errorMessage = 'Failed to fetch guides'
    vi.mocked(mockApi.fetchGuides).mockRejectedValue(new Error(errorMessage))

    const store = useShowcaseStore()
    await store.loadGuides()

    expect(store.guides).toEqual([])
    expect(store.state).toBe(RequestState.ERROR)
    expect(store.error).toBe(errorMessage)
  })

  it('should load projects successfully', async () => {
    const mockProjects = [
      {
        slug: 'test-project',
        name: 'Test Project',
        description: 'Test description',
        stack: ['Vue', 'TypeScript'],
        status: 'shipped' as const,
        href: '/test',
      },
    ]

    vi.mocked(mockApi.fetchProjects).mockResolvedValue(mockProjects)

    const store = useShowcaseStore()
    await store.loadProjects()

    expect(store.projects).toEqual(mockProjects)
    expect(store.state).toBe(RequestState.IDLE)
  })

  it('should compute featured guides', async () => {
    const mockGuides = [
      { slug: '1', title: 'Guide 1', summary: '', body: [], tags: [], updatedAt: '' },
      { slug: '2', title: 'Guide 2', summary: '', body: [], tags: [], updatedAt: '' },
      { slug: '3', title: 'Guide 3', summary: '', body: [], tags: [], updatedAt: '' },
    ]

    vi.mocked(mockApi.fetchGuides).mockResolvedValue(mockGuides)

    const store = useShowcaseStore()
    await store.loadGuides()

    expect(store.featuredGuides).toHaveLength(2)
    expect(store.featuredGuides[0].slug).toBe('1')
    expect(store.featuredGuides[1].slug).toBe('2')
  })

  it('should get guide by slug from cache', async () => {
    const mockGuide = {
      slug: 'test-guide',
      title: 'Test Guide',
      summary: 'Test',
      body: ['Test'],
      tags: ['test'],
      updatedAt: '2025-01-01',
    }

    vi.mocked(mockApi.fetchGuides).mockResolvedValue([mockGuide])

    const store = useShowcaseStore()
    await store.loadGuides()

    const guide = await store.getGuideBySlug('test-guide')

    expect(guide).toEqual(mockGuide)
    expect(mockApi.fetchGuideBySlug).not.toHaveBeenCalled()
  })

  it('should fetch guide by slug if not in cache', async () => {
    const mockGuide = {
      slug: 'new-guide',
      title: 'New Guide',
      summary: 'New',
      body: ['New'],
      tags: ['new'],
      updatedAt: '2025-01-01',
    }

    vi.mocked(mockApi.fetchGuideBySlug).mockResolvedValue(mockGuide)

    const store = useShowcaseStore()
    const guide = await store.getGuideBySlug('new-guide')

    expect(guide).toEqual(mockGuide)
    expect(mockApi.fetchGuideBySlug).toHaveBeenCalledWith('new-guide')
    expect(store.guides).toHaveLength(1)
    expect(store.guides[0].slug).toBe('new-guide')
  })
})
