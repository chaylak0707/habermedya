import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@libsql/client";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const db = createClient({
  url: process.env.TURSO_DATABASE_URL || "",
  authToken: process.env.TURSO_AUTH_TOKEN || "",
});

/* API */

app.get("/api/test", (req, res) => {
  res.json({ ok: true });
});

app.get("/api/articles", async (req, res) => {
  try {
    const r = await db.execute("SELECT * FROM articles");
    res.json(r.rows || []);
  } catch {
    res.json([]);
  }
});

app.get("/api/categories", async (req, res) => {
  try {
    const r = await db.execute("SELECT * FROM categories");
    res.json(r.rows || []);
  } catch {
    res.json([]);
  }
});

app.get("/api/menus", async (req, res) => {
  try {
    const r = await db.execute("SELECT * FROM menus");
    res.json(r.rows || []);
  } catch {
    res.json([]);
  }
});

app.post("/api/admin/login", (req, res) => {
  res.json({
    success: true,
    token: "ok",
    user: { username: "admin" },
  });
});

/* FRONTEND */

app.use(express.static(path.join(__dirname, "dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

/* START */

app.listen(PORT, () => {
  console.log("Çalıştı:", PORT);
});
