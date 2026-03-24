let handler = async (m, { conn, args, participants }) => {

  let users = Object.entries(global.db.data.users).map(([key, value]) => {

    return { ...value, jid: key }

  })

  let sortedExp = users.map(toNumber('exp')).sort(sort('exp'))

  let sortedLim = users.map(toNumber('limit')).sort(sort('limit'))

  let sortedLevel = users.map(toNumber('level')).sort(sort('level'))

  let sortedMoney = users.map(toNumber('money')).sort(sort('money'))

  let sortedBank = users.map(toNumber('bank')).sort(sort('bank'))

  let usersExp = sortedExp.map(enumGetKey)

  let usersLim = sortedLim.map(enumGetKey)

  let usersLevel = sortedLevel.map(enumGetKey)

  let usersMoney = sortedMoney.map(enumGetKey)

  let usersBank = sortedBank.map(enumGetKey)

  let rankExp = usersExp.indexOf(m.sender) + 1

  let rankLim = usersLim.indexOf(m.sender) + 1

  let rankLevel = usersLevel.indexOf(m.sender) + 1

  let rankMoney = usersMoney.indexOf(m.sender) + 1

  let rankBank = usersBank.indexOf(m.sender) + 1

  let len = args[0] && args[0].length > 0

    ? Math.min(10, Math.max(parseInt(args[0]), 10))

    : Math.min(10, sortedExp.length)

  // Fungsi khusus untuk memastikan nama yang dicetak SELALU berupa teks.

  // Jika gagal atau format datanya aneh, otomatis dialihkan ke nomor WhatsApp.

  const getValidName = async (jid, dbName) => {

    if (typeof dbName === 'string' && dbName.trim().length > 0) return dbName;

    try {

      let fetched = await conn.getName(jid);

      if (typeof fetched === 'string' && fetched.trim().length > 0) return fetched;

      if (fetched && typeof fetched === 'object' && fetched.name) return fetched.name;

    } catch (e) {}

    return jid.split('@')[0];

  };

  let text = `• *XP Leaderboard Top ${len}* •\n`

  text += `Kamu: *${rankExp}* dari *${usersExp.length}*\n\n`

  for (let i = 0; i < len; i++) {

    let { jid, exp, name } = sortedExp[i]

    let username = await getValidName(jid, name)

    text += `${i + 1}. ${username} : *${exp} Exp*\n`

  }

  text += `\n• *Limit Leaderboard Top ${len}* •\n`

  text += `Kamu: *${rankLim}* dari *${usersLim.length}*\n\n`

  for (let i = 0; i < len; i++) {

    let { jid, limit, name } = sortedLim[i]

    let username = await getValidName(jid, name)

    text += `${i + 1}. ${username} : *${limit} Limit*\n`

  }

  text += `\n• *Level Leaderboard Top ${len}* •\n`

  text += `Kamu: *${rankLevel}* dari *${usersLevel.length}*\n\n`

  for (let i = 0; i < len; i++) {

    let { jid, level, name } = sortedLevel[i]

    let username = await getValidName(jid, name)

    text += `${i + 1}. ${username} : *Level ${level}*\n`

  }

  text += `\n• *Money Leaderboard Top ${len}* •\n`

  text += `Kamu: *${rankMoney}* dari *${usersMoney.length}*\n\n`

  for (let i = 0; i < len; i++) {

    let { jid, money, name } = sortedMoney[i]

    let username = await getValidName(jid, name)

    text += `${i + 1}. ${username} : *Money ${money}*\n`

  }

  text += `\n• *Bank Leaderboard Top ${len}* •\n`

  text += `Kamu: *${rankBank}* dari *${usersBank.length}*\n\n`

  for (let i = 0; i < len; i++) {

    let { jid, bank, name } = sortedBank[i]

    let username = await getValidName(jid, name)

    text += `${i + 1}. ${username} : *Bank ${bank}*\n`

  }

  conn.reply(m.chat, text.trim(), m)

}

handler.help = ['leaderboard <jumlah user>']

handler.tags = ['info']

handler.command = /^(leaderboard|lb)$/i

handler.group = true

handler.rpg = true

module.exports = handler

function sort(property, ascending = true) {

  if (property)

    return (...args) =>

      args[ascending & 1][property] - args[!ascending & 1][property]

  else

    return (...args) => args[ascending & 1] - args[!ascending & 1]

}

function toNumber(property, _default = 0) {

  if (property)

    return (a, i, b) => {

      return {

        ...b[i],

        [property]: a[property] === undefined ? _default : a[property]

      }

    }

  else return (a) => (a === undefined ? _default : a)

}

function enumGetKey(a) {

  return a.jid

}

