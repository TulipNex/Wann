const axios = require('axios');
const cheerio = require('cheerio');

const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    Origin: 'https://savett.cc',
    Referer: 'https://savett.cc/en1/download',
    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36'
};

async function getToken() {
    const res = await axios.get('https://savett.cc/en1/download');
    return {
        csrf: res.data.match(/name="csrf_token" value="([^"]+)"/)?.[1],
        cookie: res.headers['set-cookie'].map(v => v.split(';')[0]).join('; ')
    };
}

async function fetchTikTok(url, csrf, cookie) {
    const res = await axios.post(
        'https://savett.cc/en1/download',
        `csrf_token=${encodeURIComponent(csrf)}&url=${encodeURIComponent(url)}`,
        { headers: { ...headers, Cookie: cookie } }
    );
    return res.data;
}

function parseResponse(html) {
    const $ = cheerio.load(html);

    const stats = [];
    $('#video-info .my-1 span').each((_, el) => {
        stats.push($(el).text().trim());
    });

    const data = {
        username: $('#video-info h3').first().text().trim(),
        views: stats[0] || null,
        likes: stats[1] || null,
        bookmarks: stats[2] || null,
        comments: stats[3] || null,
        shares: stats[4] || null,
        duration: $('#video-info p.text-muted').first().text().replace(/Duration:/i, '').trim() || null,
        type: null,
        downloads: { nowm: [], wm: [] },
        mp3: [],
        slides: []
    };

    const slides = $('.carousel-item[data-data]');

    if (slides.length) {
        data.type = 'photo';
        slides.each((_, el) => {
            try {
                const json = JSON.parse($(el).attr('data-data').replace(/&quot;/g, '"'));
                // PERBAIKAN: Hanya mengambil index [0] yang memiliki resolusi tertinggi & tanpa watermark
                if (Array.isArray(json.URL) && json.URL.length > 0) {
                    data.slides.push({ index: data.slides.length + 1, url: json.URL[0] });
                }
            } catch {}
        });
    } else {
        data.type = 'video';
    }

    // PERBAIKAN: Dikeluarkan dari blok kondisi 'video' agar data MP3 pada konten Slide juga tetap diekstraksi
    $('#formatselect option').each((_, el) => {
        const label = $(el).text().toLowerCase();
        const raw = $(el).attr('value');
        if (!raw) return;

        try {
            const json = JSON.parse(raw.replace(/&quot;/g, '"'));
            if (!json.URL) return;

            if (label.includes('mp4') && !label.includes('watermark')) {
                data.downloads.nowm.push(...json.URL);
            }
            if (label.includes('watermark')) {
                data.downloads.wm.push(...json.URL);
            }
            if (label.includes('mp3')) {
                data.mp3.push(...json.URL);
            }
        } catch {}
    });

    return data;
}

async function savett(url) {
    const { csrf, cookie } = await getToken();
    const html = await fetchTikTok(url, csrf, cookie);
    return parseResponse(html);
}

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

let handler = async (m, { conn, args, usedPrefix, command, text }) => {
    const url = text?.trim() || args[0];

    if (!url) {
        return m.reply(
            `╭┈┈⬡「 🎵 *ᴛɪᴋᴛᴏᴋ ᴅᴏᴡɴʟᴏᴀᴅ* 」\n` +
            `┃ ㊗ ᴜsᴀɢᴇ: \`${usedPrefix + command} <url>\`\n` +
            `╰┈┈⬡\n\n` +
            `> Contoh: ${usedPrefix + command} https://vt.tiktok.com/xxx`
        );
    }

    if (!url.match(/tiktok\.com|vt\.tiktok/i)) {
        return m.reply('❌ URL tidak valid. Gunakan link TikTok.');
    }

    await conn.sendMessage(m.chat, { react: { text: '⏱️', key: m.key } });

    try {
        const result = await savett(url);

        const caption =
            `✅ *Done kak*\n\n` +
            `👤 *${result.username || '-'}*\n` +
            `👁️ Views: ${result.views || '-'} | ❤️ Likes: ${result.likes || '-'}\n` +
            `💬 Comments: ${result.comments || '-'} | 🔗 Shares: ${result.shares || '-'}\n` +
            `⏱️ Duration: ${result.duration || '-'}`;

        // 1. Jika konten berupa Video
        if (result.type === 'video' && result.downloads.nowm.length > 0) {
            await conn.sendMessage(
                m.chat,
                {
                    video: { url: result.downloads.nowm[0] },
                    caption: caption,
                    mimetype: 'video/mp4'
                },
                { quoted: m }
            );

            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
            return;
        }

        // 2. Jika konten berupa Slides/Foto
        if (result.type === 'photo' && result.slides.length > 0) {
            await m.reply(`📸 *Mengirim ${result.slides.length} slide...*`);

            // Mengirim gambar secara sekuensial agar tidak terdeteksi spam
            for (let i = 0; i < result.slides.length; i++) {
                const imgUrl = result.slides[i].url;
                if (!imgUrl) continue;

                await conn.sendMessage(
                    m.chat,
                    {
                        image: { url: imgUrl },
                        caption: i === 0 ? caption : ''
                    },
                    { quoted: m }
                );
                
                await delay(1500); // Jeda pengiriman 1.5 detik
            }

            // Jika ada audionya, kirim juga
            if (result.mp3.length > 0) {
                await conn.sendMessage(
                    m.chat,
                    {
                        audio: { url: result.mp3[0] },
                        mimetype: 'audio/mpeg'
                    },
                    { quoted: m }
                );
            }

            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
            return;
        }

        // 3. Jika konten hanya MP3 (Fallback)
        if (result.mp3.length > 0) {
            await m.reply(`🍀 *NOTE*\n> Konten ini tidak memiliki video/slide, mengirim audio saja...`);
            await conn.sendMessage(
                m.chat,
                {
                    audio: { url: result.mp3[0] },
                    mimetype: 'audio/mpeg'
                },
                { quoted: m }
            );
            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
            return;
        }

        throw new Error('Tidak ada media yang dapat diunduh dari link tersebut.');

    } catch (err) {
        console.error('[TikTokDL2] Error:', err);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        m.reply(`❌ *ɢᴀɢᴀʟ ᴍᴇɴɢᴜɴᴅᴜʜ*\n\n> ${err.message || err}`);
    }
};

handler.help = ['apel2 <url>'];
handler.tags = ['xdownloader'];
handler.command = /^(apel2)$/i;
handler.limit = true;

module.exports = handler;