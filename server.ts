import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@libsql/client";
import fs from "fs";
import crypto from "crypto";
import multer from "multer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
  limits: { fileSize: 10 * 1024 * 1024 }
});

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  console.log("Starting server in", process.env.NODE_ENV, "mode...");

  const dbUrl = process.env.TURSO_DATABASE_URL?.trim();
  const dbToken = process.env.TURSO_AUTH_TOKEN?.trim();

  if (!dbUrl) {
    console.error("CRITICAL ERROR: TURSO_DATABASE_URL is not set.");
    process.exit(1);
  }

  const turso = createClient({
    url: dbUrl,
    authToken: dbToken || "",
  });

  try {
    console.log(`Connecting to Turso...`);
    await turso.execute("SELECT 1");
    console.log("Turso connection successful!");
  } catch (err) {
    console.error("Turso connection failed:", err);
    process.exit(1);
  }

  // Veritabanı tablolarını oluşturma (mevcut kodun)
  await turso.execute(`CREATE TABLE IF NOT EXISTS config (id TEXT PRIMARY KEY, logoUrl TEXT, siteName TEXT, siteTitle TEXT, siteDescription TEXT, siteKeywords TEXT, footerText TEXT)`);
  // ... (Diğer CREATE TABLE sorguların burada kalsın)

  app.use(await import('cookie-parser').then(m => m.default()));
  app.use(express.json({ limit: '50mb' }));

  // --- API ROTALARIN BURAYA GELECEK ---
  // (Daha önceki mesajdaki API rotalarını aynen koruyabilirsin)

  // --- HATA VEREN KISIM BURASIYDI, DÜZELTİLDİ ---
  if (process.env.NODE_ENV === "production") {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    
    // '*' yerine '(.*)' veya '/*' kullanımı hatayı çözer
    app.get('/*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
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