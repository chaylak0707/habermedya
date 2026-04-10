import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@libsql/client";
import fs from "fs";
import crypto from "crypto";
import multer from "multer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // VERİTABANI BAĞLANTISI (Yeni hesabındaki bilgiler Render'dan gelecek)
  const turso = createClient({
    url: process.env.TURSO_DATABASE_URL?.trim() || "",
    authToken: process.env.TURSO_AUTH_TOKEN?.trim() || "",
  });

  try {
    await turso.execute("SELECT 1");
    console.log("Yeni Turso hesabına başarıyla bağlandık!");
  } catch (err) {
    console.error("Bağlantı hatası:", err);
    process.exit(1);
  }

  // TABLOLARI OTOMATİK OLUŞTUR (Yeni hesapta boş olduğu için burası önemli)
  await turso.execute(`CREATE TABLE IF NOT EXISTS config (id TEXT PRIMARY KEY, logoUrl TEXT, siteName TEXT, siteTitle TEXT, siteDescription TEXT, siteKeywords TEXT, footerText TEXT)`);
  await turso.execute(`CREATE TABLE IF NOT EXISTS articles (id TEXT PRIMARY KEY, title TEXT, summary TEXT, content TEXT, author TEXT, category TEXT, createdAt TEXT, imageUrl TEXT, isActive INTEGER)`);
  await turso.execute(`CREATE TABLE IF NOT EXISTS categories (id TEXT PRIMARY KEY, name TEXT, color TEXT, isActive INTEGER DEFAULT 1)`);
  await turso.execute(`CREATE TABLE IF NOT EXISTS admins (id TEXT PRIMARY KEY, username TEXT, password TEXT, role TEXT, createdAt TEXT)`);

  app.use(express.json({ limit: '50mb' }));

  // PRODUCTION AYARLARI VE HATA VEREN YERİN DÜZELTİLMESİ
  if (process.env.NODE_ENV === "production") {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    
    // KRİTİK DÜZELTME: Render'ın hata vermemesi için '*all' yerine '/:any*' kullanıyoruz
    app.get('/:any*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Sunucu aktif: Port ${PORT}`);
  });
}

startServer();