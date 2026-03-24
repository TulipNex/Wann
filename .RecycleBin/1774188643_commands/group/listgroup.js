// File: commands/group/listgroup.js (Format: JavaScript)
const fs = require('fs');
const path = require('path');

function msToDate(ms) {
    if (ms <= 0) return 'Expired';
    let days = Math.floor(ms / (24 * 60 * 60 * 1000));
    let hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    let minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
    
    let res = [];
    if (days > 0) res.push(`${days}h`);
    if (hours > 0) res.push(`${hours}j`);
    if (minutes > 0) res.push(`${minutes}m`);
    
    return res.length > 0 ? res.join(' ') : '< 1m';
}

module.exports = {
    name: 'listgroup',
    aliases: ['groups', 'grouplist'],
    category: 'group',
    description: 'Menampilkan daftar grup yang diikuti bot',
    ownerOnly: true,
    execute: async (wann, msg, args) => {
        const remoteJid = msg.key.remoteJid;
        const now = Date.now();

        await wann.sendMessage(remoteJid, { react: { text: '🔄', key: msg.key } });

        try {
            const activeGroups = await wann.groupFetchAllParticipating();
            const activeGroupJids = Object.keys(activeGroups);

            if (activeGroupJids.length === 0) {
                return wann.sendMessage(remoteJid, { text: 'ℹ️ Saat ini bot tidak tergabung di grup mana pun.' }, { quoted: msg });
            }

            // Sync dengan database global jika ada
            let dbChats = (global.db && global.db.data ? global.db.data.chats : {});

            let listItems = activeGroupJids.map((jid, i) => {
                let group = activeGroups[jid];
                let dbData = dbChats[jid] || {};
                
                let fitur = [];
                if (dbData.mute) fitur.push('🔇 Mute');
                if (dbData.welcome) fitur.push('👋 Welcome');
                if (dbData.antiLink) fitur.push('🔗 AntiLink');

                let setStr = fitur.length > 0 ? fitur.join(' | ') : 'Semua Off';
                let expStr = dbData.expired ? msToDate(dbData.expired - now) : '♾️ Permanen';

                return `> *${i + 1}. ${group.subject}*\n` +
                       `> 🆔 ID: ${jid}\n` +
                       `> ⏳ Expired: ${expStr}\n` +
                       `> ⚙️ Setting: ${setStr}\n`;
            });

            let caption = `🏢 *DAFTAR GRUP BOT*\n\n` +
                          `Total: *${activeGroupJids.length}* Grup Aktif\n\n` +
                          `${listItems.join('\n')}\n` +
                          `_Data disinkronkan secara realtime._`;

            await wann.sendMessage(remoteJid, { text: caption.trim() }, { quoted: msg });
            await wann.sendMessage(remoteJid, { react: { text: '✅', key: msg.key } });
        } catch (e) {
            console.error(e);
            await wann.sendMessage(remoteJid, { text: '⚠️ Gagal memuat daftar grup.' }, { quoted: msg });
        }
    }
};