/**
 * Penyimpanan data via REST Upstash Redis (GRATIS, tanpa library tambahan).
 * Variabel yang dibaca (salah satu pasang):
 *   UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN   (buat langsung di upstash.com)
 *   KV_REST_API_URL / KV_REST_API_TOKEN                 (otomatis dari integrasi Upstash di Vercel)
 */
const url = () => (process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || '').replace(/\/$/, '');
const token = () => process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || '';

export const storeConfigured = () => !!(url() && token());

async function cmd(...args) {
  const res = await fetch(url(), {
    method: 'POST',
    headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.error) throw new Error(`Penyimpanan: ${data.error || `HTTP ${res.status}`}`);
  return data.result;
}

const parse = (v) => {
  if (v == null) return null;
  try {
    return JSON.parse(v);
  } catch {
    return null;
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
