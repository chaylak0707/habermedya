import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@libsql/client";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // Turso Baglantisi
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
     FAKE API (çökmesin diye)
  ========================= */
  app.use("/api", (req, res) => {
    const url = req.url;

    if (url.includes("categories")) {
      return res.json([
        { id: 1, name: "Genel", slug: "genel", isActive: 1 },
      ]);
    }

    if (url.includes("login") || url.includes("me")) {
      return res.json({
        success: true,
        user: { role: "admin" },
      });
    }

    return res.json([]);
  });

  /* =========================
     REACT ROUTER (ÇOK ÖNEMLİ)
  ========================= */
  app.get("*", (req, res) => {
    const indexPath = path.join(distPath, "index.html");

    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }

    res.status(404).send("Build dosyası bulunamadı!");
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Sunucu aktif: Port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Başlatma hatası:", err);
  process.exit(1);
});
