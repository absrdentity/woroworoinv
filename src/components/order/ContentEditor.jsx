import { useRef, useState } from 'react';
import { CONTENT_LIMITS, parseMusic } from '../../../shared/catalog.js';
import Icon from '../Icon.jsx';
import '../../invitation.css';

/** Satu atau beberapa foto. `uploader` = { upload(file) -> ref, src(ref) -> url } atau null. */
function ImageField({ label, hint, refs, max = 1, uploader, onChange, compact }) {
  const input = useRef(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const pick = async (e) => {
    const files = Array.from(e.target.files || []).slice(0, max - refs.length);
    e.target.value = '';
    if (!files.length) return;
    setBusy(true);
    setErr('');
    const next = [...refs];
    try {
      for (const f of files) next.push(await uploader.upload(f));
    } catch (ex) {
      setErr(ex.message || 'Gagal mengunggah.');
    }
    onChange(next);
    setBusy(false);
  };

  return (
    <div className="ce-img">
      {label && <span className="field__label">{label}</span>}
      <div className={`ce-thumbs${compact ? ' ce-thumbs--sm' : ''}`}>
        {refs.map((r, i) => (
          <div className="ce-thumb" key={r}>
            <img src={uploader ? uploader.src(r) : ''} alt="" />
            <button type="button" aria-label="Hapus foto" onClick={() => onChange(refs.filter((_, j) => j !== i))}>
              <Icon name="x" size={12} strokeWidth={3} />
            </button>
          </div>
        ))}
        {refs.length < max && uploader && (
          <button type="button" className="ce-add" onClick={() => input.current.click()} disabled={busy}>
            <Icon name="image" size={18} />
            <span>{busy ? 'Memproses…' : max > 1 ? 'Tambah foto' : 'Pilih foto'}</span>
          </button>
        )}
      </div>
      <input ref={input} type="file" accept="image/*" multiple={max > 1} hidden onChange={pick} data-testid="file-input" />
      {!uploader && <small className="muted">Foto diunggah setelah pembayaran lewat halaman Kelola.</small>}
      {hint && uploader && <small className="muted">{hint}</small>}
      {err && <p className="alert alert--error">{err}</p>}
    </div>
  );
}

const Row = ({ children }) => <div className="ce-row">{children}</div>;

/**
 * Editor isi undangan: teks + media, hanya bagian yang fiturnya dipilih.
 * value: lihat cleanContent() di shared/catalog.js
 */
export default function ContentEditor({ features, value, onChange, ev, uploader }) {
  const has = (id) => features.includes(id);
  const set = (patch) => onChange({ ...value, ...patch });
  const inp = (k, max) => ({ value: value[k] || '', maxLength: max, onChange: (e) => set({ [k]: e.target.value }) });
  const story = value.story || [];
  const gift = value.gift || { accounts: [], address: '', qris: '' };
  const live = value.live || { url: '', note: '', when: '' };
  const accounts = gift.accounts || [];
  const vid = value.videoUrl ? parseMusic(value.videoUrl) : null;

  return (
    <div className="ce" data-testid="content-editor">
      <h3 className="ce__h">Isi undangan</h3>

      <label className="field">
        <span className="field__label">Kalimat pembuka / doa / ayat</span>
        <textarea rows={3} placeholder="Kosongkan untuk memakai kalimat bawaan template" {...inp('intro', 300)} />
      </label>
      {has('multilang') && (
        <label className="field">
          <span className="field__label">Kalimat pembuka versi Inggris (opsional)</span>
          <textarea rows={2} {...inp('introEn', 300)} />
        </label>
      )}
      <Row>
        <label className="field">
          <span className="field__label">{ev && ev.double ? 'Keluarga mempelai pria' : 'Keluarga / orang tua'}</span>
          <input placeholder="Putra dari Bpk. … & Ibu …" {...inp('family1', 100)} />
        </label>
        {ev && ev.double && (
          <label className="field">
            <span className="field__label">Keluarga mempelai wanita</span>
            <input placeholder="Putri dari Bpk. … & Ibu …" {...inp('family2', 100)} />
          </label>
        )}
      </Row>
      <label className="field">
        <span className="field__label">Catatan tambahan (dress code, protokol, dll.)</span>
        <input {...inp('note', 200)} />
      </label>
      {has('maps') && (
        <label className="field">
          <span className="field__label">Link Google Maps lokasi (opsional)</span>
          <input inputMode="url" placeholder="https://maps.app.goo.gl/…" {...inp('mapsUrl', 300)} />
          <small className="muted">Kosong = pencarian otomatis dari nama tempat dan alamat.</small>
        </label>
      )}

      <ImageField
        label="Foto cover"
        hint="Tampil di sampul undangan. Foto dikompres otomatis."
        refs={value.cover ? [value.cover] : []}
        uploader={uploader}
        onChange={(r) => set({ cover: r[0] || '' })}
      />

      {has('gallery') && (
        <ImageField
          label={`Galeri foto (maks. ${CONTENT_LIMITS.gallery})`}
          refs={value.gallery || []}
          max={CONTENT_LIMITS.gallery}
          uploader={uploader}
          compact
          onChange={(r) => set({ gallery: r })}
        />
      )}

      {has('love_story') && (
        <div className="field">
          <span className="field__label">Timeline cerita (maks. {CONTENT_LIMITS.story})</span>
          {story.map((s, i) => (
            <Row key={i}>
              <input
                className="ce-when"
                placeholder="2019"
                maxLength={20}
                value={s.when}
                onChange={(e) => set({ story: story.map((x, j) => (j === i ? { ...x, when: e.target.value } : x)) })}
              />
              <input
                placeholder="Pertama bertemu di kampus"
                maxLength={200}
                value={s.text}
                onChange={(e) => set({ story: story.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)) })}
              />
              <button type="button" className="iconbtn" aria-label="Hapus baris" onClick={() => set({ story: story.filter((_, j) => j !== i) })}>
                <Icon name="x" size={16} />
              </button>
            </Row>
          ))}
          {story.length < CONTENT_LIMITS.story && (
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => set({ story: [...story, { when: '', text: '' }] })}>
              + Tambah momen
            </button>
          )}
        </div>
      )}

      {has('gift') && (
        <div className="field">
          <span className="field__label">Amplop digital (maks. {CONTENT_LIMITS.accounts} rekening / e-wallet)</span>
          {accounts.map((a, i) => {
            const upd = (k) => (e) =>
              set({ gift: { ...gift, accounts: accounts.map((x, j) => (j === i ? { ...x, [k]: e.target.value } : x)) } });
            return (
              <Row key={i}>
                <input placeholder="Bank / e-wallet" maxLength={30} value={a.bank} onChange={upd('bank')} />
                <input placeholder="Nomor" inputMode="numeric" maxLength={40} value={a.number} onChange={upd('number')} />
                <input placeholder="Atas nama" maxLength={60} value={a.name} onChange={upd('name')} />
                <button
                  type="button"
                  className="iconbtn"
                  aria-label="Hapus rekening"
                  onClick={() => set({ gift: { ...gift, accounts: accounts.filter((_, j) => j !== i) } })}
                >
                  <Icon name="x" size={16} />
                </button>
              </Row>
            );
          })}
          {accounts.length < CONTENT_LIMITS.accounts && (
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() => set({ gift: { ...gift, accounts: [...accounts, { bank: '', number: '', name: '' }] } })}
            >
              + Tambah rekening
            </button>
          )}
          <label className="field">
            <span className="field__label">Alamat pengiriman kado (opsional)</span>
            <input maxLength={160} value={gift.address || ''} onChange={(e) => set({ gift: { ...gift, address: e.target.value } })} />
          </label>
          <ImageField
            label="Foto QRIS (opsional)"
            refs={gift.qris ? [gift.qris] : []}
            uploader={uploader}
            onChange={(r) => set({ gift: { ...gift, qris: r[0] || '' } })}
          />
        </div>
      )}

      {has('video') && (
        <label className="field">
          <span className="field__label">Link video YouTube</span>
          <input inputMode="url" placeholder="https://www.youtube.com/watch?v=…" {...inp('videoUrl', 200)} />
          {vid && (
            <small className={vid.ok && vid.type === 'youtube' ? 'ce-ok' : 'ce-bad'}>
              {vid.ok && vid.type === 'youtube' ? 'Link YouTube terdeteksi.' : 'Gunakan link video YouTube.'}
            </small>
          )}
        </label>
      )}

      {has('livestream') && (
        <div className="field">
          <span className="field__label">Live streaming</span>
          <Row>
            <input
              inputMode="url"
              placeholder="https://youtube.com/live/… atau link Zoom"
              maxLength={300}
              value={live.url}
              onChange={(e) => set({ live: { ...live, url: e.target.value } })}
            />
            <input
              placeholder="Mulai 09.00 WIB"
              maxLength={60}
              value={live.when}
              onChange={(e) => set({ live: { ...live, when: e.target.value } })}
            />
          </Row>
          <input
            placeholder="Keterangan (opsional)"
            maxLength={120}
            value={live.note}
            onChange={(e) => set({ live: { ...live, note: e.target.value } })}
          />
        </div>
      )}

      {has('custom_domain') && (
        <label className="field">
          <span className="field__label">Domain yang diinginkan</span>
          <input placeholder="rakaayu.com" {...inp('domain', 80)} />
          <small className="muted">Admin akan menghubungkan domain ini ke undangan Anda (butuh domain milik Anda).</small>
        </label>
      )}
    </div>
  );
}
