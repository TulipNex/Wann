const igdl = require("../lib/instagram")

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) throw `Masukan URL!\n\ncontoh:\n${usedPrefix + command} https://instagram.com/...`

    if (!/instagram\.com/.test(text)) throw "URL tidak valid"

    m.reply("⏳ Lagi diproses...")

    try {
        const media = await igdl(text)

        for (let item of media) {
            if (item.type === "video") {
                await conn.sendMessage(m.chat, {
                    video: { url: item.url }
                }, { quoted: m })
            } else {
                await conn.sendMessage(m.chat, {
                    image: { url: item.url }
                }, { quoted: m })
            }
        }

    } catch (e) {
        m.reply("Gagal ambil media:\n" + e.message)
    }
}

handler.help = ['melon']
handler.command = /^(melon)$/i
handler.tags = ['downloader']

module.exports = handler