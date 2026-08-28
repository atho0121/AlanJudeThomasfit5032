<script setup>
defineProps({
  project: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <article class="project-card">
    <div class="project-header">
      <span class="status" :class="project.status.toLowerCase()">{{ project.status }}</span>
      <span class="project-location">{{ project.suburb }}</span>
    </div>

    <h3>{{ project.title }}</h3>
    <p>{{ project.description }}</p>

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
  </article>
</template>