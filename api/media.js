import { getImage, storeConfigured } from './_lib/invitations.js';
import { SLUG_RE } from './_lib/invitations.js';

/** GET /api/media?s=<slug>&i=<id gambar>  -> gambar milik undangan (id acak, aman di-cache) */
export default async function handler(req, res) {
  const slug = String((req.query && req.query.s) || '').toLowerCase();
  const id = String((req.query && req.query.i) || '');
  if (!SLUG_RE.test(slug) || !/^[a-f0-9]{16}$/.test(id)) return res.status(400).json({ error: 'invalid' });
  if (!storeConfigured()) return res.status(503).json({ error: 'storage' });
  try {
    const img = await getImage(slug, id);
    if (!img) return res.status(404).json({ error: 'not_found' });
    res.setHeader('Content-Type', img.mime);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400');
    return res.status(200).end(img.bytes);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'server' });
  }
}
