const axios = require('axios');
const moment = require('moment-timezone'); // Wajib pakai ini agar jam akurat

let location = 'Kendari'; 
let lastSent = ''; // Pengunci agar tidak spam double di menit yang sama

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

    // Deteksi cerdas jika kata tidak persis sama dengan di kamus
    if (!hasil) {
        if (cuacaLower.includes('cloud')) hasil = 'berawan';
        else if (cuacaLower.includes('rain')) hasil = 'hujan';
        else if (cuacaLower.includes('thunder')) hasil = 'badai petir';
        else if (cuacaLower.includes('clear') || cuacaLower.includes('sun')) hasil = 'cerah';
        else if (cuacaLower.includes('snow')) hasil = 'salju';
        else if (cuacaLower.includes('fog') || cuacaLower.includes('mist') || cuacaLower.includes('haze')) hasil = 'kabut';
        else hasil = cuacaInggris; 
    }

    // Mengubah huruf pertama setiap kata menjadi kapital
    return hasil.split(' ').map(kata => kata.charAt(0).toUpperCase() + kata.slice(1)).join(' ');
}
// --------------------------------------

async function getWeatherInfo() {
    try {
        const url = `https://api.botcahx.eu.org/api/tools/cuaca?query=${encodeURIComponent(location)}&apikey=${global.btc || btc}`;
        const response = await axios.get(url);
        const res = response.data.result; 

        if (!res) {
            console.log('⚠️ Data cuaca tidak tersedia dari API');
            return;
        }

        const weatherInfo = {
            location: res.location,
            country: res.country,
            weather: terjemahkanCuaca(res.weather), // Menerjemahkan & Kapitalisasi
            currentTemp: res.currentTemp,
            maxTemp: res.maxTemp,
            minTemp: res.minTemp, 
            humidity: res.humidity,
            windSpeed: res.windSpeed, 
        };

        sendWeatherReminderToGroups(weatherInfo);
    } catch (error) {
        console.error('[❗] Terjadi kesalahan saat mengambil data cuaca:', error.message);
    }
}

async function sendWeatherReminderToGroups(weatherInfo) {
    let conn = global.conn;
    if (!conn) {
        console.log('Koneksi bot belum siap untuk mengirim cuaca.');
        return;
    }

    // Ambil semua ID chat grup
    let chats = Object.keys(conn.chats || {}).filter(jid => jid.endsWith('@g.us'));

    for (const chatId of chats) {
        const reminderMessage = `🌤️ *PENGINGAT CUACA ${weatherInfo.location.toUpperCase()}* 🌤️\n\n` +
                                `🌍 Negara: ${weatherInfo.country}\n` +
                                `🌦️ Kondisi: ${weatherInfo.weather}\n` +
                                `🌡️ Suhu Saat Ini: ${weatherInfo.currentTemp}\n` +
                                `📈 Suhu Tertinggi: ${weatherInfo.maxTemp}\n` +
                                `📉 Suhu Terendah: ${weatherInfo.minTemp}\n` +
                                `💧 Kelembapan: ${weatherInfo.humidity}\n` +
                                `🌬️ Angin: ${weatherInfo.windSpeed}\n\n` +
                                `_Tetap waspada dan jaga kesehatan!_`;
        
        try {
            await conn.sendMessage(chatId, { text: reminderMessage }); 
        } catch (e) {
            console.error(`Gagal mengirim info cuaca ke grup: ${chatId}`);
        }
    }
}

function checkTimeAndSendWeather() {
    // Kunci zona waktu ke Kendari (WITA / Asia/Makassar)
    const now = moment().tz('Asia/Makassar');
    const hours = now.hours();
    const minutes = now.minutes();
    const timeString = `${hours}:${minutes}`;

    // JADWAL BARU: Setiap 3 jam sekali (habis dibagi 3) pada menit ke-00
    if (hours % 3 === 0 && minutes === 0) { 
        if (lastSent !== timeString) {
            lastSent = timeString; 
            console.log(`[${timeString} WITA] Mengambil data cuaca terbaru untuk pengingat 3 jam-an...`);
            getWeatherInfo(); 
        }
    }
}

function startDailyWeatherReminder() {
    // Mengecek waktu setiap 30 detik
    setInterval(() => {
        checkTimeAndSendWeather(); 
    }, 30000);
}

module.exports = {
    startDailyWeatherReminder
};