<script setup>
import { ref } from 'vue'
import axios from 'axios'

const count = ref(null)
const error = ref(false)

// Emulator URL for now; swap for the deployed URL in 9.4
const URL = 'http://127.0.0.1:5001/fit5032-a810c/us-central1/countBooks'

async function getBookCount() {
  try {
    const res = await axios.get(URL)
    count.value = res.data.count
    error.value = false
  } catch (e) {
    console.error(e)
    count.value = null
    error.value = true
  }
}
</script>

<template>
  <h1>Book Counter</h1>
  <button @click="getBookCount">Get Book Count</button>
  <p v-if="count !== null">Total number of books: {{ count }}</p>
  <p v-else-if="error">error</p>
</template>