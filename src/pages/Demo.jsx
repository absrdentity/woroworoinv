import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FEATURES, EVENT_TYPES, THEMES, formatIDR, recommendPackage, tierName } from '../../shared/catalog.js';
import InvitationPreview from '../components/InvitationPreview.jsx';
import Icon from '../components/Icon.jsx';
import { DeviceToggle, EventTypeChips, FeatureToggle, TemplatePicker } from '../components/order/Pickers.jsx';

function useDemoState() {
  const [features, setFeatures] = useState(['countdown', 'maps', 'gallery', 'rsvp']);
  const [params] = useSearchParams();
  const [themeId, setThemeId] = useState(THEMES.some((t) => t.id === params.get('tema')) ? params.get('tema') : 'sakura');
  const [device, setDevice] = useState(params.get('tampilan') === 'desktop' ? 'desktop' : 'phone');
  const [eventTypeId, setEventTypeId] = useState('pernikahan');
  const [guest, setGuest] = useState('Bapak Andi & Keluarga');
  const [name1, setName1] = useState('Raka');
  const [name2, setName2] = useState('Ayu');

  const toggle = (f) => setFeatures((cur) => (cur.includes(f.id) ? cur.filter((x) => x !== f.id) : [...cur, f.id]));
  const rec = recommendPackage(features);
  const ev = EVENT_TYPES.find((e) => e.id === eventTypeId);
  const orderUrl = `/pesan?paket=${rec.id}&fitur=${features.join(',')}&tema=${themeId}&acara=${eventTypeId}`;

  return {
    features, setFeatures, themeId, setThemeId, device, setDevice, eventTypeId, setEventTypeId,
    guest, setGuest, name1, setName1, name2, setName2, toggle, rec, ev, orderUrl,
  };
}

/** Panel pengaturan (dipakai di desktop & mobile) */
function Controls({ s }) {
  return (
    <>
      <section className="panel">
        <h2 className="panel__title">Tampilan</h2>
        <EventTypeChips value={s.eventTypeId} onChange={s.setEventTypeId} />
        <TemplatePicker value={s.themeId} onChange={s.setThemeId} eventTypeId={s.eventTypeId} />
        <div className="field-row">
          <label className="field">
            <span className="field__label">{s.ev.double ? 'Nama pria' : 'Nama'}</span>
            <input value={s.name1} maxLength={30} onChange={(e) => s.setName1(e.target.value)} />
          </label>
          {s.ev.double && (
            <label className="field">
              <span className="field__label">Nama wanita</span>
              <input value={s.name2} maxLength={30} onChange={(e) => s.setName2(e.target.value)} />
            </label>
          )}
        </div>
        <label className="field">
          <span className="field__label">Nama tamu (tampil jika fitur “Nama Tamu Personal” aktif)</span>
          <input value={s.guest} maxLength={40} onChange={(e) => s.setGuest(e.target.value)} />
        </label>
      </section>

      <section className="panel">
        <div className="panel__row">
          <h2 className="panel__title">Fitur ({s.features.length})</h2>
          <div className="panel__actions">
            <button type="button" className="link" onClick={() => s.setFeatures(FEATURES.map((f) => f.id))}>
              Aktifkan semua
            </button>
            <button type="button" className="link" onClick={() => s.setFeatures([])}>
              Reset
            </button>
          </div>
        </div>
        <div className="toggle-list">
          {FEATURES.map((f) => (
            <FeatureToggle
              key={f.id}
              f={f}
              on={s.features.includes(f.id)}
              sub={`Mulai paket ${tierName(f.tier)}`}
              onToggle={s.toggle}
            />
          ))}
        </div>
      </section>
    </>
  );
}

function Phone({ s, height, device }) {
  return (
    <InvitationPreview
      features={s.features}
      themeId={s.themeId}
      eventTypeId={s.eventTypeId}
      guest={s.guest}
      data={{ name1: s.name1, name2: s.name2 }}
      height={height}
      device={device || s.device}
    />
  );
}

const PageHead = () => (
  <div className="page-head">
    <span className="eyebrow">Demo Live</span>
    <h1>Coba sendiri, lihat langsung</h1>
    <p className="muted">
      Aktifkan atau matikan fitur dan lihat undangan berubah secara real-time. Cocok? Kami hitungkan paket yang pas.
    </p>
  </div>
);

/* =========================== DESKTOP =========================== */
function DemoDesktop() {
  const s = useDemoState();
  return (
    <div className="container demo">
      <PageHead />
      <div className={`demo__grid${s.device === 'desktop' ? ' demo__grid--wide' : ''}`}>
        <div className="demo__controls">
          <Controls s={s} />
          <section className="panel panel--accent">
            <h2 className="panel__title">Rekomendasi paket</h2>
            <p>
              Untuk {s.features.length} fitur terpilih, paket yang paling pas adalah{' '}
              <strong>
                {s.rec.name} · {formatIDR(s.rec.price)}
              </strong>
              .
            </p>
            <Link className="btn btn--block" to={s.orderUrl}>
              Pesan dengan fitur ini <Icon name="arrow-right" size={18} />
            </Link>
          </section>
        </div>
        <div className="demo__phone">
          <div className="sticky">
            <DeviceToggle value={s.device} onChange={s.setDevice} />
            <Phone s={s} height={680} />
            <p className="small muted center">
              Gulir di dalam {s.device === 'desktop' ? 'jendela browser' : 'layar ponsel'} untuk melihat seluruh undangan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================== MOBILE =========================== */
function DemoMobile() {
  const s = useDemoState();
  const [tab, setTab] = useState('atur');
  const tabs = [
    { id: 'atur', label: 'Atur', icon: 'sliders' },
    { id: 'preview', label: 'Pratinjau', icon: 'eye' },
  ];

  return (
    <div className="container mdemo">
      <PageHead />
      <div className="seg seg--full" role="tablist" aria-label="Mode demo">
        {tabs.map((t) => (
          <button
            type="button"
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            className={`seg__btn${tab === t.id ? ' is-on' : ''}`}
            onClick={() => {
              setTab(t.id);
              window.scrollTo({ top: 0 });
            }}
          >
            <Icon name={t.icon} size={16} /> {t.label}
            {t.id === 'atur' && <span className="seg__count">{s.features.length}</span>}
          </button>
        ))}
      </div>

      <div className="mdemo__pane">
        {tab === 'atur' ? (
          <Controls s={s} />
        ) : (
          <div className="mdemo__phone">
            <Phone s={s} height={600} device="phone" />
          </div>
        )}
      </div>

      <div className="abar">
        <div className="abar__info">
          <small>Rekomendasi · {s.features.length} fitur</small>
          <strong>
            {s.rec.name} · {formatIDR(s.rec.price)}
          </strong>
        </div>
        <Link className="btn btn--sm" to={s.orderUrl}>
          Pesan <Icon name="arrow-right" size={16} />
        </Link>
      </div>
    </div>
  );
}

export default function Demo({ isMobile }) {
  return isMobile ? <DemoMobile /> : <DemoDesktop />;
}
