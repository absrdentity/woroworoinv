import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FEATURES,
  THEMES,
  EVENT_TYPES,
  formatIDR,
  recommendPackage,
  tierName,
} from '../../shared/catalog.js';
import InvitationPreview from '../components/InvitationPreview.jsx';

export default function Demo() {
  const [features, setFeatures] = useState(['countdown', 'maps', 'gallery', 'rsvp']);
  const [themeId, setThemeId] = useState('sakura');
  const [eventTypeId, setEventTypeId] = useState('pernikahan');
  const [guest, setGuest] = useState('Bapak Andi & Keluarga');
  const [name1, setName1] = useState('Raka');
  const [name2, setName2] = useState('Ayu');

  const toggle = (id) =>
    setFeatures((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));

  const rec = recommendPackage(features);
  const orderUrl = `/pesan?paket=${rec.id}&fitur=${features.join(',')}&tema=${themeId}&acara=${eventTypeId}`;
  const ev = EVENT_TYPES.find((e) => e.id === eventTypeId);

  return (
    <div className="container demo">
      <div className="page-head">
        <span className="eyebrow">Demo Live</span>
        <h1>Coba sendiri, lihat langsung</h1>
        <p className="muted">
          Aktifkan atau matikan fitur di bawah dan lihat undangan berubah secara real-time. Cocok? Kami hitungkan paket
          yang pas untuk Anda.
        </p>
      </div>

      <div className="demo__grid">
        <div className="demo__controls">
          <section className="panel">
            <h2 className="panel__title">Tampilan</h2>
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
                <span>{ev.double ? 'Nama pria' : 'Nama'}</span>
                <input value={name1} maxLength={30} onChange={(e) => setName1(e.target.value)} />
              </label>
              {ev.double && (
                <label className="field">
                  <span>Nama wanita</span>
                  <input value={name2} maxLength={30} onChange={(e) => setName2(e.target.value)} />
                </label>
              )}
            </div>
            <label className="field">
              <span>
                Nama tamu (aktif jika fitur <em>Nama Tamu Personal</em> dipilih)
              </span>
              <input value={guest} maxLength={40} onChange={(e) => setGuest(e.target.value)} />
            </label>
          </section>

          <section className="panel">
            <div className="panel__row">
              <h2 className="panel__title">Fitur ({features.length})</h2>
              <div className="panel__actions">
                <button type="button" className="link" onClick={() => setFeatures(FEATURES.map((f) => f.id))}>
                  Aktifkan semua
                </button>
                <button type="button" className="link" onClick={() => setFeatures([])}>
                  Reset
                </button>
              </div>
            </div>
            <div className="toggle-list">
              {FEATURES.map((f) => (
                <label className={`toggle ${features.includes(f.id) ? 'is-on' : ''}`} key={f.id}>
                  <input type="checkbox" checked={features.includes(f.id)} onChange={() => toggle(f.id)} />
                  <span className="toggle__icon">{f.icon}</span>
                  <span className="toggle__text">
                    <strong>{f.name}</strong>
                    <small>Mulai paket {tierName(f.tier)}</small>
                  </span>
                  <span className="toggle__sw" aria-hidden="true" />
                </label>
              ))}
            </div>
          </section>

          <section className="panel panel--accent">
            <h2 className="panel__title">Rekomendasi paket</h2>
            <p>
              Untuk {features.length} fitur terpilih, paket yang paling pas adalah{' '}
              <strong>
                {rec.name} — {formatIDR(rec.price)}
              </strong>
              .
            </p>
            <Link className="btn btn--block" to={orderUrl}>
              Pesan dengan fitur ini
            </Link>
          </section>
        </div>

        <div className="demo__phone">
          <div className="sticky">
            <InvitationPreview
              features={features}
              themeId={themeId}
              eventTypeId={eventTypeId}
              guest={guest}
              data={{ name1, name2 }}
              height={680}
            />
            <p className="small muted center">Scroll di dalam layar ponsel untuk melihat seluruh undangan.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
