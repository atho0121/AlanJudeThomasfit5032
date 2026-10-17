const baseEvents = [
  {
    id: 1,
    title: 'Community Tree Planting Day',
    date: '24 October 2026',
    isoDate: '2026-10-24',
    time: '10:00 AM - 1:00 PM',
    location: 'Royal Park, Melbourne',
    category: 'Tree Planting',
    description: 'Join local volunteers to plant native trees and improve habitat for urban wildlife.',
    capacity: 40,
    registered: 27
  },
  {
    id: 2,
    title: 'Native Garden Workshop',
    date: '31 October 2026',
    isoDate: '2026-10-31',
    time: '11:00 AM - 1:00 PM',
    location: 'Fitzroy Community Centre',
    category: 'Workshop',
    description: 'Learn how to create a native garden that supports local biodiversity.',
    capacity: 25,
    registered: 14
  },
  {
    id: 3,
    title: 'Urban Biodiversity Walk',
    date: '7 November 2026',
    isoDate: '2026-11-07',
    time: '9:00 AM - 11:00 AM',
    location: 'Carlton Gardens',
    category: 'Education',
    description: 'Explore urban biodiversity and learn about native plants and wildlife.',
    capacity: 30,
    registered: 21
  },
  {
    id: 4,
    title: 'Community Garden Volunteer Day',
    date: '14 November 2026',
    isoDate: '2026-11-14',
    time: '10:00 AM - 2:00 PM',
    location: 'Brunswick Community Garden',
    category: 'Volunteering',
    description: 'Help maintain community garden spaces and support local biodiversity.',
    capacity: 35,
    registered: 18
  },
  {
    id: 5,
    title: 'Pollinator Garden Project',
    date: '21 November 2026',
    isoDate: '2026-11-21',
    time: '10:00 AM - 12:00 PM',
    location: 'North Melbourne',
    category: 'Biodiversity',
    description: 'Create pollinator-friendly spaces for bees, butterflies and other insects.',
    capacity: 9,
    registered: 9
  }
]

// Mock events so the table has more than 10 rows (pagination demo).
const sites = [
  'Edinburgh Gardens, Fitzroy North',
  'Merri Creek Trail, Northcote',
  'Yarra Bend Park, Fairfield',
  'Flagstaff Gardens, Melbourne',
  'Albert Park Lake, Albert Park',
  'Westgate Park, Port Melbourne',
  'Princes Park, Carlton North',
  'Treasury Gardens, East Melbourne',
  'Footscray Park, Footscray',
  'Darebin Parklands, Alphington',
  'Moonee Ponds Creek, Flemington',
  'Studley Park, Kew'
]

const kinds = [
  { title: 'Tree Planting', category: 'Tree Planting', description: 'Plant native trees and help restore local habitat.' },
  { title: 'Native Garden Workshop', category: 'Workshop', description: 'Hands-on session on growing native plants.' },
  { title: 'Biodiversity Walk', category: 'Education', description: 'Guided walk exploring local plants and wildlife.' }
]

const extraEvents = sites.map((location, i) => {
  const kind = kinds[i % kinds.length]
  const day = 10 + i
  return {
    id: 6 + i,
    title: `${kind.title} at ${location.split(',')[0]}`,
    date: `${day} November 2026`,
    isoDate: `2026-11-${String(day).padStart(2, '0')}`,
    time: '10:00 AM - 12:00 PM',
    location,
    category: kind.category,
    description: kind.description,
    capacity: 20 + i * 5,
    registered: 5 + i * 2
  }
})

export const events = [...baseEvents, ...extraEvents]