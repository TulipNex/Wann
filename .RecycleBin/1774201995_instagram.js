/*
@ author: Herza
@ type : CommonJS
@ ========> Info <=========
@ github: https://github.com/herzonly
@ wa_channel: https://whatsapp.com/channel/0029VaGVOvq1iUxY6WgHLv2R
*/

const https = require('https');

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ data: JSON.parse(data), headers: res.headers }); }
        catch { resolve({ data, headers: res.headers }); }
      });
    }).on('error', reject);
  });
}

function post(url, body, headers) {
  return new Promise((resolve, reject) => {
    const str = typeof body === 'string' ? body : JSON.stringify(body);
    const u = new URL(url);
    const req = https.request({
      hostname: u.hostname,
      path: u.pathname,
      method: 'POST',
      headers: { 'Content-Length': Buffer.byteLength(str), ...headers },
    }, (res) => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        const raw = Buffer.concat(chunks).toString();
        try { resolve({ data: JSON.parse(raw), headers: res.headers }); }
        catch { resolve({ data: raw, headers: res.headers }); }
      });
    });
    req.on('error', reject);
    req.write(str);
    req.end();
  });
}

async function igdl(url) {
  const bypassRes = await get('https://anabot.my.id/api/tools/bypass?url=https%3A%2F%2Fgramfetchr.com%2F&siteKey=0x4AAAAAACf1oQEy7jV3W_5_&type=turnstile-min&proxy=&apikey=freeApikey');
  const turnstileToken = bypassRes.data?.data?.result?.token;
  if (!turnstileToken) throw new Error('Failed to get turnstile token');

  const ipRes = await get('https://api.ipify.org?format=json').catch(() => ({ data: { ip: '' } }));

  const tokenRes = await post('https://gramfetchr.com/', '[]', {
    'Accept': 'text/x-component',
    'Next-Action': '00780ed18ac967899c0ed4ef4b816f40d99ac389d6',
    'Next-Router-State-Tree': '%5B%22%22%2C%7B%22children%22%3A%5B%5B%22locale%22%2C%22en%22%2C%22d%22%5D%2C%7B%22children%22%3A%5B%22__PAGE__%22%2C%7B%7D%2Cnull%2Cnull%5D%7D%2Cnull%2Cnull%2Ctrue%5D%7D%2Cnull%2Cnull%5D',
    'Content-Type': 'text/plain;charset=UTF-8',
    'Origin': 'https://gramfetchr.com',
    'Referer': 'https://gramfetchr.com/',
    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36',
  });

  const raw = tokenRes.headers['set-cookie'];
  const cookies = raw ? (Array.isArray(raw) ? raw : [raw]).map(c => c.split(';')[0]).join('; ') : '';

  const match = (typeof tokenRes.data === 'string' ? tokenRes.data : '').match(/^1:"([a-f0-9]{32}:[a-f0-9]{32})"/m);
  if (!match) throw new Error('Token not found: ' + String(tokenRes.data).slice(0, 300));

  const postRes = await post('https://gramfetchr.com/api/fetchr', {
    url,
    token: match[1],
    referer: 'https://gramfetchr.com/',
    requester: ipRes.data?.ip || '',
    turnstileToken,
  }, {
    'Content-Type': 'application/json',
    'Origin': 'https://gramfetchr.com',
    'Referer': 'https://gramfetchr.com/',
    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin',
    ...(cookies && { Cookie: cookies }),
  });

  if (!postRes.data?.success) throw new Error(JSON.stringify(postRes.data));
  return postRes.data;
}

module.exports = igdl;