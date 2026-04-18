const axios = require('axios');

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let listBank = ["gopay", "ovo", "dana", "linkaja", "shopeepay"];
    
    // Validasi input awal
    if (!text) {
        let txt = `*Cek Rekening / E-Wallet*\n\n`;
        txt += `Contoh penggunaan:\n*${usedPrefix + command} dana 08123456789*\n\n`;
        txt += `*Daftar Bank / E-Wallet yang didukung:*\n`;
        txt += `- ${listBank.join("\n- ")}`;
        return m.reply(txt);
    }
    
    // Memisahkan input berdasarkan spasi (mengatasi spasi tunggal maupun ganda)
    let argsArray = text.trim().split(/\s+/);
    
    // Validasi kelengkapan parameter
    if (argsArray.length < 2) {
        return m.reply(`⚠️ Format salah! Gunakan spasi sebagai pemisah antara nama bank/e-wallet dan nomor rekening.\n\nContoh: *${usedPrefix + command} dana 08123456789*`);
    }

    let type = argsArray[0];
    let norek = argsArray[1];

    // Mengirim pesan loading menggunakan variabel global config
    m.reply(global.wait);

    try {
        // Melakukan request API (Reverse Engineered Scraping Call)
        const result = await axios.post("https://laey.dev/cek-rekening/api/check", {
            bank: type.toLowerCase(),
            accountNumber: norek
        }, {
            headers: {
                "Content-Type": "application/json",
                "x-api-key": "FREE",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept": "application/json, text/plain, */*"
            }
        });

        // Cek jika response dari API menyatakan gagal / rekening tidak ditemukan
        if (!result.data.success) {
            return m.reply("❌ Data rekening tidak ditemukan. Pastikan nama bank/e-wallet dan nomor yang dimasukkan sudah benar.");
        }

        const tot = result.data.data;
        
        // Output User-Friendly
        let resp = `*💳 C E K - R E K E N I N G*\n\n`;
        resp += `🏦 *Bank/Wallet :* ${tot.bankName}\n`;
        resp += `🔢 *Nomor       :* ${tot.accountNumber}\n`;
        resp += `👤 *Nama        :* ${tot.accountName}\n\n`;
        resp += `> _*Peringatan:* Harap berhati-hati saat melakukan transaksi._`;

        await m.reply(resp);

    } catch (err) {
        console.error(err);
        m.reply("⚠️ Terjadi kesalahan saat menghubungi layanan pengecekan rekening. Mungkin API sedang down atau ada masalah koneksi.");
    }
}

handler.help = ['cekrek <bank> <norek>', 'rekrekening <bank> <norek>'];
handler.tags = ['tools', 'internet'];
handler.command = /^(cekrek|rekrekening)$/i;

// Fitur keamanan/limitasi
handler.limit = true;

module.exports = handler;