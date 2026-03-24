// File: commands/group/demote.js (Format: JavaScript)

/**
 * Menurunkan jabatan admin
 */
module.exports = {
    name: 'demote',
    aliases: ['down', '↓'],
    category: 'group',
    description: 'Menurunkan admin grup menjadi member biasa',
    groupOnly: true,
    admin: true,
    botAdmin: true,
    execute: async (wann, msg, args) => {
        const remoteJid = msg.key.remoteJid;
        
        // Target dari reply atau mention
        let users = [];
        if (msg.message.extendedTextMessage?.contextInfo?.quotedMessage) {
            users = [msg.message.extendedTextMessage.contextInfo.participant];
        } else if (msg.message.extendedTextMessage?.contextInfo?.mentionedJid) {
            users = msg.message.extendedTextMessage.contextInfo.mentionedJid;
        }

        if (users.length === 0) {
            return wann.sendMessage(remoteJid, { text: '❌ Tag atau reply pesan member yang ingin diturunkan jabatannya!' }, { quoted: msg });
        }

        for (let user of users) {
            try {
                await wann.groupParticipantsUpdate(remoteJid, [user], "demote");
                let tag = `@${user.split('@')[0]}`;
                await wann.sendMessage(remoteJid, { 
                    text: `✅ Sukses menurunkan jabatan ${tag}`, 
                    mentions: [user] 
                }, { quoted: msg });
            } catch (e) {
                await wann.sendMessage(remoteJid, { text: `❌ Gagal demote user.` }, { quoted: msg });
            }
        }
    }
};