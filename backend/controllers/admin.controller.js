const bcrypt = require('bcryptjs');
const db = require('../data/db');
const sendResponse = require('../utils/response');
const { sendTelegramAlert } = require('../services/telegram.service');

/**
 * Statistik Lengkap & Agregasi Data Visual untuk Chart.js di Dashboard Admin
 */
function getStats(req, res) {
  const lostReports = db.get('lostReports');
  const foundItems = db.get('foundItems');
  const telegramLogs = db.get('telegramLogs');
  const users = db.get('users');

  const totalLost = lostReports.length;
  const totalFound = foundItems.length;
  const pendingValidation = lostReports.filter(r => r.status === 'ai_matched');
  const verifiedCount = lostReports.filter(r => r.status === 'verified');
  const resolvedCount = lostReports.filter(r => r.status === 'resolved');
  const openPendingCount = lostReports.filter(r => r.status === 'pending');

  const matchRate = totalLost > 0 
    ? Math.round(((verifiedCount.length + resolvedCount.length + pendingValidation.length) / totalLost) * 100) 
    : 0;

  const resolvedRate = totalLost > 0 
    ? Math.round((resolvedCount.length / totalLost) * 100) 
    : 0;

  // 1. Agregasi Berdasarkan Kategori Barang (Untuk Doughnut/Pie Chart)
  const categoryMap = {};
  lostReports.forEach(r => {
    const cat = r.category || 'Lain-lain';
    categoryMap[cat] = (categoryMap[cat] || 0) + 1;
  });

  // 2. Agregasi Berdasarkan Lokasi Gedung Kampus UMY (Untuk Bar Chart)
  const locationMap = {};
  lostReports.forEach(r => {
    const loc = r.lastSeenLocation || 'Lainnya';
    // Singkat nama gedung agar rapi di grafik
    const shortLoc = loc.split('(')[0].trim();
    locationMap[shortLoc] = (locationMap[shortLoc] || 0) + 1;
  });

  // 3. Status Breakdown
  const statusBreakdown = {
    pending: openPendingCount.length,
    ai_matched: pendingValidation.length,
    verified: verifiedCount.length,
    resolved: resolvedCount.length
  };

  // 4. Inventaris per Posko Fisik
  const storageLocationMap = {};
  foundItems.forEach(f => {
    const loc = f.storageLocation || 'Posko Pusat';
    const shortStorage = loc.split('(')[0].trim();
    storageLocationMap[shortStorage] = (storageLocationMap[shortStorage] || 0) + 1;
  });

  return sendResponse(res, {
    code: 200,
    success: true,
    message: 'Data statistik analitik dashboard admin berhasil dimuat',
    data: {
      totalLost,
      totalFound,
      pendingValidationCount: pendingValidation.length,
      verifiedCount: verifiedCount.length,
      resolvedCount: resolvedCount.length,
      matchRate,
      resolvedRate,
      telegramNotificationCount: telegramLogs.length,
      totalUsers: users.length,
      statusBreakdown,
      categoryStats: categoryMap,
      locationStats: locationMap,
      storageStats: storageLocationMap,
      recentPendingReports: pendingValidation.slice(0, 6),
      recentLostReports: lostReports.slice(-5).reverse(),
      recentFoundItems: foundItems.slice(-5).reverse()
    }
  });
}

/**
 * Validasi Kecocokan AI (Setujui / Tolak)
 */
async function validateMatch(req, res) {
  const { lostReportId, foundItemId, action = 'approve', notes = '' } = req.body;

  if (!lostReportId) {
    return sendResponse(res, {
      code: 400,
      success: false,
      message: 'ID laporan kehilangan wajib dikirim'
    });
  }

  const lostReport = db.findById('lostReports', lostReportId);
  if (!lostReport) {
    return sendResponse(res, {
      code: 404,
      success: false,
      message: `Laporan ${lostReportId} tidak ditemukan`
    });
  }

  const targetFoundItem = foundItemId ? db.findById('foundItems', foundItemId) : null;

  if (action === 'approve') {
    const updatedReport = db.update('lostReports', lostReportId, {
      status: 'verified',
      matchedItemId: foundItemId || lostReport.matchedItemId,
      adminValidationNotes: notes || 'Fisik barang telah diverifikasi di posko keamanan.',
      verifiedAt: new Date().toISOString()
    });

    if (foundItemId) {
      db.update('foundItems', foundItemId, {
        status: 'matched'
      });
    }

    let telegramResult = null;
    if (lostReport.reporterTelegram) {
      telegramResult = await sendTelegramAlert({
        recipient: lostReport.reporterTelegram,
        recipientName: lostReport.reporterName,
        message:
          `🔔 [LOST & FOUND UMY - TERVERIFIKASI]\n` +
          `Halo ${lostReport.reporterName},\n` +
          `Laporan Anda (*${lostReport.title}*) telah DIVERIFIKASI & COCOK dengan fisik barang di *${targetFoundItem?.storageLocation || 'Posko Keamanan UMY'}*.\n\n` +
          `📍 Lokasi Posko: ${targetFoundItem?.storageLocation || 'Posko Keamanan UMY'}\n` +
          `🏷️ Ref ID: ${lostReport.id} / ${targetFoundItem?.id || 'FND-POSKO'}\n` +
          `📝 Catatan Petugas: ${notes || 'Bawa KTM / identitas asli saat serah terima barang.'}`,
        type: 'MATCH_VERIFIED'
      });
    }

    return sendResponse(res, {
      code: 200,
      success: true,
      message: 'Kecocokan berhasil divalidasi & notifikasi Telegram telah dikirim ke pelapor!',
      data: {
        report: updatedReport,
        telegramResult
      }
    });
  } else {
    const updatedReport = db.update('lostReports', lostReportId, {
      status: 'pending',
      matchedItemId: null,
      matchScore: null,
      adminValidationNotes: notes || 'Kecocokan ditolak oleh admin posko setelah pemeriksaan fisik.'
    });

    return sendResponse(res, {
      code: 200,
      success: true,
      message: 'Kecocokan ditolak dan status laporan dikembalikan ke antrean pencarian',
      data: {
        report: updatedReport
      }
    });
  }
}

/**
 * Penyelesaian Klaim Barang
 */
function completeClaim(req, res) {
  const { lostReportId, foundItemId } = req.body;

  if (!lostReportId) {
    return sendResponse(res, {
      code: 400,
      success: false,
      message: 'ID laporan kehilangan wajib disertakan'
    });
  }

  const report = db.findById('lostReports', lostReportId);
  if (!report) {
    return sendResponse(res, {
      code: 404,
      success: false,
      message: 'Laporan kehilangan tidak ditemukan'
    });
  }

  // Jika bukan admin, pastikan yang mengklaim adalah pemilik laporan (jika ada userId)
  if (req.user && req.user.role !== 'admin' && report.userId && req.user.id && report.userId !== req.user.id) {
    return sendResponse(res, {
      code: 403,
      success: false,
      message: 'Akses ditolak: Anda hanya dapat menyelesaikan laporan milik Anda sendiri'
    });
  }

  const updatedReport = db.update('lostReports', lostReportId, {
    status: 'resolved',
    resolvedAt: new Date().toISOString()
  });

  const targetFoundId = foundItemId || report.matchedItemId;
  if (targetFoundId) {
    db.update('foundItems', targetFoundId, {
      status: 'returned',
      returnedAt: new Date().toISOString()
    });
  }

  return sendResponse(res, {
    code: 200,
    success: true,
    message: 'Barang telah berhasil diserahterimakan dan status laporan selesai',
    data: updatedReport
  });
}

/**
 * PENGELOLAAN PENGGUNA (USERS MANAGEMENT) - FULL CRUD
 */
function getAllUsers(req, res) {
  const users = db.get('users').map(u => ({
    id: u.id,
    name: u.name,
    nim: u.nim || u.nip || '-',
    email: u.email,
    phone: u.phone,
    telegramUsername: u.telegramUsername,
    role: u.role || 'user',
    createdAt: u.createdAt
  }));

  return sendResponse(res, {
    code: 200,
    success: true,
    message: 'Daftar pengguna civitas berhasil dimuat',
    data: users
  });
}

async function createUser(req, res) {
  const { name, nim, email, phone, telegramUsername, role = 'user', password } = req.body;

  if (!name || !email) {
    return sendResponse(res, {
      code: 400,
      success: false,
      message: 'Nama dan email pengguna wajib diisi'
    });
  }

  const existing = db.findOne('users', u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return sendResponse(res, {
      code: 400,
      success: false,
      message: `Email ${email} sudah terdaftar dalam sistem`
    });
  }

  let telegram = telegramUsername ? telegramUsername.trim() : '';
  if (telegram && !telegram.startsWith('@')) telegram = '@' + telegram;

  const rawPassword = password || '12345678';
  const hashedPassword = await bcrypt.hash(rawPassword, 10);

  const newUser = db.insert('users', {
    name: name.trim(),
    nim: nim ? nim.trim() : '-',
    email: email.trim().toLowerCase(),
    phone: phone ? phone.trim() : '-',
    telegramUsername: telegram,
    role: ['admin', 'user'].includes(role) ? role : 'user',
    password: hashedPassword
  });

  return sendResponse(res, {
    code: 201,
    success: true,
    message: 'Pengguna baru berhasil ditambahkan oleh admin',
    data: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
    }
  });
}

function updateUser(req, res) {
  const { id } = req.params;
  const { name, nim, email, phone, telegramUsername, role } = req.body;

  const user = db.findById('users', id);
  if (!user) {
    return sendResponse(res, {
      code: 404,
      success: false,
      message: 'Pengguna tidak ditemukan'
    });
  }

  let telegram = telegramUsername !== undefined ? telegramUsername.trim() : user.telegramUsername;
  if (telegram && !telegram.startsWith('@')) telegram = '@' + telegram;

  const updates = {};
  if (name) updates.name = name.trim();
  if (nim) updates.nim = nim.trim();
  if (email) updates.email = email.trim().toLowerCase();
  if (phone) updates.phone = phone.trim();
  if (telegram !== undefined) updates.telegramUsername = telegram;
  if (role && ['admin', 'user'].includes(role)) updates.role = role;

  const updatedUser = db.update('users', id, updates);

  return sendResponse(res, {
    code: 200,
    success: true,
    message: 'Data pengguna berhasil diperbarui',
    data: updatedUser
  });
}

function updateUserRole(req, res) {
  const { id } = req.params;
  const { role } = req.body;

  if (!role || !['admin', 'user'].includes(role)) {
    return sendResponse(res, {
      code: 400,
      success: false,
      message: 'Role harus bernilai "admin" atau "user"'
    });
  }

  const updatedUser = db.update('users', id, { role });
  if (!updatedUser) {
    return sendResponse(res, {
      code: 404,
      success: false,
      message: 'Pengguna tidak ditemukan'
    });
  }

  return sendResponse(res, {
    code: 200,
    success: true,
    message: `Role pengguna berhasil diubah menjadi ${role}`,
    data: {
      id: updatedUser.id,
      name: updatedUser.name,
      role: updatedUser.role
    }
  });
}

function deleteUser(req, res) {
  const { id } = req.params;
  const deleted = db.delete('users', id);
  if (!deleted) {
    return sendResponse(res, {
      code: 404,
      success: false,
      message: 'Pengguna tidak ditemukan'
    });
  }

  return sendResponse(res, {
    code: 200,
    success: true,
    message: 'Data pengguna berhasil dihapus'
  });
}

/**
 * PENGELOLAAN LAPORAN KEHILANGAN (LOST REPORTS MANAGEMENT) - FULL CRUD
 */
function createLostReportByAdmin(req, res) {
  const { title, category, color, lastSeenLocation, dateLost, approxTime, features, reporterName, reporterNim, reporterPhone, reporterTelegram } = req.body;

  if (!title || !category || !lastSeenLocation) {
    return sendResponse(res, {
      code: 400,
      success: false,
      message: 'Judul barang, kategori, dan lokasi kehilangan wajib diisi'
    });
  }

  let telegram = reporterTelegram ? reporterTelegram.trim() : '';
  if (telegram && !telegram.startsWith('@')) telegram = '@' + telegram;

  const newReport = db.insert('lostReports', {
    title: title.trim(),
    category,
    color: color || 'Belum spesifik',
    lastSeenLocation,
    dateLost: dateLost || new Date().toISOString().split('T')[0],
    approxTime: approxTime || '12:00 WIB',
    features: features || 'Tidak ada ciri khusus',
    reporterName: reporterName || 'Civitas UMY',
    reporterNim: reporterNim || '-',
    reporterPhone: reporterPhone || '-',
    reporterTelegram: telegram,
    status: 'pending',
    matchedItemId: null,
    matchScore: null
  });

  return sendResponse(res, {
    code: 201,
    success: true,
    message: 'Laporan kehilangan berhasil dibuat oleh admin',
    data: newReport
  });
}

function updateLostReport(req, res) {
  const { id } = req.params;
  const updates = req.body;

  const updated = db.update('lostReports', id, updates);
  if (!updated) {
    return sendResponse(res, {
      code: 404,
      success: false,
      message: 'Laporan kehilangan tidak ditemukan'
    });
  }

  return sendResponse(res, {
    code: 200,
    success: true,
    message: 'Data laporan kehilangan berhasil diperbarui',
    data: updated
  });
}

function deleteLostReport(req, res) {
  const { id } = req.params;
  const deleted = db.delete('lostReports', id);
  if (!deleted) {
    return sendResponse(res, {
      code: 404,
      success: false,
      message: 'Laporan tidak ditemukan'
    });
  }

  return sendResponse(res, {
    code: 200,
    success: true,
    message: 'Laporan kehilangan berhasil dihapus'
  });
}

/**
 * PENGELOLAAN INVENTARIS FISIK POSKO (FOUND ITEMS MANAGEMENT) - FULL CRUD
 */
function createFoundItemByAdmin(req, res) {
  const { title, category, color, locationFound, storageLocation, dateFound, timeFound, foundBy, features, imageUrl } = req.body;

  if (!title || !category || !locationFound || !storageLocation) {
    return sendResponse(res, {
      code: 400,
      success: false,
      message: 'Nama barang, kategori, lokasi ditemukan, dan titik simpan posko wajib diisi'
    });
  }

  if (imageUrl && imageUrl.startsWith('data:')) {
    const isPngOrJpg = imageUrl.startsWith('data:image/png') || imageUrl.startsWith('data:image/jpeg') || imageUrl.startsWith('data:image/jpg');
    if (!isPngOrJpg) {
      return sendResponse(res, {
        code: 400,
        success: false,
        message: 'Format file foto tidak didukung. Foto wajib berupa file PNG atau JPG/JPEG.'
      });
    }
  }

  const newItem = db.insert('foundItems', {
    title: title.trim(),
    category,
    color: color || 'Sesuai fisik',
    locationFound,
    storageLocation,
    dateFound: dateFound || new Date().toISOString().split('T')[0],
    timeFound: timeFound || '12:00 WIB',
    foundBy: foundBy || 'Petugas Posko',
    features: features || 'Tersimpan aman di posko',
    imageUrl: imageUrl || 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600',
    status: 'stored'
  });

  return sendResponse(res, {
    code: 201,
    success: true,
    message: 'Barang temuan berhasil dicatat ke inventaris posko oleh admin',
    data: newItem
  });
}

function updateFoundItem(req, res) {
  const { id } = req.params;
  const updates = req.body;

  if (updates.imageUrl && updates.imageUrl.startsWith('data:')) {
    const isPngOrJpg = updates.imageUrl.startsWith('data:image/png') || updates.imageUrl.startsWith('data:image/jpeg') || updates.imageUrl.startsWith('data:image/jpg');
    if (!isPngOrJpg) {
      return sendResponse(res, {
        code: 400,
        success: false,
        message: 'Format file foto tidak didukung. Foto wajib berupa file PNG atau JPG/JPEG.'
      });
    }
  }

  const updated = db.update('foundItems', id, updates);
  if (!updated) {
    return sendResponse(res, {
      code: 404,
      success: false,
      message: 'Barang temuan tidak ditemukan'
    });
  }

  return sendResponse(res, {
    code: 200,
    success: true,
    message: 'Inventaris barang temuan berhasil diperbarui',
    data: updated
  });
}

function deleteFoundItem(req, res) {
  const { id } = req.params;
  const deleted = db.delete('foundItems', id);
  if (!deleted) {
    return sendResponse(res, {
      code: 404,
      success: false,
      message: 'Barang temuan tidak ditemukan'
    });
  }

  return sendResponse(res, {
    code: 200,
    success: true,
    message: 'Barang temuan berhasil dihapus dari inventaris posko'
  });
}

/**
 * RIWAYAT NOTIFIKASI TELEGRAM
 */
function getTelegramLogs(req, res) {
  const logs = db.get('telegramLogs') || [];
  return sendResponse(res, {
    code: 200,
    success: true,
    message: 'Riwayat notifikasi Telegram berhasil dimuat',
    data: logs.reverse()
  });
}

module.exports = {
  getStats,
  validateMatch,
  completeClaim,
  getAllUsers,
  createUser,
  updateUser,
  updateUserRole,
  deleteUser,
  createLostReportByAdmin,
  updateLostReport,
  deleteLostReport,
  createFoundItemByAdmin,
  updateFoundItem,
  deleteFoundItem,
  getTelegramLogs
};

