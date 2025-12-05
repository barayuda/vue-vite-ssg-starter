<route>
{
  meta: {
    subfolder: false,
    prerendered: true,
  }
}
</route>

<script setup lang="ts">
import { useHead } from '@unhead/vue'

useHead({
  title: 'UI Playground · Vite SSG Starter',
})
</script>

<template>
  <div class="mx-auto max-w-5xl px-4 py-12 space-y-10">
    <header class="space-y-2">
      <p class="eyebrow">
        UI Playground
      </p>
      <h1 class="text-3xl font-bold text-slate-900">
        Tailwind v4 + Component Primitives
      </h1>
      <p class="text-slate-700 text-base">
        Explore the component primitives available in this starter: headers, cards, callouts, buttons, badges, and more. All built with Tailwind v4 and custom CSS utilities.
      </p>
    </header>

    <!-- Headers Section -->
    <section class="card space-y-4">
      <div>
        <p class="eyebrow">
          Headers
        </p>
        <h2 class="section-title">
          Typography & Section Headers
        </h2>
        <p class="text-slate-600 text-sm mt-1">
          Consistent header patterns using <code class="px-1 py-0.5 rounded bg-slate-100 text-xs">.eyebrow</code> and <code class="px-1 py-0.5 rounded bg-slate-100 text-xs">.section-title</code> classes.
        </p>
      </div>

      <div class="space-y-6">
        <!-- Standard Header -->
        <div class="space-y-2">
          <p class="text-xs font-semibold text-slate-600">
            Standard Header Pattern:
          </p>
          <header class="space-y-2">
            <p class="eyebrow">
              Section Label
            </p>
            <h2 class="section-title">
              Main Section Title
            </h2>
            <p class="text-slate-700 text-base">
              Supporting description text that provides context for the section.
            </p>
          </header>
        </div>

        <!-- Compact Header -->
        <div class="space-y-2">
          <p class="text-xs font-semibold text-slate-600">
            Compact Header:
          </p>
          <div class="space-y-1">
            <p class="eyebrow">
              Guides
            </p>
            <h3 class="text-xl font-semibold text-slate-900">
              Dynamic routing + SSG examples
            </h3>
          </div>
        </div>

        <!-- Header with Meta -->
        <div class="space-y-2">
          <p class="text-xs font-semibold text-slate-600">
            Header with Metadata:
          </p>
          <header class="space-y-2">
            <p class="eyebrow">
              Guide
            </p>
            <h2 class="text-3xl md:text-4xl font-bold text-slate-900">
              File-based + dynamic routing
            </h2>
            <p class="text-sm text-slate-500">
              Updated 2025-01-10
            </p>
          </header>
        </div>
      </div>
    </section>

    <!-- Cards Section -->
    <section class="card space-y-4">
      <div>
        <p class="eyebrow">
          Cards
        </p>
        <h2 class="section-title">
          Card Components
        </h2>
        <p class="text-slate-600 text-sm mt-1">
          Versatile card component using <code class="px-1 py-0.5 rounded bg-slate-100 text-xs">.card</code> class with rounded corners, border, and shadow.
        </p>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <!-- Basic Card -->
        <article class="card space-y-3">
          <h3 class="text-lg font-semibold text-slate-900">
            Basic Card
          </h3>
          <p class="text-slate-700 text-sm leading-relaxed">
            Simple card with title and description. Perfect for displaying content blocks.
          </p>
        </article>

        <!-- Card with Badge -->
        <article class="card space-y-3">
          <div class="flex items-center justify-between gap-2">
            <h3 class="text-lg font-semibold text-slate-900">
              Card with Badge
            </h3>
            <span class="badge" data-status="shipped">
              shipped
            </span>
          </div>
          <p class="text-slate-700 text-sm leading-relaxed">
            Cards can include status badges to indicate state or category.
          </p>
        </article>

        <!-- Card with Tags -->
        <article class="card space-y-3">
          <h3 class="text-lg font-semibold text-slate-900">
            Card with Tags
          </h3>
          <p class="text-slate-700 text-sm leading-relaxed">
            Display related tags or categories below the content.
          </p>
          <div class="flex flex-wrap gap-2 text-xs text-slate-600">
            <span class="tag">
              Vue 3
            </span>
            <span class="tag">
              TypeScript
            </span>
            <span class="tag">
              Tailwind
            </span>
          </div>
        </article>

        <!-- Card with Action -->
        <article class="card space-y-3">
          <h3 class="text-lg font-semibold text-slate-900">
            Card with Action
          </h3>
          <p class="text-slate-700 text-sm leading-relaxed flex-1">
            Cards can include call-to-action links or buttons.
          </p>
          <a href="#" class="inline-flex items-center gap-2 text-primary font-semibold text-sm hover:underline">
            View details
            <span aria-hidden="true">→</span>
          </a>
        </article>
      </div>
    </section>

    <!-- Callouts Section -->
    <section class="card space-y-4">
      <div>
        <p class="eyebrow">
          Callouts
        </p>
        <h2 class="section-title">
          Information Callouts
        </h2>
        <p class="text-slate-600 text-sm mt-1">
          Highlighted information boxes for tips, warnings, notes, and important messages.
        </p>
      </div>

      <div class="space-y-4">
        <!-- Info Callout -->
        <div class="rounded-lg bg-blue-50 p-4 text-sm text-blue-800 border border-blue-200">
          <p class="font-semibold mb-1">
            💡 Info Callout
          </p>
          <p>
            Use this style for informational messages, tips, or helpful hints. The blue color scheme indicates neutral information.
          </p>
        </div>

        <!-- Success Callout -->
        <div class="rounded-lg bg-emerald-50 p-4 text-sm text-emerald-800 border border-emerald-200">
          <p class="font-semibold mb-1">
            ✅ Success Callout
          </p>
          <p>
            Perfect for success messages, confirmations, or positive feedback. The green color conveys success.
          </p>
        </div>

        <!-- Warning Callout -->
        <div class="rounded-lg bg-amber-50 p-4 text-sm text-amber-800 border border-amber-200">
          <p class="font-semibold mb-1">
            ⚠️ Warning Callout
          </p>
          <p>
            Use for warnings, cautions, or important notices that require attention. The amber color signals caution.
          </p>
        </div>

        <!-- Error Callout -->
        <div class="rounded-lg bg-red-50 p-4 text-sm text-red-800 border border-red-200">
          <p class="font-semibold mb-1">
            ❌ Error Callout
          </p>
          <p>
            Reserved for error messages, critical issues, or problems that need immediate attention. The red color indicates urgency.
          </p>
        </div>

        <!-- Neutral Callout -->
        <div class="rounded-lg bg-slate-50 p-4 text-sm text-slate-700 border border-slate-200">
          <p class="font-semibold mb-1">
            📝 Note Callout
          </p>
          <p>
            Neutral callout for general notes, documentation, or supplementary information. Uses a subtle gray color scheme.
          </p>
        </div>
      </div>
    </section>

    <!-- Buttons Section -->
    <section class="card space-y-4">
      <div>
        <p class="eyebrow">
          Buttons
        </p>
        <h2 class="section-title">
          Button Variants
        </h2>
        <p class="text-slate-600 text-sm mt-1">
          Button components using <code class="px-1 py-0.5 rounded bg-slate-100 text-xs">.btn</code> base class with variant modifiers.
        </p>
      </div>

      <div class="space-y-4">
        <div class="flex flex-wrap gap-3">
          <button type="button" class="btn btn-primary">
            Primary Button
          </button>
          <button type="button" class="btn btn-ghost">
            Ghost Button
          </button>
          <button type="button" class="btn bg-red-500 hover:bg-red-600 text-white">
            Custom Red
          </button>
          <button type="button" class="btn bg-emerald-500 hover:bg-emerald-600 text-white">
            Custom Green
          </button>
        </div>

        <div class="rounded-lg bg-slate-50 p-4 text-sm text-slate-700 space-y-2">
          <p class="font-semibold">
            Button Classes:
          </p>
          <ul class="list-disc list-inside space-y-1 text-xs">
            <li><code class="px-1 py-0.5 rounded bg-white text-xs">.btn</code> - Base button styles</li>
            <li><code class="px-1 py-0.5 rounded bg-white text-xs">.btn-primary</code> - Primary action button</li>
            <li><code class="px-1 py-0.5 rounded bg-white text-xs">.btn-ghost</code> - Subtle ghost button</li>
            <li>Custom colors can be applied with Tailwind utilities</li>
          </ul>
        </div>
      </div>
    </section>

    <!-- Badges & Tags Section -->
    <section class="card space-y-4">
      <div>
        <p class="eyebrow">
          Badges & Tags
        </p>
        <h2 class="section-title">
          Status Indicators
        </h2>
        <p class="text-slate-600 text-sm mt-1">
          Badges and tags for status, categories, and labels.
        </p>
      </div>

      <div class="space-y-4">
        <div>
          <p class="text-xs font-semibold text-slate-600 mb-2">
            Status Badges:
          </p>
          <div class="flex flex-wrap gap-2">
            <span class="badge" data-status="shipped">
              shipped
            </span>
            <span class="badge" data-status="in-progress">
              in-progress
            </span>
            <span class="badge" data-status="planned">
              planned
            </span>
          </div>
        </div>

        <div>
          <p class="text-xs font-semibold text-slate-600 mb-2">
            Tags:
          </p>
          <div class="flex flex-wrap gap-2">
            <span class="tag">
              Vue 3
            </span>
            <span class="tag">
              TypeScript
            </span>
            <span class="tag">
              Tailwind v4
            </span>
            <span class="tag">
              ViteSSG
            </span>
            <span class="tag">
              Pinia
            </span>
          </div>
        </div>

        <div>
          <p class="text-xs font-semibold text-slate-600 mb-2">
            Chips (Alternative style):
          </p>
          <div class="flex flex-wrap gap-2">
            <span class="chip">
              Component
            </span>
            <span class="chip">
              Utility
            </span>
            <span class="chip">
              Primitive
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- Code Examples Section -->
    <section class="card space-y-4">
      <div>
        <p class="eyebrow">
          Usage Examples
        </p>
        <h2 class="section-title">
          Code Snippets
        </h2>
        <p class="text-slate-600 text-sm mt-1">
          How to use these component primitives in your templates.
        </p>
      </div>

      <div class="space-y-4">
        <div class="rounded-lg bg-slate-50 p-4 text-sm text-slate-700 space-y-2">
          <p class="font-semibold">
            Header Pattern:
          </p>
          <pre class="overflow-x-auto text-xs"><code>&lt;header class="space-y-2"&gt;
  &lt;p class="eyebrow"&gt;Section Label&lt;/p&gt;
  &lt;h2 class="section-title"&gt;Main Title&lt;/h2&gt;
  &lt;p class="text-slate-700 text-base"&gt;Description&lt;/p&gt;
&lt;/header&gt;</code></pre>
        </div>

        <div class="rounded-lg bg-slate-50 p-4 text-sm text-slate-700 space-y-2">
          <p class="font-semibold">
            Card Component:
          </p>
          <pre class="overflow-x-auto text-xs"><code>&lt;article class="card space-y-3"&gt;
  &lt;h3 class="text-lg font-semibold"&gt;Card Title&lt;/h3&gt;
  &lt;p class="text-slate-700 text-sm"&gt;Card content&lt;/p&gt;
&lt;/article&gt;</code></pre>
        </div>

        <div class="rounded-lg bg-slate-50 p-4 text-sm text-slate-700 space-y-2">
          <p class="font-semibold">
            Callout:
          </p>
          <pre class="overflow-x-auto text-xs"><code>&lt;div class="rounded-lg bg-blue-50 p-4 text-sm text-blue-800 border border-blue-200"&gt;
  &lt;p class="font-semibold mb-1"&gt;💡 Info&lt;/p&gt;
  &lt;p&gt;Your message here&lt;/p&gt;
&lt;/div&gt;</code></pre>
        </div>
      </div>
    </section>

    <!-- Tailwind v4 Features -->
    <section class="card space-y-4">
      <div>
        <p class="eyebrow">
          Tailwind v4
        </p>
        <h2 class="section-title">
          Custom Theme Tokens
        </h2>
        <p class="text-slate-600 text-sm mt-1">
          This starter uses Tailwind v4's <code class="px-1 py-0.5 rounded bg-slate-100 text-xs">@theme</code> directive for custom design tokens.
        </p>
      </div>

      <div class="rounded-lg bg-slate-50 p-4 text-sm text-slate-700 space-y-2">
        <p class="font-semibold">
          Theme Configuration (src/styles/main.css):
        </p>
        <pre class="overflow-x-auto text-xs"><code>@theme {
  --color-primary: #2563EB;
  --color-surface: #f8fafc;
  --font-sans: "Rubik", system-ui, -apple-system, sans-serif;
}</code></pre>
        <p class="text-xs text-slate-500 mt-2">
          These tokens are available throughout your application via <code class="px-1 py-0.5 rounded bg-white text-xs">bg-primary</code>, <code class="px-1 py-0.5 rounded bg-white text-xs">text-primary</code>, and other Tailwind utilities.
        </p>
      </div>
    </section>
  </div>
</template>
