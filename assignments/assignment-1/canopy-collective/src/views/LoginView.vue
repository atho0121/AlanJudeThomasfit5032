<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../stores/auth'

const router = useRouter()
const { login } = useAuth()

const form = reactive({
  email: '',
  password: ''
})

const errors = reactive({})
const serverError = ref('')
const submitting = ref(false)

function validateForm() {

  Object.keys(errors).forEach(key => {
    delete errors[key]
  })

  let valid = true

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!form.email.trim()) {
    errors.email = 'Email address is required.'
    valid = false
  } else if (!emailPattern.test(form.email)) {
    errors.email = 'Please enter a valid email address.'
    valid = false
  }

  if (!form.password) {
    errors.password = 'Password is required.'
    valid = false
  }

  return valid
}

async function submitForm() {
  serverError.value = ''

  if (!validateForm()) {
    return
  }

  submitting.value = true

  try {
    await login({
      email: form.email,
      password: form.password
    })

    router.push('/')
  } catch (error) {
   
    serverError.value = error.message
  } finally {
    submitting.value = false
  }
}
</script>

<template>

  <section class="page-header">

    <div class="container">

      <span class="eyebrow">
        Welcome back
      </span>

      <h1>Log In</h1>

      <p>
        Log in to rate projects and manage your account.
      </p>

    </div>

  </section>


  <section class="section">

    <div class="container auth-layout">

      <form
        class="auth-form"
        novalidate
        @submit.prevent="submitForm"
      >

        <div
          v-if="serverError"
          class="error-message-box"
          role="alert"
        >
          {{ serverError }}
        </div>


        <div class="form-group">

          <label for="email">
            Email address *
          </label>

          <input
            id="email"
            v-model="form.email"
            type="email"
            autocomplete="email"
            :aria-invalid="Boolean(errors.email)"
            :aria-describedby="errors.email ? 'email-error' : undefined"
          />

          <small
            v-if="errors.email"
            id="email-error"
            class="error-message"
          >
            {{ errors.email }}
          </small>

        </div>


        <div class="form-group">

          <label for="password">
            Password *
          </label>

          <input
            id="password"
            v-model="form.password"
            type="password"
            autocomplete="current-password"
            :aria-invalid="Boolean(errors.password)"
            :aria-describedby="errors.password ? 'password-error' : undefined"
          />

          <small
            v-if="errors.password"
            id="password-error"
            class="error-message"
          >
            {{ errors.password }}
          </small>

        </div>


        <button
          type="submit"
          class="primary-button submit-button"
          :disabled="submitting"
        >
          {{ submitting ? 'Logging in...' : 'Log In' }}
        </button>

        <p class="auth-switch">
          Don't have an account?
          <RouterLink to="/register">Register</RouterLink>
        </p>

        <p class="auth-hint">
          Demo admin login: admin@canopycollective.org / Admin123!
        </p>

      </form>

    </div>

  </section>

</template>