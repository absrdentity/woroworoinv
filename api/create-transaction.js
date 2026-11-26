import { validateSelection, validateCustomer } from '../shared/catalog.js';
import { isAdminReq, makeSimOrderId } from './_lib/admin.js';
import { snapUrl, authHeader, clean } from './_lib/midtrans.js';
import { saveOrder } from './_lib/invitations.js';

/** Simpan data pesanan agar undangan dibuat otomatis saat lunas (abaikan bila penyimpanan belum diatur). */
async function keepOrder(orderId, body, sel, simulated) {
  try {
    await saveOrder(orderId, {
      packageId: sel.pkg.id,
      features: sel.features,
      themeId: body.theme,
      eventTypeId: body.eventType,
      event: body.event || {},
      customer: { name: clean(body.customer.name, 60), email: clean(body.customer.email, 100), phone: clean(body.customer.phone, 20) },
      simulated,
    });
  } catch (e) {
    console.error('saveOrder gagal:', e.message);
  }
}

const OUTCOMES = ['success', 'pending', 'failed'];

/**
 * POST /api/create-transaction
 * Body: { packageId, features[], theme, eventType, customer{name,email,phone}, event{...}, simulate? }
 * - Harga SELALU dihitung di server dari katalog (bukan dari browser).
 * - `simulate` hanya diterima bila request membawa token admin yang valid.
 *   Simulasi tidak menghubungi Midtrans, jadi tidak ada biaya sama sekali.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};

    const sel = validateSelection(body);
    if (!sel.ok) return res.status(400).json({ error: sel.error });

    const customerError = validateCustomer(body.customer);
    if (customerError) return res.status(400).json({ error: customerError });

    // ---------- Simulasi pembayaran (khusus admin) ----------
    if (body.simulate) {
      if (!isAdminReq(req)) {
        return res.status(403).json({ error: 'Simulasi pembayaran hanya untuk admin. Silakan login di /admin.' });
      }
      const outcome = OUTCOMES.includes(body.simulate) ? body.simulate : 'success';
      const simId = makeSimOrderId(outcome);
      await keepOrder(simId, body, sel, true);
      return res.status(200).json({ simulated: true, outcome, order_id: simId });
    }

    const { pkg, features } = sel;
    const customer = body.customer;
    const event = body.event || {};

    const orderId = `WWI-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const proto = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const origin = (process.env.SITE_URL || `${proto}://${host}`).replace(/\/$/, '');

    const payload = {
      transaction_details: { order_id: orderId, gross_amount: pkg.price },
      item_details: [
        {
          id: pkg.id,
          price: pkg.price,
          quantity: 1,
          name: `Undangan Digital - Paket ${pkg.name}`.slice(0, 50),
        },
      ],
      customer_details: {
        first_name: clean(customer.name, 50),
        email: clean(customer.email, 100),
        phone: clean(customer.phone, 20),
      },
      // Ringkasan pesanan terlihat di Midtrans Dashboard (maks 255 karakter per field)
      custom_field1: clean(`${pkg.id}|${body.theme}|${body.eventType}`, 255),
      custom_field2: clean(features.join(','), 255),
      custom_field3: clean(`${event.name1 || ''} & ${event.name2 || ''} | ${event.date || ''}`, 255),
      expiry: { unit: 'hours', duration: 24 },
      callbacks: { finish: `${origin}/sukses` },
    };

    await keepOrder(orderId, body, sel, false);

    const response = await fetch(snapUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: authHeader(),
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data.token) {
      console.error('Midtrans error:', response.status, data);
      return res.status(502).json({
        error: (data.error_messages && data.error_messages.join(', ')) || 'Gagal membuat transaksi di Midtrans.',
      });
    }

    return res.status(200).json({ token: data.token, redirect_url: data.redirect_url, order_id: orderId });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || 'Terjadi kesalahan server.' });
  }
}
