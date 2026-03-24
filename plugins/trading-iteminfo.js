/**
 * TULIPNEX ASSET WIKI & LORE
 * Location: ./plugins/trading-iteminfo.js
 * Feature: Menampilkan deskripsi, lore, spesifikasi fundamental, dan opsi 'ALL'
 * Update: Deskripsi/Lore diperkaya agar lebih detail dan imersif.
 */

let handler = async (m, { conn, args, usedPrefix, command }) => {
    // 1. Database Latar Belakang & Spesifikasi Aset (Cyber-Botanical Lore)
    const assetLore = {
        IVL: {
            name: 'IvyLink',
            desc: 'IvyLink adalah modul sensor IoT (Internet of Things) esensial yang menjadi tulang punggung sektor agrikultur urban. Modul ini ditanamkan pada jutaan kebun vertikal pintar di seluruh metropolis untuk memantau kelembapan, nutrisi tanah, dan cuaca secara real-time. Karena harganya yang sangat terjangkau dan pergerakannya yang lambat, aset ini direkomendasikan sebagai tempat belajar bagi trader pemula.',
            tech: 'Micro-Sensor Mesh Network',
            min: 2, max: 99999, vol: '3% per siklus',
            tax: '1.5%'
        },
        LBT: {
            name: 'LilyBit',
            desc: 'LilyBit merupakan platform dompet digital dan protokol DeFi terdesentralisasi yang terinspirasi dari ketahanan bunga Lily. Jaringan ini memfasilitasi jutaan transaksi mikro harian warga kelas menengah, mulai dari jual-beli bibit hingga pembayaran utilitas. Dengan fitur staking dan biaya gas yang rendah, LBT menjadi primadona favorit bagi investor ritel.',
            tech: 'Decentralized Ledger Technology (DLT)',
            min: 100000, max: 999999, vol: '5% per siklus',
            tax: '1.5%'
        },
        IRC: {
            name: 'IrisCode',
            desc: 'IrisCode adalah perangkat lunak biometrik dan enkripsi tingkat militer yang diadaptasi dari pola unik kelopak bunga Iris. Algoritma ini digunakan secara eksklusif oleh bank sentral, korporasi mega, dan fasilitas militer untuk mengamankan akses ke brankas data rahasia. Volatilitasnya sangat bergantung pada kontrak pemerintah dan isu peretasan siber global.',
            tech: 'Quantum Biometric Encryption',
            min: 1000000, max: 9999999, vol: '10% per siklus',
            tax: '1.5%'
        },
        LTN: {
            name: 'LotusNet',
            desc: 'LotusNet adalah urat nadi infrastruktur internet masa depan. Menggunakan kombinasi server pendingin bawah laut dan kluster satelit orbit, jaringan ini menopang seluruh komputasi awan global dan realitas virtual (Metaverse). Pergerakan harga LTN sangat sensitif terhadap kerusakan perangkat keras massal, cuaca luar angkasa, dan kemitraan dengan penyedia layanan streaming raksasa.',
            tech: 'Distributed Oceanic Cloud',
            min: 10000000, max: 99999999, vol: '15% per siklus',
            tax: '1.5%'
        },
        RSX: {
            name: 'RoseX',
            desc: 'RoseX adalah komoditas super-mewah yang lahir dari modifikasi kode genetik mawar digital sintetis. Aset kelangkaan tinggi ini diburu oleh kaum elit dan selebritas Metaverse sebagai bahan baku utama pembuatan AI-Perfume (parfum feromon digital) serta perhiasan NFT eksklusif. Sifatnya yang mewah membuat harganya sangat fluktuatif mengikuti tren fashion, skandal, dan gaya hidup sosialita.',
            tech: 'Synthetic Genetic Blockchain',
            min: 100000000, max: 999999999, vol: '20% per siklus',
            tax: '1.5%'
        },
        TNX: {
            name: 'TulipNex',
            desc: 'TulipNex adalah mahkota kejayaan dan pusat singularitas dari seluruh ekosistem ekonomi. Lebih dari sekadar aset, TNX diakui sebagai mata uang cadangan resmi oleh Federasi Galaksi dan sumber energi komputasi absolut untuk Nexus Core. Menjadi pemegang utama (Top 3 Whale) TNX tidak hanya memberikan kekayaan tanpa batas, tetapi juga anugerah kekuatan politik untuk memimpin perusahaan dan mengatur regulasi pajak bursa.',
            tech: 'Nexus Core Singularity',
            min: 1000000000, max: 10000000000, vol: '25% per siklus',
            tax: '2.5% (Luxury Tax)'
        }
    };

    // 2. Ambil Harga Saat Ini (Jika Trading Aktif)
    let currentPrices = {};
    if (global.db.data.settings && global.db.data.settings.trading && global.db.data.settings.trading.prices) {
        currentPrices = global.db.data.settings.trading.prices;
    }

    let ticker = (args[0] || '').toUpperCase();

    // 3. FITUR BARU: Jika pengguna mengetik 'ALL'
    if (ticker === 'ALL') {
        let allTxt = `📚 *TULIPNEX ENSIKLOPEDIA ASET*\n`;
        allTxt += `──────────────────\n`;
        
        for (let t in assetLore) {
            let asset = assetLore[t];
            let priceNow = currentPrices[t] ? `Rp ${currentPrices[t].toLocaleString('id-ID')}` : `Rp ${asset.min.toLocaleString('id-ID')} (Offline)`;
            
            allTxt += `🧬 *${t} - ${asset.name}*\n`;
            allTxt += `💰 *Harga Live:* ${priceNow}\n`;
            allTxt += `📜 *Lore:* _${asset.desc}_\n`;
            allTxt += `⚙️ *Tech:* ${asset.tech}\n`;
            allTxt += `📈 *Vol:* ${asset.vol}\n`;
            allTxt += `🧾 *Tax:* ${asset.tax}\n`;
            allTxt += `──────────────────\n`;
        }
        
        allTxt += `💡 _Pahami fundamental sebelum berinvestasi!_`;
        return m.reply(allTxt);
    }

    // 4. Jika kosong atau tidak valid (Kirim Daftar Aset)
    if (!ticker || !assetLore[ticker]) {
        let listTxt = `📖 *TULIPNEX ASSET WIKI*\n`;
        listTxt += `──────────────────\n`;
        listTxt += `Ketik *${usedPrefix}${command} <ticker>* untuk detail aset.\n`;
        listTxt += `Ketik *${usedPrefix}${command} all* untuk melihat semua fundamental.\n\n`;
        listTxt += `*Daftar Ticker Tersedia:*\n`;
        
        for (let t in assetLore) {
            listTxt += `• *${t}* (${assetLore[t].name})\n`;
        }
        
        listTxt += `──────────────────\n`;
        listTxt += `💡 *Contoh:* ${usedPrefix}${command} TNX`;
        
        return m.reply(listTxt);
    }

    // 5. Tampilkan Detail 1 Aset Spesifik
    let asset = assetLore[ticker];
    let priceNow = currentPrices[ticker] ? `Rp ${currentPrices[ticker].toLocaleString('id-ID')}` : 'Rp ' + asset.min.toLocaleString('id-ID') + ' (Offline)';

    let detailTxt = `🧬 *FUNDAMENTAL ASSET: ${ticker}*\n`;
    detailTxt += `──────────────────\n`;
    detailTxt += `🏷️ *Nama Aset:* ${asset.name}\n`;
    detailTxt += `💰 *Harga Live:* ${priceNow}\n`;
    detailTxt += `──────────────────\n`;
    detailTxt += `📜 *Lore / Latar Belakang:*\n_${asset.desc}_\n\n`;
    detailTxt += `⚙️ *Spesifikasi Teknis:*\n`;
    detailTxt += `• *Teknologi:* ${asset.tech}\n`;
    //detailTxt += `• *Floor Price:* Rp ${asset.min.toLocaleString('id-ID')}\n`;
    //detailTxt += `• *Max Price:* Rp ${asset.max.toLocaleString('id-ID')}\n`;
    detailTxt += `• *Volatilitas:* ${asset.vol}\n`;
    detailTxt += `• *Pajak Jual:* ${asset.tax}\n`;
    detailTxt += `──────────────────\n`;
    detailTxt += `💡 _Pahami fundamental sebelum berinvestasi!_`;

    return m.reply(detailTxt);
}

handler.help = ['deskripsi <ticker/all>']
handler.tags = ['tulipnex']
handler.command = /^(tick|desk|ticker|deskripsi|fundamental)$/i
handler.rpg = true

module.exports = handler;