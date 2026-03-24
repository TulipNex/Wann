```javascript
const axios = require('axios')

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(
        `🌐 *AI GEMINI (NEXT-GEN)*\n\n` +
        `Tanyakan apa saja! AI ini menggunakan mesin terbaru.\n\n` +
        `*Contoh:*\n> ${usedPrefix + command} Siapa presiden Indonesia saat ini?`
    )

    await conn.sendMessage(m.chat, { react: { text: '🔍', key: m.key } })

    try {
        // ==========================================
        // 🔑 MASUKKAN API KEY GEMINI BOSS DI SINI
        // ==========================================
        const API_KEY = 'AIzaSyDmrHqL_m9OMmknG26yKPKF_Tffq5IWumA' 

        // 1. Radar Pendeteksi Model (Target: Gemini 2.5 / 2.0)
        let checkUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`
        let { data: modelData } = await axios.get(checkUrl)

        let availableModels = modelData.models.filter(m => 
            m.supportedGenerationMethods && 
            m.supportedGenerationMethods.includes('generateContent')
        )

        // PRIORITAS BARU: Mengincar model 2.5 atau 2.0 sesuai dashboard Boss
        let targetModel = availableModels.find(m => m.name.includes('gemini-2.5-flash')) ||
                          availableModels.find(m => m.name.includes('gemini-2.0-flash')) ||
                          availableModels.find(m => m.name.includes('gemini-1.5-flash')) ||
                          availableModels.find(m => m.name.includes('flash'))

        if (!targetModel) {
            return m.reply(`❌ *Akses Ditolak!*\n\n> API Key Boss tidak memiliki akses ke model teks.`)
        }

        let namaModelDipilih = targetModel.name 

        // 2. Eksekusi Penembakan Data ke v1beta
        const url = `https://generativelanguage.googleapis.com/v1beta/${namaModelDipilih}:generateContent?key=${API_KEY}`

        const payload = {
            contents: [{
                parts: [{ 
                    text: `Kamu adalah asisten AI dengan wawasan modern. Jika dibutuhkan, gunakan Google Search untuk memberikan fakta terbaru hari ini. Pertanyaan: ${text}` 
                }]
            }],
            tools: [
                { googleSearch: {} } // Fitur Internet Aktif
            ]
        }

        const response = await axios.post(url, payload, {
            headers: { 'Content-Type': 'application/json' }
        })

        let textResponse = response.data.candidates[0].content.parts[0].text

        let namaBersih = namaModelDipilih.replace('models/', '')
        let hasil = `🌐 *GEMINI LIVE SEARCH* (_via ${namaBersih}_)\n`
        hasil += `────────────────────\n\n`
        hasil += textResponse.trim()

        await m.reply(hasil)
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

    } catch (e) {
        console.error(e.response ? e.response.data : e.message)
        
        let errCode = e.response && e.response.data && e.response.data.error ? e.response.data.error.code : 500
        let errMsg = e.response && e.response.data && e.response.data.error ? e.response.data.error.message : e.message

        if (errCode === 429) {
            return m.reply(`⏳ *Limit API Tercapai!*\n\n> Dari dashboard, limit Boss adalah 15 Request Per Menit. Tunggu sebentar ya.`)
        }

        // Jika error masih gara-gara tools search, bot akan memberitahu
        if (errMsg.includes('googleSearch')) {
            return m.reply(`⚠️ *Fitur Live Search Tidak Didukung*\n\n> Model sudah menggunakan generasi terbaru, tapi server masih memblokir Search Grounding.`)
        }

        m.reply(`❌ *Gagal Terhubung!*\n\n> Detail Error: ${errMsg}`)
    }
}

handler.help = ['ask <pertanyaan>']
handler.tags = ['ai']
handler.command = /^(ask|tanya)$/i

module.exports = handler
```