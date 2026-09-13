<script setup>
import { computed } from 'vue'

const props = defineProps({
  // Used in interactive mode — the current user's own rating (0 = none yet)
  modelValue: {
    type: Number,
    default: 0
  },
  // Used in read-only display mode — the aggregated average across all users
  average: {
    type: Number,
    default: null
  },
  count: {
    type: Number,
    default: 0
  },
  interactive: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const stars = [1, 2, 3, 4, 5]

const displayValue = computed(() => {
  return props.average !== null ? props.average : props.modelValue
})

function selectStar(value) {
  if (!props.interactive) return
  emit('update:modelValue', value)
}
</script>

<template>
  <div
    class="star-rating"
    :class="{ 'star-rating-interactive': interactive }"
  >
    <button
      v-for="star in stars"
      :key="star"
      type="button"
      class="star"
      :class="{ filled: star <= Math.round(displayValue) }"
      :disabled="!interactive"
      :aria-label="`Rate ${star} out of 5`"
      @click="selectStar(star)"
    >
      ★
    </button>

    <span v-if="average !== null" class="rating-summary">
      {{ count > 0 ? average.toFixed(1) : 'No ratings yet' }}
      <template v-if="count > 0">
        ({{ count }} {{ count === 1 ? 'rating' : 'ratings' }})
      </template>
    </span>
  </div>
</template>