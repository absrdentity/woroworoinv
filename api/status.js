import { parseSimOrderId } from './_lib/admin.js';
import { coreUrl, authHeader, isPaid } from './_lib/midtrans.js';
import { ensureInvitationForOrder, storeConfigured } from './_lib/invitations.js';

/** Bila sudah lunas, pastikan link undangan dibuat (idempoten) dan kembalikan ringkasannya. */
async function inviteInfo(orderId, paid, origin) {
  if (!paid || !storeConfigured()) return { storage: storeConfigured(), invitation: null };
  try {
    const inv = await ensureInvitationForOrder(orderId);
    return {
      storage: true,
      invitation: inv
        ? {
            slug: inv.slug,
            url: `${origin}/u/${inv.slug}`,
            manageUrl: `${origin}/kelola/${inv.slug}?k=${inv.editKey}`,
            expiresAt: inv.expiresAt,
          }
        : null,
    };
  } catch (e) {
    console.error('ensureInvitation gagal:', e.message);
    return { storage: true, invitation: null };
  }
}

function originOf(req) {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, '');
  const proto = req.headers['x-forwarded-proto'] || 'https';
  return `${proto}://${req.headers['x-forwarded-host'] || req.headers.host}`;
}

const SIM_STATUS = { success: 'settlement', pending: 'pending', failed: 'deny' };

/**
 * GET /api/status?order_id=WWI-...
 * Mengecek status transaksi langsung ke Midtrans (tanpa database).
 * Order id berawalan TEST- adalah simulasi admin (tanda tangan diverifikasi).
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const orderId = String(req.query.order_id || '');

  if (orderId.startsWith('TEST-')) {
    const sim = parseSimOrderId(orderId);
    if (!sim) return res.status(400).json({ error: 'Order simulasi tidak valid.' });
    const paidSim = sim.outcome === 'success';
    return res.status(200).json({
      order_id: orderId,
      transaction_status: SIM_STATUS[sim.outcome],
      payment_type: 'simulasi',
      gross_amount: null,
      paid: paidSim,
      simulated: true,
      ...(await inviteInfo(orderId, paidSim, originOf(req))),
    });
  }

  if (!/^WWI-[A-Za-z0-9-]{3,40}$/.test(orderId)) {
    return res.status(400).json({ error: 'order_id tidak valid.' });
  }

  try {
    const response = await fetch(`${coreUrl()}/${encodeURIComponent(orderId)}/status`, {
      headers: { Accept: 'application/json', Authorization: authHeader() },
    });
    const data = await response.json().catch(() => ({}));

    if (String(data.status_code) === '404') {
      return res.status(404).json({ error: 'Transaksi belum ditemukan.' });
    }

    return res.status(200).json({
      order_id: orderId,
      transaction_status: data.transaction_status || 'unknown',
      payment_type: data.payment_type || null,
      gross_amount: data.gross_amount || null,
      paid: isPaid(data),
      simulated: false,
      ...(await inviteInfo(orderId, isPaid(data), originOf(req))),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Gagal mengecek status pembayaran.' });
  }
}
