let axios = require('axios');
let fs = require('fs');
let path = require('path');

// ==========================================
// FITUR PENGAKTIFAN (AUTO AI)
// ==========================================
let handler = async (m, { conn, text, usedPrefix, command }) => {
    conn.sessionAI = conn.sessionAI || {};
    if (!text) throw `🚩 ${usedPrefix + command} *enable/disable*`;
    
    if (text === "enable") {
        conn.sessionAI[m.sender] = { sessionChat: [] };
        m.reply("✅ Sesi obrolan Auto-AI berhasil diaktifkan untukmu!");
    } else if (text === "disable") {
        delete conn.sessionAI[m.sender];
        m.reply("✅ Sesi obrolan Auto-AI berhasil dimatikan.");
    }
};

// ==========================================
// LOGIKA UTAMA DI BELAKANG LAYAR (AUTO AI)
// ==========================================
handler.before = async (m, { conn }) => {
    conn.sessionAI = conn.sessionAI || {};
    conn.aiLock = conn.aiLock || {}; 

    // 1. Abaikan pesan dari bot sendiri atau jika tidak ada teks
    if (m.isBaileys && m.fromMe) return;
    if (!m.text) return;
    
    // 2. Abaikan jika user belum mengaktifkan .autoai enable
    if (!conn.sessionAI[m.sender]) return;
    
    // 3. Abaikan jika pesan diawali prefix (perintah bot biasa)
    if ([".", "#", "!", "/", "\\"].some(prefix => m.text.startsWith(prefix))) return;

    // ==========================================
    // 🛡️ SENSOR PENDETEKSI TAG (SOLUSI BUG GANDA)
    // ==========================================
    let botNumber = conn.user.jid ? conn.user.jid.split('@')[0] : '';
    let isMentioningBot = m.mentionedJid && m.mentionedJid.some(jid => jid.includes(botNumber));
    
    // Jika user menge-tag bot, Auto AI MUNDUR dan biarkan _selfai.js (Mention AI) yang merespons
    if (isMentioningBot) return; 
    // ==========================================

    if (conn.sessionAI[m.sender] && m.text) {    
        // 🛡️ GEMBOK ANTI-SPAM (Mencegah bot crash jika di-spam)
        if (conn.aiLock[m.sender]) return; 
        conn.aiLock[m.sender] = true;

        try {
            const previousMessages = conn.sessionAI[m.sender].sessionChat || [];

            // ==========================================
            // 🧠 MENGAMBIL DATABASE USER (Jadwal & Profil)
            // ==========================================
            let userDb = global.db.data.users[m.sender] || {};
            
            // A. Data Waktu & Pengingat
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

            // B. Data Profil (Nama & Umur)
            let infoProfil = "";
            if (userDb.registered) {
                infoProfil = `Nama Panggilan: ${userDb.name}\nUmur: ${userDb.age} tahun.`;
            } else {
                infoProfil = `User ini belum mendaftar di database bot. Kamu belum mengetahui nama dan umurnya.`;
            }

            // ==========================================
            // 🧠 MEMBACA PERSONA DARI DOKUMEN .TXT
            // ==========================================
            let filePersona = path.join(process.cwd(), 'persona.txt');
            let systemPrompt = "";

            try {
                let teksMentah = fs.readFileSync(filePersona, 'utf-8');
                systemPrompt = teksMentah
                    .split('{WAKTU_SEKARANG}').join(waktuSekarang)
                    .split('{TEKS_PENGINGAT}').join(teksPengingat);
                
                systemPrompt += `\n\n[INFORMASI PROFIL USER YANG SEDANG CHAT DENGANMU]:\n${infoProfil}`;
                if (m.isGroup) {
                    systemPrompt += `\n\n[INFO LOKASI CHAT]: Saat ini kamu sedang mengobrol santai di dalam sebuah Grup WhatsApp.`;
                }
            } catch (err) {
                systemPrompt = `Kamu Wann. Waktu: ${waktuSekarang} WITA. ${teksPengingat}\n\n[INFO PROFIL USER]:\n${infoProfil}`;
            }

            // ==========================================
            // 🧠 TRIK BISIKAN WAKTU (Mencegah AI Halusinasi Jam)
            // ==========================================
            let pesanUserPlusInjeksi = `[Info Rahasia: Saat ini adalah ${waktuSekarang} WITA]\n\n${m.text}`;

            const messages = [
                { role: "system", content: systemPrompt },
                { role: "assistant", content: `Saya Wann! Ada yang bisa saya bantu hari ini?` },
                ...previousMessages.map((msg, i) => ({ role: i % 2 === 0 ? 'user' : 'assistant', content: msg })),
                { role: "user", content: pesanUserPlusInjeksi } 
            ];

            const chat = async function(message) {
                return new Promise(async (resolve, reject) => {
                    try {
                        const params = { message: message, apikey: global.btc };
                        const { data } = await axios.post('https://api.botcahx.eu.org/api/search/openai-custom', params);
                        resolve(data);
                    } catch (error) {
                        reject(error);
                    }
                });
            };

            let res = await chat(messages);
            if (res && res.result) {
                await m.reply(res.result);
                
                // Simpan teks asli (m.text) ke memori, bukan teks yang ada injeksi waktunya
                conn.sessionAI[m.sender].sessionChat = [
                    ...conn.sessionAI[m.sender].sessionChat, m.text, res.result
                ];
            } else {
                m.reply("⚠️ Maaf, Wann sedang kesulitan mengambil data saat ini.");
            }
        } catch (e) {
            console.error(e);
            m.reply("❌ Terjadi kesalahan pada sistem AI Wann.");
        } finally {
            // 🔓 BUKA GEMBOK ANTI-SPAM
            delete conn.aiLock[m.sender];
        }
    }
};

handler.command = ['autoai'];
handler.tags = ['ai'];
handler.help = ['autoai *enable/disable*'];
handler.limit = true;

module.exports = handler;