# CampusPilot

CampusPilot is a production-ready, offline-first student productivity PWA built with Next.js App Router, TypeScript, Dexie, Firebase, Groq, Zustand, React Query, Tailwind CSS, and Recharts.

It combines timetable management, calendar planning, assignments, attendance, notes, Pomodoro focus sessions, exam countdowns, analytics, and an AI study planner into one mobile-first web app.

## Features

- Guest mode with full offline use
- Firebase email/password auth for cloud sync
- IndexedDB persistence with Dexie
- Last-write-wins sync using `updated_at`
- Local sync queue for offline edits
- Timetable weekly schedule and today agenda
- Assignment tracker with filters and overdue detection
- Attendance tracking with threshold warnings and recovery counts
- Subject notes with search and tag filtering
- Persistent Pomodoro timer with session history
- Exam countdowns with syllabus and prep status
- Weekly productivity and subject-wise analytics
- Groq-backed AI study plan and daily plan generation
- Installable PWA with service worker and manifest
- Mobile-first UI with desktop enhancement
- Dark mode support

## Stack

- Next.js 15 App Router
- TypeScript
- Tailwind CSS
- React Query
- Zustand
- Dexie.js + IndexedDB
- Firebase Authentication + Cloud Firestore
- Groq API via secure route handlers
- Recharts
- Zod validation

## Architecture

- `app/`: routes, layouts, API handlers
- `components/`: reusable UI, layout, feature blocks
- `hooks/`: auth, sync, live local data, Pomodoro state
- `lib/`: validation, analytics, scheduling, utilities
- `db/`: Dexie schema and preference defaults
- `services/`: local persistence, sync manager, Firebase, Groq helpers
- `firebase/`: Firestore security rules and index definitions
- `scripts/seed-demo.mjs`: Firebase-ready demo data artifact generator

## Offline-First + Sync Model

1. All CRUD writes happen in IndexedDB first.
2. A sync queue stores local changes (`upsert`/`delete`).
3. When online and authenticated, queued changes are pushed to Firestore via `/api/sync/push`.
4. Remote updates newer than last sync are pulled via `/api/sync/pull`.
5. Conflict strategy: last-write-wins using `updated_at`.

## AI Planner

Groq is used only from server route handlers:
- `POST /api/ai/study-plan`
- `POST /api/ai/daily-plan`

Output is strict JSON and validated with Zod.

## Environment Variables

Copy `.env.example` to `.env.local` and set values:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
GROQ_API_KEY=
GROQ_MODEL=llama-3.3-70b-versatile
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Notes:
- `FIREBASE_PRIVATE_KEY` must keep escaped newlines (`\n`) when set in env.
- Client keys are public config and must match your Firebase web app.

## Local Setup

```bash
npm install
npm run seed:demo
npm run dev
```

Quality checks:

```bash
npm run typecheck
npm run lint
npm run build
```

## Firebase Setup

1. Create a Firebase project.
2. Enable Email/Password in Firebase Authentication.
3. Create a Web App and copy Firebase client config to `NEXT_PUBLIC_FIREBASE_*` env vars.
4. Create a service account key for server-side admin access.
5. Set admin env vars: `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`.
6. Deploy Firestore rules and indexes:

```bash
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

This uses:
- `firebase/firestore.rules`
- `firebase/firestore.indexes.json`

## Demo Seed Artifacts

Generate Firebase demo artifacts:

```bash
npm run seed:demo
```

Outputs:
- `firebase/demo/campuspilot-demo-local.json`
- `firebase/demo/campuspilot-demo-firestore.json`

## Deploying to Vercel

1. Push repository.
2. Create/import project in Vercel.
3. Add all Firebase and Groq environment variables in Vercel settings.
4. Deploy.

CLI option:

```bash
vercel
vercel --prod
```

## Post-Deploy Checklist

- `GET /api/health` returns `ok: true`
- Guest mode works offline
- Firebase auth sign up/sign in works
- Sync works after reconnect
- Groq planner returns structured output
- PWA installability works
- `npm run build` passes in CI

## Migration Note

CampusPilot now uses Firebase for authentication and cloud data sync.