/**
 * INFO CREATOR PLUGIN (BAILEYS V7 OPTIMIZED)
 * Location: /home/container/plugins/info-creator.js
 * Status: ESM Safe & Bulletproof vCard Format
 */

let handler = async (m, { conn }) => {
    // 1. Ambil data dari variabel global (dengan nilai cadangan jika kosong)
    let name = global.nameowner || 'Creator Bot';
    let rawNumber = global.numberowner || '628123456789'; // Pastikan di config formatnya 628xxx
    let gmail = global.mail || 'support@tioprm.eu.org';
    let instagram = global.instagram || 'https://instagram.com/';

    // 2. Filter Mutlak: Menghapus simbol +, spasi, atau strip dari nomor
    let cleanNumber = String(rawNumber).replace(/[^0-9]/g, '');

    // 3. Susun vCard dengan penggabungan string murni (Sangat ketat standar Baileys v7)
    let vcard = 'BEGIN:VCARD\n'
              + 'VERSION:3.0\n'
              + 'N:;' + name + ';;;\n'
              + 'FN:' + name + '\n'
              + 'ORG:Creator Bot;\n'
              + 'TEL;type=CELL;type=VOICE;waid=' + cleanNumber + ':+' + cleanNumber + '\n'
              + 'EMAIL;type=INTERNET:' + gmail + '\n'
              + 'URL:' + instagram + '\n'
              + 'ADR:;;🇮🇩 Indonesia;;;;\n'
              + 'END:VCARD';

    // 4. Eksekusi pengiriman kontak
    const sentMsg = await conn.sendMessage(
        m.chat,
        { 
            contacts: { 
                displayName: name, 
                contacts: [{ vcard }] 
            }
        }
    );

    // 5. Kirim pesan balasan yang me-reply kontak tersebut
    await conn.reply(m.chat, "Itu Adalah nomor owner Bot", sentMsg);
}

// Konfigurasi Plugin
handler.help = ['owner', 'creator'];
handler.tags = ['info'];
handler.command = /^(owner|creator)$/i;
handler.limit = true; // Sesuai dengan kode asli Anda

module.exports = handler;