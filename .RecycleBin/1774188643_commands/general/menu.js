// File: commands/general/menu.js (Format: JavaScript)
const fs = require('fs');
const path = require('path');

// Menggunakan susunan arrayMenu
let arrayMenu = [
  'all', 'tulipnex', 'ai', 'main', 'downloader', 'database', 'rpg', 'rpgG', 
  'sticker', 'advanced', 'xp', 'fun', 'game', 'github', 'group', 'info', 
  'internet', 'islam', 'maker', 'news', 'owner', 'voice', 'store', 'stalk', 
  'shortlink', 'tools', 'anonymous', ''
];

const allTags = {
    'all': 'SEMUA MENU',
    'tulipnex': 'TULIPNEX (CBE)',
    'asisten': 'MENU ASISTEN',
    'ai': 'MENU AI',
    'main': 'MENU UTAMA',
    'downloader': 'MENU DOWNLOADER',
    'database': 'MENU DATABASE',
    'rpg': 'MENU RPG',
    'rpgG': 'MENU RPG GUILD',
    'sticker': 'MENU CONVERT',
    'advanced': 'ADVANCED',
    'xp': 'MENU EXP',
    'fun': 'MENU FUN',
    'game': 'MENU GAME',
    'github': 'MENU GITHUB',
    'group': 'MENU GROUP',
    'info': 'MENU INFO',
    'internet': 'INTERNET',
    'islam': 'MENU ISLAMI',
    'maker': 'MENU MAKER',
    'news': 'MENU NEWS',
    'owner': 'MENU OWNER',
    'voice': 'PENGUBAH SUARA',
    'store': 'MENU STORE',
    'stalk': 'MENU STALK',
    'shortlink': 'SHORT LINK',
    'tools': 'MENU TOOLS',
    'anonymous': 'ANONYMOUS CHAT',
    'god': '⚙️ ROOT COMMANDS (HIDDEN)',
    '': 'NO CATEGORY'
}

const defaultMenu = {
    before: `Hi %name\n\nSaya adalah Wann (WhatsApp Bot) yang dapat membantu melakukan sesuatu, mencari, dan mendapatkan data/informasi hanya melalui WhatsApp.\n\n◦ *Library:* Baileys\n◦ *Function:* Assistant\n\n┌  ◦ Uptime : %uptime\n│  ◦ Tanggal : %date\n│  ◦ Waktu : %time WITA\n└  ◦ Prefix Used : *[ %p ]*\n`.trimStart(),
    header: '┌  ◦ *%category*',
    body: '│  ◦ %cmd %islimit %isPremium',
    footer: '└  ',
    after: `*Note:* Ketik .menu <category> untuk melihat menu spesifik\nContoh: .menu tools`
}

function clockString(ms) {
    if (isNaN(ms)) return '--'
    let h = Math.floor(ms / 3600000)
    let m = Math.floor(ms / 60000) % 60;
    let s = Math.floor(ms / 1000) % 60;
    return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')
}

module.exports = {
    name: 'menu',
    aliases: ['help', 'list', 'scipio'],
    category: 'general',
    description: 'Menampilkan daftar perintah bot',
    execute: async (wann, msg, args, { usedPrefix: _p, command, isOwner, sender }) => {
        try {
            const { commandsMap } = require('../../core/handler');
            const remoteJid = msg.key.remoteJid;
            let name = `@${sender.split('@')[0]}`;
            let teks = args[0] || '';
            
            let d = new Date(new Date() + 3600000);
            let locale = 'id';
            let date = d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
            let time = d.toLocaleTimeString(locale, { hour: 'numeric', minute: 'numeric', second: 'numeric' });
            let uptime = clockString(process.uptime() * 1000);

            // Filter menu yang tersembunyi
            let hiddenCategories = ['god', 'asisten'];
            let isHiddenCommand = /^scipio$/i.test(command);

            // Blokir akses menu kategori rahasia via .menu <tag>
            if (hiddenCategories.includes(teks) && !isOwner) {
                return wann.sendMessage(remoteJid, { text: `Menu "${teks}" tidak tersedia.\nSilakan ketik ${_p}menu untuk melihat daftar menu.` }, { quoted: msg });
            }

            // --- LOGIKA PESAN (Menu Utama / Spesifik / Hidden) ---
            let finalText = '';
            let adReplyTitle = 'Wann';
            let adReplyBody = 'Powered by TulipNex';

            if (isHiddenCommand) {
                if (!isOwner) return; // Silent ignore
                adReplyTitle = 'ROOT ACCESS GRANTED';
                adReplyBody = 'Welcome Owner';
                finalText = defaultMenu.before + '\n\n';
                for (let tag of hiddenCategories) {
                    finalText += defaultMenu.header.replace(/%category/g, allTags[tag]) + '\n';
                    let cmds = Array.from(commandsMap.values()).filter(c => c.category === tag).sort((a, b) => a.name.localeCompare(b.name));
                    for (let c of cmds) {
                        finalText += defaultMenu.body.replace(/%cmd/g, _p + c.name).replace(/%islimit/g, c.limit ? '(Ⓛ)' : '').replace(/%isPremium/g, c.premium ? '(Ⓟ)' : '') + '\n';
                    }
                    finalText += defaultMenu.footer + '\n';
                }
                finalText += '\n_Akses Root dikonfirmasi._';
            } else if (!teks) {
                finalText = defaultMenu.before + '\n\n┌  ◦ *DAFTAR MENU*\n';
                finalText += `│  ◦ ${_p}menu all\n`;
                for (let tag of arrayMenu) {
                    if (tag && allTags[tag] && !hiddenCategories.includes(tag)) {
                        finalText += `│  ◦ ${_p}menu ${tag}\n`;
                    }
                }
                finalText += `└  \n\n${defaultMenu.after}`;
            } else {
                if (!allTags[teks]) return wann.sendMessage(remoteJid, { text: `Menu "${teks}" tidak tersedia.` }, { quoted: msg });
                
                finalText = defaultMenu.before + '\n\n';
                let categoriesToRender = teks === 'all' ? arrayMenu.filter(t => t !== 'all' && !hiddenCategories.includes(t)) : [teks];

                for (let tag of categoriesToRender) {
                    if (!allTags[tag]) continue;
                    finalText += defaultMenu.header.replace(/%category/g, allTags[tag]) + '\n';
                    let cmds = Array.from(commandsMap.values()).filter(c => c.category === tag).sort((a, b) => a.name.localeCompare(b.name));
                    for (let c of cmds) {
                        finalText += defaultMenu.body.replace(/%cmd/g, _p + c.name).replace(/%islimit/g, c.limit ? '(Ⓛ)' : '').replace(/%isPremium/g, c.premium ? '(Ⓟ)' : '') + '\n';
                    }
                    finalText += defaultMenu.footer + '\n\n';
                }
                finalText += defaultMenu.after;
            }

            // Replace Placeholders
            const replaceData = { '%': '%', p: _p, uptime, name, date, time };
            finalText = finalText.replace(new RegExp(`%(${Object.keys(replaceData).sort((a, b) => b.length - a.length).join('|')})`, 'g'), (_, k) => replaceData[k]);

            await wann.sendMessage(remoteJid, {
                text: finalText,
                mentions: [sender],
                contextInfo: {
                    mentionedJid: [sender],
                    externalAdReply: {
                        title: adReplyTitle,
                        body: adReplyBody,
                        mediaType: 1,
                        renderLargerThumbnail: true,
                        thumbnailUrl: 'https://files.catbox.moe/stkbn0.png',
                        sourceUrl: ''
                    }
                }
            }, { quoted: msg });

        } catch (e) {
            console.error(e);
            wann.sendMessage(msg.key.remoteJid, { text: 'Maaf, menu sedang error' }, { quoted: msg });
        }
    }
};