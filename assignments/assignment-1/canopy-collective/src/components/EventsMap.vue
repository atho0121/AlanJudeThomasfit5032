<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { events } from '../data/events'

const TOKEN = import.meta.env.VITE_MAPBOX_TOKEN
const hasToken = Boolean(TOKEN)
mapboxgl.accessToken = TOKEN

const mapEl = ref(null)
let map = null
let originMarker = null

const eventPoints = ref([]) // [{ event, coords }]
const originQuery = ref('')
const origin = ref(null) // { name, coords }
const destinationId = ref(events[0]?.id)
const mode = ref('driving')
const status = ref('')
const error = ref('')
const route = ref(null) // { km, minutes, steps }

// FEATURE 1: geocoding. Turns an address or place name into coordinates.
async function geocode(query) {
  const params = new URLSearchParams({
    q: query,
    country: 'au',
    limit: '1',
    access_token: TOKEN
  })
  const res = await fetch(`https://api.mapbox.com/search/geocode/v6/forward?${params}`)
  if (!res.ok) throw new Error('Geocoding request failed.')
  const data = await res.json()
  const feature = data.features?.[0]
  if (!feature) return null
  return {
    name: feature.properties.full_address || feature.properties.name,
    coords: feature.geometry.coordinates
  }
}

onMounted(() => {
  if (!hasToken) return

  map = new mapboxgl.Map({
    container: mapEl.value,
    style: 'mapbox://styles/mapbox/streets-v12',
    center: [144.9631, -37.8136],
    zoom: 10.5
  })
  map.addControl(new mapboxgl.NavigationControl())

  map.on('load', async () => {
    status.value = 'Locating events on the map...'
    const results = await Promise.all(
      events.map(async event => {
        try {
          const hit = await geocode(`${event.location}, Victoria`)
          return hit ? { event, coords: hit.coords } : null
        } catch {
          return null
        }
      })
    )
    eventPoints.value = results.filter(Boolean)

    const bounds = new mapboxgl.LngLatBounds()
    eventPoints.value.forEach(({ event, coords }) => {
      const popup = document.createElement('div')
      const title = document.createElement('strong')
      title.textContent = event.title
      const when = document.createElement('p')
      when.textContent = `${event.date}, ${event.time}`
      popup.append(title, when)

      new mapboxgl.Marker({ color: '#287a45' })
        .setLngLat(coords)
        .setPopup(new mapboxgl.Popup({ offset: 24 }).setDOMContent(popup))
        .addTo(map)
      bounds.extend(coords)
    })
    if (!bounds.isEmpty()) map.fitBounds(bounds, { padding: 60 })
    status.value = `${eventPoints.value.length} of ${events.length} events shown on the map.`
  })
})

onBeforeUnmount(() => map?.remove())

function setOrigin(name, coords) {
  origin.value = { name, coords }
  originMarker?.remove()
  originMarker = new mapboxgl.Marker({ color: '#1a4fd6' }).setLngLat(coords).addTo(map)
  map.flyTo({ center: coords, zoom: 13 })
}

async function searchOrigin() {
  error.value = ''
  if (!originQuery.value.trim()) {
    error.value = 'Enter a starting address first.'
    return
  }
  try {
    const hit = await geocode(originQuery.value)
    if (!hit) {
      error.value = 'No matching place found. Try a more specific address.'
      return
    }
    setOrigin(hit.name, hit.coords)
    status.value = `Starting point set to ${hit.name}.`
  } catch (err) {
    error.value = err.message
  }
}

function useMyLocation() {
  error.value = ''
  if (!navigator.geolocation) {
    error.value = 'Your browser does not support location.'
    return
  }
  navigator.geolocation.getCurrentPosition(
    pos => {
      setOrigin('Your location', [pos.coords.longitude, pos.coords.latitude])
      status.value = 'Starting point set to your location.'
    },
    () => (error.value = 'Could not get your location. Type an address instead.')
  )
}

function drawRoute(geometry) {
  const data = { type: 'Feature', geometry }
  if (map.getSource('route')) {
    map.getSource('route').setData(data)
  } else {
    map.addSource('route', { type: 'geojson', data })
    map.addLayer({
      id: 'route',
      type: 'line',
      source: 'route',
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: { 'line-color': '#1a4fd6', 'line-width': 5 }
    })
  }
  const coords = geometry.coordinates
  const bounds = coords.reduce(
    (b, c) => b.extend(c),
    new mapboxgl.LngLatBounds(coords[0], coords[0])
  )
  map.fitBounds(bounds, { padding: 60 })
}

// FEATURE 2: directions from the chosen start to the chosen event.
async function getDirections() {
  error.value = ''
  route.value = null
  if (!origin.value) {
    error.value = 'Set a starting point first.'
    return
  }
  const dest = eventPoints.value.find(p => p.event.id === destinationId.value)
  if (!dest) {
    error.value = 'That event could not be located on the map.'
    return
  }
  const [o, d] = [origin.value.coords, dest.coords]
  const params = new URLSearchParams({
    geometries: 'geojson',
    overview: 'full',
    steps: 'true',
    access_token: TOKEN
  })
  try {
    const res = await fetch(
      `https://api.mapbox.com/directions/v5/mapbox/${mode.value}/${o[0]},${o[1]};${d[0]},${d[1]}?${params}`
    )
    const data = await res.json()
    const best = data.routes?.[0]
    if (!best) {
      error.value = 'No route found between those points.'
      return
    }
    drawRoute(best.geometry)
    route.value = {
      km: (best.distance / 1000).toFixed(1),
      minutes: Math.round(best.duration / 60),
      steps: best.legs[0].steps.map(s => s.maneuver.instruction)
    }
    status.value = `Route found: ${route.value.km} km, about ${route.value.minutes} minutes.`
  } catch {
    error.value = 'Could not fetch directions. Please try again.'
  }
}
</script>

<template>
  <div class="events-map">
    <p v-if="!hasToken" role="alert">
      Add VITE_MAPBOX_TOKEN to your .env file to enable the map.
    </p>

    <form class="map-controls" @submit.prevent="searchOrigin">
      <div class="form-group">
        <label for="origin-search">Starting address</label>
        <input id="origin-search" v-model="originQuery" type="search" placeholder="e.g. Flinders Street Station" />
      </div>
      <button type="submit" class="primary-button">Search address</button>
      <button type="button" class="secondary-button" @click="useMyLocation">Use my location</button>
    </form>

    <div class="map-controls">
      <div class="form-group">
        <label for="destination">Destination event</label>
        <select id="destination" v-model="destinationId">
          <option v-for="p in eventPoints" :key="p.event.id" :value="p.event.id">
            {{ p.event.title }}
          </option>
        </select>
      </div>
      <div class="form-group">
        <label for="mode">Travel mode</label>
        <select id="mode" v-model="mode">
          <option value="driving">Driving</option>
          <option value="walking">Walking</option>
          <option value="cycling">Cycling</option>
        </select>
      </div>
      <button type="button" class="primary-button" @click="getDirections">Get directions</button>
    </div>

    <p v-if="status" role="status">{{ status }}</p>
    <p v-if="error" role="alert">{{ error }}</p>

    <div ref="mapEl" class="map" role="region" aria-label="Map of event locations"></div>

    <div v-if="route" class="route-steps">
      <h2>Directions ({{ route.km }} km, about {{ route.minutes }} min)</h2>
      <ol>
        <li v-for="(step, i) in route.steps" :key="i">{{ step }}</li>
      </ol>
    </div>
  </div>
</template>

<style scoped>
.map-controls { display: flex; flex-wrap: wrap; gap: 12px; align-items: flex-end; margin-bottom: 16px; }
.map { height: 480px; border-radius: 10px; margin: 16px 0; }
.route-steps ol { padding-left: 1.25rem; }
</style>