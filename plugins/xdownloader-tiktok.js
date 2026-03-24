const axios = require('axios')

async function api1(url) {
    const { data } = await axios.get(`https://tikwm.com/api/?url=${encodeURIComponent(url)}`)
    if (!data || !data.data) throw 'API1 gagal'
    return {
        video: data.data.play,
        title: data.data.title,
        author: data.data.author.nickname
    }
}

async function api2(url) {
    const { data } = await axios.get(`https://ttdownloader.com/req/`, {
        params: { url }
    })
    if (!data) throw 'API2 gagal'
    return {
        video: data.video,
        title: "TikTok Video",
        author: "Unknown"
    }
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) throw `Masukan URL!\n\ncontoh:\n${usedPrefix + command} https://vt.tiktok.com/...`

    if (!/tiktok|douyin/i.test(text)) throw `URL tidak valid`

    m.reply('⏳ Lagi diproses...')

    let result
    let errors = []

    // coba API 1
    try {
        result = await api1(text)
    } catch (e) {
        errors.push('API1 mati')
    }

    // fallback API 2
    if (!result) {
        try {
            result = await api2(text)
        } catch (e) {
            errors.push('API2 mati')
        }
    }

    if (!result) {
        throw `Semua API gagal:\n${errors.join('\n')}`
    }

    await conn.sendMessage(m.chat, {
        video: { url: result.video },
        caption: `🎬 ${result.title}\n👤 ${result.author}`
    }, { quoted: m })
}

handler.help = ['apel']
handler.command = /^(apel)$/i
handler.tags = ['downloader']

module.exports = handler