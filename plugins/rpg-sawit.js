let levelling = require('../lib/levelling')

let handler = async (m, { conn, usedPrefix }) => {

  let user = global.db.data.users[m.sender]

  if (!user) return conn.reply(m.chat, '❌ User tidak terdaftar di database.', m)

  // ===== UTIL =====

  const short = n =>

    n >= 1e9 ? (n / 1e9).toFixed(1) + 'B' :

    n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' :

    n >= 1e3 ? (n / 1e3).toFixed(1) + 'K' : n

  const msToTime = ms => {

    let h = Math.floor(ms / 3600000)

    let m = Math.floor(ms % 3600000 / 60000)

    let s = Math.floor(ms % 60000 / 1000)

    return `${h}j ${m}m ${s}d`

  }

  // ===== CONFIG =====

  let cooldown = 24 * 60 * 60 * 1000 // 24 jam

  let expReward = 500_000

  let moneyMin = 20_000_000

  let moneyMax = 500_000_000

  if (!user.lastNyawit) user.lastNyawit = 0

  let now = Date.now()

  if (now - user.lastNyawit < cooldown) {

    let timeLeft = cooldown - (now - user.lastNyawit)

    return conn.reply(

      m.chat,

      `⏳ *Sawit belum siap dipanen!*\n\nTunggu *${msToTime(timeLeft)}* lagi 🌴`,

      m

    )

  }

  // ===== PANEN =====

  let money = Math.floor(Math.random() * (moneyMax - moneyMin + 1)) + moneyMin

  user.exp += expReward

  user.money += money

  user.lastNyawit = now

  let { min, xp, max } = levelling.xpRange(user.level, global.multiplier)

  let needXp = max - xp

  let resultText = `

╭━━━〔 🌴 NYAWIT SAWIT 〕━━━

🌾 Panen sawit berhasil!

✨ EXP     : +${short(expReward)}

💰 Money   : +${short(money)}

📊 Total EXP : ${short(user.exp)}

💳 Saldo     : ${short(user.money)}

⬆️ Level Up : ${needXp <= 0 ? `Siap ${usedPrefix}levelup` : `${short(needXp)} lagi`}

⏰ Cooldown : 24 Jam

╰━━━━━━━━━━━━━━━━━━

`.trim()

  conn.reply(m.chat, resultText, m)

}

handler.help = ['nyawit', 'sawit']

handler.tags = ['rpg']

handler.command = /^(nyawit|sawit)$/i

handler.rpg = true

module.exports = handler