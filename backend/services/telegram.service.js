/**
 * Telegram Bot Notification Service (Backend)
 * Mengirim notifikasi ke Telegram Bot API dan mencatat log notifikasi ke database
 */

const https = require('https');
const config = require('../config/env');
const db = require('../data/db');

async function sendTelegramHttpRequest(botToken, chatId, text) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: 'Markdown'
    });

    const options = {
      hostname: 'api.telegram.org',
      port: 443,
      path: `/bot${botToken}/sendMessage`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      },
      timeout: 5000
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch (e) {
          resolve({ ok: false, error: 'Invalid JSON response from Telegram' });
        }
      });
    });

    req.on('error', (err) => {
      resolve({ ok: false, error: err.message });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ ok: false, error: 'Telegram request timeout' });
    });

    req.write(payload);
    req.end();
  });
}

async function sendTelegramAlert({ recipient, recipientName, message, type = 'NOTIFICATION', chatId }) {
  let deliveryStatus = 'Simulated (Success)';
  let apiResult = null;

  // If real Bot Token is provided and chatId exists, try real Telegram Bot HTTP API
  if (config.telegramBotToken && chatId) {
    try {
      apiResult = await sendTelegramHttpRequest(config.telegramBotToken, chatId, message);
      if (apiResult.ok) {
        deliveryStatus = 'Sent via Telegram Bot API (Live)';
      } else {
        deliveryStatus = `Simulated (Bot API: ${apiResult.description || 'Simulated'})`;
      }
    } catch (err) {
      deliveryStatus = 'Simulated (Offline fallback)';
    }
  }

  // Record log persistently in database
  const logEntry = db.insert('telegramLogs', {
    id: `TEL-${Math.floor(100 + Math.random() * 900)}`,
    timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
    recipient: recipient || '@civitas_kampus',
    recipientName: recipientName || 'Pengguna',
    type,
    message,
    status: deliveryStatus
  });

  return {
    success: true,
    log: logEntry,
    apiResult
  };
}

function getTelegramLogs() {
  return db.get('telegramLogs');
}

module.exports = {
  sendTelegramAlert,
  getTelegramLogs
};
