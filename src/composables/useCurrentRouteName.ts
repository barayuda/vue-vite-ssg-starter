/**
 * @module composables/useCurrentRouteName
 * @description Composable for tracking the current route name reactively.
 * Provides a reactive reference to the current route name that updates automatically on navigation.
 */

import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

/**
 * @function useCurrentRouteName
 * @description Returns a reactive reference to the current route name.
 * The value updates automatically when navigating to different routes.
 *
 * @returns {Ref<string>} Reactive reference to the current route name
 *
 * @example
 * ```typescript
 * const routeName = useCurrentRouteName()
 *
 * // Use in template
 * <div>Current route: {{ routeName }}</div>
 *
 * // Use in script
 * watch(routeName, (name) => {
 *   console.log('Navigated to:', name)
 * })
 * ```
 *
 * @remarks
 * - Watches the route name with `immediate: true` to get initial value
 * - Returns empty string if route has no name
 * - Automatically updates when route changes
 */
export function useCurrentRouteName() {
  const name = ref('')
  const route = useRoute()

  watch(
    () => route.name,
    async (v) => {
      name.value = v as string
    },
    {
      immediate: true,
    },
  )

  return name
}
