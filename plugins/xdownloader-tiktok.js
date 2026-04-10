const axios = require('axios')

async function api1(url) {
    const { data } = await axios.get(`https://tikwm.com/api/?url=${encodeURIComponent(url)}`)
    if (!data || !data.data) throw 'API1 gagal'
    
    return {
        video: data.data.play,
        images: data.data.images || [], 
        audio: data.data.music || (data.data.music_info ? data.data.music_info.play : null), // Menangkap URL Audio/Lagu
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
        images: [], 
        audio: null, // Fallback API 2 biasanya tidak mengembalikan audio secara terpisah
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

    // 1. Coba API 1 (Mendukung Video, Slide & Audio)
    try {
        result = await api1(text)
    } catch (e) {
        errors.push('API1 mati')
    }

    // 2. Fallback API 2
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

    // 3. Logika Pengiriman Media Visual (Slide vs Video)
    if (result.images && result.images.length > 0) {
        // Proses untuk TikTok Slide / Foto
        for (let i = 0; i < result.images.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 1500)) // Jeda anti-spam WA
            
            let captionText = i === 0 
                ? `📸 *Slide ${i + 1}/${result.images.length}*\n🎬 ${result.title}\n👤 ${result.author}` 
                : `📸 *Slide ${i + 1}/${result.images.length}*`

            await conn.sendMessage(m.chat, {
                image: { url: result.images[i] },
                caption: captionText
            }, { quoted: m })
        }
    } else {
        // Proses untuk TikTok Video Normal
        await conn.sendMessage(m.chat, {
            video: { url: result.video },
            caption: `🎬 ${result.title}\n👤 ${result.author}`
        }, { quoted: m })
    }

    // 4. Logika Pengiriman Audio (Jika Tersedia)
    if (result.audio) {
        // Beri jeda sejenak setelah mengirim video/slide terakhir sebelum mengirim audio
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        await conn.sendMessage(m.chat, {
            audio: { url: result.audio },
            mimetype: 'audio/mp4', // Baileys merender audio/mp4 menjadi voice note / audio player yang rapi
            fileName: `tiktok_audio.mp3`
        }, { quoted: m })
    }
}

handler.help = ['apel']
handler.command = /^(apel)$/i
handler.tags = ['xdownloader']
handler.limit = true 

module.exports = handler