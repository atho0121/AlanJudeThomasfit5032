<script setup>
import { ref, reactive, computed, watch } from 'vue'

const props = defineProps({
  columns: { type: Array, required: true }, // { key, label, sortValue? }
  rows: { type: Array, required: true },
  rowKey: { type: String, default: 'id' },
  // Which field names a row for screen readers (used on selection checkboxes).
  rowLabel: { type: String, default: '' },
  caption: { type: String, required: true },
  pageSize: { type: Number, default: 10 },
  selectable: { type: Boolean, default: false }
})

const selected = defineModel('selected', { type: Array, default: () => [] })

const uid = Math.random().toString(36).slice(2, 8)
const globalSearch = ref('')
const columnFilters = reactive(
  Object.fromEntries(props.columns.map(c => [c.key, '']))
)
const sortKey = ref('')
const sortDir = ref('asc')
const page = ref(1)

// 1. Search: global box AND every per-column filter must match.
const filteredRows = computed(() => {
  const global = globalSearch.value.trim().toLowerCase()
  return props.rows.filter(row => {
    const texts = props.columns.map(c => String(row[c.key] ?? '').toLowerCase())
    if (global && !texts.some(t => t.includes(global))) return false
    return props.columns.every((c, i) => {
      const f = (columnFilters[c.key] || '').trim().toLowerCase()
      return !f || texts[i].includes(f)
    })
  })
})

// 2. Sort: numbers numerically, text naturally; sortValue lets a column
//    sort by something other than its display text (e.g. a real date).
const sortedRows = computed(() => {
  if (!sortKey.value) return filteredRows.value
  const col = props.columns.find(c => c.key === sortKey.value)
  const dir = sortDir.value === 'asc' ? 1 : -1
  const val = row => (col.sortValue ? col.sortValue(row) : row[col.key])
  return [...filteredRows.value].sort((a, b) => {
    const x = val(a)
    const y = val(b)
    if (typeof x === 'number' && typeof y === 'number') {
      return ((x || 0) - (y || 0)) * dir
    }
    return (
      String(x ?? '').localeCompare(String(y ?? ''), undefined, {
        numeric: true,
        sensitivity: 'base'
      }) * dir
    )
  })
})

// 3. Paginate: 10 rows per page.
const totalPages = computed(() =>
  Math.max(1, Math.ceil(sortedRows.value.length / props.pageSize))
)
const currentPage = computed(() => Math.min(page.value, totalPages.value))
const pagedRows = computed(() => {
  const start = (currentPage.value - 1) * props.pageSize
  return sortedRows.value.slice(start, start + props.pageSize)
})
const firstShown = computed(() =>
  sortedRows.value.length === 0 ? 0 : (currentPage.value - 1) * props.pageSize + 1
)
const lastShown = computed(() =>
  Math.min(currentPage.value * props.pageSize, sortedRows.value.length)
)

watch([globalSearch, sortKey, sortDir], () => (page.value = 1))
watch(columnFilters, () => (page.value = 1), { deep: true })

function toggleSort(key) {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortDir.value = 'asc'
  }
}

function ariaSort(key) {
  if (sortKey.value !== key) return 'none'
  return sortDir.value === 'asc' ? 'ascending' : 'descending'
}

function indicator(key) {
  if (sortKey.value !== key) return '↕'
  return sortDir.value === 'asc' ? '▲' : '▼'
}

function checkboxLabel(row) {
  const name = props.rowLabel ? row[props.rowLabel] : ''
  return `Select ${name || row[props.rowKey]}`
}

// Row selection (used for bulk email). Selection survives paging and filtering.
const selectedSet = computed(() => new Set(selected.value))

const allFilteredSelected = computed(
  () =>
    filteredRows.value.length > 0 &&
    filteredRows.value.every(r => selectedSet.value.has(r[props.rowKey]))
)

function toggleRow(row) {
  const key = row[props.rowKey]
  selected.value = selectedSet.value.has(key)
    ? selected.value.filter(k => k !== key)
    : [...selected.value, key]
}

function toggleAllFiltered() {
  const keys = filteredRows.value.map(r => r[props.rowKey])
  selected.value = allFilteredSelected.value
    ? selected.value.filter(k => !keys.includes(k))
    : [...new Set([...selected.value, ...keys])]
}
</script>

<template>
  <div class="data-table">
    <div class="dt-toolbar">
      <div class="form-group dt-search">
        <label :for="`dt-search-${uid}`">Search all columns</label>
        <input
          :id="`dt-search-${uid}`"
          v-model="globalSearch"
          type="search"
          placeholder="Search..."
        />
      </div>
      <div class="dt-actions">
        <slot name="actions" :rows="sortedRows" />
      </div>
    </div>

    <p v-if="selectable" class="dt-selected" aria-live="polite">
      {{ selected.length }} selected
    </p>

    <div class="dt-scroll" role="region" :aria-label="`${caption} table`" tabindex="0">
      <table class="admin-table">
        <caption>{{ caption }}</caption>
        <thead>
          <tr>
            <th v-if="selectable" scope="col">
              <input
                type="checkbox"
                :checked="allFilteredSelected"
                :aria-label="`Select all ${filteredRows.length} matching rows`"
                @change="toggleAllFiltered"
              />
            </th>
            <th
              v-for="col in columns"
              :key="col.key"
              scope="col"
              :aria-sort="ariaSort(col.key)"
            >
              <button type="button" class="dt-sort" @click="toggleSort(col.key)">
                {{ col.label }}
                <span aria-hidden="true">{{ indicator(col.key) }}</span>
              </button>
            </th>
          </tr>
          <tr class="dt-filters">
            <td v-if="selectable"></td>
            <td v-for="col in columns" :key="col.key">
              <input
                v-model="columnFilters[col.key]"
                type="search"
                placeholder="Filter"
                :aria-label="`Filter ${col.label}`"
              />
            </td>
          </tr>
        </thead>
        <tbody>
          <tr v-if="pagedRows.length === 0">
            <td :colspan="columns.length + (selectable ? 1 : 0)">No matching rows.</td>
          </tr>
          <tr v-for="row in pagedRows" :key="row[rowKey]">
            <td v-if="selectable">
              <input
                type="checkbox"
                :checked="selectedSet.has(row[rowKey])"
                :aria-label="checkboxLabel(row)"
                @change="toggleRow(row)"
              />
            </td>
            <td v-for="col in columns" :key="col.key">{{ row[col.key] }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <nav class="dt-pager" :aria-label="`${caption} pagination`">
      <button type="button" class="secondary-button" :disabled="currentPage <= 1" @click="page = currentPage - 1">
        Previous
      </button>
      <span aria-live="polite">
        Page {{ currentPage }} of {{ totalPages }} (showing {{ firstShown }}–{{ lastShown }} of {{ sortedRows.length }})
      </span>
      <button type="button" class="secondary-button" :disabled="currentPage >= totalPages" @click="page = currentPage + 1">
        Next
      </button>
    </nav>
  </div>
</template>

<style scoped>
.data-table { margin-bottom: 40px; }
.dt-toolbar { display: flex; flex-wrap: wrap; gap: 16px; align-items: flex-end; justify-content: space-between; margin-bottom: 12px; }
.dt-search { min-width: 240px; }
.dt-actions { display: flex; gap: 8px; }
.dt-selected { margin: 0 0 8px; color: #4d5d4f; }
.dt-scroll { overflow-x: auto; }
.dt-scroll .admin-table { margin-bottom: 12px; }
caption { text-align: left; font-weight: 600; padding: 8px 0; }
.dt-sort { background: none; border: 0; font: inherit; color: inherit; text-transform: inherit; cursor: pointer; padding: 0; }
.dt-filters td { padding: 6px 10px; background: #f6f9f5; }
.dt-filters input { padding: 6px 8px; font-size: 0.85rem; }
.dt-pager { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; justify-content: space-between; }
</style>