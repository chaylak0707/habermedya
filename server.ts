import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@libsql/client";
import fs from "fs";
import crypto from "crypto";

import multer from "multer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configure multer for file uploads
const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(__dirname, 'uploads');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }
    cb(null, UPLOADS_DIR);
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

  app.use(await import('cookie-parser').then(m => m.default()));
  app.use(express.json({ limit: '50mb' }));

  // Serve static files from uploads directory with Firebase fallback
  app.use('/uploads', async (req, res, next) => {
    const filePath = path.join(UPLOADS_DIR, req.path);
    
    // If file exists locally, serve it
    if (fs.existsSync(filePath) && fs.lstatSync(filePath).isFile()) {
      return express.static(UPLOADS_DIR)(req, res, next);
    }

    // If file doesn't exist locally, try to proxy from Firebase Storage as a fallback
    const bucket = "gen-lang-client-0675548272.firebasestorage.app";
    const firebasePath = `uploads${req.path}`;
    const firebaseURL = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(firebasePath)}?alt=media`;

    try {
      const response = await fetch(firebaseURL);
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType) res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'public, max-age=86400');
        const arrayBuffer = await response.arrayBuffer();
        return res.send(Buffer.from(arrayBuffer));
      }
    } catch (error) {
      console.error(`Firebase fallback failed for ${req.path}:`, error);
    }

    next();
  });

  // API routes that don't depend on DB initialization can be registered here
  app.get("/api/health", (req, res) => res.json({ status: "ok" }));

  console.log("Starting server in", process.env.NODE_ENV, "mode...");

  // Validate critical environment variables
  const dbUrl = process.env.TURSO_DATABASE_URL?.trim();
  const dbToken = process.env.TURSO_AUTH_TOKEN?.trim();

  if (!dbUrl) {
    console.error("CRITICAL ERROR: TURSO_DATABASE_URL is not set.");
    process.exit(1);
  }

  console.log(`Connecting to Turso at: ${dbUrl.split('.io')[0]}.io...`);

  // Turso client
  const turso = createClient({
    url: dbUrl,
    authToken: dbToken || "",
  });

  // Initialize database schema
  await turso.execute(`CREATE TABLE IF NOT EXISTS config (id TEXT PRIMARY KEY, logoUrl TEXT, siteName TEXT, siteTitle TEXT, siteDescription TEXT, siteKeywords TEXT, footerText TEXT)`);
  await turso.execute(`CREATE TABLE IF NOT EXISTS articles (id TEXT PRIMARY KEY, title TEXT, summary TEXT, content TEXT, author TEXT, category TEXT, createdAt TEXT, imageUrl TEXT, isActive INTEGER, displayOptions TEXT, gallery TEXT, tags TEXT)`);
  await turso.execute(`CREATE TABLE IF NOT EXISTS categories (id TEXT PRIMARY KEY, name TEXT, color TEXT, showOnHomepage INTEGER, showInMenu INTEGER, isActive INTEGER DEFAULT 1)`);
  await turso.execute(`CREATE TABLE IF NOT EXISTS companies (id TEXT PRIMARY KEY, name TEXT, category TEXT, authorizedPerson TEXT, phone TEXT, whatsapp TEXT, address TEXT, district TEXT, website TEXT, description TEXT, logo TEXT, isApproved INTEGER DEFAULT 0, createdAt TEXT)`);
  await turso.execute(`CREATE TABLE IF NOT EXISTS menus (id TEXT PRIMARY KEY, title TEXT, url TEXT, "order" INTEGER, is_active INTEGER DEFAULT 1, parent_id TEXT)`);
  
  // Migration: Add SEO columns to config if they don't exist
  try {
    const tableInfo = await turso.execute("PRAGMA table_info(config)");
    // Add service-specific columns
    const columnsToSync = [
      { name: 'siteTitle', type: 'TEXT', default: "''" },
      { name: 'siteDescription', type: 'TEXT', default: "''" },
      { name: 'siteKeywords', type: 'TEXT', default: "''" },
      { name: 'footerText', type: 'TEXT', default: "'© 2026 DİNÇ SIHHİ TESİSAT. Tüm hakları saklıdır.'" },
      { name: 'serviceCity', type: 'TEXT', default: "'mersin'" },
      { name: 'pharmacyCity', type: 'TEXT', default: "'mersin'" },
      { name: 'pharmacyDistrict', type: 'TEXT', default: "''" },
      { name: 'weatherCity', type: 'TEXT', default: "'mersin'" },
      { name: 'weatherDistrict', type: 'TEXT', default: "''" },
      { name: 'trafficCity', type: 'TEXT', default: "'mersin'" },
      { name: 'trafficDistrict', type: 'TEXT', default: "''" },
      { name: 'prayerCity', type: 'TEXT', default: "'mersin'" },
      { name: 'prayerDistrict', type: 'TEXT', default: "''" },
      { name: 'stockBg', type: 'TEXT', default: "''" },
      { name: 'pharmacyBg', type: 'TEXT', default: "''" },
      { name: 'weatherBg', type: 'TEXT', default: "''" },
      { name: 'prayerBg', type: 'TEXT', default: "''" },
      { name: 'trafficBg', type: 'TEXT', default: "''" },
      { name: 'resultsBg', type: 'TEXT', default: "''" }
    ];

    for (const col of columnsToSync) {
      const hasCol = tableInfo.rows.some(row => row[1] === col.name || (row as any).name === col.name);
      if (!hasCol) {
        console.log(`Adding ${col.name} column to config table...`);
        await turso.execute(`ALTER TABLE config ADD COLUMN ${col.name} ${col.type} DEFAULT ${col.default}`);
      }
    }
  } catch (e) {
    console.error("Migration error for config:", e);
  }

  // Migration: Add isActive to categories if it doesn't exist
  try {
    const tableInfo = await turso.execute("PRAGMA table_info(categories)");
    const hasColumn = (name: string) => tableInfo.rows.some(row => row[1] === name || (row as any).name === name);
    
    if (!hasColumn('isActive')) {
      console.log("Adding isActive column to categories table...");
      await turso.execute(`ALTER TABLE categories ADD COLUMN isActive INTEGER DEFAULT 1`);
    }
    if (!hasColumn('showOnHomepage')) {
      console.log("Adding showOnHomepage column to categories table...");
      await turso.execute(`ALTER TABLE categories ADD COLUMN showOnHomepage INTEGER DEFAULT 0`);
    }
    if (!hasColumn('showInMenu')) {
      console.log("Adding showInMenu column to categories table...");
      await turso.execute(`ALTER TABLE categories ADD COLUMN showInMenu INTEGER DEFAULT 1`);
    }
  } catch (e) {
    console.error("Migration error for categories:", e);
  }

  // Migration: Add isActive and gallery to articles if it doesn't exist
  try {
    const tableInfo = await turso.execute("PRAGMA table_info(articles)");
    const hasColumn = (name: string) => tableInfo.rows.some(row => row[1] === name || (row as any).name === name);

    if (!hasColumn('isActive')) {
      console.log("Adding isActive column to articles table...");
      await turso.execute(`ALTER TABLE articles ADD COLUMN isActive INTEGER DEFAULT 1`);
    }
    if (!hasColumn('gallery')) {
      console.log("Adding gallery column to articles table...");
      await turso.execute(`ALTER TABLE articles ADD COLUMN gallery TEXT`);
    }
    if (!hasColumn('displayOptions')) {
      console.log("Adding displayOptions column to articles table...");
      await turso.execute(`ALTER TABLE articles ADD COLUMN displayOptions TEXT`);
    }
    if (!hasColumn('summary')) {
      console.log("Adding summary column to articles table...");
      await turso.execute(`ALTER TABLE articles ADD COLUMN summary TEXT`);
    }
    if (!hasColumn('tags')) {
      console.log("Adding tags column to articles table...");
      await turso.execute(`ALTER TABLE articles ADD COLUMN tags TEXT`);
    }
  } catch (e) {
    console.error("Migration error for articles:", e);
  }

  await turso.execute(`CREATE TABLE IF NOT EXISTS ads (id TEXT PRIMARY KEY, type TEXT, imageUrl TEXT, adCode TEXT, link TEXT)`);
  await turso.execute(`INSERT OR IGNORE INTO ads (id, type, imageUrl, adCode, link) VALUES ('home', 'image', '', '', '')`);
  await turso.execute(`INSERT OR IGNORE INTO ads (id, type, imageUrl, adCode, link) VALUES ('home_top', 'image', '', '', '')`);
  await turso.execute(`INSERT OR IGNORE INTO ads (id, type, imageUrl, adCode, link) VALUES ('detail', 'image', '', '', '')`);
  await turso.execute(`CREATE TABLE IF NOT EXISTS sidebarAds (id TEXT PRIMARY KEY, type TEXT, imageUrl TEXT, adCode TEXT, link TEXT)`);
  await turso.execute(`CREATE TABLE IF NOT EXISTS gallery (id TEXT PRIMARY KEY, url TEXT, caption TEXT, createdAt TEXT)`);
  await turso.execute(`CREATE TABLE IF NOT EXISTS topMenuLinks (id TEXT PRIMARY KEY, title TEXT, url TEXT, icon TEXT, orderIndex INTEGER, position TEXT)`);
  await turso.execute(`CREATE TABLE IF NOT EXISTS admins (id TEXT PRIMARY KEY, username TEXT UNIQUE, password TEXT, role TEXT DEFAULT 'admin', createdAt TEXT)`);

  // Initialize default admin if none exists
  const adminCount = await turso.execute("SELECT COUNT(*) as count FROM admins");
  if (Number(adminCount.rows[0][0]) === 0) {
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.default.hash('admin123', 10);
    await turso.execute({
      sql: "INSERT INTO admins (id, username, password, role, createdAt) VALUES (?, ?, ?, ?, ?)",
      args: [crypto.randomUUID(), 'admin', hashedPassword, 'superadmin', new Date().toISOString()]
    });
    console.log("Default admin created: admin / admin123");
  }

  // Auth Middleware
  const authenticateToken = async (req: any, res: any, next: any) => {
    const token = req.cookies?.admin_token;
    if (!token) return res.status(401).json({ error: "Yetkisiz erişim" });

    try {
      const jwt = await import('jsonwebtoken');
      const decoded = jwt.default.verify(token, process.env.JWT_SECRET || 'secret_key_123') as any;
      req.admin = decoded;
      next();
    } catch (err) {
      res.status(403).json({ error: "Geçersiz oturum" });
    }
  };

  // Auth Routes
  app.post("/api/admin/login", async (req, res) => {
    const { username, password } = req.body;
    try {
      const result = await turso.execute({
        sql: "SELECT * FROM admins WHERE username = ?",
        args: [username]
      });

      if (result.rows.length === 0) {
        return res.status(401).json({ error: "Kullanıcı adı veya şifre hatalı" });
      }

      const admin = result.rows[0] as any;
      // Map row to object if it's an array
      const adminObj = Array.isArray(admin) ? {
        id: admin[0],
        username: admin[1],
        password: admin[2],
        role: admin[3]
      } : admin;

      const bcrypt = await import('bcryptjs');
      const validPassword = await bcrypt.default.compare(password, adminObj.password);

      if (!validPassword) {
        return res.status(401).json({ error: "Kullanıcı adı veya şifre hatalı" });
      }

      const jwt = await import('jsonwebtoken');
      const token = jwt.default.sign(
        { id: adminObj.id, username: adminObj.username, role: adminObj.role },
        process.env.JWT_SECRET || 'secret_key_123',
        { expiresIn: '24h' }
      );

      res.cookie('admin_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });

      res.json({ success: true, admin: { username: adminObj.username, role: adminObj.role } });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Giriş yapılamadı" });
    }
  });

  app.post("/api/admin/logout", (req, res) => {
    res.clearCookie('admin_token');
    res.json({ success: true });
  });

  app.get("/api/admin/me", authenticateToken, (req: any, res) => {
    res.json(req.admin);
  });

  // Admin Management Routes
  app.get("/api/admin/users", authenticateToken, async (req: any, res) => {
    if (req.admin.role !== 'superadmin') return res.status(403).json({ error: "Yetkiniz yok" });
    try {
      const result = await turso.execute("SELECT id, username, role, createdAt FROM admins");
      const rows = result.rows.map(row => {
        const obj: any = {};
        result.columns.forEach((col, i) => {
          obj[col] = row[i];
        });
        return obj;
      });
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: "Kullanıcılar yüklenemedi" });
    }
  });

  app.post("/api/admin/users", authenticateToken, async (req: any, res) => {
    if (req.admin.role !== 'superadmin') return res.status(403).json({ error: "Yetkiniz yok" });
    const { username, password, role } = req.body;
    try {
      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.default.hash(password, 10);
      await turso.execute({
        sql: "INSERT INTO admins (id, username, password, role, createdAt) VALUES (?, ?, ?, ?, ?)",
        args: [crypto.randomUUID(), username, hashedPassword, role || 'admin', new Date().toISOString()]
      });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Kullanıcı eklenemedi" });
    }
  });

  app.delete("/api/admin/users/:id", authenticateToken, async (req: any, res) => {
    if (req.admin.role !== 'superadmin') return res.status(403).json({ error: "Yetkiniz yok" });
    if (req.params.id === req.admin.id) return res.status(400).json({ error: "Kendi hesabınızı silemezsiniz" });
    try {
      await turso.execute({
        sql: "DELETE FROM admins WHERE id = ?",
        args: [req.params.id]
      });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Kullanıcı silinemedi" });
    }
  });

  app.put("/api/admin/change-password", authenticateToken, async (req: any, res) => {
    const { currentPassword, newPassword } = req.body;
    try {
      const result = await turso.execute({
        sql: "SELECT password FROM admins WHERE id = ?",
        args: [req.admin.id]
      });
      const admin = result.rows[0] as any;
      const adminPassword = Array.isArray(admin) ? admin[0] : admin.password;

      const bcrypt = await import('bcryptjs');
      const validPassword = await bcrypt.default.compare(currentPassword, adminPassword);
      if (!validPassword) return res.status(401).json({ error: "Mevcut şifre hatalı" });

      const hashedPassword = await bcrypt.default.hash(newPassword, 10);
      await turso.execute({
        sql: "UPDATE admins SET password = ? WHERE id = ?",
        args: [hashedPassword, req.admin.id]
      });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Şifre değiştirilemedi" });
    }
  });

  // Initialize top menu links if empty
  const topMenuCount = await turso.execute("SELECT COUNT(*) as count FROM topMenuLinks");
  if (Number(topMenuCount.rows[0][0]) === 0) {
    const initialLinks = [
      { id: 'kunye', title: 'KÜNYE', url: '/kunye', icon: '', orderIndex: 0, position: 'left' },
      { id: 'iletisim', title: 'İLETİŞİM', url: '/iletisim', icon: '', orderIndex: 1, position: 'left' },
      { id: 'yazarlar', title: 'YAZARLAR', url: '/yazarlar', icon: 'Users', orderIndex: 0, position: 'right' },
      { id: 'sesli-haberler', title: 'SESLİ HABERLER', url: '/sesli-haberler', icon: 'Mic', orderIndex: 1, position: 'right' },
      { id: 'rehber', title: 'REHBER', url: '/rehber', icon: 'MapPin', orderIndex: 2, position: 'right' },
      { id: 'seri-ilanlar', title: 'SERİ İLANLAR', url: '/seri-ilanlar', icon: 'BookOpen', orderIndex: 3, position: 'right' },
      { id: 'anket', title: 'ANKET', url: '/anket', icon: 'BarChart2', orderIndex: 4, position: 'right' },
      { id: 'gazeteler', title: 'GAZETELER', url: '/gazeteler', icon: 'Newspaper', orderIndex: 5, position: 'right' },
    ];

    for (const link of initialLinks) {
      await turso.execute({
        sql: "INSERT INTO topMenuLinks (id, title, url, icon, orderIndex, position) VALUES (?, ?, ?, ?, ?, ?)",
        args: [link.id, link.title, link.url, link.icon, link.orderIndex, link.position]
      });
    }
  }

  // Initialize menus if empty
  const menuCount = await turso.execute("SELECT COUNT(*) as count FROM menus");
  if (Number(menuCount.rows[0][0]) === 0) {
    const initialMenus = [
      { id: 'home', title: 'ANASAYFA', url: '/', order: 0 },
    ];

    for (const menu of initialMenus) {
      await turso.execute({
        sql: 'INSERT INTO menus (id, title, url, "order", is_active) VALUES (?, ?, ?, ?, 1)',
        args: [menu.id, menu.title, menu.url, menu.order]
      });
    }
  }

  // Explicitly remove them if they exist (user request)
  await turso.execute("DELETE FROM menus WHERE id IN ('rehber', 'resmi-ilanlar') OR url IN ('/rehber', '/resmi-ilanlar')");

  // API routes
  app.post("/api/upload", upload.single('file'), async (req, res) => {
    console.log("Upload request received:", req.file ? req.file.originalname : "No file");
    try {
      if (!req.file) {
        console.error("Upload failed: No file in request");
        return res.status(400).json({ error: "Dosya yüklenemedi" });
      }
      
      const fileUrl = `/uploads/${req.file.filename}`;
      
      // Optional: Also upload to Firebase Storage for persistence
      // This ensures that even if the container restarts, the file is available via the proxy above
      try {
        const bucket = "gen-lang-client-0675548272.firebasestorage.app";
        const firebasePath = `uploads/${req.file.filename}`;
        const firebaseURL = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(firebasePath)}`;
        
        const fileBuffer = fs.readFileSync(req.file.path);
        await fetch(firebaseURL, {
          method: 'POST',
          headers: { 'Content-Type': req.file.mimetype },
          body: fileBuffer
        });
        console.log("File also backed up to Firebase Storage:", firebasePath);
      } catch (fbError) {
        console.error("Firebase backup failed (continuing with local only):", fbError);
      }

      console.log("File uploaded successfully:", fileUrl);
      res.json({ url: fileUrl });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  });

  app.post("/api/delete-file", async (req, res) => {
    try {
      const { filePath } = req.body;
      if (!filePath || !filePath.startsWith('/uploads/')) {
        return res.status(400).json({ error: "Geçersiz dosya yolu" });
      }
      const absolutePath = path.join(__dirname, filePath);
      if (fs.existsSync(absolutePath)) {
        fs.unlinkSync(absolutePath);
        res.json({ success: true });
      } else {
        res.status(404).json({ error: "Dosya bulunamadı" });
      }
    } catch (error) {
      console.error("Delete error:", error);
      res.status(500).json({ error: "Dosya silinemedi" });
    }
  });

  app.post("/api/query", async (req, res) => {
    try {
      const { sql, args } = req.body;
      const result = await turso.execute({ sql, args: args || [] });
      
      // Map rows to objects using column names and handle BigInt serialization
      const rows = result.rows.map(row => {
        const obj: any = {};
        result.columns.forEach((col, i) => {
          const value = row[i];
          obj[col] = typeof value === 'bigint' ? value.toString() : value;
        });
        return obj;
      });

      // Handle BigInt in other result properties
      const safeResult = {
        ...result,
        rows,
        rowsAffected: typeof result.rowsAffected === 'bigint' ? Number(result.rowsAffected) : result.rowsAffected,
        lastInsertRowid: typeof result.lastInsertRowid === 'bigint' ? result.lastInsertRowid.toString() : result.lastInsertRowid
      };

      res.json(safeResult);
    } catch (error) {
      console.error("Database query error:", error);
      res.status(500).json({ error: "Database query failed" });
    }
  });

  app.get("/api/config", async (req, res) => {
    try {
      const result = await turso.execute("SELECT * FROM config WHERE id = 'site' LIMIT 1");
      if (result.rows.length > 0) {
        const row = result.rows[0];
        const config: any = {};
        result.columns.forEach((col, i) => {
          config[col] = row[i];
        });
        res.json(config);
      } else {
        res.json({});
      }
    } catch (error) {
      console.error("Error fetching config:", error);
      res.status(500).json({ error: "Failed to fetch config" });
    }
  });

  // Weather API with caching
  app.get("/api/weather", async (req, res) => {
    const apiKey = process.env.COLLECT_API_KEY?.trim();
    const queryDistrict = req.query.district as string;

    // Get city from DB
    let city = 'mersin';
    let configDistrict = '';
    try {
      const configResult = await turso.execute("SELECT weatherCity, weatherDistrict FROM config LIMIT 1");
      if (configResult.rows.length > 0) {
        if (configResult.rows[0].weatherCity) city = configResult.rows[0].weatherCity as string;
        if (configResult.rows[0].weatherDistrict) configDistrict = configResult.rows[0].weatherDistrict as string;
      }
    } catch (e) {
      console.error("Error fetching city from DB:", e);
    }

    const activeDistrict = queryDistrict || configDistrict;
    const cacheKey = activeDistrict ? `hava_${activeDistrict.toLowerCase()}` : `${city.toLowerCase()}_hava`;
    const cacheFile = path.join(process.cwd(), `${cacheKey}.json`);

    const getCachedData = () => {
      if (fs.existsSync(cacheFile)) {
        try {
          const cachedData = fs.readFileSync(cacheFile, 'utf-8');
          const parsed = JSON.parse(cachedData);
          return parsed;
        } catch (e) {
          return null;
        }
      }
      return null;
    };

    const fetchWeather = async (cityName: string, districtName?: string) => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        const cityCoords: Record<string, {lat: number, lon: number}> = {
          'mersin': {lat: 36.81, lon: 34.63},
          'istanbul': {lat: 41.01, lon: 28.98},
          'ankara': {lat: 39.93, lon: 32.86},
          'izmir': {lat: 38.42, lon: 27.14},
          'adana': {lat: 37.00, lon: 35.32},
          'antalya': {lat: 36.88, lon: 30.71},
          'bursa': {lat: 40.18, lon: 29.07},
          'gaziantep': {lat: 37.07, lon: 37.38},
          'konya': {lat: 37.87, lon: 32.48},
          'kayseri': {lat: 38.73, lon: 35.48}
        };

        const districtCoords: Record<string, {lat: number, lon: number}> = {
          'yenisehir': {lat: 36.81, lon: 34.59},
          'mezitli': {lat: 36.75, lon: 34.53},
          'tarsus': {lat: 36.91, lon: 34.89},
          'erdemli': {lat: 36.60, lon: 34.30},
          'silifke': {lat: 36.37, lon: 33.93},
          'toroslar': {lat: 36.83, lon: 34.62},
          'akdeniz': {lat: 36.80, lon: 34.63},
          'anamur': {lat: 36.08, lon: 32.83},
          'aydincik': {lat: 36.14, lon: 33.32},
          'bozyazi': {lat: 36.10, lon: 32.96},
          'camliyayla': {lat: 37.16, lon: 34.60},
          'gulnar': {lat: 36.34, lon: 33.40},
          'mut': {lat: 36.64, lon: 33.43}
        };

        let lat, lon;
        if (districtName && districtCoords[districtName.toLowerCase()]) {
          const coords = districtCoords[districtName.toLowerCase()];
          lat = coords.lat;
          lon = coords.lon;
        } else {
          const coords = cityCoords[cityName.toLowerCase()] || cityCoords['mersin'];
          lat = coords.lat;
          lon = coords.lon;
        }

        console.log(`Fetching weather from Open-Meteo for ${districtName || cityName}`);
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`, {
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        if (!response.ok) throw new Error(`Open-Meteo error: ${response.status}`);
        
        const data = await response.json();
        
        const getWeatherInfo = (code: number) => {
          if (code === 0) return { text: "Güneşli", emoji: "☀️" };
          if (code >= 1 && code <= 3) return { text: "Parçalı Bulutlu", emoji: "⛅" };
          if (code >= 45 && code <= 48) return { text: "Sisli", emoji: "🌫️" };
          if (code >= 51 && code <= 67) return { text: "Yağmurlu", emoji: "🌧️" };
          if (code >= 71 && code <= 77) return { text: "Karlı", emoji: "❄️" };
          if (code >= 80 && code <= 82) return { text: "Sağanak Yağışlı", emoji: "🌦️" };
          if (code >= 95) return { text: "Fırtınalı", emoji: "⛈️" };
          return { text: "Bilinmiyor", emoji: "❓" };
        };

        const currentInfo = getWeatherInfo(data.current.weather_code);
        const days = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];

        return {
          success: true,
          city: cityName,
          district: districtName,
          current: {
            temp: Math.round(data.current.temperature_2m),
            feels_like: Math.round(data.current.apparent_temperature),
            humidity: data.current.relative_humidity_2m,
            wind_speed: data.current.wind_speed_10m,
            status: currentInfo.text,
            emoji: currentInfo.emoji,
            code: data.current.weather_code
          },
          daily: data.daily.time.map((time: string, i: number) => {
            const date = new Date(time);
            const info = getWeatherInfo(data.daily.weather_code[i]);
            return {
              date: date.toLocaleDateString('tr-TR'),
              day: days[date.getDay()],
              max: Math.round(data.daily.temperature_2m_max[i]),
              min: Math.round(data.daily.temperature_2m_min[i]),
              status: info.text,
              emoji: info.emoji
            };
          })
        };
      } catch (e) {
        console.error("Open-Meteo fetch error:", e);
        return null;
      }
    };

    try {
      // Logic: If file exists and updated within 1 hour, read from file
      if (fs.existsSync(cacheFile)) {
        const stats = fs.statSync(cacheFile);
        const lastModified = new Date(stats.mtime).getTime();
        const now = new Date().getTime();
        const oneHour = 60 * 60 * 1000;
        
        if (now - lastModified < oneHour) {
          const cached = getCachedData();
          if (cached) {
            console.log(`Serving weather from fresh cache for ${activeDistrict || city}`);
            return res.json(cached);
          }
        }
      }

      const weatherData = await fetchWeather(city, activeDistrict);
      if (weatherData) {
        fs.writeFileSync(cacheFile, JSON.stringify(weatherData));
        return res.json(weatherData);
      }

      // Fallback to CollectAPI if Open-Meteo fails and key exists
      if (apiKey && apiKey !== "" && apiKey !== "YOUR_API_KEY") {
        console.log(`Falling back to CollectAPI for weather ${activeDistrict || city}`);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        const response = await fetch(`https://api.collectapi.com/weather/getWeather?data.city=${city.toLowerCase()}`, {
          headers: { "authorization": `apikey ${apiKey}` },
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            // Transform CollectAPI format to our format
            const transformed = {
              success: true,
              city: city,
              district: activeDistrict,
              current: {
                temp: parseInt(data.result[0].degree),
                feels_like: parseInt(data.result[0].degree),
                humidity: 0,
                wind_speed: 0,
                status: data.result[0].description,
                emoji: "",
                code: 0
              },
              daily: data.result.map((d: any) => ({
                date: d.date,
                day: d.day,
                max: parseInt(d.max),
                min: parseInt(d.min),
                status: d.description,
                emoji: ""
              }))
            };
            fs.writeFileSync(cacheFile, JSON.stringify(transformed));
            return res.json(transformed);
          }
        }
      }

      const staleData = getCachedData();
      if (staleData) return res.json(staleData);

      return res.status(500).json({ 
        success: false, 
        message: `Şu an ${activeDistrict || city} için bilgiler güncelleniyor, lütfen az sonra tekrar deneyin.` 
      });

    } catch (error) {
      console.error("Weather API error:", error);
      const staleData = getCachedData();
      if (staleData) return res.json(staleData);
      return res.status(500).json({ success: false, message: "Hava durumu bilgileri alınamadı." });
    }
  });

  // Pharmacies API with caching
  app.get("/api/pharmacies", async (req, res) => {
    const apiKey = process.env.COLLECT_API_KEY?.trim();
    const queryDistrict = req.query.district as string;

    // Get city from DB
    let city = 'mersin';
    let configDistrict = '';
    try {
      const configResult = await turso.execute("SELECT pharmacyCity, pharmacyDistrict FROM config LIMIT 1");
      if (configResult.rows.length > 0) {
        if (configResult.rows[0].pharmacyCity) city = configResult.rows[0].pharmacyCity as string;
        if (configResult.rows[0].pharmacyDistrict) configDistrict = configResult.rows[0].pharmacyDistrict as string;
      }
    } catch (e) {
      console.error("Error fetching city from DB:", e);
    }

    const activeDistrict = queryDistrict || configDistrict;
    const cacheKey = activeDistrict ? `${city.toLowerCase()}_${activeDistrict.toLowerCase()}_eczane` : `${city.toLowerCase()}_eczane`;
    const cacheFile = path.join(process.cwd(), `${cacheKey}.json`);

    const getCachedData = () => {
      if (fs.existsSync(cacheFile)) {
        try {
          const cachedData = fs.readFileSync(cacheFile, 'utf-8');
          const parsed = JSON.parse(cachedData);
          return parsed;
        } catch (e) {
          return null;
        }
      }
      return null;
    };

    const getSampleData = (cityName: string) => ({
      success: true,
      city: cityName,
      result: [
        { name: `${cityName} Örnek Eczane 1`, dist: "Merkez", address: "Merkez Mah. 123. Sok. No:1", phone: "0XXX 123 45 67", loc: "0,0" },
        { name: `${cityName} Örnek Eczane 2`, dist: "Merkez", address: "Merkez Mah. 456. Sok. No:2", phone: "0XXX 765 43 21", loc: "0,0" },
        { name: `${cityName} Örnek Eczane 3`, dist: "Merkez", address: "Merkez Mah. 789. Sok. No:3", phone: "0XXX 999 88 77", loc: "0,0" }
      ]
    });

    try {
      // Logic: Check if file exists and date is today
      if (fs.existsSync(cacheFile)) {
        const stats = fs.statSync(cacheFile);
        const lastModified = new Date(stats.mtime);
        const today = new Date();
        
        if (lastModified.toDateString() === today.toDateString()) {
          const cached = getCachedData();
          if (cached) {
            console.log(`Serving pharmacies from fresh cache for ${activeDistrict || city}`);
            return res.json(cached);
          }
        }
      }

      if (!apiKey || apiKey === "" || apiKey === "YOUR_API_KEY") {
        console.error("COLLECT_API_KEY is missing or invalid");
        const staleData = getCachedData() || getSampleData(city);
        return res.json(staleData);
      }

      console.log(`Fetching pharmacies from CollectAPI for ${city}${activeDistrict ? `/${activeDistrict}` : ''}`);
      const response = await fetch(`https://api.collectapi.com/health/dutyPharmacy?il=${city.toLowerCase()}${activeDistrict ? `&ilce=${activeDistrict.toLowerCase()}` : ''}`, {
        headers: {
          "authorization": `apikey ${apiKey}`
        }
      });

      if (!response.ok) {
        console.error(`Pharmacy API error: ${response.status}`);
        const staleData = getCachedData() || getSampleData(city);
        return res.json(staleData);
      }

      const data = await response.json();
      
      if (data.success) {
        data.city = city;
        data.district = activeDistrict;
        fs.writeFileSync(cacheFile, JSON.stringify(data));
        res.json(data);
      } else {
        console.error("Pharmacy API returned success: false", data);
        const staleData = getCachedData() || getSampleData(city);
        return res.json(staleData);
      }
    } catch (error) {
      console.error("Pharmacy API error:", error);
      const staleData = getCachedData() || getSampleData(city);
      return res.json(staleData);
    }
  });

  // Prayer Times API
  app.get("/api/pray", async (req, res) => {
    const apiKey = process.env.COLLECT_API_KEY?.trim();
    const queryDistrict = req.query.district as string;

    // Get city from DB
    let city = 'mersin';
    let configDistrict = '';
    try {
      const configResult = await turso.execute("SELECT prayerCity, prayerDistrict FROM config LIMIT 1");
      if (configResult.rows.length > 0) {
        if (configResult.rows[0].prayerCity) city = configResult.rows[0].prayerCity as string;
        if (configResult.rows[0].prayerDistrict) configDistrict = configResult.rows[0].prayerDistrict as string;
      }
    } catch (e) {
      console.error("Error fetching city from DB:", e);
    }

    const activeDistrict = queryDistrict || configDistrict;
    const cacheKey = activeDistrict ? `vakit_${activeDistrict.toLowerCase()}` : `${city.toLowerCase()}_vakitler`;
    const cacheFile = path.join(process.cwd(), `${cacheKey}.json`);

    const getCachedData = () => {
      if (fs.existsSync(cacheFile)) {
        try {
          const cachedData = fs.readFileSync(cacheFile, 'utf-8');
          const parsed = JSON.parse(cachedData);
          return parsed;
        } catch (e) {
          return null;
        }
      }
      return null;
    };

    const fetchFromAladhan = async (cityName: string, districtName?: string) => {
      try {
        const location = districtName || cityName;
        console.log(`Fetching prayer times from Aladhan API for ${location}`);
        // Method 13 is Diyanet İşleri Başkanlığı
        const response = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${location}&country=Turkey&method=13`);
        if (!response.ok) throw new Error(`Aladhan API error: ${response.status}`);
        
        const data = await response.json();
        if (data.code === 200 && data.data && data.data.timings) {
          const t = data.data.timings;
          return {
            success: true,
            city: cityName,
            district: districtName,
            result: [
              { name: "İmsak", time: t.Fajr },
              { name: "Güneş", time: t.Sunrise },
              { name: "Öğle", time: t.Dhuhr },
              { name: "İkindi", time: t.Asr },
              { name: "Akşam", time: t.Maghrib },
              { name: "Yatsı", time: t.Isha }
            ]
          };
        }
        return null;
      } catch (e) {
        console.error("Aladhan API error:", e);
        return null;
      }
    };

    try {
      // Logic: Check if file exists and date is today
      if (fs.existsSync(cacheFile)) {
        const stats = fs.statSync(cacheFile);
        const lastModified = new Date(stats.mtime);
        const today = new Date();
        
        if (lastModified.toDateString() === today.toDateString()) {
          const cached = getCachedData();
          if (cached) {
            console.log(`Serving prayer times from fresh cache for ${activeDistrict || city}`);
            return res.json(cached);
          }
        }
      }

      // Primary source: Aladhan (Free and no key required)
      const aladhanData = await fetchFromAladhan(city, activeDistrict);
      if (aladhanData) {
        fs.writeFileSync(cacheFile, JSON.stringify(aladhanData));
        return res.json(aladhanData);
      }

      // Fallback to CollectAPI if Aladhan fails and key exists
      if (apiKey && apiKey !== "" && apiKey !== "YOUR_API_KEY") {
        const location = activeDistrict || city;
        console.log(`Falling back to CollectAPI for prayer times in ${location}`);
        const response = await fetch(`https://api.collectapi.com/pray/all?location=${location.toLowerCase()}`, {
          headers: { "authorization": `apikey ${apiKey}` }
        });
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            data.city = city;
            data.district = activeDistrict;
            fs.writeFileSync(cacheFile, JSON.stringify(data));
            return res.json(data);
          }
        }
      }

      // Final fallback: Stale cache or error message
      const staleData = getCachedData();
      if (staleData) {
        return res.json(staleData);
      }

      return res.status(500).json({ 
        success: false, 
        message: "Şu an namaz vakitleri güncelleniyor, lütfen az sonra tekrar deneyin." 
      });

    } catch (error) {
      console.error("Prayer API main error:", error);
      const staleData = getCachedData();
      if (staleData) return res.json(staleData);
      
      return res.status(500).json({ 
        success: false, 
        message: "Şu an namaz vakitleri güncelleniyor, lütfen az sonra tekrar deneyin." 
      });
    }
  });

  // Live Match Results API
  app.get("/api/scores", async (req, res) => {
    const apiKey = process.env.COLLECT_API_KEY?.trim();
    const cacheFile = path.join(process.cwd(), 'mac_sonuclari.json');

    const getCachedData = () => {
      if (fs.existsSync(cacheFile)) {
        try {
          const cachedData = fs.readFileSync(cacheFile, 'utf-8');
          return JSON.parse(cachedData);
        } catch (e) {
          return null;
        }
      }
      return null;
    };

    const getSampleData = () => ({
      success: true,
      result: [
        { skor: "2 - 1", home: "Galatasaray", away: "Beşiktaş", date: new Date().toISOString() },
        { skor: "1 - 1", home: "Fenerbahçe", away: "Trabzonspor", date: new Date().toISOString() },
        { skor: "0 - 2", home: "Başakşehir", away: "Adana Demirspor", date: new Date().toISOString() },
        { skor: "3 - 0", home: "Konyaspor", away: "Antalyaspor", date: new Date().toISOString() }
      ]
    });

    try {
      // Check cache (30 minutes to avoid 429)
      if (fs.existsSync(cacheFile)) {
        const stats = fs.statSync(cacheFile);
        const diffMinutes = (Date.now() - stats.mtime.getTime()) / (1000 * 60);
        
        if (diffMinutes < 30) {
          const cached = getCachedData();
          if (cached) {
            return res.json(cached);
          }
        }
      }

      if (!apiKey || apiKey === "" || apiKey === "YOUR_API_KEY") {
        const staleData = getCachedData() || getSampleData();
        return res.json(staleData);
      }

      const response = await fetch("https://api.collectapi.com/sport/results?league=super-lig", {
        headers: { "authorization": `apikey ${apiKey}` }
      });

      if (!response.ok) {
        // If rate limited (429) or server error (500), use cache or sample data silently
        const staleData = getCachedData() || getSampleData();
        return res.json(staleData);
      }

      const data = await response.json();
      if (data.success) {
        fs.writeFileSync(cacheFile, JSON.stringify(data));
        res.json(data);
      } else {
        const staleData = getCachedData() || getSampleData();
        return res.json(staleData);
      }
    } catch (error) {
      const staleData = getCachedData() || getSampleData();
      return res.json(staleData);
    }
  });

  // Market Data API
  app.get("/api/market", async (req, res) => {
    try {
      // Try a more reliable and free API first
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      const response = await fetch('https://finans.truncgil.com/today.json', {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        const mappedData = {
          USD: { 
            satis: data["ABD DOLARI"]?.Satis || "44.60", 
            degisim: (data["ABD DOLARI"]?.Degisim || "0.00").replace('%', ''), 
            d_yon: (data["ABD DOLARI"]?.Degisim || "").includes('-') ? 'down' : 'up' 
          },
          EUR: { 
            satis: data["EURO"]?.Satis || "51.48", 
            degisim: (data["EURO"]?.Degisim || "0.00").replace('%', ''), 
            d_yon: (data["EURO"]?.Degisim || "").includes('-') ? 'down' : 'up' 
          },
          GA: { 
            satis: data["Gram Altın"]?.Satis || "6689.00", 
            degisim: (data["Gram Altın"]?.Degisim || "0.00").replace('%', ''), 
            d_yon: (data["Gram Altın"]?.Degisim || "").includes('-') ? 'down' : 'up' 
          },
          BIST100: { 
            satis: "13000", 
            degisim: "0.50", 
            d_yon: "up" 
          }
        };
        return res.json(mappedData);
      }

      // Fallback to original source if first one fails
      const fController = new AbortController();
      const fTimeoutId = setTimeout(() => fController.abort(), 10000);
      const fallbackResponse = await fetch('https://api.genelpara.com/embed/para-birimleri.json', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://www.genelpara.com/'
        },
        signal: fController.signal
      });
      clearTimeout(fTimeoutId);
      
      if (fallbackResponse.ok) {
        const data = await fallbackResponse.json();
        return res.json(data);
      }

      throw new Error(`Market API error: ${response.status}`);
    } catch (error) {
      console.error("Market API error:", error);
      // Hardcoded fallback data if all APIs fail
      res.json({
        USD: { satis: "44.60", degisim: "0.05", d_yon: "up" },
        EUR: { satis: "51.48", degisim: "0.04", d_yon: "up" },
        GA: { satis: "6689.00", degisim: "-0.20", d_yon: "down" },
        BIST100: { satis: "13000", degisim: "0.50", d_yon: "up" }
      });
    }
  });

  // Proxy endpoint for Firebase images to bypass CORS
  app.get('/api/proxy-image', async (req, res) => {
    const imageUrl = req.query.url as string;
    if (!imageUrl) {
      return res.status(400).send('URL is required');
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      const response = await fetch(imageUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType) {
        res.setHeader('Content-Type', contentType);
      }
      
      // Cache for 1 day
      res.setHeader('Cache-Control', 'public, max-age=86400');

      const arrayBuffer = await response.arrayBuffer();
      res.send(Buffer.from(arrayBuffer));
    } catch (error) {
      console.error('Proxy error:', error);
      res.status(500).send('Error proxying image');
    }
  });

  // Business Directory (Firma Rehberi) API
  app.get("/api/companies", async (req, res) => {
    try {
      const { district, category } = req.query;
      let query = "SELECT * FROM companies WHERE isApproved = 1";
      const params = [];

      if (district) {
        query += " AND district = ?";
        params.push(district);
      }
      if (category) {
        query += " AND category = ?";
        params.push(category);
      }

      query += " ORDER BY createdAt DESC";
      const result = await turso.execute({ sql: query, args: params });
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching companies:", error);
      res.status(500).json({ error: "Failed to fetch companies" });
    }
  });

  app.post("/api/companies", upload.single('logo'), async (req, res) => {
    try {
      const { name, category, authorizedPerson, phone, whatsapp, address, district, website, description } = req.body;
      const id = Math.random().toString(36).substring(2, 15);
      const createdAt = new Date().toISOString();
      const logo = req.file ? `/uploads/${req.file.filename}` : '';

      await turso.execute({
        sql: `INSERT INTO companies (id, name, category, authorizedPerson, phone, whatsapp, address, district, website, description, logo, isApproved, createdAt) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)`,
        args: [id, name, category, authorizedPerson, phone, whatsapp, address, district, website, description, logo, createdAt]
      });

      res.json({ success: true, message: "Firma başarıyla eklendi, onay bekliyor." });
    } catch (error) {
      console.error("Error adding company:", error);
      res.status(500).json({ error: "Failed to add company" });
    }
  });

  // Admin Companies API
  app.get("/api/admin/companies", async (req, res) => {
    try {
      const result = await turso.execute("SELECT * FROM companies ORDER BY createdAt DESC");
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching admin companies:", error);
      res.status(500).json({ error: "Failed to fetch companies" });
    }
  });

  app.put("/api/admin/companies/:id", upload.single('logo'), async (req, res) => {
    try {
      const { id } = req.params;
      const updates = { ...req.body };
      
      if (req.file) {
        updates.logo = `/uploads/${req.file.filename}`;
      }

      const fields = Object.keys(updates);
      if (fields.length === 0) {
        return res.status(400).json({ error: "No fields to update" });
      }

      const setClause = fields.map(field => `${field} = ?`).join(', ');
      const args = fields.map(field => updates[field]);
      args.push(id);

      await turso.execute({ 
        sql: `UPDATE companies SET ${setClause} WHERE id = ?`, 
        args 
      });
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating company:", error);
      res.status(500).json({ error: "Failed to update company" });
    }
  });

  app.delete("/api/admin/companies/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await turso.execute({ sql: "DELETE FROM companies WHERE id = ?", args: [id] });
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting company:", error);
      res.status(500).json({ error: "Failed to delete company" });
    }
  });

  // Menus API
  app.get("/api/menus", async (req, res) => {
    try {
      const result = await turso.execute('SELECT * FROM menus WHERE is_active = 1 ORDER BY "order" ASC');
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching menus:", error);
      res.status(500).json({ error: "Failed to fetch menus" });
    }
  });

  app.get("/api/admin/menus", async (req, res) => {
    try {
      const result = await turso.execute('SELECT * FROM menus ORDER BY "order" ASC');
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching admin menus:", error);
      res.status(500).json({ error: "Failed to fetch menus" });
    }
  });

  app.post("/api/admin/menus", async (req, res) => {
    try {
      const { title, url, order, is_active, parent_id } = req.body;
      const id = Math.random().toString(36).substring(2, 15);
      await turso.execute({
        sql: 'INSERT INTO menus (id, title, url, "order", is_active, parent_id) VALUES (?, ?, ?, ?, ?, ?)',
        args: [id, title, url, order || 0, is_active !== undefined ? is_active : 1, parent_id || null]
      });
      res.json({ success: true, id });
    } catch (error) {
      console.error("Error creating menu:", error);
      res.status(500).json({ error: "Failed to create menu" });
    }
  });

  app.put("/api/admin/menus/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { title, url, order, is_active, parent_id } = req.body;
      await turso.execute({
        sql: 'UPDATE menus SET title = ?, url = ?, "order" = ?, is_active = ?, parent_id = ? WHERE id = ?',
        args: [title, url, order, is_active, parent_id, id]
      });
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating menu:", error);
      res.status(500).json({ error: "Failed to update menu" });
    }
  });

  app.delete("/api/admin/menus/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await turso.execute({ sql: "DELETE FROM menus WHERE id = ?", args: [id] });
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting menu:", error);
      res.status(500).json({ error: "Failed to delete menu" });
    }
  });

  // Top Menu Links API
  app.get("/api/admin/top-menu", async (req, res) => {
    try {
      const result = await turso.execute("SELECT * FROM topMenuLinks ORDER BY orderIndex ASC");
      const rows = result.rows.map(row => {
        const obj: any = {};
        result.columns.forEach((col, i) => {
          const value = row[i];
          obj[col] = typeof value === 'bigint' ? value.toString() : value;
        });
        return obj;
      });
      res.json(rows);
    } catch (error) {
      console.error("Error fetching top menu links:", error);
      res.status(500).json({ error: "Menü linkleri yüklenemedi" });
    }
  });

  app.post("/api/admin/top-menu", async (req, res) => {
    try {
      const { title, url, icon, orderIndex, position } = req.body;
      const id = crypto.randomUUID();
      await turso.execute({
        sql: "INSERT INTO topMenuLinks (id, title, url, icon, orderIndex, position) VALUES (?, ?, ?, ?, ?, ?)",
        args: [id, title, url, icon, orderIndex, position]
      });
      res.json({ success: true, id });
    } catch (error) {
      console.error("Error creating top menu link:", error);
      res.status(500).json({ error: "Menü linki eklenemedi" });
    }
  });

  app.put("/api/admin/top-menu/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { title, url, icon, orderIndex, position } = req.body;
      await turso.execute({
        sql: "UPDATE topMenuLinks SET title = ?, url = ?, icon = ?, orderIndex = ?, position = ? WHERE id = ?",
        args: [title, url, icon, orderIndex, position, id]
      });
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating top menu link:", error);
      res.status(500).json({ error: "Menü linki güncellenemedi" });
    }
  });

  app.delete("/api/admin/top-menu/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await turso.execute({
        sql: "DELETE FROM topMenuLinks WHERE id = ?",
        args: [id]
      });
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting top menu link:", error);
      res.status(500).json({ error: "Menü linki silinemedi" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    console.log("Initializing Vite middleware...");
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
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
