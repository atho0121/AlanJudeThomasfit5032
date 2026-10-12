<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const jsondata = ref(null)

async function getBookCountAPI() {
  try {
    const response = await axios.get('http://127.0.0.1:5001/fit5032-a810c/us-central1/countBooks')
    return response.data
  } catch (e) {
    return { error: e.message }
  }
}

onMounted(async () => {
  jsondata.value = await getBookCountAPI()
})
</script>

<template>
  <pre>{{ jsondata }}</pre>
</template>