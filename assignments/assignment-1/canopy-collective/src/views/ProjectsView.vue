<script setup>
import { ref, computed } from 'vue'

import { projects } from '../data/projects'
import ProjectCard from '../components/ProjectCard.vue'

const selectedStatus = ref('All')

const statuses = ['All', 'Active', 'Planning', 'Completed']

const filteredProjects = computed(() => {
  if (selectedStatus.value === 'All') {
    return projects
  }
  return projects.filter(project => project.status === selectedStatus.value)
})
</script>

<template>
  <section class="page-header">
    <div class="container">
      <span class="eyebrow">Our work</span>
      <h1>Community Projects</h1>
      <p>Explore urban greening and biodiversity projects supported by Canopy Collective.</p>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <div class="project-filters">
        <button
          v-for="status in statuses"
          :key="status"
          class="filter-button"
          :class="{ active: selectedStatus === status }"
          @click="selectedStatus = status"
        >
          {{ status }}
        </button>
      </div>

      <div class="card-grid">
        <ProjectCard v-for="project in filteredProjects" :key="project.id" :project="project" />
      </div>
    </div>
  </section>
</template>