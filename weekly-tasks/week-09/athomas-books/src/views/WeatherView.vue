<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const apiKey = import.meta.env.VITE_WEATHER_KEY
const weather = ref(null)
const error = ref('')
const city = ref('')

async function fetchWeather(params) {
  try {
    error.value = ''
    const res = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: { ...params, units: 'metric', appid: apiKey },
    })
    weather.value = res.data
  } catch (e) {
    weather.value = null
    error.value = e.response?.data?.message || 'Could not get weather'
  }
}

function byLocation() {
  navigator.geolocation.getCurrentPosition(
    (p) => fetchWeather({ lat: p.coords.latitude, lon: p.coords.longitude }),
    () => (error.value = 'Location permission denied'),
  )
}

function byCity() {
  if (city.value.trim()) fetchWeather({ q: city.value.trim() })
}

onMounted(byLocation)
</script>

<template>
  <h1>Weather</h1>

  <form @submit.prevent="byCity">
    <input v-model="city" placeholder="e.g. Clayton, AU" />
    <button>Search</button>
    <button type="button" @click="byLocation">Use my location</button>
  </form>

  <p v-if="error">{{ error }}</p>

  <div v-if="weather">
    <h2>{{ weather.name }}, {{ weather.sys.country }}</h2>
    <img
      :src="`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`"
      :alt="weather.weather[0].description"
    />
    <p>{{ Math.round(weather.main.temp) }} °C, {{ weather.weather[0].description }}</p>
  </div>
</template>