# 🚀 Industrial Web Profile & Portfolio (Full-Stack PostgreSQL)

Web Profil & Portofolio Interaktif Full-Stack yang dirancang dengan **Arsitektur SOLID**, **Normalisasi Database 3NF (PostgreSQL)**, **JWT Authentication**, **Paginasi Server-Side**, serta **Panel Dashboard Administrator** untuk pengelolaan konten secara *real-time*.

---

## 🛠️ Teknologi yang Digunakan

- **Frontend**: React 19, Vite, Tailwind CSS v4, Lucide Icons, Motion (Framer Motion).
- **Backend**: Node.js, Express.js, TypeScript (`tsx`, `esbuild`).
- **Database Engine**:
  - **PostgreSQL Eksternal** (via `DATABASE_URL` di `.env`).
  - **In-Memory Embedded PostgreSQL (`pg-mem`)** otomatis aktif sebagai fallback jika database eksternal belum dikonfigurasi.
- **Keamanan & Autentikasi**: JWT (JSON Web Token), Bcrypt Password Hashing.
- **Prinsip Software Engineering**: SOLID Principles, Repository Pattern, 3NF Database Normalization.

---

## 📋 Fitur Utama

1. **Desain Modern Industrial Theme**: Tampilan responsif, *dark mode*, dengan estetika teknik industrial yang bersih dan profesional.
2. **Foto Profil & Dokumentasi Upload Lokal**: Dukungan unggah foto profil, sertifikat, dan proyek langsung dari komputer lokal (Multi-input).
3. **Konversi & Kompresi WebP Otomatis**: Gambar lokal dikompresi dan dikonversi otomatis ke format `.webp` hemat ruang di sisi browser lalu disimpan ke **folder khusus `/uploads`** di server disk.
4. **Proyek Multi-Gambar Carousel**: Kartu proyek mendukung beberapa dokumentasi gambar yang dapat bergeser otomatis (*auto-play carousel*) maupun dipindah manual dengan kontrol *previous/next* & *dot indicators*.
5. **Paginasi Data Server-Side**: Tampilan portofolio proyek, sertifikat, dan inbox pesan dilengkapi kontrol paginasi (`LIMIT` & `OFFSET`).
6. **Pencarian & Filter Proyek**: Fitur filter berdasarkan kategori dan pencarian kata kunci proyek secara real-time.
7. **Dashboard Admin LENGKAP**: Portal terlindungi JWT untuk mengelola:
   - Identitas & Bio Profil (Upload foto avatar lokal)
   - Daftar Keahlian Teknis (*Skill Sets*)
   - Karya Proyek & Galeri Multi-Gambar WebP (Upload multi-foto lokal)
   - Sertifikat Industri & Verifikasi Kredensial
   - Pesan Masuk (*Inbox*) dari pengunjung web
   - Keamanan Admin & Pengubahan Password
8. **Formulir Kontak Real-Time**: Pesan pengunjung dikirim langsung ke database PostgreSQL inbox administrator.

---

## 🔑 Kredensial Login Admin Default

- **URL Dashboard Admin**: Klik tombol **`ADMIN PORTAL`** di bagian navigasi atas header atau footer web.
- **Username**: `admin`
- **Password Default**: `lamz16022002` *(dapat diubah kapan saja via tab Keamanan Admin)*

---

## 💻 Langkah-Langkah Setup & Menjalankan di Server Lokal

### 1. Prasyarat Sistem
Pastikan perangkat Anda telah terpasang:
- **Node.js** v18.0.0 atau versi lebih baru.
- **npm** (biasanya disertakan saat menginstal Node.js).
- *(Opsional)* **PostgreSQL Server** (jika ingin menghubungkan ke database PostgreSQL asli).

---

### 2. Clone Repositori & Install Dependensi

Buka terminal / command prompt dan jalankan perintah berikut:

```bash
# 1. Clone repositori ke komputer Anda
git clone <URL_REPOSITORI_ANDA>

# 2. Masuk ke direktori proyek
cd web-profile-portfolio

# 3. Install seluruh paket dependensi
npm install
```

---

### 3. Konfigurasi Environment Variables (`.env`)

Buat file `.env` di akar (*root*) direktori proyek berdasarkan berkas `.env.example`:

```env
# Port aplikasi web (default 3000)
PORT=3000

# Secret Key untuk Enkripsi Token JWT Admin
JWT_SECRET="super-secret-portfolio-admin-key-2026"

# (Opsional) URL PostgreSQL Server Asli
# Jika dikosongkan, sistem otomatis menggunakan In-Memory PostgreSQL engine (pg-mem)
DATABASE_URL="postgresql://postgres:password_db_anda@localhost:5432/portfolio_db"

# (Opsional) API Key Gemini AI jika menggunakan fitur AI
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
```

---

### 4. Menjalankan Mode Pengembang (Development Mode)

Jalankan perintah dev server yang mengintegrasikan Express server dan Vite secara simultan:

```bash
npm run dev
```

Buka peramban (*browser*) Anda dan akses:
👉 **`http://localhost:3000`**

---

### 5. Build & Jalankan untuk Mode Produksi (Production Mode)

Untuk melakukan *compilation* dan *bundling* server serta frontend secara mandiri:

```bash
# 1. Build frontend Vite dan bundle server Express ke dist/server.cjs
npm run build

# 2. Jalankan server produksi
npm start
```

---

## 🗄️ Struktur Relasi Database (Normalized 3NF Schema)

Database dirancang terstruktur menggunakan aturan bentuk normal ketiga (3NF):

```
+------------------+         +-----------------------+
|    profiles      |         |     admin_users       |
+------------------+         +-----------------------+
| id (PK)          |         | id (PK)               |
| name             |         | username (UNIQUE)     |
| title            |         | password_hash         |
| bio, long_bio    |         +-----------------------+
| avatar_url       |
| email, phone     |         +-----------------------+
| location         |         |    inbox_messages     |
+------------------+         +-----------------------+
                             | id (PK)               |
+------------------+         | sender_name           |
| skill_categories |         | sender_email          |
+------------------+         | subject, message      |
| id (PK)          |         | is_read, created_at   |
| name, code       |         +-----------------------+
+--------+---------+
         | 1:N
+--------v---------+
|     skills       |
+------------------+
| id (PK)          |
| category_id (FK) |
| name             |
+------------------+

+--------------------+       +-----------------------+       +-------------------+
| project_categories |       |       projects        |  N:M  |       tags        |
+--------------------+       +-----------------------+ <---> +-------------------+
| id (PK)            |  1:N  | id (PK)               |       | id (PK)           |
| name (UNIQUE)      | ----> | category_id (FK)      |       | name (UNIQUE)     |
+--------------------+       | title, description    |       +-------------------+
                             | image_url, demo_url   |                 ^
                             | github_url            |                 |
                             +-----------------------+        +--------+----------+
                                                              | project_tag_map   |
                                                              +-------------------+
                                                              | project_id (FK)   |
                                                              | tag_id (FK)       |
                                                              +-------------------+
```

---

## 📁 Struktur Kode & SOLID Pattern

```
├── server.ts                    # Entry Point Express Full-Stack REST API & Vite Middleware
├── src/
│   ├── api/
│   │   └── client.ts            # Client HTTP API Wrapper (Fetch & JWT Interceptor)
│   ├── components/
│   │   ├── AboutSection.tsx     # Komponen Tampilan Utama Biodata
│   │   ├── AdminPanel.tsx       # Dashboard Modal Portal Administrator
│   │   ├── CertificateSection.tsx # Tampilan Sertifikat dengan Pagination
│   │   ├── ContactSection.tsx   # Form Kontak ke Database Inbox
│   │   ├── EditModal.tsx        # Quick Control Panel
│   │   ├── Header.tsx           # Navigasi Atas & Tombol Admin Portal
│   │   ├── Pagination.tsx       # Reusable Pagination Control UI
│   │   └── PortfolioSection.tsx # Showcase Proyek dengan Pagination & Search
│   ├── server/
│   │   ├── db.ts                # Database Connection Manager & Initial 3NF Seeder
│   │   ├── interfaces.ts        # Interface Abstraksi Repository (SOLID)
│   │   └── repositories/
│   │       ├── AdminRepository.ts       # Verifikasi & Password Hasher Admin
│   │       ├── CertificateRepository.ts # Management Sertifikat & Issuer (3NF)
│   │       ├── ContactRepository.ts     # Ingest Message & Inbox Manager
│   │       ├── ProfileRepository.ts     # Data Profil Utama
│   │       ├── ProjectRepository.ts     # Pagination & Many-to-Many Tag Mapping
│   │       └── SkillRepository.ts       # Category & Technical Skill Engine
│   ├── types.ts                 # Type Definitions TypeScript Global
│   ├── App.tsx                  # Root React Application Component
│   └── main.tsx                 # Entry Point Client React
├── README.md                    # Dokumentasi Langkah Setup
└── package.json                 # Konfigurasi Dependensi & Build Script
```

---

## 💡 Troubleshooting & FAQ

**Q: Mengapa saya bisa langsung menjalankan proyek tanpa menginstal PostgreSQL terlebih dahulu?**  
*A: Proyek ini dilengkapi dengan modul `pg-mem` (PostgreSQL In-Memory Engine) otomatis. Jika `DATABASE_URL` tidak diisi di `.env`, sistem akan membuat database PostgreSQL in-memory lengkap dengan skema 3NF dan data seeder secara instan.*

**Q: Bagaimana cara menghubungkan ke PostgreSQL server lokal saya sendiri?**  
*A: Buat database kosong (misal: `portfolio_db`) di PostgreSQL Anda, lalu isi variabel `DATABASE_URL` di file `.env` dengan format: `postgresql://user:password@localhost:5432/portfolio_db`. Saat server dijalankan, tabel dan seeder awal akan dibuat otomatis.*

---

© 2026 **Full-Stack Industrial Web Portfolio**. Hak Cipta Dilindungi Undang-Undang.
