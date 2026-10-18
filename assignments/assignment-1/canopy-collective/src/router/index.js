import { createRouter, createWebHistory } from 'vue-router'
import { useAuth, authReady } from '../stores/auth'

import HomeView from '../views/HomeView.vue'
import EventsView from '../views/EventsView.vue'
import ProjectsView from '../views/ProjectsView.vue'
import ContactView from '../views/ContactView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import AdminView from '../views/AdminView.vue'
import MapView from '../views/MapView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/events',
    name: 'events',
    component: EventsView
  },
  {
    path: '/projects',
    name: 'projects',
    component: ProjectsView
  },
  { path: '/map', name: 'map', component: MapView },
  {
    path: '/contact',
    name: 'contact',
    component: ContactView
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView
  },
  {
    path: '/admin',
    name: 'admin',
    component: AdminView,

    meta: {
      requiresAuth: true,
      requiresRole: 'admin'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,

  scrollBehavior() {
    return {
      top: 0
    }
  }
})


router.beforeEach(async to => {
  await authReady
  const { isLoggedIn, isAdmin } = useAuth()

  if (to.meta.requiresAuth && !isLoggedIn.value) {
    return { name: 'login' }
  }

  if (to.meta.requiresRole === 'admin' && !isAdmin.value) {
    return { name: 'home' }
  }

  return true
})

router.afterEach(to => {
  const name = to.name ? String(to.name) : ''
  const label = name ? name.charAt(0).toUpperCase() + name.slice(1) : 'Canopy Collective'
  document.title = `${label} | Canopy Collective`
})


export default router