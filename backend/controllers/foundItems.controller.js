const db = require('../data/db');
const sendResponse = require('../utils/response');
const { matchLostAndFoundItem } = require('../services/aiMatcher.service');
const { sendTelegramAlert } = require('../services/telegram.service');

function getAllFoundItems(req, res) {
  const { category, status, search } = req.query;
  let items = db.get('foundItems');

  if (category && category !== 'ALL') {
    items = items.filter(i => i.category === category);
  }

  if (status && status !== 'ALL') {
    items = items.filter(i => i.status === status);
  }

  if (search) {
    const s = search.toLowerCase();
    items = items.filter(
      i =>
        i.title.toLowerCase().includes(s) ||
        i.features.toLowerCase().includes(s) ||
        i.locationFound.toLowerCase().includes(s) ||
        i.storageLocation.toLowerCase().includes(s) ||
        i.id.toLowerCase().includes(s)
    );
  }

  return sendResponse(res, {
    code: 200,
    success: true,
    message: 'Data inventaris barang temuan berhasil dimuat',
    data: items
  });
}

function getFoundItemById(req, res) {
  const { id } = req.params;
  const item = db.findById('foundItems', id);

  if (!item) {
    return sendResponse(res, {
      code: 404,
      success: false,
      message: `Barang temuan ${id} tidak ditemukan`
    });
  }

  return sendResponse(res, {
    code: 200,
    success: true,
    message: 'Detail barang temuan ditemukan',
    data: item
  });
}

async function createFoundItem(req, res) {
  const {
    title,
    category,
    color,
    locationFound,
    dateFound,
    timeFound,
    storageLocation,
    foundBy,
    features,
    imageUrl
  } = req.body;

  if (!title || !category || !locationFound) {
    return sendResponse(res, {
      code: 400,
      success: false,
      message: 'Nama barang, kategori, dan lokasi ditemukan wajib diisi'
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
    id: `FND-${Math.floor(100 + Math.random() * 900)}`,
    title,
    category,
    color: color || '-',
    locationFound,
    dateFound: dateFound || new Date().toISOString().split('T')[0],
    timeFound: timeFound || '10:00',
    storageLocation: storageLocation || 'Posko Keamanan Pusat (Gedung Rektorat)',
    foundBy: foundBy || 'Civitas Kampus',
    features: features || '-',
    status: 'stored',
    imageUrl:
      imageUrl ||
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=80'
  });

  // Cross check with active lost reports
  const pendingReports = db.find('lostReports', r => r.status === 'pending');
  let matchedCount = 0;

  for (const report of pendingReports) {
    const match = matchLostAndFoundItem(report, newItem);
    if (match.score >= 50) {
      db.update('lostReports', report.id, {
        status: 'ai_matched',
        matchedItemId: newItem.id,
        matchScore: match.score,
        matchReason: match.explanation
      });
      matchedCount++;

      if (report.reporterTelegram) {
        await sendTelegramAlert({
          recipient: report.reporterTelegram,
          recipientName: report.reporterName,
          message: `🤖 [AI LOST & FOUND]\nAda barang temuan baru (*${newItem.title}*) di *${newItem.storageLocation}* yang memiliki kemiripan ${match.score}% dengan laporan Anda (*${report.title}*).`,
          type: 'AI_MATCH_SUGGESTION'
        });
      }
    }
  }

  return sendResponse(res, {
    code: 201,
    success: true,
    message: `Barang temuan berhasil dicatat di posko. Ditemukan ${matchedCount} laporan mahasiswa yang cocok.`,
    data: {
      foundItem: newItem,
      matchedCount
    }
  });
}

function updateFoundItem(req, res) {
  const { id } = req.params;
  const updated = db.update('foundItems', id, req.body);

  if (!updated) {
    return sendResponse(res, {
      code: 404,
      success: false,
      message: `Barang temuan ${id} tidak ditemukan`
    });
  }

  return sendResponse(res, {
    code: 200,
    success: true,
    message: 'Data barang temuan berhasil diperbarui',
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
      message: `Barang temuan ${id} tidak ditemukan`
    });
  }

  return sendResponse(res, {
    code: 200,
    success: true,
    message: 'Barang temuan berhasil dihapus dari inventaris'
  });
}

module.exports = {
  getAllFoundItems,
  getFoundItemById,
  createFoundItem,
  updateFoundItem,
  deleteFoundItem
};
