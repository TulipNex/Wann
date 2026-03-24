let PhoneNumber = require('awesome-phonenumber')
let levelling = require('../lib/levelling')
const { createHash } = require('crypto')
const Jimp = require('jimp') // Menggunakan Jimp untuk memanipulasi gambar

let handler = async (m, { conn, usedPrefix, command, text }) => {
  let who = m.quoted ? m.quoted.sender : (m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : (text ? (text.replace(/[^0-9]/g, '') + '@s.whatsapp.net') : m.sender))

  if (!who.includes('@')) who += '@s.whatsapp.net'

  let users = global.db.data.users
  if (!users[who]) users[who] = { exp: 0, limit: 10, lastclaim: 0, registered: false, name: '', age: -1, regTime: -1, premium: false, premiumTime: 0, level: 0, money: 0, pasangan: '', role: 'Newbie ㋡', banned: false, unlockedTitles: [], activeTitle: "" }

  let user = users[who]
  
  // Mengambil variabel activeTitle untuk menampilkan Gelar
  let { name, limit, exp, money, lastclaim, premiumTime, premium, registered, age, level, pasangan, activeTitle } = user

  // Get Profile Picture & Bio
  let pp = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSXIdvC1Q4WL7_zA6cJm3yileyBT2OsWhBb9Q&usqp=CAU'
  try { pp = await conn.profilePictureUrl(who, 'image') } catch (e) {}
  let about = ''; try { about = (await conn.fetchStatus(who)).status || '' } catch {}

  // 1. DYNAMIC RPG ROLE SYNC
  let role = (level <= 2) ? 'Newbie ㋡'
    : (level <= 4) ? 'Beginner Grade 1 ⚊¹'
    : (level <= 6) ? 'Beginner Grade 2 ⚊²'
    : (level <= 8) ? 'Beginner Grade 3 ⚊³'
    : (level <= 10) ? 'Beginner Grade 4 ⚊⁴'
    : (level <= 20) ? 'Private Grade 1 ⚌¹'
    : (level <= 30) ? 'Private Grade 2 ⚌²'
    : (level <= 40) ? 'Private Grade 3 ⚌³'
    : (level <= 50) ? 'Private Grade 4 ⚌⁴'
    : (level <= 60) ? 'Private Grade 5 ⚌⁵'
    : (level <= 70) ? 'Corporal Grade 1 ☰¹' 
    : (level <= 80) ? 'Corporal Grade 2 ☰²' 
    : (level <= 90) ? 'Corporal Grade 3 ☰³' 
    : (level <= 100) ? 'Corporal Grade 4 ☰⁴' 
    : (level <= 110) ? 'Corporal Grade 5 ☰⁵'
    : (level <= 120) ? 'Sergeant Grade 1 ≣¹'
    : (level <= 130) ? 'Sergeant Grade 2 ≣²'
    : (level <= 140) ? 'Sergeant Grade 3 ≣³'
    : (level <= 150) ? 'Sergeant Grade 4 ≣⁴'
    : (level <= 160) ? 'Sergeant Grade 5 ≣⁵' 
    : (level <= 170) ? 'Staff Grade 1 ﹀¹' 
    : (level <= 180) ? 'Staff Grade 2 ﹀²' 
    : (level <= 190) ? 'Staff Grade 3 ﹀³' 
    : (level <= 200) ? 'Staff Grade 4 ﹀⁴' 
    : (level <= 210) ? 'Staff Grade 5 ﹀⁵' 
    : (level <= 220) ? 'Sergeant Grade 1 ︾¹'
    : (level <= 230) ? 'Sergeant Grade 2 ︾²'
    : (level <= 240) ? 'Sergeant Grade 3 ︾³'
    : (level <= 250) ? 'Sergeant Grade 4 ︾⁴'
    : (level <= 260) ? 'Sergeant Grade 5 ︾⁵'
    : (level <= 270) ? '2nd Lt. Grade 1 ♢¹'
    : (level <= 280) ? '2nd Lt. Grade 2 ♢²'  
    : (level <= 290) ? '2nd Lt. Grade 3 ♢³' 
    : (level <= 300) ? '2nd Lt. Grade 4 ♢⁴' 
    : (level <= 310) ? '2nd Lt. Grade 5 ♢⁵'
    : (level <= 320) ? '1st Lt. Grade 1 ♢♢¹'
    : (level <= 330) ? '1st Lt. Grade 2 ♢♢²'
    : (level <= 340) ? '1st Lt. Grade 3 ♢♢³'
    : (level <= 350) ? '1st Lt. Grade 4 ♢♢⁴'
    : (level <= 360) ? '1st Lt. Grade 5 ♢♢⁵'
    : (level <= 370) ? 'Major Grade 1 ✷¹'
    : (level <= 380) ? 'Major Grade 2 ✷²'
    : (level <= 390) ? 'Major Grade 3 ✷³'
    : (level <= 400) ? 'Major Grade 4 ✷⁴'
    : (level <= 410) ? 'Major Grade 5 ✷⁵'
    : (level <= 420) ? 'Colonel Grade 1 ✷✷¹'
    : (level <= 430) ? 'Colonel Grade 2 ✷✷²'
    : (level <= 440) ? 'Colonel Grade 3 ✷✷³'
    : (level <= 450) ? 'Colonel Grade 4 ✷✷⁴'
    : (level <= 460) ? 'Colonel Grade 5 ✷✷⁵'
    : (level <= 470) ? 'Brigadier Early ✰'
    : (level <= 480) ? 'Brigadier Silver ✩'
    : (level <= 490) ? 'Brigadier gold ✯' 
    : (level <= 500) ? 'Brigadier Platinum ✬'
    : (level <= 600) ? 'Brigadier Diamond ✪'
    : (level <= 700) ? 'Legendary 忍'
    : (level <= 800) ? 'Legendary 忍忍'
    : (level <= 900) ? 'Legendary 忍忍忍'
    : (level <= 1000) ? 'Legendary忍忍忍忍'
    : 'Infinity 숒';
  
  user.role = role

  // 2. TULIPNEX TRADER CALCULATION & BOARD
  let p = global.db.data.settings?.trading?.prices || {}
  let assetValue = (user.ivylink||0)*(p.IVL||3000) + (user.lilybit||0)*(p.LBT||100000) + (user.iriscode||0)*(p.IRC||1000000) + (user.lotusnet||0)*(p.LTN||10000000) + (user.rosex||0)*(p.RSX||100000000) + (user.tulipnex||0)*(p.TNX||1000000000)
  let networth = money + assetValue;

  let tnxHolders = Object.entries(users).filter(u => (u[1].tulipnex || 0) > 0).sort((a, b) => (b[1].tulipnex || 0) - (a[1].tulipnex || 0));
  let tnxRank = tnxHolders.findIndex(u => u[0] === who);
  let tulipRole = '';

  if (tnxRank === 0) tulipRole = 'CEO TulipNex';
  else if (tnxRank === 1) tulipRole = 'Komisaris Utama';
  else if (tnxRank === 2) tulipRole = 'Direktur Eksekutif';
  else {
      if (networth >= 1000000000000) tulipRole = '🐋 Whale'; 
      else if (networth >= 100000000000) tulipRole = '🦈 Shark'; 
      else if (networth >= 10000000000) tulipRole = '🐬 Dolphin'; 
      else if (networth >= 1000000000) tulipRole = '🐢 Turtle'; 
      else if (networth >= 100000000) tulipRole = '🦀 Crab'; 
      else tulipRole = '🐟 Shrimp'; 
  }

  let bankDebt = user.bankLoan ? simplifyMoney(user.bankLoan.debt) : 'Nihil'

  // 3. XP LOGIC
  let { min, xp, max } = levelling.xpRange(level, global.multiplier)
  let currentXpInLevel = exp - min
  let sn = createHash('md5').update(who).digest('hex').substring(0, 12)

  // LOGIKA TAMPILAN GELAR
  let displayTitle = activeTitle ? `\n*│* 🎖️ *Gelar:* ${activeTitle}` : '';

  let str = `
*╭───[ 👤 PROFILE USER ]───*
*│* 🆔 *Nama:* ${registered ? name : await conn.getName(who)}${displayTitle}
*│* 🏷️ *Tag:* @${who.split('@')[0]}
*│* 📝 *Bio:* ${about || 'Tidak ada bio'}
*│* 🎂 *Umur:* ${registered ? age + ' thn' : '-'}
*╰──────────────────*

*╭───[ ⚔️ RPG STATS ]───*
*│* 📊 *Level:* ${level}
*│* 🔰 *Role:* ${role}
*│* ✨ *Exp:* ${currentXpInLevel.toLocaleString('id-ID')} / ${xp.toLocaleString('id-ID')}
*│* 💎 *Limit:* ${limit.toLocaleString('id-ID')}
*╰──────────────────*

*╭───[ 📈 TRADER (CBE) ]───*
*│* 💵 *Tunai:* Rp ${simplifyMoney(money)}
*│* 💼 *Aset:* Rp ${simplifyMoney(assetValue)}
*│* 🏛️ *Networth:* Rp ${simplifyMoney(networth)}
*│* 🌟 *TulipNex:* ${tulipRole}
*│* 🏦 *Utang Bank:* ${bankDebt}
*╰──────────────────*

*╭───[ ⚙️ SYSTEM INFO ]───*
*│* 📌 *Daftar:* ${registered ? '✅' : '❌'}
*│* ⭐ *Premium:* ${premium ? '✅' : '❌'}
*│* ⏳ *Expired:* ${premium && premiumTime > 0 ? msToDate(premiumTime - Date.now()) : (premium ? 'Permanent' : '-')}
*│* 🔑 *S/N:* ${sn}...
*╰──────────────────*
`.trim()

  // 4. PEMROSESAN BINGKAI (KHUSUS DEWAN DIREKSI / TOP 3)
  let imagePayload = { url: pp };
  if (tnxRank >= 0 && tnxRank <= 2) {
      try {
          // Hanya render proses ini untuk 3 orang tertinggi, agar performa bot tidak berat
          let emblemBuffer = await createBoardEmblem(pp, tulipRole);
          if (Buffer.isBuffer(emblemBuffer)) {
              imagePayload = emblemBuffer;
          }
      } catch (e) {
          console.error("Gagal merender emblem:", e);
      }
  }

  await conn.sendMessage(m.chat, { image: imagePayload, caption: str, mentions: [who, ...(pasangan ? [pasangan] : [])] }, { quoted: m })
}

handler.help = ['profile', 'profil [@user]']
handler.tags = ['info']
handler.command = /^(profile?|profil)$/i

module.exports = handler

// ==========================================
// UTILITY FUNCTIONS
// ==========================================
function simplifyMoney(num) {
  if (num >= 1e12) return (num / 1e12).toFixed(1).replace(/\.0$/, '') + 'T'
  if (num >= 1e9) return (num / 1e9).toFixed(1).replace(/\.0$/, '') + 'M'
  if (num >= 1e6) return (num / 1e6).toFixed(1).replace(/\.0$/, '') + 'Jt'
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'Rb'
  return num.toString()
}

function msToDate(ms) {
  if (!ms || ms < 0) return '-'
  let d = Math.floor(ms / 86400000), h = Math.floor((ms % 86400000) / 3600000), m = Math.floor((ms % 3600000) / 60000)
  return `${d}hr ${h}j ${m}m`
}

/**
 * Membuat emblem bingkai dinamis menggunakan JIMP.
 * Frame warna akan menyesuaikan jabatan.
 */
async function createBoardEmblem(imgUrl, roleName) {
    try {
        let img = await Jimp.read(imgUrl);
        img.resize(500, 500);
        
        // Tentukan warna bingkai (Format: RRGGBBAA)
        let frameColor = 0xFFFFFFFF; // Default Putih
        if (roleName.includes('CEO')) frameColor = 0xFFD700FF; // Warna Emas (Gold)
        else if (roleName.includes('Komisaris')) frameColor = 0xC0C0C0FF; // Warna Perak (Silver)
        else if (roleName.includes('Direktur')) frameColor = 0xCD7F32FF; // Warna Perunggu (Bronze)

        // Membuat kanvas bingkai dasar (sedikit lebih besar dari gambar)
        let border = new Jimp(540, 580, frameColor);
        border.composite(img, 20, 20);

        // Menambahkan kotak putih untuk alas teks (nametag)
        let badge = new Jimp(540, 60, 0xFFFFFFFF);
        
        // Memuat font dan mencetak jabatan di tengah nametag
        let font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
        badge.print(font, 0, 0, {
            text: roleName.toUpperCase(),
            alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
            alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
        }, 540, 60);
        
        // Tempel nametag di bagian bawah bingkai
        border.composite(badge, 0, 520);
        
        // Kembalikan hasilnya dalam bentuk Buffer agar siap dikirim oleh bot
        return await border.getBufferAsync(Jimp.MIME_JPEG);
    } catch (e) {
        throw e;
    }
}