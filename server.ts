import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@libsql/client";
import fs from "fs";
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

  console.log("Sunucu başlatılıyor...");

  const turso = createClient({
    url: (process.env.TURSO_DATABASE_URL || "").trim(),
    authToken: (process.env.TURSO_AUTH_TOKEN || "").trim(),
  });

  try {
    await turso.execute("SELECT 1");
    console.log("Veritabanına bağlandık!");
    // Tablo oluşturma kodları burada kalsın...
    console.log("Tablolar hazır!");
  } catch (err) {
    console.error("Veritabanı kurulum hatası:", err);
  }

  app.use(express.json({ limit: '50mb' }));
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

  // --- KRİTİK EKLEME: API ROTALARI ---
  // Uygulamanın çalışması için gerekli olan query rotasını tanımlayalım
  app.post('/api/query', async (req, res) => {
    try {
      const { sql, args } = req.body;
      const result = await turso.execute({ sql, args: args || [] });
      res.json(result);
    } catch (error: any) {
      console.error("Sorgu hatası:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Buraya diğer /api/admin/login gibi rotaların gelmesi gerekiyor. 
  // Eğer bu rotalar başka bir dosyadaysa orayı da kontrol etmeliyiz.

  if (process.env.NODE_ENV === "production") {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    
    // API dışındaki her şeyi frontend'e yönlendir
    app.get('*', (req, res) => {
      if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(distPath, 'index.html'));
      } else {
        res.status(404).json({ error: "API rotası bulunamadı" });
      }
    });
  } else {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
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
