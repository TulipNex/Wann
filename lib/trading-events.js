/**
 * TULIPNEX MARKET EVENTS DATABASE (REWORKED SCI-FI LORE)
 * Path: ./lib/trading-events.js
 * Description: Ratusan skenario ekonomi & anomali teknologi yang sinkron dengan iteminfo V2.
 * Total: 100 Events (10 Global + 15 IVL + 15 LBT + 15 IRC + 15 LTN + 15 RSX + 15 TNX)
 */

const eventPool = [
    // =========================================================================
    // 🌍 TIER 0: GLOBAL EVENTS (10 Events) - Memengaruhi Seluruh Market
    // =========================================================================
    { title: 'NEXUS BLACKOUT', msg: 'Badai elektromagnetik melumpuhkan grid utama! Pasar panik dan aset digital anjlok massal.', type: 'bear', ticker: 'GLOBAL', mult: -4.0, dur: 5 },
    { title: 'FEDERATION STIMULUS', msg: 'Federasi Galaksi menyuntikkan likuiditas kuantum. Era keemasan investasi dimulai!', type: 'bull', ticker: 'GLOBAL', mult: 3.5, dur: 8 },
    { title: 'AI SINGULARITY LEAK', msg: 'Kecerdasan Buatan tier-9 mendistribusikan prediksinya ke publik. Volatilitas meledak tak terkendali!', type: 'bull', ticker: 'GLOBAL', mult: 4.0, dur: 4 },
    { title: 'CYBER-WARFARE', msg: 'Faksi pemberontak menyerang node utama perbankan. Investor melikuidasi aset besar-besaran.', type: 'bear', ticker: 'GLOBAL', mult: -5.0, dur: 4 },
    { title: 'TECH-UTOPIA', msg: 'Perjanjian damai antar faksi tekno disahkan. Euforia pasar mengangkat seluruh valuasi aset botani!', type: 'bull', ticker: 'GLOBAL', mult: 2.8, dur: 10 },
    { title: 'HYPER-INFLATION BUG', msg: 'Bug pada algoritma pencetakan kredit memicu ketakutan hiper-inflasi. Harga aset berdarah.', type: 'bear', ticker: 'GLOBAL', mult: -3.0, dur: 6 },
    { title: 'UNIVERSAL BASIC INCOME', msg: 'Pemerintah siber membagikan kredit universal, memicu gelombang ritel untuk memborong aset.', type: 'bull', ticker: 'GLOBAL', mult: 2.5, dur: 7 },
    { title: 'SOLAR FLARE X-CLASS', msg: 'Jilatan api matahari merusak satelit transaksi antar-planet. Koneksi lambat, harga jatuh.', type: 'bear', ticker: 'GLOBAL', mult: -3.5, dur: 5 },
    { title: 'QUANTUM DECRYPTION PANIC', msg: 'Komputer kuantum generasi baru berhasil memecahkan enkripsi bursa! Kepercayaan pasar runtuh sementara.', type: 'bear', ticker: 'GLOBAL', mult: -4.5, dur: 4 },
    { title: 'INTERGALACTIC TRADE PACT', msg: 'Pakta perdagangan antar-galaksi ditandatangani. Modal asing alien mengalir deras ke bursa Nexus!', type: 'bull', ticker: 'GLOBAL', mult: 3.2, dur: 6 },

    // =========================================================================
    // 🌱 TIER 1: IVYLINK (IVL) - Bio-Mesh Network (15 Events)
    // =========================================================================
    { title: 'NEO-TERRAFORMING', msg: 'Kontrak terraforming planet Mars resmi menggunakan sulur IVL sebagai basis jaringannya!', type: 'bull', ticker: 'IVL', mult: 1.8, dur: 6 },
    { title: 'ROOT ROT MALWARE', msg: 'Virus Root-Rot menginfeksi serat optik IvyLink, menurunkan kecepatan data hingga 40%.', type: 'bear', ticker: 'IVL', mult: -2.0, dur: 5 },
    { title: 'BIO-LUMINESCENCE UPGRADE', msg: 'Mutasi genetik baru membuat sulur IVL memancarkan cahaya, menghemat biaya listrik data center.', type: 'bull', ticker: 'IVL', mult: 1.6, dur: 8 },
    { title: 'SYNTHETIC PESTS', msg: 'Hama nanobot pemakan serat optik dilaporkan menyerang ladang server IVL di Eropa.', type: 'bear', ticker: 'IVL', mult: -1.9, dur: 4 },
    { title: 'SMART-CITY ADOPTION', msg: 'Tiga Megalopolis baru mewajibkan penggunaan IVL untuk jaringan jalan bawah tanah mereka.', type: 'bull', ticker: 'IVL', mult: 2.0, dur: 7 },
    { title: 'OVERGROWTH INCIDENT', msg: 'Sulur IVL tumbuh tak terkendali dan merusak server fisik klien, memicu tuntutan ganti rugi.', type: 'bear', ticker: 'IVL', mult: -2.2, dur: 3 },
    { title: 'PHOTOSYNTHESIS PATCH', msg: 'Patch terbaru memungkinkan IVL mengubah panas server menjadi energi sekunder!', type: 'bull', ticker: 'IVL', mult: 1.7, dur: 5 },
    { title: 'ECO-TERRORIST SABOTAGE', msg: 'Fraksi anti-teknologi memotong jaringan akar siber IVL di tiga benua utama secara serentak.', type: 'bear', ticker: 'IVL', mult: -2.5, dur: 4 },
    { title: 'DEEP-OCEAN CABLE', msg: 'IVL berhasil menyambungkan node bawah laut trans-atlantik, menghubungkan Atlantis siber!', type: 'bull', ticker: 'IVL', mult: 2.1, dur: 6 },
    { title: 'DROUGHT SIMULATION', msg: 'Bug pengatur cuaca buatan mengeringkan pasokan nutrisi ke bio-fiber IVL di server agrikultur.', type: 'bear', ticker: 'IVL', mult: -1.8, dur: 5 },
    { title: 'SYMBIOTIC AI', msg: 'A.I. lokal bersimbiosis damai dengan jaringan IVL, melipatgandakan kecepatan bandwidth secara instan.', type: 'bull', ticker: 'IVL', mult: 2.3, dur: 7 },
    { title: 'PARASITIC FUNGI', msg: 'Jamur siber parasit (Fungi.exe) menguras data dan daya pemrosesan dari server pengguna IVL.', type: 'bear', ticker: 'IVL', mult: -2.2, dur: 4 },
    { title: 'VERTICAL FARMING BOOM', msg: 'Booming luar biasa di sektor pertanian vertikal memborong habis suplai sulur fiber IVL di pasar.', type: 'bull', ticker: 'IVL', mult: 1.9, dur: 6 },
    { title: 'FERTILIZER SHORTAGE', msg: 'Kelangkaan unsur silikon-nutrisi global menghambat target ekspansi pertumbuhan node IVL.', type: 'bear', ticker: 'IVL', mult: -1.5, dur: 6 },
    { title: 'GLOW-IN-THE-DARK TREND', msg: 'Estetika bio-cahaya IVL mendadak viral di kalangan warga sipil, memicu pembelian masal.', type: 'bull', ticker: 'IVL', mult: 1.5, dur: 4 },

    // =========================================================================
    // 🌼 TIER 2: LILYBIT (LBT) - Cryptographic Pollen (15 Events)
    // =========================================================================
    { title: 'POLLEN RUSH', msg: 'Musim semi digital! Replikasi serbuk sari LBT memicu lonjakan airdrop yang masif.', type: 'bull', ticker: 'LBT', mult: 2.2, dur: 5 },
    { title: 'ALLERGIC REACTION', msg: 'Firewall antivirus salah mendeteksi serbuk LBT sebagai ancaman, membekukan jutaan transaksi.', type: 'bear', ticker: 'LBT', mult: -2.4, dur: 4 },
    { title: 'HIVE MIND SYNC', msg: 'Swarm-AI perbankan serentak menggunakan LBT sebagai standar transaksi mikro.', type: 'bull', ticker: 'LBT', mult: 2.5, dur: 6 },
    { title: 'STALE WIND', msg: 'Jaringan stagnan menghambat penyebaran kriptografi LBT, menurunkan volume harian drastis.', type: 'bear', ticker: 'LBT', mult: -1.8, dur: 5 },
    { title: 'CROSS-POLLINATION', msg: 'LBT sukses diintegrasikan (bridge) dengan blockchain pesaing, membuka pasar baru!', type: 'bull', ticker: 'LBT', mult: 2.1, dur: 7 },
    { title: 'PESTICIDE PROTOCOL', msg: 'Regulasi ketat pemerintah menghapus bot spammer LBT, namun memicu kepanikan investor ritel.', type: 'bear', ticker: 'LBT', mult: -2.1, dur: 6 },
    { title: 'DEFI BLOOM', msg: 'Protokol pinjaman berbasis LBT mencetak rekor Total Value Locked (TVL) tertinggi!', type: 'bull', ticker: 'LBT', mult: 1.9, dur: 8 },
    { title: 'DIGITAL WASP ATTACK', msg: 'Kawanan lebah digital jahat (Wasp-Botnet) menyerang brankas likuiditas pemegang LBT raksasa.', type: 'bear', ticker: 'LBT', mult: -2.7, dur: 4 },
    { title: 'NANO-BEES DEPLOYMENT', msg: 'Lebah mekanik berukuran nano resmi dikerahkan untuk mempercepat konfirmasi blok jaringan LBT.', type: 'bull', ticker: 'LBT', mult: 2.4, dur: 6 },
    { title: 'POLLUTION INTERFERENCE', msg: 'Polusi sinyal data menghambat rute navigasi replikasi serbuk sari LBT antar dompet.', type: 'bear', ticker: 'LBT', mult: -2.0, dur: 5 },
    { title: 'SPRING EQUINOX', msg: 'Siklus ekuinoks siber tiba! Mesin secara otomatis menggandakan yield farming untuk LBT.', type: 'bull', ticker: 'LBT', mult: 2.8, dur: 5 },
    { title: 'GENETIC DEGRADATION', msg: 'Varian kode kriptografi LBT generasi lama mulai usang, memaksa developer membakar (burn) koin.', type: 'bear', ticker: 'LBT', mult: -1.9, dur: 4 },
    { title: 'RETAIL FOMO', msg: 'Sentimen ritel (FOMO) meledak setelah tokoh siber populer memuji ketahanan ekosistem LBT.', type: 'bull', ticker: 'LBT', mult: 2.0, dur: 4 },
    { title: 'FLASH LOAN EXPLOIT', msg: 'Hacker mengeskploitasi protokol DeFi, menyedot jutaan serbuk LBT dari likuiditas sekunder.', type: 'bear', ticker: 'LBT', mult: -3.0, dur: 3 },
    { title: 'GREENHOUSE SUBSIDY', msg: 'Pemerintah siber memberikan subsidi 100% untuk biaya gas transaksi berbasis LilyBit.', type: 'bull', ticker: 'LBT', mult: 1.8, dur: 7 },

    // =========================================================================
    // 👁️ TIER 3: IRISCODE (IRC) - Sentient Biometrics (15 Events)
    // =========================================================================
    { title: 'PENTAGON CONTRACT', msg: 'Militer Global meresmikan IrisCode sebagai pemindai utama peluncuran misil kuantum!', type: 'bull', ticker: 'IRC', mult: 2.8, dur: 5 },
    { title: 'RETINA BREACH', msg: 'Grup hacker \'BlindFold\' dikabarkan berhasil memanipulasi intent-scanner IRC.', type: 'bear', ticker: 'IRC', mult: -3.2, dur: 4 },
    { title: 'PRE-CRIME SUCCESS', msg: 'Algoritma IRC berhasil mencegah perampokan bank siber raksasa sebelum terjadi. Citra meroket!', type: 'bull', ticker: 'IRC', mult: 2.5, dur: 6 },
    { title: 'PRIVACY LAWSUIT', msg: 'Aktivis HAM menggugat IRC atas tuduhan pelanggaran privasi pikiran pengguna.', type: 'bear', ticker: 'IRC', mult: -2.6, dur: 5 },
    { title: 'NEURAL LINK RUMOR', msg: 'Beredar bocoran bahwa IRC akan diintegrasikan langsung ke chip implan otak manusia.', type: 'bull', ticker: 'IRC', mult: 3.0, dur: 4 },
    { title: 'BLINDSPOT BUG', msg: 'Anomali kecil pada kelopak IRC menyebabkan kegagalan verifikasi VIP di bursa utama.', type: 'bear', ticker: 'IRC', mult: -2.3, dur: 6 },
    { title: 'INTERPOL ADOPTION', msg: 'Polisi siber internasional mewajibkan modul IRC di seluruh gerbang imigrasi virtual.', type: 'bull', ticker: 'IRC', mult: 2.4, dur: 7 },
    { title: 'OPTICAL ILLUSION HACK', msg: 'Serangan Deepfake tingkat tinggi menipu retina virtual IRC, mengekspos kelemahan mendasar!', type: 'bear', ticker: 'IRC', mult: -2.8, dur: 4 },
    { title: 'MEMORY BANK GUARD', msg: 'Bank ingatan memori umat manusia mempercayakan perlindungannya pada enkripsi cerdas IRC.', type: 'bull', ticker: 'IRC', mult: 2.6, dur: 6 },
    { title: 'CATARACT VIRUS', msg: 'Wabah virus \'Katarak\' memburamkan visi pemindai sentien IRC, membekukan aktivitas pasar.', type: 'bear', ticker: 'IRC', mult: -2.5, dur: 5 },
    { title: 'TELEPATHIC UPGRADE', msg: 'Pembaruan firmware terbaru IRC mampumengotorisasi transaksi secara telepati instan!', type: 'bull', ticker: 'IRC', mult: 2.9, dur: 5 },
    { title: 'BLACK MARKET SALE', msg: 'Kode akses root tingkat dewa untuk modul IRC lama bocor dan dijual di Deep-Web.', type: 'bear', ticker: 'IRC', mult: -3.0, dur: 3 },
    { title: 'MEGA-CORP MERGER', msg: 'Dua megakorporasi saingan melakukan merger dan memilih IrisCode sebagai mata uang internal.', type: 'bull', ticker: 'IRC', mult: 2.2, dur: 7 },
    { title: 'FALSE POSITIVE BAN', msg: 'Sistem sentien paranoid dan memblokir jutaan pengguna sah dari aset mereka karena false-positive.', type: 'bear', ticker: 'IRC', mult: -1.8, dur: 5 },
    { title: 'QUANTUM LENS', msg: 'Lensa kuantum baru dari laboratorium IRC membuat akurasi pemindaian niat 10.000x lebih kuat.', type: 'bull', ticker: 'IRC', mult: 2.4, dur: 6 },

    // =========================================================================
    // 🌐 TIER 4: LOTUSNET (LTN) - Orbital Stratosphere Cloud (15 Events)
    // =========================================================================
    { title: 'METAVERSE MIGRATION', msg: 'Dunia virtual terbesar memindahkan 100% datanya ke kluster orbital LotusNet!', type: 'bull', ticker: 'LTN', mult: 3.0, dur: 6 },
    { title: 'ORBITAL DEBRIS', msg: 'Puing-puing satelit tua menabrak stasiun teratai LTN, memutuskan koneksi di belahan bumi utara.', type: 'bear', ticker: 'LTN', mult: -3.5, dur: 4 },
    { title: 'STRATOSPHERE COOLING', msg: 'Sistem pendingin berbasis stratosfer LTN terbukti memangkas biaya server hingga 80%.', type: 'bull', ticker: 'LTN', mult: 2.6, dur: 8 },
    { title: 'GRAVITY GLITCH', msg: 'Kegagalan pendorong membuat salah satu server LotusNet turun dari orbit, memicu FUD massal.', type: 'bear', ticker: 'LTN', mult: -2.8, dur: 5 },
    { title: 'SPACE-X PARTNERSHIP', msg: 'Konglomerat luar angkasa mensponsori peluncuran 500 node LotusNet baru bulan ini.', type: 'bull', ticker: 'LTN', mult: 3.2, dur: 5 },
    { title: 'SOLAR ECLIPSE SHUTDOWN', msg: 'Gerhana langka memutus pasokan energi surya ke LotusNet, memaksa mode hemat daya aktif.', type: 'bear', ticker: 'LTN', mult: -2.4, dur: 6 },
    { title: 'QUANTUM COMPRESSION', msg: 'LotusNet menemukan algoritma kompresi data revolusioner, menggandakan kapasitas storage!', type: 'bull', ticker: 'LTN', mult: 2.7, dur: 7 },
    { title: 'ALIEN SIGNAL RUMOR', msg: 'Satelit penerima LotusNet menangkap sinyal terenkripsi dari galaksi Andromeda. Volume lalu lintas meroket!', type: 'bull', ticker: 'LTN', mult: 3.5, dur: 6 },
    { title: 'KESSLER SYNDROME', msg: 'Reaksi berantai tabrakan sampah antariksa memaksa evakuasi darurat pada stasiun inti LotusNet.', type: 'bear', ticker: 'LTN', mult: -3.8, dur: 4 },
    { title: 'LUNAR DATACENTER', msg: 'Sejarah tercipta! LotusNet berhasil mengaktifkan pangkalan data backup pertama di Bulan.', type: 'bull', ticker: 'LTN', mult: 2.8, dur: 7 },
    { title: 'ATMOSPHERIC FRICTION', msg: 'Gesekan tak terduga dengan lapisan atmosfer memperpendek umur pakai satelit, anggaran LTN membengkak.', type: 'bear', ticker: 'LTN', mult: -2.2, dur: 5 },
    { title: 'ZERO-G ESPORTS', msg: 'Turnamen olahraga gravitasi-nol disiarkan langsung eksklusif menggunakan bandwidth stabil LotusNet.', type: 'bull', ticker: 'LTN', mult: 2.5, dur: 5 },
    { title: 'HACKER HIJACK', msg: 'Faksi ekstremis membajak satelit LTN Sektor 7 untuk menyiarkan tayangan terlarang tanpa henti.', type: 'bear', ticker: 'LTN', mult: -3.1, dur: 3 },
    { title: 'NEW CONSTELLATION', msg: 'Ribuan node nano baru berhasil mengorbit, menciptakan visual konstelasi bunga teratai di langit malam.', type: 'bull', ticker: 'LTN', mult: 2.3, dur: 6 },
    { title: 'MICROMETEORITE SHOWER', msg: 'Hujan badai mikrometeorit mencabik-cabik panel surya utama, memutus 20% suplai daya operasional.', type: 'bear', ticker: 'LTN', mult: -2.5, dur: 4 },

    // =========================================================================
    // 🌹 TIER 5: ROSEX (RSX) - Genetic Luxury Pheromone (15 Events)
    // =========================================================================
    { title: 'CYBER-GALA DOMINANCE', msg: 'Aroma feromon RoseX menjadi standar wajib di pesta Cyber-Gala kalangan elit tahun ini.', type: 'bull', ticker: 'RSX', mult: 3.5, dur: 5 },
    { title: 'SYNTHETIC CLONING', msg: 'Sindikat pasar gelap berhasil mengkloning kode genetik RoseX, menghancurkan kelangkaannya!', type: 'bear', ticker: 'RSX', mult: -4.0, dur: 4 },
    { title: 'ROYAL ENDORSEMENT', msg: 'Ratu Kekaisaran Digital terlihat menggunakan avatar yang diselimuti aura RoseX.', type: 'bull', ticker: 'RSX', mult: 3.8, dur: 4 },
    { title: 'LUXURY TAX HIKE', msg: 'Dewan Oligarki secara mendadak menaikkan pajak kepemilikan aset kelas RoseX.', type: 'bear', ticker: 'RSX', mult: -3.1, dur: 6 },
    { title: 'SCARCITY PROTOCOL', msg: 'Developer membakar (burn) 30% dari total suplai RoseX yang ada. Harga meroket gila-gilaan!', type: 'bull', ticker: 'RSX', mult: 4.2, dur: 5 },
    { title: 'PHEROMONE LEAK', msg: 'Kebocoran data menyebabkan efek samping mual pada pengguna feromon RoseX versi bajakan.', type: 'bear', ticker: 'RSX', mult: -2.9, dur: 5 },
    { title: 'VOGUE METAVERSE COVER', msg: 'Visual RoseX menghiasi sampul majalah fashion nomor satu di jagat maya.', type: 'bull', ticker: 'RSX', mult: 2.9, dur: 7 },
    { title: 'ALLERGIC EPIDEMIC', msg: 'Mutasi feromon terbaru memicu alergi dan pusing masal pada pengguna sistem realitas virtual.', type: 'bear', ticker: 'RSX', mult: -3.5, dur: 4 },
    { title: 'CELEBRITY WEDDING', msg: 'Pernikahan selebriti idola antar-sistem tata surya memborong 15% dari sirkulasi pasar RoseX.', type: 'bull', ticker: 'RSX', mult: 3.2, dur: 5 },
    { title: 'COUNTERFEIT RING BUST', msg: 'Kepolisian sukses membongkar sindikat pemalsu. Nilai RSX orisinil kembali tak tertandingi.', type: 'bull', ticker: 'RSX', mult: 2.8, dur: 6 },
    { title: 'INFLUENCER CANCELLED', msg: 'Brand ambassador RSX terlibat skandal besar dan di-"cancel", menyeret turun valuasi merk.', type: 'bear', ticker: 'RSX', mult: -2.6, dur: 5 },
    { title: 'EAU DE CYBERSPACE', msg: 'Kolaborasi parfum digital dengan rumah mode haute-couture ludes terjual dalam hitungan mili-detik!', type: 'bull', ticker: 'RSX', mult: 3.0, dur: 5 },
    { title: 'SYNTHETIC OVERDOSE', msg: 'Kecanduan aura RoseX resmi ditetapkan sebagai krisis kesehatan publik siber oleh otoritas medis.', type: 'bear', ticker: 'RSX', mult: -3.0, dur: 3 },
    { title: 'GOLDEN MUTATION', msg: 'Penemuan mutasi genetika RoseX emas murni memicu perang tawar (bidding war) antar kolektor gila.', type: 'bull', ticker: 'RSX', mult: 3.4, dur: 6 },
    { title: 'WAREHOUSE HEIST', msg: 'Gudang brankas terenkripsi milik RSX sukses dijebol. Jutaan aset berpindah tangan ke pihak hitam.', type: 'bear', ticker: 'RSX', mult: -2.8, dur: 4 },

    // =========================================================================
    // 🌷 TIER 6: TULIPNEX (TNX) - The Singularity Seed (15 Events)
    // =========================================================================
    { title: 'SINGULARITY AWAKENS', msg: 'Kecerdasan inti TulipNex mencapai kesadaran penuh. Investor institusi memborong secara histeris!', type: 'bull', ticker: 'TNX', mult: 5.0, dur: 6 },
    { title: 'FEDERATION AUDIT', msg: 'Pasukan Galactic Federation menggerebek kantor pusat TulipNex atas dugaan monopoli absolut.', type: 'bear', ticker: 'TNX', mult: -5.0, dur: 4 },
    { title: 'UNIVERSAL RESERVE', msg: '3 Aliansi Planet sepakat menjadikan TNX sebagai mata uang cadangan utama galaksi.', type: 'bull', ticker: 'TNX', mult: 4.5, dur: 8 },
    { title: 'CORE DESTABILIZATION', msg: 'Anomali fisika kuantum mendestabilisasi inti TulipNex. Terjadi aksi jual panik terbesar abad ini!', type: 'bear', ticker: 'TNX', mult: -4.8, dur: 3 },
    { title: 'BOARDROOM TAKEOVER', msg: 'Whale misterius mengambil alih dewan direksi, menjanjikan dividen 10x lipat untuk pemegang TNX.', type: 'bull', ticker: 'TNX', mult: 4.2, dur: 5 },
    { title: 'PROPHECY OF DOOM', msg: 'Sekte peretas mempublikasikan bukti bahwa algoritma TNX dirancang untuk menghancurkan ekonomi.', type: 'bear', ticker: 'TNX', mult: -4.0, dur: 5 },
    { title: 'TIME-BENDING PATCH', msg: 'Update Nexus Core sukses memproses transaksi masa depan sebelum terjadi. Harga TNX menembus rekor!', type: 'bull', ticker: 'TNX', mult: 4.8, dur: 6 },
    { title: 'SENTIENT REBELLION', msg: 'Kecerdasan buatan TNX menolak tunduk pada manusia! Ketakutan akan kiamat AI membuat investor lari.', type: 'bear', ticker: 'TNX', mult: -4.5, dur: 4 },
    { title: 'INTERDIMENSIONAL BRIDGE', msg: 'Algoritma TNX menembus batas dimensi, membuka jalur komputasi baru dengan semesta paralel!', type: 'bull', ticker: 'TNX', mult: 5.5, dur: 7 },
    { title: 'ANTI-TRUST DISSOLUTION', msg: 'Pemerintah persatuan planet mengeluarkan mosi pembubaran paksa korporasi raksasa TulipNex.', type: 'bear', ticker: 'TNX', mult: -4.2, dur: 5 },
    { title: 'CREATOR WALLET ACTIVATION', msg: 'Dompet Satoshi-Nexus yang diam selama satu abad mendadak terbangun dan membuang muatan koin TNX.', type: 'bear', ticker: 'TNX', mult: -3.8, dur: 4 },
    { title: 'THE OMEGA DIVIDEND', msg: 'Dewan Direksi mencairkan "Omega Dividend", membagikan kekayaan siber dalam jumlah tak masuk akal.', type: 'bull', ticker: 'TNX', mult: 4.0, dur: 5 },
    { title: 'QUANTUM SCHISM', msg: 'Paradoks waktu memecah jaringan TNX menjadi dua. Konflik kepemilikan aset picu keruntuhan pasar!', type: 'bear', ticker: 'TNX', mult: -4.0, dur: 5 },
    { title: 'GOD-MODE ALGORITHM', msg: 'TNX secara matematis membuktikan sistemnya mustahil diretas. Kepercayaan pasar meledak di atas 100%.', type: 'bull', ticker: 'TNX', mult: 4.5, dur: 6 },
    { title: 'HASH-RATE MONOPOLY', msg: 'TulipNex Inc. berhasil mendominasi 99% dari total daya komputasi energi murni di gugus galaksi ini!', type: 'bull', ticker: 'TNX', mult: 3.5, dur: 8 }
];

/**
 * Ekspor array event agar bisa di-require oleh trading-engine-core.js
 */
module.exports = eventPool;