-- ========================================================
-- Skema Database PostgreSQL: Sistem Lost & Found Kampus
-- PAW Final Project - Kelompok 5
-- ========================================================

-- 1. Tabel Users (Civitas Akademika & Admin Posko)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    nim VARCHAR(50) DEFAULT '-',
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user', -- 'user' | 'admin'
    phone VARCHAR(50) DEFAULT '-',
    telegram_username VARCHAR(100) DEFAULT '',
    telegram_chat_id VARCHAR(50) DEFAULT '',
    avatar TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabel Categories
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

-- 3. Tabel Locations
CREATE TABLE IF NOT EXISTS locations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) UNIQUE NOT NULL
);

-- 4. Tabel Found Items (Barang Temuan Fisik di Posko Keamanan)
CREATE TABLE IF NOT EXISTS found_items (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    category VARCHAR(100) NOT NULL,
    color VARCHAR(100) NOT NULL,
    location_found VARCHAR(200) NOT NULL,
    date_found DATE NOT NULL,
    time_found VARCHAR(20) DEFAULT '10:00',
    storage_location VARCHAR(200) NOT NULL,
    found_by VARCHAR(150) NOT NULL,
    features TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'stored', -- 'stored' | 'matched' | 'returned'
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tabel Lost Reports (Laporan Kehilangan Civitas)
CREATE TABLE IF NOT EXISTS lost_reports (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
    reporter_name VARCHAR(150) NOT NULL,
    reporter_nim VARCHAR(50) NOT NULL,
    reporter_phone VARCHAR(50) NOT NULL,
    reporter_telegram VARCHAR(100) NOT NULL,
    title VARCHAR(200) NOT NULL,
    category VARCHAR(100) NOT NULL,
    color VARCHAR(100) NOT NULL,
    last_seen_location VARCHAR(200) NOT NULL,
    date_lost DATE NOT NULL,
    approx_time VARCHAR(50) DEFAULT '-',
    features TEXT NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending' | 'ai_matched' | 'verified' | 'resolved'
    matched_item_id VARCHAR(50) REFERENCES found_items(id) ON DELETE SET NULL,
    match_score INT DEFAULT 0,
    match_reason TEXT,
    admin_validation_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP WITH TIME ZONE
);

-- 6. Tabel Telegram Logs (Riwayat Pengiriman Notifikasi Bot)
CREATE TABLE IF NOT EXISTS telegram_logs (
    id VARCHAR(50) PRIMARY KEY,
    recipient VARCHAR(100) NOT NULL,
    recipient_name VARCHAR(150),
    type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'Sent (Success)',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
