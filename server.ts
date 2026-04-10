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

  // 1. Veritabanı Bağlantısı (Hata olsa bile sunucuyu çökertmemesi için try-catch içinde)
  let turso: any;
  try {
    turso = createClient({
      url: (process.env.TURSO_DATABASE_URL || "").trim(),
      authToken: (process.env.TURSO_AUTH_TOKEN || "").trim(),
    });
    console.log("Veritabanı istemcisi oluşturuldu.");
  } catch (dbErr) {
    console.error("Turso bağlantı hatası:", dbErr);
  }

  app.use(express.json({ limit: '50mb' }));

  // 2. Uploads ve Statik Dosyalar (Önce bunlar tanımlanmalı)
  const uploadDir = path.join(__dirname, 'uploads');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
  app.use('/uploads', express.static(uploadDir));

  // 3. API Rotaları (Regex kullanmadan, en basit haliyle)
  app.post('/api/query', async (req, res) => {
    try {
      const { sql, args } = req.body;
      const result = await turso.execute({ sql, args: args || [] });
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin login için geçici cevap (Hata almamak için)
  app.all(['/api/admin/login', '/api/admin/me'], (req, res) => {
    res.json({ success: true, user: { role: 'admin' } });
  });

  // 4. Production Ayarları
  const distPath = path.join(__dirname, 'dist');
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    
    // TÜM ROTALARI React'e yönlendir (En sağlam yöntem)
    app.get('*', (req, res) => {
      if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: "API bulunamadı" });
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // 5. Sunucuyu Dinle
  app.listen(PORT, () => {
    console.log(`Sunucu aktif: Port ${PORT}`);
  });
}

// Kritik: Hata yakalayıcıyı dışarıda tutuyoruz
startServer().catch(err => {
  console.error("BAŞLATMA HATASI DETAYI:", err);
  process.exit(1);
});
