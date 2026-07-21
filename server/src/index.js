/* Local dev / self-hosted entry — starts a long-running HTTP server.
   On Vercel the app is imported by /api/index.js instead (no listen). */
import app from "./app.js";

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Recon Core API listening on http://localhost:${PORT}`));
