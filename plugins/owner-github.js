/**
 * PUSHER GITHUB REPOSITORY
 * Location: ./plugins/owner-github.js
 * Feature: Upload SC Bot ke Github (Git CLI Wrapper)
 */

const { exec } = require('child_process');
const util = require('util');
const fs = require('fs');
const path = require('path');
const execPromise = util.promisify(exec);

let handler = async (m, { conn, text, usedPrefix, command, args }) => {
    if (!text) {
        let caption = `🛠️ *G I T H U B - M A N A G E R* 🛠️\n\n`;
        caption += `Kelola dan upload Source Code bot ke GitHub langsung dari chat.\n\n`;
        caption += `*Daftar Perintah:*\n`;
        caption += `1. *${usedPrefix + command} status*\n> Mengecek status git repository lokal.\n`;
        caption += `2. *${usedPrefix + command} init*\n> Inisialisasi git di dalam folder SC bot.\n`;
        caption += `3. *${usedPrefix + command} remote <link_repo>*\n> Set remote URL GitHub. Gunakan Personal Access Token (PAT).\n`;
        caption += `4. *${usedPrefix + command} push <pesan_commit>*\n> Upload semua file ke GitHub dengan pesan commit.\n`;
        return m.reply(caption);
    }

    let action = args[0].toLowerCase();
    
    try {
        if (action === 'status') {
            m.reply(global.wait || '⏳ Sedang mengecek status...');
            const { stdout, stderr } = await execPromise('git status');
            m.reply(`*📊 GIT STATUS:*\n\n${stdout || stderr}`);
        } 
        
        else if (action === 'init') {
            m.reply(global.wait || '⏳ Menginisialisasi Git...');
            const { stdout, stderr } = await execPromise('git init');
            m.reply(`*⚙️ GIT INIT:*\n\n${stdout || stderr}`);
        } 
        
        else if (action === 'remote') {
            if (!args[1]) return m.reply(`⚠️ Masukkan URL remote repo!\nContoh: *${usedPrefix + command} remote https://ghp_xxx@github.com/username/repo.git*`);
            
            m.reply(global.wait || '⏳ Menghubungkan ke remote repository...');
            try {
                await execPromise('git remote remove origin');
            } catch (e) {}
            const { stdout, stderr } = await execPromise(`git remote add origin ${args[1]}`);
            m.reply(`✅ *Remote Origin berhasil diatur!*`);
        } 
        
        else if (action === 'push') {
            let commitMsg = args.slice(1).join(' ');
            if (!commitMsg) return m.reply(`⚠️ Masukkan pesan commit!\nContoh: *${usedPrefix + command} push update fitur baru*`);

            let gitignorePath = path.join(process.cwd(), '.gitignore');
            if (!fs.existsSync(gitignorePath)) {
                let ignoreContent = `node_modules/\nsessions/\n.env\ntmp/\n*.zip\npackage-lock.json\n`;
                fs.writeFileSync(gitignorePath, ignoreContent);
                conn.reply(m.chat, '🛡️ *Sistem Keamanan:* File `.gitignore` otomatis dibuat untuk mencegah kebocoran data.', m);
            }

            m.reply(global.wait || '⏳ Memulai proses upload ke GitHub. Harap tunggu...');
            
            let safeCommitMsg = commitMsg.replace(/(["'$`\\])/g, '\\$1');
            
            // FIX: Menambahkan konfigurasi nama & email otomatis sebelum melakukan aksi add dan commit
            let gitCommand = `git config user.email "bot@developer.com" && git config user.name "Bot Developer" && git add . && git commit -m "${safeCommitMsg}" && git branch -M main && git push -u origin main`;
            
            const { stdout, stderr } = await execPromise(gitCommand);
            
            let resultMsg = `🚀 *UPLOAD BERHASIL!*\n\n*Log:*\n${stdout}`;
            if (stderr && !stderr.includes('up to date')) {
                resultMsg += `\n*Info/Peringatan:*\n${stderr}`;
            }
            
            m.reply(resultMsg);
        } 
        
        else {
            m.reply(`⚠️ Perintah tidak dikenali. Ketik *${usedPrefix + command}* untuk melihat menu.`);
        }
        
    } catch (error) {
        let errStr = util.format(error);
        if (errStr.includes('fatal: not a git repository')) {
            m.reply('❌ *ERROR:* Folder ini belum menjadi Git Repository. Silakan jalankan *' + usedPrefix + command + ' init* terlebih dahulu.');
        } else if (errStr.includes('Authentication failed') || errStr.includes('403')) {
            m.reply('❌ *ERROR AUTH:* Token/Password salah atau kadaluarsa. Pastikan Anda menggunakan GitHub Personal Access Token (PAT) yang memiliki akses repo.\n\nAtur ulang dengan: *' + usedPrefix + command + ' remote <link_token>*');
        } else {
            m.reply(`❌ *TERJADI KESALAHAN PADA SISTEM GIT:*\n\n${errStr.substring(0, 1500)}`);
        }
    }
};

handler.help = ['github', 'gh'];
handler.tags = ['owner'];
handler.command = /^(github|gh)$/i;
handler.rowner = true; 

module.exports = handler;