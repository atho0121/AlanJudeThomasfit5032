<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../stores/auth'

const router = useRouter()
const { register } = useAuth()

const form = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const errors = reactive({})
const serverError = ref('')
const submitting = ref(false)

function validateForm() {

  Object.keys(errors).forEach(key => {
    delete errors[key]
  })

  let valid = true

  if (!form.name.trim()) {
    errors.name = 'Name is required.'
    valid = false
  } else if (form.name.trim().length < 2) {
    errors.name = 'Name must contain at least 2 characters.'
    valid = false
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!form.email.trim()) {
    errors.email = 'Email address is required.'
    valid = false
  } else if (!emailPattern.test(form.email)) {
    errors.email = 'Please enter a valid email address.'
    valid = false
  }


  const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/

  if (!form.password) {
    errors.password = 'Password is required.'
    valid = false
  } else if (!passwordPattern.test(form.password)) {
    errors.password =
      'Password must be at least 8 characters and include a letter and a number.'
    valid = false
  }

  if (form.confirmPassword !== form.password) {
    errors.confirmPassword = 'Passwords do not match.'
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
    await register({
      name: form.name,
      email: form.email,
      password: form.password
    })

    router.push('/login')
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
        Join us
      </span>

      <h1>Create an Account</h1>

      <p>
        Register to rate projects and get involved with
        Canopy Collective.
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

          <label for="name">
            Full name *
          </label>

          <input
            id="name"
            v-model="form.name"
            type="text"
            autocomplete="name"
            :aria-invalid="Boolean(errors.name)"
            :aria-describedby="errors.name ? 'name-error' : undefined"
          />

          <small
            v-if="errors.name"
            id="name-error"
            class="error-message"
          >
            {{ errors.name }}
          </small>

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
            autocomplete="new-password"
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


        <div class="form-group">

          <label for="confirmPassword">
            Confirm password *
          </label>

          <input
            id="confirmPassword"
            v-model="form.confirmPassword"
            type="password"
            autocomplete="new-password"
            :aria-invalid="Boolean(errors.confirmPassword)"
            :aria-describedby="errors.confirmPassword ? 'confirm-password-error' : undefined"
          />

          <small
            v-if="errors.confirmPassword"
            id="confirm-password-error"
            class="error-message"
          >
            {{ errors.confirmPassword }}
          </small>

        </div>


        <button
          type="submit"
          class="primary-button submit-button"
          :disabled="submitting"
        >
          {{ submitting ? 'Creating account...' : 'Create Account' }}
        </button>

        <p class="auth-switch">
          Already have an account?
          <RouterLink to="/login">Log in</RouterLink>
        </p>

      </form>

    </div>

  </section>

</template>