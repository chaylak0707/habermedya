import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@libsql/client";
import fs from "fs";
import multer from "multer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Dosya yükleme ayarları
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

  console.log("Sunucu başlatılıyor...");

  // Yeni Turso bağlantısı
  const turso = createClient({
    url: process.env.TURSO_DATABASE_URL?.trim() || "",
    authToken: process.env.TURSO_AUTH_TOKEN?.trim() || "",
  });

  try {
    await turso.execute("SELECT 1");
    console.log("Veritabanına bağlandık!");

    // TABLOLARI OTOMATİK OLUŞTURMA
    await turso.execute(`CREATE TABLE IF NOT EXISTS config (id TEXT PRIMARY KEY, logoUrl TEXT, siteName TEXT, siteTitle TEXT, siteDescription TEXT, siteKeywords TEXT, footerText TEXT)`);
    await turso.execute(`CREATE TABLE IF NOT EXISTS articles (id TEXT PRIMARY KEY, title TEXT, summary TEXT, content TEXT, author TEXT, category TEXT, createdAt TEXT, imageUrl TEXT, isActive INTEGER)`);
    await turso.execute(`CREATE TABLE IF NOT EXISTS categories (id TEXT PRIMARY KEY, name TEXT, color TEXT, isActive INTEGER DEFAULT 1)`);
    await turso.execute(`CREATE TABLE IF NOT EXISTS admins (id TEXT PRIMARY KEY, username TEXT, password TEXT, role TEXT, createdAt TEXT)`);
    await turso.execute(`CREATE TABLE IF NOT EXISTS companies (id TEXT PRIMARY KEY, name TEXT, category TEXT, authorizedPerson TEXT, phone TEXT, whatsapp TEXT, address TEXT, district TEXT, website TEXT, description TEXT, logo TEXT, isApproved INTEGER DEFAULT 0, createdAt TEXT)`);
    
    console.log("Tablolar hazır!");
  } catch (err) {
    console.error("Veritabanı kurulum hatası:", err);
  }

  app.use(express.json({ limit: '50mb' }));
  
  // Statik dosyalar için (uploads klasörü vb.)
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

  // --- API ROTALARINI BURAYA EKLEYEBİLİRSİN ---

  if (process.env.NODE_ENV === "production") {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    
    // RENDER HATASINI ÇÖZEN DÜZELTİLMİŞ YÖNLENDİRME
    // "/:any*" yerine "*" kullanarak uyumluluk sağlandı.
    app.get('*', (req, res) => {
      // API isteklerini dışarıda tutmak için basit bir kontrol (isteğe bağlı)
      if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: "API rotası bulunamadı" });
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({ 
      server: { middlewareMode: true }, 
      appType: "spa" 
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Sunucu aktif: Port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Başlatma hatası:", err);
  process.exit(1);
});
