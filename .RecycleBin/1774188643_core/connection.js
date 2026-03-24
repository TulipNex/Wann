// File: core/connection.js (Format: JavaScript)
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, Browsers, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const pino = require('pino');
const qrcode = require('qrcode-terminal');
const messageHandler = require('./handler');

async function initWhatsApp() {
    // Menyimpan state autentikasi di folder lokal (bisa di-mount di Docker Volume)
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    
    // Mengambil versi WA Web terbaru agar tidak ditolak oleh server
    const { version, isLatest } = await fetchLatestBaileysVersion();
    console.log(`🌐 Menggunakan WA Web Versi: ${version.join('.')} (Latest: ${isLatest})`);

    const wann = makeWASocket({
        version, // Gunakan versi WA terbaru yang didapat
        auth: state,
        logger: pino({ level: 'silent' }), // Matikan log bawaan baileys yang berisik
        browser: Browsers.macOS('Desktop'), // Menggunakan helper bawaan Baileys yang lebih aman
        syncFullHistory: false // Mempercepat koneksi dengan tidak men-sync seluruh history chat lama
    });

    // Event saat koneksi terupdate (QR Code, Disconnect, Connect)
    wann.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            qrcode.generate(qr, { small: true });
            console.log('📲 Silakan scan QR Code di atas menggunakan WhatsApp Anda.');
        }

        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('⚠️ Koneksi terputus.', lastDisconnect.error?.message || '');
            
            if (shouldReconnect) {
                console.log('🔄 Mencoba menghubungkan kembali dalam 5 detik...');
                // Tambahkan jeda waktu agar tidak terjadi infinite loop yang cepat
                setTimeout(() => {
                    initWhatsApp(); 
                }, 5000);
            } else {
                console.log('❌ Anda telah logout. Silakan hapus folder "auth_info_baileys" dan scan QR ulang.');
            }
        } else if (connection === 'open') {
            console.log('✅ Bot berhasil terhubung ke WhatsApp!');
        }
    });

    // Simpan kredensial saat ada pembaruan
    wann.ev.on('creds.update', saveCreds);

    // Event dispatcher untuk setiap pesan baru
    wann.ev.on('messages.upsert', async (m) => {
        if (m.type !== 'notify') return; // Hanya proses pesan baru
        await messageHandler(wann, m);
    });

    return wann;
}

module.exports = { initWhatsApp };