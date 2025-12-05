# Codebase Review & Improvement Recommendations

## Overview
This document outlines improvements to align the codebase with `.cursorrules` guidelines and best practices.

## ✅ What's Already Good

1. **Vue 3 Composition API**: Proper use of `<script setup>` throughout
2. **TypeScript**: Good type coverage in most files
3. **File Organization**: Clear structure with separated concerns
4. **Tailwind CSS**: Proper usage with mobile-first approach
5. **Functional Programming**: Mostly functional patterns

## 🔧 Improvements Needed

### 1. TypeScript: Prefer Interfaces Over Types

**Current Issues:**
- `type RequestState` in `src/stores/showcase.store.ts` should be an interface or const map
- `type Module` in `src/main.ts` could be an interface

**Recommendation:** Replace type aliases with interfaces where appropriate, or use const maps for union types.

### 2. Replace Enums with Maps

**Current Issue:**
- `NotificationType` object in `src/composables/useNotification.ts` should be a const map

**Recommendation:** Use const maps for better type safety and tree-shaking.

### 3. Leverage VueUse More

**Current Issues:**
- `useResponsive` manually handles window resize events - should use `useWindowSize` from VueUse
- `BackToTop` manually handles scroll events - should use `useWindowScroll` from VueUse
- `LazyImage` uses manual IntersectionObserver - could use `useIntersectionObserver` from VueUse

**Recommendation:** Replace manual event handling with VueUse composables for better reactivity and performance.

### 4. Use Function Keyword for Pure Functions

**Current Issue:**
- Some pure functions use arrow functions instead of `function` keyword

**Recommendation:** Use `function` keyword for pure functions to benefit from hoisting and clarity.

### 5. Improve Type Safety

**Current Issues:**
- `any` types in `useFetch.ts` (line 35)
- `any` types in `sanitize.module.ts` (line 74)
- Missing proper generic constraints

**Recommendation:** Replace `any` with proper types or `unknown` with type guards.

### 6. Add Suspense for Async Components

**Current Issue:**
- No Suspense wrappers for async components
- Missing fallback UI for loading states

**Recommendation:** Wrap async components in Suspense with proper fallback UI.

### 7. Dynamic Imports for Non-Critical Components

**Current Issue:**
- All components are statically imported in `App.vue`

**Recommendation:** Use dynamic imports for non-critical components like `BackToTop`, `ErrorBoundary`.

### 8. Convert LazyImage to Composition API

**Current Issue:**
- `LazyImage.vue` uses Options API instead of Composition API with `<script setup>`

**Recommendation:** Convert to `<script setup>` for consistency.

### 9. Improve Error Handling Types

**Current Issue:**
- Error types are not well-defined
- Missing proper error interfaces

**Recommendation:** Create proper error interfaces and use them consistently.

### 10. Optimize Bundle Size

**Current Issue:**
- No explicit code splitting strategy visible
- All routes use async import mode but could benefit from better chunking

**Recommendation:** Review and optimize chunk splitting in `vite.config.ts`.

## ✅ Completed Improvements

### High Priority (Completed)
- ✅ **Replace NotificationType with const map** - Converted to `as const` with proper type inference
- ✅ **Refactor useResponsive to use VueUse** - Now uses `useWindowSize` from VueUse
- ✅ **Refactor BackToTop to use VueUse** - Now uses `useWindowScroll` and `useScroll` from VueUse
- ✅ **Convert LazyImage to Composition API** - Converted from Options API to `<script setup>` with `useIntersectionObserver`
- ✅ **Replace `any` types with proper types** - Replaced `any` with `unknown` and proper interfaces in `useFetch` and `sanitize.module.ts`

### Medium Priority (Completed)
- ✅ **Replace type aliases with interfaces** - Converted `type Module` to `interface Module`, `type RequestState` to const map
- ✅ **Add Suspense wrappers** - Added Suspense wrapper for async `BackToTop` component
- ✅ **Use function keyword for pure functions** - Converted `delay` function to use `function` keyword
- ✅ **Add dynamic imports** - Added dynamic import for `BackToTop` component

## ✅ All Recommendations Completed

### Low Priority (Completed)
- ✅ **Optimize bundle splitting** - Added manual chunk splitting in `vite.config.ts` for better code splitting:
  - `vue-vendor`: Vue core libraries
  - `vueuse-vendor`: VueUse utilities
  - `ui-vendor`: UI-related libraries
  - `markdown-vendor`: Markdown processing libraries
- ✅ **Improve error type definitions** - Created comprehensive error interfaces in `src/types/errors.ts`:
  - `NetworkError`, `ApiError`, `UnknownError` interfaces
  - Type guards for error type checking
  - Factory functions for creating typed errors
  - Integrated into `useFetch` composable

## 🧪 Testing Setup (Vitest)

### Completed Setup
- ✅ **Vitest Configuration** - Created `vitest.config.ts` with Vue 3 support
- ✅ **Test Setup File** - Created `src/__tests__/setup.ts` with:
  - Happy DOM environment
  - Testing Library matchers
  - Mock setup for window APIs
- ✅ **Test Scripts** - Added to `package.json`:
  - `pnpm test` - Run tests in watch mode
  - `pnpm test:ui` - Run tests with UI
  - `pnpm test:run` - Run tests once
  - `pnpm test:coverage` - Run tests with coverage
- ✅ **Example Tests** - Created example test files:
  - `useNotification.test.ts` - Composable tests
  - `useResponsive.test.ts` - Responsive utility tests
  - `showcase.store.test.ts` - Pinia store tests
  - `errors.test.ts` - Error type tests

### Test Results
- ✅ All 29 tests passing
- ✅ 4 test files covering key functionality
- ✅ Proper mocking and test isolation

