/**
 * TULIPNEX AI BROKER (GEMINI 1.5 FLASH)
 * Fitur: NPC Broker Cerdas yang membaca database trading lokal
 * Keunggulan: Hemat Limit (Tanpa Search Grounding), Token kecil, Roleplay tinggi
 * Fix: Menggunakan model standar dan sistem auto-fallback
 */

const fetch = require('node-fetch');

// Cooldown per user: 60 detik (agar tidak spam RPM)
const cooldowns = new Map();

let handler = async (m, { conn, usedPrefix, command }) => {
    let user = global.db.data.users[m.sender];
    let market = global.db.data.settings?.trading;

    if (!market || !market.prices) {
        throw `📉 Pasar TulipNex belum aktif. Tunggu sistem melakukan sinkronisasi harga.`;
    }

    const userId = m.sender;
    const now = Date.now();
    const COOLDOWN_TIME = 60000; // 60 Detik

    // Cek Cooldown
    if (cooldowns.has(userId)) {
        const expirationTime = cooldowns.get(userId) + COOLDOWN_TIME;
        if (now < expirationTime) {
            return m.reply(`⏳ Bosku, saya sedang sibuk analisis grafik. Kembali lagi dalam *${Math.ceil((expirationTime - now) / 1000)} detik*.`);
        }
    }

    m.reply(global.wait || "_Menelepon Broker Wall Street..._");

    // Ambil API Key
    const apiKey = ""; 
    const finalKey = apiKey || global.gemini;
    if (!finalKey) throw "API Key Gemini tidak ditemukan di config.js";

    // Kumpulkan data harga pasar TulipNex saat ini dari database lokal
    let pricesText = Object.entries(market.prices)
        .map(([ticker, price]) => `${ticker}: Rp ${price.toLocaleString('id-ID')}`)
        .join(', ');
    
    let eventTitle = market.activeEvent?.title || "Pasar Stabil";
    let userName = user.name || "Trader";
    let userMoney = user.money || 0;

    // Prompt yang ringan, hemat token, namun sangat roleplay
    const prompt = `
Nama Klien: ${userName} (Saldo: Rp ${userMoney.toLocaleString('id-ID')}).
Kondisi Pasar TulipNex Saat Ini:
- Event Aktif: ${eventTitle}
- Harga Aset: ${pricesText}

Instruksi:
Berikan saran trading singkat (maksimal 2 paragraf) untuk klien ini. Gunakan bahasa gaul trader kripto/saham (seperti: serok bawah, HODL, to the moon, fomo, sangkut, paus/whale). Jadilah karakter broker yang sinis, agak sombong, tapi analisanya tajam. Sapa namanya di awal.`;

    const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        // TIDAK MENGGUNAKAN Google Search agar tidak memotong limit pencarian harian
        systemInstruction: {
            parts: [{ text: "Anda adalah 'Jordan', broker saham elit dan penasihat keuangan di ekosistem TulipNex." }]
        }
    };

    // Daftar model stabil untuk Broker (Fallback System)
    const models = ["gemini-1.5-flash", "gemini-2.5-flash"];

    const fetchWithFallback = async (modelIndex = 0) => {
        const currentModel = models[modelIndex];
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=${finalKey}`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            const result = await response.json();
            
            if (response.ok) return result;
            
            // Jika model tidak ditemukan (404), coba model berikutnya di daftar
            if (response.status === 404 && modelIndex < models.length - 1) {
                return await fetchWithFallback(modelIndex + 1);
            }
            
            if (response.status === 429) {
                throw new Error("Jalur telepon ke bursa sedang sibuk (Limit API). Coba lagi nanti.");
            }
            throw new Error(result.error?.message || `Gagal menghubungi Broker menggunakan ${currentModel}.`);
        } catch (e) {
            // Coba fallback jika error sistem selain dari rate limit
            if (modelIndex < models.length - 1 && !e.message.includes("Jalur telepon") && !e.message.includes("Gagal menghubungi Broker")) {
                return await fetchWithFallback(modelIndex + 1);
            }
            throw e;
        }
    };

    try {
        const result = await fetchWithFallback();

        const aiResponse = result.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!aiResponse) throw new Error("Broker sedang tidur, tidak ada respons.");

        // Set Cooldown setelah sukses
        cooldowns.set(userId, now);

        let finalCaption = `💼 *PANGGILAN DARI BROKER JORDAN*\n`;
        finalCaption += `──────────────────\n\n`;
        finalCaption += aiResponse.trim();
        finalCaption += `\n\n──────────────────\n`;
        finalCaption += `_Ketik ${usedPrefix}ind untuk melihat detail pasar_`;

        await conn.reply(m.chat, finalCaption, m);

    } catch (e) {
        console.error("Broker AI Error:", e);
        m.reply(`${global.eror || "_*Server Error*_"}\n\n*Pesan:* ${e.message}`);
    }
};

handler.help = ['broker', 'sarantrading'];
handler.tags = ['tulipnex'];
handler.command = /^(broker|sarantrading|askbroker)$/i;
handler.rpg = true;
handler.limit = true;

module.exports = handler;