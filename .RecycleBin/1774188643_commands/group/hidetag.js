// File: commands/group/hidetag.js (Format: JavaScript)
const { downloadMedia } = require('../../utils/helpers');

/**
 * Memberikan pengumuman ke seluruh member grup tanpa terlihat tagnya (Hidetag)
 */
module.exports = {
    name: 'hidetag',
    aliases: ['ht', 'h'],
    category: 'group',
    description: 'Mengirim pesan pengumuman ke seluruh member grup',
    groupOnly: true,
    admin: true,
    execute: async (wann, msg, args, metadata = {}) => {
        const remoteJid = msg.key.remoteJid;
        
        // Ambil participants dari metadata, jika tidak ada (undefined), coba fetch manual
        let participants = metadata.participants;
        if (!participants) {
            try {
                const groupMetadata = await wann.groupMetadata(remoteJid);
                participants = groupMetadata.participants || [];
            } catch (e) {
                return wann.sendMessage(remoteJid, { text: '❌ Gagal mengambil daftar member grup.' }, { quoted: msg });
            }
        }
        
        // Mendapatkan semua ID member grup untuk di-tag secara "sembunyi"
        const mentions = participants.map(u => u.id);
        
        // Tentukan teks pengumuman
        let q = msg.message.extendedTextMessage?.contextInfo?.quotedMessage ? 
                { message: msg.message.extendedTextMessage.contextInfo.quotedMessage } : msg;
        
        const type = Object.keys(q.message || {})[0];
        const isMedia = /image|video|audio|sticker/.test(type);
        
        let text = args.join(' ');
        if (!text && !isMedia) {
            // Jika tidak ada teks dan bukan media, ambil teks dari quoted jika ada
            text = q.message?.conversation || q.message?.extendedTextMessage?.text || "";
        }

        const fkontak = {
            key: { participant: "0@s.whatsapp.net", remoteJid: "status@broadcast", fromMe: false, id: "Wann" },
            message: { contactMessage: { vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Wann;;;\nFN:Wann Assistant\nitem1.TEL;waid=${msg.key.remoteJid.split('@')[0]}:${msg.key.remoteJid.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD` } }
        };

        if (isMedia) {
            const buffer = await downloadMedia(q);
            if (!buffer) return wann.sendMessage(remoteJid, { text: '❌ Gagal mengunduh media untuk hidetag.' });
            
            const mediaType = type.replace('Message', '');
            let options = { [mediaType]: buffer, mentions };
            
            if (mediaType !== 'sticker' && mediaType !== 'audio') options.caption = text;
            if (mediaType === 'audio') options.mimetype = 'audio/mpeg';

            await wann.sendMessage(remoteJid, options, { quoted: fkontak });
        } else {
            if (!text) return wann.sendMessage(remoteJid, { text: '❌ Masukkan teks atau reply media untuk hidetag!' });
            await wann.sendMessage(remoteJid, { text: text, mentions }, { quoted: fkontak });
        }
    }
};