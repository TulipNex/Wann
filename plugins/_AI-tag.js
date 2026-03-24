const axios = require('axios');
const fs = require('fs');
const path = require('path');

let handler = async (m, { conn, text, command }) => {
// kosong
};

handler.before = async (m, { conn }) => {
    try {
        if (!m.isGroup) return; // Hanya aktif di grup
        
        conn.selfai = conn.selfai || {};
        conn.aiLock = conn.aiLock || {}; // 🛡️ Gembok Anti-Spam (Baru)

        if (m.isBaileys && m.fromMe) return;

        if (m.mentionedJid && m.mentionedJid.length > 0) {
            const botNumber = conn.user.jid.split('@')[0];
            
            const isMention = m.mentionedJid.some(mentioned => 
                mentioned.includes(botNumber)
            );
            
            if (isMention) {
                const filter = m.text.replace(/@\d+/g, '').trim();
                
                // 1. FITUR RESET
                if (filter.toLowerCase() === '/reset') {
                    delete conn.selfai[m.sender];
                    await m.reply('✅ Session chat AI untukmu di grup ini berhasil direset.');
                    return true;
                }
                
                // 2. FITUR PEMBUAT GAMBAR (/imagine)
                if (filter.toLowerCase().startsWith('/imagine')) {
                    const imagePrompt = filter.replace('/imagine', '').trim();
                    if (!imagePrompt) {
                        await m.reply('Silakan berikan deskripsi gambar yang ingin dibuat.\n*Contoh:* @Wann /imagine kucing terbang');
                        return true;
                    }

                    try {
                        await conn.sendPresenceUpdate('composing', m.chat);
                        const response = await axios.get(`https://api.botcahx.eu.org/api/search/openai-image?apikey=${global.btc}&text=${encodeURIComponent(imagePrompt)}`, {
                            responseType: 'arraybuffer'
                        });
                        
                        const image = response.data;
                        await conn.sendFile(m.chat, image, 'aiimg.jpg', `🎨 *Hasil Gambar:* ${imagePrompt}`, m);
                    } catch (error) {
                        console.error(error);
                        await m.reply('❌ Terjadi kesalahan saat membuat gambar. Mohon coba lagi.');
                    }
                    return true;
                }

                await conn.sendPresenceUpdate('composing', m.chat);
                
                // 3. FITUR SAPAAN KOSONG
                if (!filter) {
                    const empty_response = [
                        `Ada yang bisa saya bantu, ${m.name}?`,
                        `Hai ${m.name}, silakan beritahu saya apa yang Anda butuhkan.`,
                        `${m.name}, saya siap membantu. Ada pertanyaan?`,
                        `Apa yang ingin kamu diskusikan, ${m.name}?`
                    ];
                    
                    const _response_pattern = empty_response[Math.floor(Math.random() * empty_response.length)];
                    await m.reply(_response_pattern);
                    return true;
                }

                // Jangan respon jika pesan diawali prefix bot
                if ([".", "#", "!", "/", "\\"].some(prefix => filter.startsWith(prefix))) return;

                // 🛡️ AKTIFKAN GEMBOK ANTI-SPAM
                if (conn.aiLock[m.sender]) return true; 
                conn.aiLock[m.sender] = true;

                try {
                    if (!conn.selfai[m.sender]) {
                        conn.selfai[m.sender] = { sessionChat: [] };
                    }
                    
                    const previousMessages = conn.selfai[m.sender].sessionChat || [];

                    // ==========================================
                    // 🧠 UPGRADE 1: MENGAMBIL DATABASE USER 
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
                    // 🧠 UPGRADE 2: MEMBACA PERSONA DARI FILE .TXT
                    // ==========================================
                    let filePersona = path.join(process.cwd(), 'persona.txt');
                    let systemPrompt = "";

                    try {
                        let teksMentah = fs.readFileSync(filePersona, 'utf-8');
                        systemPrompt = teksMentah
                            .split('{WAKTU_SEKARANG}').join(waktuSekarang)
                            .split('{TEKS_PENGINGAT}').join(teksPengingat);
                        
                        systemPrompt += `\n\n[INFORMASI PROFIL USER YANG MENGOBROL DENGANMU SAAT INI]:\n${infoProfil}`;
                        
                        // Konteks Grup: Beri tahu AI bahwa ia sedang berada di dalam grup
                        systemPrompt += `\n\n[INFO LOKASI CHAT]: Saat ini kamu sedang mengobrol di dalam sebuah Grup WhatsApp, bukan di private chat. Berbaurlah dengan santai.`;
                    } catch (err) {
                        systemPrompt = `Kamu Wann. Waktu: ${waktuSekarang} WITA. ${teksPengingat}\n\n[INFO PROFIL USER]:\n${infoProfil}`;
                    }

                    // ==========================================
                    // 🧠 UPGRADE 3: TRIK BISIKAN WAKTU
                    // ==========================================
                    let pesanUserPlusInjeksi = `[Info Rahasia: Saat ini adalah ${waktuSekarang} WITA]\n\n${filter}`;

                    const messages = [
                        { role: "system", content: systemPrompt },
                        { role: "assistant", content: `Saya Wann! Ada yang bisa saya bantu hari ini?` },
                        ...previousMessages.map((msg, i) => ({ role: i % 2 === 0 ? 'user' : 'assistant', content: msg })),
                        { role: "user", content: pesanUserPlusInjeksi }
                    ];
                    
                    const chat = async function(message) {
                        return new Promise(async (resolve, reject) => {
                            try {
                                const params = {
                                    message: message,
                                    apikey: global.btc // Memastikan apikey ditarik dari global
                                };
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
                        
                        // Simpan teks 'filter' (tanpa tag info rahasia) ke dalam riwayat
                        conn.selfai[m.sender].sessionChat = [
                            ...conn.selfai[m.sender].sessionChat,
                            filter,
                            res.result
                        ];
                    } else {
                        m.reply("⚠️ Maaf, Wann sedang kesulitan mengambil data. Silakan balas pesan ini dengan /reset untuk memulai ulang sesi.");
                    }
                } catch (e) {
                    console.error(e);
                    m.reply("❌ Terjadi kesalahan dalam memproses permintaan AI.");
                } finally {
                    // 🔓 BUKA GEMBOK ANTI-SPAM
                    delete conn.aiLock[m.sender];
                }
                return true;
            }
        }
        return true;
    } catch (error) {
        console.error(error);
        return true;
    }
};

module.exports = handler;