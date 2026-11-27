import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import InvitationPreview from '../components/InvitationPreview.jsx';
import Icon from '../components/Icon.jsx';

/** slug dari alamat /u/<slug> */
const slugFromPath = (pathname) => decodeURIComponent((pathname.split('/')[2] || '').toLowerCase());

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const CACHE = (k) => `wwi:last:${k}`;
const readCache = (k) => {
  try {
    return JSON.parse(localStorage.getItem(CACHE(k)) || 'null');
  } catch {
    return null;
  }
};
const writeCache = (k, v) => {
  try {
    localStorage.setItem(CACHE(k), JSON.stringify(v));
  } catch {
    /* penyimpanan browser penuh / diblokir: abaikan */
  }
};

/**
 * Memuat undangan dengan coba ulang: gangguan sesaat (jaringan, 5xx, 404 semu saat penyimpanan sibuk)
 * tidak boleh membuat undangan tampak hilang. 404 baru dipercaya setelah dicek ulang.
 */
async function loadInvitation(url) {
  let last = { code: 0, data: null };
  for (let i = 0; i < 4; i += 1) {
    try {
      const r = await fetch(url);
      const data = await r.json().catch(() => ({}));
      last = { code: r.status, data };
      if (r.status === 200 || r.status === 410) return last;
      if (r.status === 400) return last;
      if (r.status === 404 && i >= 1) return last;
    } catch {
      last = { code: 0, data: null };
    }
    await wait(700 * (i + 1));
  }
  return last;
}

async function post(slug, body) {
  const res = await fetch(`/api/invite?slug=${encodeURIComponent(slug)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Gagal mengirim.');
}

function State({ icon, title, children }) {
  return (
    <div className="invite-state">
      <Icon name={icon} size={36} />
      <h1>{title}</h1>
      <p>{children}</p>
      <div>
        <Link className="btn btn--ghost" to="/">
          Tentang WoroWoroInv
        </Link>
      </div>
    </div>
  );
}

/** Halaman undangan asli milik pelanggan: /u/<nama-pemilik>?to=<nama tamu> */
export default function Invite({ domain = '' }) {
  const { pathname, search } = useLocation();
  const slug = domain ? `@${domain}` : slugFromPath(pathname);
  const [tick, setTick] = useState(0);
  const guest = useMemo(() => (new URLSearchParams(search).get('to') || '').slice(0, 60), [search]);
  const [st, setSt] = useState({ loading: true, code: 0, data: null });

  useEffect(() => {
    let off = false;
    setSt({ loading: true, code: 0, data: null });
    const url = domain ? `/api/invite?domain=${encodeURIComponent(domain)}` : `/api/invite?slug=${encodeURIComponent(slug)}`;
    loadInvitation(url).then((x) => {
      if (off) return;
      if (x.code === 200 && x.data) writeCache(slug, x.data);
      // server/jaringan bermasalah: tampilkan salinan terakhir yang pernah berhasil dimuat di perangkat ini
      if ((x.code === 0 || x.code >= 500) && readCache(slug)) x = { code: 200, data: readCache(slug), stale: true };
      setSt({ loading: false, ...x });
    });
    return () => {
      off = true;
    };
  }, [slug, domain, tick]);

  const d = st.data;
  useEffect(() => {
    if (st.code === 200 && d) {
      const names = [d.event.name1, d.event.name2].filter(Boolean).join(' & ');
      document.title = `Undangan ${names}`;
    }
  }, [st.code, d]);

  const live = useMemo(
    () =>
      d && st.code === 200
        ? {
            wishes: d.wishes || [],
            sendWish: (name, message) => post(d.slug || slug, { type: 'wish', name, message }),
            sendRsvp: (name, attend) => post(d.slug || slug, { type: 'rsvp', name, attend }),
          }
        : null,
    [d, st.code, slug]
  );

  if (st.loading) return <div className="invite-state"><p>Memuat undangan…</p></div>;
  if (st.code === 404) {
    return (
      <State icon="alert" title="Undangan tidak ditemukan">
        Periksa kembali tautan yang Anda terima, atau hubungi pengirim undangan.
      </State>
    );
  }
  if (st.code === 410) {
    return (
      <State icon="clock" title="Undangan sudah berakhir">
        Masa aktif undangan {[d?.event?.name1, d?.event?.name2].filter(Boolean).join(' & ')} telah habis.
      </State>
    );
  }
  if (st.code !== 200 || !d) {
    return (
      <State icon="alert" title="Undangan belum bisa dibuka">
        Terjadi gangguan saat memuat undangan. Silakan coba lagi beberapa saat lagi.
        <br />
        <button type="button" className="btn btn--sm" style={{ marginTop: 12 }} onClick={() => setTick((n) => n + 1)}>
          Coba lagi
        </button>
      </State>
    );
  }

  return (
    <InvitationPreview
      device="full"
      features={d.features}
      themeId={d.themeId}
      eventTypeId={d.eventTypeId}
      data={d.event}
      guest={guest}
      live={live}
      music={d.music}
      content={d.content}
      mediaSlug={d.slug || slug}
      showExtras={false}
    />
  );
}
