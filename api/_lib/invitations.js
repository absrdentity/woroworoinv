import { randomBytes, timingSafeEqual } from 'node:crypto';
import {
  CONTENT_LIMITS,
  PACKAGES,
  cleanContent,
  cleanGuests,
  contentImageIds,
  isImageId,
  normalizeMusic,
  slugify,
  validateSelection,
} from '../../shared/catalog.js';
import { kv, storeConfigured } from './store.js';
import { clean } from './midtrans.js';

const DAY = 86400000;
const GRACE_DAYS = 30; // data dihapus otomatis dari penyimpanan 30 hari setelah kedaluwarsa
const INDEX = 'wwi:invs';
const invKey = (slug) => `wwi:inv:${slug}`;
const ordKey = (id) => `wwi:ord:${id}`;
const imgKey = (slug, id) => `wwi:img:${slug}:${id}`;
const META = 'wwi:meta'; // slug -> ringkasan (untuk mendeteksi undangan yang hilang dari penyimpanan)
const domKey = (d) => `wwi:dom:${d}`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Kunci singkat per undangan agar dua penulisan bersamaan tidak saling menimpa (foto/isi/durasi). */
async function withLock(slug, fn) {
  const lk = `wwi:mut:${slug}`;
  let got = false;
  for (let i = 0; i < 20 && !got; i += 1) {
    got = await kv.set(lk, 1, { ex: 15, nx: true });
    if (!got) await sleep(150);
  }
  try {
    return await fn();
  } finally {
    if (got) await kv.del(lk).catch(() => {});
  }
}

const writeMeta = (inv) =>
  kv.hset(META, inv.slug, { expiresAt: inv.expiresAt, createdAt: inv.createdAt, name1: inv.event.name1, name2: inv.event.name2, owner: inv.owner });

export const normHost = (h) => String(h || '').toLowerCase().replace(/:\d+$/, '').replace(/^www\./, '');

/** Memetakan domain kustom -> slug. false bila domain sudah dipakai undangan lain. */
async function syncDomain(inv, oldDomain = '') {
  const d = normHost(inv.content && inv.content.domain);
  const old = normHost(oldDomain);
  if (old && old !== d) {
    const cur = await kv.get(domKey(old));
    if (cur && cur.slug === inv.slug) await kv.del(domKey(old));
  }
  if (!d) return true;
  const rec = { slug: inv.slug };
  const opt = { exat: purgeAt(inv.expiresAt) };
  if (await kv.set(domKey(d), rec, { ...opt, nx: true })) return true;
  const cur = await kv.get(domKey(d));
  if (cur && cur.slug === inv.slug) {
    await kv.set(domKey(d), rec, opt);
    return true;
  }
  return false;
}

export async function slugForDomain(host) {
  const d = normHost(host);
  if (!/^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}$/.test(d)) return null;
  const r = await kv.get(domKey(d));
  return (r && r.slug) || null;
}

export const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{1,38})[a-z0-9]$/;
export { storeConfigured };

function musicOrThrow(m) {
  try {
    return normalizeMusic(m);
  } catch (e) {
    throw Object.assign(new Error(e.message), { status: 400 });
  }
}

const cleanEvent = (e = {}) => ({
  name1: clean(e.name1, 40),
  name2: clean(e.name2, 40),
  venue: clean(e.venue, 80),
  address: clean(e.address, 160),
  date: /^\d{4}-\d{2}-\d{2}$/.test(e.date || '') ? e.date : '',
  time: /^\d{2}:\d{2}$/.test(e.time || '') ? e.time : '',
});

/** Waktu hapus otomatis di penyimpanan (detik unix). */
const purgeAt = (expiresAt) => Math.floor((expiresAt + GRACE_DAYS * DAY) / 1000);

export const statusOf = (inv, now = Date.now()) => (inv.expiresAt <= now ? 'expired' : 'active');
export const daysLeft = (inv, now = Date.now()) => Math.max(0, Math.ceil((inv.expiresAt - now) / DAY));

async function uniqueSlug(base) {
  let slug = base.length >= 3 ? base : `${base}-wwi`;
  for (let i = 0; i < 6; i += 1) {
    if (!(await kv.get(invKey(slug)))) return slug;
    const suffix = i === 0 ? String(2 + Math.floor(Math.random() * 8)) : Math.random().toString(36).slice(2, 5);
    slug = `${base.slice(0, 34)}-${suffix}`;
  }
  return `${base.slice(0, 30)}-${Date.now().toString(36)}`;
}

/**
 * Membuat undangan. `slug` opsional (kustom); bila kosong dibuat otomatis dari nama pemilik.
 * `days` default = masa aktif paket.
 */
export async function createInvitation(input, { simulated = false, orderId = null, customer = null } = {}) {
  const sel = validateSelection({
    packageId: input.packageId,
    features: input.features,
    theme: input.themeId,
    eventType: input.eventTypeId,
  });
  if (!sel.ok) throw Object.assign(new Error(sel.error), { status: 400 });

  const event = cleanEvent(input.event);
  const pkg = sel.pkg;
  const days = Math.min(3650, Math.max(1, Math.round(Number(input.days) || pkg.durationDays)));

  const custom = input.slug ? String(input.slug).toLowerCase().trim() : '';
  if (custom && !SLUG_RE.test(custom)) throw Object.assign(new Error('Slug hanya huruf kecil, angka, dan strip (3-40 karakter).'), { status: 400 });
  const baseSlug = slugify(event.name1, event.name2);

  const now = Date.now();
  const inv = {
    slug: custom,
    packageId: pkg.id,
    features: sel.features,
    themeId: input.themeId,
    eventTypeId: input.eventTypeId,
    event,
    music: sel.features.includes('music') ? musicOrThrow(input.music) : null,
    content: cleanContent(input.content, sel.features),
    guests: [],
    media: [],
    editKey: randomBytes(12).toString('base64url'),
    owner: clean(input.owner || (customer && customer.name) || event.name1, 60),
    contact: customer ? { email: clean(customer.email, 100), phone: clean(customer.phone, 20) } : null,
    orderId,
    simulated,
    createdAt: now,
    durationDays: days,
    expiresAt: now + days * DAY,
  };
  // SET ... NX: tidak pernah menimpa undangan lain yang kebetulan bernama sama (dua pesanan bersamaan)
  for (let i = 0; ; i += 1) {
    inv.slug = custom || (await uniqueSlug(baseSlug));
    if (await kv.set(invKey(inv.slug), inv, { exat: purgeAt(inv.expiresAt), nx: true })) break;
    if (custom) throw Object.assign(new Error('Slug sudah dipakai. Pilih yang lain.'), { status: 409 });
    if (i >= 5) throw Object.assign(new Error('Gagal membuat link unik. Coba lagi.'), { status: 503 });
  }
  await kv.sadd(INDEX, inv.slug);
  await writeMeta(inv);
  if (inv.content.domain && !(await syncDomain(inv))) {
    inv.content.domain = ''; // domain sudah dipakai undangan lain: abaikan, jangan gagalkan pesanan
    await kv.set(invKey(inv.slug), inv, { exat: purgeAt(inv.expiresAt) });
  }
  return inv;
}

export const getInvitation = (slug) => kv.get(invKey(slug));

export async function listInvitations() {
  const slugs = await kv.smembers(INDEX);
  const rows = await kv.mget(slugs.map(invKey));
  const meta = await kv.hgetall(META).catch(() => ({}));
  const out = [];
  for (let i = 0; i < slugs.length; i += 1) {
    const slug = slugs[i];
    if (rows[i]) {
      out.push(rows[i]);
      if (!meta[slug]) await writeMeta(rows[i]).catch(() => {});
      continue;
    }
    const m = meta[slug];
    if (m && m.expiresAt > Date.now()) {
      // masa aktif belum habis tetapi datanya tidak ada di penyimpanan: JANGAN dibuang diam-diam
      out.push({
        slug, lost: true, features: [], editKey: '', owner: m.owner || '', content: {},
        event: { name1: m.name1 || '', name2: m.name2 || '', date: '', venue: '' },
        createdAt: m.createdAt || 0, expiresAt: m.expiresAt,
      });
    } else {
      await kv.srem(INDEX, slug); // sudah kedaluwarsa & terhapus otomatis: bersihkan indeks
      await kv.hdel(META, slug);
    }
  }
  return out.sort((a, b) => b.createdAt - a.createdAt);
}

/** Ubah masa aktif: { days } = mulai dari SEKARANG, { extendDays } = tambah dari batas sekarang. */
export const updateInvitation = (slug, opts) => withLock(slug, () => updateInvitationLocked(slug, opts));

async function updateInvitationLocked(slug, opts) {
  const { days, extendDays, event } = opts;
  const inv = await getInvitation(slug);
  if (!inv) throw Object.assign(new Error('Undangan tidak ditemukan.'), { status: 404 });
  const now = Date.now();
  if (days != null) {
    const d = Math.min(3650, Math.max(1, Math.round(Number(days))));
    inv.expiresAt = now + d * DAY;
    inv.durationDays = d;
  } else if (extendDays != null) {
    const d = Math.min(3650, Math.max(1, Math.round(Number(extendDays))));
    inv.expiresAt = Math.max(inv.expiresAt, now) + d * DAY;
  }
  if (event) inv.event = { ...inv.event, ...cleanEvent({ ...inv.event, ...event }) };
  if (days != null || extendDays != null) await touchMedia(inv);
  if ('music' in opts) {
    if (opts.music && !inv.features.includes('music')) {
      throw Object.assign(new Error('Fitur Musik Latar tidak aktif pada undangan ini.'), { status: 400 });
    }
    inv.music = musicOrThrow(opts.music);
  }
  await kv.set(invKey(slug), inv, { exat: purgeAt(inv.expiresAt) });
  await writeMeta(inv);
  if (inv.content && inv.content.domain) await syncDomain(inv, inv.content.domain);
  return inv;
}

export async function deleteInvitation(slug) {
  const inv = await getInvitation(slug);
  if (inv && inv.content && inv.content.domain) {
    const d = normHost(inv.content.domain);
    const cur = await kv.get(domKey(d));
    if (cur && cur.slug === slug) await kv.del(domKey(d));
  }
  await kv.hdel(META, slug);
  for (const id of (inv && inv.media) || []) await kv.del(imgKey(slug, id));
  await kv.del(`wwi:chk:${slug}`);
  await kv.del(`wwi:chkl:${slug}`);
  await kv.del(invKey(slug));
  await kv.del(`wwi:wish:${slug}`);
  await kv.del(`wwi:rsvp:${slug}`);
  await kv.srem(INDEX, slug);
}

/* ---------- Pesanan -> undangan otomatis ---------- */
export async function saveOrder(orderId, order) {
  if (!storeConfigured()) return;
  await kv.set(ordKey(orderId), { ...order, createdAt: Date.now() }, { ex: 14 * 86400 });
}

/** Dipanggil saat pembayaran lunas (webhook / cek status). Aman dipanggil berulang. */
export async function ensureInvitationForOrder(orderId) {
  if (!storeConfigured()) return null;
  const ord = await kv.get(ordKey(orderId));
  if (!ord) return null;
  if (ord.slug) return getInvitation(ord.slug);
  // kunci agar webhook + halaman sukses yang bersamaan tidak membuat dua undangan
  const got = await kv.set(`wwi:lock:${orderId}`, 1, { ex: 60, nx: true });
  if (!got) {
    for (let i = 0; i < 6; i += 1) {
      await new Promise((r) => setTimeout(r, 400));
      const again = await kv.get(ordKey(orderId));
      if (again && again.slug) return getInvitation(again.slug);
    }
    return null;
  }
  const inv = await createInvitation(ord, { simulated: !!ord.simulated, orderId, customer: ord.customer });
  await kv.set(ordKey(orderId), { ...ord, slug: inv.slug }, { ex: 90 * 86400 });
  return inv;
}

/** Data yang boleh dilihat publik (tanpa kontak pemilik). */
export function publicView(inv) {
  return {
    slug: inv.slug,
    packageId: inv.packageId,
    features: inv.features,
    themeId: inv.themeId,
    eventTypeId: inv.eventTypeId,
    event: inv.event,
    music: inv.music || null,
    content: inv.content || {},
    expiresAt: inv.expiresAt,
  };
}

export const packageOf = (id) => PACKAGES.find((p) => p.id === id);

/* ---------- RSVP & ucapan tamu ---------- */
export async function addWish(slug, { name, message }) {
  const item = { n: clean(name, 40) || 'Tamu', m: clean(message, 160), t: Date.now() };
  if (!item.m) throw Object.assign(new Error('Ucapan kosong.'), { status: 400 });
  await kv.lpush(`wwi:wish:${slug}`, item);
  await kv.ltrim(`wwi:wish:${slug}`, 0, 199);
  await expireWithInvitation(slug, `wwi:wish:${slug}`);
  return item;
}
export const listWishes = (slug, n = 30) => kv.lrange(`wwi:wish:${slug}`, 0, n - 1);

export async function addRsvp(slug, { name, attend }) {
  const item = { n: clean(name, 40), a: attend === 'no' ? 'no' : 'yes', t: Date.now() };
  if (!item.n) throw Object.assign(new Error('Nama wajib diisi.'), { status: 400 });
  await kv.lpush(`wwi:rsvp:${slug}`, item);
  await kv.ltrim(`wwi:rsvp:${slug}`, 0, 499);
  await expireWithInvitation(slug, `wwi:rsvp:${slug}`);
  return item;
}
export const listRsvps = (slug, n = 500) => kv.lrange(`wwi:rsvp:${slug}`, 0, n - 1);

/* ---------- Kunci pengelolaan, media, check-in ---------- */
async function expireWithInvitation(slug, key) {
  const inv = await getInvitation(slug);
  if (inv) await kv.expireat(key, purgeAt(inv.expiresAt));
}

/** Perbarui waktu hapus otomatis semua gambar (dipanggil saat masa aktif berubah). */
async function touchMedia(inv) {
  for (const id of inv.media || []) await kv.expireat(imgKey(inv.slug, id), purgeAt(inv.expiresAt));
}

/** Cocokkan kunci pengelolaan pelanggan (perbandingan waktu-konstan). */
export function keyMatches(inv, key) {
  const a = Buffer.from(String(key || ''));
  const b = Buffer.from(String(inv.editKey || ''));
  return a.length === b.length && a.length > 0 && timingSafeEqual(a, b);
}

const MAGIC = {
  'image/jpeg': (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  'image/png': (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47,
  'image/webp': (b) => b.slice(0, 4).toString() === 'RIFF' && b.slice(8, 12).toString() === 'WEBP',
};

/** Simpan 1 gambar (data URL hasil kompres di browser). Mengembalikan id. */
export const saveImage = (slug, dataUrl) => withLock(slug, () => saveImageLocked(slug, dataUrl));

async function saveImageLocked(slug, dataUrl) {
  const inv = await getInvitation(slug);
  if (!inv) throw Object.assign(new Error('Undangan tidak ditemukan.'), { status: 404 });
  const m = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/]+={0,2})$/.exec(String(dataUrl || ''));
  if (!m) throw Object.assign(new Error('Format gambar harus JPG, PNG, atau WebP.'), { status: 400 });
  const bytes = Buffer.from(m[2], 'base64');
  if (bytes.length > CONTENT_LIMITS.imageBytes) {
    throw Object.assign(new Error('Ukuran gambar terlalu besar (maks. ' + Math.round(CONTENT_LIMITS.imageBytes / 1000) + ' KB setelah dikompres).'), { status: 413 });
  }
  if (!MAGIC[m[1]](bytes)) throw Object.assign(new Error('Berkas bukan gambar yang valid.'), { status: 400 });
  if ((inv.media || []).length >= CONTENT_LIMITS.uploadsPerInvitation) {
    throw Object.assign(new Error('Batas unggahan tercapai. Hapus foto yang tidak dipakai lalu simpan.'), { status: 400 });
  }
  const id = randomBytes(8).toString('hex');
  await kv.setRaw(imgKey(slug, id), JSON.stringify({ m: m[1], d: m[2] }), { exat: purgeAt(inv.expiresAt) });
  inv.media = [...(inv.media || []), id];
  await kv.set(invKey(slug), inv, { exat: purgeAt(inv.expiresAt) });
  return id;
}

export async function getImage(slug, id) {
  if (!isImageId(id)) return null;
  const raw = await kv.getRaw(imgKey(slug, id));
  if (!raw) return null;
  try {
    const v = JSON.parse(raw);
    return { mime: v.m, bytes: Buffer.from(v.d, 'base64') };
  } catch {
    return null;
  }
}

/** Simpan isi undangan (teks + rujukan gambar), detail acara, musik, dan daftar tamu. */
export const saveContent = (slug, body) => withLock(slug, () => saveContentLocked(slug, body));

async function saveContentLocked(slug, body) {
  const inv = await getInvitation(slug);
  if (!inv) throw Object.assign(new Error('Undangan tidak ditemukan.'), { status: 404 });
  if (body.event) inv.event = { ...inv.event, ...cleanEvent({ ...inv.event, ...body.event }) };
  if ('music' in body && inv.features.includes('music')) inv.music = musicOrThrow(body.music);
  if (body.content) {
    const oldDomain = (inv.content && inv.content.domain) || '';
    const next = cleanContent(body.content, inv.features);
    inv.content = { ...inv.content, domain: next.domain || '' };
    if ((next.domain || '') !== oldDomain && !(await syncDomain(inv, oldDomain))) {
      throw Object.assign(new Error('Domain ini sudah dipakai undangan lain.'), { status: 409 });
    }
    // hanya boleh merujuk gambar yang memang diunggah ke undangan ini
    const owned = new Set(inv.media || []);
    const used = new Set(contentImageIds(next).filter((id) => owned.has(id)));
    const fix = (id) => (id && used.has(id) ? id : '');
    next.cover = fix(next.cover);
    if (next.gallery) next.gallery = next.gallery.filter((id) => used.has(id));
    if (next.gift) next.gift.qris = fix(next.gift.qris);
    inv.content = next;
    // hapus gambar yang tidak dirujuk lagi
    const keep = new Set(contentImageIds(next));
    for (const id of inv.media || []) if (!keep.has(id)) await kv.del(imgKey(slug, id));
    inv.media = [...keep];
  }
  if (body.guests) inv.guests = cleanGuests(body.guests);
  await kv.set(invKey(slug), inv, { exat: purgeAt(inv.expiresAt) });
  return inv;
}

/** Check-in tamu di lokasi. `code` = "CHK:slug:Nama" (dari QR) atau nama biasa. */
export async function checkIn(slug, code) {
  let name = String(code || '').trim();
  const m = /^CHK:([a-z0-9-]+):(.+)$/i.exec(name);
  if (m) {
    if (m[1].toLowerCase() !== slug) throw Object.assign(new Error('QR ini milik undangan lain.'), { status: 400 });
    name = m[2];
  }
  name = name.replace(/[\u0000-\u001f<>]/g, '').slice(0, 60).trim();
  if (!name) throw Object.assign(new Error('Nama / kode kosong.'), { status: 400 });
  const added = await kv.sadd(`wwi:chk:${slug}`, name.toLowerCase());
  const at = Date.now();
  if (added === 1) {
    await kv.lpush(`wwi:chkl:${slug}`, { n: name, t: at });
    await kv.ltrim(`wwi:chkl:${slug}`, 0, 999);
    await expireWithInvitation(slug, `wwi:chk:${slug}`);
    await expireWithInvitation(slug, `wwi:chkl:${slug}`);
  }
  return { name, already: added !== 1 };
}
export const listCheckins = (slug) => kv.lrange(`wwi:chkl:${slug}`, 0, 999);
