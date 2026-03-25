/**
 * TULIPNEX GITHUB DATABASE SYNC
 * Fitur: Mengunggah database.json ke repositori GitHub secara otomatis.
 */

const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

// ================= CONFIGURATION =================
const GITHUB_TOKEN = "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"; 
const REPO_OWNER = "TulipNex";
const REPO_NAME = "Dashboard";
const FILE_PATH = "database.json";
const SYNC_INTERVAL = 3 * 60 * 1000; // 1 Menit
// =================================================

async function syncToGithub() {
    const dbPath = path.join(process.cwd(), 'database.json');
    if (!fs.existsSync(dbPath)) throw new Error("File database.json tidak ditemukan.");

    // Membaca file langsung dari sistem (menghemat RAM daripada JSON.parse)
    const content = fs.readFileSync(dbPath, 'utf-8');
    const encodedContent = Buffer.from(content).toString('base64');

    let sha = "";
    try {
        const getFile = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
            headers: { 'Authorization': `token ${GITHUB_TOKEN}` }
        });
        const fileData = await getFile.json();
        sha = fileData.sha;
    } catch (e) {
        // Abaikan jika file belum ada (SHA kosong)
    }

    const response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
        method: 'PUT',
        headers: {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message: `Bot Auto-Sync Database: ${new Date().toLocaleTimeString()}`,
            content: encodedContent,
            sha: sha || undefined
        })
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Gagal upload");
    console.log(`[GITHUB-SYNC] Database tersinkronisasi ke ${REPO_OWNER}/${REPO_NAME}`);
}

let handler = async (m, { isOwner }) => {
    if (!isOwner) return;
    await m.reply("🔄 Memulai sinkronisasi database.json ke GitHub...");
    try {
        await syncToGithub();
        m.reply("✅ Selesai.");
    } catch (e) {
        m.reply(`❌ Gagal: ${e.message}`);
    }
}

// Menjalankan interval otomatis
if (!global.githubSyncInterval) {
    global.githubSyncInterval = setInterval(async () => {
        try {
            await syncToGithub();
        } catch (e) {
            console.error("[GITHUB-SYNC-ERROR]", e.message);
        }
    }, SYNC_INTERVAL);
}

handler.help = ['syncgithub'];
handler.tags = ['owner'];
handler.command = /^(syncgithub)$/i;
handler.owner = true;

module.exports = handler;