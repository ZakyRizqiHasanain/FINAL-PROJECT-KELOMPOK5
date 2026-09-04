const https = require('https');
const config = require('../config/env');

const STOPWORDS = new Set([
  'yang', 'di', 'ke', 'dari', 'pada', 'dan', 'atau', 'ini', 'itu', 'untuk',
  'dengan', 'ada', 'adalah', 'saya', 'milik', 'warna', 'merk', 'daerah',
  'sekitar', 'kira', 'sudah', 'tertinggal', 'jatuh', 'hilang', 'menemukan',
  'tadi', 'waktu', 'pas', 'siang', 'pagi', 'sore', 'malam'
]);

function tokenize(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(token => token.length > 1 && !STOPWORDS.has(token));
}

function calculateCosineSimilarity(tokensA, tokensB) {
  if (tokensA.length === 0 || tokensB.length === 0) return 0;

  const setA = new Set(tokensA);
  const setB = new Set(tokensB);

  let overlap = 0;
  for (const token of setA) {
    if (setB.has(token)) {
      overlap += 1;
    } else {
      for (const tokenB of setB) {
        if (token.includes(tokenB) || tokenB.includes(token)) {
          overlap += 0.6;
          break;
        }
      }
    }
  }

  return Math.min(1, overlap / Math.sqrt(tokensA.length * tokensB.length));
}

/**
 * Membandingkan 1 Laporan Kehilangan terhadap 1 Barang Temuan
 */
function matchLostAndFoundItem(lostReport, foundItem) {
  let score = 0;
  const reasons = [];

  // 1. Kategori (25%)
  if (
    lostReport.category &&
    foundItem.category &&
    lostReport.category.toLowerCase() === foundItem.category.toLowerCase()
  ) {
    score += 25;
    reasons.push(`Kategori sama (${lostReport.category})`);
  }

  // 2. Judul / Nama Merek (30%)
  const tokensTitleLost = tokenize(lostReport.title);
  const tokensTitleFound = tokenize(foundItem.title);
  const titleSim = calculateCosineSimilarity(tokensTitleLost, tokensTitleFound);
  score += titleSim * 30;
  if (titleSim > 0.35) {
    reasons.push('Nama atau merek barang cocok');
  }

  // 3. Warna (15%)
  const tokensColorLost = tokenize(lostReport.color);
  const tokensColorFound = tokenize(foundItem.color);
  const colorSim = calculateCosineSimilarity(tokensColorLost, tokensColorFound);
  if (colorSim > 0.3) {
    score += 15;
    reasons.push(`Warna teridentifikasi cocok (${lostReport.color})`);
  } else if (
    lostReport.color &&
    foundItem.features &&
    foundItem.features.toLowerCase().includes(lostReport.color.toLowerCase())
  ) {
    score += 10;
    reasons.push('Warna teridentifikasi pada ciri fisik');
  }

  // 4. Lokasi Terakhir vs Lokasi Ditemukan (15%)
  const tokensLocLost = tokenize(lostReport.lastSeenLocation);
  const tokensLocFound = tokenize(foundItem.locationFound);
  const locSim = calculateCosineSimilarity(tokensLocLost, tokensLocFound);
  if (locSim > 0.25) {
    score += 15;
    reasons.push('Lokasi penemuan sangat relevan');
  }

  // 5. Ciri-ciri Khusus & Deskripsi (15%)
  const descLost = tokenize(`${lostReport.features || ''} ${lostReport.description || ''}`);
  const descFound = tokenize(`${foundItem.features || ''} ${foundItem.description || ''}`);
  const descSim = calculateCosineSimilarity(descLost, descFound);
  score += descSim * 15;
  if (descSim > 0.25) {
    reasons.push('Ciri-ciri unik dan detail fisik cocok');
  }

  const finalScore = Math.min(99, Math.max(15, Math.round(score)));
  const explanation = reasons.length > 0 ? reasons.join(', ') + '.' : 'Kemiripan umum pada kata kunci laporan.';

  return {
    score: finalScore,
    reasons,
    explanation,
    isHighConfidence: finalScore >= 75,
    isMediumConfidence: finalScore >= 50 && finalScore < 75
  };
}

/**
 * Mencari seluruh rekomendasi kecocokan barang temuan untuk sebuah laporan kehilangan
 */
function findMatchingFoundItems(lostReport, foundItemsList) {
  return foundItemsList
    .map(foundItem => {
      const matchResult = matchLostAndFoundItem(lostReport, foundItem);
      return {
        foundItem,
        ...matchResult
      };
    })
    .sort((a, b) => b.score - a.score);
}

/**
 * Panggilan Langsung ke Google Gemini AI (LLM)
 */
async function callGeminiApi(prompt) {
  if (!config.geminiApiKey) return null;

  return new Promise((resolve) => {
    const payload = JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ]
    });

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      port: 443,
      path: `/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${config.geminiApiKey}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      },
      timeout: 9000
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
          resolve(text || null);
        } catch (e) {
          resolve(null);
        }
      });
    });

    req.on('error', () => resolve(null));
    req.on('timeout', () => {
      req.destroy();
      resolve(null);
    });

    req.write(payload);
    req.end();
  });
}

/**
 * Ekstraksi bahasa natural dari teks percakapan Chatbot (Heuristik)
 */
function parseChatbotMessage(text, existingData = {}, inventory = []) {
  const lower = text.toLowerCase().trim();
  let extracted = { ...existingData };

  const isGreetingOnly = /^(halo|hai|hi|hey|pagi|siang|sore|malam|permisi|assalamualaikum|tes|test|p|bisa bantu|tolong|ada orang|siapa ini|menu|help|info)$/i.test(lower);

  // 1. Ekstraksi Kategori & Judul Barang yang Dinamis
  let detectedCategory = '';

  if (/laptop|notebook|macbook|asus|acer|lenovo|hp|dell|charger|ipad|tablet|headphone|earphone|tws/i.test(lower)) {
    detectedCategory = 'Elektronik & Gadget';
  } else if (/tumbler|botol|corkcicle|tupperware|thermos|hydro|minum/i.test(lower)) {
    detectedCategory = 'Botol Minum & Tumbler';
  } else if (/dompet|tas|ransel|tote\s*bag|pouch|clutch|ktm|kartu/i.test(lower)) {
    detectedCategory = 'Tas & Dompet';
  } else if (/kunci|motor|mobil|flashdisk|usb|stnk|gantungan/i.test(lower)) {
    detectedCategory = 'Kunci & Akses';
  } else if (/kacamata|jaket|sweater|hoodie|helm|jam|topi|cincin|sepatu/i.test(lower)) {
    detectedCategory = 'Pakaian & Aksesoris';
  } else if (/buku|binder|catatan|modul|pulpen|pensil|kalkulator/i.test(lower)) {
    detectedCategory = 'Alat Tulis & Buku';
  }

  if (detectedCategory) {
    extracted.category = detectedCategory;
  }

  // Bersihkan teks untuk nama barang tanpa filler conversational
  if (!isGreetingOnly && (!extracted.title || extracted.title === '-')) {
    let cleanText = text
      .replace(/^(halo|hai|permisi|tolong|saya|aku|tadi|kemarin|kehilangan|ketinggalan|nemu|menemukan|mencari)\s+/gi, '')
      .replace(/\s+(di|ke|pada|sekitar|waktu|jam|tadi)\s+.*$/gi, '')
      .trim();

    if (cleanText.length > 3 && !/^(halo|pagi|siang|sore|malam)$/i.test(cleanText)) {
      extracted.title = cleanText.charAt(0).toUpperCase() + cleanText.slice(1);
    } else if (detectedCategory) {
      extracted.title = detectedCategory;
    }
  }

  // 2. Ekstraksi Warna
  if (!isGreetingOnly) {
    if (/hitam|black/i.test(lower)) extracted.color = 'Hitam';
    else if (/putih|white/i.test(lower)) extracted.color = 'Putih';
    else if (/biru\s*dongker|navy|biru\s*tua/i.test(lower)) extracted.color = 'Biru Dongker / Navy';
    else if (/biru|blue/i.test(lower)) extracted.color = 'Biru';
    else if (/coklat|brown/i.test(lower)) extracted.color = 'Coklat';
    else if (/merah|red/i.test(lower)) extracted.color = 'Merah';
    else if (/hijau|green/i.test(lower)) extracted.color = 'Hijau';
    else if (/kuning|yellow/i.test(lower)) extracted.color = 'Kuning';
    else if (/abu|silver|perak|grey|gray/i.test(lower)) extracted.color = 'Perak / Abu-abu';
    else if (/emas|gold/i.test(lower)) extracted.color = 'Emas / Gold';
    else if (/pink|merah\s*muda/i.test(lower)) extracted.color = 'Merah Muda / Pink';
    else if (/ungu|purple/i.test(lower)) extracted.color = 'Ungu';

    // 3. Ekstraksi Lokasi Kampus UMY
    if (/perpus|perpustakaan|ar\s*fachruddin\s*a/i.test(lower)) {
      extracted.lastSeenLocation = 'Gedung AR. Fachruddin A (Perpustakaan & R. Sidang)';
    } else if (/ar\s*fachruddin\s*b/i.test(lower)) {
      extracted.lastSeenLocation = 'Gedung AR. Fachruddin B (Lobby & R. Kuliah)';
    } else if (/siti\s*walidah|f1|f2/i.test(lower)) {
      extracted.lastSeenLocation = 'Gedung Siti Walidah (F1/F2)';
    } else if (/ki\s*bagus|hadikusumo|e1|e2|e3|e4|e5|e6/i.test(lower)) {
      extracted.lastSeenLocation = 'Gedung Ki Bagus Hadikusumo (E1-E6)';
    } else if (/mas\s*mansyur|kedokteran|fkg|fikes/i.test(lower)) {
      extracted.lastSeenLocation = 'Gedung Mas Mansyur (Kedokteran & Ilmu Kesehatan)';
    } else if (/ibrahim|fti|feb|lab\s*komputer|lab/i.test(lower)) {
      extracted.lastSeenLocation = 'Gedung Ibrahim (FTI / FEB / Lab Komputer)';
    } else if (/masjid|dahlan|tempat\s*wudhu|wudhu|sholat/i.test(lower)) {
      extracted.lastSeenLocation = 'Masjid KH Ahmad Dahlan (Lantai 1 / Tempat Wudhu)';
    } else if (/bintang|lapangan/i.test(lower)) {
      extracted.lastSeenLocation = 'Lapangan Bintang UMY';
    } else if (/student\s*center|sc\s*umy|\bsc\b/i.test(lower)) {
      extracted.lastSeenLocation = 'Student Center (SC) UMY';
    } else if (/cafe\s*1912|1912|kantin|food\s*court|makan/i.test(lower)) {
      extracted.lastSeenLocation = 'Cafe 1912 / Kantin Barat UMY';
    } else if (/sportorium|olahraga|gym/i.test(lower)) {
      extracted.lastSeenLocation = 'Sportorium UMY';
    } else if (/parkir/i.test(lower)) {
      extracted.lastSeenLocation = 'Parkiran Gedung AR. Fachruddin';
    } else if (/pos\s*satpam|pos\s*keamanan|gerbang/i.test(lower)) {
      extracted.lastSeenLocation = 'Pos Keamanan Gerbang Utama UMY';
    }

    // 4. Ekstraksi Ciri Fisik
    if (text.length > 8 && !/^(halo|hai|pagi|siang|sore|malam)$/i.test(text.trim())) {
      if (!extracted.features || extracted.features === '-') {
        extracted.features = text;
      } else if (!extracted.features.includes(text)) {
        extracted.features = `${extracted.features}, ${text}`;
      }
    }
  }

  const hasItemDetails = Boolean(!isGreetingOnly && (detectedCategory || extracted.title || extracted.color || extracted.lastSeenLocation));
  const isReady = Boolean(hasItemDetails && extracted.title && (extracted.color || extracted.lastSeenLocation));

  // 5. Pencocokan ke Inventaris Posko Real-Time
  let topMatch = null;
  if (hasItemDetails && inventory.length > 0 && extracted.title) {
    const matches = findMatchingFoundItems(extracted, inventory);
    if (matches.length > 0 && matches[0].score >= 35) {
      topMatch = matches[0];
    }
  }

  return {
    extracted,
    hasItemDetails,
    isReady,
    topMatch
  };
}

/**
 * Chatbot Generatif dengan Google Gemini AI (LLM) & Context Awareness
 */
async function parseChatbotWithGemini(userMessage, existingData = {}, inventory = []) {
  const heuristicResult = parseChatbotMessage(userMessage, existingData, inventory);

  if (!config.geminiApiKey) {
    return {
      ...heuristicResult,
      engine: 'Semantic NLP Engine (Offline Fallback)'
    };
  }

  try {
    const inventorySummary = inventory
      .slice(0, 10)
      .map(i => `- [${i.id}] ${i.title} (Kategori: ${i.category}, Warna: ${i.color}, Titik Simpan: ${i.storageLocation})`)
      .join('\n');

    const prompt = `Anda adalah asisten AI resmi untuk sistem Lost & Found Kampus Universitas Muhammadiyah Yogyakarta (UMY).
Pengguna (mahasiswa/civitas kampus UMY) mengirimkan pesan berikut:
"${userMessage}"

Data barang yang sudah terkumpul sebelumnya:
- Nama Barang: ${existingData.title || '-'}
- Kategori: ${existingData.category || '-'}
- Warna: ${existingData.color || '-'}
- Lokasi Terakhir: ${existingData.lastSeenLocation || '-'}
- Ciri Khusus: ${existingData.features || '-'}

Data Barang Temuan di Posko Keamanan UMY saat ini:
${inventorySummary || 'Belum ada data barang temuan di posko.'}

ATURAN WAJIB:
1. "hasItemDetails": Set ke FALSE jika pengguna HANYA MENYAPA (misal: "halo", "hai", "selamat pagi", "permisi", "apa kabar", "bisa bantu saya?"), bertanya umum tentang cara kerja bot, atau sekadar basa-basi tanpa menceritakan barang spesifik yang hilang.
   Set ke TRUE HANYA JIKA pengguna secara nyata menyebutkan atau menceritakan barang yang hilang/tertinggal (misal: menyebut "dompet", "laptop", "kunci", "botol minum", "helm", dll).
2. Jika "hasItemDetails" bernilai FALSE:
   - Kosongkan field "title", "category", "color", "lastSeenLocation", "features" (atau biarkan null / string kosong "").
   - "replyText": Jawab dengan ramah, sapa mahasiswa, dan tanyakan secara bersahabat barang apa yang ingin dicari atau dilaporkan.
3. Jika "hasItemDetails" bernilai TRUE:
   - Ekstrak "title", "category", "color", "lastSeenLocation", "features".
   - "replyText": Berikan respon empati, sebutkan rangkuman barangnya, dan jika ada barang temuan di posko yang cocok, beritahukan lokasinya di posko satpam.

PENTING: Berikan output HANYA berupa JSON murni tanpa markdown triple-backtick:
{
  "hasItemDetails": true/false,
  "title": "...",
  "category": "...",
  "color": "...",
  "lastSeenLocation": "...",
  "features": "...",
  "replyText": "..."
}`;

    const geminiRaw = await callGeminiApi(prompt);
    if (geminiRaw) {
      const cleanJson = geminiRaw.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      const hasItemDetails = Boolean(parsed.hasItemDetails);
      let extracted = { ...existingData };

      if (hasItemDetails) {
        extracted = {
          title: parsed.title || heuristicResult.extracted.title || 'Barang Hilang',
          category: parsed.category || heuristicResult.extracted.category || 'Elektronik & Gadget',
          color: parsed.color || heuristicResult.extracted.color || '',
          lastSeenLocation: parsed.lastSeenLocation || heuristicResult.extracted.lastSeenLocation || '',
          features: parsed.features || heuristicResult.extracted.features || userMessage
        };
      }

      let topMatch = null;
      if (hasItemDetails && inventory.length > 0 && extracted.title) {
        const matches = findMatchingFoundItems(extracted, inventory);
        if (matches.length > 0 && matches[0].score >= 35) {
          topMatch = matches[0];
        }
      }

      const isReady = Boolean(hasItemDetails && extracted.title && (extracted.color || extracted.lastSeenLocation));

      return {
        extracted,
        hasItemDetails,
        isReady,
        topMatch,
        aiGeneratedReply: parsed.replyText,
        engine: 'Google Gemini AI (Active)'
      };
    }
  } catch (err) {
    console.warn('⚠️ Gemini AI Parse error, fallback ke semantik:', err.message);
  }

  return {
    ...heuristicResult,
    engine: 'Semantic NLP Engine (Fallback)'
  };
}

module.exports = {
  matchLostAndFoundItem,
  findMatchingFoundItems,
  parseChatbotMessage,
  parseChatbotWithGemini,
  callGeminiApi
};
