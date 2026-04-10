/**
 * Plugin: Spotify Search
 * Description: Mencari lagu di Spotify menggunakan Nexray API.
 * Author: Senior Bot Developer
 */

let fetch = require('node-fetch');

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // Validasi input
    if (!text) {
        throw `*Contoh Pencarian:* ${usedPrefix}${command} about you\n*Contoh Download:* ${usedPrefix}${command} https://open.spotify.com/track/3hEfpBHxgieRLz4t3kLNEg`;
    }

    // Mengirim pesan loading
    await m.reply(global.wait || '⏳ _Sedang memproses..._');

    try {
        // Cek apakah input berupa link Spotify
        if (text.match(/spotify\.com/i)) {
            // === MODE DOWNLOADER ===
            const api = await fetch(`https://api.nexray.web.id/downloader/spotify?url=${encodeURIComponent(text)}`);
            const res = await api.json();

            if (!res.status || !res.result) {
                return m.reply(`❌ Gagal mengambil data lagu. Pastikan link Spotify valid.`);
            }

            let { title, artist, url } = res.result;
            let caption = `🎵 *S P O T I F Y  D O W N L O A D E R*\n\n`;
            caption += `🎧 *Judul:* ${title}\n`;
            caption += `🎤 *Artis:* ${artist}\n\n`;
            caption += `_Audio sedang dikirim, mohon tunggu..._`;

            await m.reply(caption);

            // Mengirimkan file audio
            await conn.sendMessage(m.chat, { 
                audio: { url: url }, 
                mimetype: 'audio/mpeg',
                fileName: `${title}.mp3`
            }, { quoted: m });

        } else {
            // === MODE SEARCH ===
            // Melakukan request ke API yang disarankan
            const api = await fetch(`https://api.nexray.web.id/search/spotify?q=${encodeURIComponent(text)}`);
            const res = await api.json();

            // Validasi response (mengambil properti result/data atau array langsung)
            const tracks = res.result || res.data || (Array.isArray(res) ? res : []);
            
            if (!tracks || tracks.length === 0) {
                return m.reply(`❌ Lagu *${text}* tidak ditemukan di Spotify.`);
            }

            let txt = `🎧 *S P O T I F Y  S E A R C H*\n\n`;
            let limit = Math.min(10, tracks.length); // Membatasi output maksimal 10 lagu agar tidak spam
            
            for (let i = 0; i < limit; i++) {
                let track = tracks[i];
                
                // Antisipasi perbedaan key output dari JSON
                let title = track.title || track.name || '-';
                let artist = track.artist || track.artists || track.author || 'Unknown';
                let duration = track.duration || track.timestamp || '-';
                let url = track.url || track.link || '-';

                txt += `*${i + 1}. ${title}*\n`;
                txt += `🎤 *Artis:* ${artist}\n`;
                if (duration !== '-') txt += `⏱️ *Durasi:* ${duration}\n`;
                txt += `🔗 *Link:* ${url}\n\n`;
            }

            txt += `> _Gunakan perintah *${usedPrefix}${command} <link>* untuk mengunduh lagu di atas._`;

            // Mengambil thumbnail dari hasil pertama (jika ada) untuk mempercantik output
            let thumb = tracks[0].image || tracks[0].thumbnail || tracks[0].cover || null;

            if (thumb) {
                await conn.sendFile(m.chat, thumb, 'spotify.jpg', txt.trim(), m);
            } else {
                await m.reply(txt.trim());
            }
        }

    } catch (e) {
        console.error('Error Spotify Search:', e);
        throw global.eror || '❌ Terjadi kesalahan saat memproses permintaan pencarian.';
    }
}

// Metadata Plugin
handler.help = ['sirsak'].map(v => v + ' <judul lagu>');
handler.tags = ['xdownloader'];
handler.command = /^(sirsak)$/i;

// Keamanan/Batasan Penggunaan
handler.limit = true; // Mengurangi saldo limit user

module.exports = handler;