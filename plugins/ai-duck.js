const { DuckAIClient, Conversation, MODELS } = require('../lib/duck.js');

// Menyimpan memori percakapan untuk setiap user
global.duck_session = global.duck_session || {};

// Inisialisasi Klien Scraper DuckAI
const duckClient = new DuckAIClient({ useTools: false }); // useTools: true agar bisa mencari berita jika dibutuhkan

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let input = text || m.text;

    // Fitur Reset Memori
    if (input === 'reset') {
        if (global.duck_session[m.sender]) {
            global.duck_session[m.sender].reset();
        }
        return m.reply("✅ Memori percakapan DuckAI telah direset.");
    }

    if (!input) {
        return m.reply(`💬 *DuckAI Chat*\n\nKetik pesan Anda!\nContoh: *${usedPrefix + command} halo, siapa kamu?*\nKetik *${usedPrefix + command} reset* untuk menghapus riwayat chat.`);
    }

    await conn.sendMessage(m.chat, { react: { text: '🦆', key: m.key } });

    try {
        // Buat sesi percakapan jika user belum punya
        if (!global.duck_session[m.sender]) {
            // Pilihan Model: GPT4O_MINI, CLAUDE_HAIKU, LLAMA_33_70B, MIXTRAL_8X7B
            global.duck_session[m.sender] = new Conversation({ 
                model: MODELS.CLAUDE_HAIKU,
                systemPrompt: "Kamu adalah asisten cerdas dan interaktif. Jawablah menggunakan bahasa Indonesia yang baik."
            });
        }

        let conv = global.duck_session[m.sender];

        // Kirim chat ke API DuckAI
        let result = await duckClient.chat(input, conv);

        // ==========================================
        // SISTEM DEBUGGING (Cek di Terminal/Console)
        // ==========================================
        console.log("\n=== HASIL DUCK AI ===");
        console.log(JSON.stringify(result, null, 2));
        console.log("=====================\n");

        if (result.meta.status === 'success') {
            let balasan = result.response.content;

            // Jika balasan ternyata kosong/blank (Terkena Limit / Anti-Bot)
            if (!balasan || balasan.trim() === '') {
                // Hapus pertanyaan user terakhir dari memori agar sesi tidak berantakan
                if (conv.messages.length > 0) conv.messages.pop(); 
                
                await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } });
                return m.reply(
                    `⚠️ *DuckAI merespons dengan teks kosong.*\n\n` +
                    `> Kemungkinan server DuckDuckGo sedang sibuk atau membatasi akses bot kita. ` +
                    `Silakan cek log terminal di panel untuk melihat penyebab aslinya.`
                );
            }

            // Jika berhasil, kirim balasan ke WhatsApp
            await m.reply(balasan);
            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
            
        } else {
            // Hapus pertanyaan user jika gagal agar memori tetap bersih
            if (conv.messages.length > 0) conv.messages.pop();
            throw result.response.error || new Error("Gagal mendapatkan respons dari API.");
        }

    } catch (e) {
        console.error('Error DuckAI:', e);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        m.reply(`⚠️ Maaf Boss, DuckAI sedang bermasalah:\n\n> ${e.message}`);
    }
}

handler.help = ['duckai <teks>', 'duckai reset'];
handler.tags = ['ai'];
handler.command = /^(duck|duckai)$/i;

module.exports = handler;