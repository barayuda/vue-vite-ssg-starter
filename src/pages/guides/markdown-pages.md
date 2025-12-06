---
title: Writing pages in Markdown
summary: Create content-rich pages using Markdown syntax with frontmatter support, code highlighting, and Vue component integration.
tags:
  - markdown
  - content
  - unplugin-vue-markdown
updatedAt: '2025-01-10'
---

# Writing Pages in Markdown

This starter supports **Markdown files** (`.md`) as first-class routes. Simply drop a `.md` file in `src/pages` and it will be automatically converted to a route.

## Features

- ✅ **Frontmatter support** - Add metadata using YAML frontmatter
- ✅ **Syntax highlighting** - Code blocks with Prism.js
- ✅ **Vue components** - Use Vue components directly in Markdown
- ✅ **SSG-friendly** - Pre-rendered during build
- ✅ **Tailwind styling** - Automatic prose styling

## Basic Usage

Create a file like `src/pages/guides/markdown-pages.md` and it will be available at `/guides/markdown-pages`.

### Frontmatter

Use YAML frontmatter at the top of your file to add metadata:

```yaml
---
title: Your Page Title
summary: A brief description
tags:
  - tag1
  - tag2
updatedAt: '2025-01-10'
---
```

## Markdown Syntax Examples

### Headings

# H1 Heading
## H2 Heading
### H3 Heading
#### H4 Heading

### Text Formatting

This is **bold text**, this is *italic text*, and this is ~~strikethrough~~.

You can also use `inline code` in your text.

### Lists

**Unordered list:**
- Item one
- Item two
  - Nested item
  - Another nested item
- Item three

**Ordered list:**
1. First item
2. Second item
3. Third item

### Links and Images

[Link to Vue.js](https://vuejs.org)

![Alt text](https://via.placeholder.com/400x200?text=Markdown+Image)

### Code Blocks

**JavaScript:**
```javascript
function greet(name) {
  return `Hello, ${name}!`
}

greet('World')
```

**TypeScript:**
```typescript
interface User {
  name: string
  age: number
}

const user: User = {
  name: 'John',
  age: 30
}
```

**Vue Component:**
```html
<template>
  <div class="card">
    <h2>{{ title }}</h2>
    <p>{{ description }}</p>
  </div>
</template>
```

```typescript
<script setup lang="ts">
defineProps<{
  title: string
  description: string
}>()
</script>
```

**Bash:**
```bash
pnpm install
pnpm dev
pnpm build
```

### Blockquotes

> This is a blockquote. You can use it to highlight important information or quotes.
>
> It can span multiple lines.

### Tables

| Feature | Status | Notes |
|---------|--------|-------|
| Frontmatter | ✅ | YAML format |
| Code highlighting | ✅ | Prism.js |
| Vue components | ✅ | Full support |
| SSG | ✅ | Pre-rendered |

### Horizontal Rule

---

## Using Vue Components

You can use Vue components directly in Markdown files! For example, you can create callouts:

<div class="rounded-lg bg-blue-50 p-4 text-sm text-blue-800 border border-blue-200">
  <p class="font-semibold mb-1">💡 Tip</p>
  <p>This is a Vue component callout embedded in Markdown!</p>
</div>

## Configuration

Markdown support is configured in `vite.config.ts`:

```typescript
Markdown({
  wrapperClasses: 'prose prose-sm m-auto text-left',
  headEnabled: true,
  markdownItSetup(md) {
    md.use(Prism) // Syntax highlighting
  },
})
```

## Styling

Markdown content is automatically styled using:
- **Tailwind Typography** - Prose classes for readable content
- **Custom styles** - Defined in `src/styles/markdown.css`
- **Prism.js** - Syntax highlighting for code blocks

## Best Practices

1. **Use frontmatter** - Always include title, summary, and tags
2. **Keep it readable** - Use proper heading hierarchy
3. **Add code examples** - Show practical usage
4. **Include links** - Reference related resources
5. **Use components** - Enhance with Vue components when needed

## Dynamic Routes

You can also create dynamic markdown routes:

- `src/pages/guides/[slug].md` - Dynamic markdown route
- Works the same way as Vue dynamic routes

## Next Steps

- Check out other guides in the `/guides` section
- Explore the [Plugins page](/plugins) for more features
- Read the [README](/) for project structure

---

**Happy writing!** 📝

