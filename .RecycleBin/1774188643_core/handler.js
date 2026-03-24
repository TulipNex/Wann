// File: core/handler.js (Format: JavaScript)
const fs = require('fs');
const path = require('path');
const { jidNormalizedUser } = require('@whiskeysockets/baileys');

// Koleksi command untuk menyimpan semua fitur bot
const commands = new Map();
const commandsDir = path.join(__dirname, '../commands');

/**
 * 1. HOT RELOAD: FOLDER COMMANDS (In-Memory)
 * Memuat semua command secara rekursif dan menghapus cache Node.js 
 * agar perubahan file di Pterodactyl langsung terdeteksi tanpa restart.
 */
const loadCommands = (dir) => {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            loadCommands(fullPath); 
        } else if (file.endsWith('.js')) {
            try {
                const resolvedPath = require.resolve(fullPath);
                if (require.cache[resolvedPath]) {
                    delete require.cache[resolvedPath];
                }
                const cmd = require(fullPath);
                if (cmd && cmd.name) {
                    commands.set(cmd.name, cmd);
                }
            } catch (err) {
                console.error(`❌ Gagal memuat command ${file}:`, err.message);
            }
        }
    }
};

// Inisialisasi awal pemuatan command
loadCommands(commandsDir);
console.log(`✅ Berhasil memuat ${commands.size} commands.`);

// Watcher untuk memantau perubahan di folder commands (Recursive)
let reloadTimeout;
const watchDirectory = (dir) => {
    if (!fs.existsSync(dir)) return;
    fs.watch(dir, { recursive: true }, (eventType, filename) => {
        if (filename && filename.endsWith('.js')) {
            clearTimeout(reloadTimeout);
            reloadTimeout = setTimeout(() => {
                console.log(`\n🔄 [HOT RELOAD] Perubahan terdeteksi: '${filename}'. Memuat ulang command...`);
                commands.clear();
                loadCommands(commandsDir);
                console.log(`✅ Update selesai! ${commands.size} commands aktif.`);
            }, 1000);
        }
    });
};
try { watchDirectory(commandsDir); } catch (e) { }


/**
 * 2. HOT RELOAD: SISTEM INTI & MIDDLEWARE (In-Memory)
 */
const watchFileInMemory = (filepath) => {
    if (!fs.existsSync(filepath)) return;
    fs.watchFile(filepath, { interval: 1000 }, () => {
        console.log(`\n🔄 [HOT RELOAD] Sistem '${path.basename(filepath)}' diupdate. Cache dibersihkan...`);
        try {
            const resolved = require.resolve(filepath);
            if (require.cache[resolved]) delete require.cache[resolved];
        } catch (e) {}
    });
};
// Pantau middleware agar perubahan logic auth/owner langsung aktif
watchFileInMemory(path.join(__dirname, 'middlewares.js'));


/**
 * 3. AUTO-RESTART: KONFIGURASI & KONEKSI
 * Jika file ini diubah, bot akan exit (1). 
 * Panel Pterodactyl akan menyalakannya kembali secara otomatis.
 */
const watchCoreAndRestart = (filepath) => {
    if (!fs.existsSync(filepath)) return;
    fs.watchFile(filepath, { interval: 1000 }, () => {
        console.log(`\n⚠️ [SYSTEM RESTART] '${path.basename(filepath)}' berubah! Memicu restart otomatis oleh panel...`);
        process.exit(1); 
    });
};

watchCoreAndRestart(path.join(__dirname, 'connection.js'));
watchCoreAndRestart(path.join(__dirname, '../index.js'));
watchCoreAndRestart(path.join(__dirname, '../.env'));


/**
 * 4. HANDLER PESAN UTAMA
 */
module.exports = async (wann, m) => {
    try {
        // Simpan instance socket ke global agar bisa diakses oleh interval atau plugin lain
        global.wann = wann;

        const msg = m.messages[0];
        if (!msg || !msg.message || msg.key.fromMe) return;

        // Normalisasi struktur pesan untuk mendapatkan teks body
        const type = Object.keys(msg.message)[0];
        let body = '';
        if (type === 'conversation') {
            body = msg.message.conversation;
        } else if (type === 'extendedTextMessage') {
            body = msg.message.extendedTextMessage.text;
        } else if (type === 'imageMessage' || type === 'videoMessage') {
            body = msg.message[type].caption || '';
        } else if (type === 'templateButtonReplyMessage') {
            body = msg.message.templateButtonReplyMessage.selectedId;
        } else if (type === 'buttonsResponseMessage') {
            body = msg.message.buttonsResponseMessage.selectedButtonId;
        } else if (type === 'listResponseMessage') {
            body = msg.message.listResponseMessage.singleSelectReply.selectedRowId;
        }

        // --- [DATABASE INITIALIZATION] ---
        if (global.db && global.db.data) {
            const remoteJid = msg.key.remoteJid;
            const rawSender = msg.key.participant || remoteJid;
            const senderJid = jidNormalizedUser(rawSender);

            if (!global.db.data.users) global.db.data.users = {};
            if (!global.db.data.users[senderJid]) {
                global.db.data.users[senderJid] = {
                    name: msg.pushName || 'User',
                    limit: 20,
                    exp: 0,
                    level: 0,
                    registered: false,
                    premium: false,
                    premiumTime: 0,
                    banned: false,
                    lastCmd: 0,
                };
            }

            if (!global.db.data.chats) global.db.data.chats = {};
            if (!global.db.data.chats[remoteJid]) {
                global.db.data.chats[remoteJid] = {
                    welcome: true,
                    antiLink: false,
                    mute: false,
                    delete: true,
                    autoGc: null,
                    groupStatus: 'opened'
                };
            }
        }

        // Pengecekan Prefix
        const prefixes = (process.env.PREFIX || '!,.,/,#').split(',');
        const usedPrefix = prefixes.find(p => body.startsWith(p.trim()));
        if (!usedPrefix) return;

        // Parsing Nama Command dan Argumen
        const args = body.slice(usedPrefix.length).trim().split(/ +/);
        const cmdName = args.shift().toLowerCase();

        // Mencari command berdasarkan nama atau alias
        const command = commands.get(cmdName) || Array.from(commands.values()).find(c => c.aliases && c.aliases.includes(cmdName));
        if (!command) return;

        // Meta Info & GLOBAL NORMALIZATION (Penting untuk deteksi Owner & Database)
        const remoteJid = msg.key.remoteJid;
        const rawSender = msg.key.participant || remoteJid;
        const sender = jidNormalizedUser(rawSender);
        const isGroup = remoteJid.endsWith('@g.us');

        // Pengecekan isOwner secara dinamis dari .env
        const ownerConfig = (process.env.OWNER_NUMBER || '').trim();
        const ownerNumbers = ownerConfig.split(',').map(num => {
            let cleanNum = num.trim();
            if (cleanNum && !cleanNum.includes('@')) cleanNum += '@s.whatsapp.net';
            return cleanNum;
        });
        const isOwner = ownerNumbers.includes(sender);

        // Mengambil Metadata Grup secara efisien
        let groupMetadata = isGroup ? await wann.groupMetadata(remoteJid).catch(() => ({})) : {};
        let participants = isGroup ? (groupMetadata.participants || []) : [];
        let userMetadata = isGroup ? participants.find(u => jidNormalizedUser(u.id || u.jid) === sender) : {};
        let botMetadata = isGroup ? participants.find(u => jidNormalizedUser(u.id || u.jid) === jidNormalizedUser(wann.user.id)) : {};
        
        let isAdmin = userMetadata?.admin === 'admin' || userMetadata?.admin === 'superadmin';
        let isBotAdmin = botMetadata?.admin === 'admin' || botMetadata?.admin === 'superadmin';

        // Memuat ulang middleware agar Hot Reload bekerja untuk logika auth
        const middlewarePath = path.join(__dirname, 'middlewares.js');
        if (require.cache[require.resolve(middlewarePath)]) delete require.cache[require.resolve(middlewarePath)];
        const { runMiddlewares } = require('./middlewares');

        const passed = await runMiddlewares(wann, msg, command, sender, isGroup, { isAdmin, isBotAdmin });
        if (!passed) return;

        // --- [EKSEKUSI COMMAND] ---
        // Kita membungkus semua variabel pendukung ke dalam satu objek metadata.
        // Objek ini dikirim sebagai argumen ke-4 agar file seperti menu.js bisa melakukan destructuring.
        const metadata = {
            usedPrefix,
            command: cmdName,
            isAdmin,
            isBotAdmin,
            groupMetadata,
            participants,
            body,
            sender,
            isOwner
        };

        await command.execute(wann, msg, args, metadata);

    } catch (error) {
        console.error('❌ Handler Error:', error);
    }
};

/**
 * 5. SISTEM PESAN KESALAHAN (DFAIL)
 * Digunakan untuk membalas pesan secara seragam ketika syarat akses tidak terpenuhi.
 */
global.dfail = (type, msg, wann) => {
    const remoteJid = msg.key.remoteJid;
    const failMsg = {
        owner: '❌ Perintah ini hanya dapat digunakan oleh *Owner Bot*!',
        group: '❌ Perintah ini hanya dapat digunakan di dalam *Grup*!',
        private: '❌ Perintah ini hanya dapat digunakan di *Chat Pribadi*!',
        admin: '❌ Perintah ini hanya untuk *Admin* grup!',
        botAdmin: '❌ Jadikan bot sebagai *Admin* untuk menggunakan perintah ini!',
        premium: '❌ Perintah ini khusus untuk member *Premium*!',
        unreg: '❌ Silakan daftar terlebih dahulu untuk menggunakan fitur ini.'
    }[type];
    if (failMsg) return wann.sendMessage(remoteJid, { text: failMsg }, { quoted: msg });
};

// Export agar bisa diakses fitur lain (seperti Menu)
module.exports.commandsMap = commands;