# Page Loader Component Documentation

A standardized, performant page loader component with shimmer effects for enhanced UX during API data fetching in Vue.js applications.

## Features

- ✨ **Animated Loader**: Smooth spinner and shimmer animations
- 🎨 **Multiple Variants**: Spinner, shimmer, or both
- 📊 **Progress Tracking**: Built-in progress indicator support
- 🎯 **Core Web Vitals Optimized**: Minimizes LCP, CLS, and FID impact
- ♿ **Accessible**: ARIA labels and reduced motion support
- 🔄 **Auto-sync**: Integrates seamlessly with `useFetch` composable
- 📦 **TypeScript**: Full type safety
- 🧪 **Tested**: Comprehensive unit tests

## Installation

The component is already integrated into the project. Import and use it as needed.

## Basic Usage

### Manual Control

```typescript
import { usePageLoader } from '/@/composables/usePageLoader'

const loader = usePageLoader()

// Show loader
loader.show('Loading data...')

// Hide loader
loader.hide()
```

### Auto-sync with useFetch

```typescript
import { useFetch } from '/@/composables/useFetch'
import { usePageLoader } from '/@/composables/usePageLoader'

const { isLoading } = useFetch('/api/data')
usePageLoader({ autoShow: true, autoHide: true }, isLoading)
```

### With Progress Tracking

```typescript
const loader = usePageLoader()

loader.show('Processing...')
loader.setProgress(25)
loader.setProgress(50)
loader.setProgress(100)
loader.hide()
```

## Component Props

The `PageLoader` component accepts the following props:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `fullPage` | `boolean` | `true` | Show full page overlay |
| `message` | `string` | `undefined` | Custom message (overrides store message) |
| `variant` | `'spinner' \| 'shimmer' \| 'both'` | `'both'` | Visual variant |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size of the loader |
| `delay` | `number` | `0` | Delay before showing (ms) |
| `minDisplayTime` | `number` | `300` | Minimum display time to prevent flash (ms) |
| `showProgress` | `boolean` | `false` | Show progress indicator |
| `progress` | `number` | `undefined` | Custom progress value (0-100) |

## Composable Options

The `usePageLoader` composable accepts the following options:

```typescript
interface UsePageLoaderOptions {
  autoShow?: boolean      // Auto-show when isLoading becomes true
  autoHide?: boolean      // Auto-hide when isLoading becomes false
  message?: string        // Initial message
  delay?: number          // Delay before showing (ms)
}
```

## Store API

The Pinia store provides the following methods and state:

### Methods

- `show(message?: string)` - Show the loader (stacks)
- `hide()` - Hide the loader (unstack)
- `setMessage(message: string | null)` - Update loading message
- `setProgress(progress: number)` - Set progress (0-100)
- `reset()` - Reset all state

### State

- `isLoading: ComputedRef<boolean>` - Whether loader is active
- `message: Ref<string | null>` - Current message
- `progress: Ref<number>` - Current progress (0-100)
- `loadingDuration: ComputedRef<number>` - Duration in milliseconds

## Usage Patterns

### Pattern 1: Simple API Call

```typescript
const loader = usePageLoader()

async function loadData() {
  loader.show('Loading data...')
  try {
    const data = await fetch('/api/data').then(r => r.json())
    // Use data
  } finally {
    loader.hide()
  }
}
```

### Pattern 2: Progress Updates

```typescript
const loader = usePageLoader()

async function processData() {
  loader.show('Processing...')
  
  for (let i = 0; i <= 100; i += 10) {
    await processChunk()
    loader.setProgress(i)
    loader.setMessage(`Processing... ${i}%`)
  }
  
  loader.hide()
}
```

### Pattern 3: Multiple Loading States

```typescript
const loader = usePageLoader()

async function complexOperation() {
  loader.show('Step 1: Loading...')
  await step1()
  
  loader.setMessage('Step 2: Processing...')
  await step2()
  
  loader.setMessage('Step 3: Finalizing...')
  await step3()
  
  loader.hide()
}
```

### Pattern 4: Integration with Pinia Stores

```typescript
// In your store
import { usePageLoaderStore } from '/@/stores/page-loader.store'

export const useMyStore = defineStore('myStore', () => {
  const loader = usePageLoaderStore()
  
  async function loadData() {
    loader.show('Loading from store...')
    try {
      // Load data
    } finally {
      loader.hide()
    }
  }
  
  return { loadData }
})
```

## Performance Optimization

### Core Web Vitals

The component is optimized for Core Web Vitals:

- **LCP (Largest Contentful Paint)**: Uses `will-change` for GPU acceleration
- **CLS (Cumulative Layout Shift)**: Fixed positioning prevents layout shifts
- **FID (First Input Delay)**: Minimal JavaScript, efficient animations

### CSS Optimizations

- Uses `transform` and `opacity` for animations (GPU accelerated)
- Implements `will-change` strategically
- Respects `prefers-reduced-motion` for accessibility
- Uses efficient CSS animations over JavaScript

### Bundle Size

- Component is lazy-loadable
- Minimal dependencies
- Tree-shakeable exports

## Accessibility

- **ARIA Labels**: Proper `role="status"` and `aria-live="polite"`
- **Reduced Motion**: Respects `prefers-reduced-motion` media query
- **Screen Readers**: Descriptive messages and labels
- **Keyboard**: Non-interactive, doesn't trap focus

## Testing

Run the test suite:

```bash
pnpm test
```

Test coverage includes:
- Component rendering
- Store state management
- Composable functionality
- Edge cases and error handling

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Supports CSS Grid and Flexbox
- Fallbacks for older browsers
- Mobile responsive

## Troubleshooting

### Loader not showing

1. Check that the store is properly initialized
2. Verify `isLoading` is `true` in the store
3. Check browser console for errors
4. Ensure component is mounted in App.vue

### Animation performance issues

1. Check if `prefers-reduced-motion` is enabled
2. Verify GPU acceleration is working
3. Check for conflicting CSS
4. Monitor Core Web Vitals

### Progress not updating

1. Ensure `setProgress` is called with values 0-100
2. Check that `showProgress` prop is `true`
3. Verify store state is reactive

## Examples

See `src/pages/page-loader-demo.vue` for comprehensive examples.

## Best Practices

1. **Use appropriate delays**: Prevent flash of loading state for fast operations
2. **Provide meaningful messages**: Help users understand what's happening
3. **Track progress when possible**: Better UX for long operations
4. **Clean up on unmount**: Use composable's automatic cleanup
5. **Test loading states**: Ensure smooth transitions
6. **Respect user preferences**: Reduced motion support

## Migration from Old PageLoader

If migrating from the old `pageloader.module.ts`:

```typescript
// Old way
import PageLoader from '/@/utils/pageloader.module'
PageLoader.show()
PageLoader.hide()

// New way
import { usePageLoader } from '/@/composables/usePageLoader'
const loader = usePageLoader()
loader.show()
loader.hide()
```

## Contributing

When adding features:
1. Maintain TypeScript types
2. Add unit tests
3. Update documentation
4. Check Core Web Vitals impact
5. Test accessibility

## License

MIT
