/*
@ author: Herza
@ type : CommonJS
@ ========> Info <=========
@ github: https://github.com/herzonly
@ wa_channel: https://whatsapp.com/channel/0029VaGVOvq1iUxY6WgHLv2R
*/

const axios = require('axios')

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) throw `Masukkan prompt!\n\nContoh:\n${usedPrefix + command} a cat playing in a garden`
  m.reply('*Mohon tunggu, sedang generate video...*')
  const prompt = args.join(' ')
  try {
    const create = await axios.get(`https://api.dashx.dpdns.org/api/AI/sora2?prompt=${encodeURIComponent(prompt)}&key=${dhx}`)
    if (!create.data.success) throw 'Gagal membuat job'
    const jobId = create.data.data.job_id
    let job = null
    for (let i = 0; i < 60; i++) {
      await new Promise(r => setTimeout(r, 5000))
      const check = await axios.get(`https://api.dashx.dpdns.org/api/job/sora2?id=${jobId}&key=${dhx}`)
      if (!check.data.success) throw 'Job gagal di server'
      if (check.data.data.status === 'completed') { job = check.data.data; break }
      if (check.data.data.status === 'failed') throw 'Job gagal: ' + (check.data.data.message || 'unknown error')
    }
    if (!job) throw 'Timeout: video tidak selesai dalam waktu yang ditentukan'
    const videoUrl = job.result?.saved?.[0]?.url || job.result?.resultUrls?.[0]
    if (!videoUrl) throw 'URL video tidak ditemukan'
    const buf = Buffer.from((await axios.get(videoUrl, { responseType: 'arraybuffer', headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 60000 })).data)
    await conn.sendFile(m.chat, buf, 'sora2.mp4', `*====[ Sora2 Video Generator ]====*\n🎬 | Prompt: ${prompt}\n⏱️ | Cost Time: ${job.result?.costTime || '-'}s`, m)
  } catch (err) {
    console.log(err)
    throw typeof err === 'string' ? err : 'Terjadi kesalahan, coba lagi nanti'
  }
}

handler.help = ['sora2']
handler.command = /^(sora2|sora|aivideo)$/i
handler.tags = ['ai']
handler.limit = 5
module.exports = handler