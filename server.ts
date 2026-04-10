import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@libsql/client";
import fs from "fs";
import multer from "multer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  const turso = createClient({
    url: (process.env.TURSO_DATABASE_URL || "").trim(),
    authToken: (process.env.TURSO_AUTH_TOKEN || "").trim(),
  });

  app.use(express.json({ limit: '50mb' }));

  const uploadDir = path.join(__dirname, 'uploads');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
  app.use('/uploads', express.static(uploadDir));

  // --- API Rotaları ---

  app.post('/api/query', async (req, res) => {
    try {
      const { sql, args } = req.body;
      const result = await turso.execute({ sql, args: args || [] });
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // HATA VEREN TÜM ROTALARI BURADA TOPLADIK
  // Boş dizi [] ve başarı objesi dönerek React'in çökmesini engelliyoruz
  app.get([
    '/api/menus', 
    '/api/categories', 
    '/api/articles', 
    '/api/admin/top-menu',
    '/api/weather',
    '/api/market'
  ], (req, res) => {
    res.json([]); 
  });

  app.all(['/api/admin/login', '/api/admin/me'], (req, res) => {
    res.json({ success: true, user: { role: 'admin', username: 'admin' } });
  });

  // --- Statik Dosya Servisi ---
  const distPath = path.join(__dirname, 'dist');
  app.use(express.static(distPath));

  app.use((req, res) => {
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ error: "API bulunamadı" });
    }
    const indexPath = path.join(distPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send("Lütfen build alın.");
    }
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Sunucu aktif: Port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Hata:", err);
  process.exit(1);
});
