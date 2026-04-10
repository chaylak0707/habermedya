import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createClient } from "@libsql/client";

// __dirname fix (zorunlu)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// TURSO
const turso = createClient({
  url: process.env.TURSO_DATABASE_URL || "",
  authToken: process.env.TURSO_AUTH_TOKEN || "",
});

app.use(express.json());

// dist yolu
const distPath = path.join(__dirname, "dist");
app.use(express.static(distPath));

/* =========================
   API
========================= */

app.get("/api/categories", async (req, res) => {
  try {
    const result = await turso.execute("SELECT * FROM categories");
    res.json(result.rows || []);
  } catch (e) {
    console.error("categories error:", e);
    res.json([]);
  }
});

app.get("/api/menus", async (req, res) => {
  try {
    const result = await turso.execute("SELECT * FROM menus");
    res.json(result.rows || []);
  } catch (e) {
    console.error("menus error:", e);
    res.json([]);
  }
});

app.get("/api/articles", async (req, res) => {
  try {
    const result = await turso.execute("SELECT * FROM articles");
    res.json(result.rows || []);
  } catch (e) {
    console.error("articles error:", e);
    res.json([]);
  }
});

// TEST
app.get("/api/test-db", async (req, res) => {
  try {
    const result = await turso.execute("SELECT 1");
    res.json({ ok: true, result });
  } catch (e: any) {
    res.json({ ok: false, error: e.message });
  }
});

/* =========================
   FRONTEND
========================= */

app.get(/.*/, (req, res) => {
  const indexPath = path.join(__dirname, "dist", "index.html");

  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(500).send("dist klasörü yok");
  }
});

/* ========================= */

app.listen(PORT, () => {
  console.log("Server çalışıyor:", PORT);
});
