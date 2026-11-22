import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import { useAdmin, useConfig } from '../lib/config.jsx';
import { adminApi, setAdminToken } from '../lib/admin.js';

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function CopyButton({ text, label = 'Salin', block = false }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className={`btn btn--ghost btn--sm${block ? ' btn--block' : ''}`}
      onClick={async () => {
        if (await copyText(text)) {
          setDone(true);
          setTimeout(() => setDone(false), 1800);
        }
      }}
    >
      <Icon name={done ? 'check' : 'copy'} size={15} /> {done ? 'Tersalin' : label}
    </button>
  );
}

function randomPassword(len = 16) {
  const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const a = new Uint32Array(len);
  crypto.getRandomValues(a);
  return Array.from(a, (n) => chars[n % chars.length]).join('');
}

/* ============================================================
   1) PANDUAN SETUP — tampil selama ADMIN_PASSWORD belum diatur.
   Semua isian hanya diproses di browser ini (tidak dikirim ke server).
   ============================================================ */
function SetupGuide() {
  const [f, setF] = useState({ server: '', client: '', password: '', wa: '', site: '' });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const kind = (k) => (!k ? null : k.startsWith('SB-') ? 'Sandbox' : 'Production');
  const sk = kind(f.server.trim());
  const ck = kind(f.client.trim());
  const mismatch = sk && ck && sk !== ck;

  const env = useMemo(() => {
    const lines = [
      `MIDTRANS_SERVER_KEY=${f.server.trim() || 'isi-server-key'}`,
      `MIDTRANS_CLIENT_KEY=${f.client.trim() || 'isi-client-key'}`,
      `ADMIN_PASSWORD=${f.password.trim() || 'isi-password-min-8-karakter'}`,
    ];
    if (f.wa.trim()) lines.push(`ADMIN_WHATSAPP=${f.wa.replace(/\D/g, '')}`);
    if (f.site.trim()) lines.push(`SITE_URL=${f.site.trim().replace(/\/$/, '')}`);
    return lines.join('\n');
  }, [f]);

  const ready = f.server.trim() && f.client.trim() && f.password.trim().length >= 8 && !mismatch;

  return (
    <div className="admin__stack">
      <div className="alert alert--info">
        <Icon name="info" size={16} />
        <span>
          Admin belum diaktifkan. Ikuti 4 langkah singkat berikut. Anda hanya perlu mengisi{' '}
          <b>3 environment variable</b>; mode Sandbox/Production dikenali otomatis dari Server Key.
        </span>
      </div>

      <section className="panel">
        <h2 className="panel__title">
          <span className="num">1</span> Ambil key dari Midtrans
        </h2>
        <p className="muted">
          Buka{' '}
          <a href="https://dashboard.midtrans.com" target="_blank" rel="noreferrer">
            dashboard.midtrans.com
          </a>
          , pilih <b>Environment: Sandbox</b> (untuk uji coba), lalu <b>Settings &rarr; Access Keys</b>. Salin{' '}
          <b>Server Key</b> dan <b>Client Key</b>.
        </p>
      </section>

      <section className="panel">
        <h2 className="panel__title">
          <span className="num">2</span> Isi data (hanya di browser ini)
        </h2>
        <label className="field">
          <span className="field__label">
            Server Key {sk && <span className={`pill pill--${sk === 'Sandbox' ? 'ok' : 'warn'}`}>{sk}</span>}
          </span>
          <input value={f.server} onChange={set('server')} placeholder="SB-Mid-server-xxxxxxxx" autoComplete="off" spellCheck="false" />
        </label>
        <label className="field">
          <span className="field__label">
            Client Key {ck && <span className={`pill pill--${ck === 'Sandbox' ? 'ok' : 'warn'}`}>{ck}</span>}
          </span>
          <input value={f.client} onChange={set('client')} placeholder="SB-Mid-client-xxxxxxxx" autoComplete="off" spellCheck="false" />
        </label>
        {mismatch && (
          <p className="alert alert--error">
            <Icon name="x-circle" size={16} />
            <span>Server Key ({sk}) dan Client Key ({ck}) berasal dari environment yang berbeda.</span>
          </p>
        )}
        <label className="field">
          <span className="field__label">Password admin (minimal 8 karakter)</span>
          <div className="input-row">
            <input value={f.password} onChange={set('password')} placeholder="dipakai untuk login ke halaman ini" autoComplete="off" spellCheck="false" />
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => setF({ ...f, password: randomPassword() })}>
              <Icon name="key" size={15} /> Buat acak
            </button>
          </div>
        </label>
        <div className="field-row">
          <label className="field">
            <span className="field__label">Nomor WhatsApp admin (opsional)</span>
            <input value={f.wa} onChange={set('wa')} placeholder="6281234567890" inputMode="tel" />
          </label>
          <label className="field">
            <span className="field__label">URL website (opsional)</span>
            <input value={f.site} onChange={set('site')} placeholder="https://domainanda.com" inputMode="url" />
          </label>
        </div>
      </section>

      <section className="panel">
        <h2 className="panel__title">
          <span className="num">3</span> Tempel ke Vercel
        </h2>
        <pre className="codebox">{env}</pre>
        <div className="admin__actions">
          <CopyButton text={env} label="Salin semua" />
          {!ready && <span className="small muted">Lengkapi Server Key, Client Key, dan password agar valid.</span>}
        </div>
        <ol className="plain-steps">
          <li>
            Vercel &rarr; project Anda &rarr; <b>Settings &rarr; Environment Variables</b>.
          </li>
          <li>Klik kolom Key lalu <b>tempel seluruh teks di atas</b> (Vercel otomatis memecahnya per baris).</li>
          <li>Simpan, lalu <b>Redeploy</b> proyek agar nilai terbaca.</li>
        </ol>
      </section>

      <section className="panel">
        <h2 className="panel__title">
          <span className="num">4</span> Daftarkan Notification URL
        </h2>
        <p className="muted">
          Di Midtrans: <b>Settings &rarr; Payment &rarr; Notification URL</b>, isi dengan:
        </p>
        <div className="input-row">
          <code className="codeline">{`${window.location.origin}/api/notification`}</code>
          <CopyButton text={`${window.location.origin}/api/notification`} />
        </div>
        <p className="small muted">Setelah redeploy, muat ulang halaman ini lalu login dengan password admin.</p>
      </section>
    </div>
  );
}

/* ============================================================
   2) LOGIN
   ============================================================ */
function Login() {
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const { token } = await adminApi('login', { method: 'POST', body: { password } });
      setAdminToken(token);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="panel login" onSubmit={submit}>
      <span className="login__icon">
        <Icon name="lock" size={22} />
      </span>
      <h2>Masuk sebagai admin</h2>
      <p className="muted">Fitur ini hanya untuk pemilik website.</p>
      {error && (
        <p className="alert alert--error" role="alert">
          <Icon name="x-circle" size={16} /> <span>{error}</span>
        </p>
      )}
      <label className="field">
        <span className="field__label">Password admin</span>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" autoFocus />
      </label>
      <button type="submit" className="btn btn--block" disabled={busy || !password}>
        {busy ? 'Memeriksa…' : 'Masuk'}
      </button>
    </form>
  );
}

/* ============================================================
   3) DASHBOARD PENGATURAN PEMBAYARAN
   ============================================================ */
const STATUS_ICON = { ok: 'check-circle', warn: 'alert', error: 'x-circle' };

function Dashboard() {
  const [diag, setDiag] = useState(null);
  const [error, setError] = useState('');
  const [ping, setPing] = useState({ busy: false, result: null });

  const load = async () => {
    setError('');
    try {
      setDiag(await adminApi('diagnostics'));
    } catch (e) {
      setError(e.message);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const runPing = async () => {
    setPing({ busy: true, result: null });
    try {
      setPing({ busy: false, result: await adminApi('ping', { method: 'POST' }) });
    } catch (e) {
      setPing({ busy: false, result: { ok: false, message: e.message } });
    }
  };

  if (error) {
    return (
      <p className="alert alert--error">
        <Icon name="x-circle" size={16} /> <span>{error}</span>
      </p>
    );
  }
  if (!diag) return <p className="muted">Memuat status…</p>;

  const isProd = diag.mode === 'production';

  return (
    <div className="admin__stack">
      {/* Ringkasan */}
      <section className={`panel hero-status hero-status--${diag.ready ? 'ok' : 'bad'}`}>
        <span className="hero-status__icon">
          <Icon name={diag.ready ? 'check-circle' : 'alert'} size={26} />
        </span>
        <div>
          <h2>{diag.ready ? 'Pembayaran siap digunakan' : 'Pengaturan perlu perhatian'}</h2>
          <p className="muted">
            Mode saat ini: <span className={`pill pill--${isProd ? 'warn' : 'ok'}`}>{isProd ? 'Production' : 'Sandbox'}</span>
          </p>
        </div>
        <button type="button" className="btn btn--ghost btn--sm" onClick={load}>
          <Icon name="refresh" size={15} /> Periksa ulang
        </button>
      </section>

      {/* Pemeriksaan */}
      <section className="panel">
        <h2 className="panel__title">Pemeriksaan konfigurasi</h2>
        <ul className="checks">
          {diag.checks.map((c) => (
            <li key={c.id} className={`check check--${c.status}`}>
              <Icon name={STATUS_ICON[c.status]} size={20} />
              <div>
                <strong>{c.label}</strong>
                <p>{c.detail}</p>
                {c.hint && c.status !== 'ok' && <p className="check__hint">{c.hint}</p>}
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Uji koneksi */}
      <section className="panel">
        <h2 className="panel__title">Uji koneksi Midtrans</h2>
        <p className="muted">
          Memastikan Server Key diterima Midtrans. Hanya membuat token percobaan Rp1.000 dan <b>tidak menagih</b> siapa pun.
        </p>
        <button type="button" className="btn" onClick={runPing} disabled={ping.busy}>
          <Icon name="zap" size={16} /> {ping.busy ? 'Menguji…' : 'Uji koneksi sekarang'}
        </button>
        {ping.result && (
          <p className={`alert ${ping.result.ok ? 'alert--ok' : 'alert--error'}`} role="status">
            <Icon name={ping.result.ok ? 'check-circle' : 'x-circle'} size={16} /> <span>{ping.result.message}</span>
          </p>
        )}
      </section>

      {/* Uji coba tanpa bayar */}
      <section className="panel panel--accent">
        <h2 className="panel__title">Uji coba tanpa membayar</h2>
        <p>
          Anda sedang login sebagai admin, jadi halaman <b>Pesan</b> menampilkan panel{' '}
          <b>“Uji coba tanpa bayar”</b>. Isi form seperti biasa, pilih hasil (berhasil / menunggu / gagal), lalu klik
          <b> Simulasikan pembayaran</b>. Midtrans tidak dipanggil, dan pengunjung biasa tidak melihat panel ini.
        </p>
        <Link className="btn" to="/pesan">
          Buka halaman Pesan <Icon name="arrow-right" size={16} />
        </Link>
      </section>

      {/* URL */}
      <section className="panel">
        <h2 className="panel__title">URL untuk Midtrans Dashboard</h2>
        <div className="kv">
          <span className="field__label">Notification URL (Settings &rarr; Payment)</span>
          <div className="input-row">
            <code className="codeline">{diag.notificationUrl}</code>
            <CopyButton text={diag.notificationUrl} />
          </div>
        </div>
        <div className="kv">
          <span className="field__label">Finish Redirect URL (opsional)</span>
          <div className="input-row">
            <code className="codeline">{diag.finishUrl}</code>
            <CopyButton text={diag.finishUrl} />
          </div>
        </div>
      </section>

      {/* Pindah ke production */}
      <section className="panel">
        <h2 className="panel__title">Pindah ke Production</h2>
        <ol className="plain-steps">
          <li>Di Midtrans, ganti Environment ke <b>Production</b> dan salin Server Key + Client Key production.</li>
          <li>Ganti nilai <code>MIDTRANS_SERVER_KEY</code> dan <code>MIDTRANS_CLIENT_KEY</code> di Vercel, lalu Redeploy.</li>
          <li>Mode berubah otomatis menjadi Production. Tidak ada pengaturan lain.</li>
        </ol>
      </section>
    </div>
  );
}

export default function Admin() {
  const cfg = useConfig();
  const { isAdmin, checking } = useAdmin();

  return (
    <div className="container container--medium admin">
      <div className="page-head">
        <span className="eyebrow">Admin</span>
        <h1>Pengaturan pembayaran</h1>
        <p className="muted">Konfigurasi Midtrans, pemeriksaan otomatis, dan uji coba pembayaran tanpa biaya.</p>
      </div>

      {cfg.loading || (cfg.adminEnabled && checking) ? (
        <p className="muted">Memuat…</p>
      ) : cfg.error ? (
        <p className="alert alert--error">
          <Icon name="x-circle" size={16} />
          <span>
            {cfg.error} Pastikan Anda menjalankan <code>npx vercel dev</code> (bukan <code>npm run dev</code>).
          </span>
        </p>
      ) : !cfg.adminEnabled ? (
        <SetupGuide />
      ) : !isAdmin ? (
        <Login />
      ) : (
        <>
          <div className="admin__bar">
            <span className="badge badge--admin">
              <Icon name="flask" size={14} /> Login sebagai admin
            </span>
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => setAdminToken('')}>
              <Icon name="logout" size={15} /> Keluar
            </button>
          </div>
          <Dashboard />
        </>
      )}
    </div>
  );
}
