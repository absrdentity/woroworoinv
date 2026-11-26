import { useCallback, useEffect, useMemo, useState } from 'react';
import { EVENT_TYPES, FEATURES, THEMES, formatIDR, getPackage, tierName } from '../../shared/catalog.js';
import Icon from '../components/Icon.jsx';
import { EventForm, EventTypeChips, MusicField, PackagePicker, TemplatePicker } from '../components/order/Pickers.jsx';
import { adminApi } from '../lib/admin.js';

async function copy(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function CopyBtn({ text, label = 'Salin' }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      type="button"
      className="btn btn--ghost btn--sm"
      onClick={async () => {
        if (await copy(text)) {
          setOk(true);
          setTimeout(() => setOk(false), 1600);
        }
      }}
    >
      <Icon name={ok ? 'check' : 'copy'} size={14} /> {ok ? 'Tersalin' : label}
    </button>
  );
}

const fmtDate = (ms) => new Date(ms).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
const names = (e) => [e.name1, e.name2].filter(Boolean).join(' & ') || '(tanpa nama)';

/* ---------------- Panduan setup penyimpanan (gratis) ---------------- */
function StorageGuide() {
  return (
    <section className="panel panel--accent" data-testid="storage-guide">
      <h2 className="panel__title">Aktifkan penyimpanan undangan (gratis)</h2>
      <p>
        Link undangan otomatis memerlukan tempat menyimpan data. Gunakan <b>Upstash Redis</b> (paket Free, tanpa kartu
        kredit). Cukup 5 langkah, sekitar 3 menit:
      </p>
      <ol className="plain-steps">
        <li>
          Buka project Anda di <b>vercel.com</b>, menu <b>Storage</b> (atau <b>Marketplace</b>), pilih <b>Upstash</b>{' '}
          &rarr; <b>Redis</b> (Upstash for Redis).
        </li>
        <li>
          Pilih paket <b>Free</b>, beri nama database (bebas), pilih region terdekat (mis. Singapore), lalu buat.
        </li>
        <li>
          Hubungkan database ke project ini (<b>Connect Project</b>) untuk semua environment. Vercel otomatis menambah
          variabel <code>KV_REST_API_URL</code> dan <code>KV_REST_API_TOKEN</code>.
        </li>
        <li>
          Buka <b>Deployments</b> &rarr; titik tiga pada deployment terbaru &rarr; <b>Redeploy</b>.
        </li>
        <li>Muat ulang halaman ini. Bagian pembuat undangan akan muncul di sini.</li>
      </ol>
      <p className="small muted">
        Alternatif tanpa integrasi Vercel: daftar di upstash.com, buat database Redis, lalu salin <b>REST URL</b> dan{' '}
        <b>REST Token</b> ke variabel <code>UPSTASH_REDIS_REST_URL</code> dan <code>UPSTASH_REDIS_REST_TOKEN</code>.
      </p>
    </section>
  );
}

/* ---------------- Link tamu (?to=Nama) ---------------- */
function GuestLinks({ inv }) {
  const [text, setText] = useState('');
  const list = useMemo(
    () =>
      text
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean)
        .slice(0, 300)
        .map((n) => ({ n, link: `${inv.url}?to=${encodeURIComponent(n)}` })),
    [text, inv.url]
  );
  const hasFeature = inv.features.includes('guestname');
  return (
    <div className="invrow__more">
      <strong>Link per tamu</strong>
      {!hasFeature && (
        <p className="alert alert--warn">
          <Icon name="alert" size={16} />
          <span>Fitur “Nama Tamu Personal” tidak aktif pada undangan ini, jadi nama di link tidak ditampilkan.</span>
        </p>
      )}
      <textarea
        rows={4}
        placeholder={'Satu nama per baris, contoh:\nBapak Andi & Keluarga\nIbu Sari'}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      {list.length > 0 && (
        <>
          <ul className="guestlinks">
            {list.map((g) => (
              <li key={g.n}>
                <span>{g.n}</span>
                <code>{g.link}</code>
                <CopyBtn text={g.link} />
              </li>
            ))}
          </ul>
          <CopyBtn text={list.map((g) => `${g.n}\t${g.link}`).join('\n')} label="Salin semua (Nama + link)" />
        </>
      )}
    </div>
  );
}

function Guests({ slug }) {
  const [d, setD] = useState(null);
  useEffect(() => {
    adminApi('inv_guests', { query: { slug } }).then(setD).catch(() => setD({ rsvps: [], wishes: [] }));
  }, [slug]);
  if (!d) return <p className="muted">Memuat…</p>;
  const yes = d.rsvps.filter((r) => r.a === 'yes').length;
  return (
    <div className="invrow__more">
      <strong>
        RSVP: {yes} hadir, {d.rsvps.length - yes} tidak hadir · Ucapan: {d.wishes.length}
      </strong>
      <ul className="guestlinks">
        {d.rsvps.map((r, i) => (
          <li key={`r${i}`}>
            <span>{r.n}</span>
            <code>{r.a === 'yes' ? 'Hadir' : 'Tidak hadir'}</code>
          </li>
        ))}
        {d.wishes.map((w, i) => (
          <li key={`w${i}`}>
            <span>{w.n}</span>
            <code>{w.m}</code>
          </li>
        ))}
        {!d.rsvps.length && !d.wishes.length && <li className="muted">Belum ada RSVP atau ucapan.</li>}
      </ul>
    </div>
  );
}

/* ---------------- Satu baris undangan ---------------- */
function Row({ inv, onChanged, onDeleted }) {
  const [open, setOpen] = useState('');
  const [days, setDays] = useState('');
  const [confirm, setConfirm] = useState(false);
  const [mus, setMusState] = useState({ url: inv.music?.url || '', title: inv.music?.title || '' });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const pkg = getPackage(inv.packageId);
  const expired = inv.status === 'expired';

  const act = async (fn) => {
    setBusy(true);
    setErr('');
    try {
      await fn();
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };
  const update = (body) =>
    act(async () => {
      const r = await adminApi('inv_update', { method: 'POST', body: { slug: inv.slug, ...body } });
      onChanged(r.item);
      setDays('');
    });
  const remove = () =>
    act(async () => {
      await adminApi('inv_delete', { method: 'POST', body: { slug: inv.slug } });
      onDeleted(inv.slug);
    });

  return (
    <li className="invrow" data-slug={inv.slug}>
      <div className="invrow__head">
        <div>
          <strong>{names(inv.event)}</strong>{' '}
          <span className={`pill pill--${expired ? 'warn' : 'ok'}`}>{expired ? 'Kedaluwarsa' : `Aktif · sisa ${inv.daysLeft} hari`}</span>{' '}
          {inv.simulated && <span className="pill">Simulasi</span>}
          {inv.priorityUntil && <span className="pill pill--warn">Prioritas 24 jam{inv.priorityUntil > Date.now() ? ` · sampai ${new Date(inv.priorityUntil).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}` : ''}</span>}
          {inv.content?.domain && <span className="pill">Domain: {inv.content.domain}</span>}
          <div className="small muted">
            Paket {pkg?.name} · {THEMES.find((t) => t.id === inv.themeId)?.name} · dibuat {fmtDate(inv.createdAt)} · berakhir{' '}
            {fmtDate(inv.expiresAt)} ({inv.orderId ? 'dari pesanan' : 'manual'})
          </div>
          <code className="codeline">{inv.url}</code>
        </div>
        <div className="invrow__actions">
          <CopyBtn text={inv.url} label="Salin link" />
          <CopyBtn text={inv.manageUrl} label="Link kelola" />
          <a className="btn btn--ghost btn--sm" href={`/kelola/${inv.slug}`} target="_blank" rel="noreferrer">
            <Icon name="edit" size={14} /> Kelola isi
          </a>
          <a className="btn btn--ghost btn--sm" href={inv.url} target="_blank" rel="noreferrer">
            <Icon name="external" size={14} /> Buka
          </a>
        </div>
      </div>

      <div className="invrow__bar">
        <button type="button" className="link" onClick={() => setOpen(open === 'dur' ? '' : 'dur')}>
          Atur durasi
        </button>
        {inv.features.includes('music') && (
          <button type="button" className="link" onClick={() => setOpen(open === 'music' ? '' : 'music')}>
            Musik
          </button>
        )}
        <button type="button" className="link" onClick={() => setOpen(open === 'guest' ? '' : 'guest')}>
          Link tamu
        </button>
        <button type="button" className="link" onClick={() => setOpen(open === 'rsvp' ? '' : 'rsvp')}>
          RSVP &amp; ucapan
        </button>
        {confirm ? (
          <span className="invrow__confirm">
            Hapus permanen?{' '}
            <button type="button" className="btn btn--sm btn--danger" disabled={busy} onClick={remove}>
              Ya, hapus
            </button>{' '}
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => setConfirm(false)}>
              Batal
            </button>
          </span>
        ) : (
          <button type="button" className="link link--danger" onClick={() => setConfirm(true)}>
            <Icon name="x" size={13} /> Hapus
          </button>
        )}
      </div>

      {err && <p className="alert alert--error">{err}</p>}

      {open === 'dur' && (
        <div className="invrow__more">
          <strong>Masa aktif</strong>
          <div className="input-row">
            <button type="button" className="btn btn--ghost btn--sm" disabled={busy} onClick={() => update({ extendDays: 30 })}>
              +30 hari
            </button>
            <button type="button" className="btn btn--ghost btn--sm" disabled={busy} onClick={() => update({ extendDays: 90 })}>
              +90 hari
            </button>
            <input
              type="number"
              min="1"
              max="3650"
              placeholder="jumlah hari"
              value={days}
              onChange={(e) => setDays(e.target.value)}
              aria-label="Jumlah hari"
            />
            <button type="button" className="btn btn--sm" disabled={busy || !days} onClick={() => update({ days: Number(days) })}>
              Atur dari hari ini
            </button>
          </div>
          <p className="small muted">“Atur dari hari ini” menghitung ulang masa aktif mulai sekarang (isi 1 untuk menutup lebih cepat).</p>
        </div>
      )}
      {open === 'music' && (
        <div className="invrow__more">
          <MusicField music={mus} setMus={(k) => (e) => setMusState({ ...mus, [k]: e.target.value })} />
          <div className="input-row">
            <button type="button" className="btn btn--sm" disabled={busy} onClick={() => update({ music: mus })}>
              Simpan musik
            </button>
            {inv.music && (
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                disabled={busy}
                onClick={() => {
                  setMusState({ url: '', title: '' });
                  update({ music: null });
                }}
              >
                Hapus musik
              </button>
            )}
          </div>
        </div>
      )}
      {open === 'guest' && <GuestLinks inv={inv} />}
      {open === 'rsvp' && <Guests slug={inv.slug} />}
    </li>
  );
}

/* ---------------- Form buat undangan manual ---------------- */
const blank = { name1: '', name2: '', date: '', time: '10:00', venue: '', address: '' };

function CreateForm({ onCreated }) {
  const [packageId, setPackageId] = useState('standard');
  const [eventTypeId, setEventTypeId] = useState('pernikahan');
  const [themeId, setThemeId] = useState('sakura');
  const [features, setFeatures] = useState(['countdown', 'maps', 'rsvp']);
  const [event, setEvent] = useState(blank);
  const [days, setDays] = useState('');
  const [slug, setSlug] = useState('');
  const [music, setMusic] = useState({ url: '', title: '' });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [made, setMade] = useState(null);

  const pkg = getPackage(packageId);
  const ev = EVENT_TYPES.find((e) => e.id === eventTypeId);
  const allowed = FEATURES.filter((f) => f.tier <= pkg.tier);

  const changePackage = (id) => {
    const p = getPackage(id);
    setPackageId(id);
    setFeatures((cur) => cur.filter((fid) => FEATURES.find((f) => f.id === fid).tier <= p.tier).slice(0, p.quota));
  };
  const toggle = (id) =>
    setFeatures((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : cur.length >= pkg.quota ? cur : [...cur, id]));

  const submit = async () => {
    setBusy(true);
    setErr('');
    setMade(null);
    try {
      const r = await adminApi('inv_create', {
        method: 'POST',
        body: { packageId, features, themeId, eventTypeId, event: { ...event, name2: ev.double ? event.name2 : '' }, days: days ? Number(days) : undefined, slug: slug || undefined, music: features.includes('music') ? music : undefined },
      });
      setMade(r.item);
      onCreated(r.item);
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="panel" data-testid="inv-create">
      <h2 className="panel__title">Buat undangan baru</h2>
      <p className="muted">
        Link dibuat otomatis dari nama pemilik, mis. <code>/u/raka-ayu</code>. Undangan dari pesanan yang sudah dibayar
        dibuat otomatis tanpa form ini.
      </p>
      <div className="field">
        <span className="field__label">Paket (menentukan fitur &amp; masa aktif bawaan)</span>
        <PackagePicker value={packageId} onChange={changePackage} />
        <small className="muted">Masa aktif bawaan: {pkg.active} ({pkg.durationDays} hari)</small>
      </div>
      <EventTypeChips value={eventTypeId} onChange={setEventTypeId} />
      <TemplatePicker value={themeId} onChange={setThemeId} eventTypeId={eventTypeId} />
      <EventForm ev={ev} event={event} setEv={(k) => (e) => setEvent({ ...event, [k]: e.target.value })} />

      <div className="field">
        <span className="field__label">
          Fitur ({features.length}/{pkg.quota >= FEATURES.length ? 'semua' : pkg.quota})
        </span>
        <div className="chips">
          {allowed.map((f) => (
            <button
              type="button"
              key={f.id}
              className={`chip${features.includes(f.id) ? ' is-on' : ''}`}
              onClick={() => toggle(f.id)}
              title={`Mulai paket ${tierName(f.tier)}`}
            >
              {f.name}
            </button>
          ))}
        </div>
      </div>

      {features.includes('music') && <MusicField music={music} setMus={(k) => (e) => setMusic({ ...music, [k]: e.target.value })} />}

      <div className="field-row">
        <label className="field">
          <span className="field__label">Masa aktif (hari, opsional)</span>
          <input type="number" min="1" max="3650" value={days} onChange={(e) => setDays(e.target.value)} placeholder={String(pkg.durationDays)} />
        </label>
        <label className="field">
          <span className="field__label">Slug link (opsional)</span>
          <input value={slug} maxLength={40} onChange={(e) => setSlug(e.target.value.toLowerCase())} placeholder="otomatis dari nama" />
        </label>
      </div>

      {err && (
        <p className="alert alert--error" role="alert">
          <Icon name="x-circle" size={16} /> <span>{err}</span>
        </p>
      )}
      <button type="button" className="btn" onClick={submit} disabled={busy || !event.name1.trim()}>
        <Icon name="zap" size={16} /> {busy ? 'Membuat…' : 'Buat link undangan'}
      </button>
      {made && (
        <p className="alert alert--ok" role="status" data-testid="inv-made">
          <Icon name="check-circle" size={16} />
          <span>
            Undangan dibuat: <code>{made.url}</code> (aktif {made.daysLeft} hari) <CopyBtn text={made.url} />
          </span>
        </p>
      )}
    </section>
  );
}

/* ---------------- Tab Undangan ---------------- */
export default function AdminInvitations() {
  const [state, setState] = useState({ loading: true, storage: true, items: [], error: '' });
  const [conn, setConn] = useState(null);

  const load = useCallback(async () => {
    try {
      const r = await adminApi('inv_list');
      setState({ loading: false, storage: r.storage, items: r.items || [], error: '' });
      if (r.storage) setConn(await adminApi('inv_status'));
    } catch (e) {
      setState({ loading: false, storage: true, items: [], error: e.message });
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  if (state.loading) return <p className="muted">Memuat…</p>;
  if (!state.storage) return <StorageGuide />;

  const upsert = (item) => setState((s) => ({ ...s, items: [item, ...s.items.filter((i) => i.slug !== item.slug)].sort((a, b) => b.createdAt - a.createdAt) }));
  const drop = (slug) => setState((s) => ({ ...s, items: s.items.filter((i) => i.slug !== slug) }));
  const active = state.items.filter((i) => i.status === 'active').length;

  return (
    <div className="admin__stack">
      {state.error && (
        <p className="alert alert--error">
          <Icon name="x-circle" size={16} /> <span>{state.error}</span>
        </p>
      )}
      {conn && !conn.ok && (
        <p className="alert alert--error">
          <Icon name="x-circle" size={16} /> <span>Penyimpanan terhubung tapi gagal merespons: {conn.message}</span>
        </p>
      )}
      <CreateForm onCreated={upsert} />
      <section className="panel" data-testid="inv-list">
        <div className="panel__row">
          <h2 className="panel__title">
            Daftar undangan ({state.items.length}) · {active} aktif
          </h2>
          <button type="button" className="btn btn--ghost btn--sm" onClick={load}>
            <Icon name="refresh" size={15} /> Muat ulang
          </button>
        </div>
        {state.items.length === 0 ? (
          <p className="muted">Belum ada undangan. Undangan muncul otomatis setelah pesanan dibayar, atau buat manual di atas.</p>
        ) : (
          <ul className="invlist">
            {state.items.map((inv) => (
              <Row key={inv.slug} inv={inv} onChanged={upsert} onDeleted={drop} />
            ))}
          </ul>
        )}
        <p className="small muted">
          Undangan kedaluwarsa menampilkan halaman “sudah berakhir” dan datanya terhapus otomatis 30 hari kemudian.
        </p>
      </section>
    </div>
  );
}
