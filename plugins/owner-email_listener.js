const imaps = require('imap-simple');
const { simpleParser } = require('mailparser');

let handler = async (m, { conn, command }) => {
    if (command.toLowerCase() === 'cekgmail') {
        return m.reply(`🛡️ *STATUS CCTV EMAIL* 🛡️\n\n✅ Sistem pemantau berjalan di latar belakang.\n✅ Filter Anti-Spam (Mesin Waktu) Aktif.\n📧 Laporan Email masuk akan dikirim ke: *${global.numberowner}*`);
    }
}

// ==========================================
// MESIN PENYADAP EMAIL (BACKGROUND)
// ==========================================
handler.before = async function (m, { conn }) {
    global.email_conn = conn;

    if (!global.email_listener_started) {
        global.email_listener_started = true;
        
        // --- FITUR ANTI SPAM ---
        // Mencatat waktu persis saat bot dinyalakan (dalam milidetik)
        global.email_start_time = Date.now(); 

        // ⚙️ KONFIGURASI GMAIL (MASUKKAN SANDI 16 DIGIT BOSS DI SINI)
        const config = {
            imap: {
                user: 'tulipnexsupport@gmail.com', // Email Boss
                password: 'dwndcpduzwiqgydx', // Ganti dengan 16 digit tanpa spasi!
                host: 'imap.gmail.com',
                port: 993,
                tls: true,
                tlsOptions: { rejectUnauthorized: false },
                authTimeout: 10000
            }
        };

        async function startListener() {
            try {
                let connection = await imaps.connect(config);
                await connection.openBox('INBOX');
                console.log('✅ [Sistem Keamanan] CCTV Email berhasil menembus server Gmail!');

                connection.on('mail', async function (numNewMsgs) {
                    try {
                        // Optimasi Server: Hanya menyuruh Gmail mencari email unread dari 1 hari ke belakang
                        // (Mencegah bot memuat ribuan email lama yang bikin RAM VPS jebol)
                        let d = new Date();
                        d.setDate(d.getDate() - 1);
                        let searchCriteria = ['UNSEEN', ['SINCE', d]]; 
                        
                        let fetchOptions = { bodies: [''], markSeen: true }; 
                        let messages = await connection.search(searchCriteria, fetchOptions);
                        
                        for (let item of messages) {
                            let all = item.parts.find(p => p.which === '').body;
                            let parsed = await simpleParser(all);
                            
                            // =========================================
                            // FILTER WAKTU (ANTI-SPAM ABSOLUT)
                            // =========================================
                            let emailTime = new Date(parsed.date).getTime();
                            
                            // Jika email ini adalah email lama (masuk SEBELUM bot dinyalakan), ABAIKAN!
                            if (emailTime <= global.email_start_time) continue;
                            
                            // Jika lolos, perbarui waktu terakhir agar tidak terkirim dua kali
                            global.email_start_time = emailTime;

                            let pengirim = parsed.from.value[0].address;
                            let subjek = parsed.subject || 'Tidak ada subjek';
                            
                            let isiMentah = parsed.text || parsed.textAsHtml || 'Tidak ada isi teks';
                            let isi = isiMentah.length > 700 ? isiMentah.substring(0, 700) + '... [Teks dipotong]' : isiMentah;
                            
                            let targetOwner = global.numberowner + '@s.whatsapp.net';
                            
                            let pesan = `📧 *EMAIL BARU MASUK* 📧\n\n`;
                            pesan += `👤 *Dari:* ${pengirim}\n`;
                            pesan += `🏷️ *Subjek:* ${subjek}\n\n`;
                            pesan += `*📝 Isi Pesan:*\n\`\`\`${isi.trim()}\`\`\`\n\n`;
                            pesan += `_Diteruskan otomatis oleh Wann Bot_`;

                            if (global.email_conn) {
                                await global.email_conn.sendMessage(targetOwner, { text: pesan });
                            }
                        }
                    } catch (e) {
                        console.error('[CCTV EMAIL ERROR]:', e.message);
                    }
                });

                connection.on('end', () => {
                    console.log('⚠️ [CCTV EMAIL] Terputus dari server Gmail. Sistem merestart...');
                    global.email_listener_started = false; 
                });

            } catch (e) {
                console.log('❌ [CCTV EMAIL GAGAL LOGIN]:', e.message);
                global.email_listener_started = false; 
            }
        }

        startListener();
    }
}

// ==========================================
// KONFIGURASI PLUGIN
// ==========================================
handler.help = ['cekgmail']
handler.tags = ['asisten']
handler.command = /^(cekgmail)$/i
handler.owner = true 

module.exports = handler;