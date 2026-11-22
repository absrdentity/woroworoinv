import { adminEnabled, checkPassword, isAdminReq, issueToken, MIN_PASSWORD } from './_lib/admin.js';
import {
  authHeader,
  getAdminWhatsapp,
  getClientKey,
  getMode,
  getServerKey,
  keyKind,
  maskKey,
  snapUrl,
} from './_lib/midtrans.js';

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

function originOf(req) {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, '');
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host || '';
  return `${proto}://${host}`;
}

function buildDiagnostics(req) {
  const serverKey = getServerKey();
  const clientKey = getClientKey();
  const mode = getMode();
  const checks = [];
  const add = (id, label, status, detail, hint = '') => checks.push({ id, label, status, detail, hint });

  // Server Key
  if (!serverKey) {
    add('server_key', 'Server Key', 'error', 'MIDTRANS_SERVER_KEY belum diatur.', 'Midtrans Dashboard > Settings > Access Keys > Server Key.');
  } else if (!/-server-/.test(serverKey)) {
    add('server_key', 'Server Key', 'error', 'Nilai ini tidak terlihat seperti Server Key.', 'Pastikan yang ditempel adalah Server Key, bukan Client Key.');
  } else {
    add('server_key', 'Server Key', 'ok', `Terbaca (${maskKey(serverKey)}).`);
  }

  // Client Key
  if (!clientKey) {
    add('client_key', 'Client Key', 'error', 'MIDTRANS_CLIENT_KEY belum diatur.', 'Midtrans Dashboard > Settings > Access Keys > Client Key.');
  } else if (!/-client-/.test(clientKey)) {
    add('client_key', 'Client Key', 'error', 'Nilai ini tidak terlihat seperti Client Key.', 'Pastikan yang ditempel adalah Client Key, bukan Server Key.');
  } else {
    add('client_key', 'Client Key', 'ok', `Terbaca (${maskKey(clientKey)}).`);
  }

  // Kecocokan environment
  const sk = keyKind(serverKey);
  const ck = keyKind(clientKey);
  if (sk && ck && sk !== ck) {
    add('env_match', 'Kecocokan environment', 'error', `Server Key berjenis ${sk}, sedangkan Client Key berjenis ${ck}.`, 'Gunakan pasangan key dari environment yang sama (keduanya Sandbox atau keduanya Production).');
  } else if (sk && ck) {
    add('env_match', 'Kecocokan environment', 'ok', 'Server Key dan Client Key berasal dari environment yang sama.');
  }

  // Mode
  if (mode === 'production') {
    add('mode', 'Mode pembayaran', 'warn', 'PRODUCTION: transaksi memakai uang sungguhan.', 'Gunakan Simulasi Pembayaran untuk menguji tanpa biaya.');
  } else {
    add('mode', 'Mode pembayaran', 'ok', 'SANDBOX: aman untuk uji coba, tidak ada uang sungguhan.');
  }

  // WhatsApp admin
  if (!getAdminWhatsapp()) {
    add('whatsapp', 'WhatsApp admin', 'warn', 'ADMIN_WHATSAPP belum diatur.', 'Format 628xxxxxxxxxx. Dipakai tombol "Kirim detail ke admin".');
  } else {
    add('whatsapp', 'WhatsApp admin', 'ok', `Nomor ${getAdminWhatsapp()}.`);
  }

  const origin = originOf(req);
  return {
    mode,
    ready: !checks.some((c) => c.status === 'error'),
    checks,
    values: { serverKey: maskKey(serverKey), clientKey: maskKey(clientKey) },
    origin,
    notificationUrl: `${origin}/api/notification`,
    finishUrl: `${origin}/sukses`,
  };
}

/**
 * /api/admin?action=login|verify|diagnostics|ping
 * login adalah satu-satunya aksi publik; sisanya butuh token admin.
 */
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const action = String((req.query && req.query.action) || '');

  try {
    if (action === 'login') {
      if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ error: 'Method not allowed' });
      }
      if (!adminEnabled()) {
        return res.status(503).json({ error: `ADMIN_PASSWORD belum diatur (minimal ${MIN_PASSWORD} karakter).` });
      }
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
      await wait(400); // memperlambat tebak-tebakan password
      if (!checkPassword(body.password)) return res.status(401).json({ error: 'Password salah.' });
      return res.status(200).json({ token: issueToken(), expiresInHours: 12 });
    }

    if (!isAdminReq(req)) return res.status(401).json({ error: 'Tidak diizinkan. Silakan login sebagai admin.' });

    if (action === 'verify') return res.status(200).json({ ok: true });

    if (action === 'diagnostics') return res.status(200).json(buildDiagnostics(req));

    if (action === 'ping') {
      if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ error: 'Method not allowed' });
      }
      const mode = getMode();
      if (!getServerKey()) {
        return res.status(200).json({ ok: false, mode, message: 'MIDTRANS_SERVER_KEY belum diatur.' });
      }
      // Membuat token Snap senilai Rp1.000 TANPA membayar. Tidak ada tagihan
      // sebelum seseorang memilih metode pembayaran dan menyelesaikannya.
      const response = await fetch(snapUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: authHeader() },
        body: JSON.stringify({
          transaction_details: { order_id: `PING-${Date.now()}`, gross_amount: 1000 },
          item_details: [{ id: 'ping', price: 1000, quantity: 1, name: 'Uji koneksi WoroWoroInv' }],
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok && data.token) {
        return res.status(200).json({ ok: true, mode, message: `Koneksi berhasil. Midtrans (${mode}) menerima Server Key Anda.` });
      }
      const reason = (data.error_messages && data.error_messages.join(', ')) || `HTTP ${response.status}`;
      const hint = response.status === 401 ? ' Server Key ditolak: periksa key dan environment-nya (Sandbox/Production).' : '';
      return res.status(200).json({ ok: false, mode, message: `Midtrans menolak: ${reason}.${hint}` });
    }

    return res.status(400).json({ error: 'Aksi tidak dikenal.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || 'Terjadi kesalahan server.' });
  }
}
