/**
 * Plugin: GenAI Plugin Code Viewer
 * Deskripsi: Mengambil kode dari file plugin dan menampilkannya dengan UI Native Code Block Meta AI.
 * Update: Ditambahkan Lexer/Tokenizer mini untuk mengaktifkan Syntax Highlighting (Warna Kode).
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Mesin Tokenizer Mini untuk Syntax Highlighting WhatsApp
function tokenizeCode(code) {
    const blocks = [];
    
    // Regex untuk mendeteksi pola JavaScript: Komentar, String, Keyword, Angka, dan Method (Fungsi)
    const regex = new RegExp(
        "(\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/)|" + // 1: Comments
        "([\"'](?:\\\\.|[^\"'\\\\])*[\"']|`[\\s\\S]*?`)|" + // 2: Strings
        "(\\b(?:function|return|let|const|var|if|else|for|while|try|catch|async|await|require|module|exports|new|class|this|switch|case|break|continue|true|false|null|undefined|typeof|instanceof|throw|delete)\\b)|" + // 3: Keywords
        "(\\b\\d+(?:\\.\\d+)?\\b)|" + // 4: Numbers
        "(\\b[a-zA-Z_$][a-zA-Z0-9_$]*\\b(?=\\s*\\())", // 5: Methods
        "g"
    );

    let lastIndex = 0;
    let match;

    while ((match = regex.exec(code)) !== null) {
        // 1. Masukkan teks biasa (operator, tanda kurung, variabel) yang tidak tertangkap Regex sebagai DEFAULT
        if (match.index > lastIndex) {
            blocks.push({ content: code.slice(lastIndex, match.index), type: "DEFAULT", highlightType: 0 });
        }

        // 2. Tentukan jenis warna/highlight berdasarkan grup regex mana yang cocok
        let content = match[0];
        let type = "DEFAULT";
        let highlightType = 0;

        if (match[1]) { type = "COMMENT"; highlightType = 5; }      // Abu-abu / Hijau redup
        else if (match[2]) { type = "STRING"; highlightType = 3; }   // Warna Teks String
        else if (match[3]) { type = "KEYWORD"; highlightType = 1; }  // Warna Keyword (Biru/Ungu)
        else if (match[4]) { type = "NUMBER"; highlightType = 4; }   // Warna Angka
        else if (match[5]) { type = "METHOD"; highlightType = 2; }   // Warna Pemanggilan Fungsi

        blocks.push({ content, type, highlightType });
        lastIndex = regex.lastIndex;
    }

    // 3. Masukkan sisa teks di akhir file
    if (lastIndex < code.length) {
        blocks.push({ content: code.slice(lastIndex), type: "DEFAULT", highlightType: 0 });
    }

    return blocks;
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`⚠️ Masukkan nama plugin yang ingin diambil.\nContoh: *${usedPrefix + command} downloader-ig.js*`);

    // Membersihkan nama file & mencegah Path Traversal Attack
    let pluginName = text.trim();
    if (!pluginName.endsWith('.js')) pluginName += '.js';

    if (pluginName.includes('/') || pluginName.includes('\\')) {
        return m.reply("⚠️ Akses ditolak: Nama plugin tidak valid.");
    }

    const pluginPath = path.join(process.cwd(), 'plugins', pluginName);

    if (!fs.existsSync(pluginPath)) {
        return m.reply(`⚠️ File plugin *${pluginName}* tidak ditemukan di dalam direktori plugins.`);
    }

    await conn.sendMessage(m.chat, { react: { text: '✨', key: m.key } });

    try {
        const pluginCode = fs.readFileSync(pluginPath, 'utf8');
        
        // Batasi ukuran untuk mencegah Payload WhatsApp kelebihan beban (Max 12.000 Karakter)
        const codeToSend = pluginCode.length > 12000 
            ? pluginCode.slice(0, 12000) + '\n\n// ... [KODE TERPOTONG KARENA TERLALU PANJANG] ...' 
            : pluginCode;

        // Proses pewarnaan kode!
        const tokenizedBlocks = tokenizeCode(codeToSend);

        // Memisahkan array mapping untuk InnerObj dan Protobuf Payload
        const innerObjCodeBlocks = tokenizedBlocks.map(t => ({ content: t.content, type: t.type }));
        const protoCodeBlocks = tokenizedBlocks.map(t => ({ highlightType: t.highlightType, codeContent: t.content }));

        const headerText = `*🧩 Plugin :* ${pluginName}`;
        const footerText = `*📁 Path :* ./plugins/${pluginName} \n*📏 Ukuran :* ${(pluginCode.length / 1024).toFixed(2)} KB`;

        // 1. Membangun Struktur Internal (Unified Response Object)
        const innerObj = {
            response_id: crypto.randomUUID(), 
            sections: [
                {
                    view_model: {
                        primitive: {
                            text: headerText,
                            __typename: "GenAIMarkdownTextUXPrimitive"
                        },
                        __typename: "GenAISingleLayoutViewModel"
                    }
                },
                {
                    view_model: {
                        primitive: {
                            language: "javascript",
                            code_blocks: innerObjCodeBlocks, // Menggunakan kode berwarna
                            __typename: "GenAICodeUXPrimitive"
                        },
                        __typename: "GenAISingleLayoutViewModel"
                    }
                },
                {
                    view_model: {
                        primitive: {
                            text: footerText,
                            __typename: "GenAIMarkdownTextUXPrimitive"
                        },
                        __typename: "GenAISingleLayoutViewModel"
                    }
                }
            ]
        };

        // 2. Encode ulang JSON menjadi Base64
        const newBase64 = Buffer.from(JSON.stringify(innerObj), 'utf8').toString('base64');

        // 3. Merakit Payload Utama WhatsApp
        const payload = {
            messageContextInfo: {
                threadId: [],
                messageSecret: "pxpgLDysekue4NoOZAJHwkdvJbwyuFYj5+qMILIv4hg=",
                botMetadata: {
                    verificationMetadata: {
                        proofs: [{
                            certificateChain: [
                                "MIICqDCCAk6gAwIBAgIUIfGgPFSyA+ENQbul6Uzh56f91CcwCgYIKoZIzj0EAwIweTEiMCAGA1UEAwwZTWV0YSBXQSBTUyBJbnQgQ0EgMjAyNS0wOTELMAkGA1UEBhMCVVMxEzARBgNVBAgMCkNhbGlmb3JuaWExEzARBgNVBAcMCk1lbmxvIFBhcmsxHDAaBgNVBAoME01ldGEgUGxhdGZvcm1zIEluYy4wHhcNMjYwNDA0MTgzMTQyWhcNMjYwNDA4MTgzMTUyWjAeMRwwGgYDVQQDDBNzdmM6d2EtYm90LW1zZy1sZWFmMCowBQYDK2VwAyEArIxg1JC0pcZHA1QTExxZQ4MK80ukqTmcSJM4r32a4QCjggE8MIIBODALBgNVHQ8EBAMCB4AwHQYDVR0OBBYEFDm4cTiUeAUvXiIxUJmgp2LfvXc5MIG0BgNVHSMEgawwgamAFO81YRGUWbuc0xuufO+lFiYAOjGOoXukeTB3MSAwHgYDVQQDDBdNZXRhIFdBIEZlYXR1cmUgUm9vdCBDQTELMAkGA1UEBhMCVVMxEzARBgNVBAgMCkNhbGlmb3JuaWExEzARBgNVBAcMCk1lbmxvIFBhcmsxHDAaBgNVBAoME01ldGEgUGxhdGZvcm1zIEluYy6CFEZvL5Zv8AJ8duOmVC+Foy7F4yg7MFMGCysGAQQBgsAVAgIQBEQMQlVSSTptcmw6Ly9jZXJ0aWZpY2F0ZV9zZXJ2aWNlLndoYXRzYXBwX3NpbXBsZV9zaWduYWwvU2VyaWFsTnVtYmVyczAKBggqhkjOPQQDAgNIADBFAiABQbGpmp14NF4sffY/Jvo9IUW2CCynO//8Qwx6oZelDAIhANCPHpOTdWv0ZFubcq2U6NznZone5VcAXjnq5uc62OXT",
                                "MIIDeDCCAx2gAwIBAgIURm8vlm/wAnx246ZUL4WjLsXjKDswCgYIKoZIzj0EAwIwdzEgMB4GA1UEAwwXTWV0YSBXQSBGZWF0dXJlIFJvb3QgQ0ExCzAJBgNVBAYTAlVTMRMwEQYDVQQIDApDYWxpZm9ybmlhMRMwEQYDVQQHDApNZW5sbyBQYXJrMRwwGgYDVQQKDBNNZXRhIFBsYXRmb3JtcyBJbmMuMB4XDTI1MDkwNDE4MDU0OVoXDTI3MDkwNDE4MDU0OVoweTEiMCAGA1UEAwwZTWV0YSBXQSBTUyBJbnQgQ0EgMjAyNS0wOTELMAkGA1UEBhMCVVMxEzARBgNVBAgMCkNhbGlmb3JuaWExEzARBgNVBAcMCk1lbmxvIFBhcmsxHDAaBgNVBAoME01ldGEgUGxhdGZvcm1zIEluYy4wWTATBgcqhkjOPQIBBggqhkjOPQMBBwNCAATs+c+UVhvMBZzu4AHndKKTZASPLp2vUt1g84aUpdOFqmqCs5KEJ8Sxhi8F9GX4P7rPLjfOwfFJRA6yrp+2cX0zo4IBgzCCAX8wHQYDVR0OBBYEFO81YRGUWbuc0xuufO+lFiYAOjGOMIG0BgNVHSMEgawwgamAFNO7KMTVSYUxkL6VS3LyWJw7m76zoXukeTB3MSAwHgYDVQQDDBdNZXRhIFdBIEZlYXR1cmUgUm9vdCBDQTELMAkGA1UEBhMCVVMxEzARBgNVBAgMCkNhbGlmb3JuaWExEzARBgNVBAcMCk1lbmxvIFBhcmsxHDAaBgNVBAoME01ldGEgUGxhdGZvcm1zIEluYy6CFALbuULsZlYXxk/Cz5I35uNJkpdAMA4GA1UdDwEB/wQEAwIBhjASBgNVHRMBAf8ECDAGAQH/AgEAMEUGA1UdHwQ+MDwwOqA4oDaGNGh0dHBzOi8vbWV0YS5wdWJsaWNrZXlpbmZyYS5jb20vYXJsL3doYXRzYXBwX2ZlYXR1cmUwIAYIKwYBBQUHAQEEFDASMBAGCCsGAQUFBzABhgROb25lMBoGCWCGSAGG+EIBDQQNFgtPbmNhbGw6IHBraTAKBggqhkjOPQQDAgNJADBGAiEAq7Ycf2W/cSA2Ni3L0sgYmPmlRxkPcMgOm+ZRgkiQsdwCIQD2XRUvySFSRYJSfyQW2m4ka8N9gJ8KRMD1KTwyXghXHQ=="
                            ],
                            version: 1,
                            useCase: 1,
                            signature: "V/DxIGpeuFIjl6OnLrjpyVHFXH84lGHCH36Mfhv8oR4LG5abChdeRfB2v5l2fYdKFozcIwg+mOTimzEBbO1/Cw=="
                        }]
                    }
                }
            },
            botForwardedMessage: {
                message: {
                    richResponseMessage: {
                        submessages: [
                            {
                                messageType: 2,
                                messageText: headerText
                            },
                            {
                                messageType: 5,
                                codeMetadata: {
                                    codeBlocks: protoCodeBlocks, // Menyisipkan token warna ke WhatsApp!
                                    codeLanguage: "javascript"
                                }
                            },
                            {
                                messageType: 2,
                                messageText: footerText
                            }
                        ],
                        messageType: 1,
                        unifiedResponse: {
                            data: newBase64
                        },
                        contextInfo: {
                            mentionedJid: [],
                            groupMentions: [],
                            statusAttributions: [],
                            forwardingScore: 2,
                            isForwarded: true,
                            forwardedAiBotMessageInfo: {
                                botJid: "718584497008509@bot"
                            },
                            forwardOrigin: 4
                        }
                    }
                }
            }
        };

        if (m.isGroup) {
            payload.senderKeyDistributionMessage = {
                groupId: m.chat,
                axolotlSenderKeyDistributionMessage: "Mwje0UEQERogbzk4E7K9AJXE0UFz1JrceE2dgDtWk+EVQKm0A0c0Gj0iIQU8P4SuKTsoRLxHKy5VNPuBVkOeHQtCJDSz8kl7AC8cBw=="
            };
        }

        await conn.relayMessage(m.chat, payload, { messageId: m.key.id });

    } catch (e) {
        console.error(e);
        m.reply(global.eror || "⚠️ Terjadi kesalahan saat membaca atau membangun UI kode plugin.");
    }
}

handler.help = ['readplugin <nama file>'];
handler.tags = ['owner'];
handler.command = /^(readplugin|getplugin|plugincode)$/i;
handler.owner = true;

module.exports = handler;