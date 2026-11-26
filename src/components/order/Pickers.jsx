import { useState } from 'react';
import Fx from '../invitation/Fx.jsx';
import CoverArt from '../invitation/CoverArt.jsx';
import Names from '../invitation/Names.jsx';
import { themeStyle } from '../invitation/themeVars.js';
import '../../invitation.css';
import { EVENT_TYPES, FEATURES, PACKAGES, THEMES, formatIDR, getFeature, parseMusic, tierName } from '../../../shared/catalog.js';
import Icon from '../Icon.jsx';

export function EventTypeChips({ value, onChange }) {
  return (
    <div className="field">
      <span className="field__label">Jenis acara</span>
      <div className="chips" role="radiogroup" aria-label="Jenis acara">
        {EVENT_TYPES.map((e) => (
          <button
            type="button"
            key={e.id}
            role="radio"
            aria-checked={value === e.id}
            className={`chip${value === e.id ? ' is-on' : ''}`}
            onClick={() => onChange(e.id)}
          >
            {e.name}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Mini cover beranimasi (efek partikel + ornamen + efek nama) untuk kartu template. */
export function MiniCover({ theme, eventTitle = 'Pernikahan' }) {
  return (
    <div className="inv mini" data-tpl={theme.id} data-card={theme.card} data-reveal={theme.reveal} style={themeStyle(theme)}>
      <Fx kind={theme.effect} colors={theme.vars.fx} count={9} seed={`mini-${theme.id}`} />
      <div className="inv-cover">
        <div className="inv-cover__art">
          <CoverArt kind={theme.cover} />
        </div>
        <div className="inv-cover__in">
          <p className="inv-kicker">{eventTitle}</p>
          <Names text="Raka & Ayu" fx={theme.namesFx} />
        </div>
      </div>
    </div>
  );
}

export function TemplatePicker({ value, onChange, eventTypeId }) {
  return (
    <div className="field">
      <span className="field__label">Template ({THEMES.length})</span>
      <div className="tpl-grid" role="radiogroup" aria-label="Template undangan">
        {THEMES.map((t) => {
          const on = value === t.id;
          const fit = eventTypeId && t.best.includes(eventTypeId);
          return (
            <button
              type="button"
              key={t.id}
              role="radio"
              aria-checked={on}
              className={`tpl${on ? ' is-on' : ''}`}
              onClick={() => onChange(t.id)}
            >
              <MiniCover theme={t} />
              <span className="tpl__meta">
                <strong>{t.name}</strong>
                <small>{t.mood}</small>
                <small className="tpl__fx">
                  <Icon name="sparkles" size={11} /> {t.effectLabel}
                </small>
                {fit && <em className="tpl__fit">Cocok untuk acara ini</em>}
              </span>
              {on && (
                <span className="tpl__check">
                  <Icon name="check" size={13} strokeWidth={3} />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export const ThemeChips = TemplatePicker;

/** Pilih tampilan pratinjau: ponsel / desktop. */
export function DeviceToggle({ value, onChange }) {
  return (
    <div className="seg" role="tablist" aria-label="Tampilan pratinjau">
      {[
        ['phone', 'Ponsel', 'smartphone'],
        ['desktop', 'Desktop', 'monitor'],
      ].map(([id, label, icon]) => (
        <button
          type="button"
          key={id}
          role="tab"
          aria-selected={value === id}
          className={`seg__btn${value === id ? ' is-on' : ''}`}
          onClick={() => onChange(id)}
        >
          <Icon name={icon} size={15} /> {label}
        </button>
      ))}
    </div>
  );
}

/** Satu baris fitur dengan saklar. */
export function FeatureToggle({ f, on, locked = false, blocked = false, sub, onToggle }) {
  return (
    <label className={`toggle${on ? ' is-on' : ''}${locked ? ' is-locked' : ''}${blocked ? ' is-blocked' : ''}`}>
      <input type="checkbox" checked={on} disabled={locked} onChange={() => onToggle(f)} />
      <span className="toggle__icon">
        <Icon name={locked ? 'lock' : f.icon} size={18} />
      </span>
      <span className="toggle__text">
        <strong>{f.name}</strong>
        <small>{sub ?? f.desc}</small>
      </span>
      <span className="toggle__sw" aria-hidden="true" />
    </label>
  );
}

export function PackagePicker({ value, onChange }) {
  return (
    <div className="pick-grid" role="radiogroup" aria-label="Paket">
      {PACKAGES.map((p) => (
        <label key={p.id} className={`pick${value === p.id ? ' is-on' : ''}`}>
          <input type="radio" name="paket" checked={value === p.id} onChange={() => onChange(p.id)} />
          <span className="pick__check">
            <Icon name="check" size={12} strokeWidth={3} />
          </span>
          <strong>{p.name}</strong>
          <span className="pick__price">{formatIDR(p.price)}</span>
          <small>{p.quota >= FEATURES.length ? 'Semua fitur' : `Pilih ${p.quota} fitur`}</small>
          <small className="pick__dur">
            <Icon name="clock" size={11} /> Link aktif {p.active}
          </small>
          {p.popular && <span className="pick__tag">Populer</span>}
        </label>
      ))}
    </div>
  );
}

export function FeaturePicker({ pkg, features, onToggle, quotaLabel, quotaFull, notice }) {
  return (
    <>
      <div className="panel__row panel__row--tight">
        <span className={`quota${quotaFull ? ' is-full' : ''}`}>Terpilih: {quotaLabel}</span>
      </div>
      {notice && (
        <p className="alert alert--info">
          <Icon name="info" size={16} /> <span>{notice}</span>
        </p>
      )}
      <div className="toggle-list">
        {FEATURES.map((f) => {
          const locked = f.tier > pkg.tier;
          const on = features.includes(f.id);
          return (
            <FeatureToggle
              key={f.id}
              f={f}
              on={on}
              locked={locked}
              blocked={!on && !locked && quotaFull}
              sub={locked ? `Butuh paket ${tierName(f.tier)}` : undefined}
              onToggle={onToggle}
            />
          );
        })}
      </div>
    </>
  );
}

export function EventForm({ ev, event, setEv }) {
  return (
    <>
      <div className="field-row">
        <label className="field">
          <span className="field__label">{ev.double ? 'Nama mempelai pria' : 'Nama pada undangan'}</span>
          <input value={event.name1} maxLength={40} onChange={setEv('name1')} placeholder="Raka" />
        </label>
        {ev.double && (
          <label className="field">
            <span className="field__label">Nama mempelai wanita</span>
            <input value={event.name2} maxLength={40} onChange={setEv('name2')} placeholder="Ayu" />
          </label>
        )}
      </div>
      <div className="field-row">
        <label className="field">
          <span className="field__label">Tanggal acara</span>
          <input type="date" value={event.date} onChange={setEv('date')} />
        </label>
        <label className="field">
          <span className="field__label">Jam</span>
          <input type="time" value={event.time} onChange={setEv('time')} />
        </label>
      </div>
      <label className="field">
        <span className="field__label">Nama tempat</span>
        <input value={event.venue} maxLength={80} onChange={setEv('venue')} placeholder="Gedung Serbaguna Kenanga" />
      </label>
      <label className="field">
        <span className="field__label">Alamat lengkap</span>
        <input value={event.address} maxLength={140} onChange={setEv('address')} placeholder="Jl. Melati No. 12, Kota Anda" />
      </label>
    </>
  );
}

export function CustomerForm({ customer, setCus }) {
  return (
    <>
      <label className="field">
        <span className="field__label">Nama lengkap</span>
        <input value={customer.name} maxLength={50} onChange={setCus('name')} autoComplete="name" />
      </label>
      <div className="field-row">
        <label className="field">
          <span className="field__label">Email</span>
          <input type="email" value={customer.email} onChange={setCus('email')} autoComplete="email" inputMode="email" />
        </label>
        <label className="field">
          <span className="field__label">No. WhatsApp</span>
          <input
            type="tel"
            value={customer.phone}
            onChange={setCus('phone')}
            placeholder="08123456789"
            autoComplete="tel"
            inputMode="tel"
          />
        </label>
      </div>
    </>
  );
}

export function SummaryList({ features }) {
  if (!features.length) return <p className="muted small">Belum ada fitur dipilih.</p>;
  return (
    <ul className="summary__list">
      {features.map((id) => {
        const f = getFeature(id);
        return (
          <li key={id}>
            <Icon name={f.icon} size={14} /> {f.name}
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Panel uji coba — hanya dirender untuk admin yang sudah login.
 * Membuat order simulasi: tidak memanggil Midtrans, tidak ada tagihan.
 */
export function AdminTestPanel({ onSimulate, busy }) {
  const [outcome, setOutcome] = useState('success');
  const options = [
    { id: 'success', label: 'Berhasil' },
    { id: 'pending', label: 'Menunggu' },
    { id: 'failed', label: 'Gagal' },
  ];
  return (
    <div className="testbox">
      <div className="testbox__head">
        <Icon name="flask" size={16} />
        <strong>Uji coba tanpa bayar</strong>
        <span className="badge badge--admin">Hanya admin</span>
      </div>
      <p className="small muted">
        Simulasikan hasil pembayaran untuk menguji alur pesanan. Midtrans tidak dipanggil dan tidak ada tagihan.
      </p>
      <div className="seg seg--sm" role="radiogroup" aria-label="Hasil simulasi">
        {options.map((o) => (
          <button
            type="button"
            key={o.id}
            role="radio"
            aria-checked={outcome === o.id}
            className={`seg__btn${outcome === o.id ? ' is-on' : ''}`}
            onClick={() => setOutcome(o.id)}
          >
            {o.label}
          </button>
        ))}
      </div>
      <button type="button" className="btn btn--ghost btn--block" disabled={busy} onClick={() => onSimulate(outcome)}>
        <Icon name="flask" size={16} /> Simulasikan pembayaran
      </button>
    </div>
  );
}

/** Isian musik latar custom (tampil bila fitur "Musik Latar" dipilih). */
export function MusicField({ music, setMus, note }) {
  const r = parseMusic(music.url);
  return (
    <div className="field musicfield" data-testid="music-field">
      <span className="field__label">
        <Icon name="music" size={14} /> Musik latar undangan (opsional)
      </span>
      <label className="field">
        <span className="field__label">Link lagu</span>
        <input
          value={music.url}
          maxLength={400}
          inputMode="url"
          onChange={setMus('url')}
          placeholder="https://www.youtube.com/watch?v=… atau https://…/lagu.mp3"
        />
      </label>
      <label className="field">
        <span className="field__label">Judul lagu (tampil di undangan)</span>
        <input value={music.title} maxLength={60} onChange={setMus('title')} placeholder="Contoh: Perfect - Ed Sheeran" />
      </label>
      {music.url.trim() && (
        <p className={`alert ${r.ok ? 'alert--ok' : 'alert--error'}`} role="status">
          <Icon name={r.ok ? 'check-circle' : 'x-circle'} size={16} />
          <span>
            {r.ok ? `Terdeteksi: ${r.source}. Tekan tombol musik pada pratinjau untuk mencoba.` : r.error}
          </span>
        </p>
      )}
      <details className="musichelp">
        <summary>Cara mendapatkan link lagu</summary>
        <ul>
          <li>
            <b>YouTube</b>: buka lagunya, klik Bagikan, salin link. Paling mudah, tidak perlu upload.
          </li>
          <li>
            <b>File MP3 sendiri</b>: unggah ke Google Drive, klik Bagikan &rarr; “Siapa saja yang memiliki link”, lalu
            salin linknya. Dropbox juga bisa.
          </li>
          <li>Tidak punya link? Biarkan kosong dan kirim lagunya ke admin setelah memesan.</li>
        </ul>
      </details>
      {note && <p className="small muted">{note}</p>}
    </div>
  );
}
