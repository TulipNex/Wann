const cloudscraper = require('cloudscraper');
const cheerio = require('cheerio');

let handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    // Validasi input
    if (!text) return m.reply(`Masukkan judul buku yang ingin dicari!\n\n*Contoh:* ${usedPrefix + command} bumi manusia`);
    
    // Kirim pesan loading standar bot
    m.reply(global.wait);

    // Endpoint pencarian Z-Library (mirror z-lib.gd)
    const query = encodeURIComponent(text);
    const url = `https://z-lib.gd/s/${query}`;

    // Menggunakan cloudscraper.get() untuk mem-bypass Cloudflare (mencegah Error 503)
    const html = await cloudscraper.get(url);
    const $ = cheerio.load(html);

    let results = [];

    // Proses parsing elemen HTML
    // Mencari elemen bungkus setiap buku (biasanya class .resItemBox atau modifikasinya di dalam table)
    $('table.resItemTable tr, .resItemBox').each((i, element) => {
        // Batasi 5 hasil teratas agar pesan tidak terlalu panjang
        if (i >= 5) return false; 

        // Ekstraksi data spesifik
        const title = $(element).find('h3[itemprop="name"] a').text().trim() || $(element).find('h3 a').text().trim();
        const author = $(element).find('.authors a').text().trim() || 'Tidak diketahui';
        const link = $(element).find('h3[itemprop="name"] a').attr('href') || $(element).find('h3 a').attr('href');
        const publisher = $(element).find('.publisher').text().trim() || '-';
        
        // Mengambil info tambahan seperti format, ukuran, bahasa
        const property = $(element).find('.property_value').text().replace(/\s+/g, ' ').trim() || '-';

        if (title && link) {
            results.push({
                title,
                author,
                publisher,
                property,
                url: link.startsWith('http') ? link : `https://z-lib.gd${link}`
            });
        }
    });

    // Cek jika array kosong (buku tidak ada atau struktur HTML berubah)
    if (results.length === 0) {
        return m.reply('Buku tidak ditemukan. Coba gunakan kata kunci lain, atau website sedang melakukan perubahan struktur.');
    }

    // Format output teks
    let hasil = `📚 *Z-LIBRARY SEARCH*\n\nHasil pencarian untuk: _${text}_\n\n`;

    results.forEach((book, index) => {
        hasil += `*${index + 1}. ${book.title}*\n`;
        hasil += `✍️ Penulis: ${book.author}\n`;
        hasil += `🏢 Penerbit: ${book.publisher}\n`;
        hasil += `ℹ️ Info (Format/Size): ${book.property}\n`;
        hasil += `🔗 Link Detail: ${book.url}\n\n`;
    });

    // Tambahkan footer khas bot kamu
    hasil += `_Wann Assistant | Powered by TulipNex_`;

    // Kirim balasan
    await conn.sendMessage(m.chat, { text: hasil.trim() }, { quoted: m });

  } catch (e) {
    console.error(e);
    // Jika masih gagal, lemparkan error standar
    m.reply(`Gagal mengambil data dari Z-Library. Proteksi Cloudflare mungkin sedang dalam mode ketat.\n\n` + global.eror);
  }
}

handler.help = ['zlib <judul>'];
handler.tags = ['scraper'];
handler.command = /^(zlib|zlibrary)$/i;

module.exports = handler;