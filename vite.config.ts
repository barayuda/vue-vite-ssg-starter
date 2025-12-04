import type { ConfigEnv, UserConfig } from 'vite'
import fs from 'node:fs'
import { resolve } from 'node:path'

import tailwindcss from '@tailwindcss/vite'
import Vue from '@vitejs/plugin-vue'
import dotenv from 'dotenv' // Dotenv is a zero-dependency module that extracts the variables in the env variable from the '.env*' file
import matter from 'gray-matter'
import Prism from 'markdown-it-prism'
import Markdown from 'unplugin-vue-markdown/vite'
import { defineConfig } from 'vite'

import viteCompression from 'vite-plugin-compression'
import Pages from 'vite-plugin-pages'
import generateSitemap from 'vite-plugin-pages-sitemap'
import vueDevTools from 'vite-plugin-vue-devtools'
import Layouts from 'vite-plugin-vue-layouts'

import { moveStaticHtmlPlugin } from './plugins'

interface ViteSSGConfig extends UserConfig {
  ssgOptions?: {
    script?: string
    beastiesOptions?: {
      preload?: string
    }
  }
}

const baseConfig: ViteSSGConfig = {
  plugins: [
    Vue({ include: [/\.vue$/, /\.md$/] }),

    // https://github.com/hannoeru/vite-plugin-pages
    Pages({
      extensions: ['vue', 'md'],
      dirs: './src/pages',
      routeStyle: 'nuxt',
      importMode: 'async',
      importPath: 'absolute',
      onRoutesGenerated: (routes) => {
        const sitemapRoutes = routes.filter(route => route.meta?.prerendered !== false)
        // eslint-disable-next-line node/prefer-global/process
        const baseUrl = process.env.VITE_APP_BASE_URL || 'http://localhost:5173'
        generateSitemap({
          routes: sitemapRoutes,
          hostname: baseUrl,
          changefreq: 'weekly',
          priority: 0.8,
          nuxtStyle: true,
          lastmod: new Date(),
        })
        return routes
      },
      extendRoute(route) {
        // Only process markdown files for frontmatter
        if (route.component.endsWith('.md')) {
          const path = resolve(__dirname, route.component.slice(1))
          const md = fs.readFileSync(path, 'utf-8')
          const { data } = matter(md)
          route.meta = Object.assign(route.meta || {}, { frontmatter: data })
        }

        return route
      },
    }),

    // https://github.com/JohnCampionJr/vite-plugin-vue-layouts
    Layouts(),

    // https://github.com/unplugin/unplugin-vue-markdown
    Markdown({
      wrapperClasses: 'prose prose-sm m-auto text-left',
      headEnabled: true,
      markdownItSetup(md) {
        // https://prismjs.com/
        md.use(Prism)
      },
    }),

    // tailwindcss
    tailwindcss(),

    // https://github.com/anncwb/vite-plugin-compression/blob/main/README.zh_CN.md
    viteCompression(),

    // Devtools
    vueDevTools(),
  ],
  ssgOptions: {
    script: 'async',
    beastiesOptions: {
      // E.g., change the preload strategy
      preload: 'media',
      // Other options: https://github.com/danielroe/beasties#usage
    },
  },
  resolve: {
    alias: [
      {
        find: '/@',
        replacement: resolve(__dirname, './src'),
      },
    ],
  },
  css: {
    modules: {
      localsConvention: 'camelCaseOnly',
    },
  },
  optimizeDeps: {
    include: [],
    exclude: [],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Only apply manual chunks for client builds, not SSR
          if (id.includes('node_modules')) {
            if (id.includes('vue') || id.includes('vue-router') || id.includes('pinia')) {
              return 'vue-vendor'
            }
            if (id.includes('@vueuse')) {
              return 'vueuse-vendor'
            }
            if (id.includes('@unhead')) {
              return 'ui-vendor'
            }
            if (id.includes('unplugin-vue-markdown') || id.includes('markdown-it-prism') || id.includes('gray-matter')) {
              return 'markdown-vendor'
            }
          }
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    chunkSizeWarningLimit: 1000,
  },
}

export default ({ command, mode }: ConfigEnv) => {
  /**
   * Such as:
   * import.meta.env.MODE: {string}       The mode of the app runtime.
   * import.meta.env.BASE_URL: {string}   The base URL for deploying the app. This is determined by the base configuration entry.
   * import.meta.env.PROD: {boolean}      Whether the app is runtime in the production environment.
   * import.meta.env.DEV: {boolean}       Whether app runtime is in the development environment (always the opposite of import.meta.env.PROD).
   */
  const { VITE_APP_ENV, VITE_APP_PROXY_URL, VITE_APP_BASE_URL } = dotenv.parse(fs.readFileSync(`.env.${mode}`))

  setTimeout(() => {
    console.log()
    console.log('\x1B[36m%s\x1B[0m', `🏠--APP Environment(VITE_APP_ENV): ${VITE_APP_ENV}`)
    console.log('\x1B[36m%s\x1B[0m', `😈--APP Proxy URL(VITE_APP_PROXY_URL): ${VITE_APP_PROXY_URL}`)
    console.log('\x1B[36m%s\x1B[0m', `🔗--APP Base URL(VITE_APP_BASE_URL): ${VITE_APP_BASE_URL}`)
    console.log()
  }, 66)

  // Return base config for serve/build, test config is in vitest.config.ts
  if (command === 'serve') {
    return defineConfig({ ...baseConfig })
  }
  else {
    return defineConfig({
      ...baseConfig,
      plugins: [
        ...(baseConfig.plugins || []),
        moveStaticHtmlPlugin(),
      ],
    })
  }
}
