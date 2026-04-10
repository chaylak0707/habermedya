import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@libsql/client";
import fs from "fs";
import crypto from "crypto";
import multer from "multer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  console.log("Starting server in", process.env.NODE_ENV, "mode...");

  // --- KRİTİK DÜZELTME BÖLGESİ ---
  // Çevre değişkenlerini alırken trim() kullanarak olası boşlukları temizliyoruz.
  const dbUrl = process.env.TURSO_DATABASE_URL?.trim();
  const dbToken = process.env.TURSO_AUTH_TOKEN?.trim();

  if (!dbUrl) {
    console.error("CRITICAL ERROR: TURSO_DATABASE_URL is not set.");
    process.exit(1);
  }

  // Turso bağlantısını kurarken URL objesini manuel doğrulamak hatayı önler
  let turso;
  try {
    console.log(`Connecting to Turso...`);
    turso = createClient({
      url: dbUrl,
      authToken: dbToken || "",
    });
    
    // Bağlantıyı test et
    await turso.execute("SELECT 1");
    console.log("Turso connection successful!");
  } catch (err) {
    console.error("Turso connection failed immediately:", err);
    process.exit(1);
  }
  // --- DÜZELTME BÖLGESİ SONU ---

  // Initialize database schema
  await turso.execute(`CREATE TABLE IF NOT EXISTS config (id TEXT PRIMARY KEY, logoUrl TEXT, siteName TEXT, siteTitle TEXT, siteDescription TEXT, siteKeywords TEXT, footerText TEXT)`);
  await turso.execute(`CREATE TABLE IF NOT EXISTS articles (id TEXT PRIMARY KEY, title TEXT, summary TEXT, content TEXT, author TEXT, category TEXT, createdAt TEXT, imageUrl TEXT, isActive INTEGER, displayOptions TEXT, gallery TEXT, tags TEXT)`);
  await turso.execute(`CREATE TABLE IF NOT EXISTS categories (id TEXT PRIMARY KEY, name TEXT, color TEXT, showOnHomepage INTEGER, showInMenu INTEGER, isActive INTEGER DEFAULT 1)`);
  await turso.execute(`CREATE TABLE IF NOT EXISTS companies (id TEXT PRIMARY KEY, name TEXT, category TEXT, authorizedPerson TEXT, phone TEXT, whatsapp TEXT, address TEXT, district TEXT, website TEXT, description TEXT, logo TEXT, isApproved INTEGER DEFAULT 0, createdAt TEXT)`);
  await turso.execute(`CREATE TABLE IF NOT EXISTS menus (id TEXT PRIMARY KEY, title TEXT, url TEXT, "order" INTEGER, is_active INTEGER DEFAULT 1, parent_id TEXT)`);
  
  // Migration logic (existing code preserved)
  try {
    const tableInfo = await turso.execute("PRAGMA table_info(config)");
    const hasSiteTitle = tableInfo.rows.some(row => row[1] === 'siteTitle');
    if (!hasSiteTitle) {
      await turso.execute(`ALTER TABLE config ADD COLUMN siteTitle TEXT`);
      await turso.execute(`ALTER TABLE config ADD COLUMN siteDescription TEXT`);
      await turso.execute(`ALTER TABLE config ADD COLUMN siteKeywords TEXT`);
    }
    
    const hasFooterText = tableInfo.rows.some(row => row[1] === 'footerText' || (row as any).name === 'footerText');
    if (!hasFooterText) {
      await turso.execute(`ALTER TABLE config ADD COLUMN footerText TEXT`);
    }

    const hasServiceCity = tableInfo.rows.some(row => row[1] === 'serviceCity' || (row as any).name === 'serviceCity');
    if (!hasServiceCity) {
      await turso.execute(`ALTER TABLE config ADD COLUMN serviceCity TEXT DEFAULT 'mersin'`);
    }

    const columnsToAdd = [
      'pharmacyCity', 'pharmacyDistrict',
      'weatherCity', 'weatherDistrict',
      'trafficCity', 'trafficDistrict',
      'prayerCity', 'prayerDistrict'
    ];

    for (const col of columnsToAdd) {
      const hasCol = tableInfo.rows.some(row => row[1] === col || (row as any).name === col);
      if (!hasCol) {
        await turso.execute(`ALTER TABLE config ADD COLUMN ${col} TEXT DEFAULT 'mersin'`);
      }
    }
  } catch (e) {
    console.error("Migration error:", e);
  }

  // Database seed logic (preserves existing logic)
  const adminCount = await turso.execute("SELECT COUNT(*) as count FROM admins");
  if (Number(adminCount.rows[0][0]) === 0) {
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.default.hash('admin123', 10);
    await turso.execute({
      sql: "INSERT INTO admins (id, username, password, role, createdAt) VALUES (?, ?, ?, ?, ?)",
      args: [crypto.randomUUID(), 'admin', hashedPassword, 'superadmin', new Date().toISOString()]
    });
    console.log("Default admin created.");
  }

  // Middleware & Routes (Existing logic remains the same)
  app.use(await import('cookie-parser').then(m => m.default()));
  app.use(express.json({ limit: '50mb' }));

  // API Routes (Login, Query, Weather, etc.) - Preserving your current implementation
  // ... [API rotalarınızın geri kalanı buraya gelecek, bir değişiklik yapmanıza gerek yok] ...

  // Static files and Vite logic
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("FATAL ERROR DURING SERVER STARTUP:");
  console.error(err);
  process.exit(1);
});