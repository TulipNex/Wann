/**
 * GOOGLE SEARCH GROUNDED AI (GEMINI 2.5 FLASH) - OPTIMIZED
 * Fitur: AI dengan akses internet real-time via Google Search
 * Optimasi: Caching, Per-user Cooldown, & Fallback System
 */

const fetch = require('node-fetch');
const NodeCache = require('node-cache');

// Inisialisasi Cache: Simpan jawaban selama 10 menit (600 detik)
const answerCache = new NodeCache({ stdTTL: 600, checkperiod: 120 });
const cooldowns = new Map();

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) throw `*Contoh:* ${usedPrefix + command} Apa berita terbaru hari ini?`;

    const userId = m.sender;
    const now = Date.now();
    const COOLDOWN_TIME = 15000; // 15 detik cooldown per user untuk menjaga RPM

    // 1. Cek Cooldown (Mencegah Spam RPM)
    if (cooldowns.has(userId)) {
        const expirationTime = cooldowns.get(userId) + COOLDOWN_TIME;
        if (now < expirationTime) {
            const timeLeft = Math.ceil((expirationTime - now) / 1000);
            return m.reply(`⏳ Mohon tunggu *${timeLeft} detik* lagi sebelum bertanya kembali.`);
        }
    }

    // 2. Cek Cache (Menghemat Daily Limit/RPD)
    const cacheKey = text.toLowerCase().trim();
    const cachedResponse = answerCache.get(cacheKey);
    if (cachedResponse) {
        return await conn.reply(m.chat, cachedResponse + `\n\n_⚡ Diambil dari cache (Menghemat limit)_`, m);
    }

    // Indikator loading
    m.reply(global.wait || "_*Tunggu sedang di proses...*_");

    const apiKey = ""; 
    const finalKey = apiKey || global.gemini;

    if (!finalKey) {
        throw `*ERROR: API KEY TIDAK DITEMUKAN*`;
    }

    const models = ["gemini-2.5-flash", "gemini-1.5-flash-latest"];
    
    const fetchWithRetry = async (prompt, modelIndex = 0) => {
        const currentModel = models[modelIndex];
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=${finalKey}`;

        // Optimasi Grounding: Hanya aktifkan google_search jika terdeteksi kata kunci tertentu
        const needsSearch = /kapan|berita|siapa|hari ini|update|skor|harga|terbaru|news/i.test(prompt);

        const payload = {
            contents: [{ parts: [{ text: prompt }] }],
            systemInstruction: {
                parts: [{ text: "Anda adalah asisten cerdas. Berikan jawaban akurat dan ringkas dalam Bahasa Indonesia." }]
            },
            tools: needsSearch ? [{ "google_search": {} }] : []
        };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            const result = await response.json();
            if (response.ok) return result;

            if (response.status === 404 && modelIndex < models.length - 1) {
                return fetchWithRetry(prompt, modelIndex + 1);
            }

            throw new Error(result.error?.message || `Error pada model ${currentModel}`);
        } catch (e) {
            if (modelIndex < models.length - 1) return fetchWithRetry(prompt, modelIndex + 1);
            throw e;
        }
    };

    try {
        const result = await fetchWithRetry(text);
        const aiResponse = result.candidates?.[0]?.content?.parts?.[0]?.text;
        const groundingAttributions = result.candidates?.[0]?.groundingMetadata?.groundingAttributions;
        
        if (!aiResponse) throw "Gagal mendapatkan respons.";

        let finalCaption = aiResponse;

        // Tambahkan referensi jika ada
        if (groundingAttributions && groundingAttributions.length > 0) {
            finalCaption += `\n\n*🌐 Sumber:*`;
            const uniqueSources = [];
            const seenUris = new Set();
            for (const attr of groundingAttributions) {
                if (attr.web?.uri && !seenUris.has(attr.web.uri)) {
                    seenUris.add(attr.web.uri);
                    uniqueSources.push(attr.web);
                }
                if (uniqueSources.length >= 2) break; // Batasi 2 sumber saja untuk hemat token chat
            }
            uniqueSources.forEach((s, i) => {
                finalCaption += `\n${i + 1}. ${s.title} (${s.uri})`;
            });
        }

        // Simpan jawaban ke cache & update cooldown
        answerCache.set(cacheKey, finalCaption);
        cooldowns.set(userId, now);

        await conn.reply(m.chat, finalCaption.trim(), m);

    } catch (e) {
        console.error("Gemini Error:", e);
        m.reply(`${global.eror || "_*Server Error*_"}\n\n*Pesan:* ${e.message}`);
    }
};

handler.help = ['tanya'];
handler.tags = ['tools'];
handler.command = /^(tanya)$/i;
handler.limit = true; // Tetap gunakan limit database bot

module.exports = handler;