import { onRequest } from 'firebase-functions/v2/https'
import { getFirestore } from 'firebase-admin/firestore'
import { events } from './data/events.js'
import { projects } from './data/projects.js'

export const api = onRequest({ cors: true }, async (req, res) => {
  if (req.method !== 'GET') {
    res.set('Allow', 'GET').status(405).json({ error: 'Method not allowed' })
    return
  }

  // Works both behind Hosting (/api/events) and via the direct function URL (/events).
  const path = req.path.replace(/^\/api/, '').replace(/\/+$/, '') || '/'
  res.set('Cache-Control', 'public, max-age=60, s-maxage=300')

  if (path === '/events') {
    const { category } = req.query
    const data = category
      ? events.filter(e => e.category.toLowerCase() === String(category).toLowerCase())
      : events
    res.json({ count: data.length, data })
    return
  }

  const eventMatch = path.match(/^\/events\/(\d+)$/)
  if (eventMatch) {
    const event = events.find(e => e.id === Number(eventMatch[1]))
    if (!event) {
      res.status(404).json({ error: 'Event not found' })
      return
    }
    res.json({ data: event })
    return
  }

  if (path === '/projects') {
    const { status } = req.query
    const data = status
      ? projects.filter(p => p.status.toLowerCase() === String(status).toLowerCase())
      : projects
    res.json({ count: data.length, data })
    return
  }

  if (path === '/ratings') {
    try {
      const snap = await getFirestore().collection('ratings').get()
      const totals = {}
      snap.forEach(doc => {
        const { projectId, value } = doc.data()
        totals[projectId] ??= { sum: 0, count: 0 }
        totals[projectId].sum += value
        totals[projectId].count += 1
      })
      const data = projects.map(p => ({
        projectId: p.id,
        title: p.title,
        ratingCount: totals[p.id]?.count ?? 0,
        averageRating: totals[p.id]
          ? Number((totals[p.id].sum / totals[p.id].count).toFixed(2))
          : null
      }))
      res.json({ count: data.length, data })
    } catch (err) {
      console.error('Ratings API error', err)
      res.status(500).json({ error: 'Internal error' })
    }
    return
  }

  res.status(404).json({
    error: 'Not found',
    routes: ['/api/events', '/api/events/:id', '/api/projects', '/api/ratings']
  })
})