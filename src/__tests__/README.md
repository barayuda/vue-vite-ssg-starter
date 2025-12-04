# Testing Guide

This project uses [Vitest](https://vitest.dev/) for unit testing with Vue 3 support.

## Running Tests

```bash
# Run tests in watch mode
pnpm test

# Run tests with UI
pnpm test:ui

# Run tests once
pnpm test:run

# Run tests with coverage
pnpm test:coverage
```

## Test Structure

Tests are located in `src/__tests__/` directory and follow the same structure as the source code:

```
src/
  composables/
    __tests__/
      useNotification.test.ts
      useResponsive.test.ts
  stores/
    __tests__/
      showcase.store.test.ts
  types/
    __tests__/
      errors.test.ts
```

## Writing Tests

### Example: Testing a Composable

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { useNotification } from '../useNotification'

describe('useNotification', () => {
  let notification: ReturnType<typeof useNotification>

  beforeEach(() => {
    notification = useNotification()
    notification.clearAll()
  })

  it('should create a notification', () => {
    const id = notification.success('Test message')
    expect(id).toBeTypeOf('number')
    expect(notification.notifications.value).toHaveLength(1)
  })
})
```

### Example: Testing a Store

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useShowcaseStore } from '../showcase.store'

describe('useShowcaseStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should initialize with empty state', () => {
    const store = useShowcaseStore()
    expect(store.guides).toEqual([])
  })
})
```

### Example: Testing Vue Components

```typescript
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MyComponent from '../MyComponent.vue'

describe('MyComponent', () => {
  it('should render correctly', () => {
    const wrapper = mount(MyComponent, {
      props: {
        title: 'Test Title',
      },
    })
    expect(wrapper.text()).toContain('Test Title')
  })
})
```

## Test Configuration

- **Environment**: Happy DOM (lightweight DOM implementation)
- **Setup File**: `src/__tests__/setup.ts`
- **Coverage**: V8 provider with HTML, JSON, and text reporters
- **Globals**: Vitest globals enabled (no need to import `describe`, `it`, `expect`)

## Best Practices

1. **Isolation**: Each test should be independent
2. **Mocking**: Use `vi.mock()` for external dependencies
3. **Cleanup**: Use `beforeEach`/`afterEach` for setup/teardown
4. **Descriptive Names**: Use clear test descriptions
5. **Coverage**: Aim for meaningful coverage, not 100%

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Vue Test Utils](https://test-utils.vuejs.org/)
- [Testing Library](https://testing-library.com/)

