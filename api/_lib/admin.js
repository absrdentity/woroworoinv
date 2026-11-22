import crypto from 'node:crypto';

/**
 * Autentikasi admin TANPA database (stateless).
 * - Password diambil dari env ADMIN_PASSWORD (minimal 8 karakter).
 * - Login menghasilkan token bertanda tangan HMAC, berlaku 12 jam.
 * - Token dipakai untuk fitur khusus admin (diagnostik, simulasi pembayaran).
 */
export const MIN_PASSWORD = 8;
const TOKEN_TTL_MS = 12 * 60 * 60 * 1000;

const password = () => process.env.ADMIN_PASSWORD || '';
export const adminEnabled = () => password().length >= MIN_PASSWORD;

const hmac = (data) => crypto.createHmac('sha256', password()).update(data).digest('hex');
const sha = (s) => crypto.createHash('sha256').update(String(s)).digest();

function safeEqual(a, b) {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

export function checkPassword(input) {
  if (!adminEnabled()) return false;
  return crypto.timingSafeEqual(sha(input ?? ''), sha(password()));
}

export function issueToken() {
  const exp = Date.now() + TOKEN_TTL_MS;
  return `${exp}.${hmac('admin:' + exp)}`;
}

export function verifyToken(token) {
  if (!adminEnabled() || typeof token !== 'string') return false;
  const [exp, sig] = token.split('.');
  if (!/^\d{10,16}$/.test(exp || '') || !sig) return false;
  if (Number(exp) < Date.now()) return false;
  return safeEqual(sig, hmac('admin:' + exp));
}

export function tokenFromReq(req) {
  const h = String(req.headers?.authorization || '');
  if (h.startsWith('Bearer ')) return h.slice(7).trim();
  return String(req.headers?.['x-admin-token'] || '');
}

export const isAdminReq = (req) => verifyToken(tokenFromReq(req));

/* ---------- Order ID simulasi (bertanda tangan, tidak butuh database) ---------- */
const CODE = { success: 's', pending: 'p', failed: 'f' };
const OUTCOME = { s: 'success', p: 'pending', f: 'failed' };

export function makeSimOrderId(outcome) {
  const code = CODE[outcome] || 's';
  const base = `TEST-${code}-${Date.now().toString(36).toUpperCase()}${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
  return `${base}-${hmac('sim:' + base).slice(0, 10)}`;
}

/** Mengembalikan { outcome } bila order id simulasi valid, selain itu null. */
export function parseSimOrderId(id) {
  const m = /^(TEST-([spf])-[A-Z0-9]{6,20})-([a-f0-9]{10})$/.exec(String(id));
  if (!m || !adminEnabled()) return null;
  if (!safeEqual(m[3], hmac('sim:' + m[1]).slice(0, 10))) return null;
  return { outcome: OUTCOME[m[2]] };
}
