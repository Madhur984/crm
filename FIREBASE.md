# Firebase (Firestore) — free-tier setup

The app runs on a **selectable data driver**. Locally it defaults to SQLite (a file,
zero setup). Switch to **Firestore** and your data lives in Firebase's cloud on the
**free Spark plan** — which is what you want for hosting, because the data no longer
depends on the server's disk (it survives redeploys, restarts, and multiple instances).

Nothing in the frontend or API changes. You flip one env var.

```
DB_DRIVER = "sqlite"   →  local SQLite file  (default)
DB_DRIVER = "firestore" →  Firebase Firestore (cloud)
```

## Free tier at a glance (Spark plan — no credit card)

| Resource | Free daily allowance |
|---|---|
| Stored data | 1 GiB total |
| Document reads | 50,000 / day |
| Document writes | 20,000 / day |
| Document deletes | 20,000 / day |

This portal is read-mostly and tiny, so you'll use a fraction of that. Each project
is stored as **one document**, so opening a project = **one read**.

---

## Setup — 6 steps (~10 minutes)

### 1. Create a Firebase project
Go to <https://console.firebase.google.com> → **Add project** → name it (e.g.
`recon-core`) → you can disable Google Analytics → **Create project**. No billing required.

### 2. Create the Firestore database
In the project: **Build → Firestore Database → Create database** →
choose **Production mode** → pick a region close to your users → **Enable**.

### 3. Generate a service-account key (for the server)
**⚙️ Project settings → Service accounts → Generate new private key** → **Generate key**.
A JSON file downloads. This is a secret — treat it like a password.

### 4. Give the server the key
Put the downloaded file here (the name is already git-ignored):

```
server/serviceAccountKey.json
```

> Prefer an env var instead of a file (e.g. for hosting)? Set
> `FIREBASE_SERVICE_ACCOUNT_JSON` to the file's contents as a single line. Do not commit either.

### 5. Point the app at Firestore
Edit **`server/.env`**:

```ini
DB_DRIVER="firestore"
FIREBASE_PROJECT_ID="your-project-id"          # shown in Project settings
FIREBASE_SERVICE_ACCOUNT_PATH="./serviceAccountKey.json"
```

### 6. Seed Firestore, then run
From the `server/` folder:

```bash
npm run db:seed:firebase     # loads org, users, projects, documents into Firestore
```

Then start the app normally (from the repo root):

```bash
npm run dev
```

On boot the server logs `[repo] data driver: firestore`. Sign in with the same demo
credentials (`demo@reconcore.app` / `recon1234`) — now served from the cloud. Open the
Firestore console and you'll see the `projects`, `users`, `documents`, `tickets`, and
`messages` collections populate as you use the app.

---

## Security rules (important)

All access goes through the **Admin SDK on the server**, which bypasses Firestore
security rules. The browser never talks to Firestore directly, so lock client access
down completely. In **Firestore → Rules**, publish:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;   // only the server (Admin SDK) may access data
    }
  }
}
```

Your JWT-authenticated Express API remains the only way in — same as with SQLite.

---

## Data model (Firestore collections)

| Collection | Doc id | Contents |
|---|---|---|
| `organizations` | `org_nordwerk` | `{ name }` |
| `users` | `user_demo`, `user_alvarez` | `{ email, passwordHash, name, role, orgId }` |
| `projects` | `p1`, `p2` | full denormalized project (bom, clarifications, invoices, activity embedded) |
| `documents` | `doc_0…` | `{ projectId, project, name, type, version, date, by, status, order }` |
| `tickets` | auto | `{ code, projectId, userId, category, priority, description, status, createdAt }` |
| `messages` | auto | `{ projectId, userId, channel, refId, sender, text, createdAt }` |

Embedded clarifications/invoices carry a composite `dbId` of `"projectId:code"` (e.g.
`p1:INV-8822`) so the reply/pay endpoints can find their parent project in one read.

---

## Hosting with Firestore

On your host (VPS, Render, Railway, Fly, Cloud Run, etc.), set the same env vars —
put the key in **`FIREBASE_SERVICE_ACCOUNT_JSON`** as a secret rather than committing a
file. Because data now lives in Firestore, the app is **stateless**: it can redeploy,
restart, or scale to multiple instances without losing anything. That's the fix for the
"where does my data go when I host" problem.

## Switching back to SQLite

Set `DB_DRIVER="sqlite"` in `server/.env`. (Local dev default; no Firebase needed.)

## Troubleshooting

- **`no Firebase credentials found`** — `DB_DRIVER=firestore` but the key file/env isn't
  set. Re-check step 4/5; the path is relative to the `server/` folder.
- **`PERMISSION_DENIED` / `5 NOT_FOUND`** — Firestore database not created yet (step 2),
  or wrong `FIREBASE_PROJECT_ID`.
- **`UNAUTHENTICATED`** — the service-account JSON is wrong or truncated; regenerate it.
- **Nothing in the app** — you didn't run `npm run db:seed:firebase`, or you're pointed
  at a different project than you seeded.
