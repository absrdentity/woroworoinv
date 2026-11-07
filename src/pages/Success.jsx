import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { EVENT_TYPES, THEMES, formatIDR, getFeature, getPackage } from '../../shared/catalog.js';
import { ADMIN_WA } from '../lib/config.js';

const FAILED = ['deny', 'cancel', 'expire', 'failure'];

function readSaved() {
  try {
    return JSON.parse(localStorage.getItem('woro_last_order') || 'null');
  } catch {
    return null;
  }
}

export default function Success() {
  const [params] = useSearchParams();
  const saved = readSaved();
  const orderId = params.get('order_id') || saved?.orderId || '';

  const [state, setState] = useState({ loading: true, error: '', data: null });
  const tries = useRef(0);

  const check = useCallback(async () => {
    if (!orderId) {
      setState({ loading: false, error: 'Order ID tidak ditemukan.', data: null });
      return null;
    }
    try {
      const res = await fetch(`/api/status?order_id=${encodeURIComponent(orderId)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mengecek status.');
      setState({ loading: false, error: '', data });
      return data;
    } catch (err) {
      setState((s) => ({ ...s, loading: false, error: err.message }));
      return null;
    }
  }, [orderId]);

  // Cek status, ulangi tiap 5 detik (maks 12x) selama masih pending
  useEffect(() => {
    let timer;
    let cancelled = false;
    const loop = async () => {
      const data = await check();
      tries.current += 1;
      if (cancelled) return;
      const pending = !data || data.transaction_status === 'pending' || data.transaction_status === 'unknown';
      if (pending && tries.current < 12) timer = setTimeout(loop, 5000);
    };
    loop();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [check]);

  const status = state.data?.transaction_status;
  const paid = state.data?.paid;
  const failed = FAILED.includes(status);

  const pkg = saved && getPackage(saved.packageId);
  const waText = saved
    ? [
        'Halo WoroWoroInv, saya sudah memesan undangan digital.',
        '',
        `Order ID: ${orderId}`,
        `Paket: ${pkg?.name || '-'}`,
        `Jenis acara: ${EVENT_TYPES.find((e) => e.id === saved.eventTypeId)?.name || '-'}`,
        `Tema: ${THEMES.find((t) => t.id === saved.themeId)?.name || '-'}`,
        `Nama: ${[saved.event?.name1, saved.event?.name2].filter(Boolean).join(' & ')}`,
        `Tanggal: ${saved.event?.date || '-'} ${saved.event?.time || ''}`,
        `Tempat: ${saved.event?.venue || '-'}, ${saved.event?.address || '-'}`,
        `Fitur: ${(saved.features || []).map((id) => getFeature(id)?.name).filter(Boolean).join(', ') || '-'}`,
        '',
        'Mohon diproses ya. Terima kasih!',
      ].join('\n')
    : `Halo WoroWoroInv, saya sudah memesan undangan digital. Order ID: ${orderId}`;
  const waUrl = `https://wa.me/${ADMIN_WA}?text=${encodeURIComponent(waText)}`;

  let tone = 'wait';
  let title = 'Mengecek status pembayaran…';
  let desc = 'Mohon tunggu sebentar.';
  if (!state.loading) {
    if (paid) {
      tone = 'ok';
      title = 'Pembayaran berhasil 🎉';
      desc = 'Terima kasih! Kirim detail pesanan Anda ke admin agar undangan segera kami proses.';
    } else if (failed) {
      tone = 'bad';
      title = status === 'expire' ? 'Pembayaran kedaluwarsa' : 'Pembayaran tidak berhasil';
      desc = 'Silakan lakukan pemesanan ulang atau hubungi admin bila butuh bantuan.';
    } else if (state.error) {
      tone = 'bad';
      title = 'Status belum dapat dicek';
      desc = state.error;
    } else {
      tone = 'wait';
      title = 'Menunggu pembayaran';
      desc = 'Selesaikan pembayaran sesuai instruksi. Halaman ini akan memperbarui status otomatis.';
    }
  }

  return (
    <div className="container container--narrow">
      <div className={`status status--${tone}`}>
        <h1>{title}</h1>
        <p>{desc}</p>

        {orderId && (
          <dl className="status__meta">
            <div>
              <dt>Order ID</dt>
              <dd>{orderId}</dd>
            </div>
            {state.data?.gross_amount && (
              <div>
                <dt>Total</dt>
                <dd>{formatIDR(Math.round(Number(state.data.gross_amount)))}</dd>
              </div>
            )}
            {state.data?.payment_type && (
              <div>
                <dt>Metode</dt>
                <dd>{state.data.payment_type.replace(/_/g, ' ')}</dd>
              </div>
            )}
            {status && (
              <div>
                <dt>Status</dt>
                <dd>{status}</dd>
              </div>
            )}
          </dl>
        )}

        <div className="status__actions">
          {(paid || tone === 'wait') && (
            <a className="btn" href={waUrl} target="_blank" rel="noreferrer">
              Kirim Detail ke Admin via WhatsApp
            </a>
          )}
          {tone !== 'ok' && (
            <button type="button" className="btn btn--ghost" onClick={check}>
              Cek Status Lagi
            </button>
          )}
          <Link className="btn btn--ghost" to="/">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
