// File: commands/general/ping.js (Format: JavaScript)
const { performance } = require('perf_hooks');

// Fungsi untuk mengubah milidetik menjadi format waktu yang rapi
function clockString(ms) {
    let d = isNaN(ms) ? '--' : Math.floor(ms / 86400000);
    let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000) % 24;
    let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60;
    let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60;
    return `${d} Hari ${h} Jam ${m} Menit ${s} Detik`.replace(/0 Hari 0 Jam 0 Menit /g, '').replace(/0 Hari 0 Jam /g, '').replace(/0 Hari /g, '').trim();
}

module.exports = {
    name: 'ping',
    aliases: ['p', 'speed', 'pong'], // Menambahkan alias sesuai referensi
    category: 'general',
    description: 'Cek kecepatan respon dan waktu aktif bot',
    execute: async (wann, msg, args) => {
        const remoteJid = msg.key.remoteJid;
        
        // Mulai menghitung waktu untuk ping
        let old = performance.now();

        // Menghitung Runtime (Uptime) langsung dari process Node.js
        let _muptime = process.uptime() * 1000;
        let muptime = clockString(_muptime);

        // Selesai menghitung waktu ping
        let neww = performance.now();
        
        // Mengubah pembulatan menjadi 6 angka di belakang koma
        let speed = (neww - old).toFixed(6);

        // Desain UI Singkat dan Padat
        let txt = `🚀 *P O N G !*\n────────────────────\n⚡ *Speed:* \n> ${speed} ms\n⏱️ *Runtime:* \n> ${muptime}`;

        // Kirim balasan
        await wann.sendMessage(remoteJid, { text: txt }, { quoted: msg });
    }
};