**Informasi Pembaruan:**  
----  
- ✅ **Update  Lid resolver**  Penanganan lid jadi terbaru
- ✅ **Menggunakan Baileys Latest**  [Baileys](https://github.com/WhiskeySockets/Baileys)
- ✅ **Delete QR Code** Jadi Alternatif Nya Memakai Pairing Code
- ✅ **Wajib Menggunakan Node.js 20++**


### Contact Admin
Hubungi admin melalui WhatsApp untuk informasi lebih lanjut atau bantuan cepat.

<p align="center">
  <a href="https://wa.me/6282215415550">
    <img src="https://img.shields.io/badge/WhatsApp-25D366?style=for-the-badge&logo=whatsapp&logoColor=white" alt="WhatsApp">
  </a>
</p>

### **Perintah Start & Pairing:**  
```bash
node index.js
```  

- **Fitur Bot 97%** implementasi dari Rest API, jadi **wajib daftar terlebih dahulu** agar bot bekerja dengan baik.  

📢 **Informasi API & Update Script:** [WhatsApp Channel](https://www.whatsapp.com/channel/0029VbCFzkZCcW4uazD1fB0S)  

----  

## Catatan Penting!  
**Important:**  

- Untuk menggunakan bot ini, kamu diwajibkan mengisi **`Apikey`** terlebih dahulu. Jika tidak, bot tidak akan berfungsi dengan baik.  
- Script ini **tidak bisa dijalankan** di **Termux** atau **Panel** yang tidak memiliki kelengkapan seperti:  
  - ffmpeg  
  - imagemagick  
  - webp  

> Atau panel yang tidak bisa menginstal module **express.js**.  

- Menggunakan **97% fitur** dari [`RestApi`](https://api.botcahx.eu.org)  

----  

## Apikey:  
- ✅ **Free ApiKey** 15 Request per/day (perhari)  
- ➕ **Direkomendasikan untuk upgrade ke premium plan**  
- Jika ingin membeli **`Apikey Premium`**, silakan daftar lalu pilih paket yang dibutuhkan: [`Pilih Paket`](https://api.botcahx.eu.org/price)  

### **Website API:**  
- BOTCAHX [`Register`](https://api.botcahx.eu.org)  
- Setelah mendapatkan apikey, paste di **config.js** pada bagian **`global.btc`**.  

> **Catatan:** Pastikan fitur yang digunakan juga disesuaikan.  

---  

## **Base Original**  
Base original [`Link`](https://github.com/HelgaIlham/ZukaBet)  

---  

## **Run On Heroku**  

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/BOTCAHX/RTXZY-MD)  

### **Heroku Buildpack**  

**Instal Buildpack:**  
```bash
heroku/nodejs
https://github.com/jonathanong/heroku-buildpack-ffmpeg-latest.git
https://github.com/clhuang/heroku-buildpack-webp-binaries.git
```  

---  

## **Untuk Pengguna Windows/VPS/RDP**  

✅ **Unduh & Instal:**  
- [Git](https://git-scm.com/downloads) [`Klik Disini`](https://git-scm.com/downloads)  
- [NodeJS](https://nodejs.org/en/download) [`Klik Disini`](https://nodejs.org/en/download)  
- [FFmpeg](https://ffmpeg.org/download.html) [`Klik Disini`](https://ffmpeg.org/download.html) (**Jangan lupa tambahkan ke PATH**)  
- [ImageMagick](https://imagemagick.org/script/download.php) [`Klik Disini`](https://imagemagick.org/script/download.php)  

### FOR VPS USER
```bash
apt update && apt upgrade -y
apt install nodejs imagemagick ffmpeg -y
node -v
if the version is still under 17, use this step
curl -s https://deb.nodesource.com/setup_21.x | sudo bash
apt-get install -y nodejs
```

```bash
git clone https://github.com/BOTCAHX/RTXZY-MD
cd RTXZY-MD
npm i
node index.js
```  


## ```Arguments node . [--options] [<session name>]```

## `--pconly`
* If that chat not from private bot, bot will ignore

## `--gconly`
* If that chat not from group, bot will ignore

## `--swonly`
* If that chat not from status, bot will ignore

## `--prefix <prefixes>`
* `prefixes` are seperated by each character
Set prefix

### `--db <your mongodb url>`

Open the package.json file and fill in your mongodb url in the `mongodb: --db mongodb url` section!

## `--server`
* Used for [heroku](https://heroku.com/) or scan through website

## `--restrict`
* Enables restricted plugins (which can lead your number to be **banned** if used too often)
* Group Administration `add, kick`

## `--img`
* Enable image inspector through terminal

## `--autoread`
* If enabled, all incoming messages will be marked as read

## `--nyimak`
* No bot, just print received messages and add users to database

## `--test`
* **Development** Testing Mode 

## `--self`
* **Only Owner & Bot** 

---------
