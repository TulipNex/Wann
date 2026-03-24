/**
 * GOOGLE MAPS EXPLORER (GEMINI 2.5 FLASH)
 * Fitur: Mencari tempat menarik di sekitar lokasi yang dikirim user
 * Optimasi: Koordinat Caching, Google Search Grounding, & Live Location Support
 * Fix: Robust Location Parsing (Mencegah TypeError)
 */

const fetch = require('node-fetch');
const NodeCache = require('node-cache');

// Simpan hasil pencarian lokasi selama 30 menit untuk menghemat limit
const mapsCache = new NodeCache({ stdTTL: 1800 }); 

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let query = text;

    // Fungsi pembantu untuk mengekstrak lokasi dengan aman (Mencegah TypeError)
    const extractLocation = (obj) => {
        if (!obj) return null;
        // Cek jika objek sudah berisi koordinat langsung
        if (obj.degreesLatitude && obj.degreesLongitude) return obj;
        // Cek berbagai variasi struktur pesan Baileys
        if (obj.locationMessage) return obj.locationMessage;
        if (obj.liveLocationMessage) return obj.liveLocationMessage;
        if (obj.message && obj.message.locationMessage) return obj.message.locationMessage;
        if (obj.message && obj.message.liveLocationMessage) return obj.message.liveLocationMessage;
        if (obj.msg && obj.msg.locationMessage) return obj.msg.locationMessage;
        if (obj.msg && obj.msg.liveLocationMessage) return obj.msg.liveLocationMessage;
        return null;
    };

    // 1. Deteksi Input dengan Aman
    let location = extractLocation(m) || extractLocation(m.quoted);

    if (!location && !query) {
        throw `*Format Salah!*\n\nKirimkan lokasi Anda atau ketik nama daerah.\nContoh: *${usedPrefix + command} Malioboro*\nAtau kirim lokasi lalu balas (*reply*) dengan ketik *${usedPrefix + command}*`;
    }

    // 2. Tentukan koordinat atau alamat untuk pencarian
    let searchTarget = query;
    let cacheKey = query ? query.toLowerCase().trim() : "";

    if (location) {
        searchTarget = `koordinat ${location.degreesLatitude}, ${location.degreesLongitude}`;
        // Bulatkan koordinat untuk caching (sekitar 100m radius)
        cacheKey = `loc_${location.degreesLatitude.toFixed(3)}_${location.degreesLongitude.toFixed(3)}`;
    }

    // 3. Cek Cache (Menghemat RPM Free Tier)
    const cachedData = mapsCache.get(cacheKey);
    if (cachedData) {
        return await conn.reply(m.chat, cachedData + `\n\n_📍 Hasil area ini diambil dari cache (Hemat limit)_`, m);
    }

    m.reply(global.wait || "_Sedang memetakan area sekitar..._");

    const apiKey = ""; // API Key disediakan oleh lingkungan runtime
    const finalKey = apiKey || global.gemini;

    if (!finalKey) throw "API Key Gemini tidak ditemukan. Pastikan sudah terisi di config.js";

    const model = "gemini-2.5-flash-preview-09-2025";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${finalKey}`;

    // 4. Prompt untuk Eksplorasi Cerdas
    const prompt = `Saya berada di ${searchTarget}. Tolong cari dan rekomendasikan tempat di sekitarnya:
1. 3 Tempat makan/kafe yang sedang tren atau memiliki rating bagus (sertakan menu andalan).
2. 2 Fasilitas umum penting (ATM/Bank/SPBU).
3. 1 Fasilitas kesehatan (Rumah Sakit/Apotek 24 jam).
4. 1 Landmark atau tempat wisata menarik.

Berikan deskripsi singkat yang membantu dalam Bahasa Indonesia. Sertakan estimasi jarak jika datanya tersedia.`;

    const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        tools: [{ "google_search": {} }],
        systemInstruction: {
            parts: [{ text: "Anda adalah pemandu wisata lokal digital. Berikan informasi yang akurat berdasarkan Google Maps dan sampaikan dengan ramah dalam Bahasa Indonesia." }]
        }
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        const aiResponse = result.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!aiResponse) throw "Sistem gagal mendapatkan informasi lokasi saat ini.";

        let finalCaption = `🗺️ *EXPLORER: HASIL PENCARIAN AREA*\n`;
        finalCaption += `──────────────────\n\n`;
        finalCaption += aiResponse.trim();
        finalCaption += `\n\n──────────────────\n`;
        finalCaption += `_Gunakan data di atas sebagai referensi navigasi._`;

        // Simpan ke Cache selama 30 menit
        mapsCache.set(cacheKey, finalCaption);

        await conn.reply(m.chat, finalCaption, m);

    } catch (e) {
        console.error("Maps AI Error:", e);
        m.reply(`${global.eror || "_*Server Error*_"}\n\n*Pesan:* ${e.message}`);
    }
};

handler.help = ['maps', 'explore', 'sekitar'];
handler.tags = ['tools'];
handler.command = /^(maps|explore|sekitar)$/i;
handler.limit = true;

module.exports = handler;