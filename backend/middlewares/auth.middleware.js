const jwt = require('jsonwebtoken');
const config = require('../config/env');
const db = require('../data/db');
const pg = require('../config/db');
const sendResponse = require('../utils/response');

/**
 * Middleware untuk memverifikasi JWT Bearer Token secara ketat
 * Menolak request tanpa token dengan status 401 Unauthorized
 */
async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return sendResponse(res, {
      code: 401,
      success: false,
      message: 'Akses Ditolak: Anda wajib login terlebih dahulu. Header "Authorization: Bearer <token>" tidak ditemukan.'
    });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    
    // Cari user di database PostgreSQL / fallback
    let user = null;
    if (pg.isConnected()) {
      try {
        const userRes = await pg.query('SELECT * FROM users WHERE id = $1', [decoded.id]);
        if (userRes.rowCount > 0) {
          user = userRes.rows[0];
        }
      } catch (e) {
        // fallback
      }
    }

    if (!user) {
      user = db.findById('users', decoded.id);
    }

    if (!user) {
      return sendResponse(res, {
        code: 401,
        success: false,
        message: 'Autentikasi Gagal: Akun pengguna tidak ditemukan di sistem atau telah dihapus.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return sendResponse(res, {
      code: 401,
      success: false,
      message: 'Token autentikasi tidak valid atau sudah kadaluwarsa. Silakan login kembali.'
    });
  }
}

/**
 * Middleware untuk memastikan role adalah Admin Posko Keamanan
 */
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return sendResponse(res, {
      code: 403,
      success: false,
      message: 'Akses Terlarang (403 Forbidden): Endpoint ini hanya dapat diakses oleh Admin Posko Keamanan Kampus.'
    });
  }
  next();
}

/**
 * Validator input saat pendaftaran / login
 */
function validateAuthPayload(type = 'login') {
  return (req, res, next) => {
    const { email, password, name } = req.body;

    if (type === 'login') {
      if (!email || !password) {
        return sendResponse(res, {
          code: 400,
          success: false,
          message: 'Validasi Gagal: Email dan kata sandi wajib diisi.'
        });
      }
    }

    if (type === 'register') {
      if (!name || !email || !password) {
        return sendResponse(res, {
          code: 400,
          success: false,
          message: 'Validasi Gagal: Nama lengkap, email kampus, dan kata sandi wajib diisi.'
        });
      }

      if (password.length < 6) {
        return sendResponse(res, {
          code: 400,
          success: false,
          message: 'Validasi Gagal: Kata sandi minimal harus terdiri dari 6 karakter.'
        });
      }
    }

    next();
  };
}

module.exports = {
  authenticateToken,
  requireAdmin,
  validateAuthPayload
};
