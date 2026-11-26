import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { EVENT_TYPES, THEMES, formatIDR, getFeature, getPackage } from '../../shared/catalog.js';
import Icon from '../components/Icon.jsx';
import { useConfig } from '../lib/config.jsx';

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
  const { adminWhatsapp } = useConfig();
  const saved = readSaved();
  const orderId = params.get('order_id') || saved?.orderId || '';
  const savedOrder = saved && saved.orderId === orderId ? saved : null;

  const [state, setState] = useState({ loading: true, error: '', data: null });
  const [copied, setCopied] = useState(false);
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
      if (pending && !data?.simulated && tries.current < 12) timer = setTimeout(loop, 5000);
    };
    loop();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [check]);

  const data = state.data;
  const status = data?.transaction_status;
  const paid = data?.paid;
  const failed = FAILED.includes(status);
  const simulated = !!data?.simulated;

  const pkg = savedOrder && getPackage(savedOrder.packageId);
  const amount = data?.gross_amount ? Math.round(Number(data.gross_amount)) : pkg?.price;

  const summaryText = savedOrder
    ? [
        'Halo WoroWoroInv, saya sudah memesan undangan digital.',
        '',
        `Order ID: ${orderId}`,
        `Paket: ${pkg?.name || '-'}`,
        `Jenis acara: ${EVENT_TYPES.find((e) => e.id === savedOrder.eventTypeId)?.name || '-'}`,
        `Tema: ${THEMES.find((t) => t.id === savedOrder.themeId)?.name || '-'}`,
        `Nama: ${[savedOrder.event?.name1, savedOrder.event?.name2].filter(Boolean).join(' & ')}`,
        `Tanggal: ${savedOrder.event?.date || '-'} ${savedOrder.event?.time || ''}`,
        `Tempat: ${savedOrder.event?.venue || '-'}, ${savedOrder.event?.address || '-'}`,
        ...(data?.invitation ? [`Link undangan: ${data.invitation.url}`, `Link kelola (rahasia): ${data.invitation.manageUrl}`] : []),
        `Musik latar: ${savedOrder.music?.url ? `${savedOrder.music.title ? savedOrder.music.title + ' - ' : ''}${savedOrder.music.url}` : '-'}`,
        `Fitur: ${(savedOrder.features || []).map((id) => getFeature(id)?.name).filter(Boolean).join(', ') || '-'}`,
        '',
        'Mohon diproses ya. Terima kasih!',
      ].join('\n')
    : `Halo WoroWoroInv, saya sudah memesan undangan digital. Order ID: ${orderId}`;

  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard bisa saja diblokir */
    }
  };

  let tone = 'wait';
  let icon = 'clock';
  let title = 'Mengecek status pembayaran…';
  let desc = 'Mohon tunggu sebentar.';
  if (!state.loading) {
    if (paid) {
      tone = 'ok';
      icon = 'check-circle';
      title = 'Pembayaran berhasil';
      desc = data?.invitation
        ? 'Terima kasih! Undangan Anda sudah dibuat otomatis. Kirim detail ke admin bila ingin penyesuaian (foto, musik, rekening).'
        : 'Terima kasih! Kirim detail pesanan Anda ke admin agar undangan segera kami proses.';
    } else if (failed) {
      tone = 'bad';
      icon = 'x-circle';
      title = status === 'expire' ? 'Pembayaran kedaluwarsa' : 'Pembayaran tidak berhasil';
      desc = 'Silakan lakukan pemesanan ulang atau hubungi admin bila butuh bantuan.';
    } else if (state.error) {
      tone = 'bad';
      icon = 'alert';
      title = 'Status belum dapat dicek';
      desc = state.error;
    } else {
      title = 'Menunggu pembayaran';
      desc = 'Selesaikan pembayaran sesuai instruksi. Halaman ini memperbarui status secara otomatis.';
    }
  }

  return (
    <div className="container container--narrow">
      <div className={`status status--${tone}`}>
        <div className="status__head">
          <span className="status__icon">
            <Icon name={icon} size={28} />
          </span>
          <div>
            {simulated && (
              <span className="badge badge--test">
                <Icon name="flask" size={13} /> Simulasi uji coba
              </span>
            )}
            <h1>{title}</h1>
          </div>
        </div>
        <p>{desc}</p>
        {simulated && (
          <p className="alert alert--info">
            <Icon name="info" size={16} />
            <span>Ini hasil simulasi admin. Tidak ada transaksi di Midtrans dan tidak ada tagihan.</span>
          </p>
        )}

        {orderId && (
          <dl className="status__meta">
            <div>
              <dt>Order ID</dt>
              <dd>{orderId}</dd>
            </div>
            {amount ? (
              <div>
                <dt>Total</dt>
                <dd>{formatIDR(amount)}</dd>
              </div>
            ) : null}
            {data?.payment_type && (
              <div>
                <dt>Metode</dt>
                <dd>{data.payment_type.replace(/_/g, ' ')}</dd>
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

        {paid && data?.invitation && (
          <div className="invite-ready" data-testid="invite-ready">
            <strong>
              <Icon name="check-circle" size={16} /> Link undangan Anda sudah aktif
            </strong>
            <code className="codeline">{data.invitation.url}</code>
            <p className="small muted">
              Aktif sampai {new Date(data.invitation.expiresAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}.
              Tambahkan <code>?to=Nama Tamu</code> di akhir link untuk menyapa tamu dengan nama mereka.
            </p>
            <div className="manage-box" data-testid="manage-box">
              <strong>
                <Icon name="edit" size={15} /> Lengkapi isi undangan
              </strong>
              <p className="small muted">
                Isi teks, unggah foto, atur musik, video, rekening, dan kelola tamu lewat halaman kelola. Simpan link ini, bersifat rahasia.
              </p>
              <div className="status__actions">
                <a className="btn" href={data.invitation.manageUrl}>
                  <Icon name="edit" size={16} /> Buka halaman kelola
                </a>
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={() => navigator.clipboard?.writeText(data.invitation.manageUrl).catch(() => {})}
                >
                  <Icon name="copy" size={16} /> Salin link kelola
                </button>
              </div>
            </div>
            <div className="status__actions">
              <a className="btn" href={data.invitation.url} target="_blank" rel="noreferrer">
                <Icon name="external" size={16} /> Buka undangan
              </a>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => navigator.clipboard?.writeText(data.invitation.url).catch(() => {})}
              >
                <Icon name="copy" size={16} /> Salin link
              </button>
            </div>
          </div>
        )}
        {paid && data?.storage && !data?.invitation && (
          <p className="alert alert--info">
            <Icon name="info" size={16} /> <span>Link undangan sedang disiapkan. Klik “Cek status lagi” beberapa detik lagi.</span>
          </p>
        )}

        <div className="status__actions">
          {(paid || tone === 'wait') && adminWhatsapp && (
            <a
              className="btn"
              href={`https://wa.me/${adminWhatsapp}?text=${encodeURIComponent(summaryText)}`}
              target="_blank"
              rel="noreferrer"
            >
              <Icon name="whatsapp" size={18} /> Kirim detail ke admin
            </a>
          )}
          {(paid || tone === 'wait') && (
            <button type="button" className="btn btn--ghost" onClick={copySummary}>
              <Icon name={copied ? 'check' : 'copy'} size={16} /> {copied ? 'Tersalin' : 'Salin ringkasan'}
            </button>
          )}
          {tone !== 'ok' && (
            <button type="button" className="btn btn--ghost" onClick={check}>
              <Icon name="refresh" size={16} /> Cek status lagi
            </button>
          )}
          <Link className="btn btn--ghost" to="/">
            Kembali ke beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
