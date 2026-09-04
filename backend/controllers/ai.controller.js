const db = require('../data/db');
const sendResponse = require('../utils/response');
const { findMatchingFoundItems, parseChatbotWithGemini } = require('../services/aiMatcher.service');

function calculateMatches(req, res) {
  const { title, category, color, lastSeenLocation, features, description } = req.body;

  if (!title) {
    return sendResponse(res, {
      code: 400,
      success: false,
      message: 'Parameter judul barang diperlukan untuk pencocokan AI'
    });
  }

  const queryItem = {
    title,
    category: category || '',
    color: color || '',
    lastSeenLocation: lastSeenLocation || '',
    features: features || '',
    description: description || ''
  };

  const foundItems = db.get('foundItems');
  const matches = findMatchingFoundItems(queryItem, foundItems);

  return sendResponse(res, {
    code: 200,
    success: true,
    message: 'Hasil analisis pencocokan semantik AI selesai',
    data: {
      query: queryItem,
      totalInventoryChecked: foundItems.length,
      topMatch: matches.length > 0 ? matches[0] : null,
      matches
    }
  });
}

async function handleChatbotMessage(req, res) {
  const { message, existingData = {} } = req.body;

  if (!message) {
    return sendResponse(res, {
      code: 400,
      success: false,
      message: 'Pesan chat wajib dikirimkan'
    });
  }

  const inventory = db.get('foundItems');
  const result = await parseChatbotWithGemini(message, existingData, inventory);

  let replyText = result.aiGeneratedReply;

  if (!replyText) {
    if (result.isReady) {
      replyText =
        `Terima kasih! Saya telah merapikan informasi laporan Anda:\n\n` +
        `📦 **Nama Barang:** ${result.extracted.title}\n` +
        `🎨 **Warna:** ${result.extracted.color || 'Belum spesifik'}\n` +
        `📍 **Lokasi:** ${result.extracted.lastSeenLocation}\n` +
        `🏷️ **Ciri Khusus:** ${result.extracted.features}\n\n`;

      if (result.topMatch) {
        replyText += `✨ **Kabar Baik!** Sistem mendeteksi kecocokan **${result.topMatch.score}%** dengan barang di inventaris posko (*${result.topMatch.foundItem.title}* di *${result.topMatch.foundItem.storageLocation}*). Klik tombol Simpan Laporan untuk mencatat ke sistem!`;
      } else {
        replyText += `Data sudah cukup lengkap. Anda dapat langsung menyimpan laporan ini agar AI terus memantau inventaris posko untuk Anda.`;
      }
    } else {
      replyText = `Bisa sebutkan perkiraan warna dominan barang tersebut atau di sekitar mana terakhir kali Anda melihatnya?`;
    }
  }

  return sendResponse(res, {
    code: 200,
    success: true,
    message: 'Respon chatbot AI berhasil diproses',
    data: {
      reply: replyText,
      extracted: result.extracted,
      hasItemDetails: result.hasItemDetails,
      isReady: result.isReady,
      topMatch: result.topMatch,
      engine: result.engine
    }
  });
}

module.exports = {
  calculateMatches,
  handleChatbotMessage
};
