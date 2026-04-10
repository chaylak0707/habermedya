import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createClient } from "@libsql/client";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// TURSO
const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

// STATIC
const distPath = path.join(__dirname, "dist");
app.use(express.static(distPath));

/* ================= API ================= */

// CONFIG
app.get("/api/config", async (req, res) => {
  try {
    const r = await db.execute("SELECT * FROM config LIMIT 1");
    res.json(r.rows[0] || {});
  } catch (e) {
    res.json({});
  }
});

// CATEGORIES
app.get("/api/categories", async (req, res) => {
  try {
    const r = await db.execute("SELECT * FROM categories");
    res.json(r.rows || []);
  } catch {
    res.json([]);
  }
});

// MENUS
app.get("/api/menus", async (req, res) => {
  try {
    const r = await db.execute("SELECT * FROM menus");
    res.json(r.rows || []);
  } catch {
    res.json([]);
  }
});

// ARTICLES
app.get("/api/articles", async (req, res) => {
  try {
    const r = await db.execute("SELECT * FROM articles");
    res.json(r.rows || []);
  } catch {
    res.json([]);
  }
});

/* 🔥 EKLEDİM */

// QUERY (frontend bunu kullanıyor)
app.post("/api/query", async (req, res) => {
  try {
    const { sql } = req.body;

    if (!sql) {
      return res.status(400).json({ error: "sql yok" });
    }

    const r = await db.execute(sql);
    res.json({ rows: r.rows });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ADMIN LOGIN (fake basit giriş)
app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;

  if (username === "admin" && password === "admin") {
    return res.json({ success: true, token: "ok" });
  }

  res.status(401).json({ success: false });
});

/* ===================================== */

// FRONTEND
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(PORT, () => {
  console.log("Server çalışıyor:", PORT);
});
