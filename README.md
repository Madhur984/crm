# Recon Core — Customer Portal (full-stack)

A complete customer-facing procurement portal for **Recon Core**, an AI-augmented
electronics sourcing partner. Customers track their procurement projects end to end:
requirements → engineering → Recon Atlas → compliance → commercial → manufacturing →
logistics → customs → delivery.

This grew out of the single-file prototype in [`recon-core-portal.html`](./recon-core-portal.html)
(kept for reference) and is now a real app with a database, authentication, and a REST API.

```
crm/
├─ server/          Express + Prisma + SQLite REST API (JWT auth)
├─ client/          Vite + React + React Router SPA (the original design system, ported)
├─ recon-core-portal.html   Original prototype (reference only)
└─ package.json     Root scripts to run both together
```

## Stack

| Layer     | Tech |
|-----------|------|
| Frontend  | React 18, React Router 6, Vite 5 (no CSS framework — inline design tokens) |
| Backend   | Node + Express 4, Prisma 5 ORM |
| Database  | SQLite (file-based, zero external services) |
| Auth      | JWT (bearer token) + bcrypt password hashing |

## Quick start

From the `crm/` folder:

```bash
npm install          # installs the root helper (concurrently)
npm run setup        # installs server + client deps, creates & seeds the SQLite DB
npm run dev          # runs API (:4000) and web (:5173) together with hot reload
```

Then open **http://localhost:5173**.

**Demo login:** `demo@reconcore.app` · `recon1234`
(a second account `alvarez@reconcore.app` · `recon1234` exists too — both see the same org).

### Production-style single origin

Build the client and let the API serve it from one port:

```bash
npm run serve        # builds client → dist, then serves everything on http://localhost:4000
```

### Useful scripts

| Command | What it does |
|---------|--------------|
| `npm run dev`      | API + web with hot reload (two processes) |
| `npm run dev:api`  | just the API (`server/`, port 4000) |
| `npm run dev:web`  | just the web app (`client/`, port 5173) |
| `npm run build`    | production build of the client |
| `npm run serve`    | build client + serve it from the API (single origin) |
| `npm run db:reset` | wipe and re-seed the demo database |

## What works

Everything the customer can do is backed by the API and persisted to SQLite:

- **Auth** — login, JWT session, protected routes, logout. Every data request is scoped to the
  signed-in user's organization (requesting another org's project returns 404).
- **Dashboard** — health, milestones, timeline, recent updates, pending actions, account manager.
- **Project Details** — overview, milestones, activity, project documents, version history.
- **Technical** — BOM (searchable), datasheets, specs, **clarifications you can reply to**
  (persisted), and a **"Request a change"** action that logs project activity.
- **Recon Atlas** — procurement-confidence view driven by project data.
- **Compliance** — certifications, documentation, customs / HS classification.
- **Commercial** — totals, quotation (**Accept quotation** persists), POs, contract,
  payment schedule, invoices (**Pay now** marks the invoice paid and logs a payment activity).
- **Logistics** — shipment lifecycle, manufacturing status, freight, insurance, shipping docs.
- **Documents** — server-side search + type filter across all of the org's projects.
- **Communication** — activity feed with **persisted replies** per update.
- **Support** — **raise tickets** (persisted, listed), **live chat** (persisted with an auto-ack),
  team directory, knowledge base.
- **Multi-project switcher** with deep-linkable URLs: `/app/:projectId/:page`.

## API reference

All routes are under `/api`. Everything except `/api/auth/*` and `/api/health` requires
`Authorization: Bearer <token>`.

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/auth/login` | email + password → `{ token, user }` |
| GET  | `/auth/me` | current user + org |
| GET  | `/projects` | org's projects (summaries) |
| GET  | `/projects/:id` | full project payload |
| GET  | `/projects/:id/bom?q=` | BOM lines (searchable) |
| GET  | `/projects/:id/activity` | activity feed |
| POST | `/projects/:id/quote/accept` | accept the quotation |
| POST | `/projects/:id/change-request` | log a change request |
| POST | `/clarifications/:dbId/messages` | reply to a clarification |
| POST | `/invoices/:dbId/pay` | mark an invoice paid |
| GET  | `/documents?q=&type=` | search/filter documents |
| GET  | `/tickets` · POST `/tickets` | list / raise support tickets |
| GET  | `/messages?channel=&projectId=` · POST `/messages` | chat & activity replies |

## Data model

Two seeded projects (`RC-40217` Motor Control PCBA, `RC-40390` Sensor Array Module) owned by
one organization, ported verbatim from the prototype. Prisma schema lives in
[`server/prisma/schema.prisma`](./server/prisma/schema.prisma); seed data in
[`server/prisma/seed.js`](./server/prisma/seed.js). Read-only nested display data is stored as
JSON columns on `Project`; records the customer mutates (invoices, clarifications, tickets,
messages) are first-class tables.

## Configuration

`server/.env` holds `DATABASE_URL`, `JWT_SECRET`, `PORT`, and `CLIENT_ORIGIN`.
Change `JWT_SECRET` before deploying anywhere real.

## Notes & next steps

The [Recon Atlas](./client/src/pages/Atlas.jsx) page is still presentational — the natural next
build is making the confidence score explainable (factor breakdown, scenario simulation). The
`logistics.delay` field exists in the schema but is unused; wiring a delayed project is the way
to exercise the "bad news" path. See the brainstorm thread that preceded this build for the full
backlog.
