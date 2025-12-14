/**
 * @module logic/dark
 * @description Dark mode logic using VueUse composables.
 * Provides reactive dark mode state and toggle function that persists to localStorage.
 */

import { useDark, useToggle } from '@vueuse/core'

/**
 * @constant isDark
 * @description Reactive reference to dark mode state.
 * Automatically syncs with system preference and localStorage.
 * @type {Ref<boolean>}
 *
 * @example
 * ```typescript
 * import { isDark } from '@/logic/dark'
 * // Use in template: <div :class="{ dark: isDark }">
 * ```
 */
export const isDark = useDark()

/**
 * @constant toggleDark
 * @description Function to toggle dark mode on/off.
 * Updates isDark state and persists to localStorage.
 * @type {() => boolean}
 *
 * @example
 * ```typescript
 * import { toggleDark } from '@/logic/dark'
 * // Call to toggle: toggleDark()
 * ```
 */
export const toggleDark = useToggle(isDark)
