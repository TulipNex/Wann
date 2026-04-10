const spotify = require('../lib/spotify'); // Sesuaikan dengan letak file spotify.js Anda

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // 1. Validasi Input
    if (!text) throw `*Contoh:* ${usedPrefix}${command} https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT`;
    if (!text.match(/spotify\.com/gi)) throw `[!] Link tidak valid. Harap masukkan link Spotify!`;

    await m.reply(global.wait); // Memanggil global.wait dari sistem bot Anda

    try {
        // 2. Memanggil module spotify.js
        const res = await spotify.download(text);

        if (!res.status) throw `Gagal mengambil data dari Spotify: ${res.msg}`;

        // 3. Ekstraksi Data dari hasil return spotify.js
        let { title, artist, album, cover, releaseDate } = res.metadata;
        let audioUrl = res.download.mp3; // Prioritaskan MP3 agar ringan di WA

        // 4. Buat Caption Metadata
        let caption = `🎧 *S P O T I F Y - D L*\n\n`;
        caption += `🎵 *Judul:* ${title}\n`;
        caption += `🎤 *Artis:* ${artist}\n`;
        caption += `💿 *Album:* ${album}\n`;
        caption += `📅 *Rilis:* ${releaseDate}\n\n`;
        caption += `_Tunggu sebentar, file audio sedang dikirim..._`;

        // 5. Kirim Cover Thumbnail + Caption
        await conn.sendFile(m.chat, cover, 'cover.jpg', caption, m);

        // 6. Kirim File Audio (MP3)
        await conn.sendMessage(m.chat, { 
            audio: { url: audioUrl }, 
            mimetype: 'audio/mpeg', 
            ptt: false // Set true jika ingin berbentuk Voice Note
        }, { quoted: m });

    } catch (e) {
        console.error(e);
        m.reply(global.eror); // Memanggil global.eror jika terjadi kegagalan
    }
}

handler.help = ['sirsak2'].map(v => v + ' <url>');
handler.tags = ['xdownloader'];
handler.command = /^(sirsak2)$/i;
handler.limit = true; // Sesuai aturan fitur downloader

module.exports = handler;