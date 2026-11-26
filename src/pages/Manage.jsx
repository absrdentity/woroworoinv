import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { EVENT_TYPES, cleanContent, getPackage, normalizeMusic } from '../../shared/catalog.js';
import ContentEditor from '../components/order/ContentEditor.jsx';
import { DeviceToggle, EventForm, MusicField } from '../components/order/Pickers.jsx';
import InvitationPreview from '../components/InvitationPreview.jsx';
import Icon from '../components/Icon.jsx';
import { compressImage } from '../lib/image.js';
import { manageApi } from '../lib/manage.js';

const fmt = (ms) => new Date(ms).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
const fmtTime = (ms) => new Date(ms).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

function CopyBtn({ text, label = 'Salin' }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      type="button"
      className="btn btn--ghost btn--sm"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
        } catch {
          /* abaikan */
        }
        setOk(true);
        setTimeout(() => setOk(false), 1500);
      }}
    >
      <Icon name={ok ? 'check' : 'copy'} size={14} /> {ok ? 'Tersalin' : label}
    </button>
  );
}

/** Nomor WA: 08xx -> 628xx */
const waNumber = (p) => (p.startsWith('0') ? `62${p.slice(1)}` : p);

/* ---------------- Pemindai QR (kamera) bila didukung browser ---------------- */
function Scanner({ onCode, onClose }) {
  const video = useRef(null);
  const [err, setErr] = useState('');
  useEffect(() => {
    let stream;
    let timer;
    let stopped = false;
    (async () => {
      try {
        const det = new window.BarcodeDetector({ formats: ['qr_code'] });
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (stopped) return;
        video.current.srcObject = stream;
        await video.current.play();
        timer = setInterval(async () => {
          try {
            const codes = await det.detect(video.current);
            if (codes[0]) onCode(codes[0].rawValue);
          } catch {
            /* frame belum siap */
          }
        }, 600);
      } catch {
        setErr('Kamera tidak dapat dibuka. Izinkan akses kamera atau gunakan kolom manual.');
      }
    })();
    return () => {
      stopped = true;
      clearInterval(timer);
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [onCode]);
  return (
    <div className="scanner">
      <video ref={video} muted playsInline />
      {err && <p className="alert alert--error">{err}</p>}
      <button type="button" className="btn btn--ghost btn--sm" onClick={onClose}>
        Tutup kamera
      </button>
    </div>
  );
}

/* ---------------- Tab: Check-in ---------------- */
function CheckinTab({ slug, k, data, reload }) {
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState(null);
  const [scan, setScan] = useState(false);
  const last = useRef('');
  const submit = useCallback(
    async (value) => {
      const v = String(value || '').trim();
      if (!v) return;
      try {
        const r = await manageApi(slug, k, { method: 'POST', body: { action: 'checkin', code: v } });
        setMsg({ ok: !r.already, text: r.already ? `${r.name} sudah check-in sebelumnya.` : `Selamat datang, ${r.name}!` });
        setCode('');
        reload();
      } catch (e) {
        setMsg({ ok: false, text: e.message });
      }
    },
    [slug, k, reload]
  );
  const onScan = useCallback(
    (raw) => {
      if (raw === last.current) return;
      last.current = raw;
      submit(raw);
      setTimeout(() => (last.current = ''), 4000);
    },
    [submit]
  );
  const canScan = typeof window !== 'undefined' && 'BarcodeDetector' in window && navigator.mediaDevices;
  return (
    <section className="panel" data-testid="tab-checkin">
      <h2 className="panel__title">Check-in tamu</h2>
      <p className="muted">
        Tiap tamu yang membuka link personalnya melihat QR di undangan. Pindai QR itu di lokasi acara, atau ketik nama tamu.
      </p>
      <form
        className="input-row"
        onSubmit={(e) => {
          e.preventDefault();
          submit(code);
        }}
      >
        <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Nama tamu atau kode QR" aria-label="Kode check-in" />
        <button className="btn" type="submit">
          Check-in
        </button>
        {canScan && (
          <button type="button" className="btn btn--ghost" onClick={() => setScan(!scan)}>
            <Icon name="qr" size={16} /> {scan ? 'Tutup kamera' : 'Pindai kamera'}
          </button>
        )}
      </form>
      {scan && <Scanner onCode={onScan} onClose={() => setScan(false)} />}
      {msg && (
        <p className={`alert ${msg.ok ? 'alert--ok' : 'alert--warn'}`} role="status" data-testid="checkin-msg">
          {msg.text}
        </p>
      )}
      <h3>Sudah check-in ({data.checkins.length})</h3>
      <ul className="guestlinks">
        {data.checkins.map((c, i) => (
          <li key={i}>
            <span>{c.n}</span>
            <code>{fmtTime(c.t)}</code>
          </li>
        ))}
        {!data.checkins.length && <li className="muted">Belum ada tamu yang check-in.</li>}
      </ul>
    </section>
  );
}

/* ---------------- Tab: Dashboard tamu ---------------- */
function GuestsTab({ data }) {
  const yes = data.rsvps.filter((r) => r.a === 'yes').length;
  return (
    <section className="panel" data-testid="tab-tamu">
      <h2 className="panel__title">Dashboard tamu</h2>
      <div className="stats">
        <div>
          <b>{yes}</b>
          <span>Hadir</span>
        </div>
        <div>
          <b>{data.rsvps.length - yes}</b>
          <span>Tidak hadir</span>
        </div>
        <div>
          <b>{data.wishes.length}</b>
          <span>Ucapan</span>
        </div>
        <div>
          <b>{data.checkins.length}</b>
          <span>Check-in</span>
        </div>
      </div>
      <h3>RSVP</h3>
      <ul className="guestlinks">
        {data.rsvps.map((r, i) => (
          <li key={i}>
            <span>{r.n}</span>
            <code>{r.a === 'yes' ? 'Hadir' : 'Tidak hadir'}</code>
          </li>
        ))}
        {!data.rsvps.length && <li className="muted">Belum ada konfirmasi.</li>}
      </ul>
      <h3>Ucapan & doa</h3>
      <ul className="guestlinks">
        {data.wishes.map((w, i) => (
          <li key={i}>
            <span>{w.n}</span>
            <code>{w.m}</code>
          </li>
        ))}
        {!data.wishes.length && <li className="muted">Belum ada ucapan.</li>}
      </ul>
    </section>
  );
}

/* ---------------- Tab: Kirim undangan ke tamu ---------------- */
function SendTab({ data, slug, k, setData }) {
  const canWa = data.features.includes('broadcast');
  const [text, setText] = useState(() => data.guests.map((g) => (g.phone ? `${g.name}, ${g.phone}` : g.name)).join('\n'));
  const [tpl, setTpl] = useState('Assalamualaikum {nama}, kami mengundang Anda ke acara kami. Buka undangan digital berikut:\n{link}');
  const [saved, setSaved] = useState(false);
  const guests = useMemo(
    () =>
      text
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean)
        .slice(0, 500)
        .map((l) => {
          const [name, ...rest] = l.split(',');
          return { name: name.trim(), phone: rest.join('').replace(/[^\d]/g, '') };
        })
        .filter((g) => g.name),
    [text]
  );
  const link = (g) => `${data.url}?to=${encodeURIComponent(g.name)}`;
  const save = async () => {
    const r = await manageApi(slug, k, { method: 'POST', body: { action: 'save', guests } });
    setData(r);
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
  };
  return (
    <section className="panel" data-testid="tab-kirim">
      <h2 className="panel__title">Kirim undangan ke tamu</h2>
      {!data.features.includes('guestname') && (
        <p className="alert alert--warn">
          Fitur “Nama Tamu Personal” tidak aktif pada paket ini, jadi nama tamu tidak ditampilkan di cover. Link tetap bisa dibagikan.
        </p>
      )}
      <p className="muted">
        Satu tamu per baris. {canWa ? 'Format: Nama, 0812xxxx (nomor WhatsApp opsional).' : 'Format: Nama.'} Setiap tamu mendapat link
        pribadi.
      </p>
      <textarea rows={6} value={text} onChange={(e) => setText(e.target.value)} placeholder={'Bapak Andi & Keluarga, 081234567890\nIbu Sari'} aria-label="Daftar tamu" />
      {canWa && (
        <label className="field">
          <span className="field__label">Pesan WhatsApp ({'{nama}'} dan {'{link}'} diganti otomatis)</span>
          <textarea rows={3} value={tpl} onChange={(e) => setTpl(e.target.value)} />
        </label>
      )}
      <div className="input-row">
        <button type="button" className="btn" onClick={save}>
          {saved ? 'Tersimpan' : 'Simpan daftar tamu'}
        </button>
        {guests.length > 0 && <CopyBtn text={guests.map((g) => `${g.name}\t${link(g)}`).join('\n')} label="Salin semua (Nama + link)" />}
      </div>
      <ul className="guestlinks" data-testid="guest-list">
        {guests.map((g) => (
          <li key={g.name}>
            <span>{g.name}</span>
            <code>{link(g)}</code>
            <span className="input-row">
              <CopyBtn text={link(g)} />
              {canWa && g.phone && (
                <a
                  className="btn btn--sm"
                  target="_blank"
                  rel="noreferrer"
                  href={`https://wa.me/${waNumber(g.phone)}?text=${encodeURIComponent(tpl.replaceAll('{nama}', g.name).replaceAll('{link}', link(g)))}`}
                >
                  <Icon name="whatsapp" size={14} /> Kirim
                </a>
              )}
            </span>
          </li>
        ))}
      </ul>
      {canWa && <p className="small muted">Tombol “Kirim” membuka WhatsApp dengan pesan siap kirim. Anda menekan kirim per tamu.</p>}
    </section>
  );
}

/* ---------------- Halaman Kelola ---------------- */
export default function Manage() {
  const { pathname, search } = useLocation();
  const slug = decodeURIComponent(pathname.split('/')[2] || '').toLowerCase();
  const k = useMemo(() => new URLSearchParams(search).get('k') || '', [search]);
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');
  const [tab, setTab] = useState('isi');
  const [event, setEvent] = useState({});
  const [content, setContent] = useState({});
  const [music, setMusic] = useState({ url: '', title: '' });
  const [device, setDevice] = useState('phone');
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);

  const hydrate = useCallback((d) => {
    setData(d);
    setEvent(d.event || {});
    setContent(d.content || {});
    setMusic({ url: d.music?.url || '', title: d.music?.title || '' });
  }, []);
  const load = useCallback(async () => {
    try {
      hydrate(await manageApi(slug, k));
    } catch (e) {
      setErr(e.message);
    }
  }, [slug, k, hydrate]);
  useEffect(() => {
    load();
  }, [load]);

  const refreshStats = useCallback(async () => {
    try {
      const d = await manageApi(slug, k);
      setData((cur) => (cur ? { ...cur, rsvps: d.rsvps, wishes: d.wishes, checkins: d.checkins } : d));
    } catch {
      /* abaikan */
    }
  }, [slug, k]);

  const uploader = useMemo(
    () => ({
      upload: async (file) => {
        const dataUrl = await compressImage(file);
        return (await manageApi(slug, k, { method: 'POST', body: { action: 'upload', dataUrl } })).id;
      },
      src: (id) => `/api/media?s=${encodeURIComponent(slug)}&i=${id}`,
    }),
    [slug, k]
  );

  if (err) {
    return (
      <div className="container page-center">
        <h1>Tidak bisa membuka halaman kelola</h1>
        <p className="muted">{err} Pastikan Anda memakai link kelola lengkap dari halaman sukses pembayaran.</p>
        <Link className="btn" to="/">
          Ke Beranda
        </Link>
      </div>
    );
  }
  if (!data) return <div className="container page-center"><p className="muted">Memuat…</p></div>;

  const ev = EVENT_TYPES.find((e) => e.id === data.eventTypeId) || EVENT_TYPES[0];
  const pkg = getPackage(data.packageId);
  const f = (id) => data.features.includes(id);
  const expired = data.status === 'expired';
  const clean = cleanContent(content, data.features);
  const tabs = [
    ['isi', 'Isi undangan'],
    ...(f('dashboard') ? [['tamu', 'Dashboard tamu']] : []),
    ...(f('guestname') || f('broadcast') ? [['kirim', 'Kirim ke tamu']] : []),
    ...(f('qr_checkin') ? [['checkin', 'Check-in']] : []),
    ['info', 'Info & link'],
  ];

  const save = async () => {
    setBusy(true);
    setSaved('');
    try {
      const r = await manageApi(slug, k, {
        method: 'POST',
        body: { action: 'save', content, event, ...(f('music') ? { music: music.url.trim() ? music : null } : {}) },
      });
      hydrate(r);
      setSaved('Perubahan tersimpan.');
    } catch (e) {
      setSaved(`Gagal: ${e.message}`);
    } finally {
      setBusy(false);
    }
  };

  const preview = (
    <InvitationPreview
      device={device}
      features={data.features}
      themeId={data.themeId}
      eventTypeId={data.eventTypeId}
      data={event}
      guest="Nama Tamu"
      height={620}
      music={f('music') && music.url ? safeTrack(music) : null}
      content={clean}
      mediaSlug={slug}
    />
  );

  return (
    <div className="container manage">
      <div className="page-head">
        <span className="eyebrow">Kelola undangan</span>
        <h1>{[event.name1, event.name2].filter(Boolean).join(' & ') || 'Undangan Anda'}</h1>
        <p className="muted">
          Paket {pkg?.name} ·{' '}
          {expired ? 'masa aktif sudah berakhir' : `aktif sampai ${fmt(data.expiresAt)} (${data.daysLeft} hari lagi)`}
          {data.isAdmin && ' · masuk sebagai admin'}
        </p>
      </div>

      <div className="seg seg--full manage__tabs" role="tablist">
        {tabs.map(([id, label]) => (
          <button type="button" key={id} role="tab" aria-selected={tab === id} className={`seg__btn${tab === id ? ' is-on' : ''}`} onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'isi' && (
        <div className="manage__grid">
          <div className="manage__main">
            <section className="panel">
              <h2 className="panel__title">Detail acara</h2>
              <EventForm ev={ev} event={event} setEv={(key) => (e) => setEvent({ ...event, [key]: e.target.value })} />
              {f('music') && <MusicField music={music} setMus={(key) => (e) => setMusic({ ...music, [key]: e.target.value })} />}
            </section>
            <section className="panel">
              <ContentEditor features={data.features} value={content} onChange={setContent} ev={ev} uploader={uploader} />
            </section>
            <div className="manage__save">
              {saved && (
                <span className={saved.startsWith('Gagal') ? 'ce-bad' : 'ce-ok'} role="status" data-testid="save-msg">
                  {saved}
                </span>
              )}
              <button type="button" className="btn btn--lg" onClick={save} disabled={busy || expired}>
                {busy ? 'Menyimpan…' : 'Simpan perubahan'}
              </button>
              <button type="button" className="btn btn--ghost manage__prevbtn" onClick={() => setPreviewOpen(true)}>
                <Icon name="eye" size={16} /> Pratinjau
              </button>
            </div>
          </div>
          <aside className="manage__side">
            <div className="sticky">
              <DeviceToggle value={device} onChange={setDevice} />
              {preview}
            </div>
          </aside>
        </div>
      )}

      {tab === 'tamu' && <GuestsTab data={data} />}
      {tab === 'kirim' && <SendTab data={data} slug={slug} k={k} setData={hydrate} />}
      {tab === 'checkin' && <CheckinTab slug={slug} k={k} data={data} reload={refreshStats} />}
      {tab === 'info' && (
        <section className="panel" data-testid="tab-info">
          <h2 className="panel__title">Link undangan</h2>
          <code className="codeline">{data.url}</code>
          <div className="input-row">
            <CopyBtn text={data.url} label="Salin link" />
            <a className="btn btn--ghost btn--sm" href={data.url} target="_blank" rel="noreferrer">
              <Icon name="external" size={14} /> Buka undangan
            </a>
          </div>
          <p className="small muted">
            Aktif sampai {fmt(data.expiresAt)}. Tambahkan <code>?to=Nama Tamu</code> di akhir link untuk menyapa tamu dengan nama mereka.
          </p>
          {f('custom_domain') && (
            <p className="alert alert--info">
              <Icon name="globe" size={16} />
              <span>Domain: {content.domain || 'belum diisi'}. Admin akan menghubungkannya setelah Anda mengisi domain di tab “Isi undangan”.</span>
            </p>
          )}
          <h3>Simpan halaman ini</h3>
          <p className="small muted">Alamat halaman kelola ini bersifat rahasia. Siapa pun yang memilikinya dapat mengubah undangan Anda.</p>
          <CopyBtn text={typeof window !== 'undefined' ? window.location.href : ''} label="Salin link kelola" />
        </section>
      )}

      {previewOpen && (
        <div className="modal" role="dialog" aria-modal="true" aria-label="Pratinjau">
          <button type="button" className="modal__backdrop" onClick={() => setPreviewOpen(false)} aria-label="Tutup" />
          <div className="modal__panel modal__panel--narrow">
            <div className="sheet__head">
              <strong>Pratinjau</strong>
              <button type="button" className="iconbtn" onClick={() => setPreviewOpen(false)} aria-label="Tutup">
                <Icon name="x" size={20} />
              </button>
            </div>
            <div className="center">{preview}</div>
          </div>
        </div>
      )}
    </div>
  );
}

function safeTrack(m) {
  try {
    return normalizeMusic(m);
  } catch {
    return null;
  }
}
