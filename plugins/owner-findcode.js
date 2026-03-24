const fs = require('fs')
const path = require('path')

let handler = async (m, { text, usedPrefix, command }) => {
    if (!text) return m.reply(`Masukkan potongan kode yang ingin dicari!\n\nContoh penggunaan:\n> ${usedPrefix + command} m.sender.split('@')[0]`)

    // Folder target pencarian (folder plugins)
    let dir = './plugins'
    
    // Membaca seluruh file berakhiran .js di dalam folder plugins
    let files
    try {
        files = fs.readdirSync(dir).filter(file => file.endsWith('.js'))
    } catch (e) {
        return m.reply('❌ Gagal membaca folder plugins.')
    }

    let results = []

    for (let file of files) {
        let filePath = path.join(dir, file)
        let content = fs.readFileSync(filePath, 'utf-8')
        
        // Memecah isi file menjadi baris per baris
        let lines = content.split('\n')
        let foundLines = []

        // Mencari teks di setiap baris
        lines.forEach((line, index) => {
            // Menggunakan includes untuk pencarian string murni (bukan regex)
            if (line.includes(text)) {
                foundLines.push(index + 1) // index + 1 karena baris kode dimulai dari 1
            }
        })

        // Jika ditemukan, masukkan ke dalam daftar hasil
        if (foundLines.length > 0) {
            results.push(`📄 *${file}*\n> Baris: ${foundLines.join(', ')}`)
        }
    }

    if (results.length === 0) {
        return m.reply(`🔍 Kode \`${text}\` tidak ditemukan di dalam folder plugins.`)
    }

    // Menyusun laporan akhir
    let replyText = `🎯 *RADAR KODE SELESAI*\n\nDitemukan kode:\n\`${text}\`\n\nTerdeteksi pada *${results.length} file* berikut:\n\n${results.join('\n\n')}`
    
    m.reply(replyText)
}

handler.help = ['findcode <code>']
handler.tags = ['owner']
handler.command = /^(findcode|carikode)$/i
handler.owner = true

module.exports = handler