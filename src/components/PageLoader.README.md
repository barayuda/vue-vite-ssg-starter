# PageLoader Component

A standardized, performant page loader component with shimmer effects for enhanced UX during API data fetching.

## Quick Start

```typescript
import { usePageLoader } from '/@/composables/usePageLoader'

const loader = usePageLoader()
loader.show('Loading...')
loader.hide()
```

## Files Created

- `src/components/PageLoader.vue` - Main component with shimmer and spinner
- `src/stores/page-loader.store.ts` - Pinia store for global state
- `src/composables/usePageLoader.ts` - Composable for easy integration
- `src/components/__tests__/PageLoader.test.ts` - Component tests
- `src/stores/__tests__/page-loader.store.test.ts` - Store tests
- `src/composables/__tests__/usePageLoader.test.ts` - Composable tests
- `src/pages/page-loader-demo.vue` - Demo page with examples
- `docs/PAGE_LOADER.md` - Full documentation

## Integration

The component is already integrated into `App.vue`. It will automatically show/hide based on the Pinia store state.

## Usage Examples

### Basic
```typescript
const loader = usePageLoader()
loader.show('Loading data...')
loader.hide()
```

### With Progress
```typescript
const loader = usePageLoader()
loader.show()
loader.setProgress(50)
loader.hide()
```

### Auto-sync with useFetch
```typescript
const { isLoading } = useFetch('/api/data')
usePageLoader({ autoShow: true, autoHide: true }, isLoading)
```

See `docs/PAGE_LOADER.md` for complete documentation.
