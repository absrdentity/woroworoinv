import { PACKAGES, slugify, validateSelection } from '../../shared/catalog.js';
import { kv, storeConfigured } from './store.js';
import { clean } from './midtrans.js';

const DAY = 86400000;
const GRACE_DAYS = 30; // data dihapus otomatis dari penyimpanan 30 hari setelah kedaluwarsa
const INDEX = 'wwi:invs';
const invKey = (slug) => `wwi:inv:${slug}`;
const ordKey = (id) => `wwi:ord:${id}`;

export const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{1,38})[a-z0-9]$/;
export { storeConfigured };

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

  let slug;
  if (input.slug) {
    slug = String(input.slug).toLowerCase().trim();
    if (!SLUG_RE.test(slug)) throw Object.assign(new Error('Slug hanya huruf kecil, angka, dan strip (3-40 karakter).'), { status: 400 });
    if (await kv.get(invKey(slug))) throw Object.assign(new Error('Slug sudah dipakai. Pilih yang lain.'), { status: 409 });
  } else {
    slug = await uniqueSlug(slugify(event.name1, event.name2));
  }

  const now = Date.now();
  const inv = {
    slug,
    packageId: pkg.id,
    features: sel.features,
    themeId: input.themeId,
    eventTypeId: input.eventTypeId,
    event,
    owner: clean(input.owner || (customer && customer.name) || event.name1, 60),
    contact: customer ? { email: clean(customer.email, 100), phone: clean(customer.phone, 20) } : null,
    orderId,
    simulated,
    createdAt: now,
    durationDays: days,
    expiresAt: now + days * DAY,
  };
  await kv.set(invKey(slug), inv, { exat: purgeAt(inv.expiresAt) });
  await kv.sadd(INDEX, slug);
  return inv;
}

export const getInvitation = (slug) => kv.get(invKey(slug));

export async function listInvitations() {
  const slugs = await kv.smembers(INDEX);
  const rows = await kv.mget(slugs.map(invKey));
  const out = [];
  for (let i = 0; i < slugs.length; i += 1) {
    if (rows[i]) out.push(rows[i]);
    else await kv.srem(INDEX, slugs[i]); // sudah terhapus otomatis: bersihkan indeks
  }
  return out.sort((a, b) => b.createdAt - a.createdAt);
}

/** Ubah masa aktif: { days } = mulai dari SEKARANG, { extendDays } = tambah dari batas sekarang. */
export async function updateInvitation(slug, { days, extendDays, event }) {
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
  await kv.set(invKey(slug), inv, { exat: purgeAt(inv.expiresAt) });
  return inv;
}

export async function deleteInvitation(slug) {
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
  return item;
}
export const listWishes = (slug, n = 30) => kv.lrange(`wwi:wish:${slug}`, 0, n - 1);

export async function addRsvp(slug, { name, attend }) {
  const item = { n: clean(name, 40), a: attend === 'no' ? 'no' : 'yes', t: Date.now() };
  if (!item.n) throw Object.assign(new Error('Nama wajib diisi.'), { status: 400 });
  await kv.lpush(`wwi:rsvp:${slug}`, item);
  await kv.ltrim(`wwi:rsvp:${slug}`, 0, 499);
  return item;
}
export const listRsvps = (slug, n = 500) => kv.lrange(`wwi:rsvp:${slug}`, 0, n - 1);
