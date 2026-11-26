import { isAdminReq } from './_lib/admin.js';
import { originOf } from './_lib/origin.js';
import {
  checkIn,
  daysLeft,
  getInvitation,
  keyMatches,
  listCheckins,
  listRsvps,
  listWishes,
  saveContent,
  saveImage,
  SLUG_RE,
  statusOf,
  storeConfigured,
} from './_lib/invitations.js';

/**
 * Pengelolaan undangan oleh PEMILIK (kunci rahasia pada link /kelola/<slug>?k=...) atau admin.
 * GET  /api/manage?slug=...            -> data lengkap + dashboard tamu
 * POST /api/manage?slug=...            -> { action: 'save' | 'upload' | 'checkin', ... }
 */
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const slug = String((req.query && req.query.slug) || '').toLowerCase();
  if (!SLUG_RE.test(slug)) return res.status(400).json({ error: 'Alamat tidak valid.' });
  if (!storeConfigured()) return res.status(503).json({ error: 'Penyimpanan belum diaktifkan.' });

  try {
    const inv = await getInvitation(slug);
    const key = req.headers['x-edit-key'] || (req.query && req.query.k) || '';
    const admin = isAdminReq(req);
    // pesan sama untuk "tidak ada" dan "kunci salah" agar slug tidak bisa ditebak
    if (!inv || !(admin || keyMatches(inv, key))) return res.status(401).json({ error: 'Link kelola tidak valid.' });

    const view = async (i) => ({
      slug: i.slug,
      url: `${originOf(req)}/u/${i.slug}`,
      isAdmin: admin,
      packageId: i.packageId,
      features: i.features,
      themeId: i.themeId,
      eventTypeId: i.eventTypeId,
      event: i.event,
      music: i.music || null,
      content: i.content || {},
      guests: i.guests || [],
      expiresAt: i.expiresAt,
      status: statusOf(i),
      daysLeft: daysLeft(i),
      rsvps: await listRsvps(i.slug),
      wishes: await listWishes(i.slug, 100),
      checkins: await listCheckins(i.slug),
    });

    if (req.method === 'GET') return res.status(200).json(await view(inv));
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'GET, POST');
      return res.status(405).json({ error: 'Method not allowed' });
    }
    if (statusOf(inv) === 'expired') return res.status(410).json({ error: 'Masa aktif undangan sudah berakhir.' });

    const b = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    if (b.action === 'upload') return res.status(200).json({ id: await saveImage(slug, b.dataUrl) });
    if (b.action === 'checkin') return res.status(200).json(await checkIn(slug, b.code));
    if (b.action === 'save') return res.status(200).json(await view(await saveContent(slug, b)));
    return res.status(400).json({ error: 'Aksi tidak dikenal.' });
  } catch (err) {
    console.error(err);
    return res.status(err.status || 500).json({ error: err.message || 'Terjadi kesalahan server.' });
  }
}
