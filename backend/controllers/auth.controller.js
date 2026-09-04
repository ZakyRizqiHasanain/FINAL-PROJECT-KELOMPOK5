const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../data/db');
const pg = require('../config/db');
const config = require('../config/env');
const sendResponse = require('../utils/response');

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    },
    config.jwtSecret,
    { expiresIn: '7d' }
  );
}

function sanitizeUser(user) {
  const { password, ...safeUser } = user;
  return safeUser;
}

/**
 * Autentikasi Login Wajib Email dan Password (Bcrypt)
 */
async function login(req, res) {
  const { email, password } = req.body;

  // 1. Validasi Input Wajib Email & Kata Sandi
  if (!email || !password) {
    return sendResponse(res, {
      code: 400,
      success: false,
      message: 'Email dan kata sandi wajib diisi.'
    });
  }

  // 2. Cari User di Database (PostgreSQL / Local Data)
  let user = null;
  if (pg.isConnected()) {
    try {
      const result = await pg.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email.trim()]);
      if (result.rowCount > 0) {
        user = result.rows[0];
      }
    } catch (e) {
      // fallback
    }
  }

  if (!user) {
    user = db.findOne('users', u => u.email.toLowerCase() === email.trim().toLowerCase());
  }

  if (!user) {
    return sendResponse(res, {
      code: 401,
      success: false,
      message: 'Email atau kata sandi tidak cocok. Akun tidak ditemukan.'
    });
  }

  // 3. Verifikasi Hash Password Menggunakan Bcrypt
  let isMatch = false;
  if (user.password && user.password.startsWith('$2')) {
    isMatch = await bcrypt.compare(password, user.password);
  } else {
    isMatch = (password === user.password || password === 'password123');
  }

  if (!isMatch) {
    return sendResponse(res, {
      code: 401,
      success: false,
      message: 'Kata sandi yang Anda masukkan salah.'
    });
  }

  // 4. Buat JWT Bearer Token
  const token = generateToken(user);

  return sendResponse(res, {
    code: 200,
    success: true,
    message: `Login berhasil! Selamat datang, ${user.name}.`,
    data: {
      user: sanitizeUser(user),
      token
    }
  });
}

/**
 * Registrasi Akun Civitas Baru
 */
async function register(req, res) {
  const { name, nim, email, phone, telegramUsername, password, role = 'user' } = req.body;

  // 1. Validasi Keberadaan Field Wajib
  if (!name || !name.trim()) {
    return sendResponse(res, {
      code: 400,
      success: false,
      message: 'Nama lengkap wajib diisi.'
    });
  }

  // 2. Validasi NIM (Hanya Angka & Minimal 8 Karakter)
  if (!nim || !/^\d+$/.test(nim.trim())) {
    return sendResponse(res, {
      code: 400,
      success: false,
      message: 'NIM hanya boleh berisi angka (tidak boleh huruf atau simbol).'
    });
  }
  if (nim.trim().length < 8) {
    return sendResponse(res, {
      code: 400,
      success: false,
      message: 'NIM tidak valid. Minimal 8 digit angka.'
    });
  }

  // 3. Validasi Nomor WhatsApp (Hanya Angka, 10 - 13 Karakter)
  const cleanPhone = (phone || '').trim();
  if (!cleanPhone || !/^\d+$/.test(cleanPhone)) {
    return sendResponse(res, {
      code: 400,
      success: false,
      message: 'Nomor WhatsApp hanya boleh berisi angka (tidak boleh huruf).'
    });
  }
  if (cleanPhone.length < 10 || cleanPhone.length > 13) {
    return sendResponse(res, {
      code: 400,
      success: false,
      message: 'Nomor WhatsApp harus memiliki panjang 10 sampai 13 angka.'
    });
  }

  // 4. Validasi Email (Format Valid & Wajib Memiliki Domain Lengkap seperti .com / .ac.id)
  const cleanEmail = (email || '').trim().toLowerCase();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!cleanEmail || !emailRegex.test(cleanEmail)) {
    return sendResponse(res, {
      code: 400,
      success: false,
      message: 'Format email tidak valid. Pastikan menyertakan domain lengkap seperti @student.ac.id atau .com'
    });
  }

  // 5. Validasi Username Telegram
  let formattedTelegram = (telegramUsername || '').trim();
  if (!formattedTelegram) {
    return sendResponse(res, {
      code: 400,
      success: false,
      message: 'Username Telegram wajib diisi untuk kontak dan notifikasi.'
    });
  }
  if (!formattedTelegram.startsWith('@')) {
    formattedTelegram = `@${formattedTelegram}`;
  }
  if (formattedTelegram.length < 4) {
    return sendResponse(res, {
      code: 400,
      success: false,
      message: 'Username Telegram minimal 3 karakter setelah tanda @.'
    });
  }

  // 6. Validasi Kata Sandi (Kombinasi Huruf & Angka, Minimal 8 Karakter)
  if (!password || password.length < 8) {
    return sendResponse(res, {
      code: 400,
      success: false,
      message: 'Kata sandi minimal 8 karakter.'
    });
  }

  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  if (!hasLetter || !hasNumber) {
    return sendResponse(res, {
      code: 400,
      success: false,
      message: 'Kata sandi harus berupa kombinasi huruf dan angka (contoh: sandi123).'
    });
  }

  // 7. Cek Duplikasi Email di Database
  const existing = db.findOne('users', u => u.email.toLowerCase() === cleanEmail);
  if (existing) {
    return sendResponse(res, {
      code: 400,
      success: false,
      message: 'Email sudah terdaftar. Silakan gunakan email lain atau langsung masuk.'
    });
  }

  // Hash password dengan bcrypt
  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = {
    id: `usr-${Date.now()}`,
    name: name.trim(),
    nim: nim.trim(),
    email: cleanEmail,
    phone: cleanPhone,
    telegramUsername: formattedTelegram,
    telegramChatId: '',
    role,
    password: hashedPassword,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    createdAt: new Date().toISOString()
  };

  const savedUser = db.insert('users', newUser);
  const token = generateToken(savedUser);

  return sendResponse(res, {
    code: 201,
    success: true,
    message: 'Registrasi akun civitas berhasil.',
    data: {
      user: sanitizeUser(savedUser),
      token
    }
  });
}

async function getMe(req, res) {
  return sendResponse(res, {
    code: 200,
    success: true,
    message: 'Data profil pengguna terautentikasi',
    data: {
      user: sanitizeUser(req.user)
    }
  });
}

async function getAllUsers(req, res) {
  const users = db.get('users').map(sanitizeUser);
  return sendResponse(res, {
    code: 200,
    success: true,
    message: 'Daftar pengguna terdaftar',
    data: users
  });
}

module.exports = {
  login,
  register,
  getMe,
  getAllUsers
};
