const axios = require("axios")

async function igdl_api1(url) {
    const { data } = await axios.get(`https://api.vreden.my.id/api/igdl?url=${encodeURIComponent(url)}`)
    
    if (!data || !data.result) throw "API1 gagal"

    return data.result.map(item => ({
        type: item.type, // image / video
        url: item.url
    }))
}

async function igdl_api2(url) {
    const { data } = await axios.get(`https://api.ryzendesu.vip/api/downloader/igdl?url=${encodeURIComponent(url)}`)
    
    if (!data || !data.data) throw "API2 gagal"

    return data.data.map(item => ({
        type: item.type,
        url: item.url
    }))
}

async function instagramDownloader(url) {
    let errors = []
    let result = null

    try {
        result = await igdl_api1(url)
    } catch (e) {
        errors.push("API1 mati")
    }

    if (!result) {
        try {
            result = await igdl_api2(url)
        } catch (e) {
            errors.push("API2 mati")
        }
    }

    if (!result) {
        throw new Error("Semua API gagal:\n" + errors.join("\n"))
    }

    return result
}

module.exports = instagramDownloader