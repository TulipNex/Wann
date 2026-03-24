const igdl = require('../lib/instagram');

let handler = async (m, { conn, args, usedPrefix, command }) => {
    // 1. Validasi Input
    if (!args[0]) {
        return m.reply(`Masukkan link Instagram yang ingin diunduh!\n\n*Contoh:* ${usedPrefix + command} https://www.instagram.com/reel/xxxx/`);
    }

    if (!args[0].match(/(https?:\/\/(?:www\.)?instagram\.com\/(?:p|reel|tv)\/([^/?#&]+)).*/i)) {
        return m.reply('Link tidak valid! Pastikan itu adalah link post, reel, atau IGTV Instagram.');
    }

    m.reply(global.wait);

    try {
        // 2. Eksekusi Scraper Lokal
        let res = await igdl(args[0]);
        
        if (!res || (!res.success && !res.data)) {
            throw 'Gagal mendapatkan data. Scraper sedang down atau terkena limit dari Instagram.';
        }
        
        let mediaArray = res.data || res.links || res.items || (Array.isArray(res) ? res : [res]);

        if (!Array.isArray(mediaArray) || mediaArray.length === 0) {
            throw 'Media tidak ditemukan atau akun di-private.';
        }

        // 3. Looping untuk multi-slide media
        for (let item of mediaArray) {
            // Mengambil URL dari object atau array
            let mediaUrl = typeof item === 'string' ? item : (item.url || item.link || item.download);
            
            if (!mediaUrl) continue; // Skip jika tidak ada URL

            let caption = `*====[ INSTAGRAM DOWNLOADER ]====*\n\n${global.wm}`;
            
            // 4. Mengirim file ke pengguna 
            // Baileys secara otomatis akan mendeteksi apakah url tersebut video/mp4 atau image/jpeg
            await conn.sendFile(m.chat, mediaUrl, '', caption, m);
        }

    } catch (e) {
        console.error("IGDL Error:", e);
        m.reply(typeof e === 'string' ? `*Error:* ${e}` : global.eror);
    }
}


// Metadata Plugin
handler.help = ['melon <link>'];
handler.tags = ['downloader'];
handler.command = /^(melon)$/i; // Support command .ig, .igdl, .instagram

// Pembatasan fitur
handler.limit = true; // Menggunakan API bypass membutuhkan waktu & resource

module.exports = handler;