import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@libsql/client";
import fs from "fs";
import multer from "multer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Sunucuyu başlatan ana fonksiyon
async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  console.log("Sunucu hazirlaniyor...");

  // Turso Baglantisi
  const turso = createClient({
    url: (process.env.TURSO_DATABASE_URL || "").trim(),
    authToken: (process.env.TURSO_AUTH_TOKEN || "").trim(),
  });

  app.use(express.json({ limit: '50mb' }));

  // Klasör Kontrolü
  const uploadDir = path.join(__dirname, 'uploads');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
  app.use('/uploads', express.static(uploadDir));

  // --- API Rotalari (En Sade Hal) ---
  app.post('/api/query', async (req, res) => {
    try {
      const { sql, args } = req.body;
      const result = await turso.execute({ sql, args: args || [] });
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Frontend'in çökmesini engelleyen boş rotalar
  app.get(['/api/menus', '/api/categories', '/api/articles'], (req, res) => {
    res.json([]);
  });

  app.all(['/api/admin/login', '/api/admin/me', '/api/weather', '/api/market'], (req, res) => {
    res.json({ success: true, data: [] });
  });

  // --- Production Dosya Servisi ---
  const distPath = path.join(__dirname, 'dist');
  
  // Statik dosyalari sun (JS, CSS)
  app.use(express.static(distPath));

  // Catch-all: Her seyi index.html'e yönlendir (Middleware yöntemi)
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    const indexPath = path.join(distPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send("Build klasörü bulunamadi.");
    }
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Sunucu aktif: Port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Baslatma hatasi:", err);
  process.exit(1);
});
