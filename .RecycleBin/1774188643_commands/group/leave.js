// File: commands/group/leave.js (Format: JavaScript)

/**
 * Keluar dari grup (Owner Only)
 */
module.exports = {
    name: 'leavegc',
    aliases: ['out', 'keluar'],
    category: 'group',
    description: 'Memerintahkan bot untuk keluar dari grup ini',
    ownerOnly: true,
    groupOnly: true,
    execute: async (wann, msg, args) => {
        const remoteJid = msg.key.remoteJid;
        
        await wann.sendMessage(remoteJid, { text: '👋 Bot akan keluar dari grup ini. Sampai jumpa!' }, { quoted: msg });
        
        // Jeda 1 detik sebelum keluar
        setTimeout(async () => {
            await wann.groupLeave(remoteJid);
        }, 1000);
    }
};