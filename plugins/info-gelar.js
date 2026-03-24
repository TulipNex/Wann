/**
 * TULIPNEX ACHIEVEMENT & TITLE SYSTEM
 * Location: ./plugins/rpg-gelar.js
 * Feature: Gelar Pamer Profil, Auto-Unlocker, & Owner Manual Inject
 */

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

let handler = async (m, { conn, command, args, usedPrefix, isOwner }) => {
    let user = global.db.data.users[m.sender];
    if (!user) return;

    // Inisialisasi Database Gelar
    if (!user.unlockedTitles) user.unlockedTitles = [];
    if (!user.activeTitle) user.activeTitle = "";

    let cmd = command.toLowerCase();

    // ==========================================
    // COMMAND 1: .listgelar (Daftar & Auto-Unlocker)
    // ==========================================
    if (cmd === 'listgelar' || cmd === 'achievements' || cmd === 'gelar') {
        
        // --- 🤖 SISTEM AUTO-UNLOCKER ---
        let p = global.db.data.settings?.trading?.prices || {};
        let assetValue = (user.ivylink||0)*(p.IVL||3000) + (user.lilybit||0)*(p.LBT||100000) + (user.iriscode||0)*(p.IRC||1000000) + (user.lotusnet||0)*(p.LTN||10000000) + (user.rosex||0)*(p.RSX||100000000) + (user.tulipnex||0)*(p.TNX||1000000000);
        let networth = user.money + assetValue;
        
        let newUnlocks = [];

        // 1. Pengecekan Syarat Ekonomi
        if (networth >= 10000000000000 && !user.unlockedTitles.includes('leviathan')) newUnlocks.push('leviathan');
        if (networth >= 100000000000 && !user.unlockedTitles.includes('paus')) newUnlocks.push('paus');
        if (networth >= 10000000000 && !user.unlockedTitles.includes('hiu')) newUnlocks.push('hiu');
        if (networth >= 1000000000 && !user.unlockedTitles.includes('lumba')) newUnlocks.push('lumba');
        
        if (user.money >= 10000000000000 && !user.unlockedTitles.includes('cukong')) newUnlocks.push('cukong');
        if (user.money >= 1000000000000 && !user.unlockedTitles.includes('jutawan')) newUnlocks.push('jutawan');
        if (user.money >= 1000000000 && !user.unlockedTitles.includes('miliarder')) newUnlocks.push('miliarder');
        
        if ((user.tulipnex || 0) >= 100000 && !user.unlockedTitles.includes('monopoli')) newUnlocks.push('monopoli');
        if ((user.tulipnex || 0) >= 1000 && !user.unlockedTitles.includes('investor')) newUnlocks.push('investor');
        
        if ((user.ivylink > 0 && user.lilybit > 0 && user.iriscode > 0 && user.lotusnet > 0 && user.rosex > 0 && user.tulipnex > 0) && !user.unlockedTitles.includes('kolektor')) newUnlocks.push('kolektor');

        // 2. Pengecekan Syarat RPG & Sosial
        if (user.level >= 1000 && !user.unlockedTitles.includes('dewa')) newUnlocks.push('dewa');
        if (user.level >= 500 && !user.unlockedTitles.includes('legend')) newUnlocks.push('legend');
        if (user.level >= 200 && !user.unlockedTitles.includes('sepuh')) newUnlocks.push('sepuh');
        if (user.level >= 100 && !user.unlockedTitles.includes('jawara')) newUnlocks.push('jawara');
        if (user.level >= 50 && !user.unlockedTitles.includes('grinder')) newUnlocks.push('grinder');
        if (user.level >= 10 && !user.unlockedTitles.includes('petualang')) newUnlocks.push('petualang');

        if (user.premium && !user.unlockedTitles.includes('veteran')) newUnlocks.push('veteran');
        if (user.limit >= 100000 && !user.unlockedTitles.includes('hoarder')) newUnlocks.push('hoarder');
        if (user.limit >= 10000 && !user.unlockedTitles.includes('limitless')) newUnlocks.push('limitless');
        if (user.registered && !user.unlockedTitles.includes('verified')) newUnlocks.push('verified');

        // Jika ada gelar baru terbuka, masukkan ke database & beritahu pemain
        if (newUnlocks.length > 0) {
            for (let id of newUnlocks) user.unlockedTitles.push(id);
            let notif = `🎉 *PENCAPAIAN BARU TERBUKA!* 🎉\nAnda baru saja mendapatkan gelar berikut:\n`;
            newUnlocks.forEach(id => { notif += `• *${titlesDB[id].name}*\n`; });
            notif += `\n_Ketik ${usedPrefix}setgelar <id> untuk memamerkannya di profil!_`;
            await m.reply(notif);
        }
        // -------------------------------

        // --- RENDER TAMPILAN UI GELAR ---
        let caption = `🏆 *DAFTAR PENCAPAIAN & GELAR* 🏆\n`;
        caption += `Gelar yang sudah didapat bisa dipakai di profil.\n\n`;
        caption += `*Cara pakai:* ${usedPrefix}setgelar <ID>\n`;
        caption += `*Cara lepas:* ${usedPrefix}lepasgelar\n──────────────────\n`;

        let categories = ['Ekonomi', 'RPG', 'Spesial'];
        
        for (let cat of categories) {
            caption += `\n*📁 KATEGORI: ${cat.toUpperCase()}*\n`;
            for (let [id, data] of Object.entries(titlesDB)) {
                if (data.cat === cat) {
                    let isUnlocked = user.unlockedTitles.includes(id);
                    let mark = isUnlocked ? '✅' : '❌';
                    caption += `${mark} *[ID: ${id}]* ${data.name}\n   └ _${data.desc}_\n\n`;
                }
            }
        }
        
        caption += `──────────────────\nTotal Gelar Anda: *${user.unlockedTitles.length} / ${Object.keys(titlesDB).length}*`;
        return m.reply(caption);
    }

    // ==========================================
    // COMMAND 2: .setgelar (Pakai Gelar)
    // ==========================================
    if (cmd === 'setgelar' || cmd === 'pakaigelar') {
        let id = args[0]?.toLowerCase();
        if (!id) return m.reply(`[!] Masukkan ID gelar.\nContoh: *${usedPrefix}setgelar paus*\nKetik *${usedPrefix}listgelar* untuk melihat ID.`);
        
        if (!titlesDB[id]) return m.reply(`[!] ID Gelar *${id}* tidak ditemukan.`);
        if (!user.unlockedTitles.includes(id)) return m.reply(`[!] Anda belum membuka gelar ini! Penuhi syaratnya terlebih dahulu.`);

        user.activeTitle = titlesDB[id].name;
        return m.reply(`🎖️ Gelar *${titlesDB[id].name}* berhasil dipasang!\nCek tampilan barunya di *${usedPrefix}profil*.`);
    }

    // ==========================================
    // COMMAND 3: .lepasgelar (Copot Gelar)
    // ==========================================
    if (cmd === 'lepasgelar') {
        if (!user.activeTitle) return m.reply(`[!] Anda sedang tidak memakai gelar apapun.`);
        user.activeTitle = "";
        return m.reply(`🎖️ Gelar berhasil dilepas dari profil Anda.`);
    }
}

handler.help = ['listgelar', 'setgelar <id>', 'lepasgelar']
handler.tags = ['info']
handler.command = /^(listgelar|achievements|gelar|setgelar|pakaigelar|lepasgelar)$/i
handler.rpg = true

module.exports = handler;