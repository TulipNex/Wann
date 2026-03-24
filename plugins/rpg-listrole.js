/**
 * RPG ROLE & LEVEL LIST
 * Location: ./plugins/rpg-rolelist.js
 * Feature: Menampilkan daftar seluruh role yang tersedia di game.
 */

let handler = async (m, { conn, usedPrefix }) => {
  let text = `
*🔰 DAFTAR ROLE & LEVEL RPG 🔰*
Terus tingkatkan levelmu untuk mendapatkan pangkat tertinggi di server!

*🌱 PEMULA*
• Lv 0-2 : Newbie ㋡
• Lv 3-10 : Beginner Grade 1 - 4 (⚊)

*🪖 PRAJURIT*
• Lv 11-60 : Private Grade 1 - 5 (⚌)
• Lv 61-110 : Corporal Grade 1 - 5 (☰)
• Lv 111-160 : Sergeant Grade 1 - 5 (≣)
• Lv 161-210 : Staff Grade 1 - 5 (﹀)
• Lv 211-260 : Sergeant Grade 1 - 5 (︾)

*🎖️ PERWIRA*
• Lv 261-310 : 2nd Lt. Grade 1 - 5 (♢)
• ++ Tiap 10 Level Naik Grade (1-5) ++
• Lv 311-360 : 1st Lt. Grade 1 - 5 (♢♢)
• Lv 361-410 : Major Grade 1 - 5 (✷)
• Lv 411-460 : Colonel Grade 1 - 5 (✷✷)

*🌟 JENDRAL*
• Lv 461-470 : Brigadier Early ✰
• Lv 471-480 : Brigadier Silver ✩
• Lv 481-490 : Brigadier Gold ✯
• Lv 491-500 : Brigadier Platinum ✬
• Lv 501-600 : Brigadier Diamond ✪

*👑 LEGENDA*
• Lv 601-700 : Legendary 忍
• Lv 701-800 : Legendary 忍忍
• Lv 801-900 : Legendary 忍忍忍
• Lv 901-1000 : Legendary 忍忍忍忍
• Lv > 1000 : Infinity 숒

_Ketik *${usedPrefix}role* untuk melihat pangkatmu saat ini!_
`.trim();

  conn.reply(m.chat, text, m);
}

handler.help = ['listrole']
handler.tags = ['rpg']
handler.command = /^(listrole|roles|daftarrole|rolelist)$/i
handler.rpg = true
handler.register = true // Memastikan hanya yang sudah daftar yang bisa cek

module.exports = handler;