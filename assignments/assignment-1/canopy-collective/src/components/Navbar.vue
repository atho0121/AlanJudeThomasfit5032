<script setup>
import { ref } from 'vue'

const menuOpen = ref(false)

function closeMenu() {
  menuOpen.value = false
}
</script>

<template>
  <header class="site-header">
    <nav class="navbar container">
      <RouterLink to="/" class="brand" @click="closeMenu">
        <span class="brand-icon">🌱</span>
        <span>
          <strong>Canopy</strong>
          <small>Collective</small>
        </span>
      </RouterLink>

      <button
        class="menu-button"
        type="button"
        aria-label="Toggle navigation menu"
        :aria-expanded="menuOpen"
        @click="menuOpen = !menuOpen"
      >
        ☰
      </button>

      <div class="navigation" :class="{ 'navigation-open': menuOpen }">
        <RouterLink to="/" class="nav-link" @click="closeMenu">Home</RouterLink>
        <RouterLink to="/events" class="nav-link" @click="closeMenu">Events</RouterLink>
        <RouterLink to="/projects" class="nav-link" @click="closeMenu">Projects</RouterLink>
        <RouterLink to="/contact" class="nav-link nav-button" @click="closeMenu">Get Involved</RouterLink>
      </div>
    </nav>
  </header>
</template>