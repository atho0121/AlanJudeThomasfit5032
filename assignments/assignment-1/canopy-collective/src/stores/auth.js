import { reactive, computed } from 'vue'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../firebase'

const state = reactive({
  currentUser: null // { id, name, email, role }
})

// While register() writes the users/{uid} doc, the listener must not race it.
let registering = false

async function loadProfile(firebaseUser) {
  const snap = await getDoc(doc(db, 'users', firebaseUser.uid))
  const data = snap.exists() ? snap.data() : {}
  return {
    id: firebaseUser.uid,
    name: data.name || firebaseUser.displayName || '',
    email: firebaseUser.email,
    // A missing profile falls back to the lowest privilege, never admin.
    role: data.role || 'member'
  }
}

// Resolves once Firebase has restored (or not) the session on page load.
// The router guard awaits this so a refresh on /admin doesn't bounce to login.
export const authReady = new Promise(resolve => {
  onAuthStateChanged(auth, async firebaseUser => {
    if (registering) return resolve()
    try {
      state.currentUser = firebaseUser ? await loadProfile(firebaseUser) : null
    } catch (err) {
      console.error('Failed to load user profile', err)
      state.currentUser = null
    }
    resolve()
  })
})

function friendlyError(err) {
  switch (err.code) {
    case 'auth/email-already-in-use':
      return new Error('An account with that email already exists.')
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
    case 'auth/invalid-email':
      // One message for all of these, so login doesn't reveal which emails exist.
      return new Error('Invalid email or password.')
    case 'auth/weak-password':
      return new Error('Password is too weak (minimum 6 characters).')
    case 'auth/too-many-requests':
      return new Error('Too many attempts. Please try again later.')
    default:
      // Don't leak internals (e.g. "Missing or insufficient permissions") to the UI.
      console.error('Auth error:', err)
      return new Error('Something went wrong. Please try again.')
  }
}

export function useAuth() {
  const isLoggedIn = computed(() => state.currentUser !== null)
  const isAdmin = computed(() => state.currentUser?.role === 'admin')

  async function register({ name, email, password }) {
    registering = true
    let cred = null
    try {
      cred = await createUserWithEmailAndPassword(
        auth,
        email.trim().toLowerCase(),
        password
      )
      await updateProfile(cred.user, { displayName: name.trim() })

      // Role is always 'member' here. The Firestore rules enforce this.
      await setDoc(doc(db, 'users', cred.user.uid), {
        name: name.trim(),
        email: cred.user.email,
        role: 'member',
        createdAt: serverTimestamp()
      })

      state.currentUser = {
        id: cred.user.uid,
        name: name.trim(),
        email: cred.user.email,
        role: 'member'
      }
      return state.currentUser
    } catch (err) {
      // If the profile write failed, remove the half-created Auth account so
      // the person can retry instead of being stuck with "email already in use".
      if (cred?.user) {
        await cred.user.delete().catch(() => {})
      }
      state.currentUser = null
      throw friendlyError(err)
    } finally {
      registering = false
    }
  }

  async function login({ email, password }) {
    let cred = null
    try {
      cred = await signInWithEmailAndPassword(
        auth,
        email.trim().toLowerCase(),
        password
      )
      state.currentUser = await loadProfile(cred.user)
      return state.currentUser
    } catch (err) {
      // If sign-in worked but the profile load failed, don't leave Firebase
      // holding a session while the app shows logged out.
      if (cred?.user) {
        await signOut(auth).catch(() => {})
      }
      state.currentUser = null
      throw friendlyError(err)
    }
  }

  async function logout() {
    await signOut(auth)
    state.currentUser = null
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