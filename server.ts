import express from "express";
import path from "path";
import fs from "fs";
import { createClient } from "@libsql/client";

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ TURSO BAĞLANTI
const turso = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

app.use(express.json());

// ✅ STATIC
const distPath = path.join(__dirname, "dist");
app.use(express.static(distPath));

/* =========================
   ✅ GERÇEK API ROUTES
========================= */

// KATEGORİLER
app.get("/api/categories", async (req, res) => {
  try {
    const result = await turso.execute(`SELECT * FROM categories`);
    res.json(result.rows);
  } catch (err: any) {
    console.error("categories hata:", err);
    res.json([]);
  }
});

// MENÜLER
app.get("/api/menus", async (req, res) => {
  try {
    const result = await turso.execute(`SELECT * FROM menus`);
    res.json(result.rows);
  } catch (err: any) {
    console.error("menus hata:", err);
    res.json([]);
  }
});

// ARTİCLE
app.get("/api/articles", async (req, res) => {
  try {
    const result = await turso.execute(`SELECT * FROM articles`);
    res.json(result.rows);
  } catch (err: any) {
    console.error("articles hata:", err);
    res.json([]);
  }
});

// LOGIN (fake kalsın şimdilik)
app.post("/api/login", (req, res) => {
  res.json({ success: true, user: { role: "admin" } });
});

// TEST
app.get("/api/test-db", async (req, res) => {
  try {
    const result = await turso.execute("SELECT 1");
    res.json({ ok: true, result });
  } catch (err: any) {
    res.json({ ok: false, error: err.message });
  }
});

/* =========================
   ✅ REACT FALLBACK
========================= */

app.get("/*", (req, res) => {
  const indexPath = path.join(distPath, "index.html");

  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }

  res.status(404).send("Build yok");
});

/* ========================= */

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server çalışıyor:", PORT);
});
