/**
 * TULIPNEX ACHIEVEMENT SYSTEM (OWNER)
 * Location: ./plugins/owner-addgelar.js
 * Feature: Owner Manual Inject Gelar Spesial (Mendukung Tag, Reply, & Nomor WA)
 */

// Database gelar disalin ke sini agar sistem owner bisa memvalidasi ID gelar
const titlesDB = {
    // === KATEGORI EKONOMI & TRADING (10) ===
    'leviathan': { name: '🐋 Sang Leviathan', desc: 'Mencapai Total Kekayaan (Networth) Rp 10 Triliun.', cat: 'Ekonomi' },
    'paus': { name: '🦈 Paus Biru', desc: 'Mencapai Total Kekayaan (Networth) Rp 100 Miliar.', cat: 'Ekonomi' },
    'hiu': { name: '🦈 Hiu Putih', desc: 'Mencapai Total Kekayaan (Networth) Rp 10 Miliar.', cat: 'Ekonomi' },
    'lumba': { name: '🐬 Lumba-Lumba', desc: 'Mencapai Total Kekayaan (Networth) Rp 1 Miliar.', cat: 'Ekonomi' },
    'cukong': { name: '💼 Cukong Pasar', desc: 'Memiliki Uang Tunai (Liquid) Rp 10 Triliun.', cat: 'Ekonomi' },
    'jutawan': { name: '💸 Crazy Rich', desc: 'Memiliki Uang Tunai (Liquid) Rp 1 Triliun.', cat: 'Ekonomi' },
    'miliarder': { name: '💰 Miliarder', desc: 'Memiliki Uang Tunai (Liquid) Rp 1 Miliar.', cat: 'Ekonomi' },
    'monopoli': { name: '🎩 Monopoli Pasar', desc: 'Memiliki minimal 100.000 koin TulipNex (TNX).', cat: 'Ekonomi' },
    'investor': { name: '📈 Investor Ulung', desc: 'Memiliki minimal 1.000 koin TulipNex (TNX).', cat: 'Ekonomi' },
    'kolektor': { name: '💎 Kolektor Aset', desc: 'Memiliki keenam jenis aset bursa masing-masing minimal 1.', cat: 'Ekonomi' },
    
    // === KATEGORI RPG & SOSIAL (10) ===
    'dewa': { name: '👑 Dewa RPG', desc: 'Mencapai Level 1000 di sistem RPG.', cat: 'RPG' },
    'legend': { name: '🐉 Legenda Hidup', desc: 'Mencapai Level 500 di sistem RPG.', cat: 'RPG' },
    'sepuh': { name: '🧙‍♂️ Sang Sepuh', desc: 'Mencapai Level 200 di sistem RPG.', cat: 'RPG' },
    'jawara': { name: '⚔️ Jawara Lokal', desc: 'Mencapai Level 100 di sistem RPG.', cat: 'RPG' },
    'grinder': { name: '⛏️ Pekerja Keras', desc: 'Mencapai Level 50 di sistem RPG.', cat: 'RPG' },
    'petualang': { name: '🎒 Petualang Baru', desc: 'Mencapai Level 10 di sistem RPG.', cat: 'RPG' },
    'veteran': { name: '🎖️ Veteran Elite', desc: 'Menjadi anggota Premium.', cat: 'RPG' },
    'hoarder': { name: '🎒 Hoarder Limit', desc: 'Memiliki lebih dari 100.000 Limit.', cat: 'RPG' },
    'limitless': { name: '♾️ Limitless', desc: 'Memiliki lebih dari 10.000 Limit.', cat: 'RPG' },
    'verified': { name: '✅ Warga Resmi', desc: 'Telah terdaftar secara resmi di database bot.', cat: 'RPG' },

    // === KATEGORI SPESIAL / MANUAL (10 - Diberikan Manual oleh Owner) ===
    'beta': { name: '🛠️ Beta Tester', desc: 'Pemain generasi pertama bot.', cat: 'Spesial' },
    'bug': { name: '🐛 Bug Hunter', desc: 'Melaporkan bug fatal kepada developer.', cat: 'Spesial' },
    'donatur': { name: '💖 Donatur Aktif', desc: 'Mendukung perkembangan bot secara finansial.', cat: 'Spesial' },
    'bandar': { name: '🤝 Bandar Gelap', desc: 'Raja pasar P2P (Diberikan manual).', cat: 'Spesial' },
    'vip': { name: '🌟 VIP Member', desc: 'Anggota VVIP dengan akses eksklusif.', cat: 'Spesial' },
    'owner': { name: '👑 Sang Pencipta', desc: 'Developer / Owner bot.', cat: 'Spesial' },
    'moderator': { name: '🛡️ Sang Pelindung', desc: 'Admin / Moderator grup yang aktif.', cat: 'Spesial' },
    'toxic': { name: '☢️ Radioactive', desc: 'Tukang rusuh atau spammer.', cat: 'Spesial' },
    'wibu': { name: '🌸 Wibu Elit', desc: 'Pecinta kultur Jejepangan kelas berat.', cat: 'Spesial' },
    'mafia': { name: '🕴️ Boss Mafia', desc: 'Penguasa bayangan grup.', cat: 'Spesial' }
};

let handler = async (m, { conn, args, usedPrefix, command }) => {
    let cmd = command.toLowerCase();

    // ==========================================
    // 1. TAMBAH GELAR DARI DATABASE (ID)
    // ==========================================
    if (cmd === 'addgelar') {
        let target = null;
        let id = null;

        // Deteksi Target (Reply, Tag, atau Nomor Raw)
        if (m.quoted) {
            target = m.quoted.sender;
            id = args[0]?.toLowerCase();
        } else if (m.mentionedJid && m.mentionedJid[0]) {
            target = m.mentionedJid[0];
            id = args[1]?.toLowerCase();
        } else if (args[0]) {
            let num = args[0].replace(/[^0-9]/g, '');
            if (num.length >= 8) { // Validasi jika itu berupa nomor WA
                target = num + '@s.whatsapp.net';
                id = args[1]?.toLowerCase();
            }
        }

        if (!target) return m.reply(`[!] Tentukan target (Tag / Reply / Nomor WA).\nContoh: *${usedPrefix}addgelar 6281234567890 beta*`);
        if (!id || !titlesDB[id]) return m.reply(`[!] ID gelar tidak valid. Cek *${usedPrefix}listgelar* terlebih dahulu.`);

        let targetData = global.db.data.users[target];
        if (!targetData) return m.reply(`[!] User tidak terdaftar di database.`);
        if (!targetData.unlockedTitles) targetData.unlockedTitles = [];

        if (targetData.unlockedTitles.includes(id)) return m.reply(`[!] User tersebut sudah memiliki gelar ini.`);

        targetData.unlockedTitles.push(id);
        
        // Notifikasi ke target
        conn.reply(target, `🎖️ *PEMBERIAN GELAR SPESIAL!*\nOwner telah menganugerahkan gelar *${titlesDB[id].name}* kepada Anda!\n\nKetik *${usedPrefix}setgelar ${id}* untuk menampilkannya di profil.`, null);
        
        // Laporan sukses
        return m.reply(`✅ Berhasil memberikan gelar *${titlesDB[id].name}* kepada @${target.split('@')[0]}.`, m, { contextInfo: { mentionedJid: [target] } });
    }

    // ==========================================
    // 2. TAMBAH GELAR CUSTOM (TEKS BEBAS)
    // ==========================================
    if (cmd === 'cstgelar' || cmd === 'customgelar') {
        let target = null;
        let titleName = "";

        // Deteksi Target (Reply, Tag, atau Nomor Raw)
        if (m.quoted) {
            target = m.quoted.sender;
            titleName = args.join(' ');
        } else if (m.mentionedJid && m.mentionedJid[0]) {
            target = m.mentionedJid[0];
            titleName = args.slice(1).join(' ');
        } else if (args[0]) {
            let num = args[0].replace(/[^0-9]/g, '');
            if (num.length >= 8) { // Jika argument pertama adalah nomor WA
                target = num + '@s.whatsapp.net';
                titleName = args.slice(1).join(' ');
            }
        }

        if (!target) return m.reply(`[!] Tentukan target (Tag / Reply / Nomor WA).\nContoh: *${usedPrefix}addcustomgelar 6281234567890 🏆 Juara 1*`);
        if (!titleName) return m.reply(`[!] Masukkan teks gelarnya.\nContoh: *${usedPrefix}addcustomgelar 6281234567890 🏆 Juara 1*`);

        let targetData = global.db.data.users[target];
        if (!targetData) return m.reply(`[!] User tidak terdaftar di database.`);

        // Langsung pasangkan gelar tersebut di profilnya (Auto-Equip)
        targetData.activeTitle = titleName;

        // Simpan ke array riwayat gelar custom
        if (!targetData.customTitles) targetData.customTitles = [];
        if (!targetData.customTitles.includes(titleName)) targetData.customTitles.push(titleName);

        // Notifikasi ke target
        conn.reply(target, `🎖️ *PEMBERIAN GELAR EKSKLUSIF!*\nOwner telah menganugerahkan gelar custom *${titleName}* kepada Anda!\n\nGelar ini sangat langka dan sudah otomatis terpasang di profil Anda!`, null);
        
        // Laporan sukses
        return m.reply(`✅ Berhasil memasangkan gelar custom *${titleName}* kepada @${target.split('@')[0]}.`, m, { contextInfo: { mentionedJid: [target] } });
    }
}

handler.help = ['addgelar <nomor/tag> <id>', 'cstgelar <@user> <teks>']
handler.tags = ['god']
handler.command = /^(addgelar|cstgelar|customgelar)$/i
handler.owner = true;
handler.private = true;

module.exports = handler;