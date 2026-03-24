// File: commands/group/promote.js (Format: JavaScript)
module.exports = {
    name: 'promote',
    aliases: ['admin'],
    category: 'group',
    description: 'Menjadikan member sebagai Admin Grup (Group Only)',
    groupOnly: true,
    execute: async (wann, msg, args) => {
        const remoteJid = msg.key.remoteJid;
        
        const quotedMsg = msg.message.extendedTextMessage?.contextInfo?.participant;
        const mentionedJid = msg.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
        
        let target = quotedMsg ? quotedMsg : (mentionedJid.length > 0 ? mentionedJid[0] : null);

        if (!target) {
            return wann.sendMessage(remoteJid, { text: '❌ Tag atau reply pesan member yang ingin diangkat jadi admin!' }, { quoted: msg });
        }

        try {
            // Fitur Group Management: Promote Participant
            await wann.groupParticipantsUpdate(remoteJid, [target], "promote");
            await wann.sendMessage(remoteJid, { text: `🎉 Selamat! @${target.split('@')[0]} sekarang adalah Admin.`, mentions: [target] }, { quoted: msg });
        } catch (error) {
            await wann.sendMessage(remoteJid, { text: '❌ Gagal menjadikan admin. Pastikan bot memiliki hak Admin.' }, { quoted: msg });
        }
    }
};