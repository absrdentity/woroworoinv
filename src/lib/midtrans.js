const loaders = new Map();

/** Memuat Snap.js Midtrans (sekali per kombinasi key + mode). */
export function loadSnap({ clientKey, isProduction }) {
  if (!clientKey) {
    return Promise.reject(
      new Error('Pembayaran belum dikonfigurasi (MIDTRANS_CLIENT_KEY belum diatur di server).')
    );
  }
  const id = `${isProduction ? 'p' : 's'}:${clientKey}`;
  if (loaders.has(id)) return loaders.get(id);

  const src = isProduction ? 'https://app.midtrans.com/snap/snap.js' : 'https://app.sandbox.midtrans.com/snap/snap.js';
  const p = new Promise((resolve, reject) => {
    if (window.snap) return resolve(window.snap);
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.setAttribute('data-client-key', clientKey);
    script.onload = () => resolve(window.snap);
    script.onerror = () => {
      loaders.delete(id);
      reject(new Error('Gagal memuat Midtrans Snap. Periksa koneksi internet Anda.'));
    };
    document.head.appendChild(script);
  });
  loaders.set(id, p);
  return p;
}

/**
 * Minta server membuat transaksi (harga dihitung di server).
 * Dengan `simulate` + token admin, server hanya membuat order simulasi
 * tanpa menghubungi Midtrans.
 */
export async function createTransaction(payload, { simulate, adminToken } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (simulate && adminToken) headers.Authorization = `Bearer ${adminToken}`;
  const res = await fetch('/api/create-transaction', {
    method: 'POST',
    headers,
    body: JSON.stringify(simulate ? { ...payload, simulate } : payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Gagal membuat transaksi.');
  return data; // { token, redirect_url, order_id }  |  { simulated, outcome, order_id }
}

/** Buka popup pembayaran Snap. handlers: onSuccess, onPending, onError, onClose */
export async function payWithSnap(token, cfg, handlers) {
  const snap = await loadSnap(cfg);
  snap.pay(token, handlers);
}
