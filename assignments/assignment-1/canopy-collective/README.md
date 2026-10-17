# Canopy Collective

A community website for urban greening in Melbourne: events, projects, ratings, and an admin dashboard. Built with Vue 3, Vite and Firebase (Hosting, Authentication, Firestore, Cloud Functions).

Live site: https://fit-5032-ec778.web.app

## Features

- Browse and filter community events and greening projects
- Sign up and log in with Firebase Authentication
- Rate projects (one rating per user per project, stored in Firestore)
- Admin dashboard with overview stats and an interactive ratings chart
- Export event and user tables as PDF and CSV
- Bulk email to selected users, with an optional PDF or CSV attachment (admins only)
- Read-only public REST API

## Project setup

```sh
npm install
npm run dev      # development with hot reload
npm run build    # production build into dist/
```

Deploy:

```sh
firebase deploy --only functions
firebase deploy --only hosting
```

### Email configuration

The email function uses SendGrid. The API key is stored in Secret Manager and never appears in the front end or in git.

```sh
firebase functions:secrets:set SENDGRID_API_KEY
```

Create `functions/.env` (not committed) containing `SENDER_EMAIL=<your verified SendGrid sender>`.

## API

A read-only JSON API served by a Cloud Function. All routes are `GET`; other methods return `405`. Responses are cached for a short time, so a new rating may take a few minutes to appear.

Base URL: `https://fit-5032-ec778.web.app/api`

| Route | Description |
| --- | --- |
| `GET /api/events` | All events. Optional `?category=Workshop` filters by category (case-insensitive). |
| `GET /api/events/:id` | One event by numeric id. Returns `404` if not found. |
| `GET /api/projects` | All projects. Optional `?status=Active` filters by status. |
| `GET /api/ratings` | Rating count and average per project. Aggregates only, no user data. |

Unknown routes return `404` with a list of valid routes.

Example:

```sh
curl "https://fit-5032-ec778.web.app/api/ratings"
```

```json
{
  "count": 4,
  "data": [
    { "projectId": 1, "title": "Royal Park Rewilding", "ratingCount": 2, "averageRating": 4.5 }
  ]
}
```

## Security notes

- The email function checks sign-in and the admin role on the server before sending, validates every input, and limits attachment type and size.
- The SendGrid key is held in Secret Manager.
- The API exposes aggregate data only and never returns user ids or emails.

## AI use declaration

<!-- Describe exactly which parts were AI-generated and how you used the tool, as required by the unit. -->