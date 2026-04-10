require("dotenv").config();

global.owner = ["6282215415550", "6285591068997"]; // wajib di isi tidak boleh kosong
global.mods = ["6285591068997"]; // wajib di isi tidak boleh kosong
global.prems = ["6282215415550"]; // wajib di isi tidak boleh kosong
global.nameowner = "Mitraaa"; // wajib di isi tidak boleh kosong
global.numberowner = "6282215415550"; // wajib di isi tidak boleh kosong
global.mail = "tulipnexsupport@gmail.com"; // wajib di isi tidak boleh kosong
global.gc = "https://chat.whatsapp.com/Futdln0tFp2Jf0uSkp9o1O?mode=gi_t"; // wajib di isi tidak boleh kosong
global.instagram = "https://instagram.com/mitrawann"; // wajib di isi tidak boleh kosong
global.botname = "Mobius"; //isi nama bot kalian
global.wm = "© Mitra"; // isi nama bot atau nama kalian
global.wait = "_*Tunggu sedang di proses...*_"; // ini pesan simulasi loading
global.eror = "_*Server Error*_"; // ini pesan saat terjadi kesalahan
global.stiker_wait = "*⫹⫺ Stiker sedang dibuat...*"; // ini pesan simulasi saat loading pembuatan sticker
global.packname = "Created-By"; // watermark stikcker packname
global.author = "Mitraaa"; // watermark stikcker author
global.maxwarn = "5"; // Peringatan maksimum Warn
global.api_gsheet = 'https://script.google.com/macros/s/AKfycby_fTiUoHegm0lEo8dPd0WsdsBCm45_lxT3F8a_jXabLmau2y8lHzKbSVFQGA_fcXbL/exec' // Simpan URL Web App Google Apps Script di sini
global.gemini = "AIzaSyDmrHqL_m9OMmknG26yKPKF_Tffq5IWumA" // Ganti dengan API Key Anda
global.nytApiKey = 'a7mMCVwS0o40SUo3aqWkDxTAfL51vI7XYsCAAKBSx9uRbAUG';


global.autobio = false; // Set true/false untuk mengaktifkan atau mematikan autobio (default: false)
global.antiporn = false; // Set true/false untuk Auto delete pesan porno (bot harus admin) (default: false)
global.spam = false; // Set true/false untuk anti spam (default: false)
global.gcspam = false; // Set true/false untuk menutup grup ketika spam (default: false)

// APIKEY INI WAJIB DI ISI! //
global.btc = "mitraaa";
// global.btc = process.env.API_KEY_BTC;
// aktifkan akses .env di atas jika kamu ingin menaruh key api di .env
// Daftar terlebih dahulu https://api.botcahx.eu.org

// AKSESKEY INI DI ISI JIKA DIPERLUKAN (e.g suno ai (ai music ) & fitur prem lainnya//
global.aksesKey = "mitraaa";
// global.aksesKey = process.env.API_KEY_BTC_AKSESKEY;
// aktifkan akses .env di atas jika kamu ingin menaruh key api di .env
// Daftar terlebih dahulu https://api.botcahx.eu.org

// Tidak boleh diganti atau di ubah
global.APIs = {
  btc: "https://api.botcahx.eu.org",
};

//Tidak boleh diganti atau di ubah
global.APIKeys = {
  "https://api.botcahx.eu.org": global.btc,
};

let fs = require("fs");
let chalk = require("chalk");
let file = require.resolve(__filename);
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  console.log(chalk.redBright("Update 'config.js'"));
  delete require.cache[file];
  require(file);
});

