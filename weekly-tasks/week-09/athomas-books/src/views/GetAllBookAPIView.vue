<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const jsondata = ref(null)

async function getAllBooksAPI() {
  try {
    const response = await axios.get('http://127.0.0.1:5001/fit5032-a810c/us-central1/getAllBooks')
    return response.data
  } catch (e) {
    return { error: e.message }
  }
}

onMounted(async () => {
  jsondata.value = await getAllBooksAPI()
})
</script>

<template>
  <pre>{{ JSON.stringify(jsondata, null, 2) }}</pre>
</template>