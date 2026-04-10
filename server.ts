import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@libsql/client";
import fs from "fs";
import crypto from "crypto";
import multer from "multer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Multer Ayarları (Dosya Yükleme)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
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

  console.log("Sunucu başlatılıyor...", process.env.NODE_ENV);

  // Veritabanı Bilgilerini Al
  const dbUrl = process.env.TURSO_DATABASE_URL?.trim();
  const dbToken = process.env.TURSO_AUTH_TOKEN?.trim();

  if (!dbUrl) {
    console.error("KRİTİK HATA: TURSO_DATABASE_URL tanımlanmamış.");
    process.exit(1);
  }

  // Turso Bağlantısı
  const turso = createClient({
    url: dbUrl,
    authToken: dbToken || "",
  });

  try {
    await turso.execute("SELECT 1");
    console.log("Yeni Turso hesabına bağlantı başarılı!");
  } catch (err) {
    console.error("Veritabanı bağlantı hatası:", err);
    process.exit(1);
  }

  // Tabloları Otomatik Oluştur (Yeni hesap boş olduğu için bu kısım hayat kurtarır)
  await turso.execute(`CREATE TABLE IF NOT EXISTS config (id TEXT PRIMARY KEY, logoUrl TEXT, siteName TEXT, siteTitle TEXT, siteDescription TEXT, siteKeywords TEXT, footerText TEXT)`);
  await turso.execute(`CREATE TABLE IF NOT EXISTS articles (id TEXT PRIMARY KEY, title TEXT, summary TEXT, content TEXT, author TEXT, category TEXT, createdAt TEXT, imageUrl TEXT, isActive INTEGER)`);
  await turso.execute(`CREATE TABLE IF NOT EXISTS categories (id TEXT PRIMARY KEY, name TEXT, color TEXT, isActive INTEGER DEFAULT 1)`);
  await turso.execute(`CREATE TABLE IF NOT EXISTS admins (id TEXT PRIMARY KEY, username TEXT, password TEXT, role TEXT, createdAt TEXT)`);
  await turso.execute(`CREATE TABLE IF NOT EXISTS companies (id TEXT PRIMARY KEY, name TEXT, category TEXT, authorizedPerson TEXT, phone TEXT, whatsapp TEXT, address TEXT, district TEXT, website TEXT, description TEXT, logo TEXT, isApproved INTEGER DEFAULT 0, createdAt TEXT)`);

  // Middleware
  app.use(express.json({ limit: '50mb' }));

  // --- API Rotaları (Burası Admin Panelinden gelen işlemleri yapar) ---
  // Not: Eğer özel API rotaların varsa onları buraya ekleyebilirsin.

  // Production Ayarları (Render için Kritik Bölüm)
  if (process.env.NODE_ENV === "production") {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    
    // Render hatasını çözen joker yönlendirme
    app.get('/:any*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    // Development (Vite)
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });