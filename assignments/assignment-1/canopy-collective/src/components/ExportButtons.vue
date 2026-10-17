<script setup>
import { ref } from 'vue'
import { downloadCSV, downloadPDF } from '../utils/export'

const props = defineProps({
  columns: { type: Array, required: true },
  rows: { type: Array, required: true },
  filename: { type: String, required: true },
  title: { type: String, required: true }
})

const pdfBusy = ref(false)
const error = ref('')

function handleCSV() {
  error.value = ''
  try {
    downloadCSV(`${props.filename}.csv`, props.columns, props.rows)
  } catch (err) {
    console.error('CSV export failed', err)
    error.value = 'Could not create the CSV file.'
  }
}

async function handlePDF() {
  error.value = ''
  pdfBusy.value = true
  try {
    await downloadPDF(`${props.filename}.pdf`, props.title, props.columns, props.rows)
  } catch (err) {
    console.error('PDF export failed', err)
    error.value = 'Could not create the PDF file.'
  } finally {
    pdfBusy.value = false
  }
}
</script>

<template>
  <div class="export-buttons">
    <button type="button" class="secondary-button" @click="handleCSV">
      Export CSV<span class="visually-hidden"> for {{ title }}</span>
    </button>
    <button
      type="button"
      class="secondary-button"
      :disabled="pdfBusy"
      @click="handlePDF"
    >
      {{ pdfBusy ? 'Preparing PDF...' : 'Export PDF' }}<span class="visually-hidden"> for {{ title }}</span>
    </button>
    <div v-if="error" class="export-error" role="alert">{{ error }}</div>
  </div>
</template>

<style scoped>
.export-buttons { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.export-error { color: #b42318; font-weight: 600; }

/* Readable by screen readers and voice control, invisible on screen. */
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>