import { useEffect, useMemo, useRef, useState } from 'react';
import { THEMES, EVENT_TYPES, FEATURES } from '../../shared/catalog.js';
import Icon from './Icon.jsx';
import Fx from './invitation/Fx.jsx';
import CoverArt from './invitation/CoverArt.jsx';
import Names from './invitation/Names.jsx';
import { themeStyle } from './invitation/themeVars.js';
import { useMediaQuery } from '../hooks/useMediaQuery.js';
import '../invitation.css';

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
    giftAddr: 'Kirim kado ke',
    copied: 'Tersalin',
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
    giftAddr: 'Send gifts to',
    copied: 'Copied',
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
    <div className="inv-sec rv">
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

const DESK_W = 1200;
const DESK_H = 700;

/** Skala bingkai desktop mengikuti lebar kontainernya. */
function useFitScale(ref, base) {
  const [scale, setScale] = useState(0.5);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const update = () => {
      const w = el.clientWidth || base;
      setScale(Math.max(0.2, Math.min(1.25, w / base)));
    };
    update();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref, base]);
  return scale;
}

/**
 * Pratinjau undangan digital: `device="phone"` (layar ponsel) atau `device="desktop"`
 * (bingkai browser, cover di kiri dan isi di kanan). Hanya bagian yang fiturnya aktif yang tampil.
 */
export default function InvitationPreview({
  features = [],
  themeId = 'sakura',
  eventTypeId = 'pernikahan',
  data = {},
  guest = '',
  height = 620,
  device = 'phone', // 'phone' | 'desktop' | 'full' (layar penuh: undangan asli di /u/slug)
  live = null, // { wishes, sendWish(name,msg), sendRsvp(name,attend) } untuk undangan asli
  showExtras = true,
  music = null, // { type:'audio'|'youtube', url, ytId?, title } musik latar custom
  content = null, // isi undangan dari pelanggan (lihat cleanContent)
  mediaSlug = '', // slug untuk memuat foto dari /api/media
  placeholders = null, // tampilkan contoh bila bagian belum diisi (bawaan: tidak di layar penuh)
}) {
  const theme = THEMES.find((t) => t.id === themeId) || THEMES[0];
  const ev = EVENT_TYPES.find((e) => e.id === eventTypeId) || EVENT_TYPES[0];
  const has = (id) => features.includes(id);
  const wide = useMediaQuery('(min-width: 900px)');
  const full = device === 'full';
  const layout = full ? (wide ? 'desktop' : 'phone') : device;
  const desktop = layout === 'desktop';
  const C = content || {};
  const ph = placeholders == null ? !full : placeholders;
  const src = (ref) => (!ref ? '' : String(ref).startsWith('data:') ? ref : mediaSlug ? `/api/media?s=${encodeURIComponent(mediaSlug)}&i=${ref}` : '');

  const [lang, setLang] = useState('id');
  const [playing, setPlaying] = useState(false);
  const [attend, setAttend] = useState('yes');
  const [rsvpName, setRsvpName] = useState('');
  const [rsvpDone, setRsvpDone] = useState(false);
  const [copied, setCopied] = useState('');
  const [wishText, setWishText] = useState('');
  const [wishes, setWishes] = useState(() =>
    live
      ? live.wishes.map((w) => ({ n: w.n, m: w.m }))
      : [
          { n: 'Dinda', m: 'Selamat berbahagia! Semoga lancar sampai hari H.' },
          { n: 'Pak Budi', m: 'Semoga menjadi keluarga yang sakinah, mawaddah, warahmah.' },
        ]
  );
  const [sending, setSending] = useState(false);
  const [lightbox, setLightbox] = useState('');
  const [videoOn, setVideoOn] = useState(false);
  const [qrFail, setQrFail] = useState(false);
  const [ytLoaded, setYtLoaded] = useState(false);
  const [musicErr, setMusicErr] = useState(false);
  const audioRef = useRef(null);
  const ytRef = useRef(null);

  const multilang = has('multilang');
  const L = multilang ? lang : 'id';
  const T = STR[L];

  const scrollRef = useRef(null);
  const bodyRef = useRef(null);
  const wrapRef = useRef(null);
  const scale = useFitScale(wrapRef, DESK_W);

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
    ? C.domain || `${slug.replace(/-/g, '')}.com`
    : `woroworoinv.vercel.app/u/${mediaSlug || slug}`;

  const mapsUrl =
    (has('maps') && C.mapsUrl) || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${venue} ${address}`)}`;
  const calUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    `${ev.title} ${heading}`
  )}&dates=${toCal(when)}/${toCal(new Date(when.getTime() + 3 * 3600000))}&ctz=Asia/Jakarta&location=${encodeURIComponent(
    `${venue}, ${address}`
  )}`;
  const shareUrl = `https://wa.me/?text=${encodeURIComponent(
    `${ev.title} ${heading}\n${dateLabel}, ${timeLabel}\n${venue}\nhttps://${url}`
  )}`;

  const guestLabel = has('guestname') && guest.trim() ? guest.trim() : T.toGeneric;

  const track = has('music') && music && music.url ? music : null;
  const trackKey = track ? track.url : '';
  useEffect(() => {
    setPlaying(false);
    setYtLoaded(false);
    setMusicErr(false);
  }, [trackKey]);

  const ytCmd = (func) => {
    const w = ytRef.current && ytRef.current.contentWindow;
    if (w) w.postMessage(JSON.stringify({ event: 'command', func, args: [] }), '*');
  };
  const setPlay = (want) => {
    setPlaying(want);
    if (!track) return;
    if (track.type === 'audio') {
      const a = audioRef.current;
      if (!a) return;
      if (want) {
        setMusicErr(false);
        a.play().catch(() => {
          setPlaying(false);
          setMusicErr(true);
        });
      } else a.pause();
    } else if (want) {
      if (!ytLoaded) setYtLoaded(true);
      else ytCmd('playVideo');
    } else ytCmd('pauseVideo');
  };

  const openInvitation = () => {
    if (track && !playing) setPlay(true); // tap "Buka Undangan" = interaksi pengguna, musik boleh mulai
    const sc = scrollRef.current;
    const body = bodyRef.current;
    if (!sc) return;
    sc.scrollTo({ top: desktop ? 340 : body ? body.offsetTop : 600, behavior: 'smooth' });
  };

  const submitWish = async (e) => {
    e.preventDefault();
    if (!wishText.trim() || sending) return;
    const item = { n: guest.trim() || (live ? 'Tamu' : 'Anda'), m: wishText.trim().slice(0, 140) };
    if (live) {
      setSending(true);
      try {
        await live.sendWish(item.n, item.m);
      } catch {
        setSending(false);
        return;
      }
      setSending(false);
    }
    setWishes((w) => [item, ...w]);
    setWishText('');
  };

  const submitRsvp = async (e) => {
    e.preventDefault();
    const n = rsvpName.trim() || guest.trim();
    if (!n || sending) return;
    if (live) {
      setSending(true);
      try {
        await live.sendRsvp(n, attend);
      } catch {
        setSending(false);
        return;
      }
      setSending(false);
    }
    setRsvpDone(true);
  };

  const copyText = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* diabaikan: clipboard tidak tersedia */
    }
    setCopied(key);
    setTimeout(() => setCopied(''), 1800);
  };

  const hiddenFeatures = showExtras ? FEATURES.filter((f) => has(f.id) && !f.visible) : [];

  // animasi muncul saat di-scroll (reveal) — diulang saat tema/perangkat/fitur berubah
  const featKey = features.join(',');
  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return undefined;
    const els = Array.from(root.querySelectorAll('.rv:not(.is-in)'));
    if (typeof IntersectionObserver === 'undefined') {
      els.forEach((e) => e.classList.add('is-in'));
      return undefined;
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add('is-in');
            io.unobserve(en.target);
          }
        }),
      { root, threshold: 0.1 }
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [themeId, layout, featKey, lang]);

  const v = theme.vars;
  const style = { ...themeStyle(theme), '--vh': full ? '100dvh' : `${DESK_H}px` };

  const screen = (
    <div
      className="inv"
      data-tpl={theme.id}
      data-device={layout}
      data-reveal={theme.reveal}
      data-card={theme.card}
      style={style}
    >
      <Fx kind={theme.effect} colors={v.fx} count={desktop ? 24 : 16} seed={theme.id} />
      <div className="inv-scroll" ref={scrollRef} key={`${theme.id}-${layout}`}>
        <section className="inv-cover">
          <div className="inv-cover__art">
            <CoverArt kind={theme.cover} />
          </div>
          <div className="inv-cover__in">
            {C.cover && src(C.cover) && (
              <div className="inv-photo">
                <img src={src(C.cover)} alt="" />
              </div>
            )}
            <p className="inv-kicker">{ev.title}</p>
            <Names text={heading} fx={theme.namesFx} />
            <p className="inv-date">{dateLabel}</p>
            <div className="inv-to">
              <span>{T.to}</span>
              <b>{guestLabel}</b>
            </div>
            <button type="button" className="inv-btn" onClick={openInvitation}>
              <Icon name="mail" size={14} /> {T.open}
            </button>
          </div>
        </section>

        <div ref={bodyRef} className="inv-body">
          <div className="inv-sec rv">
            <p className="inv-invite">{L === 'en' && C.introEn ? C.introEn : C.intro || T.invite}</p>
            {(C.family1 || C.family2) && (
              <p className="inv-family">
                {C.family1}
                {ev.double && C.family2 && (
                  <>
                    <br />&amp;<br />
                    {C.family2}
                  </>
                )}
              </p>
            )}
          </div>

          {has('countdown') && <Countdown target={when.getTime()} T={T} />}

          <div className="inv-sec rv">
            <h4>{T.event}</h4>
            <p className="inv-strong">{dateLabel}</p>
            <p>{timeLabel}</p>
            <p className="inv-strong inv-gap">{venue}</p>
            <p>{address}</p>
            {C.note && <p className="inv-note inv-gap">{C.note}</p>}
            {has('maps') && (
              <>
                <div className="inv-map" aria-hidden="true">
                  <Icon name="map-pin" size={22} />
                </div>
                <a className="inv-btn inv-btn--ghost" href={mapsUrl} target="_blank" rel="noreferrer">
                  {T.maps}
                </a>
              </>
            )}
            {has('calendar') && (
              <a className="inv-btn inv-btn--ghost" href={calUrl} target="_blank" rel="noreferrer">
                <Icon name="calendar" size={14} /> {T.calendar}
              </a>
            )}
          </div>

          {has('love_story') && (C.story && C.story.length ? C.story : ph ? [{ when: '2019', text: T.story1 }, { when: '2022', text: T.story2 }, { when: '2026', text: T.story3 }] : []).length > 0 && (
            <div className="inv-sec rv">
              <h4>{T.story}</h4>
              <ul className="inv-timeline">
                {(C.story && C.story.length ? C.story : [{ when: '2019', text: T.story1 }, { when: '2022', text: T.story2 }, { when: '2026', text: T.story3 }]).map((r, i) => (
                  <li key={i}>
                    {r.when && <b>{r.when}</b>} {r.text}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {has('gallery') && ((C.gallery && C.gallery.length) || ph) && (
            <div className="inv-sec rv">
              <h4>{T.gallery}</h4>
              <div className="inv-gallery">
                {C.gallery && C.gallery.length
                  ? C.gallery.map((g) => (
                      <button type="button" key={g} className="inv-gal" onClick={() => setLightbox(g)} aria-label="Perbesar foto">
                        <img src={src(g)} alt="" loading="lazy" />
                      </button>
                    ))
                  : [0, 1, 2, 3, 4, 5].map((i) => (
                      <div key={i} style={{ opacity: 0.45 + (i % 3) * 0.2 }}>
                        <Icon name="image" size={18} />
                      </div>
                    ))}
              </div>
            </div>
          )}

          {has('video') && (C.videoId || ph) && (
            <div className="inv-sec rv">
              <h4>{T.video}</h4>
              {C.videoId ? (
                <div className="inv-video inv-video--real">
                  {videoOn ? (
                    <iframe
                      title="Video"
                      allow="autoplay; encrypted-media; picture-in-picture"
                      allowFullScreen
                      src={`https://www.youtube-nocookie.com/embed/${C.videoId}?autoplay=1&rel=0`}
                    />
                  ) : (
                    <button
                      type="button"
                      className="inv-video__poster"
                      aria-label="Putar video"
                      onClick={() => {
                        if (playing) setPlay(false); // jeda musik latar agar suara video terdengar
                        setVideoOn(true);
                      }}
                      style={{ backgroundImage: `url(https://i.ytimg.com/vi/${C.videoId}/hqdefault.jpg)` }}
                    >
                      <span>
                        <Icon name="play" size={26} fill="currentColor" strokeWidth={1} />
                      </span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="inv-video">
                  <Icon name="play" size={26} fill="currentColor" strokeWidth={1} />
                </div>
              )}
            </div>
          )}

          {has('livestream') && ((C.live && C.live.url) || ph) && (
            <div className="inv-sec rv">
              <h4>{T.live}</h4>
              <p>{(C.live && C.live.note) || T.liveNote}</p>
              {C.live && C.live.when && <p className="inv-strong">{C.live.when}</p>}
              {C.live && C.live.url ? (
                <a className="inv-btn" href={C.live.url} target="_blank" rel="noreferrer">
                  <Icon name="radio" size={14} /> {T.liveBtn}
                </a>
              ) : (
                <button type="button" className="inv-btn">
                  <Icon name="radio" size={14} /> {T.liveBtn}
                </button>
              )}
            </div>
          )}

          {has('rsvp') && (
            <div className="inv-sec rv">
              <h4>{T.rsvp}</h4>
              {rsvpDone ? (
                <p className="inv-ok">{T.sent}</p>
              ) : (
                <form onSubmit={submitRsvp}>
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
            <div className="inv-sec rv">
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

          {has('gift') &&
            (() => {
              const g = C.gift || {};
              const accs = g.accounts || [];
              const real = accs.length || g.address || g.qris;
              if (!real && !ph) return null;
              const list = real ? accs : [{ bank: 'Bank Contoh', number: '1234567890', name: name1 }];
              return (
                <div className="inv-sec rv">
                  <h4>{T.gift}</h4>
                  <p>{T.giftNote}</p>
                  {list.map((a, i) => (
                    <div className="inv-card" key={i}>
                      {a.bank && <small>{a.bank}</small>}
                      <b>{a.number}</b>
                      {a.name && <small>a.n. {a.name}</small>}
                      <button type="button" className="inv-btn inv-btn--ghost" onClick={() => copyText(a.number, `a${i}`)}>
                        {copied === `a${i}` ? T.copied : T.copy}
                      </button>
                    </div>
                  ))}
                  {g.qris && src(g.qris) && <img className="inv-qris" src={src(g.qris)} alt="QRIS" loading="lazy" />}
                  {g.address && (
                    <p className="inv-note inv-gap">
                      {T.giftAddr}: {g.address}
                    </p>
                  )}
                </div>
              );
            })()}

          {has('qr_checkin') && (
            <div className="inv-sec rv">
              <h4>{T.qr}</h4>
              {qrFail ? (
                <FakeQR seed={`${slug}-${guest || 'tamu'}`} />
              ) : (
                <img
                  className="inv-qr inv-qr--img"
                  alt="QR check-in"
                  width="150"
                  height="150"
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=6&data=${encodeURIComponent(`CHK:${mediaSlug || slug}:${guest.trim() || 'Tamu'}`)}`}
                  onError={() => setQrFail(true)}
                />
              )}
              <p className="inv-note">{T.qrNote}</p>
            </div>
          )}

          {has('whatsapp_share') && (
            <div className="inv-sec rv">
              <a className="inv-btn" href={shareUrl} target="_blank" rel="noreferrer">
                <Icon name="whatsapp" size={14} /> {T.share}
              </a>
            </div>
          )}

          <div className="inv-sec inv-foot rv">
            <p>{T.thanks}</p>
            <h3>{heading}</h3>
            {hiddenFeatures.length > 0 && (
              <div className="inv-extras">
                <small>{T.extras}:</small>
                <div>
                  {hiddenFeatures.map((f) => (
                    <span key={f.id}>
                      <Icon name={f.icon} size={12} /> {f.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {lightbox && (
        <div className="inv-lightbox" role="dialog" aria-modal="true" onClick={() => setLightbox('')}>
          <img src={src(lightbox)} alt="" />
          <button type="button" aria-label="Tutup" onClick={() => setLightbox('')}>
            <Icon name="x" size={20} />
          </button>
        </div>
      )}

      {has('music') && (
        <button
          type="button"
          className={`inv-music ${playing ? 'is-on' : ''}`}
          onClick={() => setPlay(!playing)}
          aria-label={playing ? 'Jeda musik (demo)' : 'Putar musik (demo)'}
          title="Demo tombol musik"
        >
          <Icon name={playing ? 'pause' : 'music'} size={18} />
        </button>
      )}
      {track && (playing || musicErr) && (
        <span className={`inv-music__t${musicErr ? ' is-err' : ''}`}>
          {musicErr ? 'Musik tidak bisa diputar' : track.title || 'Musik latar'}
        </span>
      )}
      {track && track.type === 'audio' && (
        <audio
          ref={audioRef}
          key={track.url}
          src={track.url}
          loop
          preload="none"
          onError={() => {
            setPlaying(false);
            setMusicErr(true);
          }}
        />
      )}
      {track && track.type === 'youtube' && ytLoaded && (
        <iframe
          ref={ytRef}
          key={track.ytId}
          className="inv-yt"
          title="Musik latar"
          allow="autoplay; encrypted-media"
          tabIndex={-1}
          src={`https://www.youtube-nocookie.com/embed/${track.ytId}?autoplay=1&loop=1&playlist=${track.ytId}&controls=0&playsinline=1&enablejsapi=1`}
        />
      )}
    </div>
  );

  const langBtn = multilang && (
    <button type="button" className="phone__lang" onClick={() => setLang(lang === 'id' ? 'en' : 'id')}>
      {lang === 'id' ? 'EN' : 'ID'}
    </button>
  );

  if (full) {
    return (
      <div className="inv-full">
        {screen}
        {langBtn && <div className="inv-lang">{langBtn}</div>}
      </div>
    );
  }

  if (desktop) {
    const barH = 34;
    return (
      <div className="browser-wrap" ref={wrapRef} style={{ height: (DESK_H + barH) * scale }}>
        <div className="browser" style={{ width: DESK_W, height: DESK_H + barH, transform: `scale(${scale})` }}>
          <div className="browser__bar" style={{ height: barH }}>
            <span className="browser__dots">
              <i /> <i /> <i />
            </span>
            <span className="phone__url">
              <Icon name="lock" size={11} /> {url}
            </span>
            {langBtn}
          </div>
          <div className="browser__view" style={{ height: DESK_H }}>
            {screen}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="phone" style={{ height }}>
      <div className="phone__notch" />
      <div className="phone__bar">
        <span className="phone__lock">
          <Icon name="lock" size={11} />
        </span>
        <span className="phone__url">{url}</span>
        {langBtn}
      </div>
      {screen}
    </div>
  );
}
