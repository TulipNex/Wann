// File: database/mongo.js (Format: JavaScript)
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) throw new Error("MONGODB_URI tidak ditemukan di .env");

        await mongoose.connect(uri);
        console.log('✅ MongoDB Berhasil Terkoneksi');
    } catch (error) {
        console.error('❌ Gagal mengkoneksikan ke MongoDB:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;