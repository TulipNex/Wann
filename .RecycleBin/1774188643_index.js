// File: index.js (Format: JavaScript)
require('dotenv').config();
const connectDB = require('./database/mongo');
const { initWhatsApp } = require('./core/connection');

async function startApp() {
    console.log('🚀 Memulai Aplikasi WhatsApp Bot...');
    
    // 1. Inisialisasi Database MongoDB
    await connectDB();

    // 2. Inisialisasi Koneksi WhatsApp (Baileys)
    await initWhatsApp();
}

startApp().catch(err => {
    console.error('❌ Terjadi kesalahan fatal:', err);
    process.exit(1);
});