/**
 * Dummy Seed Data untuk Sistem Pelaporan & Pencarian Barang Hilang (Lost & Found)
 * PAW Final Project - Kelompok 5
 */

const bcrypt = require('bcryptjs');

// Hashed password default untuk semua akun demo: 'password123'
const DEFAULT_HASH = bcrypt.hashSync('password123', 10);

const users = [
  {
    id: 'usr-1',
    name: 'Zaky Rizqi Hasanain',
    nim: '20240140109',
    email: 'zaky.rizqi@student.ac.id',
    password: DEFAULT_HASH,
    role: 'user',
    phone: '081234567890',
    telegramUsername: '@zakyrizqi',
    telegramChatId: '987654321',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-08-25T08:00:00Z'
  },
  {
    id: 'usr-2',
    name: 'Masayu Eqfalarissa',
    nim: '20240140227',
    email: 'masayu.eqfa@student.ac.id',
    password: DEFAULT_HASH,
    role: 'user',
    phone: '081298765432',
    telegramUsername: '@masayueqfa',
    telegramChatId: '876543210',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-08-26T09:30:00Z'
  },
  {
    id: 'usr-3',
    name: 'Muh Husen Nabil R',
    nim: '20240140223',
    email: 'husen.nabil@student.ac.id',
    password: DEFAULT_HASH,
    role: 'user',
    phone: '081345678901',
    telegramUsername: '@husennabil',
    telegramChatId: '765432109',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-08-27T10:15:00Z'
  },
  {
    id: 'usr-4',
    name: 'Lailansyahda Azalia',
    nim: '20240140250',
    email: 'lailansyahda@student.ac.id',
    password: DEFAULT_HASH,
    role: 'user',
    phone: '081456789012',
    telegramUsername: '@lailansyahda',
    telegramChatId: '654321098',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-08-27T11:00:00Z'
  },
  {
    id: 'usr-5',
    name: 'Ayuningtyas Dyah Septiani',
    nim: '20240140255',
    email: 'ayuningtyas@student.ac.id',
    password: DEFAULT_HASH,
    role: 'user',
    phone: '081567890123',
    telegramUsername: '@ayuningtyas',
    telegramChatId: '543210987',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-08-28T07:45:00Z'
  },
  {
    id: 'adm-1',
    name: 'Pak Bambang (Admin Posko Keamanan)',
    nip: '198503152010121001',
    email: 'admin.lostfound@univ.ac.id',
    password: DEFAULT_HASH,
    role: 'admin',
    phone: '081122334455',
    telegramUsername: '@admin_lostfound_bot',
    telegramChatId: '112233445',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-08-01T00:00:00Z'
  }
];

const categories = [
  'Elektronik & Gadget',
  'Dokumen & Kartu Identitas',
  'Tas & Dompet',
  'Kunci & Akses',
  'Alat Tulis & Buku',
  'Pakaian & Aksesoris',
  'Botol Minum & Tumbler',
  'Lain-lain'
];

const locations = [
  'Gedung AR. Fachruddin A (Perpustakaan & R. Sidang)',
  'Gedung AR. Fachruddin B (Lobby & R. Kuliah)',
  'Gedung Siti Walidah (F1/F2)',
  'Gedung Ki Bagus Hadikusumo (E1-E6)',
  'Gedung Mas Mansyur (Kedokteran & Ilmu Kesehatan)',
  'Gedung Ibrahim (FTI / FEB / Lab Komputer)',
  'Masjid KH Ahmad Dahlan (Lantai 1 / Tempat Wudhu)',
  'Masjid KH Ahmad Dahlan (Lantai 2)',
  'Lapangan Bintang UMY',
  'Student Center (SC) UMY',
  'Cafe 1912 / Kantin Barat UMY',
  'Sportorium UMY',
  'Parkiran Gedung AR. Fachruddin',
  'Pos Keamanan Gerbang Utama UMY'
];

const foundItems = [
  {
    id: 'FND-001',
    title: 'Laptop ASUS ZenBook Biru Dongker',
    category: 'Elektronik & Gadget',
    color: 'Biru Dongker / Navy',
    locationFound: 'Gedung Ibrahim (FTI / FEB / Lab Komputer)',
    dateFound: '2026-09-01',
    timeFound: '14:30',
    storageLocation: 'Pos Satpam Gedung Ibrahim (FTI)',
    foundBy: 'Petugas Kebersihan (Pak Joko)',
    features: 'Stiker logo GitHub dan Python di cover belakang, ada lecet tipis di sudut kiri charger, tas laptop hitam merk Targus.',
    status: 'stored', // stored, matched, returned
    imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&auto=format&fit=crop&q=80',
    createdAt: '2026-09-01T14:45:00Z'
  },
  {
    id: 'FND-002',
    title: 'Dompet Kulit Coklat Merk Braun Buffel',
    category: 'Tas & Dompet',
    color: 'Coklat Tua',
    locationFound: 'Cafe 1912 / Kantin Barat UMY',
    dateFound: '2026-09-02',
    timeFound: '12:15',
    storageLocation: 'Brankas Barang Berharga (Posko Pusat)',
    foundBy: 'Mahasiswa (Husen Nabil)',
    features: 'Terdapat KTM atas nama Zaky R., kartu e-money Flazz saldo, dan beberapa lembar uang tunai.',
    status: 'matched',
    imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&auto=format&fit=crop&q=80',
    createdAt: '2026-09-02T12:20:00Z'
  },
  {
    id: 'FND-003',
    title: 'Tumbler Corkcicle Putih Glossy 16oz',
    category: 'Botol Minum & Tumbler',
    color: 'Putih Glossy',
    locationFound: 'Gedung AR. Fachruddin A (Perpustakaan & R. Sidang)',
    dateFound: '2026-09-02',
    timeFound: '09:45',
    storageLocation: 'Pos Satpam Gedung AR. Fachruddin A',
    foundBy: 'Staff Perpustakaan (Ibu Dewi)',
    features: 'Ada stiker inisial "M" warna holographic di tutup botol, ada sedikit goresan di bagian bawah botol.',
    status: 'stored',
    imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80',
    createdAt: '2026-09-02T10:00:00Z'
  },
  {
    id: 'FND-004',
    title: 'Gantungan Kunci Motor Honda Vario + Flashdisk Sandisk 32GB',
    category: 'Kunci & Akses',
    color: 'Hitam / Perak',
    locationFound: 'Parkiran Gedung AR. Fachruddin',
    dateFound: '2026-08-31',
    timeFound: '16:00',
    storageLocation: 'Pos Satpam Gedung AR. Fachruddin B',
    foundBy: 'Security Parkir',
    features: 'Ada gantungan boneka kecil karakter Totoro dan flashdisk Sandisk Cruzer Blade merah hitam.',
    status: 'stored',
    imageUrl: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=600&auto=format&fit=crop&q=80',
    createdAt: '2026-08-31T16:15:00Z'
  },
  {
    id: 'FND-005',
    title: 'Headphone Sony WH-1000XM4 Hitam',
    category: 'Elektronik & Gadget',
    color: 'Hitam Matte',
    locationFound: 'Gedung Ki Bagus Hadikusumo (E1-E6)',
    dateFound: '2026-08-30',
    timeFound: '17:20',
    storageLocation: 'Posko Keamanan Pusat (Gerbang Utama)',
    foundBy: 'Dosen Pengampu',
    features: 'Ear pad sebelah kanan agak berkerut, tersimpan dalam hardcase hitam dengan kabel AUX cadangan.',
    status: 'returned',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
    createdAt: '2026-08-30T17:30:00Z'
  },
  {
    id: 'FND-006',
    title: 'Kacamata Minus Frame Titanium Hitam Bulat',
    category: 'Pakaian & Aksesoris',
    color: 'Hitam Titanium',
    locationFound: 'Masjid KH Ahmad Dahlan (Lantai 1 / Tempat Wudhu)',
    dateFound: '2026-09-02',
    timeFound: '13:00',
    storageLocation: 'Pos Satpam Gedung Siti Walidah',
    foundBy: 'Jamaah Masjid',
    features: 'Frame merk Owndays, lensa minus silinder, ada kotak kacamata warna abu-abu.',
    status: 'stored',
    imageUrl: 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?w=600&auto=format&fit=crop&q=80',
    createdAt: '2026-09-02T13:15:00Z'
  }
];

const lostReports = [
  {
    id: 'LST-101',
    userId: 'usr-1',
    reporterName: 'Zaky Rizqi Hasanain',
    reporterNim: '20240140109',
    reporterPhone: '081234567890',
    reporterTelegram: '@zakyrizqi',
    title: 'Laptop ASUS ZenBook Biru untuk Tugas Akhir',
    category: 'Elektronik & Gadget',
    color: 'Biru Tua / Navy',
    lastSeenLocation: 'Gedung Ibrahim (FTI / FEB / Lab Komputer)',
    dateLost: '2026-09-01',
    approxTime: '14:00 - 15:00 WIB',
    features: 'Laptop ASUS Zenbook 14 inci, warna navy blue, ada stiker GitHub dan Python, di dalam tas ransel hitam.',
    description: 'Tertinggal di meja ujung dekat proyektor setelah kelas praktikum PAW selesai jam 14:30 WIB.',
    status: 'ai_matched', // pending, ai_matched, verified, resolved
    matchedItemId: 'FND-001',
    matchScore: 94,
    createdAt: '2026-09-01T15:10:00Z',
    matchReason: 'Sangat cocok pada nama merek (ASUS ZenBook), warna (Biru Dongker/Navy), lokasi (Gedung Ibrahim/FTI), dan ciri khusus stiker GitHub/Python.'
  },
  {
    id: 'LST-102',
    userId: 'usr-2',
    reporterName: 'Masayu Eqfalarissa',
    reporterNim: '20240140227',
    reporterPhone: '081298765432',
    reporterTelegram: '@masayueqfa',
    title: 'Tumbler Corkcicle Putih Stiker Huruf M',
    category: 'Botol Minum & Tumbler',
    color: 'Putih',
    lastSeenLocation: 'Gedung AR. Fachruddin A (Perpustakaan & R. Sidang)',
    dateLost: '2026-09-02',
    approxTime: '09:00 WIB',
    features: 'Warna putih glossy, tutup ada stiker inisial M glitter hologram.',
    description: 'Ketinggalan di sofa ruang diskusi perpus AR Fachruddin A waktu ngerjain tugas kelompok.',
    status: 'ai_matched',
    matchedItemId: 'FND-003',
    matchScore: 91,
    createdAt: '2026-09-02T10:00:00Z',
    matchReason: 'Kemiripan tinggi pada merek Corkcicle, warna putih glossy, lokasi Gedung AR. Fachruddin A, dan detail stiker inisial M.'
  },
  {
    id: 'LST-103',
    userId: 'usr-1',
    reporterName: 'Zaky Rizqi Hasanain',
    reporterNim: '20240140109',
    reporterPhone: '081234567890',
    reporterTelegram: '@zakyrizqi',
    title: 'Dompet Coklat Isi KTM & Kartu Penting',
    category: 'Tas & Dompet',
    color: 'Coklat',
    lastSeenLocation: 'Cafe 1912 / Kantin Barat UMY',
    dateLost: '2026-09-02',
    approxTime: '12:00 WIB',
    features: 'Dompet kulit warna coklat merk Braun Buffel, ada KTM atas nama Zaky Rizqi.',
    description: 'Jatuh saat membayar makanan di kasir Cafe 1912 sekitar jam makan siang.',
    status: 'verified',
    matchedItemId: 'FND-002',
    matchScore: 98,
    createdAt: '2026-09-02T12:30:00Z',
    matchReason: 'Kecocokan mutlak: Terverifikasi identitas KTM pemilik yang tersimpan di dalam dompet oleh Admin.',
    adminValidationNotes: 'Fisik dompet cocok dan terverifikasi di Brankas Posko Pusat. Bawa identitas diri saat serah terima.',
    verifiedAt: '2026-09-02T12:45:00Z'
  },
  {
    id: 'LST-104',
    userId: 'usr-3',
    reporterName: 'Muh Husen Nabil R',
    reporterNim: '20240140223',
    reporterPhone: '081345678901',
    reporterTelegram: '@husennabil',
    title: 'Kunci Motor Honda Vario dengan Flashdisk Merah',
    category: 'Kunci & Akses',
    color: 'Hitam / Merah',
    lastSeenLocation: 'Parkiran Gedung AR. Fachruddin',
    dateLost: '2026-08-31',
    approxTime: '15:45 WIB',
    features: 'Gantungan kunci ada boneka totoro kecil dan flashdisk sandisk merah.',
    description: 'Tergantung di jok motor atau jatuh di paving parkiran gedung AR Fachruddin.',
    status: 'ai_matched',
    matchedItemId: 'FND-004',
    matchScore: 93,
    createdAt: '2026-08-31T16:30:00Z',
    matchReason: 'Kecocokan tinggi pada tipe kunci motor Honda, lokasi parkiran AR Fachruddin, dan deskripsi flashdisk serta gantungan totoro.'
  },
  {
    id: 'LST-105',
    userId: 'usr-4',
    reporterName: 'Lailansyahda Azalia',
    reporterNim: '20240140250',
    reporterPhone: '081456789012',
    reporterTelegram: '@lailansyahda',
    title: 'Kacamata Minus Bulat Frame Hitam',
    category: 'Pakaian & Aksesoris',
    color: 'Hitam',
    lastSeenLocation: 'Masjid KH Ahmad Dahlan (Lantai 1 / Tempat Wudhu)',
    dateLost: '2026-09-02',
    approxTime: '12:45 WIB',
    features: 'Frame bulat hitam titanium merek Owndays, lensa minus.',
    description: 'Ditaruh di dekat rak tempat wudhu saat sholat dzuhur berjamaah di Masjid KH Ahmad Dahlan.',
    status: 'ai_matched',
    matchedItemId: 'FND-006',
    matchScore: 89,
    createdAt: '2026-09-02T13:30:00Z',
    matchReason: 'Kemiripan tinggi pada kategori kacamata, merek Owndays, frame hitam bulat, dan lokasi Masjid KH Ahmad Dahlan.'
  }
];

const telegramLogs = [
  {
    id: 'TEL-901',
    timestamp: '2026-09-02 12:45:00',
    recipient: '@zakyrizqi',
    recipientName: 'Zaky Rizqi Hasanain',
    type: 'MATCH_VERIFIED',
    message: '🔔 [LOST & FOUND KAMPUS]\nHalo Zaky Rizqi,\nLaporan kehilangan Anda: *Dompet Coklat Isi KTM* telah DIVERIFIKASI & COCOK dengan barang temuan di *Posko Keamanan Pusat*.\n\n📍 Silakan ambil di Posko Pusat dengan menunjukkan KTM / identitas diri.\nNo. Referensi: FND-002 / LST-103',
    status: 'Sent (Success)'
  },
  {
    id: 'TEL-902',
    timestamp: '2026-09-01 15:15:00',
    recipient: '@zakyrizqi',
    recipientName: 'Zaky Rizqi Hasanain',
    type: 'AI_MATCH_SUGGESTION',
    message: '🤖 [AI LOST & FOUND]\nHalo Zaky,\nSistem AI menemukan kemungkinan kecocokan (94%) untuk laporan *Laptop ASUS ZenBook*. Admin sedang memverifikasi fisik barang di Posko FTI.',
    status: 'Sent (Success)'
  },
  {
    id: 'TEL-903',
    timestamp: '2026-09-02 10:05:00',
    recipient: '@masayueqfa',
    recipientName: 'Masayu Eqfalarissa',
    type: 'AI_MATCH_SUGGESTION',
    message: '🤖 [AI LOST & FOUND]\nHalo Masayu,\nSistem AI menemukan kemungkinan kecocokan (91%) untuk laporan *Tumbler Corkcicle Putih*. Barang tersimpan di Rak B-04 Perpustakaan.',
    status: 'Sent (Success)'
  }
];

module.exports = {
  users,
  categories,
  locations,
  foundItems,
  lostReports,
  telegramLogs
};
