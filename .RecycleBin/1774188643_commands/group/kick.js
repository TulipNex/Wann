// File: commands/group/kick.js (Format: JavaScript)
module.exports = {
    name: 'kick',
    aliases: ['tendang'],
    category: 'group',
    description: 'Mengeluarkan member dari grup (Admin & Group Only)',
    groupOnly: true, // Akan ditangkap oleh Middleware
    execute: async (wann, msg, args) => {
        const remoteJid = msg.key.remoteJid;
        const sender = msg.key.participant || remoteJid;

        // Cek apakah pengirim membalas pesan seseorang (quoted user)
        const quotedMsg = msg.message.extendedTextMessage?.contextInfo?.participant;
        const mentionedJid = msg.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
        
        let target = quotedMsg ? quotedMsg : (mentionedJid.length > 0 ? mentionedJid[0] : null);

        if (!target) {
            return wann.sendMessage(remoteJid, { text: '❌ Tag atau reply pesan member yang ingin dikeluarkan!' }, { quoted: msg });
        }

        try {
            // Fitur Group Management: Remove Participant
            await wann.groupParticipantsUpdate(remoteJid, [target], "remove");
            await wann.sendMessage(remoteJid, { text: `✅ Berhasil mengeluarkan @${target.split('@')[0]} dari grup.`, mentions: [target] }, { quoted: msg });
        } catch (error) {
            console.error(error);
            await wann.sendMessage(remoteJid, { text: '❌ Gagal mengeluarkan member. Pastikan bot adalah Admin grup.' }, { quoted: msg });
        }
    }
};