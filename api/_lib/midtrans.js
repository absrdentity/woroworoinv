import crypto from 'node:crypto';

const isProd = process.env.MIDTRANS_IS_PRODUCTION === 'true';

export const SNAP_URL = isProd
  ? 'https://app.midtrans.com/snap/v1/transactions'
  : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

export const CORE_API_URL = isProd ? 'https://api.midtrans.com/v2' : 'https://api.sandbox.midtrans.com/v2';

export function authHeader() {
  const key = process.env.MIDTRANS_SERVER_KEY;
  if (!key) throw new Error('MIDTRANS_SERVER_KEY belum diatur di environment variable.');
  return 'Basic ' + Buffer.from(key + ':').toString('base64');
}

/**
 * Verifikasi signature notifikasi Midtrans:
 * SHA512(order_id + status_code + gross_amount + ServerKey)
 */
export function verifySignature(n) {
  const key = process.env.MIDTRANS_SERVER_KEY;
  if (!key || !n || !n.signature_key) return false;
  const expected = crypto
    .createHash('sha512')
    .update(`${n.order_id}${n.status_code}${n.gross_amount}${key}`)
    .digest('hex');
  const a = Buffer.from(expected);
  const b = Buffer.from(String(n.signature_key));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/** Apakah status transaksi dianggap LUNAS? */
export function isPaid(n) {
  if (!n) return false;
  if (n.transaction_status === 'settlement') return true;
  return n.transaction_status === 'capture' && n.fraud_status === 'accept';
}

export function clean(value, max = 100) {
  return String(value ?? '')
    .replace(/[\u0000-\u001f]/g, ' ')
    .trim()
    .slice(0, max);
}
