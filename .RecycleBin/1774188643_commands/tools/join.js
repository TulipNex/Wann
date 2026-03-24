// File: commands/tools/join.js (Format: JavaScript)
let linkRegex = /chat.whatsapp.com\/([0-9A-Za-z]{20,24})/i

module.exports = {
    name: 'join',
    aliases: ['gabung'],
    category: 'tools',
    description: 'Bot bergabung ke grup melalui link undangan',
    premium: true,
    execute: async (wann, msg, args) => {
        const remoteJid = msg.key.remoteJid;
        const text = args.join(' ');
        
        let [_, code] = text.match(linkRegex) || []
        if (!code) return wann.sendMessage(remoteJid, { text: '⚠️ Link invalid! Masukkan link undangan grup WhatsApp yang benar.' }, { quoted: msg });
        
        await wann.sendMessage(remoteJid, { react: { text: '🔄', key: msg.key } })

        try {
            let res = await wann.groupAcceptInvite(code)
            let groupName = res; 
            
            try {
                let metadata = await wann.groupMetadata(res)
                if (metadata && metadata.subject) groupName = metadata.subject
            } catch (err) {
                console.log("Gagal mengambil metadata grup setelah join.")
            }

            await wann.sendMessage(remoteJid, { text: `✅ *BERHASIL JOIN*\n\n> 🏢 *Grup:* ${groupName}\n> 🆔 *ID:* ${res}` }, { quoted: msg });
            await wann.sendMessage(remoteJid, { react: { text: '✅', key: msg.key } })

        } catch (e) {
            console.error(e)
            await wann.sendMessage(remoteJid, { text: '❌ *Gagal bergabung!*\n\n> Kemungkinan link sudah di-reset, grup penuh, atau bot pernah di-kick dari grup tersebut.' }, { quoted: msg });
            await wann.sendMessage(remoteJid, { react: { text: '❌', key: msg.key } })
        }
    }
};