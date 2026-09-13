<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../stores/auth'

const menuOpen = ref(false)
const router = useRouter()

const { currentUser, isLoggedIn, isAdmin, logout } = useAuth()

function closeMenu() {
  menuOpen.value = false
}

function handleLogout() {
  logout()
  closeMenu()
  router.push('/')
}
</script>

<template>
  <header class="site-header">
    <nav class="navbar container">

      <RouterLink
        to="/"
        class="brand"
        @click="closeMenu"
      >
        <span class="brand-icon">🌱</span>

        <span>
          <strong>Canopy</strong>
          <small>Collective</small>
        </span>
      </RouterLink>

      <button
        class="menu-button"
        type="button"
        aria-label="Toggle navigation menu"
        :aria-expanded="menuOpen"
        @click="menuOpen = !menuOpen"
      >
        ☰
      </button>

      <div
        class="navigation"
        :class="{ 'navigation-open': menuOpen }"
      >
        <RouterLink
          to="/"
          class="nav-link"
          @click="closeMenu"
        >
          Home
        </RouterLink>

        <RouterLink
          to="/events"
          class="nav-link"
          @click="closeMenu"
        >
          Events
        </RouterLink>

        <RouterLink
          to="/projects"
          class="nav-link"
          @click="closeMenu"
        >
          Projects
        </RouterLink>

        <RouterLink
          to="/contact"
          class="nav-link"
          @click="closeMenu"
        >
          Get Involved
        </RouterLink>

        <!-- Only rendered for the admin role — this is the visible half
             of BR C.2; the router guard is the enforced half. -->
        <RouterLink
          v-if="isAdmin"
          to="/admin"
          class="nav-link"
          @click="closeMenu"
        >
          Admin
        </RouterLink>

        <template v-if="isLoggedIn">
          <span class="nav-user">
            Hi, {{ currentUser.name }}
          </span>

          <button
            type="button"
            class="nav-link nav-button nav-button-plain"
            @click="handleLogout"
          >
            Log Out
          </button>
        </template>

        <template v-else>
          <RouterLink
            to="/login"
            class="nav-link"
            @click="closeMenu"
          >
            Log In
          </RouterLink>

          <RouterLink
            to="/register"
            class="nav-link nav-button"
            @click="closeMenu"
          >
            Register
          </RouterLink>
        </template>
      </div>

    </nav>
  </header>
</template>