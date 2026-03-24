/**
 * TULIPNEX TRADING CORE SYSTEM 
 * Location: ./plugins/trading-core.js
 * Feature: Tax Privilege for Board of Directors
 * - [UPDATE]: Teks '.ind <ticker>' sekarang disesuaikan menampilkan 10 menit terakhir.
 */

let handler = async (m, { conn, text, usedPrefix, command, args }) => {
    const marketConfig = {
        IVL: { name: 'IvyLink', min: 3000, max: 99999, vol: 0.03 },
        LBT: { name: 'LilyBit', min: 100000, max: 999999, vol: 0.05 },
        IRC: { name: 'IrisCode', min: 1000000, max: 9999999, vol: 0.05 },
        LTN: { name: 'LotusNet', min: 10000000, max: 99999999, vol: 0.05 },
        RSX: { name: 'RoseX', min: 100000000, max: 999999999, vol: 0.05 },
        TNX: { name: 'TulipNex', min: 1000000000, max: 10000000000, vol: 0.05 }
    }

    global.db.data.settings = global.db.data.settings || {};
    if (!global.db.data.settings.trading) global.db.data.settings.trading = {};
    
    let market = global.db.data.settings.trading;
    market.prices = market.prices || Object.fromEntries(Object.entries(marketConfig).map(([k, v]) => [k, v.min]));
    market.prevPrices = market.prevPrices || { ...market.prices };
    market.history = market.history || Object.fromEntries(Object.entries(marketConfig).map(([k, v]) => [k, [v.min]]));
    market.ath = market.ath || { ...market.prices };
    market.activeEvent = market.activeEvent || { title: 'STABLE', msg: 'Pasar berjalan normal.', ticker: null, mult: 1, dur: 0 };
    market.vault = market.vault || 0; 
    market.taxRates = market.taxRates || { IVL: 1.5, LBT: 1.5, IRC: 1.5, LTN: 1.5, RSX: 1.5, TNX: 2.5 };

    let user = global.db.data.users[m.sender];
    let now = Date.now();

    let currentTime = new Date(now).toLocaleTimeString('id-ID', { timeZone: 'Asia/Makassar', hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WITA';

    let totalAssetValue = 0;
    for (let ticker in marketConfig) {
        let count = user[marketConfig[ticker].name.toLowerCase()] || 0;
        totalAssetValue += count * (market.prices[ticker] || 0);
    }

    let tnxHolders = [];
    for (let jid in global.db.data.users) {
        if (global.db.data.users[jid].tulipnex > 0) {
            tnxHolders.push([jid, global.db.data.users[jid]]);
        }
    }
    tnxHolders.sort((a, b) => b[1].tulipnex - a[1].tulipnex);
    
    let ceoJid = tnxHolders[0] ? tnxHolders[0][0] : null;
    let komJid = tnxHolders[1] ? tnxHolders[1][0] : null;
    let dirJid = tnxHolders[2] ? tnxHolders[2][0] : null;

    // COMMAND: INDICATOR
    if (/^(ind(icator)?|tmi)$/i.test(command)) {
        let targetTicker = args[0]?.toUpperCase();
        
        if (targetTicker && marketConfig[targetTicker]) {
            let curr = market.prices[targetTicker];
            let prev = market.prevPrices[targetTicker] || curr;
            let ath = market.ath[targetTicker] || curr;
            
            let rawHist = market.history[targetTicker];
            let displayHist = Array.isArray(rawHist) ? [...rawHist] : [curr];

            if (displayHist.length === 0 || displayHist[displayHist.length - 1] !== curr) displayHist.push(curr);
            
            // SEBELUMNYA -5, SEKARANG DIUBAH MENJADI -10
            displayHist = displayHist.slice(-10).reverse();

            let diff = curr - prev;
            let percent = prev > 0 ? ((diff / prev) * 100).toFixed(2) : '0.00';
            let emoji = diff > 0 ? '📈' : (diff < 0 ? '📉' : '➖');
            let sign = diff > 0 ? '+' : '';
            let currentTax = market.taxRates[targetTicker];

            let caption = `📊 *DETAIL INDIKATOR: ${targetTicker}*\n`;
            caption += `🕒 *Update:* ${currentTime}\n`;
            caption += `──────────────────\n`;
            caption += `✨ Item: ${marketConfig[targetTicker].name}\n`;
            caption += `💸 Harga: Rp ${curr.toLocaleString('id-ID')}\n`;
            caption += `📊 Perubahan: ${emoji} ${sign}${percent}%\n`;
            caption += `🏆 ATH: Rp ${ath.toLocaleString('id-ID')}\n`;
            caption += `🧾 Pajak Jual Dasar: *${currentTax}%*\n`;
            caption += `──────────────────\n`;
            
            // SEBELUMNYA 5m, SEKARANG 10m
            caption += `📜 *Riwayat Harga (10m terakhir):*\n`;
            displayHist.forEach((p, i) => { caption += `${i + 1}. Rp ${p.toLocaleString('id-ID')} (${i === 0 ? 'Sekarang' : `${i}m lalu`})\n`; });
            caption += `──────────────────\n`;
            if (market.activeEvent.ticker === 'GLOBAL' || market.activeEvent.ticker === targetTicker) {
                caption += `📢 *EVENT AKTIF:* \n> _${market.activeEvent.title}_\n🌍 *Scope:* \n> _${market.activeEvent.ticker}_\n⏳ *Sisa:* \n> _${market.activeEvent.dur} m_\n──────────────────\n`;
            }
            caption += `*Milik Anda:* ${user[marketConfig[targetTicker].name.toLowerCase()] || 0} unit\n`;
            return m.reply(caption);
        }

        let caption = `📊 *TULIPNEX MARKET INDICATOR*\n`;
        caption += `🕒 *Update:* ${currentTime}\n`;
        caption += `──────────────────\n`;
        
        let mktStatus = 'NORMAL';
        if (market.activeEvent.ticker === 'GLOBAL') mktStatus = '⚠️ GLOBAL EVENT';
        else if (market.activeEvent.ticker !== null) mktStatus = `⚠️ LOCAL EVENT (${market.activeEvent.ticker})`;
        
        caption += `🌍 *Market Status:* ${mktStatus}\n`;
        caption += `📰 *News:* _${market.activeEvent.msg}_\n`;
        caption += `──────────────────\n`;
        caption += `💶 *Money*: Rp ${user.money.toLocaleString('id-ID')}\n`; 
        caption += `💼 *Portfolio*: Rp ${totalAssetValue.toLocaleString('id-ID')}\n`;
        caption += `──────────────────\n`;
        
        for (let ticker in marketConfig) {
            let curr = market.prices[ticker];
            let prev = market.prevPrices[ticker] || curr;
            let diff = curr - prev;
            let percent = prev > 0 ? ((diff / prev) * 100).toFixed(2) : '0.00';
            let emoji = diff > 0 ? '📈' : (diff < 0 ? '📉' : '➖');
            let sign = diff > 0 ? '+' : '';
            let tax = market.taxRates[ticker];
            let owned = user[marketConfig[ticker].name.toLowerCase()] || 0;

            caption += `*${ticker}* (${marketConfig[ticker].name}) | Tax: ${tax}%\n`;
            caption += `│ 💰 Rp ${curr.toLocaleString('id-ID')}\n`;
            caption += `│ ${emoji} ${sign}${diff.toLocaleString('id-ID')} (${sign}${percent}%)\n`;
            caption += `│ 📦 Milik Anda: ${owned.toLocaleString('id-ID')} unit\n`;
            caption += `──────────────────\n`;
        }
        caption += `\n*INSTRUKSI TRANSAKSI:*\n`
        caption += `- *Beli Aset :* \n> ${usedPrefix}in <ticker> <jumlah/all> \n`
        caption += `- *Jual Aset :* \n> ${usedPrefix}ex <ticker> <jumlah/all> \n`
        caption += `- *Grafik harga :* \n> ${usedPrefix}grafik <ticker> \n`
        caption += `- *Event dan Riwayat Harga :* \n> ${usedPrefix}ind <ticker> \n\n`
        return m.reply(caption)
    }

    // COMMAND: PORTFOLIO
    if (/^(pf|port|portfolio)$/i.test(command)) {
        let caption = `💼 *USER ASSET PORTFOLIO*\n`;
        caption += `_Client: ${user.name}_\n`;
        caption += `──────────────────\n`;
        let hasAsset = false;
        for (let ticker in marketConfig) {
            let itemName = marketConfig[ticker].name.toLowerCase();
            let count = user[itemName] || 0;
            if (count > 0) {
                hasAsset = true;
                caption += `• *${ticker}*: ${count.toLocaleString('id-ID')} unit (Rp ${(count * market.prices[ticker]).toLocaleString('id-ID')})\n`;
            }
        }
        if (!hasAsset) caption += `_Anda belum memiliki aset apapun._\n`;
        caption += `──────────────────\n`;
        caption += `💵 *Liquid Cash*: \n> Rp ${user.money.toLocaleString('id-ID')}\n`;
        caption += `🏛️ *Total Networth*: \n> Rp ${(user.money + totalAssetValue).toLocaleString('id-ID')}\n`;
        return m.reply(caption);
    }

    // COMMAND: IN (BUY) & EX (SELL)
    let action = command.toLowerCase();
    if (action === 'in' || action === 'ex') {
        let ticker = (args[0] || '').toUpperCase();
        let inputQty = args[1]?.toLowerCase();
        let item = marketConfig[ticker];

        if (!item) return m.reply(`[!] Ticker *${ticker}* tidak valid.`);
        if (!inputQty) return m.reply(`[!] Masukkan jumlah atau ketik *all*.`);

        let currentPrice = market.prices[ticker];
        let varName = item.name.toLowerCase();
        let qty = 0;

        if (action === 'in') {
            qty = inputQty === 'all' ? Math.floor(user.money / currentPrice) : parseInt(inputQty);
            
            if (isNaN(qty) || qty <= 0) return m.reply(`[!] Jumlah tidak valid. Masukkan angka positif atau 'all'.`);
            
            let totalPrice = currentPrice * qty;
            if (user.money < totalPrice) return m.reply(`[!] Dana kurang. Anda butuh Rp ${totalPrice.toLocaleString('id-ID')}`);
            
            user.money -= totalPrice;
            user[varName] = (user[varName] || 0) + qty;
            
            m.reply(`✅ *BUY ORDER EXECUTED*\n──────────────────\n📦 Item: ${item.name} (${ticker})\n🔢 Total Beli: ${qty.toLocaleString('id-ID')} unit\n💰 Harga Satuan: Rp ${currentPrice.toLocaleString('id-ID')}\n💵 Total Harga: Rp ${totalPrice.toLocaleString('id-ID')}\n──────────────────\n💶 Money : Rp ${user.money.toLocaleString('id-ID')}`);
        
        } else {
            let userOwned = user[varName] || 0;
            qty = inputQty === 'all' ? userOwned : parseInt(inputQty);
            
            if (isNaN(qty) || qty <= 0) return m.reply(`[!] Jumlah tidak valid. Masukkan angka positif atau 'all'.`);
            if (qty > userOwned) return m.reply(`[!] Aset tidak cukup. Anda hanya memiliki ${userOwned.toLocaleString('id-ID')} unit.`);
            
            let currentTaxPercent = market.taxRates[ticker] || 1.5; 
            let taxRate = currentTaxPercent / 100;
            let grossPrice = currentPrice * qty;
            let tax = Math.floor(grossPrice * taxRate);
            let taxMsg = `🧾 Pajak Bursa (${currentTaxPercent}%): - Rp ${tax.toLocaleString('id-ID')}`;

            if (m.sender === ceoJid) {
                tax = 0; 
                taxMsg = `👑 Privilege CEO: *Bebas Pajak 100%*`;
            } else if (m.sender === komJid) {
                tax = Math.floor(tax * 0.5); 
                taxMsg = `👔 Privilege Komisaris: *Diskon Pajak 50%* (- Rp ${tax.toLocaleString('id-ID')})`;
            } else if (m.sender === dirJid) {
                tax = Math.floor(tax * 0.75); 
                taxMsg = `💼 Privilege Direktur: *Diskon Pajak 25%* (- Rp ${tax.toLocaleString('id-ID')})`;
            }

            let netGain = grossPrice - tax;
            market.vault = (market.vault || 0) + tax; 

            user.money += netGain;
            user[varName] -= qty;
            
            let msg = `💹 *SELL ORDER EXECUTED*\n──────────────────\n`;
            msg += `📦 Item: ${item.name} (${ticker})\n`;
            msg += `🔢 Total Jual: ${qty.toLocaleString('id-ID')} unit\n`;
            msg += `💰 Bruto: Rp ${grossPrice.toLocaleString('id-ID')}\n`;
            msg += `${taxMsg}\n`;
            msg += `──────────────────\n`;
            msg += `💵 Dana Masuk: Rp ${netGain.toLocaleString('id-ID')}\n`;
            msg += `💶 Saldo Saat Ini: Rp ${user.money.toLocaleString('id-ID')}`;
            
            m.reply(msg);
        }
    }
}

handler.help = ['ind', 'pf', 'in <ticker> <jumlah>', 'ex <ticker> <jumlah>']
handler.tags = ['tulipnex']
handler.command = /^(ind|indicator|tmi|pf|port|portfolio|in|ex)$/i
handler.rpg = true;
handler.group = true;

module.exports = handler;