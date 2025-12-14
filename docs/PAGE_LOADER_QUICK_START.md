# PageLoader Quick Start Guide

## ✅ What's Included

- **PageLoader Component** with logo support
- **Pinia Store** for global state management
- **Composable** (`usePageLoader`) for easy integration
- **Demo Page** at `/loader-demo` to test and simulate

## 🚀 Quick Usage

### 1. Show/Hide Loader

```typescript
import { usePageLoader } from '/@/composables/usePageLoader'

const loader = usePageLoader()

// Show loader
loader.show('Loading data...')

// Hide loader
loader.hide()
```

### 2. With Progress

```typescript
const loader = usePageLoader()

loader.show('Processing...')
loader.setProgress(25)
loader.setProgress(50)
loader.setProgress(100)
loader.hide()
```

### 3. Simulate API Call

```typescript
async function loadData() {
  const loader = usePageLoader()
  
  loader.show('Loading...')
  try {
    const data = await fetch('/api/data').then(r => r.json())
    // Use data
  } finally {
    loader.hide()
  }
}
```

## 🎨 Logo Support

The PageLoader component now supports displaying a logo! It's already configured in `App.vue`:

```vue
<PageLoader
  logo="/android-chrome-192x192.png"
  logo-alt="App Logo"
  logo-size="100px"
/>
```

### Logo Props

- `logo` - Image URL (string)
- `logoAlt` - Alt text for accessibility (default: "Logo")
- `logoSize` - Size in pixels or CSS value (default: "80px")

## 🧪 Test It Out

1. **Visit the demo page**: Navigate to `/loader-demo` in your browser
2. **Click the buttons** to see different loading scenarios:
   - Simple Loader (3s)
   - Progress Loader
   - Simulate API Call
   - Quick Flash Test

## 📍 Where to Use

The PageLoader is already integrated in `App.vue`, so it's available globally. Just use the composable anywhere in your app:

```typescript
// In any component
import { usePageLoader } from '/@/composables/usePageLoader'

const loader = usePageLoader()
loader.show('Loading...')
```

## 🔧 Customization

You can customize the PageLoader in `App.vue`:

```vue
<PageLoader
  logo="/your-logo.png"
  logo-alt="Your Brand"
  logo-size="120px"
  variant="both"        <!-- 'spinner' | 'shimmer' | 'both' -->
  size="md"             <!-- 'sm' | 'md' | 'lg' -->
  show-progress="true"  <!-- Show progress bar -->
/>
```

## 📚 Full Documentation

See `docs/PAGE_LOADER.md` for complete documentation including:
- All props and options
- Advanced usage patterns
- Performance optimizations
- Accessibility features
- Testing guidelines

## 🎯 Example: Simulate Loading

```typescript
// Simulate a multi-step process
async function simulateLoading() {
  const loader = usePageLoader()
  
  loader.show('Step 1: Connecting...')
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  loader.setMessage('Step 2: Fetching data...')
  loader.setProgress(50)
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  loader.setMessage('Step 3: Processing...')
  loader.setProgress(100)
  await new Promise(resolve => setTimeout(resolve, 500))
  
  loader.hide()
}
```

That's it! The PageLoader is ready to use. 🎉
