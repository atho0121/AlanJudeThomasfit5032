<script setup>
import { reactive, ref } from 'vue'

const form = reactive({
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: ''
})

const errors = reactive({})

const submitted = ref(false)

function validateForm() {

  Object.keys(errors).forEach(key => {
    delete errors[key]
  })

  let valid = true

  // Required field validation
  if (!form.name.trim()) {
    errors.name = 'Name is required.'
    valid = false
  } else if (form.name.trim().length < 2) {
    errors.name = 'Name must contain at least 2 characters.'
    valid = false
  }

  // Email format validation
  const emailPattern =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!form.email.trim()) {
    errors.email = 'Email address is required.'
    valid = false
  } else if (!emailPattern.test(form.email)) {
    errors.email = 'Please enter a valid email address.'
    valid = false
  }

  // Phone validation
  // Pattern only checks allowed characters — it doesn't guarantee
  // any digits are present (e.g. "--------" would pass). Adding an
  // explicit digit-count check closes that gap.
  const phonePattern =
    /^[0-9\s()+-]{8,15}$/

  const phoneDigitCount = form.phone.replace(/\D/g, '').length

  if (!form.phone.trim()) {
    errors.phone = 'Phone number is required.'
    valid = false
  } else if (!phonePattern.test(form.phone)) {
    errors.phone = 'Please enter a valid phone number.'
    valid = false
  } else if (phoneDigitCount < 8) {
    errors.phone = 'Phone number must contain at least 8 digits.'
    valid = false
  }

  // Subject length validation
  if (!form.subject.trim()) {
    errors.subject = 'Subject is required.'
    valid = false
  } else if (form.subject.trim().length < 5) {
    errors.subject =
      'Subject must contain at least 5 characters.'
    valid = false
  }

  // Message length validation
  if (!form.message.trim()) {
    errors.message = 'Message is required.'
    valid = false
  } else if (form.message.trim().length < 20) {
    errors.message =
      'Message must contain at least 20 characters.'
    valid = false
  }

  return valid
}

function submitForm() {

  submitted.value = false

  if (!validateForm()) {
    return
  }

  submitted.value = true

  console.log('Submitted form:', {
    ...form
  })
}
</script>

<template>

  <section class="page-header">

    <div class="container">

      <span class="eyebrow">
        Join the movement
      </span>

      <h1>Get Involved</h1>

      <p>
        Have a question or want to volunteer?
        We'd love to hear from you.
      </p>

    </div>

  </section>


  <section class="section">

    <div class="container contact-layout">

      <div class="contact-information">

        <span class="eyebrow">
          Contact us
        </span>

        <h2>
          Help grow a greener Melbourne.
        </h2>

        <p>
          Whether you want to volunteer, start a community
          project or simply learn more, get in touch with
          the Canopy Collective team.
        </p>

        <div class="contact-item">
          <strong>Email</strong>
          <span>hello@canopycollective.org</span>
        </div>

        <div class="contact-item">
          <strong>Location</strong>
          <span>Melbourne, Victoria</span>
        </div>

      </div>


      <form
        class="contact-form"
        novalidate
        @submit.prevent="submitForm"
      >

        <div
          v-if="submitted"
          class="success-message"
          role="alert"
        >
          Thank you! Your message has been submitted
          successfully.
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

          <label for="phone">
            Phone number *
          </label>

          <input
            id="phone"
            v-model="form.phone"
            type="tel"
            autocomplete="tel"
            placeholder="04XX XXX XXX"
            :aria-invalid="Boolean(errors.phone)"
            :aria-describedby="errors.phone ? 'phone-error' : undefined"
          />

          <small
            v-if="errors.phone"
            id="phone-error"
            class="error-message"
          >
            {{ errors.phone }}
          </small>

        </div>


        <div class="form-group">

          <label for="subject">
            Subject *
          </label>

          <input
            id="subject"
            v-model="form.subject"
            type="text"
            :aria-invalid="Boolean(errors.subject)"
            :aria-describedby="errors.subject ? 'subject-error' : undefined"
          />

          <small
            v-if="errors.subject"
            id="subject-error"
            class="error-message"
          >
            {{ errors.subject }}
          </small>

        </div>


        <div class="form-group">

          <label for="message">
            Message *
          </label>

          <textarea
            id="message"
            v-model="form.message"
            rows="6"
            maxlength="500"
            :aria-invalid="Boolean(errors.message)"
            :aria-describedby="errors.message ? 'message-error' : undefined"
          ></textarea>

          <div class="character-count">
            {{ form.message.length }} / 500
          </div>

          <small
            v-if="errors.message"
            id="message-error"
            class="error-message"
          >
            {{ errors.message }}
          </small>

        </div>


        <button
          type="submit"
          class="primary-button submit-button"
        >
          Send Message
        </button>

      </form>

    </div>

  </section>

</template>