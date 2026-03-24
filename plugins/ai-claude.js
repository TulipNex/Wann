const fs = require('fs')
const path = require('path')
const claude = require('../lib/claude')

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // 1. Validasi Input (Teks wajib ada untuk prompt)
    if (!text) {
        return m.reply(`Masukkan pertanyaan atau prompt yang ingin ditanyakan ke Claude!\n\n*Contoh Text:* \n${usedPrefix + command} Apa itu AI?\n\n*Contoh Gambar (Reply Gambar):*\n${usedPrefix + command} Jelaskan apa yang ada di gambar ini!`)
    }

    // 2. Cek apakah ada pesan yang di-reply atau media yang dikirim langsung (Opsional untuk gambar)
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''
    
    let imagePaths = []
    let tmpPath = ''

    m.reply(global.wait)

    try {
        // 3. Jika input disertai gambar, download dan simpan ke /tmp/
        if (/image/.test(mime)) {
            let media = await q.download()
            let ext = mime.split('/')[1] || 'jpg'
            // Buat file unik sementara
            tmpPath = path.join(process.cwd(), 'tmp', `claude_${Date.now()}.${ext}`)
            fs.writeFileSync(tmpPath, media)
            imagePaths.push(tmpPath)
        }

        // 4. Eksekusi Scraper Claude AI
        let result = await claude(text, imagePaths)

        // 5. Kirim balasan Claude ke pengguna
        m.reply(result)

    } catch (e) {
        console.error("Claude Error:", e)
        m.reply(typeof e === 'string' ? `*Gagal:* ${e}` : global.eror)
    } finally {
        // 6. CLEANUP: Hapus file gambar sementara agar server tidak penuh (mencegah ENOSPC)
        if (tmpPath && fs.existsSync(tmpPath)) {
            fs.unlinkSync(tmpPath)
        }
    }
}

// Metadata Plugin
handler.help = ['claude <prompt>']
handler.tags = ['ai']
handler.command = /^(claude)$/i

// Pembatasan fitur
handler.limit = true // Membutuhkan limit karena API LLM sangat memakan resource
handler.premium = false // Ubah ke true jika fitur ini hanya ingin dikhususkan untuk user premium

module.exports = handler