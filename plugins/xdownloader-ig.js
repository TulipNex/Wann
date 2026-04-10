const axios = require('axios');

let handler = async (m, { conn, text, usedPrefix, command }) => {
  // Pengecekan input
  if (!text) return m.reply(`Masukkan URL Instagram!\n\n*Contoh:* ${usedPrefix + command} https://www.instagram.com/p/C_abc123/`);
  if (!text.match(/(https:\/\/(www\.)?instagram\.com\/(p|reel|tv|stories)\/.*)/i)) return m.reply('❌ URL Instagram tidak valid!');

  // Menampilkan pesan loading standar
  m.reply(global.wait);

  try {
    // Menggunakan API baru (api-faa.my.id)
    let apiUrl = `https://api-faa.my.id/faa/igdl?url=${encodeURIComponent(text)}`;
    let { data } = await axios.get(apiUrl);

    if (!data.status) throw 'Gagal mengambil data dari API.';
    
    let result = data.result;
    if (!result || !result.url || result.url.length === 0) throw 'Media tidak ditemukan atau akun di-private.';

    let mediaUrls = result.url;
    let meta = result.metadata || {};

    // Membuat caption dari metadata
    let cap = `*I N S T A G R A M*\n\n`;
    if (meta.username) cap += `  ◦ *Username:* ${meta.username}\n`;
    if (meta.like) cap += `  ◦ *Likes:* ${meta.like}\n`;
    if (meta.comment) cap += `  ◦ *Comments:* ${meta.comment}\n`;
    if (meta.caption) cap += `  ◦ *Caption:* ${meta.caption}\n\n`;

    // Looping jika media lebih dari satu (Carousel)
    for (let i = 0; i < mediaUrls.length; i++) {
      let url = mediaUrls[i];
      
      // Kirim caption hanya di media pertama agar chat tidak spam
      let sendCaption = i === 0 ? cap : '';
      
      // Mengirim file media kembali ke user
      await conn.sendFile(m.chat, url, 'igmedia', sendCaption, m);
    }
    
  } catch (e) {
    console.error('[Error IG Downloader]:', e);
    m.reply(global.eror);
  }
}

handler.help = ['anggur <link>'];
handler.tags = ['xdownloader'];
handler.command = /^(anggur)$/i;
// handler.limit = true; // Uncomment jika ingin menggunakan sistem limit

module.exports = handler;