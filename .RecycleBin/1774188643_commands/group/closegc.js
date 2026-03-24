// File: commands/group/closegc.js (Format: JavaScript)
const moment = require('moment-timezone');

/**
 * Auto Open/Close Group
 */
module.exports = {
    name: 'closegc',
    aliases: ['auto-close'],
    category: 'group',
    description: 'Mengatur waktu tutup dan buka grup otomatis',
    groupOnly: true,
    admin: true,
    execute: async (wann, msg, args, { usedPrefix, command }) => {
        const remoteJid = msg.key.remoteJid;
        
        // Memastikan database chats ada
        if (!global.db.data.chats[remoteJid]) global.db.data.chats[remoteJid] = {};
        let chat = global.db.data.chats[remoteJid];

        // Format: !closegc aktif 21|5 (Tutup jam 21, Buka jam 5)
        const subCommand = args[0]?.toLowerCase();

        if (subCommand === 'aktif' || subCommand === 'on') {
            if (!args[1] || !args[1].includes('|')) {
                return wann.sendMessage(remoteJid, { text: `❌ Format salah! Gunakan: *${usedPrefix + command} aktif jam_tutup|jam_buka*\nContoh: ${usedPrefix + command} aktif 21|05` }, { quoted: msg });
            }

            let [closeTime, openTime] = args[1].split('|').map(Number);
            if (isNaN(closeTime) || isNaN(openTime)) return m.reply('❌ Waktu harus berupa angka!');

            chat.autoGc = { closeTime, openTime };
            await wann.sendMessage(remoteJid, { text: `✅ Auto Group diaktifkan.\n🔒 Tutup: ${closeTime}:00 WITA\n🔓 Buka: ${openTime}:00 WITA` }, { quoted: msg });
        } 
        else if (subCommand === 'mati' || subCommand === 'off') {
            delete chat.autoGc;
            await wann.sendMessage(remoteJid, { text: '✅ Auto Group dinonaktifkan.' }, { quoted: msg });
        } 
        else {
            await wann.sendMessage(remoteJid, { text: `💡 Cara penggunaan:\n- ${usedPrefix + command} aktif 21|05\n- ${usedPrefix + command} mati` }, { quoted: msg });
        }
    }
};

/**
 * Logika pengecekan otomatis (Interval)
 * Karena file ini di-Hot Reload, kita pasang interval yang mengecek setiap menit.
 */
if (!global.autoGcInterval) {
    global.autoGcInterval = setInterval(async () => {
        const currentHour = moment().tz('Asia/Makassar').hour();
        // Cek semua chat di DB yang punya autoGc
        const chats = global.db?.data?.chats || {};
        
        for (const jid of Object.keys(chats)) {
            const chat = chats[jid];
            if (!chat.autoGc) continue;

            const { closeTime, openTime } = chat.autoGc;
            
            // Logika Tutup
            if (currentHour === closeTime && chat.groupStatus !== 'closed') {
                try {
                    // Import socket wann jika tersedia secara global atau lewat metode lain
                    // Di arsitektur ini, sebaiknya logika ini dipindah ke core/connection.js
                    // Tapi sebagai fallback, kita pakai global.wann jika ada
                    if (global.wann) {
                        await global.wann.groupSettingUpdate(jid, 'announcement');
                        await global.wann.sendMessage(jid, { text: `🔔 *SISTEM OTOMATIS*\nGrup telah ditutup. Akan dibuka kembali pukul ${openTime}:00 WITA.` });
                        chat.groupStatus = 'closed';
                    }
                } catch (e) {}
            }
            // Logika Buka
            else if (currentHour === openTime && chat.groupStatus !== 'opened') {
                try {
                    if (global.wann) {
                        await global.wann.groupSettingUpdate(jid, 'not_announcement');
                        await global.wann.sendMessage(jid, { text: `🔔 *SISTEM OTOMATIS*\nGrup telah dibuka. Silakan berinteraksi kembali!` });
                        chat.groupStatus = 'opened';
                    }
                } catch (e) {}
            }
        }
    }, 60000);
}