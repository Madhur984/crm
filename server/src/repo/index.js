/* Selects the data driver via DB_DRIVER ("sqlite" | "firestore"). Defaults to
   sqlite so local dev works with no Firebase credentials. Both drivers implement
   the same interface (see sqlite.js / firestore.js). */
import { sqliteRepo } from "./sqlite.js";

const driver = (process.env.DB_DRIVER || "sqlite").toLowerCase();

let db = sqliteRepo;
if (driver === "firestore") {
  // Indirect specifier so bundlers (Vercel @vercel/nft) don't statically trace
  // firestore.js — and its heavy firebase-admin dep — into the SQL/Postgres build.
  const mod = "./firestore.js";
  const { firestoreRepo } = await import(mod);
  db = firestoreRepo;
}

console.log(`[repo] data driver: ${driver === "firestore" ? "firestore" : "prisma (SQL)"}`);

export { db };
