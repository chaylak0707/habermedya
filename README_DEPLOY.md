# Render Deployment Guide

Bu projeyi GitHub'a yükleyip Render üzerinde yayına almak için aşağıdaki adımları izleyin:

## 1. GitHub Hazırlığı
1. GitHub üzerinde yeni bir repository oluşturun.
2. Yerel terminalinizde (veya bu editörde) şu komutları çalıştırarak kodunuzu GitHub'a gönderin:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <GITHUB_REPO_URL>
   git push -u origin main
   ```

## 2. Render Üzerinde Yeni Bir Web Service Oluşturun
1. [Render Dashboard](https://dashboard.render.com/)'a gidin.
2. **New +** butonuna tıklayın ve **Web Service**'i seçin.
3. GitHub repository'nizi bağlayın.

## 3. Servis Ayarları
*   **Name:** `haber-sitesi` (veya istediğiniz bir isim)
*   **Environment:** `Node`
*   **Build Command:** `npm install && npm run build`
*   **Start Command:** `npm start`

## 4. Environment Variables (Ortam Değişkenleri)
Render panelinde **Environment** sekmesine gidin ve şu değişkenleri ekleyin:

| Key | Value | Not |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Üretim modu |
| `TURSO_DATABASE_URL` | `libsql://...` | Turso veritabanı URL'niz |
| `TURSO_AUTH_TOKEN` | `...` | Turso Auth Token'ınız |
| `JWT_SECRET` | `rastgele-guclu-bir-sifre` | Admin paneli güvenliği için |
| `COLLECT_API_KEY` | `...` | Hava durumu ve eczane verileri için |

## 5. Firebase Storage (Önemli)
Render üzerindeki dosya sistemi kalıcı değildir (ephemeral). Bu nedenle yüklenen resimlerin kaybolmaması için:
1. Proje içindeki `server.ts` zaten Firebase Storage yedeği alacak şekilde yapılandırılmıştır.
2. Render üzerinde `firebase-applet-config.json` dosyasının içeriğini de bir ortam değişkeni olarak veya dosya olarak sağlamanız gerekebilir. Ancak şu anki kurulumda bu dosya GitHub'a yüklenecektir (eğer `.gitignore`'da değilse).
3. **Güvenlik Notu:** `firebase-applet-config.json` hassas bilgiler içerir. GitHub'da "Private" repository kullanmanız önerilir.

## 6. Yayına Alın
Ayarları kaydettiğinizde Render otomatik olarak build işlemini başlatacak ve sitenizi yayına alacaktır.
