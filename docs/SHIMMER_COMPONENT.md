# Shimmer Component Documentation

A reusable shimmer component for displaying loading states while fetching data from APIs. Perfect for showing placeholder content that matches your actual UI structure.

## Features

- 🎨 **Multiple Variants**: Card, List, Text, and Custom
- ⚡ **Performance Optimized**: GPU-accelerated animations
- ♿ **Accessible**: Respects `prefers-reduced-motion`
- 📱 **Responsive**: Works on all screen sizes
- 🎯 **Easy to Use**: Simple props, flexible configuration

## Quick Start

```vue
<template>
  <div v-if="isLoading">
    <Shimmer variant="card" :count="3" />
  </div>
  <div v-else>
    <!-- Your content -->
  </div>
</template>

<script setup>
import Shimmer from '/@/components/Shimmer.vue'
import { useFetch } from '/@/composables/useFetch'

const { data, isLoading } = useFetch('/api/data')
</script>
```

## Variants

### 1. Card Variant

Perfect for loading card grids:

```vue
<Shimmer variant="card" :count="3" />
```

**Use Cases:**
- Product cards
- Article cards
- Dashboard widgets
- Any card-based layouts

### 2. List Variant

Great for user lists, comments, or any list-based content:

```vue
<Shimmer variant="list" :count="5" />
```

**Use Cases:**
- User lists
- Comment threads
- Notification lists
- Search results

### 3. Text Variant

Simple text lines for loading paragraphs:

```vue
<Shimmer variant="text" :lines="4" />
```

**Use Cases:**
- Article content
- Descriptions
- Paragraphs
- Any text content

### 4. Custom Variant

Create custom shimmer shapes:

```vue
<Shimmer
  variant="custom"
  width="200px"
  height="40px"
  border-radius="8px"
/>
```

**Use Cases:**
- Custom shapes
- Buttons
- Images
- Any specific dimensions

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'card' \| 'list' \| 'text' \| 'custom'` | `'text'` | Shimmer variant type |
| `lines` | `number` | `3` | Number of lines (text variant) |
| `count` | `number` | `1` | Number of items (card/list variants) |
| `width` | `string` | `'100%'` | Width (custom variant) |
| `height` | `string` | `undefined` | Height (custom variant) |
| `borderRadius` | `string` | `'0.5rem'` | Border radius (custom variant) |
| `animated` | `boolean` | `true` | Enable shimmer animation |
| `class` | `string` | `''` | Additional CSS classes |

## Usage Examples

### Example 1: Loading Cards from API

```vue
<template>
  <div class="grid gap-4 md:grid-cols-3">
    <template v-if="isLoading">
      <Shimmer variant="card" :count="3" />
    </template>
    <article
      v-else
      v-for="item in items"
      :key="item.id"
      class="card"
    >
      <h3>{{ item.title }}</h3>
      <p>{{ item.description }}</p>
    </article>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Shimmer from '/@/components/Shimmer.vue'

const isLoading = ref(true)
const items = ref([])

onMounted(async () => {
  const response = await fetch('/api/items')
  items.value = await response.json()
  isLoading.value = false
})
</script>
```

### Example 2: Loading List with useFetch

```vue
<template>
  <div class="card">
    <div v-if="isLoading">
      <Shimmer variant="list" :count="5" />
    </div>
    <div v-else class="divide-y">
      <div
        v-for="user in users"
        :key="user.id"
        class="p-4 flex items-center gap-4"
      >
        <img :src="user.avatar" :alt="user.name" class="w-12 h-12 rounded-full">
        <div>
          <p class="font-semibold">{{ user.name }}</p>
          <p class="text-sm text-slate-600">{{ user.email }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Shimmer from '/@/components/Shimmer.vue'
import { useFetch } from '/@/composables/useFetch'

const { data: users, isLoading } = useFetch('/api/users')
</script>
```

### Example 3: Loading Text Content

```vue
<template>
  <article class="card">
    <div v-if="isLoading">
      <Shimmer variant="text" :lines="6" />
    </div>
    <div v-else>
      <h1>{{ article.title }}</h1>
      <div v-html="article.content" />
    </div>
  </article>
</template>

<script setup>
import Shimmer from '/@/components/Shimmer.vue'
import { useFetch } from '/@/composables/useFetch'

const { data: article, isLoading } = useFetch('/api/article/123')
</script>
```

### Example 4: Custom Shimmer Shapes

```vue
<template>
  <div class="card space-y-4">
    <!-- Title shimmer -->
    <Shimmer
      variant="custom"
      width="60%"
      height="1.5rem"
      border-radius="0.5rem"
    />
    
    <!-- Avatar shimmer -->
    <Shimmer
      variant="custom"
      width="80px"
      height="80px"
      border-radius="50%"
    />
    
    <!-- Content shimmer -->
    <Shimmer variant="text" :lines="3" />
  </div>
</template>
```

### Example 5: Mixed Content Loading

```vue
<template>
  <div class="card">
    <div v-if="isLoading">
      <!-- Title -->
      <Shimmer
        variant="custom"
        width="50%"
        height="1.5rem"
        class="mb-4"
      />
      
      <!-- Image placeholder -->
      <Shimmer
        variant="custom"
        width="100%"
        height="200px"
        border-radius="1rem"
        class="mb-4"
      />
      
      <!-- Text content -->
      <Shimmer variant="text" :lines="4" />
    </div>
    <div v-else>
      <h2>{{ content.title }}</h2>
      <img :src="content.image" :alt="content.title">
      <p>{{ content.description }}</p>
    </div>
  </div>
</template>
```

## Best Practices

1. **Match Your Layout**: Use the variant that matches your actual content structure
2. **Appropriate Count**: Use the same number of shimmer items as expected content
3. **Performance**: Shimmer animations are GPU-accelerated, but disable if not needed
4. **Accessibility**: The component respects `prefers-reduced-motion` automatically
5. **Loading States**: Always show shimmer when `isLoading` is true

## Integration with Pinia Stores

```vue
<template>
  <div v-if="store.state === 'loading'">
    <Shimmer variant="card" :count="3" />
  </div>
  <div v-else>
    <!-- Content -->
  </div>
</template>

<script setup>
import { useShowcaseStore } from '/@/stores/showcase.store'
import Shimmer from '/@/components/Shimmer.vue'

const store = useShowcaseStore()
</script>
```

## Performance

- Uses `will-change` for GPU acceleration
- Efficient CSS animations
- Minimal DOM impact
- Respects reduced motion preferences

## Accessibility

- Automatically disables animations when `prefers-reduced-motion` is enabled
- Semantic HTML structure
- No focus traps
- Screen reader friendly

## Demo

Visit `/shimmer-demo` to see all variants in action with live examples!

## See Also

- [PageLoader Component](./PAGE_LOADER.md) - Full-page loader with shimmer
- [useFetch Composable](../src/composables/useFetch.ts) - For API loading states
