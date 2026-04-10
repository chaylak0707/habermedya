import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@libsql/client";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // Turso
  const turso = createClient({
    url: (process.env.TURSO_DATABASE_URL || "").trim(),
    authToken: (process.env.TURSO_AUTH_TOKEN || "").trim(),
  });

  // JSON
  app.use(express.json({ limit: "50mb" }));

  // STATIC
  const distPath = path.join(__dirname, "dist");
  app.use(express.static(distPath));

  /* =========================
     GERÇEK API
  ========================= */
  app.post("/api/query", async (req, res) => {
    try {
      const { sql, args } = req.body;

      const result = await turso.execute({
        sql,
        args: args || [],
      });

      res.json(result);
    } catch (error: any) {
      console.error("Query hatası:", error);
      res.status(500).json({ error: error.message });
    }
  });

  /* =========================
     FAKE API (frontend çökmesin)
  ========================= */
  app.use("/api", (req, res) => {
    const url = req.url;

    // CATEGORIES
    if (url.includes("categories")) {
      return res.json([
        {
          id: 1,
          name: "Genel",
          slug: "genel",
          title: "Genel",
          description: "Genel kategori",
          isActive: 1,
        },
      ]);
    }

    // MENUS
    if (url.includes("menus")) {
      return res.json([
        {
          id: 1,
          name: "Ana Menü",
          slug: "ana-menu",
          items: [],
        },
      ]);
    }

    // ARTICLES
    if (url.includes("articles")) {
      return res.json([
        {
          id: 1,
          title: "Demo içerik",
          slug: "demo",
          content: "Test içerik",
        },
      ]);
    }

    // LOGIN / ME
    if (url.includes("login") || url.includes("me")) {
      return res.json({
        success: true,
        user: {
          id: 1,
          name: "Admin",
          role: "admin",
        },
      });
    }

    return res.json([]);
  });

  /* =========================
     REACT ROUTER FIX (EN GARANTİLİ)
  ========================= */
  app.use((req, res) => {
    const indexPath = path.join(distPath, "index.html");

    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }

    res.status(404).send("Build dosyası yok!");
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Sunucu aktif: Port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Başlatma hatası:", err);
  process.exit(1);
});
