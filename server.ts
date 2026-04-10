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

  console.log("Sunucu başlatılıyor...");

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

  app.all(['/api/admin/login', '/api/admin/me'], (req, res) => {
    res.json({ success: true, user: { role: 'admin' } });
  });

  // --- Üretim (Production) Ayarları ---
  const distPath = path.join(__dirname, 'dist');
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    
    // HATA BURADAYDI: '*' yerine '{/*path}' kullanarak yeni kütüphaneyi mutlu ediyoruz
    app.get('{/*path}', (req, res) => {
      // Eğer istek /api ile başlıyorsa frontend'e yönlendirme, 404 ver
      if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: "API bulunamadı" });
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Sunucu aktif: Port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error("KRİTİK HATA:", err);
  process.exit(1);
});
