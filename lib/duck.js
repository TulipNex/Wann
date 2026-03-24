/**
 * DuckAI Scraper – Hann Universe (CommonJS Version untuk Bot WA)
 */

const { fetch, Headers } = require('undici');
const { JSDOM } = require('jsdom');
const { VM } = require('vm2');
const UserAgent = require('user-agents');
const { webcrypto } = require('crypto');
const crypto = require('crypto'); // Tambahan untuk randomUUID
const { createWriteStream } = require('fs');
const { EventEmitter } = require('events');
const readline = require('readline');

const subtle = webcrypto.subtle;

const BASE_URL   = 'https://duck.ai';
const API_BASE   = `${BASE_URL}/duckchat/v1`;
const STATUS_URL = `${API_BASE}/status`;
const CHAT_URL   = `${API_BASE}/chat`;

const VQD_HEADER = 'X-Vqd-Hash-1';
const VQD_ACCEPT = 'x-vqd-accept';
const FE_VERSION = 'serp_20260311_192230_ET-a6d03d3dee4ffac4d95a950f0bb5590dcf8b187a';

const BROWSER_STACK = [
  'Error',
  '    at l (https://duck.ai/dist/duckai-dist/entry.duckai.508538477be99c7fc13b8.js:2:1180630)',
  '    at async https://duck.ai/dist/duckai-dist/entry.duckai.508538477be99c7fc13b8.js:2:1063659',
].join('\n');

const MODELS = {
  GPT4O_MINI  : 'gpt-4o-mini',                                    // OpenAI – default
  CLAUDE_HAIKU: 'claude-3-haiku-20240307',                        // Anthropic
  LLAMA_33_70B: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',       // Meta
  MIXTRAL_8X7B: 'mistralai/Mixtral-8x7B-Instruct-v0.1',          // Mistral
};

const DEFAULT_MODEL = MODELS.GPT4O_MINI;
const RETRY_CONFIG  = { maxRetries: 5, baseDelayMs: 2000, maxDelayMs: 30_000, backoffFactor: 2 };

class UARotator {
  constructor() { this._current = this._generate(); }

  _generate() {
    try {
      const ua = new UserAgent({ deviceCategory: 'desktop', vendor: 'Google Inc.', platform: 'Win32' });
      const str = ua.toString();
      if (str.includes('Chrome')) return { ua: str, data: ua.data };
    } catch {}
    return {
      ua  : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36',
      data: { userAgent: '', appVersion: '', vendor: 'Google Inc.', platform: 'Win32' },
    };
  }

  rotate() { this._current = this._generate(); return this._current; }

  get string()   { return this._current.ua; }
  get platform() { return this._current.data?.platform  || 'Win32'; }
  get vendor()   { return this._current.data?.vendor    || 'Google Inc.'; }

  secChUa() {
    const v = (this.string.match(/Chrome\/(\d+)/) || [])[1] || '135';
    return `"Google Chrome";v="${v}", "Not-A.Brand";v="8", "Chromium";v="${v}"`;
  }
}

const uaRotator = new UARotator();

const sleep  = ms => new Promise(r => setTimeout(r, ms));
const nowIso = ()  => new Date().toISOString();
const hrMs   = s   => Math.round(Number(process.hrtime.bigint() - s) / 1_000_000);
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

function calcBackoff(attempt, cfg = RETRY_CONFIG) {
  return Math.min(cfg.baseDelayMs * Math.pow(cfg.backoffFactor, attempt) + randInt(200, 800), cfg.maxDelayMs);
}

function buildBaseHeaders(extra = {}) {
  return new Headers({
    'User-Agent'         : uaRotator.string,
    'Accept-Language'    : 'en-US,en;q=0.9',
    'Accept-Encoding'    : 'gzip, deflate, br',
    'Referer'            : `${BASE_URL}/`,
    'Origin'             : BASE_URL,
    'Cache-Control'      : 'no-store',
    'Sec-Fetch-Dest'     : 'empty',
    'Sec-Fetch-Mode'     : 'cors',
    'Sec-Fetch-Site'     : 'same-origin',
    'Sec-Ch-Ua'          : uaRotator.secChUa(),
    'Sec-Ch-Ua-Mobile'   : '?0',
    'Sec-Ch-Ua-Platform' : `"${uaRotator.platform}"`,
    ...extra,
  });
}

function encodeSignals() {
  const start = Date.now() - randInt(1800, 4000);
  return Buffer.from(JSON.stringify({
    start,
    events: [
      { name: 'onboarding_impression',  delta: randInt(300,  500)  },
      { name: 'onboarding_finish',      delta: randInt(9000, 12000) },
      { name: 'startNewChat_free',      delta: randInt(9500, 13000) },
      { name: 'initSwitchModel',        delta: randInt(11000,15000) },
    ],
    end: randInt(20000, 28000),
  })).toString('base64');
}

function parseSseLine(line) {
  if (!line || line.startsWith(':')) return null;
  if (line.startsWith('data: ')) {
    const raw = line.slice(6).trim();
    if (raw === '[DONE]') return { done: true };
    try { return JSON.parse(raw); } catch { return null; }
  }
  return null;
}

async function sha256b64(str) {
  const hash = await subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Buffer.from(hash).toString('base64');
}

class ChallengeHandler {
  static async _executeJsdom(scriptSrc) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('jsdom timeout')), 10_000);

      let dom;
      try {
        dom = new JSDOM('<!DOCTYPE html><html><head></head><body></body></html>', {
          url               : BASE_URL,
          runScripts        : 'dangerously',
          pretendToBeVisual : true,
          resources         : 'usable',
          referrer          : BASE_URL,
        });
      } catch (e) {
        clearTimeout(timer);
        return reject(e);
      }

      const win = dom.window;

      try {
        Object.defineProperty(win.navigator, 'webdriver', { get: () => false });
        Object.defineProperty(win.navigator, 'plugins',   { get: () => ({ length: 3 }) });
        Object.defineProperty(win.navigator, 'languages', { get: () => ['en-US', 'en'] });
        Object.defineProperty(win.navigator, 'hardwareConcurrency', { get: () => 8 });
        Object.defineProperty(win.navigator, 'deviceMemory',        { get: () => 8 });
      } catch {}

      win.__duckai_resolve = (r) => { clearTimeout(timer); dom.window.close(); resolve(r); };
      win.__duckai_reject  = (e) => { clearTimeout(timer); dom.window.close(); reject(new Error(e)); };

      win.chrome = { runtime: { id: undefined } };

      const wrapper = `
        (async () => {
          try {
            const result = await (${scriptSrc});
            window.__duckai_resolve(result);
          } catch (err) {
            window.__duckai_reject(String(err && err.message ? err.message : err));
          }
        })();
      `;

      try {
        const el = win.document.createElement('script');
        el.textContent = wrapper;
        win.document.head.appendChild(el);
      } catch (e) {
        clearTimeout(timer);
        dom.window.close();
        reject(e);
      }
    });
  }

  static async _executeVm2(scriptSrc) {
    const mockDoc = {
      createElement    : () => ({ innerHTML: '', children: { length: 0 }, appendChild: () => {}, removeChild: () => {}, addEventListener: () => {}, removeEventListener: () => {}, querySelectorAll: () => [] }),
      body             : { appendChild: () => {}, removeChild: () => {}, children: { length: randInt(5,12) }, onerror: null },
      querySelectorAll : () => Object.assign([], { length: randInt(20, 60) }),
    };
    const mockNav = {
      userAgent          : uaRotator.string,
      webdriver          : false,
      languages          : ['en-US', 'en'],
      platform           : uaRotator.platform,
      hardwareConcurrency: 8,
      deviceMemory       : 8,
      maxTouchPoints     : 0,
      vendor             : uaRotator.vendor,
      plugins            : { length: 3 },
      cookieEnabled      : true,
    };

    const sandbox = {
      navigator   : mockNav,
      document    : mockDoc,
      performance : { now: () => Date.now() },
      location    : { href: BASE_URL, origin: BASE_URL, hostname: 'duck.ai' },
      chrome      : { runtime: { id: undefined } },
      crypto: {
        subtle     : subtle,
        getRandomValues: arr => { for (let i = 0; i < arr.length; i++) arr[i] = randInt(0, 255); return arr; },
        randomUUID : () => crypto.randomUUID(), // Menggunakan Node.js crypto
      },
      setTimeout  : (fn, ms) => { setTimeout(fn, Math.min(ms || 0, 50)); return 1; },
      clearTimeout: () => {},
      atob : s => Buffer.from(s, 'base64').toString('binary'),
      btoa : s => Buffer.from(s, 'binary').toString('base64'),
      decodeURIComponent,
      encodeURIComponent,
      Array, Object, String, Number, Boolean, Math,
      JSON, Symbol, Proxy, Promise, Map, Set, WeakMap,
      Uint8Array, Int32Array, ArrayBuffer, DataView,
      parseInt, parseFloat, isNaN, isFinite,
      Error: class Error extends globalThis.Error {
        constructor(m) { super(m); this.stack = BROWSER_STACK; }
        static captureStackTrace() {}
      },
    };
    sandbox.window     = sandbox;
    sandbox.self       = sandbox;
    sandbox.top        = sandbox;
    sandbox.globalThis = sandbox;

    const vm = new VM({ timeout: 8000, sandbox, eval: false, wasm: false });
    return vm.run(`(async () => { return await (${scriptSrc}); })()`);
  }

  static _extractMeta(scriptSrc) {
    const hashRe = /['"]([A-Za-z0-9+/]{40,}={0,2})['"]/g;
    const hashes = [];
    let m;
    while ((m = hashRe.exec(scriptSrc)) !== null) {
      if (m[1].length >= 40 && m[1].length <= 64) hashes.push(m[1]);
    }
    const cidM = scriptSrc.match(/challenge_id['"]\s*[,)]\s*['"]\s*([^'"]{10,})['"]/);
    const tsM  = scriptSrc.match(/'(\d{13})'/);
    return {
      server_hashes: hashes.slice(0, 3),
      challenge_id : cidM?.[1] || '',
      timestamp    : tsM?.[1]  || String(Date.now()),
    };
  }

  static async solve(rawToken) {
    let decoded;
    try { decoded = decodeURIComponent(rawToken); }
    catch { decoded = rawToken; }

    let scriptSrc;
    try { scriptSrc = Buffer.from(decoded, 'base64').toString('utf-8'); }
    catch { return rawToken; }

    let obj = null;

    if (!obj) {
      try {
        const res = await ChallengeHandler._executeJsdom(scriptSrc);
        if (res && Array.isArray(res.server_hashes) && res.server_hashes.length) obj = res;
      } catch {}
    }

    if (!obj) {
      try {
        const res = await ChallengeHandler._executeVm2(scriptSrc);
        if (res && Array.isArray(res.server_hashes) && res.server_hashes.length) obj = res;
      } catch {}
    }

    if (!obj) {
      const { server_hashes, challenge_id, timestamp } = ChallengeHandler._extractMeta(scriptSrc);
      obj = { server_hashes, client_hashes: [], signals: {}, meta: { v: '4', challenge_id, timestamp } };
    }

    const hashedClient = await Promise.all(
      (obj.client_hashes || []).map(h => sha256b64(h))
    );

    const payload = {
      server_hashes : obj.server_hashes || [],
      client_hashes : hashedClient,
      signals       : obj.signals || {},
      meta: {
        ...(obj.meta || {}),
        v        : '4',
        origin   : BASE_URL,
        stack    : BROWSER_STACK,
        duration : String(randInt(820, 1380)), 
      },
    };

    return Buffer.from(JSON.stringify(payload)).toString('base64');
  }
}

class VqdManager {
  constructor() {
    this._solved    = null;
    this._fetchedAt = 0;
    this._ttlMs     = 200_000;
  }

  async refresh() {
    const res = await fetch(STATUS_URL, {
      headers: buildBaseHeaders({ [VQD_ACCEPT]: '1' }),
    });
    if (!res.ok) throw new Error(`VQD refresh – HTTP ${res.status}`);

    const raw = res.headers.get(VQD_HEADER);
    if (!raw) throw new Error('VQD header absent in /status');

    this._solved    = await ChallengeHandler.solve(raw);
    this._fetchedAt = Date.now();
    return this._solved;
  }

  async get(force = false) {
    if (force || !this._solved || Date.now() - this._fetchedAt > this._ttlMs) {
      await this.refresh();
    }
    return this._solved;
  }

  async update(rawFromResponse) {
    if (!rawFromResponse) return;
    try {
      this._solved    = await ChallengeHandler.solve(rawFromResponse);
      this._fetchedAt = Date.now();
    } catch {}
  }
}

class Conversation {
  constructor({ model = DEFAULT_MODEL, systemPrompt = null } = {}) {
    this.id           = crypto.randomUUID();
    this.model        = model;
    this.systemPrompt = systemPrompt;
    this.messages     = [];
    this.createdAt    = nowIso();
  }

  addUser(content)      { this.messages.push({ role: 'user',      content, timestamp: nowIso() }); }
  addAssistant(content) { this.messages.push({ role: 'assistant', content, status: 'active', timestamp: nowIso() }); }

  toPayload() {
    const base = this.systemPrompt ? [{ role: 'user', content: `[System]: ${this.systemPrompt}` }] : [];
    return [...base, ...this.messages.map(({ role, content }) => ({ role, content }))];
  }

  reset() { this.messages = []; this.id = crypto.randomUUID(); }
  get length() { return this.messages.length; }
  toJSON() {
    return { id: this.id, model: this.model, createdAt: this.createdAt, systemPrompt: this.systemPrompt, messageCount: this.messages.length, messages: this.messages };
  }
}

class StreamParser extends EventEmitter {
  constructor() { super(); this._buf = ''; }

  feed(chunk) {
    this._buf += chunk;
    const lines = this._buf.split('\n');
    this._buf   = lines.pop();
    for (const line of lines) {
      const p = parseSseLine(line.trim());
      if (!p) continue;
      if (p.done) { this.emit('done'); continue; }
      if (p.action === 'success' && p.role === 'assistant' && p.message !== undefined) this.emit('token', p.message, p.model);
      else if (p.action === 'error') this.emit('error', new Error(p.type || 'API error'));
      else if (p.role === 'tool-invocation') this.emit('tool', { name: p.toolName, state: p.state });
    }
  }

  flush() { if (this._buf.trim()) this.feed('\n'); }
}

function buildResponse({ id, conversationId, model, prompt, content, tokens, toolsInvoked, startedAt, finishedAt, durationMs, attempt, status = 'success', error = null }) {
  return {
    meta    : { id, conversationId, status, attempt, model, startedAt, finishedAt, durationMs },
    request : { prompt, charCount: prompt?.length ?? 0 },
    response: { content, charCount: content?.length ?? 0, tokenCount: tokens?.length ?? 0, tokens, toolsInvoked, error: error ? { message: error.message } : null },
  };
}

class DuckAIClient {
  constructor({ maxRetries = RETRY_CONFIG.maxRetries, useTools = false } = {}) {
    this._vqd        = new VqdManager();
    this._maxRetries = maxRetries;
    this._useTools   = useTools;
  }

  _buildBody(conversation) {
    return {
      model    : conversation.model,
      metadata : { toolChoice: { NewsSearch: this._useTools, VideosSearch: false, LocalSearch: false, WeatherForecast: false } },
      messages            : conversation.toPayload(),
      canUseTools         : this._useTools,
      canUseApproxLocation: null,
    };
  }

  async _buildHeaders(force = false) {
    const vqd = await this._vqd.get(force);
    return buildBaseHeaders({
      'Content-Type' : 'application/json',
      'Accept'       : 'text/event-stream',
      'x-fe-version' : FE_VERSION,
      'x-fe-signals' : encodeSignals(),
      [VQD_HEADER]   : vqd,
    });
  }

  async _streamChat(conversation, prompt, opts = {}) {
    const { onToken, signal } = opts;
    const startedAt = nowIso();
    const hrStart   = process.hrtime.bigint();
    const messageId = crypto.randomUUID();

    let attempt = 0;
    let lastErr = null;

    while (attempt <= this._maxRetries) {
      try {
        const headers = await this._buildHeaders(attempt > 0);

        if (attempt > 0) uaRotator.rotate();

        await sleep(randInt(200, 700));

        const res = await fetch(CHAT_URL, {
          method : 'POST',
          headers,
          body   : JSON.stringify(this._buildBody(conversation)),
          signal,
        });

        await this._vqd.update(res.headers.get(VQD_HEADER));

        if (!res.ok) {
          const text = await res.text().catch(() => '');
          const err  = new Error(`HTTP ${res.status} – ${text.slice(0, 300)}`);

          if (res.status === 418) {
            await sleep(randInt(4000, 8000));
            uaRotator.rotate();
            await this._vqd.refresh();
          }

          throw err;
        }

        if (!res.body) throw new Error('Response body is null');

        const parser       = new StreamParser();
        const tokenChunks  = [];
        const toolsInvoked = [];
        let   detectedModel = conversation.model;

        await new Promise((resolve, reject) => {
          parser.on('token', (tok, mdl) => { tokenChunks.push(tok); if (mdl) detectedModel = mdl; onToken?.(tok); });
          parser.on('tool',  t  => toolsInvoked.push(t));
          parser.on('done',  () => resolve());
          parser.on('error', reject);

          (async () => {
            try {
              const dec = new TextDecoder();
              for await (const chunk of res.body) {
                if (signal?.aborted) { reject(new DOMException('Aborted', 'AbortError')); return; }
                parser.feed(dec.decode(chunk, { stream: true }));
              }
              parser.flush();
              resolve();
            } catch (e) { reject(e); }
          })();
        });

        const content = tokenChunks.join('');
        conversation.addAssistant(content);

        return buildResponse({
          id: messageId, conversationId: conversation.id, model: detectedModel,
          prompt, content, tokens: tokenChunks, toolsInvoked,
          startedAt, finishedAt: nowIso(), durationMs: hrMs(hrStart),
          attempt: attempt + 1, status: 'success',
        });

      } catch (err) {
        lastErr = err;
        if (err.name === 'AbortError') throw err;
        if (attempt >= this._maxRetries) break;

        console.error(`[DuckAI] Attempt ${attempt + 1} failed:`, err.message);
        await sleep(calcBackoff(attempt));
        attempt++;
      }
    }

    console.error('[DuckAI] All retries exhausted:', lastErr?.message);
    return buildResponse({
      id: messageId, conversationId: conversation.id, model: conversation.model,
      prompt, content: null, tokens: [], toolsInvoked: [],
      startedAt, finishedAt: nowIso(), durationMs: hrMs(hrStart),
      attempt: attempt + 1, status: 'error', error: lastErr,
    });
  }

  async chat(content, conversation, opts = {}) {
    if (!(conversation instanceof Conversation)) throw new TypeError('Expected Conversation instance');
    conversation.addUser(content);
    return this._streamChat(conversation, content, opts);
  }

  async ask(content, { model = DEFAULT_MODEL, onToken, signal } = {}) {
    const conv = new Conversation({ model });
    return this.chat(content, conv, { onToken, signal });
  }
}

// Export menggunakan CommonJS
module.exports = { MODELS, Conversation, DuckAIClient };