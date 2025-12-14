/**
 * @module vite.config
 * @description Vite configuration for Vue 3 SSG application.
 * Configures plugins, build options, server settings, and environment variables.
 * Supports both development server with API proxying and static site generation builds.
 */

import type { IncomingMessage, ServerResponse } from 'node:http'
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

import { validateEnvironmentVariables } from './plugins/_shared/env-security.js'
import { moveStaticHtmlPlugin, viteSSGEnsureDynamicRoutes } from './plugins/index.js'
import { apiMiddlewarePlugin } from './plugins/vite-api-middleware/index.js'
import { getGuideSlugsSync } from './plugins/vite-ssg-dynamic-routes/index.js'

/**
 * @interface ViteSSGConfig
 * @extends UserConfig
 * @description Extended Vite configuration with SSG-specific options.
 */
interface ViteSSGConfig extends UserConfig {
  /** SSG-specific configuration options */
  ssgOptions?: {
    /** Script loading strategy */
    script?: string
    /** Beasties (resource hints) configuration */
    beastiesOptions?: {
      /** Preload strategy for resources */
      preload?: string
    }
  }
}

/**
 * @constant baseConfig
 * @description Base Vite configuration shared between development and production builds.
 * Includes all plugins, aliases, and build optimizations.
 */
// Base config - Pages plugin will be configured per-command
const baseConfig: ViteSSGConfig = {
  plugins: [
    Vue({ include: [/\.vue$/, /\.md$/] }),
    // Pages plugin is added per-command to access cached guide slugs

    // https://github.com/JohnCampionJr/vite-plugin-vue-layouts
    Layouts(),

    // https://github.com/unplugin/unplugin-vue-markdown
    Markdown({
      wrapperClasses: 'prose prose-slate max-w-none',
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
      {
        find: '@plugins',
        replacement: resolve(__dirname, './plugins'),
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
    exclude: ['vite-plugin-ssg-dynamic-routes'],
  },
  ssr: {
    noExternal: [],
    // Externalize plugin modules - they should only run in Node.js context
    // This prevents Vite from trying to bundle Node.js modules for the browser
    external: [
      'vite-plugin-ssg-dynamic-routes',
      /^plugins\/vite-ssg-dynamic-routes/,
    ],
  },
  build: {
    rollupOptions: {
      external: (id) => {
        // Mark plugin files as external - they should only run in Node.js context
        if (id.includes('vite-plugin-ssg-dynamic-routes')) {
          return true
        }
        return false
      },
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

/**
 * @function default
 * @description Main Vite configuration function that returns different configs for serve/build commands.
 * Loads environment variables, configures server with proxy/middleware for development,
 * and applies build optimizations for production.
 *
 * @param {ConfigEnv} config - Vite configuration environment
 * @param {'serve' | 'build'} config.command - Current command (serve or build)
 * @param {string} config.mode - Current mode (development, production, etc.)
 * @returns {UserConfig} Vite configuration object
 *
 * @example
 * ```typescript
 * // Environment variables available:
 * // import.meta.env.MODE: {string} - The mode of the app runtime
 * // import.meta.env.BASE_URL: {string} - The base URL for deploying the app
 * // import.meta.env.PROD: {boolean} - Whether app is in production
 * // import.meta.env.DEV: {boolean} - Whether app is in development
 * ```
 *
 * @remarks
 * - Loads environment variables from `.env.${mode}` file
 * - Development server includes API proxy and middleware
 * - Production build includes static HTML movement plugin
 * - Validates environment variables for security
 */
export default ({ command, mode }: ConfigEnv) => {
  const envFile = `.env.${mode}`
  const envExists = fs.existsSync(envFile)
  const envVars = envExists ? dotenv.parse(fs.readFileSync(envFile)) : {}
  const {
    VITE_APP_ENV,
    VITE_APP_PROXY_URL,
    VITE_APP_BASE_URL,
    VITE_API_TARGET,
    VITE_API_WS_TARGET,
    VITE_API_ENABLE_LOGGING = 'true',
    VITE_API_ENABLE_CORS = 'true',
    VITE_API_RATE_LIMIT_ENABLED = 'true',
    VITE_API_RATE_LIMIT_MAX = '100',
    VITE_API_RATE_LIMIT_WINDOW = '60000',
  } = envVars

  // Cache guide slugs once at config level to avoid repeated calls in extendRoute
  // Only fetch during build to avoid unnecessary work in dev
  const cachedGuideSlugs: string[] | null = command === 'build' ? getGuideSlugsSync() : null

  // Create Pages plugin with optimized extendRoute hook
  const pagesPlugin = Pages({
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
      // Transform [param] syntax to :param for Vue Router compatibility
      if (route.path.includes('[') && route.path.includes(']')) {
        route.path = route.path.replace(/\[([^\]]+)\]/g, ':$1')
      }

      // Only process markdown files for frontmatter
      if (route.component.endsWith('.md')) {
        try {
          let filePath = route.component
          if (filePath.startsWith('/')) {
            filePath = filePath.slice(1)
          }
          if (!filePath.startsWith('src/')) {
            filePath = `src/${filePath}`
          }
          const fullPath = resolve(__dirname, filePath)
          // Quick exists check before expensive readFileSync
          if (fs.existsSync(fullPath)) {
            const md = fs.readFileSync(fullPath, 'utf-8')
            const { data } = matter(md)
            route.meta = Object.assign(route.meta || {}, { frontmatter: data })
          }
        }
        catch {
          // Silently fail - frontmatter is optional
        }
      }

      // Enable pre-rendering for dynamic guide routes (build-only)
      // Use cached guide slugs to avoid repeated calls
      const isDynamicGuideRoute = route.path.includes('/guides/:slug')
        || route.path.includes('/guides/[slug]')
        || route.path === '/guides/:slug'
        || route.path === '/guides/[slug]'

      if (isDynamicGuideRoute && cachedGuideSlugs && cachedGuideSlugs.length > 0) {
        route.meta = route.meta || {}
        route.meta.prerendered = true
        route.meta.guideSlugs = cachedGuideSlugs
      }

      return route
    },
  })

  // Validate environment variables for security issues
  // Only validate in production builds to avoid performance impact in development
  if (command === 'build' && mode === 'production') {
    try {
      validateEnvironmentVariables({
        strict: true,
        logWarnings: false, // Don't log in production, just fail
      })
    }
    catch (error) {
      console.error('\x1B[31m%s\x1B[0m', '❌ Environment variable security check failed!')
      throw error
    }
  }
  // In development, validate but don't fail (async to avoid blocking)
  else if (command === 'serve') {
    // Defer validation to avoid blocking server startup
    setImmediate(() => {
      validateEnvironmentVariables({
        strict: false,
        logWarnings: true,
      })
    })
  }

  // Log environment info (removed setTimeout delay for faster startup)
  console.log()
  console.log('\x1B[36m%s\x1B[0m', `🏠--APP Environment(VITE_APP_ENV): ${VITE_APP_ENV || 'not set'}`)
  console.log('\x1B[36m%s\x1B[0m', `😈--APP Proxy URL(VITE_APP_PROXY_URL): ${VITE_APP_PROXY_URL || 'not set'}`)
  console.log('\x1B[36m%s\x1B[0m', `🔗--APP Base URL(VITE_APP_BASE_URL): ${VITE_APP_BASE_URL || 'not set'}`)
  if (VITE_API_TARGET) {
    console.log('\x1B[36m%s\x1B[0m', `🌐--API Target: ${VITE_API_TARGET}`)
  }
  if (VITE_API_WS_TARGET) {
    console.log('\x1B[36m%s\x1B[0m', `🔌--WebSocket Target: ${VITE_API_WS_TARGET}`)
  }
  console.log()

  // Configure server with proxy and middleware for development
  const serverConfig: UserConfig['server'] = command === 'serve'
    ? {
        host: true,
        port: 5173,
        strictPort: false,
        // Enable CORS for all requests
        cors: VITE_API_ENABLE_CORS === 'true',
        // Proxy configuration for API requests
        proxy: VITE_API_TARGET
          ? {
              // RESTful API proxy
              '/api': {
                target: VITE_API_TARGET,
                changeOrigin: true,
                secure: false, // Set to true if using HTTPS
                rewrite: (path) => {
                  // Remove /api prefix if backend doesn't expect it
                  // Uncomment the line below if your backend doesn't use /api prefix
                  // return path.replace(/^\/api/, '')
                  return path
                },
                configure: (proxy, _options) => {
                  // Request logging
                  proxy.on('proxyReq', (proxyReq, req) => {
                    if (VITE_API_ENABLE_LOGGING === 'true') {
                      const method = req.method || 'GET'
                      const url = req.url || ''
                      console.log(`[Proxy] ${method} ${url} -> ${VITE_API_TARGET}${url}`)
                    }
                  })

                  // Response logging
                  proxy.on('proxyRes', (proxyRes, req) => {
                    if (VITE_API_ENABLE_LOGGING === 'true') {
                      const method = req.method || 'GET'
                      const url = req.url || ''
                      const statusCode = proxyRes.statusCode || 200
                      const statusColor = statusCode >= 500
                        ? '\x1B[31m' // Red
                        : statusCode >= 400
                          ? '\x1B[33m' // Yellow
                          : statusCode >= 300
                            ? '\x1B[36m' // Cyan
                            : '\x1B[32m' // Green

                      console.log(
                        `${statusColor}[Proxy Response] ${method} ${url} ${statusCode}\x1B[0m`,
                      )
                    }
                  })

                  // Error handling
                  proxy.on('error', (err, req) => {
                    console.error('[Proxy Error]', {
                      message: err.message,
                      url: req.url,
                      timestamp: new Date().toISOString(),
                    })
                  })
                },
                // Custom headers
                headers: {
                  'X-Forwarded-Host': 'localhost:5173',
                  'X-Forwarded-Proto': 'http',
                },
              },
              // WebSocket proxy (if WebSocket target is configured)
              ...(VITE_API_WS_TARGET
                ? {
                    '/ws': {
                      target: VITE_API_WS_TARGET,
                      ws: true, // Enable WebSocket proxying
                      changeOrigin: true,
                      secure: false,
                      configure: (proxy) => {
                        proxy.on('error', (err) => {
                          console.error('[WebSocket Proxy Error]', {
                            message: err.message,
                            timestamp: new Date().toISOString(),
                          })
                        })

                        proxy.on('open', () => {
                          if (VITE_API_ENABLE_LOGGING === 'true') {
                            console.log('[WebSocket] Connection opened')
                          }
                        })

                        proxy.on('close', () => {
                          if (VITE_API_ENABLE_LOGGING === 'true') {
                            console.log('[WebSocket] Connection closed')
                          }
                        })
                      },
                    },
                  }
                : {}),
            }
          : undefined,
        // Custom middleware for API handling
        middlewareMode: false,
      }
    : undefined

  // Custom API routes handler
  const customApiRoutes: Record<string, (req: IncomingMessage, res: ServerResponse) => void> = {
    // Example custom route handler
    '/api/health': (req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: VITE_APP_ENV || 'development',
      }))
    },
    // Add more custom routes here
    // '/api/custom-endpoint': (req, res) => { ... }
  }

  // Rate limiting configuration
  const rateLimitConfig = VITE_API_RATE_LIMIT_ENABLED === 'true'
    ? {
        maxRequests: Number.parseInt(VITE_API_RATE_LIMIT_MAX, 10) || 100,
        windowMs: Number.parseInt(VITE_API_RATE_LIMIT_WINDOW, 10) || 60000,
        skip: ['/api/health'], // Skip rate limiting for health checks
      }
    : false

  // Return base config for serve/build, test config is in vitest.config.ts
  if (command === 'serve') {
    return defineConfig({
      ...baseConfig,
      plugins: [
        ...(baseConfig.plugins || []),
        // Add configured Pages plugin with cached guide slugs
        pagesPlugin,
        // Add API middleware plugin for development only
        apiMiddlewarePlugin({
          enableLogging: VITE_API_ENABLE_LOGGING === 'true',
          enableCors: VITE_API_ENABLE_CORS === 'true',
          customRoutes: customApiRoutes,
          rateLimit: rateLimitConfig,
        }),
      ],
      server: serverConfig,
    })
  }
  else {
    // Build-only plugins
    return defineConfig({
      ...baseConfig,
      plugins: [
        ...(baseConfig.plugins || []),
        // Add configured Pages plugin with cached guide slugs
        pagesPlugin,
        // Ensure dynamic routes are available during build
        viteSSGEnsureDynamicRoutes(),
        // Move static HTML files after build
        moveStaticHtmlPlugin(),
      ],
    })
  }
}
