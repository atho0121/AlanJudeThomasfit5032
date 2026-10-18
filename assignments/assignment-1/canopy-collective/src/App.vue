<script setup>
import Navbar from './components/Navbar.vue'
import Footer from './components/Footer.vue'
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="app">
    <a href="#main-content" class="skip-link">Skip to main content</a>
    <Navbar />
    <main id="main-content" class="main-content" tabindex="-1">
      <RouterView />
    </main>
    <Footer />
  </div>
</template>