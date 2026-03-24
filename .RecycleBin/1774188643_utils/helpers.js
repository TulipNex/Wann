// File: utils/helpers.js (Format: JavaScript)
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

/**
 * Mengekstrak buffer media dari pesan WhatsApp
 */
const downloadMedia = async (msg) => {
    try {
        const msgType = Object.keys(msg.message)[0];
        let content = msg.message[msgType];
        
        // Cek apakah ini pesan balasan (quoted message)
        if (msgType === 'extendedTextMessage' && msg.message.extendedTextMessage.contextInfo?.quotedMessage) {
            const quotedMessage = msg.message.extendedTextMessage.contextInfo.quotedMessage;
            const quotedType = Object.keys(quotedMessage)[0];
            content = quotedMessage[quotedType];
        }

        // Tentukan tipe media ('image' | 'video' | 'audio' | 'document')
        let mediaType = 'image';
        if (content.mimetype) {
            mediaType = content.mimetype.split('/')[0];
        }

        if (mediaType === 'application') mediaType = 'document';

        const stream = await downloadContentFromMessage(content, mediaType);
        let buffer = Buffer.from([]);
        
        for await(const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }
        
        return buffer;
    } catch (err) {
        console.error('Error downloading media:', err);
        return null;
    }
};

module.exports = { downloadMedia };