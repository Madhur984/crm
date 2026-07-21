# Deploying Recon Core to Vercel (static client + serverless API)

One Vercel project serves **both**:

- the **React client** as static files (built to `client/dist`), and
- the **Express API** as a single serverless function at `api/index.js`
  (`vercel.json` rewrites every `/api/*` request to it).

The database stays on **Neon Postgres** — nothing to change there.

```
Browser ──▶ https://your-app.vercel.app         (static React, from client/dist)
        └─▶ https://your-app.vercel.app/api/...  (serverless Express → Prisma → Neon)
```

Because the site and the API share one origin, the frontend keeps calling the
relative path `/api` and there is **no CORS to configure**.

---

## 1. Vercel project settings

In the Vercel dashboard → your project → **Settings → General**:

| Setting | Value |
|---|---|
| **Root Directory** | **`./`** (the repo root — NOT `client`). This is the key change if you first deployed only the client. |
| **Framework Preset** | `Other` (build is driven by `vercel.json`). |
| Build Command | leave default — `vercel.json` sets `npm run vercel-build`. |
| Output Directory | leave default — `vercel.json` sets `client/dist`. |
| Install Command | leave default (`npm install`). |
| Node.js Version | 20.x (or 18.x). |

`vercel-build` runs: `prisma generate` → install client deps → `vite build`.

## 2. Environment variables

**Settings → Environment Variables** (apply to Production, Preview, and Development):

| Name | Value | Notes |
|---|---|---|
| `DATABASE_URL` | your Neon **pooled** connection string | Use the host containing **`-pooler`** (see §3). Serverless needs the pooled endpoint. |
| `JWT_SECRET` | a long random string | e.g. `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"` |
| `JWT_EXPIRES_IN` | `7d` | Optional. |
| `DB_DRIVER` | `postgres` | Optional (this is the default). |

Do **not** set `PORT` or `CLIENT_ORIGIN` on Vercel.

## 3. Use Neon's POOLED connection string

Serverless functions open many short-lived connections; the pooled endpoint
(PgBouncer) prevents exhausting Neon's connection limit.

1. Neon dashboard → your project → **Connection Details**.
2. Toggle **Connection pooling → ON** (or pick the "Pooled connection").
3. Copy that string — its host looks like
   `ep-xxxx-pooler.REGION.aws.neon.tech`. Keep `?sslmode=require`.
4. Paste it as `DATABASE_URL` in Vercel.

If you ever see a Prisma *"prepared statement already exists"* error, append
`&pgbouncer=true` to the URL.

## 4. Deploy

- **Git-connected project:** commit and push — Vercel builds automatically.
- **Or CLI:** `npm i -g vercel` then `vercel --prod` from the repo root.

Your Neon DB is already migrated and seeded, so the demo login works immediately.

## 5. Verify after deploy

```
# health check (should return JSON)
curl https://your-app.vercel.app/api/health
# → {"ok":true,"service":"recon-core-api"}

# login (should return a token)
curl -X POST https://your-app.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@reconcore.app","password":"recon1234"}'
```

Then open the site and sign in with **demo@reconcore.app / recon1234**.

## 6. Troubleshooting

- **All `/api` calls 404** → Root Directory isn't the repo root, or `vercel.json`
  wasn't deployed. Confirm both, then redeploy.
- **`@prisma/client did not initialize` / engine errors** → the build didn't run
  `prisma generate`, or the runtime target is missing. `vercel-build` + the
  `binaryTargets` (`rhel-openssl-3.0.x`, `rhel-openssl-1.0.x`) in
  `server/prisma/schema.prisma` cover this. Trigger a fresh deploy (clear build
  cache) if you changed Node versions.
- **DB connection/timeout errors under load** → make sure `DATABASE_URL` is the
  **pooled** endpoint (§3).
- **First request is slow** → serverless cold start (normal). Subsequent requests
  are fast while the function stays warm.
- **Refreshing a deep link 404s** → the SPA fallback rewrite in `vercel.json`
  handles this; confirm `vercel.json` is present at the repo root.

## Local development is unchanged

`npm run dev` still runs the API on `:4000` and the client on `:5173` with the
Vite proxy. `server/src/index.js` (local listen) and `api/index.js` (Vercel)
both use the same `server/src/app.js`.
