# ⚙️ Backend — Sistem Lost & Found Kampus (Sequelize ORM & REST API)
> **PAW Final Project - Kelompok 5**

Backend REST API untuk sistem Lost & Found berbasis **Express.js, Sequelize ORM, PostgreSQL, JWT Authentication, Bcrypt Hashing, Google Gemini AI, dan Telegram Bot API**.

---

## 📁 Struktur Folder Backend

```
backend/
├── 📁 config/                       # Konfigurasi Koneksi & Lingkungan
│   ├── env.js                       # Pengelola Variabel Lingkungan (.env)
│   ├── db.js                        # Native PostgreSQL Connection Pool
│   └── sequelize.js                 # Instance Sequelize ORM & Pool Configuration
│
├── 📁 models/                       # Skema Tabel & Relasi Sequelize ORM
│   ├── User.js                      # Model Tabel Pengguna (users)
│   ├── LostReport.js                # Model Tabel Laporan Kehilangan (lost_reports)
│   ├── FoundItem.js                 # Model Tabel Barang Temuan Posko (found_items)
│   └── index.js                     # Loader Relasi Antar Model (Associations)
│
├── 📁 controllers/                  # Pengendali Alur Logika Bisnis API
│   ├── auth.controller.js           # Penanganan Login, Registrasi, dan Profil
│   ├── lostReports.controller.js    # Penanganan CRUD Laporan Kehilangan & AI Matching
│   ├── foundItems.controller.js     # Penanganan CRUD Barang Temuan & Upload Foto
│   ├── ai.controller.js             # Penanganan Chatbot Gemini NLP & Semantic Scoring
│   ├── admin.controller.js          # Penanganan Statistik KPI & Penyelesaian Serah Terima
│   ├── telegram.controller.js       # Penanganan Broadcast & Riwayat Log Pesan Bot
│   └── health.controller.js         # Monitoring Status Kesehatan Server
│
├── 📁 routes/                       # Definisi URL Endpoint REST API
│   ├── auth.routes.js               # Route /api/auth
│   ├── lostReports.routes.js        # Route /api/lost-reports
│   ├── foundItems.routes.js         # Route /api/found-items
│   ├── ai.routes.js                 # Route /api/ai
│   ├── admin.routes.js              # Route /api/admin
│   ├── telegram.routes.js           # Route /api/telegram
│   └── health.routes.js             # Route /health
│
├── 📁 middlewares/                  # Filter Keamanan Request HTTP
│   ├── auth.middleware.js           # Verifikasi JWT Bearer Token
│   └── admin.middleware.js          # Proteksi Khusus Role Admin (403 Forbidden)
│
├── 📁 services/                     # Layanan Komputasi & Integrasi API Eksternal
│   ├── aiMatcher.service.js         # Algoritma Pencocokan Skor Kemiripan Barang
│   └── telegram.service.js          # Client HTTP Pengiriman Notifikasi Bot Telegram
│
├── 📁 data/                         # Cadangan Data & Adapter Layer
│   ├── dummyData.js                 # Dataset Awal Pengujian
│   ├── db.json                      # Sinkronisasi File Database JSON Cadangan
│   └── db.js                        # Data Access Layer & Fallback Engine
│
├── 📁 scripts/                      # Skrip Otomasi Database
│   ├── migrate.js                   # Skrip Migrasi Skema Sequelize ORM (`npm run migrate`)
│   ├── seed.js                      # Skrip Pengisian Data Awal ORM (`npm run seed`)
│   └── schema.sql                   # Skema SQL Mentah PostgreSQL
│
├── 📁 utils/                        # Fungsi Utility
│   └── response.js                  # Standarisasi Format Respons JSON API
│
├── 📄 app.js                        # Entry Point Utama Server Express.js
├── 📄 package.json                  # Konfigurasi Dependensi Server
└── 📄 .env                          # Kredensial Database, Secret JWT, dan Token Bot
```

---

## 🚀 Cara Menjalankan Backend

```bash
cd backend
npm install
npm run migrate    # (Opsional) Sinkronisasi tabel Sequelize ORM
npm run seed       # (Opsional) Menanam data awal pengujian
npm run dev
```
Server aktif pada alamat: **`http://localhost:3000`**
