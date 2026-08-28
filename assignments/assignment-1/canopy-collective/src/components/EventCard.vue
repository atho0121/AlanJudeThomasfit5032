<script setup>
import { computed } from 'vue'

const props = defineProps({
  event: {
    type: Object,
    required: true
  }
})

// Guards against capacity being 0 or missing 
const fillPercentage = computed(() => {
  if (!props.event.capacity) return 0
  return (props.event.registered / props.event.capacity) * 100
})

// never shows a negative number
// if registered ever exceeds capacity in the data
const spotsLeft = computed(() => {
  return Math.max(props.event.capacity - props.event.registered, 0)
})
</script>

<template>
  <article class="event-card">

    <div class="event-category">
      {{ event.category }}
    </div>

    <h3>{{ event.title }}</h3>

    <p class="event-description">
      {{ event.description }}
    </p>

    <div class="event-details">

      <div>
        <strong>Date</strong>
        <span>{{ event.date }}</span>
      </div>

      <div>
        <strong>Time</strong>
        <span>{{ event.time }}</span>
      </div>

      <div>
        <strong>Location</strong>
        <span>{{ event.location }}</span>
      </div>

    </div>

    <div class="capacity">

      <div class="capacity-label">
        <span>Registrations</span>

        <span>
          {{ event.registered }} / {{ event.capacity }}
        </span>
      </div>

      <div class="progress">
        <div
          class="progress-bar"
          :style="{ width: `${fillPercentage}%` }"
        ></div>
      </div>

      <div class="spots-left">
        <span v-if="spotsLeft > 0">
          {{ spotsLeft }} spot{{ spotsLeft === 1 ? '' : 's' }} left
        </span>
        <span v-else class="full">
          Fully booked
        </span>
      </div>

    </div>

    <!--
      Intentionally no @click handler yet — there's no event detail
      
    -->
    <button class="secondary-button">
      View Event
    </button>

  </article>
</template>