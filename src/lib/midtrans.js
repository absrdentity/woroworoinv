const CLIENT_KEY = import.meta.env.VITE_MIDTRANS_CLIENT_KEY;
const IS_PROD = import.meta.env.VITE_MIDTRANS_IS_PRODUCTION === 'true';
const SNAP_SRC = IS_PROD
  ? 'https://app.midtrans.com/snap/snap.js'
  : 'https://app.sandbox.midtrans.com/snap/snap.js';

let snapPromise = null;

/** Memuat Snap.js Midtrans sekali saja. */
export function loadSnap() {
  if (typeof window !== 'undefined' && window.snap) return Promise.resolve(window.snap);
  if (snapPromise) return snapPromise;
  if (!CLIENT_KEY) {
    return Promise.reject(new Error('VITE_MIDTRANS_CLIENT_KEY belum diatur.'));
  }

  snapPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SNAP_SRC;
    script.async = true;
    script.setAttribute('data-client-key', CLIENT_KEY);
    script.onload = () => resolve(window.snap);
    script.onerror = () => {
      snapPromise = null;
      reject(new Error('Gagal memuat Midtrans Snap. Periksa koneksi internet Anda.'));
    };
    document.head.appendChild(script);
  });
  return snapPromise;
}

/** Minta server membuat transaksi (harga dihitung di server). */
export async function createTransaction(payload) {
  const res = await fetch('/api/create-transaction', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Gagal membuat transaksi.');
  return data; // { token, redirect_url, order_id }
}

/** Buka popup pembayaran Snap. handlers: onSuccess, onPending, onError, onClose */
export async function payWithSnap(token, handlers) {
  const snap = await loadSnap();
  snap.pay(token, handlers);
}
