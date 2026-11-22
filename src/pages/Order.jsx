import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatIDR } from '../../shared/catalog.js';
import InvitationPreview from '../components/InvitationPreview.jsx';
import Icon from '../components/Icon.jsx';
import {
  AdminTestPanel,
  CustomerForm,
  EventForm,
  EventTypeChips,
  FeaturePicker,
  PackagePicker,
  SummaryList,
  ThemeChips,
} from '../components/order/Pickers.jsx';
import { useOrder } from '../lib/useOrder.js';
import { useAdmin } from '../lib/config.jsx';

/** Pesan kesiapan pembayaran (mis. Client Key belum diatur). */
function PaymentNotice({ o, isAdmin }) {
  if (o.cfg.loading || o.cfg.clientKey) return null;
  return (
    <p className="alert alert--warn">
      <Icon name="alert" size={16} />
      <span>
        Pembayaran online belum diaktifkan.{' '}
        {isAdmin ? (
          <>
            Atur Midtrans di <Link to="/admin">halaman Admin</Link>, atau gunakan simulasi di bawah.
          </>
        ) : (
          'Silakan hubungi admin.'
        )}
      </span>
    </p>
  );
}

function ModeBadge({ o }) {
  if (o.cfg.loading || !o.cfg.clientKey) return null;
  return o.cfg.isProduction ? null : (
    <p className="alert alert--info">
      <Icon name="flask" size={16} />
      <span>Mode Sandbox: pembayaran hanya uji coba, tidak ada uang sungguhan.</span>
    </p>
  );
}

/* =========================== DESKTOP =========================== */
function Panel({ n, title, children }) {
  return (
    <section className="panel">
      <h2 className="panel__title">
        <span className="num">{n}</span> {title}
      </h2>
      {children}
    </section>
  );
}

function OrderDesktop() {
  const o = useOrder();
  const { isAdmin } = useAdmin();
  const canPay = !!o.cfg.clientKey;

  return (
    <div className="container order">
      <div className="page-head">
        <span className="eyebrow">Pesan undangan</span>
        <h1>Racik undangan Anda</h1>
        <p className="muted">Pilih paket, centang fitur, isi data acara, lalu bayar. Pratinjau di kanan ikut berubah.</p>
      </div>

      <div className="order__grid">
        <div className="order__main">
          <Panel n="1" title="Pilih paket">
            <PackagePicker value={o.packageId} onChange={o.changePackage} />
          </Panel>

          <Panel n="2" title="Pilih fitur">
            <FeaturePicker
              pkg={o.pkg}
              features={o.features}
              onToggle={o.toggleFeature}
              quotaLabel={o.quotaLabel}
              quotaFull={o.quotaFull}
              notice={o.notice}
            />
          </Panel>

          <Panel n="3" title="Tema dan data acara">
            <EventTypeChips value={o.eventTypeId} onChange={o.setEventTypeId} />
            <ThemeChips value={o.themeId} onChange={o.setThemeId} />
            <EventForm ev={o.ev} event={o.event} setEv={o.setEv} />
          </Panel>

          <Panel n="4" title="Data pemesan">
            <CustomerForm customer={o.customer} setCus={o.setCus} />
          </Panel>
        </div>

        <aside className="order__side">
          <div className="sticky">
            <div className="summary">
              <h2 className="panel__title">Ringkasan</h2>
              <div className="summary__row">
                <span>Paket {o.pkg.name}</span>
                <strong>{formatIDR(o.pkg.price)}</strong>
              </div>
              <SummaryList features={o.features} />
              <div className="summary__total">
                <span>Total</span>
                <strong>{formatIDR(o.pkg.price)}</strong>
              </div>
              <PaymentNotice o={o} isAdmin={isAdmin} />
              <ModeBadge o={o} />
              {o.error && (
                <p className="alert alert--error" role="alert">
                  <Icon name="x-circle" size={16} /> <span>{o.error}</span>
                </p>
              )}
              <button type="button" className="btn btn--block btn--lg" onClick={o.pay} disabled={o.busy || !canPay}>
                {o.busy ? 'Memproses…' : 'Bayar Sekarang'}
              </button>
              <p className="small muted center summary__foot">
                <Icon name="shield" size={14} /> Pembayaran aman via Midtrans · QRIS, VA, e-wallet, kartu
              </p>
              {isAdmin && <AdminTestPanel onSimulate={o.simulate} busy={o.busy} />}
            </div>

            <InvitationPreview
              features={o.features}
              themeId={o.themeId}
              eventTypeId={o.eventTypeId}
              data={o.event}
              guest="Nama Tamu"
              height={540}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}

/* =========================== MOBILE (wizard) =========================== */
const STEPS = [
  { id: 'paket', label: 'Paket' },
  { id: 'fitur', label: 'Fitur' },
  { id: 'acara', label: 'Acara' },
  { id: 'bayar', label: 'Bayar' },
];

function PreviewSheet({ o, onClose }) {
  const [h] = useState(() => Math.max(380, Math.min(window.innerHeight - 150, 680)));
  useEffect(() => {
    document.body.classList.add('no-scroll');
    return () => document.body.classList.remove('no-scroll');
  }, []);
  return (
    <div className="sheet" role="dialog" aria-modal="true" aria-label="Pratinjau undangan">
      <button type="button" className="sheet__backdrop" onClick={onClose} aria-label="Tutup pratinjau" />
      <div className="sheet__panel">
        <div className="sheet__head">
          <strong>Pratinjau undangan</strong>
          <button type="button" className="iconbtn" onClick={onClose} aria-label="Tutup">
            <Icon name="x" size={20} />
          </button>
        </div>
        <div className="sheet__body">
          <InvitationPreview
            features={o.features}
            themeId={o.themeId}
            eventTypeId={o.eventTypeId}
            data={o.event}
            guest="Nama Tamu"
            height={h}
          />
        </div>
      </div>
    </div>
  );
}

function OrderMobile() {
  const o = useOrder();
  const { isAdmin } = useAdmin();
  const [step, setStep] = useState(0);
  const [sheet, setSheet] = useState(false);
  const last = step === STEPS.length - 1;
  const canPay = !!o.cfg.clientKey;

  // pesan error tampil di bagian atas: pastikan terlihat
  useEffect(() => {
    if (o.error) window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [o.error]);

  const go = (n) => {
    setStep(n);
    window.scrollTo({ top: 0 });
  };

  const next = () => {
    o.setError('');
    if (step === 1) {
      const e = o.selectionError();
      if (e) return o.setError(e);
    }
    if (step === 2) {
      const e = o.eventError();
      if (e) return o.setError(e);
    }
    go(step + 1);
  };

  const back = () => {
    o.setError('');
    go(step - 1);
  };

  return (
    <div className="wiz">
      <div className="container">
        <div className="wiz__top">
          {step > 0 ? (
            <button type="button" className="wiz__back" onClick={back}>
              <Icon name="arrow-left" size={16} /> Kembali
            </button>
          ) : (
            <span className="eyebrow">Pesan undangan</span>
          )}
          <span className="wiz__count">
            Langkah {step + 1} dari {STEPS.length}
          </span>
        </div>

        <ol className="wiz__progress" aria-label="Progres pemesanan">
          {STEPS.map((s, i) => (
            <li key={s.id} className={i < step ? 'is-done' : i === step ? 'is-now' : ''}>
              <span className="wiz__bar-seg" />
              <span className="wiz__label">{s.label}</span>
            </li>
          ))}
        </ol>

        {o.error && (
          <p className="alert alert--error" role="alert">
            <Icon name="x-circle" size={16} /> <span>{o.error}</span>
          </p>
        )}

        {step === 0 && (
          <section className="panel">
            <h1 className="panel__title">Pilih paket</h1>
            <PackagePicker value={o.packageId} onChange={o.changePackage} />
            <ul className="pkg__list pkg__list--tight">
              {o.pkg.includes.map((i) => (
                <li key={i}>
                  <Icon name="check" size={16} strokeWidth={2.4} />
                  <span>{i}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {step === 1 && (
          <section className="panel">
            <h1 className="panel__title">Pilih fitur</h1>
            <FeaturePicker
              pkg={o.pkg}
              features={o.features}
              onToggle={o.toggleFeature}
              quotaLabel={o.quotaLabel}
              quotaFull={o.quotaFull}
              notice={o.notice}
            />
          </section>
        )}

        {step === 2 && (
          <section className="panel">
            <h1 className="panel__title">Tema dan data acara</h1>
            <EventTypeChips value={o.eventTypeId} onChange={o.setEventTypeId} />
            <ThemeChips value={o.themeId} onChange={o.setThemeId} />
            <EventForm ev={o.ev} event={o.event} setEv={o.setEv} />
          </section>
        )}

        {step === 3 && (
          <>
            <section className="panel">
              <h1 className="panel__title">Data pemesan</h1>
              <CustomerForm customer={o.customer} setCus={o.setCus} />
            </section>
            <section className="panel">
              <h2 className="panel__title">Ringkasan</h2>
              <div className="summary__row">
                <span>Paket {o.pkg.name}</span>
                <strong>{formatIDR(o.pkg.price)}</strong>
              </div>
              <SummaryList features={o.features} />
              <PaymentNotice o={o} isAdmin={isAdmin} />
              <ModeBadge o={o} />
              <p className="small muted summary__foot">
                <Icon name="shield" size={14} /> Pembayaran aman via Midtrans · QRIS, VA, e-wallet, kartu
              </p>
            </section>
            {isAdmin && <AdminTestPanel onSimulate={o.simulate} busy={o.busy} />}
          </>
        )}
      </div>

      <div className="wiz__bar">
        <div className="wiz__total">
          <small>Total · {o.pkg.name}</small>
          <strong>{formatIDR(o.pkg.price)}</strong>
        </div>
        <button type="button" className="iconbtn iconbtn--outline" onClick={() => setSheet(true)} aria-label="Lihat pratinjau">
          <Icon name="eye" size={20} />
        </button>
        {last ? (
          <button type="button" className="btn" onClick={o.pay} disabled={o.busy || !canPay}>
            {o.busy ? 'Memproses…' : 'Bayar'}
          </button>
        ) : (
          <button type="button" className="btn" onClick={next}>
            Lanjut <Icon name="arrow-right" size={16} />
          </button>
        )}
      </div>

      {sheet && <PreviewSheet o={o} onClose={() => setSheet(false)} />}
    </div>
  );
}

export default function Order({ isMobile }) {
  return isMobile ? <OrderMobile /> : <OrderDesktop />;
}
