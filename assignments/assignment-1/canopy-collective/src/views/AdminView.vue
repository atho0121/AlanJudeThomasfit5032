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
import ExportButtons from '../components/ExportButtons.vue'
import BulkEmail from '../components/BulkEmail.vue'
import RatingsChart from '../components/RatingsChart.vue'

const roleCounts = computed(() =>
  users.value.reduce((acc, u) => {
    acc[u.role] = (acc[u.role] || 0) + 1
    return acc
  }, {})
)

const totalRatings = computed(() =>
  projects.reduce((sum, p) => sum + getCount(p.id), 0)
)

const selectedRecipients = computed(() =>
  users.value.filter(u => selectedUserIds.value.includes(u.id))
)

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
  <h2>Overview</h2>
  <ul class="stat-grid">
    <li><strong>{{ users.length }}</strong><span>Registered users</span></li>
    <li><strong>{{ roleCounts.admin || 0 }}</strong><span>Admins</span></li>
    <li><strong>{{ roleCounts.member || 0 }}</strong><span>Members</span></li>
    <li><strong>{{ events.length }}</strong><span>Events</span></li>
    <li><strong>{{ totalRatings }}</strong><span>Project ratings</span></li>
  </ul>
  <RatingsChart />

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
      >
        <template #actions="{ rows }">
          <ExportButtons
            :columns="userColumns"
            :rows="rows"
            filename="canopy-users"
            title="Registered users"
          />
        </template>
      </DataTable>
      <BulkEmail
        :recipients="selectedRecipients"
        :events="events"
        :event-columns="eventColumns"
      />

      <h2>Events</h2>
      <DataTable caption="Events" :columns="eventColumns" :rows="events">
        <template #actions="{ rows }">
          <ExportButtonsn
            :columns="eventColumns"
            :rows="rows"
            filename="canopy-events"
            title="Events"
          />
        </template>
      </DataTable>

      <h2>Event Sign-ups (sample data)</h2>
      <DataTable caption="Event sign-ups" :columns="signupColumns" :rows="signups">
        <template #actions="{ rows }">
          <ExportButtons
            :columns="signupColumns"
            :rows="rows"
            filename="canopy-signups"
            title="Event sign-ups"
          />
        </template>
      </DataTable>

      <h2>Project Ratings Summary</h2>
      <DataTable caption="Project ratings" :columns="ratingColumns" :rows="ratingRows">
        <template #actions="{ rows }">
          <ExportButtons
            :columns="ratingColumns"
            :rows="rows"
            filename="canopy-ratings"
            title="Project ratings"
          />
        </template>
      </DataTable>
    </div>
  </section>
</template>


<style scoped>
.stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; list-style: none; padding: 0; margin: 0 0 32px; }
.stat-grid li { background: white; border-radius: 10px; padding: 16px; display: flex; flex-direction: column; }
.stat-grid strong { font-size: 2rem; color: #1d5c33; }
.stat-grid span { color: #4d5d4f; }
</style>