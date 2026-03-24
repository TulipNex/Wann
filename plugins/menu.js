process.env.TZ = 'Asia/Makassar'
let fs = require('fs')
let path = require('path')
let moment = require('moment-timezone')
let levelling = require('../lib/levelling')

let arrayMenu = [
  'all', 'tulipnex', 'ai', 'main', 'downloader', 'database', 'rpg', 'rpgG', 
  'sticker', 'advanced', 'xp', 'fun', 'game', 'github', 'group', 'info', 
  'internet', 'islam', 'maker', 'news', 'owner', 'voice', 'store', 'stalk', 
  'shortlink', 'tools', 'anonymous', ''
];

const allTags = {
    'all': 'SEMUA MENU',
    'tulipnex': 'TULIPNEX (CBE)',
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
    '': 'NO CATEGORY'
}

const defaultMenu = {
    before: `
Hi %name

Saya adalah Wann (WhatsApp Bot) yang dapat membantu melakukan sesuatu, mencari, dan mendapatkan data/informasi hanya melalui WhatsApp.

◦ *Library:* Baileys
◦ *Function:* Assistant

┌  ◦ Uptime : %uptime
│  ◦ Tanggal : %date
│  ◦ Waktu : %time WITA
└  ◦ Prefix Used : *[ %p ]*
`.trimStart(),
    header: '┌  ◦ *%category*',
    body: '│  ◦ %cmd %islimit %isPremium',
    footer: '└  ',
    after: `*Note:* Ketik .menu <category> untuk melihat menu spesifik\nContoh: .menu tools`
}

let handler = async (m, { conn, usedPrefix: _p, args = [], command, isOwner }) => {
    try {
        let { exp, limit, level, role } = global.db.data.users[m.sender]
        let name = `@${m.sender.split`@`[0]}`
        let teks = args[0] || ''
        
        let d = new Date(new Date + 3600000)
        let locale = 'id'
        let date = d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })
        let time = d.toLocaleTimeString(locale, { hour: 'numeric', minute: 'numeric', second: 'numeric' })

        let _uptime = process.uptime() * 1000
        let uptime = clockString(_uptime)
        
        let help = Object.values(global.plugins).filter(plugin => !plugin.disabled).map(plugin => {
            return {
                help: Array.isArray(plugin.help) ? plugin.help : [plugin.help],
                tags: Array.isArray(plugin.tags) ? plugin.tags : [plugin.tags],
                prefix: 'customPrefix' in plugin,
                limit: plugin.limit,
                premium: plugin.premium,
                owner: plugin.owner || plugin.rowner, 
                enabled: !plugin.disabled,
            }
        })

        let hiddenCategories = ['god', 'asisten']; 
        
        // Blokir user jika iseng memanggil parameter menu tersembunyi
        if (hiddenCategories.includes(teks) && !isOwner) {
            return m.reply(`Menu "${teks}" tidak tersedia.\nSilakan ketik ${_p}menu untuk melihat daftar menu.`);
        }

        if (!teks) {
            let menuList = `${defaultMenu.before}\n\n┌  ◦ *DAFTAR MENU*\n`
            for (let tag of arrayMenu) {
                if (tag && allTags[tag] && !hiddenCategories.includes(tag)) {
                    menuList += `│  ◦ ${_p}menu ${tag}\n`
                }
            }
            menuList += `└  \n\n${defaultMenu.after}`

            let replace = { '%': '%', p: _p, uptime, name, date, time }
            let text = menuList.replace(new RegExp(`%(${Object.keys(replace).sort((a, b) => b.length - a.length).join`|`})`, 'g'), (_, name) => '' + replace[name])

            return await conn.relayMessage(m.chat, {
                extendedTextMessage:{
                    text: text, 
                    contextInfo: {
                        mentionedJid: [m.sender],
                        externalAdReply: {
                            title: 'Wann',
                            body: 'Powered by TulipNex',
                            mediaType: 1,
                            previewType: 0,
                            renderLargerThumbnail: true,
                            thumbnailUrl: 'https://files.catbox.moe/stkbn0.png',
                            sourceUrl: ''
                        }
                    }, 
                    mentions: [m.sender]
                }
            }, {})
        }

        if (!allTags[teks]) {
            return m.reply(`Menu "${teks}" tidak tersedia.\nSilakan ketik ${_p}menu untuk melihat daftar menu.`)
        }

        let menuCategory = defaultMenu.before + '\n\n'
        
        if (teks === 'all') {
            for (let tag of arrayMenu) {
                if (tag !== 'all' && allTags[tag] && !hiddenCategories.includes(tag)) {
                    menuCategory += defaultMenu.header.replace(/%category/g, allTags[tag]) + '\n'
                    let categoryCommands = help.filter(menu => menu.tags && menu.tags.includes(tag) && menu.help)
                    
                    let formattedCommands = [];
                    for (let menu of categoryCommands) {
                        for (let helpItem of menu.help) {
                            if (!helpItem) continue;
                            formattedCommands.push({
                                name: helpItem,
                                str: defaultMenu.body
                                    .replace(/%cmd/g, menu.prefix ? helpItem : _p + helpItem)
                                    .replace(/%islimit/g, menu.limit ? '(Ⓛ)' : '')
                                    .replace(/%isPremium/g, menu.premium ? '(Ⓟ)' : '')
                            });
                        }
                    }
                    formattedCommands.sort((a, b) => String(a.name).localeCompare(String(b.name)));
                    menuCategory += formattedCommands.map(c => c.str).join('\n') + '\n';
                    menuCategory += defaultMenu.footer + '\n'
                }
            }
        } else {
            menuCategory += defaultMenu.header.replace(/%category/g, allTags[teks]) + '\n'
            let categoryCommands = help.filter(menu => menu.tags && menu.tags.includes(teks) && menu.help)
            
            let formattedCommands = [];
            for (let menu of categoryCommands) {
                for (let helpItem of menu.help) {
                    if (!helpItem) continue;
                    formattedCommands.push({
                        name: helpItem,
                        str: defaultMenu.body
                            .replace(/%cmd/g, menu.prefix ? helpItem : _p + helpItem)
                            .replace(/%islimit/g, menu.limit ? '(Ⓛ)' : '')
                            .replace(/%isPremium/g, menu.premium ? '(Ⓟ)' : '')
                    });
                }
            }
            formattedCommands.sort((a, b) => String(a.name).localeCompare(String(b.name)));
            menuCategory += formattedCommands.map(c => c.str).join('\n') + '\n';
            menuCategory += defaultMenu.footer + '\n'
        }

        menuCategory += '\n' + defaultMenu.after
        
        let replace = { '%': '%', p: _p, uptime, name, date, time }
        let text = menuCategory.replace(new RegExp(`%(${Object.keys(replace).sort((a, b) => b.length - a.length).join`|`})`, 'g'), (_, name) => '' + replace[name])

        await conn.relayMessage(m.chat, {
            extendedTextMessage:{
                text: text, 
                contextInfo: {
                    mentionedJid: [m.sender],
                    externalAdReply: {
                        title: 'Wann',
                        body: 'Powered by TulipNex',
                        mediaType: 1,
                        previewType: 0,
                        renderLargerThumbnail: true,
                        thumbnailUrl: 'https://files.catbox.moe/stkbn0.png',
                        sourceUrl: ''
                    }
                }, 
                mentions: [m.sender]
            }
        }, {})
    } catch (e) {
        conn.reply(m.chat, 'Maaf, menu sedang error', m)
        console.error(e)
    }
}

handler.help = ['menu']
handler.tags = ['main']
handler.command = /^(menu|help)$/i // scipio dihapus dari sini
handler.exp = 3

module.exports = handler

function clockString(ms) {
    if (isNaN(ms)) return '--'
    let h = Math.floor(ms / 3600000)
    let m = Math.floor(ms / 60000) % 60
    let s = Math.floor(ms / 1000) % 60
    return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')
}