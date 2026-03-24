// File: commands/media/sticker.js (Format: JavaScript)
const { downloadMedia } = require('../../utils/helpers');
const { writeFileSync, unlinkSync } = require('fs');
const { exec } = require('child_process');
const path = require('path');

module.exports = {
    name: 'sticker',
    aliases: ['s', 'stiker'],
    category: 'media',
    description: 'Mengubah gambar/video menjadi stiker',
    execute: async (wann, msg, args) => {
        const remoteJid = msg.key.remoteJid;
        const msgType = Object.keys(msg.message)[0];
        
        // Deteksi pesan gambar (baik direct maupun quoted)
        const isImage = msgType === 'imageMessage' || 
                       (msgType === 'extendedTextMessage' && msg.message.extendedTextMessage.contextInfo?.quotedMessage?.imageMessage);

        if (!isImage) {
            return await wann.sendMessage(remoteJid, { text: '❌ Kirim atau reply gambar dengan caption !sticker' }, { quoted: msg });
        }

        await wann.sendMessage(remoteJid, { text: '⏳ Sedang membuat stiker...' }, { quoted: msg });

        // Fitur download media
        const mediaBuffer = await downloadMedia(msg);
        if (!mediaBuffer) return await wann.sendMessage(remoteJid, { text: '❌ Gagal mengunduh media.' });

        // Simpan sementara
        const tmpInput = path.join(__dirname, `../../tmp_${Date.now()}.jpg`);
        const tmpOutput = path.join(__dirname, `../../tmp_${Date.now()}.webp`);
        
        writeFileSync(tmpInput, mediaBuffer);

        // Konversi ke WebP menggunakan FFmpeg agar bisa jadi sticker transparan
        exec(`ffmpeg -i ${tmpInput} -vcodec libwebp -filter:v fps=fps=15 -lossless 1 -loop 0 -preset default -an -vsync 0 -s 512:512 ${tmpOutput}`, async (err) => {
            if (err) {
                console.error(err);
                return wann.sendMessage(remoteJid, { text: '❌ Gagal mengkonversi stiker.' });
            }

            // Fitur kirim stiker
            await wann.sendMessage(remoteJid, { sticker: { url: tmpOutput } }, { quoted: msg });

            // Cleanup
            unlinkSync(tmpInput);
            unlinkSync(tmpOutput);
        });
    }
};