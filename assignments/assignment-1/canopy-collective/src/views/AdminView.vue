<script setup>
import { ref, computed, onMounted } from 'vue'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../stores/auth'
import { useRatings } from '../stores/ratings'
import { projects } from '../data/projects'
import { events } from '../data/events'
import { signups } from '../data/signups'
import DataTable from '../components/DataTable.vue'

const { currentUser } = useAuth()
const { getAverage, getCount } = useRatings()

const users = ref([])
const usersLoading = ref(true)
const usersError = ref('')
const selectedUserIds = ref([])

onMounted(async () => {
  try {
    const snap = await getDocs(collection(db, 'users'))
    users.value = snap.docs.map(d => {
      const data = d.data()
      return {
        id: d.id,
        name: data.name,
        email: data.email,
        role: data.role,
        joined: data.createdAt?.toDate().toLocaleDateString('en-AU') ?? '',
        joinedAt: data.createdAt?.toMillis() ?? 0
      }
    })
  } catch (err) {
    console.error(err)
    usersError.value = 'Could not load users. Check your Firestore rules and admin role.'
  } finally {
    usersLoading.value = false
  }
})

const userColumns = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role' },
  { key: 'joined', label: 'Joined', sortValue: row => row.joinedAt }
]

const eventColumns = [
  { key: 'title', label: 'Event' },
  { key: 'date', label: 'Date', sortValue: row => Date.parse(row.isoDate) },
  { key: 'location', label: 'Location' },
  { key: 'category', label: 'Category' },
  { key: 'capacity', label: 'Capacity' },
  { key: 'registered', label: 'Registered' }
]

const signupColumns = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'event', label: 'Event' },
  { key: 'eventDateLabel', label: 'Event date', sortValue: row => Date.parse(row.eventDate) },
  { key: 'status', label: 'Status' }
]

const ratingColumns = [
  { key: 'title', label: 'Project' },
  { key: 'averageLabel', label: 'Average rating', sortValue: row => row.average },
  { key: 'count', label: 'Number of ratings' }
]

const ratingRows = computed(() =>
  projects.map(p => {
    const count = getCount(p.id)
    const average = getAverage(p.id)
    return {
      id: p.id,
      title: p.title,
      average,
      averageLabel: count > 0 ? average.toFixed(1) : '—',
      count
    }
  })
)
</script>

<template>
  <section class="page-header">
    <div class="container">
      <span class="eyebrow">Admin</span>
      <h1>Admin Dashboard</h1>
      <p>Signed in as {{ currentUser?.name }} ({{ currentUser?.role }})</p>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <h2>Registered Users</h2>
      <p v-if="usersLoading">Loading users...</p>
      <p v-else-if="usersError" role="alert">{{ usersError }}</p>
      <DataTable
        v-else
        v-model:selected="selectedUserIds"
        caption="Registered users"
        :columns="userColumns"
        :rows="users"
        row-label="name"
        selectable
      />

      <h2>Events</h2>
      <DataTable caption="Events" :columns="eventColumns" :rows="events" />

      <h2>Event Sign-ups (sample data)</h2>
      <DataTable caption="Event sign-ups" :columns="signupColumns" :rows="signups" />

      <h2>Project Ratings Summary</h2>
      <DataTable caption="Project ratings" :columns="ratingColumns" :rows="ratingRows" />
    </div>
  </section>
</template>