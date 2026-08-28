<script setup>
import { ref, computed } from 'vue'

import { events } from '../data/events'
import EventCard from '../components/EventCard.vue'

const searchTerm = ref('')
const selectedCategory = ref('All')

const categories = computed(() => [
  'All',
  ...new Set(events.map(event => event.category))
])

const filteredEvents = computed(() => {
  const search = searchTerm.value.trim().toLowerCase()

  return events.filter(event => {
    const matchesSearch =
      event.title.toLowerCase().includes(search) ||
      event.location.toLowerCase().includes(search) ||
      event.description.toLowerCase().includes(search)

    const matchesCategory =
      selectedCategory.value === 'All' ||
      event.category === selectedCategory.value

    return matchesSearch && matchesCategory
  })
})
</script>

<template>
  <section class="page-header">
    <div class="container">
      <span class="eyebrow">Get involved</span>
      <h1>Community Events</h1>
      <p>Discover opportunities to plant, learn and connect with your local community.</p>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <div class="filters">
        <div class="form-group">
          <label for="event-search">Search events</label>
          <input
            id="event-search"
            v-model="searchTerm"
            type="search"
            placeholder="Search by event, location..."
          />
        </div>

        <div class="form-group">
          <label for="category">Category</label>
          <select id="category" v-model="selectedCategory">
            <option v-for="category in categories" :key="category" :value="category">
              {{ category }}
            </option>
          </select>
        </div>
      </div>

      <div class="results-summary">
        <strong>{{ filteredEvents.length }}</strong> events found
      </div>

      <div v-if="filteredEvents.length" class="card-grid">
        <EventCard v-for="event in filteredEvents" :key="event.id" :event="event" />
      </div>

      <div v-else class="empty-state">
        <h2>No events found</h2>
        <p>Try changing your search or category.</p>
        <button class="secondary-button" @click="searchTerm = ''; selectedCategory = 'All'">
          Clear filters
        </button>
      </div>
    </div>
  </section>
</template>