// File: core/middlewares.js (Format: JavaScript)
const NodeCache = require('node-cache');
// Cache untuk rate limiter (timeout 5 detik per user)
const rateLimitCache = new NodeCache({ stdTTL: 5 }); 

const runMiddlewares = async (wann, msg, command, sender, isGroup) => {
    // Variabel 'sender' sekarang sudah di-normalisasi secara GLOBAL oleh handler.js
    
    // Mengambil string owner dari .env dan memecahnya jika ada banyak nomor (dipisah koma)
    const ownerConfig = (process.env.OWNER_NUMBER || '').trim();
    const ownerNumbers = ownerConfig.split(',').map(num => {
        let cleanNum = num.trim();
        // Jika formatnya hanya angka, tambahkan @s.whatsapp.net. Jika sudah ada @lid, biarkan saja.
        if (cleanNum && !cleanNum.includes('@')) {
            cleanNum += '@s.whatsapp.net';
        }
        return cleanNum;
    });

    // Cek apakah pengirim ada di dalam daftar ownerNumbers
    const isOwner = ownerNumbers.includes(sender);

    // 1. Logging Middleware
    console.log(`[COMMAND] ${command.name} dijalankan oleh ${sender} ${isGroup ? '(Grup)' : '(Pribadi)'}`);

    // 2. Auth Middleware (Pengecekan Owner)
    if (command.ownerOnly && !isOwner) {
        // Tampilkan log debug di konsol agar mudah melihat perbedaan nomornya jika masih gagal
        console.log(`[AUTH FAILED] Akses Owner Ditolak!\n» Nomor Anda: '${sender}'\n» Daftar Owner Sah: '${ownerNumbers.join(', ')}'`);
        
        await wann.sendMessage(msg.key.remoteJid, { text: '❌ Perintah ini khusus untuk Owner Bot!' }, { quoted: msg });
        return false;
    }

    // 3. Group Only Middleware
    if (command.groupOnly && !isGroup) {
        await wann.sendMessage(msg.key.remoteJid, { text: '❌ Perintah ini hanya bisa digunakan di dalam Grup!' }, { quoted: msg });
        return false;
    }

    // 4. Rate Limiting Middleware
    // Pengecualian: Owner bot tidak terkena limit delay 5 detik
    if (rateLimitCache.has(sender) && !isOwner) {
        await wann.sendMessage(msg.key.remoteJid, { text: '⏳ Terlalu cepat! Tunggu 5 detik sebelum menggunakan command lagi.' }, { quoted: msg });
        return false;
    }
    
    // Set cache limit hanya untuk user biasa
    if (!isOwner) {
        rateLimitCache.set(sender, true);
    }

    return true; // Lolos semua middleware
};

module.exports = { runMiddlewares };