<script setup>
import EventsMap from '../components/EventsMap.vue'
</script>

<template>
  <section class="page-header">
    <div class="container">
      <span class="eyebrow">Find us</span>
      <h1>Event Map</h1>
      <p>See where events are happening and get directions from where you are.</p>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <EventsMap />
    </div>
  </section>
</template>