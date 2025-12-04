<route>
{
  meta: {
    subfolder: false,
    prerendered: false,
  }
}
</route>

<template>
  <div class="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
    <p class="eyebrow">
      Not found
    </p>
    <h1 class="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
      This page does not exist.
    </h1>
    <p class="text-slate-600 max-w-xl mb-6">
      The route you tried to open is missing. Head back to the starter home or browse the guides.
    </p>
    <div class="flex gap-3">
      <router-link to="/" class="btn btn-primary">
        Home
      </router-link>
      <router-link to="/guides" class="btn btn-ghost">
        Guides
      </router-link>
    </div>
  </div>
</template>
