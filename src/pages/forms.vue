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
import { reactive, ref, watch } from 'vue'
import { useFetch } from '/@/composables/useFetch'
import { useNotification } from '/@/composables/useNotification'

useHead({
  title: 'Forms Example · Vite SSG Starter',
  meta: [
    { name: 'description', content: 'Form handling patterns with validation, submission, and error handling.' },
  ],
})

const { success, error: notifyError } = useNotification()

// Form state
const form = reactive({
  name: '',
  email: '',
  message: '',
  newsletter: false,
})

// Validation errors
const errors = reactive({
  name: '',
  email: '',
  message: '',
})

// Form submission state
const isSubmitting = ref(false)

// Validation rules
function validateEmail(email: string): boolean {
  // Simple email validation - avoids regex backtracking issues
  const parts = email.split('@')
  if (parts.length !== 2)
    return false
  const [local, domain] = parts
  if (!local || !domain)
    return false
  return domain.includes('.') && local.length > 0 && domain.length > 0
}

function validateForm(): boolean {
  let isValid = true

  // Reset errors
  errors.name = ''
  errors.email = ''
  errors.message = ''

  // Validate name
  if (!form.name.trim()) {
    errors.name = 'Name is required'
    isValid = false
  }
  else if (form.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters'
    isValid = false
  }

  // Validate email
  if (!form.email.trim()) {
    errors.email = 'Email is required'
    isValid = false
  }
  else if (!validateEmail(form.email)) {
    errors.email = 'Please enter a valid email address'
    isValid = false
  }

  // Validate message
  if (!form.message.trim()) {
    errors.message = 'Message is required'
    isValid = false
  }
  else if (form.message.trim().length < 10) {
    errors.message = 'Message must be at least 10 characters'
    isValid = false
  }

  return isValid
}

// Form submission
async function handleSubmit() {
  if (!validateForm()) {
    notifyError('Please fix the errors in the form')
    return
  }

  isSubmitting.value = true

  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))

    // In a real app, you would use useFetch here:
    // const { data, isError } = useFetch('/api/contact', {
    //   method: 'POST',
    //   body: form
    // })

    success('Form submitted successfully!')

    // Reset form
    form.name = ''
    form.email = ''
    form.message = ''
    form.newsletter = false
  }
  catch {
    notifyError('Failed to submit form. Please try again.')
  }
  finally {
    isSubmitting.value = false
  }
}

// Example with useFetch - using a ref that changes to trigger fetch
const fetchUrl = ref('')
const formDataForFetch = reactive({
  title: '',
  body: '',
  userId: 1,
})

// useFetch will run when fetchUrl changes to a non-empty string
const { data: submitData, isLoading: isSubmittingFetch, isSuccess: isFetchSuccess } = useFetch(fetchUrl, {
  method: 'POST',
  body: formDataForFetch,
})

async function handleSubmitWithFetch() {
  if (!validateForm()) {
    notifyError('Please fix the errors in the form')
    return
  }

  // Update form data
  formDataForFetch.title = `Contact from ${form.name}`
  formDataForFetch.body = form.message
  formDataForFetch.userId = 1

  // Trigger fetch by setting URL (useFetch will automatically execute via watchEffect)
  // We use a timestamp to ensure it's treated as a new request
  fetchUrl.value = `https://jsonplaceholder.typicode.com/posts?t=${Date.now()}`

  // Wait for fetch to complete
  await new Promise<void>((resolve) => {
    const unwatch = watch(isSubmittingFetch, (loading) => {
      if (!loading) {
        unwatch()
        resolve()
      }
    })
  })

  if (isFetchSuccess.value && submitData.value) {
    success('Form submitted with useFetch!')
    form.name = ''
    form.email = ''
    form.message = ''
    form.newsletter = false
    // Reset URL to empty to prevent re-fetching
    fetchUrl.value = ''
  }
  else if (!isFetchSuccess.value) {
    notifyError('Failed to submit form. Please try again.')
    fetchUrl.value = ''
  }
}
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 py-12 space-y-10">
    <header class="space-y-2">
      <p class="eyebrow">
        Forms
      </p>
      <h1 class="text-3xl font-bold text-slate-900">
        Form handling patterns
      </h1>
      <p class="text-slate-700 text-base">
        Examples of form validation, submission, and error handling using Vue 3 Composition API.
      </p>
    </header>

    <!-- Basic Form Example -->
    <section class="card space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <p class="eyebrow">
            Contact Form
          </p>
          <h2 class="section-title">
            Validation and submission
          </h2>
          <p class="text-slate-600 text-sm mt-1">
            A complete form example with client-side validation and submission handling.
          </p>
        </div>
        <code class="px-2 py-1 rounded bg-slate-100 text-xs">src/pages/forms.vue</code>
      </div>

      <form class="space-y-5" @submit.prevent="handleSubmit">
        <!-- Name Field -->
        <div>
          <label for="name" class="block text-sm font-medium text-slate-700 mb-1">
            Name <span class="text-red-500">*</span>
          </label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            :class="errors.name ? 'border-red-500' : 'border-slate-300'"
            placeholder="Your name"
          >
          <p v-if="errors.name" class="mt-1 text-sm text-red-600">
            {{ errors.name }}
          </p>
        </div>

        <!-- Email Field -->
        <div>
          <label for="email" class="block text-sm font-medium text-slate-700 mb-1">
            Email <span class="text-red-500">*</span>
          </label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            :class="errors.email ? 'border-red-500' : 'border-slate-300'"
            placeholder="your@email.com"
          >
          <p v-if="errors.email" class="mt-1 text-sm text-red-600">
            {{ errors.email }}
          </p>
        </div>

        <!-- Message Field -->
        <div>
          <label for="message" class="block text-sm font-medium text-slate-700 mb-1">
            Message <span class="text-red-500">*</span>
          </label>
          <textarea
            id="message"
            v-model="form.message"
            rows="4"
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary resize-none"
            :class="errors.message ? 'border-red-500' : 'border-slate-300'"
            placeholder="Your message..."
          />
          <p v-if="errors.message" class="mt-1 text-sm text-red-600">
            {{ errors.message }}
          </p>
        </div>

        <!-- Newsletter Checkbox -->
        <div class="flex items-center gap-2">
          <input
            id="newsletter"
            v-model="form.newsletter"
            type="checkbox"
            class="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
          >
          <label for="newsletter" class="text-sm text-slate-700">
            Subscribe to newsletter
          </label>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          class="btn btn-primary w-full"
          :disabled="isSubmitting"
        >
          {{ isSubmitting ? 'Submitting...' : 'Submit Form' }}
        </button>
      </form>
    </section>

    <!-- Form with useFetch Example -->
    <section class="card space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <p class="eyebrow">
            useFetch Integration
          </p>
          <h2 class="section-title">
            Form submission with API calls
          </h2>
          <p class="text-slate-600 text-sm mt-1">
            Using the useFetch composable for form submission with automatic loading and error states.
          </p>
        </div>
        <code class="px-2 py-1 rounded bg-slate-100 text-xs">useFetch composable</code>
      </div>

      <form class="space-y-5" @submit.prevent="handleSubmitWithFetch">
        <div>
          <label for="fetch-name" class="block text-sm font-medium text-slate-700 mb-1">
            Name <span class="text-red-500">*</span>
          </label>
          <input
            id="fetch-name"
            v-model="form.name"
            type="text"
            class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            placeholder="Your name"
          >
        </div>

        <div>
          <label for="fetch-email" class="block text-sm font-medium text-slate-700 mb-1">
            Email <span class="text-red-500">*</span>
          </label>
          <input
            id="fetch-email"
            v-model="form.email"
            type="email"
            class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            placeholder="your@email.com"
          >
        </div>

        <div>
          <label for="fetch-message" class="block text-sm font-medium text-slate-700 mb-1">
            Message <span class="text-red-500">*</span>
          </label>
          <textarea
            id="fetch-message"
            v-model="form.message"
            rows="4"
            class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary resize-none"
            placeholder="Your message..."
          />
        </div>

        <button
          type="submit"
          class="btn btn-primary w-full"
          :disabled="isSubmittingFetch"
        >
          {{ isSubmittingFetch ? 'Submitting...' : 'Submit with useFetch' }}
        </button>
      </form>
    </section>

    <!-- Code Examples -->
    <section class="card space-y-4">
      <div>
        <p class="eyebrow">
          Code Examples
        </p>
        <h2 class="section-title">
          Form validation pattern
        </h2>
      </div>

      <div class="rounded-lg bg-slate-50 p-4 text-sm text-slate-700 space-y-4">
        <div>
          <p class="font-semibold mb-2">
            Basic validation:
          </p>
          <pre class="overflow-x-auto"><code>function validateForm() {
  const errors = {}

  if (!form.name.trim()) {
    errors.name = 'Name is required'
  }

  if (!validateEmail(form.email)) {
    errors.email = 'Invalid email'
  }

  return Object.keys(errors).length === 0
}</code></pre>
        </div>

        <div>
          <p class="font-semibold mb-2">
            Form submission with useFetch:
          </p>
          <pre class="overflow-x-auto"><code>const { data, isLoading, execute } = useFetch('/api/contact', {
  method: 'POST',
  body: formData,
}, { immediate: false })

async function handleSubmit() {
  if (validateForm()) {
    await execute()
    if (data.value) {
      success('Form submitted!')
    }
  }
}</code></pre>
        </div>
      </div>
    </section>
  </div>
</template>
