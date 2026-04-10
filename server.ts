import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createClient } from "@libsql/client";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

/* ================= MIDDLEWARE ================= */

app.use(express.json());

// 🔥 API her zaman JSON dönsün (HTML hatasını keser)
app.use((req, res, next) => {
  if (req.path.startsWith("/api")) {
    res.setHeader("Content-Type", "application/json");
  }
  next();
});

/* ================= DATABASE ================= */

const db = createClient({
  url: process.env.TURSO_DATABASE_URL || "",
  authToken: process.env.TURSO_AUTH_TOKEN || "",
});

/* ================= STATIC ================= */

const distPath = path.join(__dirname, "dist");
app.use(express.static(distPath));

/* ================= API ================= */

// CONFIG
app.get("/api/config", async (req, res) => {
  try {
    const r = await db.execute("SELECT * FROM config LIMIT 1");
    res.json(r.rows[0] || {});
  } catch (e) {
    console.error(e);
    res.json({});
  }
});

// CATEGORIES
app.get("/api/categories", async (req, res) => {
  try {
    const r = await db.execute("SELECT * FROM categories");
    res.json(r.rows || []);
  } catch (e) {
    console.error(e);
    res.json([]);
  }
});

// MENUS
app.get("/api/menus", async (req, res) => {
  try {
    const r = await db.execute("SELECT * FROM menus");
    res.json(r.rows || []);
  } catch (e) {
    console.error(e);
    res.json([]);
  }
});

// ARTICLES
app.get("/api/articles", async (req, res) => {
  try {
    const r = await db.execute("SELECT * FROM articles");
    res.json(r.rows || []);
  } catch (e) {
    console.error(e);
    res.json([]);
  }
});

// 🔥 QUERY (frontend bunu kullanıyor)
app.post("/api/query", async (req, res) => {
  try {
    const { sql } = req.body || {};

    if (!sql) {
      return res.status(400).json({ error: "sql yok" });
    }

    const r = await db.execute(sql);
    res.json({ rows: r.rows });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// 🔥 ADMIN LOGIN (frontend uyumlu)
app.post("/api/admin/login", (req, res) => {
  try {
    const { username, password } = req.body || {};

    if (username === "admin" && password === "admin") {
      return res.json({
        success: true,
        token: "ok",
        user: { username: "admin" },
      });
    }

    return res.status(401).json({
      success: false,
      message: "Hatalı giriş",
    });
  } catch (e) {
    return res.status(500).json({ success: false });
  }
});

/* ================= FRONTEND ================= */

// 🔥 SPA FIX (EN KRİTİK)
app.get("*", (req, res) => {
  const indexPath = path.join(distPath, "index.html");

  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(500).send("dist yok");
  }
});

/* ================= START ================= */

app.listen(PORT, () => {
  console.log("Server çalışıyor:", PORT);
});
