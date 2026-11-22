import { verifySignature, isPaid } from './_lib/midtrans.js';

/**
 * POST /api/notification  (Midtrans HTTP Notification / Webhook)
 * Daftarkan URL ini di Midtrans Dashboard > Settings > Payment >
 * Notification URL:  https://DOMAIN-ANDA/api/notification
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const n = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};

    if (!verifySignature(n)) {
      console.warn('Signature notifikasi tidak valid untuk order', n && n.order_id);
      return res.status(403).json({ error: 'Invalid signature' });
    }

    const paid = isPaid(n);
    console.log(
      JSON.stringify({
        event: 'midtrans_notification',
        order_id: n.order_id,
        transaction_status: n.transaction_status,
        payment_type: n.payment_type,
        gross_amount: n.gross_amount,
        paid,
      })
    );

    // TODO (opsional, untuk produksi): simpan status ke database dan/atau
    // kirim email/WhatsApp otomatis ke pelanggan & admin ketika `paid === true`.
    // Contoh layanan: Supabase / Vercel Postgres (database), Resend (email).

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}
