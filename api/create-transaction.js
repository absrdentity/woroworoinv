import { validateSelection, validateCustomer } from '../shared/catalog.js';
import { SNAP_URL, authHeader, clean } from './_lib/midtrans.js';

/**
 * POST /api/create-transaction
 * Body: { packageId, features[], theme, eventType, customer{name,email,phone}, event{...} }
 * Harga SELALU dihitung di server dari katalog (bukan dari browser).
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

    const { pkg, features } = sel;
    const customer = body.customer;
    const event = body.event || {};

    const orderId = `WWI-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const proto = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const origin = process.env.SITE_URL || `${proto}://${host}`;

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

    const response = await fetch(SNAP_URL, {
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
