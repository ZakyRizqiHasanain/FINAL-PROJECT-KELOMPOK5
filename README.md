# 🧭 Sistem Informasi Lost & Found Kampus Berbasis AI & Telegram Bot
> **Tugas Akhir Mata Kuliah Pengembangan Aplikasi Web (PAW) — Kelompok 5**  
> *Sistem pelaporan, pencocokan cerdas, dan notifikasi serah terima barang hilang/temuan di lingkungan kampus Universitas Muhammadiyah Yogyakarta (UMY).*

---

## 📌 Ringkasan Singkat Proyek

**Lost & Found Kampus** adalah aplikasi web modern yang mentransformasikan proses pencarian barang hilang civitas akademika dari pasif menjadi aktif dan cerdas. Sistem ini mengintegrasikan **Dual-Engine AI (Google Gemini NLP & Hybrid Semantic Matcher)** serta **Bot Telegram Otomatis (`@LostFound_Kelompok5_bot`)** untuk mendeteksi kecocokan barang dan mengirimkan *push notification* instan ke ponsel pelapor.

### 🌟 Fitur Utama:
1. 🔐 **Autentikasi Aman:** Login/Register berbasis **JWT & Bcrypt** dengan verifikasi identitas civitas (NIM/WhatsApp/Telegram).
2. 📝 **Pelaporan Cepat:** Formulir pelaporan barang hilang & temuan dengan validasi *real-time*.
3. 🔍 **Pencocokan AI Semantik (Opsi A):** Rekomendasi otomatis barang temuan di posko dengan skor kemiripan berbobot (*Weighted Cosine Scoring*).
4. 💬 **Chatbot AI Interaktif (Opsi B):** Pelaporan santai menggunakan bahasa alami yang ditenagai oleh **Google Gemini AI**.
5. 🤖 **Push Alert Telegram Bot:** Notifikasi instan ke akun Telegram saat barang terdeteksi cocok $\ge 50\%$.
6. 📊 **Dashboard Analitik & Admin Posko:** Visualisasi grafik **Chart.js**, manajemen inventaris fisik, kotak masuk validasi, dan siaran pesan massal (*broadcast*).
7. 🔄 **Live 4-Phase Tracking:** Pelacakan status transparan (*Dilaporkan* $\rightarrow$ *AI Matched* $\rightarrow$ *Diverifikasi* $\rightarrow$ *Selesai*).

---

## ⚡ Panduan Cepat Menjalankan Sistem (Quick Start)

### 1. Jalankan Backend (Terminal 1)
```bash
cd backend
npm install
npm run dev
```
> 🟢 *Backend Express & Sequelize ORM aktif di:* `http://localhost:3000`

### 2. Jalankan Frontend (Terminal 2)
```bash
cd frontend
npm install
npm start
```
> 🌐 *Frontend Vite MPA aktif dan otomatis terbuka di:* `http://localhost:5173`

---

## 👥 Akun Demo Pengujian (Kata Sandi: `password123`)

| Peran (*Role*) | Email Akun | Kata Sandi | Username Telegram |
|:---|:---|:---|:---|
| **Admin Posko Keamanan** | `admin.lostfound@univ.ac.id` | `password123` | `@admin_posko_umy` |
| **Mahasiswa (Zaky Rizqi)** | `zaky.rizqi@student.ac.id` | `password123` | `@ZakyRizqiHasanain` |
| **Mahasiswi (Masayu Eqfa)** | `masayu.eqfa@student.ac.id` | `password123` | `@eqfa_masayu` |
| **Mahasiswa (Husen Nabil)** | `husen.nabil@student.ac.id` | `password123` | `@nabil_husen` |
| **Mahasiswi (Lailansyahda)** | `lailansyahda@student.ac.id` | `password123` | `@lailan_syahda` |
| **Mahasiswi (Ayuningtyas)** | `ayuningtyas@student.ac.id` | `password123` | `@tyas_ayuning` |

---
---

# 📄 PRODUCT REQUIREMENTS DOCUMENT (PRD) — REVISI FINAL

## Sistem Pelaporan & Pencarian Barang Hilang (Lost & Found) Berbasis AI

| Dokumen | Spesifikasi |
|:---|:---|
| **Nama Produk** | Lost & Found System |
| **Jenis Dokumen** | PRD (*Product Requirements Document*) |
| **Mata Kuliah** | PAW (Pengembangan Aplikasi Web) — Final Project |
| **Kelompok** | Kelompok 5 (PAW) |
| **Repositori** | [github.com/ZakyRizqiHasanain/FINAL-PROJECT-KELOMPOK5](https://github.com/ZakyRizqiHasanain/FINAL-PROJECT-KELOMPOK5) |
| **Drive Kelompok** | [Google Drive Kelompok 5](https://drive.google.com/drive/folders/1xWIVNwD3D8-SqUuL_v7i1HInyXndF75q?usp=sharing) |

---

## 1. Latar Belakang & Tujuan

### 1.1 Latar Belakang
Proses pelaporan dan pencarian barang hilang di lingkungan kampus biasanya bersifat pasif — pelapor harus mendatangi pos keamanan, bertanya manual, atau bahkan tidak tahu bahwa barangnya sudah ditemukan dan tersimpan di posko. Sistem ini dibangun untuk mentransformasikan proses tersebut menjadi aktif dan cerdas: pelapor cukup mendeskripsikan barang yang hilang, dan sistem membantu mencocokkannya dengan data barang temuan yang sudah tercatat admin, lengkap dengan notifikasi otomatis lewat Bot Telegram.

### 1.2 Tujuan Produk
- Mempercepat proses pelaporan barang hilang maupun barang temuan oleh civitas akademika.
- Membantu mencocokkan laporan kehilangan dengan data barang temuan secara cerdas tanpa pelapor harus menelusuri seluruh inventaris manual.
- Memberi notifikasi instan saat ada kemungkinan kecocokan lewat Bot Telegram.
- Memberi admin alat bantu (*dashboard*, validasi) untuk mengelola inventaris barang temuan dan memvalidasi kecocokan sebelum dikonfirmasi ke pelapor.
- Menjadi *capstone project* PAW yang mendemonstrasikan integrasi AI untuk pencocokan data tekstual/semantik dalam alur kerja nyata (*lost & found*).

### 1.3 Target Pengguna
| Peran | Deskripsi |
|---|---|
| **User (Civitas Akademika)** | Mahasiswa, dosen, staf — login, membuat laporan barang hilang/temuan, melihat rekomendasi kecocokan AI, berinteraksi dengan AI chatbot, dan menerima notifikasi Telegram. |
| **Admin (Petugas Posko)** | Login, mengelola inventaris fisik barang temuan, memvalidasi klaim kecocokan, memantau analitik KPI dashboard, dan mengirimkan siaran telegram (*broadcast*). |

---

## 2. Ruang Lingkup (Scope)

### 2.1 In-Scope
- Login & autentikasi sistem berbasis peran (Role `User` dan `Admin`) menggunakan **JWT & Bcrypt**.
- Formulir pelaporan barang hilang dan barang temuan civitas.
- **Implementasi Dua Opsi Pendekatan AI (Tercapai Keduanya):**
  - **Opsi A (Pencocokan Berbasis List / Semantic Search):** Algoritma pencocokan semantik & keyword berbobot dengan scoring persentase kemiripan.
  - **Opsi B (Chatbot Pelaporan Interaktif):** Ekstraksi entitas data barang hilang otomatis dari percakapan santai ditenagai **Google Gemini AI**.
- Notifikasi otomatis & manual via **Bot Telegram API (`@LostFound_Kelompok5_bot`)**.
- Dashboard statistik, analitik grafik sebaran lokasi/kategori (**Chart.js**), dan kotak masuk validasi (**Inbox Admin**).
- Dialog validasi dan alur serah terima barang menggunakan modal interaktif **SweetAlert2**.

### 2.2 Out-of-Scope
- Pencocokan visual/gambar berbasis *Computer Vision* (fokus pada representasi tekstual & semantik terstruktur).
- Pengambilan/pengantaran logistik fisik (serah terima fisik tetap dilakukan di Pos Keamanan Kampus).
- *Payment gateway* (tidak relevan untuk sistem fasilitas kampus).
- Aplikasi *mobile native* (diakomodasi melalui web responsif bertema KRS Online UMY).

### 2.3 Rincian Dua Opsi Fitur AI yang Diimplementasikan

| Opsi | Nama Fitur | Cara Kerja & Implementasi di Sistem |
|:---:|:---|:---|
| **A** | **Pencocokan Semantik Berbasis List (Semantic Matcher List)** | Saat pengguna membuat laporan, mesin `aiMatcher.service.js` menghitung skor kemiripan multi-dimensi (Kategori $25\%$, Judul $35\%$, Ciri/Warna $25\%$, Lokasi $15\%$) terhadap inventaris posko, lalu menampilkannya pada halaman `matches.html`. |
| **B** | **Chatbot Pelaporan Interaktif (Google Gemini NLP)** | Pengguna cukup mengobrol santai di halaman `chatbot.html`. Google Gemini AI menganalisis percakapan, menjawab SOP posko, dan otomatis mengekstrak JSON terstruktur untuk membuat laporan tanpa perlu mengisi formulir manual. |

---

## 3. Arsitektur & Tech Stack

| Layer / Komponen | Teknologi yang Digunakan | Penjelasan Implementasi |
|:---|:---|:---|
| **Frontend UI** | HTML5, CSS3 Custom + Bootstrap 5.3.3 | responsif, *glassmorphism*, dan *accessible*. |
| **Frontend Logic** | Vanilla JavaScript (ES6+) | Logika murni modular tanpa beban framework berat (Zero React/Vue). |
| **Frontend Build Tool** | Vite Multi-Page Application (MPA) | Dev server cepat dan *bundler* produksi multi-halaman (`vite.config.js`). |
| **UI Enhancements** | Chart.js & SweetAlert2 | Visualisasi grafik analitik dan modal dialog interaktif. |
| **Backend Server** | Node.js & Express.js | Arsitektur REST API dengan pola MVC (*Model-View-Controller*). |
| **ORM & Database** | Sequelize ORM (v6) + PostgreSQL | Pemetaan skema relasional tabel `users`, `lost_reports`, `found_items`. Dilengkapi *dual-engine fallback* data lokal `db.json`. |
| **Autentikasi** | JSON Web Token (JWT) + Bcrypt.js | Autentikasi sesi *stateless* (Bearer Token) dan *password hashing* aman (10 *salt rounds*). |
| **AI Engine (Opsi A)** | Weighted Semantic Matcher Engine | Algoritma *scoring* kesamaan teks, bobot kata kunci, dan penyesuaian kategori/lokasi. |
| **AI Engine (Opsi B)** | Google Gemini AI (Gemini 1.5 Flash) | Model NLP untuk ekstraksi data terstruktur dari dialog percakapan pengguna. |
| **Notifikasi Bot** | Telegram Bot API | Pengiriman notifikasi otomatis saat kecocokan $\ge 50\%$ dan siaran pesan massal posko. |

---

## 4. Struktur Tim & Pembagian Kerja

| Anggota | NIM | Fokus Tanggung Jawab & Fitur yang Dikerjakan |
|---|---|---|
| **Zaky Rizqi Hasanain** | `20240140109` | **Login & Autentikasi Sistem:** Arsitektur backend auth, JWT token, hashing password Bcrypt, middleware proteksi rute, halaman login, registrasi civitas, dan landing page. |
| **Muh Husen Nabil R** | `20240140223` | **Formulir Laporan & Pencocokan Opsi A (Semantic Search):** Model data laporan, service AI Matcher algoritma scoring berbobot, formulir pelaporan kehilangan/temuan, dan halaman rekomendasi kecocokan. |
| **Masayu Eqfalarissa** | `20240140227` | **Notifikasi Otomatis & Manual (Bot Telegram):** Integrasi Telegram Bot API, notifikasi otomatis barang cocok ($\ge 50\%$), rute webhook telegram, dan halaman siaran massal (*broadcast*) admin. |
| **Lailansyahda Azalia** | `20240140250` | **Dashboard Statistik & Manajemen Laporan (Admin Dashboard & Inbox):** Controller admin analitik, visualisasi grafik Chart.js, tabel master laporan kehilangan, inventaris posko, kotak masuk validasi, dan kelola pengguna. |
| **Ayuningtyas Dyah Septiani** | `20240140255` | **Dialog Validasi Admin & Opsi B (Chatbot Pelaporan Gemini AI):** Integrasi NLP Gemini AI Chatbot, live tracking 4-fase status laporan, dialog konfirmasi serah terima barang SweetAlert2, konfigurasi database ORM, dan dokumentasi teknis. |

---

## 5. Struktur Direktori Proyek

```text
FINAL-PROJECT-KELOMPOK5/
├── frontend/                     # Lapisan Antarmuka Pengguna (Vite MPA)
│   ├── admin/                    # Panel Khusus Petugas Posko (Dashboard, Reports, Inventory, Inbox, Users, Broadcast)
│   ├── auth/                     # Autentikasi (Login & Registrasi Civitas)
│   ├── user/                     # Panel Mahasiswa (Report Lost, Report Found, Matches, Chatbot, My Reports)
│   ├── css/                      # Desain Styling Tema KRS Online UMY (style.css)
│   ├── js/                       # Logika Frontend (api.js, auth.js, components.js)
│   ├── index.html                # Landing Page Utama
│   └── vite.config.js            # Konfigurasi Multi-Page Vite
│
├── backend/                      # Lapisan Server & RESTful API (Express.js)
│   ├── config/                   # Konfigurasi Database (Sequelize ORM & PostgreSQL Pool)
│   ├── controllers/              # Controller Bisnis (Auth, LostReports, FoundItems, Admin, AI, Telegram)
│   ├── middlewares/              # Middleware Proteksi JWT & Hak Akses Role
│   ├── models/                   # Model Sequelize (User, LostReport, FoundItem)
│   ├── routes/                   # Routing REST API
│   ├── services/                 # Layanan Eksternal (AI Matcher Service & Telegram Service)
│   ├── scripts/                  # Skrip Database Migration & Demo Data Seeder
│   └── app.js                    # Inisialisasi Express Server
│
└── README.md                     # Dokumentasi Lengkap & PRD Proyek
```

---
**PAW Final Project — Kelompok 5 © 2026**