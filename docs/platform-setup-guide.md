# 🔧 Panduan Setup Platform Social Media

## Langkah-langkah mendapatkan API Keys untuk upload otomatis

---

## 📺 1. YOUTUBE (YouTube Data API v3)

### Step 1: Buat Project di Google Cloud
1. Buka https://console.cloud.google.com
2. Klik **"Create Project"** → beri nama "ViralAI"
3. Tunggu project dibuat

### Step 2: Enable YouTube Data API
1. Di sidebar kiri, klik **"APIs & Services"** → **"Library"**
2. Cari **"YouTube Data API v3"**
3. Klik → **"Enable"**

### Step 3: Buat OAuth Credentials
1. Klik **"APIs & Services"** → **"Credentials"**
2. Klik **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
3. Jika diminta, konfigurasi **OAuth consent screen** dulu:
   - User Type: **External**
   - App name: **ViralAI**
   - User support email: email kamu
   - Authorized domains: `localhost`
   - Scopes: tambahkan `youtube.upload`, `youtube.readonly`
4. Kembali ke Credentials → Create OAuth client ID:
   - Application type: **Web application**
   - Name: **ViralAI Web**
   - Authorized redirect URIs: `http://localhost:4000/auth/youtube/callback`
5. Klik **"Create"**
6. **Catat Client ID dan Client Secret**

### Step 4: Isi di .env
```
YOUTUBE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
YOUTUBE_CLIENT_SECRET=your-client-secret-here
```

### Catatan Penting:
- Saat masih dalam mode "Testing", hanya email yang ditambahkan sebagai test user yang bisa login
- Untuk production, perlu submit app review ke Google
- Quota default: 10,000 units/hari (cukup untuk ~5-6 upload/hari)

---

## 🎵 2. TIKTOK (Content Posting API)

### Step 1: Daftar TikTok Developer
1. Buka https://developers.tiktok.com
2. Klik **"Sign Up"** / Login dengan akun TikTok
3. Verifikasi email

### Step 2: Buat App
1. Klik **"Manage apps"** → **"Create app"**
2. Isi:
   - App name: **ViralAI**
   - Description: AI content generator for TikTok
   - App icon: upload logo
   - Category: **Content Management**

### Step 3: Tambahkan Products
1. Di halaman app, klik **"Add products"**
2. Tambahkan:
   - **Login Kit** (untuk OAuth login)
   - **Content Posting API** (untuk upload video)
3. Untuk Content Posting API:
   - Redirect URI: `http://localhost:4000/auth/tiktok/callback`
   - Scopes: `user.info.basic`, `video.publish`, `video.upload`

### Step 4: Submit for Review
1. TikTok memerlukan review sebelum app bisa digunakan
2. Isi semua informasi yang diminta
3. Tunggu approval (biasanya 1-5 hari kerja)

### Step 5: Isi di .env
```
TIKTOK_CLIENT_KEY=your-client-key
TIKTOK_CLIENT_SECRET=your-client-secret
```

### Catatan Penting:
- Content Posting API memerlukan approval dari TikTok
- Selama menunggu, bisa test dengan Sandbox mode
- Video harus memenuhi TikTok guidelines (9:16, max 10 menit)
- Rate limit: 3 video/hari per user (bisa dinaikkan setelah review)

---

## 📸 3. INSTAGRAM (Instagram Graph API via Meta)

### Step 1: Buat Meta Developer Account
1. Buka https://developers.facebook.com
2. Login dengan akun Facebook yang terhubung ke Instagram Business/Creator
3. Klik **"My Apps"** → **"Create App"**

### Step 2: Buat App
1. Pilih app type: **Business**
2. App name: **ViralAI**
3. Klik **"Create App"**

### Step 3: Setup Instagram Graph API
1. Di dashboard app, klik **"Add Product"**
2. Cari **"Instagram Graph API"** → **"Set Up"**
3. Tambahkan juga **"Facebook Login"** → **"Set Up"**

### Step 4: Konfigurasi Facebook Login
1. Di Facebook Login → Settings:
   - Valid OAuth Redirect URIs: `http://localhost:4000/auth/instagram/callback`
   - Client OAuth Login: **Yes**
   - Web OAuth Login: **Yes**

### Step 5: Dapatkan Permissions
1. Di App Review → Permissions:
   - Request: `instagram_basic`
   - Request: `instagram_content_publish`
   - Request: `pages_read_engagement`
2. Submit for review (jelaskan use case)

### Step 6: Isi di .env
```
INSTAGRAM_APP_ID=your-app-id
INSTAGRAM_APP_SECRET=your-app-secret
```

### Catatan Penting:
- Instagram API **HANYA** bekerja dengan akun **Business** atau **Creator**
- Akun personal tidak bisa digunakan
- Perlu Facebook Page yang terhubung ke Instagram
- Video Reels: 9:16, 3-90 detik, max 1GB
- Rate limit: 25 API calls per user per hour

### Cara Convert ke Business Account:
1. Buka Instagram → Settings → Account
2. Klik "Switch to Professional Account"
3. Pilih "Creator" atau "Business"
4. Hubungkan ke Facebook Page

---

## 👤 4. FACEBOOK (Facebook Graph API - Reels)

### Step 1: Gunakan App yang Sama dengan Instagram
(Jika sudah buat app di Meta Developer, gunakan yang sama)

### Step 2: Tambahkan Permissions
1. Di App Review → Permissions:
   - Request: `pages_manage_posts`
   - Request: `pages_read_engagement`
   - Request: `publish_video`
2. Submit for review

### Step 3: Setup Page Access
1. Di Tools → Graph API Explorer:
   - Pilih app kamu
   - Generate User Access Token
   - Pilih permissions yang dibutuhkan
   - Klik "Generate Access Token"
2. Exchange untuk Long-Lived Token (60 hari)

### Step 4: Isi di .env
```
FACEBOOK_APP_ID=your-app-id (sama dengan Instagram)
FACEBOOK_APP_SECRET=your-app-secret (sama dengan Instagram)
```

### Catatan Penting:
- Facebook Reels hanya bisa dipost ke **Facebook Page** (bukan profil personal)
- Video: 9:16, 3-90 detik, max 1GB
- Perlu Page Access Token (bukan User Access Token)
- Rate limit: 200 calls per hour per user

---

## ⚡ QUICK START (Untuk Testing Cepat)

Jika ingin test cepat tanpa full review process:

### YouTube (Paling Mudah):
1. Buat Google Cloud project ✅
2. Enable YouTube Data API ✅
3. Buat OAuth credentials ✅
4. Tambahkan email kamu sebagai test user ✅
5. **Langsung bisa upload** (dalam mode testing)

### TikTok:
- Gunakan **Sandbox mode** untuk testing
- Sandbox tidak benar-benar upload, tapi simulasi flow lengkap

### Instagram & Facebook:
- Gunakan **Development mode** 
- Bisa test dengan akun sendiri tanpa review
- Tapi hanya akun yang terdaftar sebagai tester yang bisa digunakan

---

## 🔐 SETELAH DAPAT SEMUA API KEYS

### 1. Update file .env:
```env
# YouTube
YOUTUBE_CLIENT_ID=xxxxx.apps.googleusercontent.com
YOUTUBE_CLIENT_SECRET=xxxxx

# TikTok
TIKTOK_CLIENT_KEY=xxxxx
TIKTOK_CLIENT_SECRET=xxxxx

# Instagram & Facebook (sama)
INSTAGRAM_APP_ID=xxxxx
INSTAGRAM_APP_SECRET=xxxxx
FACEBOOK_APP_ID=xxxxx
FACEBOOK_APP_SECRET=xxxxx
```

### 2. Jalankan Backend:
```bash
cd backend
npm install
npx prisma migrate dev
npm run start:dev
```

### 3. Jalankan Worker:
```bash
cd worker
npm install
npm run start:dev
```

### 4. Jalankan Frontend:
```bash
cd frontend
npm run dev
```

### 5. Test Flow:
1. Buka http://localhost:3000/login
2. Login
3. Buka Accounts → Connect YouTube/TikTok/Instagram/Facebook
4. OAuth redirect → authorize → connected ✅
5. Generate video → Schedule Upload → pilih waktu
6. Worker akan otomatis upload pada waktu yang dijadwalkan

---

## 📋 CHECKLIST SETUP

| Platform | Developer Account | App Created | API Enabled | Credentials | Review |
|----------|:-:|:-:|:-:|:-:|:-:|
| YouTube | ☐ | ☐ | ☐ | ☐ | ☐ (tidak perlu untuk testing) |
| TikTok | ☐ | ☐ | ☐ | ☐ | ☐ (perlu untuk production) |
| Instagram | ☐ | ☐ | ☐ | ☐ | ☐ (perlu untuk production) |
| Facebook | ☐ | ☐ | ☐ | ☐ | ☐ (perlu untuk production) |

---

## ❓ FAQ

**Q: Berapa lama proses review?**
- YouTube: Tidak perlu review untuk testing
- TikTok: 1-5 hari kerja
- Instagram/Facebook: 1-7 hari kerja

**Q: Apakah gratis?**
- Semua platform API gratis untuk digunakan
- Hanya ada rate limit (batas jumlah request per hari)

**Q: Bisa upload berapa video per hari?**
- YouTube: ~5-6 video/hari (quota 10,000 units)
- TikTok: 3 video/hari per user (bisa dinaikkan)
- Instagram: ~25 video/hari
- Facebook: ~200 API calls/hour

**Q: Apakah aman?**
- Ya, menggunakan OAuth2 resmi dari masing-masing platform
- Tidak menyimpan password user
- Token bisa di-revoke kapan saja
