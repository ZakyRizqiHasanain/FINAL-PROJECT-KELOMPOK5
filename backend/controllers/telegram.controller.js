const sendResponse = require('../utils/response');
const { getTelegramLogs, sendTelegramAlert } = require('../services/telegram.service');

function getLogs(req, res) {
  const logs = getTelegramLogs();
  return sendResponse(res, {
    code: 200,
    success: true,
    message: 'Riwayat log pesan Bot Telegram berhasil dimuat',
    data: logs
  });
}

async function sendBroadcast(req, res) {
  const { recipient, recipientName, message, type = 'MANUAL_BROADCAST', chatId } = req.body;

  if (!recipient || !message) {
    return sendResponse(res, {
      code: 400,
      success: false,
      message: 'Username penerima dan isi pesan wajib diisi'
    });
  }

  const result = await sendTelegramAlert({
    recipient,
    recipientName: recipientName || 'Pengguna',
    message,
    type,
    chatId
  });

  return sendResponse(res, {
    code: 200,
    success: true,
    message: 'Pesan Bot Telegram berhasil dikirim & dicatat',
    data: result
  });
}

module.exports = {
  getLogs,
  sendBroadcast
};
