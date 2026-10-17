import { reactive } from 'vue'
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from './auth'

const state = reactive({ ratings: [] })

// Live listener: every browser sees the same ratings, updated in real time.
onSnapshot(
  collection(db, 'ratings'),
  snap => {
    state.ratings = snap.docs.map(d => d.data())
  },
  err => console.error('Ratings listener failed', err)
)

export function useRatings() {
  const { currentUser } = useAuth()

  async function submitRating(projectId, value) {
    const rating = Number(value)

    // Client-side checks are for UX. The Firestore rules are the real protection.
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      throw new Error('Rating must be a whole number between 1 and 5.')
    }
    if (!currentUser.value) {
      throw new Error('You must be logged in to submit a rating.')
    }

    try {
      // One document per user per project, so re-rating overwrites the old value.
      await setDoc(doc(db, 'ratings', `${projectId}_${currentUser.value.id}`), {
        projectId,
        userId: currentUser.value.id,
        value: rating,
        updatedAt: serverTimestamp()
      })
    } catch (err) {
      // Log the real reason, but only show a generic message in the UI.
      console.error('Saving rating failed', err)
      throw new Error('Could not save your rating. Please try again.')
    }
  }

  function forProject(projectId) {
    return state.ratings.filter(entry => entry.projectId === projectId)
  }

  function getAverage(projectId) {
    const list = forProject(projectId)
    if (list.length === 0) return 0
    return list.reduce((sum, entry) => sum + entry.value, 0) / list.length
  }

  function getCount(projectId) {
    return forProject(projectId).length
  }

  function getUserRating(projectId) {
    if (!currentUser.value) return 0
    const existing = forProject(projectId).find(
      entry => entry.userId === currentUser.value.id
    )
    return existing ? existing.value : 0
  }

  return { submitRating, getAverage, getCount, getUserRating }
}