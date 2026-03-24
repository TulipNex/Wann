// File: commands/info/server.js (Format: JavaScript)
const os = require('os');

// Fungsi format ukuran (Bytes, KB, MB, GB)
function formatSize(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);
    return (Math.round(bytes / Math.pow(1024, i) * 100) / 100) + ' ' + sizes[i];
}

// Fungsi format waktu yang diubah ke Bahasa Indonesia agar rapi
function toTime(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    return `${days} Hari ${hours % 24} Jam ${minutes % 60} Menit ${seconds % 60} Detik`
      .replace(/0 Hari 0 Jam 0 Menit /g, '')
      .replace(/0 Hari 0 Jam /g, '')
      .replace(/0 Hari /g, '')
      .trim();
}

module.exports = {
    name: 'server',
    aliases: ['info-server', 'vps'],
    category: 'info',
    description: 'Menampilkan informasi status dan spesifikasi server bot',
    ownerOnly: true, // Fitur ini otomatis akan diblokir untuk user biasa oleh Middleware!
    execute: async (wann, msg, args) => {
        const remoteJid = msg.key.remoteJid;
        const sender = msg.key.participant || remoteJid;

        try {
            // Reaksi loading (Opsional, format Baileys v6+)
            await wann.sendMessage(remoteJid, { react: { text: '🔄', key: msg.key } });

            // Menggunakan fetch bawaan Node.js (Node 18+) tanpa perlu require('node-fetch')
            let response = await fetch('https://freeipapi.com/api/json');
            let json = await response.json();

            // Kalkulasi RAM & Uptime
            let ramUsed = formatSize(os.totalmem() - os.freemem());
            let ramTotal = formatSize(os.totalmem());
            let uptime = toTime(os.uptime() * 1000);

            // Filter Data API agar tidak berantakan
            let ipAddress = json.ipAddress || 'N/A';
            let ipVersion = json.ipVersion || '-';
            let city = json.cityName || 'N/A';
            let region = json.regionName || 'N/A';
            let country = json.countryName || 'N/A';
            let countryCode = json.countryCode || '-';
            
            // Perbaikan zona waktu
            let timeZone = (json.timeZones && json.timeZones.length > 0) ? json.timeZones[0] : 'N/A';
            
            // Perbaikan bug currency "undefined"
            let currency = 'N/A';
            if (json.currencies && json.currencies.length > 0) {
                currency = json.currencies[0].code || json.currencies[0] || 'N/A';
            }

            // Desain UI Baru yang Lebih Bersih
            let txt = `🌐 *SERVER INFORMATION*\n────────────────────\n\n🖥️ *H A R D W A R E*\n» *OS:* ${os.type()} (${os.arch()})\n» *Release:* ${os.release()}\n» *Processor:* ${os.cpus()[0].model.trim()}\n» *RAM:* ${ramUsed} / ${ramTotal}\n» *Uptime:* ${uptime}\n\n🌍 *N E T W O R K   &   I P*\n» *IP Address:* ${ipAddress} (IPv${ipVersion})\n» *Location:* ${city}, ${region}\n» *Country:* ${country} (${countryCode})\n» *Timezone:* ${timeZone}\n» *Currency:* ${currency}`;

            await wann.sendMessage(remoteJid, {
                text: txt,
                mentions: [sender],
                contextInfo: {
                    isForwarded: false, 
                    forwardingScore: 999,
                    externalAdReply: {
                        title: `SERVER INFORMATION - WANN BOT`,
                        body: `Powered by TulipNex`,
                        mediaType: 1, // 1 = Image
                        previewType: 0,
                        renderLargerThumbnail: true,
                        thumbnailUrl: 'https://files.catbox.moe/mrfys5.jpg',
                        sourceUrl: ''
                    }
                }
            }, { quoted: msg });

            // Reaksi sukses
            await wann.sendMessage(remoteJid, { react: { text: '✅', key: msg.key } });

        } catch (error) {
            console.error(error);
            await wann.sendMessage(remoteJid, { react: { text: '❌', key: msg.key } });
            await wann.sendMessage(remoteJid, { text: '⚠️ Terjadi kesalahan saat mengambil informasi server dari API.' }, { quoted: msg });
        }
    }
};