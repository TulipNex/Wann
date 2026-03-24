let didyoumean = require('didyoumean')
let similarity = require('similarity')

let handler = m => m

handler.before = function (m, { conn, match, usedPrefix }) {
    if ((usedPrefix = (match[0] || '')[0])) {
        let commandOnly = m.text.replace(usedPrefix, '').trim().split(' ')[0].toLowerCase()
        if (!commandOnly) return

        let validAliases = []
        let helpList = [] 

        // ==========================================
        // 1. KUMPULKAN SEMUA VARIASI PERINTAH (KAMUS)
        // ==========================================
        for (let name in global.plugins) {
            let plugin = global.plugins[name]
            if (!plugin || plugin.disabled) continue

            // Ambil dari handler.help
            if (plugin.help) {
                let helps = Array.isArray(plugin.help) ? plugin.help : [plugin.help]
                helps.forEach(h => {
                    let cleanHelp = h.split(' ')[0].toLowerCase()
                    validAliases.push(cleanHelp)
                    helpList.push(cleanHelp)
                })
            }

            // Ambil dari handler.command
            if (plugin.command) {
                let cmds = Array.isArray(plugin.command) ? plugin.command : [plugin.command]
                cmds.forEach(c => {
                    if (typeof c === 'string') {
                        validAliases.push(c.toLowerCase())
                    } else if (c instanceof RegExp) {
                        let str = c.toString()
                        str = str.replace(/^\/\^?\(/, '').replace(/^\/\^?/, '')
                        str = str.replace(/\)\$?\/[a-z]*$/i, '').replace(/\$?\/[a-z]*$/i, '')
                        
                        let parts = str.split('|')
                        parts.forEach(p => {
                            let clean = p.replace(/\\/g, '').trim().toLowerCase()
                            if (clean && !clean.includes('*') && !clean.includes('?')) {
                                validAliases.push(clean)
                            }
                        })
                    }
                })
            }
        }

        // ==========================================
        // 2. CEK APAKAH PERINTAH VALID
        // ==========================================
        if (validAliases.includes(commandOnly)) return

        // ==========================================
        // 3. LOGIKA "PERINTAH TIDAK DITEMUKAN" & TYPO
        // ==========================================
        
        helpList = [...new Set(helpList)]

        let mean = didyoumean(commandOnly, helpList)
        let sim = mean ? similarity(commandOnly, mean) : 0
        let som = sim * 100

        // ==========================================
        // PERBAIKAN: FORMAT MENTION SESUAI TAGME.JS
        // ==========================================
        let tag = `@${m.sender.replace(/@.+/, '')}` // Membuat teks @628xxx
        let mentionedJid = [m.sender] // Memasukkan ID kontak untuk didaftarkan

        let teks = `❌ *Perintah Tidak Ditemukan!*\n\nMaaf Kak ${tag}, menu *${usedPrefix + commandOnly}* tidak tersedia di dalam sistem.`

        if (mean && som >= 60) {
            teks += `\n\n*Apakah yang Anda maksud:*\n> ◦ \`${usedPrefix + mean}\`\n> ◦ Kemiripan: ${parseInt(som)}%`
        }

        // Eksekusi kirim menggunakan conn.reply dan contextInfo
        conn.reply(m.chat, teks, m, { contextInfo: { mentionedJid } })
    }
}

module.exports = handler