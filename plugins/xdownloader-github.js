const fetch = require('node-fetch');

let handler = async (m, { conn, args, usedPrefix, command }) => {
    let username, repo, branch;

    // Deteksi jika user memberikan link lengkap atau argumen manual
    if (args[0] && args[0].includes('github.com')) {
        const urlMatch = args[0].match(/github\.com\/([^\/]+)\/([^\/]+)/i);
        if (urlMatch) {
            username = urlMatch[1];
            repo = urlMatch[2].replace(/\.git$/, '');
            branch = args[1] || ''; // Branch opsional di argumen kedua jika pakai link
        }
    } else {
        username = args[0];
        repo = args[1];
        branch = args[2] || '';
    }

    // Validasi Input jika parameter tidak lengkap
    if (!username || !repo) {
        throw `⚠️ *CARA PENGGUNAAN*\n\n> \`${usedPrefix + command} <user> <repo> <branch>\`\n\n*Contoh Manual:*\n> \`${usedPrefix + command} BOTCAHX RTXZY-MD main\`\n\n*Contoh via Link:*\n> \`${usedPrefix + command} https://github.com/BOTCAHX/RTXZY-MD\``;
    }

    // Kirim pesan loading
    await m.reply(global.wait);

    try {
        // Fetch informasi repository dari GitHub API
        const repoInfo = await fetch(`https://api.github.com/repos/${username}/${repo}`);
        
        if (!repoInfo.ok) {
            throw `❌ *REPO TIDAK DITEMUKAN*\n\n> \`${username}/${repo}\` tidak ada atau bersifat *Private*.`;
        }
        
        const repoData = await repoInfo.json();
        const defaultBranch = repoData.default_branch || 'main';
        
        // Gunakan branch yang direquest, atau fallback ke default_branch dari API
        branch = branch || defaultBranch;
        
        const zipUrl = `https://github.com/${username}/${repo}/archive/refs/heads/${branch}.zip`;
        
        // Memeriksa apakah file ZIP dari branch yang diminta benar-benar ada
        const checkRes = await fetch(zipUrl, { method: 'HEAD' });
        if (!checkRes.ok) {
            throw `❌ *BRANCH TIDAK ADA*\n\n> Branch \`${branch}\` tidak ditemukan pada repo ini.\n> Coba abaikan nama branch agar otomatis mengambil \`${defaultBranch}\`.`;
        }
        
        // Mengirimkan file ZIP Repo sebagai Dokumen
        await conn.sendMessage(m.chat, { 
            document: { url: zipUrl }, 
            fileName: `${repo}-${branch}.zip`, 
            mimetype: 'application/zip',
            caption: `✅ *Berhasil Mengunduh Repository*\n\n📦 *Repo:* ${username}/${repo}\n🌿 *Branch:* ${branch}`
        }, { quoted: m });
        
    } catch (e) {
        console.error(e);
        // Tangkap pesan error khusus berupa string (dari throw di atas) atau error bawaan sistem
        m.reply(typeof e === 'string' ? e : `❌ *GAGAL*\n\n> ${e.message}`);
    }
}

handler.help = ['guava'];
handler.tags = ['xdownloader'];
handler.command = /^(guava)$/i;
handler.limit = true; // Setara dengan config energi: 1 di versi sebelumnya

module.exports = handler;