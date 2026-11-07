import { useEffect, useMemo, useRef, useState } from 'react';
import { THEMES, EVENT_TYPES, FEATURES } from '../../shared/catalog.js';

const DEFAULT_DATE = '2027-02-14';

const STR = {
  id: {
    to: 'Kepada Yth.',
    toGeneric: 'Bapak/Ibu/Saudara/i',
    open: 'Buka Undangan',
    invite: 'Dengan penuh syukur, kami mengundang Anda untuk hadir dan memberikan doa restu.',
    countdown: 'Menuju Hari Bahagia',
    d: 'Hari',
    h: 'Jam',
    m: 'Menit',
    s: 'Detik',
    event: 'Waktu & Tempat',
    maps: 'Buka Google Maps',
    calendar: 'Simpan ke Kalender',
    gallery: 'Galeri',
    story: 'Perjalanan Kami',
    story1: 'Pertama bertemu',
    story2: 'Memulai perjalanan serius',
    story3: 'Memutuskan melangkah bersama',
    video: 'Video',
    live: 'Siaran Langsung',
    liveNote: 'Tidak bisa hadir? Saksikan secara online.',
    liveBtn: 'Tonton Live Streaming',
    rsvp: 'Konfirmasi Kehadiran',
    yourName: 'Nama Anda',
    attend: 'Hadir',
    notAttend: 'Tidak Hadir',
    send: 'Kirim',
    sent: 'Terima kasih, konfirmasi Anda sudah kami terima.',
    wishes: 'Ucapan & Doa',
    wishPh: 'Tulis ucapan…',
    gift: 'Amplop Digital',
    giftNote: 'Doa restu Anda sudah cukup. Bila berkenan berbagi tanda kasih:',
    copy: 'Salin No. Rekening',
    copied: 'Tersalin ✓',
    qr: 'QR Check-in Tamu',
    qrNote: 'Tunjukkan QR ini kepada penerima tamu.',
    share: 'Bagikan via WhatsApp',
    extras: 'Termasuk di sisi admin',
    thanks: 'Terima kasih atas doa & kehadirannya.',
  },
  en: {
    to: 'Dear',
    toGeneric: 'Our Beloved Guest',
    open: 'Open Invitation',
    invite: 'With joyful hearts, we invite you to join us and share your blessings.',
    countdown: 'Counting Down',
    d: 'Days',
    h: 'Hours',
    m: 'Minutes',
    s: 'Seconds',
    event: 'Date & Venue',
    maps: 'Open Google Maps',
    calendar: 'Save to Calendar',
    gallery: 'Gallery',
    story: 'Our Story',
    story1: 'The day we first met',
    story2: 'Our journey began',
    story3: 'Deciding to walk together',
    video: 'Video',
    live: 'Live Stream',
    liveNote: "Can't make it? Join us online.",
    liveBtn: 'Watch Live Stream',
    rsvp: 'RSVP',
    yourName: 'Your name',
    attend: 'Attending',
    notAttend: 'Not attending',
    send: 'Send',
    sent: 'Thank you, your response has been received.',
    wishes: 'Wishes & Prayers',
    wishPh: 'Write your wishes…',
    gift: 'Digital Gift',
    giftNote: 'Your presence is the greatest gift. Should you wish to share a token of love:',
    copy: 'Copy Account Number',
    copied: 'Copied ✓',
    qr: 'Guest Check-in QR',
    qrNote: 'Show this QR code at the reception desk.',
    share: 'Share via WhatsApp',
    extras: 'Included on the admin side',
    thanks: 'Thank you for your prayers & presence.',
  },
};

const pad = (n) => String(n).padStart(2, '0');
const toCal = (d) =>
  `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;

function useCountdown(target) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, target - now);
  return {
    d: Math.floor(diff / 86400000),
    h: Math.floor(diff / 3600000) % 24,
    m: Math.floor(diff / 60000) % 60,
    s: Math.floor(diff / 1000) % 60,
  };
}

function Countdown({ target, T }) {
  const c = useCountdown(target);
  const cells = [
    [c.d, T.d],
    [c.h, T.h],
    [c.m, T.m],
    [c.s, T.s],
  ];
  return (
    <div className="inv-sec">
      <h4>{T.countdown}</h4>
      <div className="inv-count">
        {cells.map(([v, l]) => (
          <div key={l}>
            <b>{pad(v)}</b>
            <span>{l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** QR dekoratif (contoh) — QR asli dibuat per tamu pada undangan final. */
function FakeQR({ seed }) {
  const N = 21;
  const cells = useMemo(() => {
    let h = 7;
    for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    const rnd = () => {
      h = (h * 1664525 + 1013904223) >>> 0;
      return h / 4294967296;
    };
    const out = [];
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        const finder = (x < 7 && y < 7) || (x >= N - 7 && y < 7) || (x < 7 && y >= N - 7);
        let on;
        if (finder) {
          const lx = x < 7 ? x : x - (N - 7);
          const ly = y < 7 ? y : y - (N - 7);
          on = lx === 0 || lx === 6 || ly === 0 || ly === 6 || (lx >= 2 && lx <= 4 && ly >= 2 && ly <= 4);
        } else {
          on = rnd() > 0.5;
        }
        if (on) out.push([x, y]);
      }
    }
    return out;
  }, [seed]);
  return (
    <svg viewBox={`0 0 ${N} ${N}`} className="inv-qr" role="img" aria-label="Contoh QR Code">
      <rect width={N} height={N} fill="#fff" />
      {cells.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="1.02" height="1.02" fill="#111" />
      ))}
    </svg>
  );
}

/**
 * Pratinjau undangan digital berbentuk layar ponsel.
 * Hanya menampilkan bagian yang fiturnya aktif (prop `features`).
 */
export default function InvitationPreview({
  features = [],
  themeId = 'sakura',
  eventTypeId = 'pernikahan',
  data = {},
  guest = '',
  height = 620,
}) {
  const theme = THEMES.find((t) => t.id === themeId) || THEMES[0];
  const ev = EVENT_TYPES.find((e) => e.id === eventTypeId) || EVENT_TYPES[0];
  const has = (id) => features.includes(id);

  const [lang, setLang] = useState('id');
  const [playing, setPlaying] = useState(false);
  const [attend, setAttend] = useState('yes');
  const [rsvpName, setRsvpName] = useState('');
  const [rsvpDone, setRsvpDone] = useState(false);
  const [copied, setCopied] = useState(false);
  const [wishText, setWishText] = useState('');
  const [wishes, setWishes] = useState([
    { n: 'Dinda', m: 'Selamat berbahagia! Semoga lancar sampai hari H 🤍' },
    { n: 'Pak Budi', m: 'Semoga menjadi keluarga yang sakinah, mawaddah, warahmah.' },
  ]);

  const multilang = has('multilang');
  const L = multilang ? lang : 'id';
  const T = STR[L];

  const screenRef = useRef(null);
  const bodyRef = useRef(null);

  const name1 = (data.name1 || '').trim() || 'Raka';
  const name2 = ev.double ? (data.name2 || '').trim() || 'Ayu' : '';
  const heading = ev.double ? `${name1} & ${name2}` : name1;
  const venue = (data.venue || '').trim() || 'Gedung Serbaguna Kenanga';
  const address = (data.address || '').trim() || 'Jl. Melati No. 12, Kota Anda';

  const dateStr = data.date || DEFAULT_DATE;
  const timeStr = data.time || '10:00';
  let when = new Date(`${dateStr}T${timeStr}:00`);
  if (Number.isNaN(when.getTime())) when = new Date(`${DEFAULT_DATE}T10:00:00`);
  const dateLabel = when.toLocaleDateString(L === 'en' ? 'en-US' : 'id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const timeLabel = `${pad(when.getHours())}:${pad(when.getMinutes())} ${L === 'en' ? 'local time' : 'WIB'}`;

  const slug = `${name1}-${name2}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const url = has('custom_domain')
    ? `${slug.replace(/-/g, '')}.com`
    : `woroworoinv.vercel.app/u/${slug}`;

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${venue} ${address}`)}`;
  const calUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    `${ev.title} ${heading}`
  )}&dates=${toCal(when)}/${toCal(new Date(when.getTime() + 3 * 3600000))}&ctz=Asia/Jakarta&location=${encodeURIComponent(
    `${venue}, ${address}`
  )}`;
  const shareUrl = `https://wa.me/?text=${encodeURIComponent(
    `${ev.title} ${heading}\n${dateLabel}, ${timeLabel}\n${venue}\nhttps://${url}`
  )}`;

  const guestLabel = has('guestname') && guest.trim() ? guest.trim() : T.toGeneric;

  const openInvitation = () => {
    const screen = screenRef.current;
    const body = bodyRef.current;
    if (screen && body) screen.scrollTo({ top: body.offsetTop, behavior: 'smooth' });
  };

  const submitWish = (e) => {
    e.preventDefault();
    if (!wishText.trim()) return;
    setWishes((w) => [{ n: guest.trim() || 'Anda', m: wishText.trim().slice(0, 140) }, ...w]);
    setWishText('');
  };

  const copyRek = async () => {
    try {
      await navigator.clipboard.writeText('1234567890');
    } catch {
      /* diabaikan: hanya demo */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const hiddenFeatures = FEATURES.filter((f) => has(f.id) && !f.visible);

  const style = {
    '--t-bg': theme.vars.bg,
    '--t-ink': theme.vars.ink,
    '--t-accent': theme.vars.accent,
    '--t-soft': theme.vars.soft,
    '--t-line': theme.vars.line,
    height,
  };

  return (
    <div className="phone" style={style}>
      <div className="phone__notch" />
      <div className="phone__bar">
        <span className="phone__lock">🔒</span>
        <span className="phone__url">{url}</span>
        {multilang && (
          <button type="button" className="phone__lang" onClick={() => setLang(lang === 'id' ? 'en' : 'id')}>
            {lang === 'id' ? 'EN' : 'ID'}
          </button>
        )}
      </div>

      <div className="phone__screen" ref={screenRef}>
        {/* ---------- Cover ---------- */}
        <section className="inv-cover">
          <p className="inv-kicker">{ev.title}</p>
          <h2 className="inv-names">{heading}</h2>
          <p className="inv-date">{dateLabel}</p>
          <div className="inv-to">
            <span>{T.to}</span>
            <b>{guestLabel}</b>
          </div>
          <button type="button" className="inv-btn" onClick={openInvitation}>
            ✉ {T.open}
          </button>
        </section>

        {/* ---------- Isi ---------- */}
        <div ref={bodyRef} className="inv-body">
          <div className="inv-sec">
            <p className="inv-invite">{T.invite}</p>
          </div>

          {has('countdown') && <Countdown target={when.getTime()} T={T} />}

          <div className="inv-sec">
            <h4>{T.event}</h4>
            <p className="inv-strong">{dateLabel}</p>
            <p>{timeLabel}</p>
            <p className="inv-strong inv-gap">{venue}</p>
            <p>{address}</p>
            {has('maps') && (
              <>
                <div className="inv-map" aria-hidden="true">
                  <span>📍</span>
                </div>
                <a className="inv-btn inv-btn--ghost" href={mapsUrl} target="_blank" rel="noreferrer">
                  {T.maps}
                </a>
              </>
            )}
            {has('calendar') && (
              <a className="inv-btn inv-btn--ghost" href={calUrl} target="_blank" rel="noreferrer">
                🗓 {T.calendar}
              </a>
            )}
          </div>

          {has('love_story') && (
            <div className="inv-sec">
              <h4>{T.story}</h4>
              <ul className="inv-timeline">
                <li>
                  <b>2019</b> {T.story1}
                </li>
                <li>
                  <b>2022</b> {T.story2}
                </li>
                <li>
                  <b>2026</b> {T.story3}
                </li>
              </ul>
            </div>
          )}

          {has('gallery') && (
            <div className="inv-sec">
              <h4>{T.gallery}</h4>
              <div className="inv-gallery">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <div key={i} style={{ opacity: 0.45 + (i % 3) * 0.2 }}>
                    <span>📷</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {has('video') && (
            <div className="inv-sec">
              <h4>{T.video}</h4>
              <div className="inv-video">
                <span>▶</span>
              </div>
            </div>
          )}

          {has('livestream') && (
            <div className="inv-sec">
              <h4>{T.live}</h4>
              <p>{T.liveNote}</p>
              <button type="button" className="inv-btn">
                📡 {T.liveBtn}
              </button>
            </div>
          )}

          {has('rsvp') && (
            <div className="inv-sec">
              <h4>{T.rsvp}</h4>
              {rsvpDone ? (
                <p className="inv-ok">{T.sent}</p>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (rsvpName.trim() || guest.trim()) setRsvpDone(true);
                  }}
                >
                  <input
                    className="inv-input"
                    placeholder={T.yourName}
                    value={rsvpName}
                    onChange={(e) => setRsvpName(e.target.value)}
                  />
                  <div className="inv-radio">
                    <label>
                      <input type="radio" checked={attend === 'yes'} onChange={() => setAttend('yes')} /> {T.attend}
                    </label>
                    <label>
                      <input type="radio" checked={attend === 'no'} onChange={() => setAttend('no')} /> {T.notAttend}
                    </label>
                  </div>
                  <button className="inv-btn" type="submit">
                    {T.send}
                  </button>
                </form>
              )}
            </div>
          )}

          {has('wishes') && (
            <div className="inv-sec">
              <h4>{T.wishes}</h4>
              <form onSubmit={submitWish} className="inv-wishform">
                <input
                  className="inv-input"
                  placeholder={T.wishPh}
                  value={wishText}
                  onChange={(e) => setWishText(e.target.value)}
                />
                <button className="inv-btn" type="submit">
                  {T.send}
                </button>
              </form>
              <ul className="inv-wishes">
                {wishes.map((w, i) => (
                  <li key={i}>
                    <b>{w.n}</b>
                    <span>{w.m}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {has('gift') && (
            <div className="inv-sec">
              <h4>{T.gift}</h4>
              <p>{T.giftNote}</p>
              <div className="inv-card">
                <small>Bank Contoh</small>
                <b>1234567890</b>
                <small>a.n. {name1}</small>
              </div>
              <button type="button" className="inv-btn inv-btn--ghost" onClick={copyRek}>
                {copied ? T.copied : T.copy}
              </button>
            </div>
          )}

          {has('qr_checkin') && (
            <div className="inv-sec">
              <h4>{T.qr}</h4>
              <FakeQR seed={`${slug}-${guest || 'tamu'}`} />
              <p className="inv-note">{T.qrNote}</p>
            </div>
          )}

          {has('whatsapp_share') && (
            <div className="inv-sec">
              <a className="inv-btn" href={shareUrl} target="_blank" rel="noreferrer">
                💬 {T.share}
              </a>
            </div>
          )}

          <div className="inv-sec inv-foot">
            <p>{T.thanks}</p>
            <h3>{heading}</h3>
            {hiddenFeatures.length > 0 && (
              <div className="inv-extras">
                <small>{T.extras}:</small>
                <div>
                  {hiddenFeatures.map((f) => (
                    <span key={f.id}>
                      {f.icon} {f.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {has('music') && (
        <button
          type="button"
          className={`phone__music ${playing ? 'is-on' : ''}`}
          onClick={() => setPlaying((p) => !p)}
          aria-label={playing ? 'Jeda musik (demo)' : 'Putar musik (demo)'}
          title="Demo tombol musik"
        >
          {playing ? '♫' : '♪'}
        </button>
      )}
    </div>
  );
}
