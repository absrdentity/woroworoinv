import { addRsvp, addWish, getInvitation, listWishes, normHost, publicView, slugForDomain, SLUG_RE, statusOf, storeConfigured } from './_lib/invitations.js';

/**
 * GET  /api/invite?slug=raka-ayu           -> data undangan publik (404 / 410 bila tidak ada / kedaluwarsa)
 * POST /api/invite?slug=raka-ayu           -> body { type: 'wish'|'rsvp', ... } dari tamu
 */
export default async function handler(req, res) {
  let slug = String((req.query && req.query.slug) || '').toLowerCase();
  const domain = normHost(req.query && req.query.domain);
  if (!domain && !SLUG_RE.test(slug)) return res.status(400).json({ error: 'invalid' });
  if (!storeConfigured()) return res.status(503).json({ error: 'storage' });

  try {
    if (domain) {
      // alamat domain kustom (mis. rakaayu.com) -> undangan miliknya
      const site = process.env.SITE_URL ? normHost(new URL(process.env.SITE_URL).hostname) : '';
      slug = domain === site ? null : await slugForDomain(domain);
      if (!slug) {
        res.setHeader('Cache-Control', 'public, s-maxage=60');
        return res.status(404).json({ error: 'not_found' });
      }
    }
    const inv = await getInvitation(slug);
    if (!inv) {
      res.setHeader('Cache-Control', 'no-store');
      return res.status(404).json({ error: 'not_found' });
    }
    if (statusOf(inv) === 'expired') {
      res.setHeader('Cache-Control', 'no-store');
      return res.status(410).json({ error: 'expired', event: { name1: inv.event.name1, name2: inv.event.name2 } });
    }

    if (req.method === 'POST') {
      const b = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
      if (b.type === 'wish') {
        const item = await addWish(slug, b);
        return res.status(200).json({ ok: true, wish: item });
      }
      if (b.type === 'rsvp') {
        await addRsvp(slug, b);
        return res.status(200).json({ ok: true });
      }
      return res.status(400).json({ error: 'type' });
    }

    if (req.method !== 'GET') {
      res.setHeader('Allow', 'GET, POST');
      return res.status(405).json({ error: 'Method not allowed' });
    }
    // cache singkat di CDN: menghemat kuota Redis & tetap tampil saat penyimpanan terganggu sesaat
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=10, stale-while-revalidate=300');
    return res.status(200).json({ ...publicView(inv), wishes: await listWishes(slug) });
  } catch (err) {
    console.error(err);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(err.status || 500).json({ error: err.message || 'server' });
  }
}
