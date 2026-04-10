import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@libsql/client";
import fs from "fs";

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

  // Genel Sorgu
  app.post('/api/query', async (req, res) => {
    try {
      const { sql, args } = req.body;
      const result = await turso.execute({ sql, args: args || [] });
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin ve Diğer Tüm Eksik API İstekleri İçin Joker Rota
  // (Menus, companies, logout vs. hepsini kapsar)
  app.all(['/api/admin/*', '/api/menus', '/api/categories', '/api/articles', '/api/weather', '/api/market'], (req, res) => {
    // Frontend çökmesin diye en azından bir nesne veya dizi dönüyoruz
    if (req.path.includes('login') || req.path.includes('me')) {
      return res.json({ success: true, user: { role: 'admin', username: 'admin' } });
    }
    res.json([]); 
  });

  // --- Frontend Servisi ---
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
      res.status(404).send("Build klasörü bulunamadı. Lütfen npm run build yapın.");
    }
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Sunucu aktif: Port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Kritik hata:", err);
  process.exit(1);
});
