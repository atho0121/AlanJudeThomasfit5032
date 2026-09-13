<script setup>
import { computed } from 'vue'
import { useAuth } from '../stores/auth'
import { useRatings } from '../stores/ratings'
import { projects } from '../data/projects'


const { currentUser } = useAuth()
const { getAverage, getCount } = useRatings()


const users = computed(() => {
  try {
    const raw = localStorage.getItem('canopy_users')
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
})

const projectSummaries = computed(() =>
  projects.map(project => ({
    id: project.id,
    title: project.title,
    average: getAverage(project.id),
    count: getCount(project.id)
  }))
)
</script>

<template>

  <section class="page-header">

    <div class="container">

      <span class="eyebrow">
        Admin
      </span>

      <h1>Admin Dashboard</h1>

      <p>
        Signed in as {{ currentUser?.name }} ({{ currentUser?.role }})
      </p>

    </div>

  </section>


  <section class="section">

    <div class="container">

      <h2>Registered Users</h2>

      <table class="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          
          <tr v-for="user in users" :key="user.id">
            <td>{{ user.name }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.role }}</td>
          </tr>
        </tbody>
      </table>

      <h2>Project Ratings Summary</h2>

      <table class="admin-table">
        <thead>
          <tr>
            <th>Project</th>
            <th>Average Rating</th>
            <th>Number of Ratings</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="summary in projectSummaries" :key="summary.id">
            <td>{{ summary.title }}</td>
            <td>{{ summary.count > 0 ? summary.average.toFixed(1) : '—' }}</td>
            <td>{{ summary.count }}</td>
          </tr>
        </tbody>
      </table>

    </div>

  </section>

</template>