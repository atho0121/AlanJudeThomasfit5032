<script setup>
import { computed } from 'vue'

import { events } from '../data/events'
import { projects } from '../data/projects'

import EventCard from '../components/EventCard.vue'
import ProjectCard from '../components/ProjectCard.vue'

const upcomingEvents = computed(() => events.slice(0, 3))
const featuredProjects = computed(() => projects.slice(0, 3))

const totalTrees = computed(() =>
  projects.reduce((total, project) => total + project.treesPlanted, 0)
)

const totalVolunteers = computed(() =>
  projects.reduce((total, project) => total + project.volunteers, 0)
)
</script>

<template>
  <section class="hero">
    <div class="container hero-content">
      <div class="hero-text">
        <span class="eyebrow">Melbourne Urban Greening</span>
        <h1>
          Growing a greener
          <span>Melbourne together.</span>
        </h1>
        <p>
          Canopy Collective connects communities with urban greening, tree planting
          and biodiversity projects across Melbourne.
        </p>
        <div class="hero-actions">
          <RouterLink to="/events" class="primary-button">Find an Event</RouterLink>
          <RouterLink to="/projects" class="secondary-button">Explore Projects</RouterLink>
        </div>
      </div>
      <div class="hero-visual">🌳</div>
    </div>
  </section>

  <section class="statistics">
    <div class="container statistics-grid">
      <div class="statistic">
        <strong>{{ totalTrees }}</strong>
        <span>Trees Planted</span>
      </div>
      <div class="statistic">
        <strong>{{ totalVolunteers }}</strong>
        <span>Active Volunteers</span>
      </div>
      <div class="statistic">
        <strong>{{ projects.length }}</strong>
        <span>Community Projects</span>
      </div>
      <div class="statistic">
        <strong>{{ events.length }}</strong>
        <span>Upcoming Events</span>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <div class="section-heading">
        <div>
          <span class="eyebrow">Get involved</span>
          <h2>Upcoming events</h2>
        </div>
        <RouterLink to="/events" class="text-link">View all events →</RouterLink>
      </div>

      <div class="card-grid">
        <EventCard v-for="event in upcomingEvents" :key="event.id" :event="event" />
      </div>
    </div>
  </section>

  <section class="section section-alt">
    <div class="container">
      <div class="section-heading">
        <div>
          <span class="eyebrow">Our impact</span>
          <h2>Community projects</h2>
        </div>
        <RouterLink to="/projects" class="text-link">Explore projects →</RouterLink>
      </div>

      <div class="card-grid">
        <ProjectCard v-for="project in featuredProjects" :key="project.id" :project="project" />
      </div>
    </div>
  </section>
</template>