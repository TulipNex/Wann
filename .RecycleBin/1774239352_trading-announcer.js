/**
 * TULIPNEX AUTOMATIC NEWS ANNOUNCER (REAL-TIME WITA SYNC)
 * Location: ./plugins/trading-announcer.js
 * Patch Notes: 
 * - Synced movement strictly with Asia/Makassar real-time minute changes.
 * - Added "Rubber Band Effect" to prevent prices from getting stuck at min/max.
 * - Added "Smart Event Filter" to prevent bearish events at floor & bullish events at ceiling.
 * - Forced boundary padding (+1 / -1) so prices never physically touch absolute limits.
 * - [UPDATE]: History ditingkatkan menjadi 10 menit untuk kebutuhan visualisasi Chart.
 */

const path = require('path');
const fs = require('fs');
const moment = require('moment-timezone'); 

const eventPath = path.join(process.cwd(), 'lib', 'trading-events.js');
let eventPool = [];
if (fs.existsSync(eventPath)) {
    eventPool = require(eventPath);
}

let handler = async (m, { conn, command }) => {
    try {
        global.db.data.settings = global.db.data.settings || {};
        if (!global.db.data.settings.trading) global.db.data.settings.trading = {};
        let market = global.db.data.settings.trading;

        let action = (command || '').toLowerCase();

        if (action === 'setnews' || action === 'setnew') {
            market.announcerGroup = m.chat;
            market.lastMinuteMarker = null; 
            return m.reply('✅ Saluran Berita DIAKTIFKAN.\nMesin selaras dengan WITA & Algoritma Anti-Stuck telah dijalankan.');
        }
        
        if (action === 'stopnews') {
            market.announcerGroup = null;
            return m.reply('❌ Saluran Berita DIMATIKAN.');
        }
    } catch (e) {
        console.error(e);
        return m.reply('⚠️ Terjadi error pada sistem.');
    }
}

if (!global.tradingInterval) {
    console.log('🚀 [TulipNex] News Announcer Engine Started (Rubber Band Mode)...');
    
    global.tradingInterval = setInterval(async () => {
        try {
            let market = global.db.data?.settings?.trading;
            if (!market || !market.announcerGroup || !global.conn) return;

            // Waktu nyata (WITA)
            let nowTz = moment().tz('Asia/Makassar');
            let currentMinuteMarker = nowTz.format('YYYY-MM-DD HH:mm');

            // TRIGGER EKSEKUSI
            if (market.lastMinuteMarker !== currentMinuteMarker) {
                
                const config = {
                    IVL: { min: 3000, max: 99999, vol: 0.03 },
                    LBT: { min: 100000, max: 999999, vol: 0.05 },
                    IRC: { min: 1000000, max: 9999999, vol: 0.05 },
                    LTN: { min: 10000000, max: 99999999, vol: 0.05 },
                    RSX: { min: 100000000, max: 999999999, vol: 0.05 },
                    TNX: { min: 1000000000, max: 10000000000, vol: 0.05 }
                };

                market.prices = market.prices || {};
                market.history = market.history || {};
                market.ath = market.ath || {};
                market.eventHistory = market.eventHistory || []; 
                
                // Set harga default jika kosong (ditambah 1 agar tidak nyentuh minimum murni)
                for (let k in config) if (!market.prices[k]) market.prices[k] = config[k].min + 1;

                let news = "";
                
                let minutesPassed = 1; 
                if (market.lastMinuteMarker) {
                    let lastTz = moment.tz(market.lastMinuteMarker, 'YYYY-MM-DD HH:mm', 'Asia/Makassar');
                    minutesPassed = Math.max(1, nowTz.diff(lastTz, 'minutes'));
                }

                market.activeEvent = market.activeEvent || { title: 'STABLE', dur: 0 };
                if (market.activeEvent.dur > 0) {
                    market.activeEvent.dur -= minutesPassed;
                } else {
                    market.activeEvent = { title: 'STABLE', msg: 'Normal', ticker: null, mult: 1, dur: 0 };
                }

                // --- 1. SMART EVENT FILTER ---
                if (market.activeEvent.title === 'STABLE' && Math.random() < 0.10) {
                    if (eventPool.length > 0) {
                        
                        // Saring event berdasarkan kondisi pasar (Anti Over-Bull / Over-Bear)
                        let validEvents = eventPool.filter(ev => {
                            if (ev.ticker === 'GLOBAL') {
                                // Pengecekan Global: Cegah krisis jika mayoritas koin hancur
                                let hancurCount = 0; let pucukCount = 0;
                                for (let t in config) {
                                    if (market.prices[t] <= config[t].min * 1.5) hancurCount++;
                                    if (market.prices[t] >= config[t].max * 0.85) pucukCount++;
                                }
                                if (ev.mult < 0 && hancurCount >= 3) return false; 
                                if (ev.mult > 0 && pucukCount >= 3) return false;
                                return true;
                            }

                            // Pengecekan Koin Individu
                            let c = config[ev.ticker];
                            let p = market.prices[ev.ticker];
                            let isNearMin = p <= (c.min * 1.5); // Sangat dekat harga minimum
                            let isNearMax = p >= (c.max * 0.85); // Sangat dekat harga maksimum

                            if (ev.mult < 0 && isNearMin) return false; // Dilarang ada bad news saat harga ancur
                            if (ev.mult > 0 && isNearMax) return false; // Dilarang ada good news saat harga sudah mahal

                            return true;
                        });

                        // Jika ada event yang lolos sensor, eksekusi!
                        if (validEvents.length > 0) {
                            let ev = validEvents[Math.floor(Math.random() * validEvents.length)];
                            market.activeEvent = { ...ev };
                            
                            // Push ke event history agar tercatat di .cekevent
                            market.eventHistory.push({
                                title: ev.title,
                                time: Date.now()
                            });
                            
                            news = `📢 *TULIPNEX NEWS FLASH*\n──────────────────\n📰 *Event:* ${ev.title}\n💬 ${ev.msg}\n🎯 *Impact:* ${ev.ticker}\n⏳ *Durasi:* ${ev.dur} Menit\n──────────────────`;
                        }
                    }
                }

                // Bersihkan history event yang lebih dari 1 Jam agar database tidak bengkak
                let oneHourAgo = Date.now() - 3600000;
                market.eventHistory = market.eventHistory.filter(e => e.time >= oneHourAgo);

                // --- 2. RUBBER BAND EFFECT CALCULATION ---
                market.prevPrices = { ...market.prices };
                for (let t in config) {
                    let c = config[t];
                    let currentPrice = market.prices[t];

                    // Baseline probabilitas (Terpengaruh oleh event)
                    let upChance = (market.activeEvent.ticker === 'GLOBAL' || market.activeEvent.ticker === t) 
                                   ? (market.activeEvent.mult > 0 ? 0.8 : 0.2) : 0.5;
                    
                    // Kalkulasi Jarak Bahaya (Threshold)
                    let nearMinThreshold = Math.max(c.min + (c.max - c.min) * 0.05, c.min * 1.5);
                    let nearMaxThreshold = c.max - (c.max - c.min) * 0.05;

                    // INTERVENSI ALGORITMA: Tarikan Karet
                    if (currentPrice <= nearMinThreshold) {
                        upChance = Math.max(upChance, 0.85); // Harga di dasar, paksa pantul naik (85% Chance)
                    } else if (currentPrice >= nearMaxThreshold) {
                        upChance = Math.min(upChance, 0.15); // Harga di pucuk, paksa taking profit (85% Chance Turun)
                    }

                    // Rumus Gacha Fluktuasi
                    let change = (Math.random() * c.vol * (Math.random() < upChance ? 1 : -1));
                    let newPrice = Math.floor(currentPrice * (1 + change));

                    // --- 3. ABSOLUTE BOUNDARY PADDING ---
                    market.prices[t] = Math.max(c.min + 973, Math.min(c.max - 973, newPrice));

                    // --- PERUBAHAN HISTORY KE 10 MENIT ---
                    if (!market.history[t]) market.history[t] = [];
                    market.history[t].push(market.prices[t]);
                    
                    // SEBELUMNYA > 5, SEKARANG DIUBAH MENJADI > 10
                    if (market.history[t].length > 10) {
                        market.history[t].shift();
                    }

                    if (!market.ath[t]) market.ath[t] = market.prices[t];
                    if (market.prices[t] > market.ath[t]) {
                        market.ath[t] = market.prices[t];
                    }
                }

                market.lastMinuteMarker = currentMinuteMarker;
                market.lastUpdate = Date.now(); 

                if (news) {
                    await global.conn.reply(market.announcerGroup, news, null);
                }
            }
        } catch (e) {
            console.error('❌ [TulipNex] Announcer Error:', e);
        }
    }, 5000); 
}

handler.help = ['setnews', 'stopnews'];
handler.tags = ['tulipnex'];
handler.command = /^(setnews|stopnews)$/i;
handler.admin = true;
handler.group = true; 

module.exports = handler;