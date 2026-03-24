```javascript
const axios = require('axios')
const fs = require('fs')
const path = require('path')

global.mitra_session = global.mitra_session || {}
global.mitra_auto_ai = global.mitra_auto_ai || {}

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let input = text ? text.trim() : m.text.trim()
    let cmd = input.toLowerCase()
    
    if (cmd === 'on' || cmd === 'enable') {
        global.mitra_auto_ai[m.sender] = true
        return m.reply("✅ *AI Mitra AKTIF!*\n\nSekarang Wann akan otomatis membalas *hanya jika kamu me-reply* pesannya.")
    }
    
    if (cmd === 'off' || cmd === 'disable') {
        delete global.mitra_auto_ai[m.sender]
        return m.reply("❌ *Auto AI Mitra MATI!*\n\nWann tidak akan merespons otomatis (walaupun di-reply), kecuali kamu memanggilnya dengan perintah `.mitra <pertanyaan>`.")
    }

    if (cmd === 'reset') {
        global.mitra_session[m.sender] = []
        return m.reply("✅ Sesi memori percakapan telah direset, Boss!")
    }

    if (!input) {
        return m.reply(
            `💬 *Halo Boss! Ada yang bisa Wann bantu?*\n\n` +
            `*Kontrol AI:*\n` +
            `> \`${usedPrefix + command} on\` : Nyalakan respons otomatis (via Reply)\n` +
            `> \`${usedPrefix + command} off\` : Matikan respons otomatis\n` +
            `> \`${usedPrefix + command} reset\` : Hapus ingatan chat`
        )
    }

    await conn.sendMessage(m.chat, { react: { text: '🤔', key: m.key } })

    try {
        // ==========================================
        // 🔑 MASUKKAN API KEY GEMINI BOSS DI SINI
        // ==========================================
        const API_KEY = 'AIzaSyDmrHqL_m9OMmknG26yKPKF_Tffq5IWumA' 

        // 1. MENGAMBIL DATABASE USER & WAKTU
        let userDb = global.db.data.users[m.sender] || {};
        let nowMs = Date.now();
        let tzOpt = { timeZone: "Asia/Makassar", dateStyle: "full", timeStyle: "short" };
        let waktuSekarang = new Date(nowMs).toLocaleString("id-ID", tzOpt);

        let pengingat = userDb.pengingat || [];
        let teksPengingat = "Saat ini User TIDAK memiliki jadwal pengingat.";

        if (pengingat.length > 0) {
            teksPengingat = "Berikut adalah daftar jadwal User saat ini:\n";
            pengingat.forEach((p, i) => {
                let dateStr = new Date(p.waktu).toLocaleString("id-ID", tzOpt);
                let status = p.status === 0 ? 'Aktif' : 'Sudah lewat';
                teksPengingat += `${i + 1}. Pesan: "${p.pesan}" | Waktu: ${dateStr} WITA | Status: ${status}\n`;
            });
        }

        let infoProfil = userDb.registered ? `Nama Panggilan: ${userDb.name}\nUmur: ${userDb.age} tahun.` : `User belum mendaftar di database.`;

        // 2. SCANNER PLUGIN COMPRESSED
        let daftarFitur = "Kemampuan bot (gunakan prefix): ";
        try {
            let pluginFolder = path.join(__dirname, '../plugins');
            if (fs.existsSync(pluginFolder)) {
                let files = fs.readdirSync(pluginFolder).filter(v => v.endsWith('.js'));
                let cmdList = [];
                for (let file of files) {
                    try {
                        let code = fs.readFileSync(path.join(pluginFolder, file), 'utf-8');
                        let helpMatch = code.match(/handler\.help\s*=\s*\[(.*?)\]/s);
                        if (helpMatch) {
                            let cmds = helpMatch[1].replace(/['"\n\r\t]/g, '').split(',').map(v => v.trim()).filter(v => v);
                            if (cmds.length > 0) cmdList.push(cmds.join(', '));
                        }
                    } catch (err) { continue; } 
                }
                let gabungan = cmdList.join(' | ');
                if (gabungan.length > 1500) gabungan = gabungan.substring(0, 1500) + " ... (dan fitur lainnya)";
                daftarFitur += gabungan;
            }
        } catch (e) {
            daftarFitur += "Gagal memindai.";
        }

        // 3. MEMBACA FILE PERSONA.TXT
        let filePersona = path.join(__dirname, '../persona.txt');
        let systemPrompt = "";
        try {
            let teksMentah = fs.readFileSync(filePersona, 'utf-8');
            systemPrompt = teksMentah.split('{WAKTU_SEKARANG}').join(waktuSekarang).split('{TEKS_PENGINGAT}').join(teksPengingat);
            systemPrompt += `\n\n[INFO USER]:\n${infoProfil}\n\n[KEMAMPUAN BOT]:\nKamu mengetahui fitur berikut: ${daftarFitur}. Pandu user jika mereka bertanya.`;
            if (m.isGroup) systemPrompt += `\n\n[LOKASI]: Obrolan di Grup WhatsApp.`;
        } catch (err) {
            systemPrompt = `Waktu: ${waktuSekarang} WITA. ${teksPengingat}\n\n[INFO USER]:\n${infoProfil}\n\n[KEMAMPUAN]:\n${daftarFitur}`;
        }

        // 4. MANAJEMEN MEMORI SESI GEMINI
        if (!global.mitra_session[m.sender]) global.mitra_session[m.sender] = []
        let sejarah = global.mitra_session[m.sender]

        let geminiHistory = sejarah.map(chat => ({
            role: chat.role === 'User' ? 'user' : 'model',
            parts: [{ text: chat.content }]
        }))

        // 5. RADAR MODEL & SISTEM AUTO-FALLBACK
        let checkUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`
        let { data: modelData } = await axios.get(checkUrl)

        let availableModels = modelData.models.filter(m => 
            m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent')
        )

        // Urutan prioritas model yang akan dicoba satu per satu
        let prioritasModel = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.0-pro'];
        
        let textResponse = '';
        let modelYangBerhasil = '';
        let berhasil = false;

        const payload = {
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents: [...geminiHistory, { role: 'user', parts: [{ text: input }] }],
            tools: [{ googleSearch: {} }] // Fitur Internet
        };

        // LOOPING: Mencoba model dari yang paling canggih sampai yang berhasil
        for (let namaModel of prioritasModel) {
            let target = availableModels.find(m => m.name.includes(namaModel));
            if (!target) continue;

            try {
                const url = `https://generativelanguage.googleapis.com/v1beta/${target.name}:generateContent?key=${API_KEY}`;
                const response = await axios.post(url, payload, {
                    headers: { 'Content-Type': 'application/json' }
                });

                if (response.data && response.data.candidates) {
                    textResponse = response.data.candidates[0].content.parts[0].text;
                    modelYangBerhasil = target.name.replace('models/', '');
                    berhasil = true;
                    break; // SUKSES! Langsung keluar dari loop pencarian
                }
            } catch (err) {
                let errCode = err.response && err.response.data && err.response.data.error ? err.response.data.error.code : 500;
                
                // Jika error 429 (Limit Kuota RPD/RPM), lanjut ke model berikutnya di urutan
                if (errCode === 429) {
                    console.log(`[Auto-Fallback] ${target.name} terkena limit harian. Beralih ke model cadangan...`);
                    continue; 
                } else {
                    // Jika error lain (seperti Tools tidak didukung), lempar errornya agar terdeteksi
                    throw err;
                }
            }
        }

        // Jika semua model di dalam daftar sudah dicoba dan semuanya limit
        if (!berhasil) {
            return m.reply(`⏳ *Limit Global Tercapai!*\n\n> Semua generasi otak AI sedang kehabisan kuota saat ini. Mohon tunggu beberapa saat lagi ya, Boss.`);
        }

        // 6. OUTPUT & PENYIMPANAN MEMORI
        // Melucuti bintang dan pagar agar terlihat santai
        let cleanText = textResponse.replace(/\*/g, '').replace(/#/g, '').trim();

        // (Opsional) Menampilkan indikator model yang terpakai di akhir pesan untuk memantau sistem fallback
        let finalOutput = `${cleanText}\n\n_— Wann (via ${modelYangBerhasil})_`;

        await m.reply(finalOutput);

        // Simpan memori
        sejarah.push({ role: 'User', content: input });
        sejarah.push({ role: 'Assistant', content: cleanText });

        if (sejarah.length > 10) sejarah.shift();

        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error(e.response ? e.response.data : e.message)
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
        
        let errMsg = e.response && e.response.data && e.response.data.error ? e.response.data.error.message : e.message;
        
        if (errMsg.includes('googleSearch')) {
             m.reply(`⚠️ *Fitur Live Search Diblokir*\n\n> Sepertinya model fallback yang terpilih tidak mendukung fitur Search Grounding di region ini.`);
        } else {
             m.reply(`⚠️ Maaf Boss, otak AI sedang mengalami gangguan koneksi. (Detail: ${errMsg})`);
        }
    }
}

handler.help = ['mitra on/off', 'mitra reset']
handler.tags = ['ai']
handler.command = /^(mitra|wann)$/i 

handler.before = async (m, { conn }) => {
    if (!m.text || /^[./!#]/.test(m.text)) return
    if (m.isBaileys || m.fromMe) return

    global.mitra_auto_ai = global.mitra_auto_ai || {}
    let isAutoOn = global.mitra_auto_ai[m.sender]
    if (!isAutoOn) return

    let isReplyBot = m.quoted && m.quoted.fromMe && m.quoted.text
    if (!isReplyBot) return

    return handler(m, { conn, text: m.text, usedPrefix: '.', command: 'mitra' })
}

module.exports = handler
```