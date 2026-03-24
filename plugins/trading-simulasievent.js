/**
 * TULIPNEX EVENT SIMULATOR (Admin Override & Engine Sync)
 * Location: ./plugins/trading-simulasievent.js
 * Feature: Force trigger events and broadcast to Announcer Group
 * [AUDIT FIX]: Push event paksaan Admin ke eventHistory agar masuk rekapan
 */

const path = require('path');
const fs = require('fs');

const eventPath = path.join(process.cwd(), 'lib', 'trading-events.js');
let eventPool = [];
if (fs.existsSync(eventPath)) {
    eventPool = require(eventPath);
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
    global.db.data.settings = global.db.data.settings || {};
    if (!global.db.data.settings.trading) return m.reply('[!] Sistem belum aktif. Tunggu Engine menyala.');
    
    let market = global.db.data.settings.trading;

    // --- 1. COMMAND: STOPEVENT ---
    if (command === 'stopevent') {
        market.activeEvent = { title: 'STABLE', msg: 'Pasar berjalan normal.', ticker: null, mult: 1, dur: 0 };
        
        let msg = '✅ *EVENT STOPPED*: Pasar kembali stabil.';
        
        // Broadcast ke grup utama jika admin mematikannya dari PC
        if (market.announcerGroup && market.announcerGroup !== m.chat) {
            await conn.reply(market.announcerGroup, `📢 *TULIPNEX INFO*\nOtoritas Bursa telah menstabilkan pasar. Kondisi kembali normal.`, null);
        }
        return m.reply(msg);
    }

    // --- 2. JIKA PERINTAH KOSONG: TAMPILKAN KATALOG EVENT ---
    if (!text) {
        let listTxt = `⚙️ *DAFTAR EVENT TULIPNEX (ADMIN)*\n──────────────────\n`;
        listTxt += `Ketik *${usedPrefix}${command} random* untuk event acak, atau pilih dari daftar di bawah:\n\n`;
        
        let grouped = {};
        for (let ev of eventPool) {
            let key = ev.ticker || 'GLOBAL';
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(ev.title);
        }

        for (let ticker in grouped) {
            listTxt += `*■ ${ticker === 'GLOBAL' ? '🌍 GLOBAL (ALL MARKET)' : `📦 TIER: ${ticker}`}*\n`;
            listTxt += grouped[ticker].map(t => `• ${t}`).join('\n');
            listTxt += `\n\n`;
        }

        listTxt += `──────────────────\n`;
        listTxt += `*Contoh Penggunaan:*\n${usedPrefix}${command} GLOBAL RECESSION`;
        
        return m.reply(listTxt.trim());
    }

    // --- 3. EKSEKUSI EVENT & SYNC ---
    let targetEvent;
    if (text.toLowerCase() === 'random') {
        targetEvent = eventPool[Math.floor(Math.random() * eventPool.length)];
    } else {
        targetEvent = eventPool.find(e => e.title.toLowerCase() === text.toLowerCase());
    }

    if (!targetEvent) return m.reply(`[!] Event *${text}* tidak ditemukan. Cek ejaan Anda.`);

    // Set event ke database (Akan langsung dieksekusi oleh Announcer di menit berikutnya)
    market.activeEvent = { ...targetEvent };
    
    // [AUDIT FIX]: Catat juga secara manual ke dalam history 1 Jam agar terbaca oleh cekevent
    market.eventHistory = market.eventHistory || [];
    market.eventHistory.push({
        title: `(ADMIN) ${targetEvent.title}`,
        time: Date.now()
    });
    
    let newsFlash = `📢 *TULIPNEX NEWS FLASH*\n──────────────────\n📰 *Event:* ${market.activeEvent.title}\n💬 ${market.activeEvent.msg}\n🎯 *Impact:* ${market.activeEvent.ticker === 'GLOBAL' ? 'SELURUH PASAR' : market.activeEvent.ticker}\n⏳ *Durasi:* ${market.activeEvent.dur} Menit\n──────────────────`;
    
    // Broadcast langsung ke grup pasar jika admin memicunya dari tempat lain (seperti PC)
    if (market.announcerGroup && market.announcerGroup !== m.chat) {
        await conn.reply(market.announcerGroup, newsFlash, null);
        return m.reply(`✅ Berhasil memicu paksa event: *${market.activeEvent.title}*\nBerita telah berhasil disiarkan ke saluran resmi!`);
    } else {
        // Jika admin memicunya langsung di dalam grup pasar, cukup reply saja
        return m.reply(newsFlash);
    }
}

handler.help = ['setevent <judul/random>', 'stopevent']
handler.tags = ['god']
handler.command = /^(setevent|stopevent)$/i
handler.owner = true;
handler.private = true;

module.exports = handler;