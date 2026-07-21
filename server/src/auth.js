import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import express from "express";
import { db } from "./repo/index.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export function signToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/* Auth middleware — attaches req.user (with org) or 401s */
export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: "Not authenticated" });
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await db.getUserById(payload.sub);
    if (!user) return res.status(401).json({ error: "Invalid session" });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

export const authRouter = express.Router();

authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "Email and password are required" });
  const user = await db.getUserByEmail(String(email).toLowerCase().trim());
  if (!user) return res.status(401).json({ error: "Incorrect email or password" });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Incorrect email or password" });
  res.json({ token: signToken(user), user: publicUser(user) });
});

authRouter.get("/me", requireAuth, async (req, res) => {
  res.json({ user: publicUser(req.user), org: req.user.org || null });
});

export function publicUser(u) {
  return { id: u.id, email: u.email, name: u.name, role: u.role, phone: u.phone || null, orgId: u.orgId };
}
