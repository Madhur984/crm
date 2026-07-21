/* Express app factory — exported WITHOUT app.listen so it can run both as a
   long-running local server (see index.js) and as a Vercel serverless function
   (see /api/index.js at the repo root). */
import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import { authRouter, requireAuth } from "./auth.js";
import { api } from "./routes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Same-origin on Vercel (frontend + /api served from one domain) so CORS is a
// no-op there; `true` reflects the request origin for any cross-origin dev use.
app.use(cors({ origin: process.env.CLIENT_ORIGIN || true }));
app.use(express.json());

// Health check
app.get("/api/health", (_req, res) => res.json({ ok: true, service: "recon-core-api" }));

// Public auth routes
app.use("/api/auth", authRouter);

// Everything else under /api requires a valid token
app.use("/api", requireAuth, api);

// Serve the built client only when this runs as a single local server
// (index.js). On Vercel the static site is served by the CDN, so this is skipped.
const clientDist = path.resolve(__dirname, "../../client/dist");
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

// JSON 404 for unmatched API routes
app.use("/api", (_req, res) => res.status(404).json({ error: "Not found" }));

// Error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

export default app;
