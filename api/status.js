import { parseSimOrderId } from './_lib/admin.js';
import { coreUrl, authHeader, isPaid } from './_lib/midtrans.js';

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
    return res.status(200).json({
      order_id: orderId,
      transaction_status: SIM_STATUS[sim.outcome],
      payment_type: 'simulasi',
      gross_amount: null,
      paid: sim.outcome === 'success',
      simulated: true,
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
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Gagal mengecek status pembayaran.' });
  }
}
