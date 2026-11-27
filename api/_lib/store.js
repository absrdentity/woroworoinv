/**
 * Penyimpanan data via REST Upstash Redis (GRATIS, tanpa library tambahan).
 * Variabel yang dibaca (salah satu pasang):
 *   UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN   (buat langsung di upstash.com)
 *   KV_REST_API_URL / KV_REST_API_TOKEN                 (otomatis dari integrasi Upstash di Vercel)
 */
const url = () => (process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || '').replace(/\/$/, '');
const token = () => process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || '';

export const storeConfigured = () => !!(url() && token());

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Perintah Redis dengan batas waktu + coba ulang (gangguan jaringan / 429 / 5xx sesaat). */
async function cmd(...args) {
  let last;
  for (let i = 0; i < 3; i += 1) {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 8000);
    try {
      const res = await fetch(url(), {
        method: 'POST',
        headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(args),
        signal: ctl.signal,
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && !data.error) return data.result;
      const err = new Error(`Penyimpanan: ${data.error || `HTTP ${res.status}`}`);
      err.retry = res.status >= 500 || res.status === 429;
      throw err;
    } catch (e) {
      last = e;
      if (e.retry === false || i === 2) break;
      await sleep(300 * (i + 1));
    } finally {
      clearTimeout(timer);
    }
  }
  throw last;
}

const parse = (v) => {
  if (v == null) return null;
  try {
    return JSON.parse(v);
  } catch {
    // jangan dianggap "tidak ada": data rusak harus terlihat sebagai galat, bukan undangan hilang
    throw new Error('Penyimpanan: data tidak terbaca.');
  }
};

export const kv = {
  ping: () => cmd('PING'),
  async get(key) {
    return parse(await cmd('GET', key));
  },
  /** opts: { exat: detikUnix, ex: detik, nx: true } -> true bila tersimpan */
  async set(key, value, opts = {}) {
    const a = ['SET', key, JSON.stringify(value)];
    if (opts.exat) a.push('EXAT', Math.floor(opts.exat));
    else if (opts.ex) a.push('EX', Math.floor(opts.ex));
    if (opts.nx) a.push('NX');
    return (await cmd(...a)) === 'OK';
  },
  del: (key) => cmd('DEL', key),
  sadd: (key, m) => cmd('SADD', key, m),
  srem: (key, m) => cmd('SREM', key, m),
  smembers: async (key) => (await cmd('SMEMBERS', key)) || [],
  async mget(keys) {
    if (!keys.length) return [];
    return ((await cmd('MGET', ...keys)) || []).map(parse);
  },
  lpush: (key, v) => cmd('LPUSH', key, JSON.stringify(v)),
  ltrim: (key, a, b) => cmd('LTRIM', key, a, b),
  async lrange(key, a, b) {
    return ((await cmd('LRANGE', key, a, b)) || []).map(parse).filter(Boolean);
  },
  hset: (key, field, v) => cmd('HSET', key, field, JSON.stringify(v)),
  hdel: (key, field) => cmd('HDEL', key, field),
  async hgetall(key) {
    const flat = (await cmd('HGETALL', key)) || [];
    const out = {};
    if (Array.isArray(flat)) for (let i = 0; i + 1 < flat.length; i += 2) { try { out[flat[i]] = JSON.parse(flat[i + 1]); } catch { /* abaikan */ } }
    else Object.assign(out, flat);
    return out;
  },
  expire: (key, sec) => cmd('EXPIRE', key, Math.floor(sec)),
  expireat: (key, ts) => cmd('EXPIREAT', key, Math.floor(ts)),
  /** nilai mentah (string) untuk data besar seperti gambar base64 */
  getRaw: (key) => cmd('GET', key),
  setRaw: async (key, str, opts = {}) => {
    const a = ['SET', key, str];
    if (opts.exat) a.push('EXAT', Math.floor(opts.exat));
    return (await cmd(...a)) === 'OK';
  },
};
