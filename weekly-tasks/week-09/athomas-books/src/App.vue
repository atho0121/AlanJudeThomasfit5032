<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const showHeader = computed(
  () => !['CountBookAPI', 'GetAllBookAPI'].includes(route.name),
)
</script>

<template>
  <header v-if="showHeader">
    <nav>
      <RouterLink to="/getbookcount">Book Count</RouterLink>
      <RouterLink to="/weather">Get Weather</RouterLink>
      <RouterLink to="/CountBookAPI">Count Book API</RouterLink>
      <RouterLink to="/GetAllBookAPI">Get All Book API</RouterLink>
    </nav>
  </header>
  <RouterView />
</template>