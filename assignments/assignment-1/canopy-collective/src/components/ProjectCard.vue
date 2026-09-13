<script setup>
import { computed } from 'vue'
import { useAuth } from '../stores/auth'
import { useRatings } from '../stores/ratings'
import StarRating from './StarRating.vue'

const props = defineProps({
  project: {
    type: Object,
    required: true
  }
})

const { isLoggedIn } = useAuth()
const { submitRating, getAverage, getCount, getUserRating } = useRatings()

// Falls back to 'unknown' if status is missing or not a string,
// so the card degrades gracefully instead of throwing.
const statusClass = computed(() => {
  return typeof props.project.status === 'string'
    ? props.project.status.toLowerCase()
    : 'unknown'
})

const statusLabel = computed(() => {
  return props.project.status || 'Unknown'
})

const average = computed(() => getAverage(props.project.id))
const count = computed(() => getCount(props.project.id))
const userRating = computed(() => getUserRating(props.project.id))

function handleRate(value) {
  try {
    submitRating(props.project.id, value)
  } catch (error) {
    
    console.error(error.message)
  }
}
</script>

<template>
  <article class="project-card">

    <div class="project-header">

      <span
        class="status"
        :class="statusClass"
      >
        {{ statusLabel }}
      </span>

      <span class="project-location">
        {{ project.suburb }}
      </span>

    </div>

    <h3>{{ project.title }}</h3>

    <p>
      {{ project.description }}
    </p>

    <div class="project-statistics">

      <div>
        <strong>{{ project.treesPlanted }}</strong>
        <span>Trees</span>
      </div>

      <div>
        <strong>{{ project.volunteers }}</strong>
        <span>Volunteers</span>
      </div>

    </div>

    <div class="project-rating">

      <StarRating
        :average="average"
        :count="count"
      />

      <div v-if="isLoggedIn" class="rate-this">
        <span class="rate-label">Your rating:</span>

        <StarRating
          :model-value="userRating"
          interactive
          @update:model-value="handleRate"
        />
      </div>

      <p v-else class="rate-login-hint">
        <RouterLink to="/login">Log in</RouterLink> to rate this project.
      </p>

    </div>

  </article>
</template>