const db = require('../data/db');
const sendResponse = require('../utils/response');
const { findMatchingFoundItems } = require('../services/aiMatcher.service');
const { sendTelegramAlert } = require('../services/telegram.service');

function getAllLostReports(req, res) {
  const { category, status, search, userId } = req.query;
  let reports = db.get('lostReports');

  if (userId) {
    reports = reports.filter(r => r.userId === userId);
  }

  if (category && category !== 'ALL') {
    reports = reports.filter(r => r.category === category);
  }

  if (status && status !== 'ALL') {
    reports = reports.filter(r => r.status === status);
  }

  if (search) {
    const s = search.toLowerCase();
    reports = reports.filter(
      r =>
        r.title.toLowerCase().includes(s) ||
        r.features.toLowerCase().includes(s) ||
        r.lastSeenLocation.toLowerCase().includes(s) ||
        r.id.toLowerCase().includes(s) ||
        r.reporterName.toLowerCase().includes(s)
    );
  }

  return sendResponse(res, {
    code: 200,
    success: true,
    message: 'Data laporan kehilangan berhasil dimuat',
    data: reports
  });
}

function getLostReportById(req, res) {
  const { id } = req.params;
  const report = db.findById('lostReports', id);

  if (!report) {
    return sendResponse(res, {
      code: 404,
      success: false,
      message: `Laporan kehilangan dengan ID ${id} tidak ditemukan`
    });
  }

  const foundItems = db.get('foundItems');
  const matches = findMatchingFoundItems(report, foundItems);

  return sendResponse(res, {
    code: 200,
    success: true,
    message: 'Detail laporan kehilangan ditemukan',
    data: {
      report,
      matches
    }
  });
}

async function createLostReport(req, res) {
  const {
    title,
    category,
    color,
    lastSeenLocation,
    dateLost,
    approxTime,
    features,
    description,
    reporterName,
    reporterNim,
    reporterPhone,
    reporterTelegram,
    userId
  } = req.body;

  if (!title || !category || !lastSeenLocation) {
    return sendResponse(res, {
      code: 400,
      success: false,
      message: 'Judul barang, kategori, dan lokasi terakhir wajib diisi'
    });
  }

  const foundItems = db.get('foundItems');
  const reportPayload = {
    title,
    category,
    color: color || '-',
    lastSeenLocation,
    dateLost: dateLost || new Date().toISOString().split('T')[0],
    approxTime: approxTime || '12:00',
    features: features || '-',
    description: description || '',
    reporterName: reporterName || 'Civitas Kampus',
    reporterNim: reporterNim || '-',
    reporterPhone: reporterPhone || '-',
    reporterTelegram: reporterTelegram || '@user',
    userId: userId || 'usr-1'
  };

  // Run AI Semantic Matching
  const matches = findMatchingFoundItems(reportPayload, foundItems);
  const topMatch = matches.length > 0 ? matches[0] : null;
  const hasMatch = topMatch && topMatch.score >= 50;

  const newReport = db.insert('lostReports', {
    id: `LST-${Math.floor(100 + Math.random() * 900)}`,
    ...reportPayload,
    status: hasMatch ? 'ai_matched' : 'pending',
    matchedItemId: hasMatch ? topMatch.foundItem.id : null,
    matchScore: hasMatch ? topMatch.score : null,
    matchReason: hasMatch ? topMatch.explanation : 'Menunggu barang temuan serupa dicatat di posko.'
  });

  // If match detected, trigger Telegram Alert to Reporter
  if (hasMatch && reporterTelegram) {
    await sendTelegramAlert({
      recipient: reporterTelegram,
      recipientName: reporterName,
      message: `🤖 [AI LOST & FOUND KAMPUS]\nHalo ${reporterName},\nSistem AI mendeteksi kecocokan ${topMatch.score}% untuk laporan Anda (*${title}*) dengan barang temuan di *${topMatch.foundItem.storageLocation}*.\n\nAdmin akan segera memverifikasi fisik barang.`,
      type: 'AI_MATCH_SUGGESTION'
    });
  }

  return sendResponse(res, {
    code: 201,
    success: true,
    message: hasMatch
      ? 'Laporan berhasil dicatat & AI menemukan kemungkinan kecocokan!'
      : 'Laporan berhasil dicatat ke sistem',
    data: {
      report: newReport,
      topMatch,
      matches
    }
  });
}

function updateLostReport(req, res) {
  const { id } = req.params;
  const updated = db.update('lostReports', id, req.body);

  if (!updated) {
    return sendResponse(res, {
      code: 404,
      success: false,
      message: `Laporan ${id} tidak ditemukan`
    });
  }

  return sendResponse(res, {
    code: 200,
    success: true,
    message: 'Laporan berhasil diperbarui',
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
      message: `Laporan ${id} tidak ditemukan`
    });
  }

  return sendResponse(res, {
    code: 200,
    success: true,
    message: 'Laporan berhasil dihapus'
  });
}

module.exports = {
  getAllLostReports,
  getLostReportById,
  createLostReport,
  updateLostReport,
  deleteLostReport
};
