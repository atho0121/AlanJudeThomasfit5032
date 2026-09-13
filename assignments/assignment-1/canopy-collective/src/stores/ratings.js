import { reactive } from 'vue'
import { useAuth } from './auth'

const STORAGE_KEY_RATINGS = 'canopy_ratings'

function loadRatings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RATINGS)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveRatings(ratings) {
  localStorage.setItem(STORAGE_KEY_RATINGS, JSON.stringify(ratings))
}


const state = reactive({
  ratings: loadRatings()
})

export function useRatings() {
  const { currentUser } = useAuth()

  function submitRating(projectId, value) {
    const rating = Number(value)

   
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      throw new Error('Rating must be a whole number between 1 and 5.')
    }

    if (!currentUser.value) {
      throw new Error('You must be logged in to submit a rating.')
    }

    const existingIndex = state.ratings.findIndex(
      entry =>
        entry.projectId === projectId &&
        entry.userEmail === currentUser.value.email
    )

    if (existingIndex !== -1) {
      state.ratings[existingIndex].value = rating
    } else {
      state.ratings.push({
        projectId,
        userEmail: currentUser.value.email,
        value: rating
      })
    }

    saveRatings(state.ratings)
  }

  function getAverage(projectId) {
    const projectRatings = state.ratings.filter(
      entry => entry.projectId === projectId
    )

    if (projectRatings.length === 0) return 0

    const total = projectRatings.reduce((sum, entry) => sum + entry.value, 0)
    return total / projectRatings.length
  }

  function getCount(projectId) {
    return state.ratings.filter(entry => entry.projectId === projectId).length
  }

  function getUserRating(projectId) {
    if (!currentUser.value) return 0

    const existing = state.ratings.find(
      entry =>
        entry.projectId === projectId &&
        entry.userEmail === currentUser.value.email
    )

    return existing ? existing.value : 0
  }

  return {
    submitRating,
    getAverage,
    getCount,
    getUserRating
  }
}