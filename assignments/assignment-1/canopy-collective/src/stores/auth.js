import { reactive, computed } from 'vue'

const STORAGE_KEY_USERS = 'canopy_users'
const STORAGE_KEY_SESSION = 'canopy_session'


async function hashPassword(password) {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('')
}

function loadUsers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USERS)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveUsers(users) {
  localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users))
}

function loadSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SESSION)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}


const state = reactive({
  users: loadUsers(),
  currentUser: loadSession()
})


async function seedAdmin() {
  if (state.users.length === 0) {
    const passwordHash = await hashPassword('Admin123!')
    state.users.push({
      id: 1,
      name: 'Site Admin',
      email: 'admin@canopycollective.org',
      passwordHash,
      role: 'admin'
    })
    saveUsers(state.users)
  }
}
seedAdmin()

export function useAuth() {
  const isLoggedIn = computed(() => state.currentUser !== null)
  const isAdmin = computed(() => state.currentUser?.role === 'admin')

  async function register({ name, email, password }) {
    const normalizedEmail = email.trim().toLowerCase()

    const alreadyExists = state.users.some(
      user => user.email === normalizedEmail
    )

    if (alreadyExists) {
      throw new Error('An account with that email already exists.')
    }

    const passwordHash = await hashPassword(password)

    const newUser = {
      id: Date.now(),
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,

      role: 'member'
    }

    state.users.push(newUser)
    saveUsers(state.users)

    return newUser
  }

  async function login({ email, password }) {
    const normalizedEmail = email.trim().toLowerCase()
    const passwordHash = await hashPassword(password)

    const user = state.users.find(
      candidate =>
        candidate.email === normalizedEmail &&
        candidate.passwordHash === passwordHash
    )


    if (!user) {
      throw new Error('Invalid email or password.')
    }

    const session = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }

    state.currentUser = session
    localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(session))

    return session
  }

  function logout() {
    state.currentUser = null
    localStorage.removeItem(STORAGE_KEY_SESSION)
  }

  return {
    currentUser: computed(() => state.currentUser),
    isLoggedIn,
    isAdmin,
    register,
    login,
    logout
  }
}