import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  PACKAGES,
  FEATURES,
  THEMES,
  EVENT_TYPES,
  formatIDR,
  getPackage,
  getFeature,
  tierName,
  validateSelection,
  validateCustomer,
} from '../../shared/catalog.js';
import InvitationPreview from '../components/InvitationPreview.jsx';
import { createTransaction, payWithSnap } from '../lib/midtrans.js';

const DEFAULT_PICK = ['countdown', 'maps', 'whatsapp_share'];

export default function Order() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const initialPkg = getPackage(params.get('paket')) || getPackage('standard');

  const [packageId, setPackageId] = useState(initialPkg.id);
  const [features, setFeatures] = useState(() => {
    const wanted = (params.get('fitur') || '').split(',').filter(Boolean);
    const source = wanted.length ? wanted : DEFAULT_PICK;
    return source
      .filter((id) => {
        const f = getFeature(id);
        return f && f.tier <= initialPkg.tier;
      })
      .slice(0, initialPkg.quota);
  });
  const [themeId, setThemeId] = useState(THEMES.some((t) => t.id === params.get('tema')) ? params.get('tema') : 'sakura');
  const [eventTypeId, setEventTypeId] = useState(
    EVENT_TYPES.some((e) => e.id === params.get('acara')) ? params.get('acara') : 'pernikahan'
  );
  const [event, setEvent] = useState({ name1: '', name2: '', date: '', time: '10:00', venue: '', address: '' });
  const [customer, setCustomer] = useState({ name: '', email: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const pkg = getPackage(packageId);
  const ev = EVENT_TYPES.find((e) => e.id === eventTypeId);
  const quotaFull = features.length >= pkg.quota;
  const quotaLabel = pkg.quota >= FEATURES.length ? 'tanpa batas' : `${features.length}/${pkg.quota}`;

  const changePackage = (id) => {
    const next = getPackage(id);
    const trimmed = features.filter((fid) => getFeature(fid).tier <= next.tier).slice(0, next.quota);
    setPackageId(id);
    setFeatures(trimmed);
    setNotice(
      trimmed.length < features.length
        ? `Beberapa fitur dilepas karena tidak tersedia / melebihi kuota paket ${next.name}.`
        : ''
    );
  };

  const toggleFeature = (f) => {
    setNotice('');
    if (features.includes(f.id)) {
      setFeatures(features.filter((x) => x !== f.id));
      return;
    }
    if (f.tier > pkg.tier) return;
    if (quotaFull) {
      setNotice(`Kuota paket ${pkg.name} sudah penuh. Lepas satu fitur atau naikkan paket.`);
      return;
    }
    setFeatures([...features, f.id]);
  };

  const setEv = (key) => (e) => setEvent({ ...event, [key]: e.target.value });
  const setCus = (key) => (e) => setCustomer({ ...customer, [key]: e.target.value });

  const handlePay = async () => {
    setError('');
    const sel = validateSelection({ packageId, features, theme: themeId, eventType: eventTypeId });
    if (!sel.ok) return setError(sel.error);
    if (!event.name1.trim()) return setError(ev.double ? 'Isi nama mempelai pria.' : 'Isi nama pada undangan.');
    if (ev.double && !event.name2.trim()) return setError('Isi nama mempelai wanita.');
    if (!event.date) return setError('Pilih tanggal acara.');
    const cErr = validateCustomer(customer);
    if (cErr) return setError(cErr);

    setLoading(true);
    try {
      const body = { packageId, features, theme: themeId, eventType: eventTypeId, customer, event };
      const { token, order_id: orderId } = await createTransaction(body);

      // Simpan ringkasan pesanan di browser untuk halaman sukses (kirim detail ke admin)
      try {
        localStorage.setItem(
          'woro_last_order',
          JSON.stringify({ orderId, packageId, features, themeId, eventTypeId, event, customer: { name: customer.name } })
        );
      } catch {
        /* abaikan jika storage tidak tersedia */
      }

      await payWithSnap(token, {
        onSuccess: () => navigate(`/sukses?order_id=${orderId}`),
        onPending: () => navigate(`/sukses?order_id=${orderId}`),
        onError: () => {
          setLoading(false);
          setError('Pembayaran gagal. Silakan coba lagi.');
        },
        onClose: () => {
          setLoading(false);
          setNotice('Popup pembayaran ditutup. Anda dapat menekan tombol bayar lagi kapan saja.');
        },
      });
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Terjadi kesalahan. Silakan coba lagi.');
    }
  };

  return (
    <div className="container order">
      <div className="page-head">
        <span className="eyebrow">Pesan Undangan</span>
        <h1>Racik undangan Anda</h1>
        <p className="muted">Pilih paket, centang fitur, isi data acara, lalu bayar. Pratinjau di kanan ikut berubah.</p>
      </div>

      <div className="order__grid">
        <div className="order__main">
          {/* 1. Paket */}
          <section className="panel">
            <h2 className="panel__title">
              <span className="num">1</span> Pilih paket
            </h2>
            <div className="pick-grid">
              {PACKAGES.map((p) => (
                <label key={p.id} className={`pick ${packageId === p.id ? 'is-on' : ''}`}>
                  <input type="radio" name="paket" checked={packageId === p.id} onChange={() => changePackage(p.id)} />
                  <strong>{p.name}</strong>
                  <span className="pick__price">{formatIDR(p.price)}</span>
                  <small>{p.quota >= FEATURES.length ? 'Semua fitur' : `Pilih ${p.quota} fitur`}</small>
                </label>
              ))}
            </div>
          </section>

          {/* 2. Fitur */}
          <section className="panel">
            <div className="panel__row">
              <h2 className="panel__title">
                <span className="num">2</span> Pilih fitur
              </h2>
              <span className={`quota ${quotaFull ? 'is-full' : ''}`}>Terpilih: {quotaLabel}</span>
            </div>
            {notice && <p className="alert alert--info">{notice}</p>}
            <div className="toggle-list">
              {FEATURES.map((f) => {
                const locked = f.tier > pkg.tier;
                const on = features.includes(f.id);
                const blocked = !on && !locked && quotaFull;
                return (
                  <label
                    key={f.id}
                    className={`toggle ${on ? 'is-on' : ''} ${locked ? 'is-locked' : ''} ${blocked ? 'is-blocked' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={on}
                      disabled={locked}
                      onChange={() => toggleFeature(f)}
                    />
                    <span className="toggle__icon">{locked ? '🔒' : f.icon}</span>
                    <span className="toggle__text">
                      <strong>{f.name}</strong>
                      <small>{locked ? `Butuh paket ${tierName(f.tier)}` : f.desc}</small>
                    </span>
                    <span className="toggle__sw" aria-hidden="true" />
                  </label>
                );
              })}
            </div>
          </section>

          {/* 3. Tema & acara */}
          <section className="panel">
            <h2 className="panel__title">
              <span className="num">3</span> Tema & data acara
            </h2>
            <div className="field">
              <span>Jenis acara</span>
              <div className="chips">
                {EVENT_TYPES.map((e) => (
                  <button
                    type="button"
                    key={e.id}
                    className={`chip ${eventTypeId === e.id ? 'is-on' : ''}`}
                    onClick={() => setEventTypeId(e.id)}
                  >
                    {e.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="field">
              <span>Tema</span>
              <div className="chips">
                {THEMES.map((t) => (
                  <button
                    type="button"
                    key={t.id}
                    className={`chip chip--theme ${themeId === t.id ? 'is-on' : ''}`}
                    onClick={() => setThemeId(t.id)}
                  >
                    <i style={{ background: t.vars.accent }} />
                    {t.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="field-row">
              <label className="field">
                <span>{ev.double ? 'Nama mempelai pria' : 'Nama pada undangan'}</span>
                <input value={event.name1} maxLength={40} onChange={setEv('name1')} placeholder="Raka" />
              </label>
              {ev.double && (
                <label className="field">
                  <span>Nama mempelai wanita</span>
                  <input value={event.name2} maxLength={40} onChange={setEv('name2')} placeholder="Ayu" />
                </label>
              )}
            </div>
            <div className="field-row">
              <label className="field">
                <span>Tanggal acara</span>
                <input type="date" value={event.date} onChange={setEv('date')} />
              </label>
              <label className="field">
                <span>Jam</span>
                <input type="time" value={event.time} onChange={setEv('time')} />
              </label>
            </div>
            <label className="field">
              <span>Nama tempat</span>
              <input value={event.venue} maxLength={80} onChange={setEv('venue')} placeholder="Gedung Serbaguna Kenanga" />
            </label>
            <label className="field">
              <span>Alamat lengkap</span>
              <input value={event.address} maxLength={140} onChange={setEv('address')} placeholder="Jl. Melati No. 12, Kota Anda" />
            </label>
          </section>

          {/* 4. Pemesan */}
          <section className="panel">
            <h2 className="panel__title">
              <span className="num">4</span> Data pemesan
            </h2>
            <label className="field">
              <span>Nama lengkap</span>
              <input value={customer.name} maxLength={50} onChange={setCus('name')} autoComplete="name" />
            </label>
            <div className="field-row">
              <label className="field">
                <span>Email</span>
                <input type="email" value={customer.email} onChange={setCus('email')} autoComplete="email" />
              </label>
              <label className="field">
                <span>No. WhatsApp</span>
                <input
                  type="tel"
                  value={customer.phone}
                  onChange={setCus('phone')}
                  placeholder="08123456789"
                  autoComplete="tel"
                />
              </label>
            </div>
          </section>
        </div>

        {/* Ringkasan + pratinjau */}
        <aside className="order__side">
          <div className="sticky">
            <div className="summary">
              <h2 className="panel__title">Ringkasan</h2>
              <div className="summary__row">
                <span>Paket {pkg.name}</span>
                <strong>{formatIDR(pkg.price)}</strong>
              </div>
              <ul className="summary__list">
                {features.length === 0 && <li className="muted">Belum ada fitur dipilih</li>}
                {features.map((id) => (
                  <li key={id}>
                    {getFeature(id).icon} {getFeature(id).name}
                  </li>
                ))}
              </ul>
              <div className="summary__total">
                <span>Total</span>
                <strong>{formatIDR(pkg.price)}</strong>
              </div>
              {error && <p className="alert alert--error">{error}</p>}
              <button type="button" className="btn btn--block" onClick={handlePay} disabled={loading}>
                {loading ? 'Memproses…' : 'Bayar Sekarang'}
              </button>
              <p className="small muted center">Pembayaran aman via Midtrans · QRIS, VA, e-wallet, kartu</p>
            </div>

            <InvitationPreview
              features={features}
              themeId={themeId}
              eventTypeId={eventTypeId}
              data={event}
              guest="Nama Tamu"
              height={560}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
