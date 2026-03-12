# CampusPilot

[![CI](https://github.com/lekhanpro/CampusPilot/actions/workflows/ci.yml/badge.svg)](https://github.com/lekhanpro/CampusPilot/actions/workflows/ci.yml)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Firebase](https://img.shields.io/badge/Firebase-Auth%20%2B%20Firestore-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com)
[![PWA](https://img.shields.io/badge/PWA-Installable-5A0FC8)](https://web.dev/progressive-web-apps/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)

CampusPilot is a production-ready, offline-first student productivity web app/PWA. It combines timetable, calendar, assignments, attendance, notes, Pomodoro, exams, analytics, and Groq-powered AI planning in one polished workspace.

> GitHub description: **Offline-first student productivity super app (PWA) with timetable, assignments, attendance, notes, Pomodoro, analytics, Firebase sync, and Groq AI planning.**

- Live app: [campuspilot-weld.vercel.app](https://campuspilot-weld.vercel.app)
- GitHub Pages: [lekhanpro.github.io/CampusPilot](https://lekhanpro.github.io/CampusPilot/)
- Tech stack: Next.js App Router, TypeScript, Tailwind, Dexie, Firebase, Groq, Zustand, React Query, Recharts, Zod

## Product Overview

CampusPilot is designed for real semester workflow:
- Plan classes and weekly schedule
- Track assignments and due dates
- Monitor attendance risk against threshold
- Keep subject notes searchable
- Run Pomodoro sessions with persisted state
- Track exam countdowns and prep status
- Generate practical study/day plans via Groq
- Work offline-first with optional cloud sync

## Screenshots

Add screenshots to `public/screenshots/` and update these links:
- `public/screenshots/dashboard.png`
- `public/screenshots/timetable.png`
- `public/screenshots/ai-planner.png`

## Core Features

- Guest mode with full local/offline usage
- Firebase email/password auth for signed-in mode
- Dexie + IndexedDB primary datastore
- Sync queue with last-write-wins (`updated_at`) conflict strategy
- Soft-delete-aware sync and pull/push APIs
- PWA installability, service worker caching, offline shell
- Dashboard, timetable, calendar, assignments, attendance, notes, Pomodoro, exams, analytics, settings
- Groq-backed AI planner endpoints with structured output handling

## Architecture

```text
app/                Routes, layouts, API handlers
components/         UI primitives + feature/layout components
hooks/              Auth, sync, local data hooks, Pomodoro store
services/           Local store, sync manager, Firebase clients
db/                 Dexie schema and local tables
lib/                Validation, analytics, scheduling, utilities
firebase/           Firestore rules + indexes
types/              Shared TypeScript contracts
scripts/            Dev/demo scripts (seed artifacts)
```

### Offline-first + Sync Flow

1. CRUD writes happen locally in IndexedDB.
2. A sync queue captures `upsert`/`delete` operations.
3. When online + authenticated, queue is pushed to `/api/sync/push`.
4. Newer remote changes are pulled from `/api/sync/pull`.
5. Conflicts resolve with last-write-wins by `updated_at`.

## AI Planner

Groq is called server-side only:
- `POST /api/ai/study-plan`
- `POST /api/ai/daily-plan`

Both routes validate inputs and parse structured JSON responses.

## Local Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure env

```bash
cp .env.example .env.local
```

Required env variables:

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase web config |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project id |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase sender id |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app id |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Optional analytics id |
| `FIREBASE_PROJECT_ID` | Firebase Admin SDK project id |
| `FIREBASE_CLIENT_EMAIL` | Firebase Admin service account email |
| `FIREBASE_PRIVATE_KEY` | Firebase Admin private key |
| `GROQ_API_KEY` | Groq API key |
| `GROQ_MODEL` | Groq model name |
| `NEXT_PUBLIC_APP_URL` | App public URL |

### 3. Run app

```bash
npm run dev
```

### 4. Optional demo artifacts

```bash
npm run seed:demo
```

## Firebase Setup

1. Create Firebase project.
2. Enable **Authentication** and turn on **Email/Password** sign-in.
3. Add your deployment domain in **Authentication > Settings > Authorized domains**.
4. Create Firestore database.
5. Deploy rules/indexes:

```bash
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

Files used:
- `firebase/firestore.rules`
- `firebase/firestore.indexes.json`

## GitHub Pages

A project site is provided from `docs/` and deployed via `.github/workflows/pages.yml`.

Expected URL:
- `https://lekhanpro.github.io/CampusPilot/`

If this is your first Pages deploy, open repository settings and set:
- **Settings > Pages > Build and deployment > Source = GitHub Actions**

## Deployment (Vercel)

1. Push to GitHub.
2. Import repo in Vercel.
3. Add all env vars from `.env.example` in Vercel Project Settings.
4. Deploy.

CLI option:

```bash
vercel
vercel --prod
```

## Quality Gates

```bash
npm run typecheck
npm run lint
npm run build
```

A GitHub Actions CI workflow runs these checks on pushes/PRs.

## Repository Standards

- Contribution guide: [CONTRIBUTING.md](./CONTRIBUTING.md)
- Security policy: [SECURITY.md](./SECURITY.md)
- Code of conduct: [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)
- Changelog: [CHANGELOG.md](./CHANGELOG.md)

## Roadmap

- Push notifications for deadlines and sessions
- Rich-text notes editor
- Improved analytics insights and trend forecasting
- Calendar integrations
- Team/class sharing modes

## License

Licensed under the [MIT License](./LICENSE).









