const fetch = require('node-fetch');

// --- FUNGSI KAMUS PENERJEMAH PINTAR ---
function terjemahkanCuaca(cuacaInggris) {
    if (!cuacaInggris) return '-';
    let cuacaLower = cuacaInggris.toLowerCase().trim();
    
    const kamus = {
        'clear': 'cerah',
        'clear sky': 'langit cerah',
        'clouds': 'berawan',
        'cloudy': 'berawan',
        'few clouds': 'sedikit berawan',
        'scattered clouds': 'awan tersebar',
        'broken clouds': 'awan tebal',
        'overcast clouds': 'mendung',
        'partly cloudy': 'cerah berawan',
        'rain': 'hujan',
        'light rain': 'hujan ringan',
        'moderate rain': 'hujan sedang',
        'heavy rain': 'hujan lebat',
        'heavy intensity rain': 'hujan sangat lebat',
        'shower rain': 'hujan rintik',
        'drizzle': 'gerimis',
        'thunderstorm': 'badai petir',
        'snow': 'salju',
        'mist': 'kabut tipis',
        'fog': 'kabut tebal',
        'haze': 'kabut asap',
        'smoke': 'berasap',
        'sunny': 'cerah',
        'overcast': 'mendung'
    };

    let hasil = kamus[cuacaLower];

    if (!hasil) {
        if (cuacaLower.includes('cloud')) hasil = 'berawan';
        else if (cuacaLower.includes('rain')) hasil = 'hujan';
        else if (cuacaLower.includes('thunder')) hasil = 'badai petir';
        else if (cuacaLower.includes('clear') || cuacaLower.includes('sun')) hasil = 'cerah';
        else if (cuacaLower.includes('snow')) hasil = 'salju';
        else if (cuacaLower.includes('fog') || cuacaLower.includes('mist') || cuacaLower.includes('haze')) hasil = 'kabut';
        else hasil = cuacaInggris; 
    }

    return hasil.split(' ').map(kata => kata.charAt(0).toUpperCase() + kata.slice(1)).join(' ');
}
// --------------------------------------

let handler = async (m, { conn, args: [event], text }) => {
  if (!event) throw `List Event: welcome, bye, delete, promote, demote, cuaca`;
  let mentions = text.replace(event, "").trimStart();
  let who = mentions ? conn.parseMention(mentions) : [];
  let participants = who.length ? who : [m.sender];
  let action = false;
  
  m.reply(`Simulating ${event}...`);
  
  switch (event.toLowerCase()) {
    case "add":
    case "invite":
    case "welcome":
      action = "add";
      break;
    case "bye":
    case "kick":
    case "leave":
    case "remove":
      action = "remove";
      break;
    case "promote":
      action = "promote";
      break;
    case "demote":
      action = "demote";
      break;
    case "delete":
      deleted = m;
      break;
      
    // ======= SIMULASI CUACA =======
    case "cuaca":
    case "weather":
      try {
          let location = 'Kendari'; 
          let res = await fetch(`https://api.botcahx.eu.org/api/tools/cuaca?query=${encodeURIComponent(location)}&apikey=${global.btc || btc}`);
          let json = await res.json();
          
          if (json.status && json.code === 200) {
              let result = json.result;
              let kondisiIndo = terjemahkanCuaca(result.weather);

              const reminderMessage = `🌤️ *PENGINGAT CUACA ${result.location.toUpperCase()}* 🌤️\n\n` +
                                      `🌍 Negara: ${result.country}\n` +
                                      `🌦️ Kondisi: ${kondisiIndo}\n` + 
                                      `🌡️ Suhu Saat Ini: ${result.currentTemp}\n` +
                                      `📈 Suhu Tertinggi: ${result.maxTemp}\n` +
                                      `📉 Suhu Terendah: ${result.minTemp}\n` +
                                      `💧 Kelembapan: ${result.humidity}\n` +
                                      `🌬️ Angin: ${result.windSpeed}\n\n` + 
                                      `_Tetap waspada dan jaga kesehatan!_`;
                                      
              await conn.sendMessage(m.chat, { text: reminderMessage });
              return; 
          } else {
              throw 'Data cuaca tidak ditemukan dari API.';
          }
      } catch (e) {
          return m.reply('❌ Gagal simulasi cuaca: ' + e.message);
      }
      break;
    // =======================================

    default:
      throw `List Event: welcome, bye, delete, promote, demote, cuaca`;
  }
  
  if (action) {
    return conn.participantsUpdate({
      id: m.chat,
      participants,
      action,
    });
  }
  
  if (event.toLowerCase() === 'delete') return conn.onDelete(m);
};

handler.help = ["simulate <event> [@mention]"];
handler.tags = ["owner"];
handler.command = /^(simulate|simulasi)$/i;
handler.owner = false;

module.exports = handler;