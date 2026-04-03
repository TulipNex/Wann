const axios = require('axios');

let handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    // Validasi input dari user
    if (!text) return m.reply(`Masukkan judul buku yang ingin dicari!\n\n*Contoh:* ${usedPrefix + command} harry potter`);
    
    // Tampilkan pesan loading standar bot kamu
    m.reply(global.wait);

    // Hit API Open Library (dibatasi 3 hasil teratas agar pesan tidak terlalu panjang)
    const apiUrl = `https://openlibrary.org/search.json?q=${encodeURIComponent(text)}&limit=3`;
    const response = await axios.get(apiUrl);
    const data = response.data;

    // Cek apakah buku ditemukan
    if (data.numFound === 0) {
        return m.reply('Maaf, buku tidak ditemukan di Open Library.');
    }

    // Format output teks
    let hasil = `📚 *OPEN LIBRARY SEARCH*\n\nHasil pencarian untuk: _${text}_\n\n`;
    
    data.docs.forEach((book, index) => {
        let title = book.title || 'Tidak diketahui';
        let author = book.author_name ? book.author_name.join(', ') : 'Tidak diketahui';
        let year = book.first_publish_year || '-';
        let link = book.key ? `https://openlibrary.org${book.key}` : '-';

        hasil += `*${index + 1}. ${title}*\n`;
        hasil += `✍️ Penulis: ${author}\n`;
        hasil += `📅 Tahun Terbit: ${year}\n`;
        hasil += `🔗 Link Baca/Info: ${link}\n\n`;
    });

    hasil += `_Wann Assistant | Powered by TulipNex_`;

    // Kirim balasan ke user
    await conn.sendMessage(m.chat, { text: hasil.trim() }, { quoted: m });

  } catch (e) {
    console.error(e);
    m.reply(global.eror);
  }
}

handler.help = ['openlibrary <judul>'];
handler.tags = ['scraper'];
handler.command = /^(openlibrary|caribuku|olah)$/i;

module.exports = handler;