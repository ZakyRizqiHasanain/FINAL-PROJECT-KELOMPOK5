# 💻 Frontend — Sistem Lost & Found Kampus (Modular Multi-Page App)
> **PAW Final Project - Kelompok 5**

Antarmuka web interaktif berbasis **HTML5 Semantik, CSS3 Custom bertema KRS Online UMY, Bootstrap 5.3.3, Bootstrap Icons, dan Vanilla JavaScript ES6+** yang di-bundle menggunakan **Vite Multi-Page Application (MPA)**.

---

## 📁 Struktur Folder Modular

```
frontend/
├── 📁 admin/                 # Modul Khusus Hak Akses Petugas Posko (Admin)
│   ├── dashboard.html        # Statistik KPI & Visualisasi Grafik Chart.js
│   ├── reports.html          # Manajemen Semua Laporan Kehilangan Civitas
│   ├── inventory.html        # Manajemen Inventaris Fisik Barang Temuan Posko
│   ├── inbox.html            # Validasi Manual Rekomendasi AI & Kotak Masuk
│   ├── users.html            # Pengelolaan Akun Pengguna & Hak Akses
│   └── broadcast.html        # Fitur Siaran Pengumuman Massal ke Bot Telegram
│
├── 📁 auth/                  # Modul Autentikasi Pengguna
│   ├── login.html            # Form Masuk Civitas (Email & Password)
│   └── register.html         # Form Pendaftaran Akun & Aktivasi Bot Telegram
│
├── 📁 user/                  # Modul Fitur Mahasiswa & Civitas Kampus
│   ├── dashboard.html        # Dashboard Mahasiswa & Status Laporan Terkini
│   ├── my-reports.html       # Riwayat Laporan Pribadi & Konfirmasi Terima Barang
│   ├── report-lost.html      # Formulir Pelaporan Barang Hilang
│   ├── report-found.html     # Formulir Pencatatan Barang Ditemukan
│   ├── matches.html          # Halaman Rekomendasi Pencocokan AI Semantik
│   └── chatbot.html          # Asisten AI Chatbot Interaktif (Google Gemini NLP)
│
├── 📁 css/                   # Desain Tampilan & Tema
│   └── style.css             # Tema KRS Online UMY, Navbar Dinamis, & Card Layouts
│
├── 📁 js/                    # Logika Sisi Klien (Client Services)
│   ├── api.js                # REST API Client (Fetch HTTP ke Backend)
│   ├── auth.js               # JWT Token Guard, Auth Check, & Prefix URL Resolver
│   └── components.js         # Navbar Dinamis KRS, Collapsible Sidebar, Footer, Popup
│
├── 📄 index.html             # Beranda Utama / Landing Page (Entry Point Root Vite)
├── 📄 package.json           # Konfigurasi dependensi Vite
└── ⚙️ vite.config.js         # Konfigurasi Multi-Page Rollup Entry Points
```

---

## 🚀 Cara Menjalankan Frontend

```bash
cd frontend
npm install
npm start
```
Buka browser pada alamat: **`http://localhost:5173`**
