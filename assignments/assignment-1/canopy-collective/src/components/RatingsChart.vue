<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import Chart from 'chart.js/auto'
import { projects } from '../data/projects'
import { useRatings } from '../stores/ratings'

const { getAverage, getCount } = useRatings()

const metric = ref('average') // 'average' | 'count'
const selectedProject = ref(null)
const canvas = ref(null)
let chart = null

const values = computed(() =>
  projects.map(p =>
    metric.value === 'average' ? Number(getAverage(p.id).toFixed(2)) : getCount(p.id)
  )
)

const label = computed(() =>
  metric.value === 'average' ? 'Average rating (1-5)' : 'Number of ratings'
)

onMounted(() => {
  chart = new Chart(canvas.value, {
    type: 'bar',
    data: {
      labels: projects.map(p => p.title),
      datasets: [{ label: label.value, data: values.value, backgroundColor: '#287a45' }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: { y: { beginAtZero: true, max: 5, ticks: { precision: 0 } } },
      // Click a bar to see that project's details below the chart.
      onClick: (_event, elements) => {
        if (elements.length) selectedProject.value = projects[elements[0].index]
      }
    }
  })
})

watch([values, label], () => {
  if (!chart) return
  chart.data.datasets[0].data = values.value
  chart.data.datasets[0].label = label.value
  chart.options.scales.y.max = metric.value === 'average' ? 5 : undefined
  chart.update()
})

onBeforeUnmount(() => chart?.destroy())
</script>

<template>
  <div class="ratings-chart">
    <div class="form-group">
      <label for="chart-metric">Chart shows</label>
      <select id="chart-metric" v-model="metric">
        <option value="average">Average rating</option>
        <option value="count">Number of ratings</option>
      </select>
    </div>

    <div class="chart-box">
      <canvas
        ref="canvas"
        role="img"
        aria-label="Bar chart of project ratings. The same data is in the Project Ratings table below."
      ></canvas>
    </div>

    <p v-if="selectedProject" role="status">
      <strong>{{ selectedProject.title }}</strong>:
      {{ getCount(selectedProject.id) }} rating(s), average
      {{ getCount(selectedProject.id) ? getAverage(selectedProject.id).toFixed(1) : '—' }}
    </p>
    <p v-else class="hint">Click a bar for details.</p>
  </div>
</template>

<style scoped>
.chart-box { position: relative; height: 320px; max-width: 760px; }
.hint { color: #4d5d4f; }
</style>