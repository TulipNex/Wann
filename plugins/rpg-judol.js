const cooldown = 0;

let handler = async (m, { conn, usedPrefix, args, text }) => {
    if (!text) {
        return m.reply(`
Here are several E-wallets that you can trade:
• Gopay
• Ovo
• Dana

Example: ${usedPrefix}judol 100000 gopay
`.trim());
    }

    let user = await global.db.data.users[m.sender];

    let [count, ewallet] = text.split(' ');

    // Check if both count and ewallet are provided
    if (!count || !ewallet) {
        return m.reply(`Format salah. Contoh penggunaan: ${usedPrefix}judol 100000 gopay`);
    }

    count = parseInt(count);
    if (isNaN(count)) {
        return m.reply(`Jumlah trading harus berupa angka. Contoh penggunaan: ${usedPrefix}judol 100000 gopay`);
    }

    const allowedEwallets = ['gopay', 'ovo', 'dana'];
    ewallet = ewallet.toLowerCase();
    if (!allowedEwallets.includes(ewallet)) {
        return m.reply(`E-wallet tidak valid. Silakan pilih salah satu dari: ${allowedEwallets.join(', ')}`);
    }

    let timers = cooldown - (new Date() - user.kerjasebelas);

    if (new Date() - user.kerjasebelas <= cooldown) {
        return m.reply(`
Kamu sudah melakukan judol. Silakan tunggu selama *🕐${new Date(timers).toISOString().substr(11, 8)}*
`.trim());
    }

    let minimal_ewallet = 100000;

    if (user[ewallet] === undefined || user[ewallet] < minimal_ewallet) {
        let errorMessage = `Saldo ${ewallet} anda tidak mencukupi untuk melakukan judol sebesar ${toSimple(minimal_ewallet)} dan berikut adalah contoh topup:\n\n`;
        errorMessage += `Contoh: ${usedPrefix}topup ${ewallet} ${minimal_ewallet}\n`;
        return m.reply(errorMessage.trim());
    }

    if (count < 100000) {
        return m.reply(`Untuk judol, dibutuhkan sedikitnya 100 ribu pada ${ewallet}! Ketik .judol 100000 ${ewallet} atau lebih sesuai budgetmu`);
    }

    if (user[ewallet] < count) {
        return m.reply(`Untuk judol, dibutuhkan sedikitnya ${toSimple(count)} pada ${ewallet}! Ketik .judol 100000 ${ewallet} atau lebih sesuai budgetmu`);
    }

    const rewards = reward(user, count, ewallet);
    let messageText = 'Kamu telah judol dan kehilangan:';
    for (const lost in rewards.lost) {
        if (user[lost]) {
            const total = rewards.lost[lost];
            user[lost] -= total;
            if (total) messageText += `\n*${lost}:* ${toSimple(total)}`;
        }
    }
    messageText += '\n\nHasil judol:';
    for (const rewardItem in rewards.reward) {
        if (rewardItem in user) {
            const total = rewards.reward[rewardItem];
            user[rewardItem] += total;
            if (total) messageText += `\n*${rewardItem}:* ${toSimple(total)}`;
        }
    }
    m.reply(messageText.trim());
    user.kerjasebelas = new Date().getTime();
    await global.db.write();
};

handler.help = ['judol'];
handler.tags = ['rpg'];
handler.command = /^(judol)$/i;
handler.cooldown = cooldown;
handler.disabled = false;
handler.rpg = true
module.exports = handler;

function reward(user = {}, count, ewallet) {
    let rewards = {
        reward: {},
        lost: {},
    };

    const profit = Math.random() < 0.3; // 30% chance to profit
    if (profit) {
        rewards.reward[ewallet] = count * 1.5; // 50% profit
    } else {
        rewards.lost[ewallet] = count; // Deduct the full amount
        rewards.reward[ewallet] = count * 0.5; // Return 50% of the original amount
    }

    return rewards;
}

function toSimple(number) {
    if (isNaN(parseFloat(number))) return number;
    if (parseFloat(number) === 0) return '0';
    number = parseFloat(number).toFixed(0);
    const suffixes = ['', 'K', 'JT', 'M', 'T'];
    const base = 1000;
    const exponent = Math.floor(Math.log10(Math.abs(number)) / 3);
    const suffix = suffixes[exponent] || '';
    const simplified = number / Math.pow(base, exponent);
    const formatter = Intl.NumberFormat('en', { maximumFractionDigits: 1 });
    return formatter.format(simplified) + suffix;
}