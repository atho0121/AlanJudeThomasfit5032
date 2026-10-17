import { events } from './events'

// Mock data for demonstrating the admin sign-ups table. Not real people.
const firstNames = [
  'Aroha', 'Ben', 'Chloe', 'Dev', 'Elena', 'Finn',
  'Grace', 'Hiro', 'Isla', 'Jack', 'Kavya', 'Liam'
]
const lastNames = [
  'Nguyen', 'Smith', 'Patel', 'Williams', 'Chen',
  'Taylor', 'Brown', 'Singh', 'Martin', 'Lee'
]
const statuses = ['Confirmed', 'Confirmed', 'Confirmed', 'Waitlisted', 'Cancelled']

// 12 first names x 10 last names: pairs don't repeat within 24 rows,
// so every name and email is unique.
export const signups = Array.from({ length: 24 }, (_, i) => {
  const first = firstNames[i % firstNames.length]
  const last = lastNames[i % lastNames.length]
  const event = events[(i * 7) % events.length]
  return {
    id: i + 1,
    name: `${first} ${last}`,
    email: `${first}.${last}`.toLowerCase() + '@example.com',
    event: event.title,
    eventDate: event.isoDate,       // used for sorting
    eventDateLabel: event.date,     // shown in the table
    status: statuses[i % statuses.length]
  }
})