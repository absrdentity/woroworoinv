import crypto from 'node:crypto';

/**
 * Mode Midtrans ditentukan OTOMATIS dari Server Key:
 *   "SB-Mid-server-..."  -> sandbox (uji coba)
 *   "Mid-server-..."     -> production (uang sungguhan)
 * Bisa dipaksa lewat MIDTRANS_ENV=sandbox|production (opsional).
 */
export function getMode() {
  const forced = String(process.env.MIDTRANS_ENV || '').toLowerCase();
  if (forced === 'production' || forced === 'sandbox') return forced;
  // kompatibel dengan versi lama
  if (process.env.MIDTRANS_IS_PRODUCTION === 'true') return 'production';
  if (process.env.MIDTRANS_IS_PRODUCTION === 'false') return 'sandbox';
  const key = process.env.MIDTRANS_SERVER_KEY || '';
  return key && !key.startsWith('SB-') ? 'production' : 'sandbox';
}

export const isProduction = () => getMode() === 'production';

export const snapUrl = () =>
  isProduction() ? 'https://app.midtrans.com/snap/v1/transactions' : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

export const coreUrl = () => (isProduction() ? 'https://api.midtrans.com/v2' : 'https://api.sandbox.midtrans.com/v2');

export const getServerKey = () => process.env.MIDTRANS_SERVER_KEY || '';
export const getClientKey = () => process.env.MIDTRANS_CLIENT_KEY || process.env.VITE_MIDTRANS_CLIENT_KEY || '';
export const getAdminWhatsapp = () =>
  String(process.env.ADMIN_WHATSAPP || process.env.VITE_ADMIN_WHATSAPP || '').replace(/\D/g, '');

export function authHeader() {
  const key = getServerKey();
  if (!key) throw new Error('MIDTRANS_SERVER_KEY belum diatur. Buka halaman /admin untuk panduan setup.');
  return 'Basic ' + Buffer.from(key + ':').toString('base64');
}

/** Jenis key berdasarkan prefix: 'sandbox' | 'production' | null */
export function keyKind(key) {
  if (!key) return null;
  return key.startsWith('SB-') ? 'sandbox' : 'production';
}

export function maskKey(key) {
  if (!key) return '';
  if (key.length <= 12) return '••••••';
  return `${key.slice(0, 6)}••••••••${key.slice(-4)}`;
}

/**
 * Verifikasi signature notifikasi Midtrans:
 * SHA512(order_id + status_code + gross_amount + ServerKey)
 */
export function verifySignature(n) {
  const key = getServerKey();
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
