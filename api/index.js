/* Vercel serverless function. All /api/* requests are rewritten here (see
   vercel.json) and handled by the Express app. Express apps are valid
   (req, res) handlers, so we can export the app directly. */
import app from "../server/src/app.js";

export default app;
