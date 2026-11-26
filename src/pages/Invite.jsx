import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import InvitationPreview from '../components/InvitationPreview.jsx';
import Icon from '../components/Icon.jsx';

/** slug dari alamat /u/<slug> */
const slugFromPath = (pathname) => decodeURIComponent((pathname.split('/')[2] || '').toLowerCase());

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
export default function Invite() {
  const { pathname, search } = useLocation();
  const slug = slugFromPath(pathname);
  const guest = useMemo(() => (new URLSearchParams(search).get('to') || '').slice(0, 60), [search]);
  const [st, setSt] = useState({ loading: true, code: 0, data: null });

  useEffect(() => {
    let off = false;
    setSt({ loading: true, code: 0, data: null });
    fetch(`/api/invite?slug=${encodeURIComponent(slug)}`)
      .then(async (r) => ({ code: r.status, data: await r.json().catch(() => ({})) }))
      .then((x) => !off && setSt({ loading: false, ...x }))
      .catch(() => !off && setSt({ loading: false, code: 0, data: null }));
    return () => {
      off = true;
    };
  }, [slug]);

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
            sendWish: (name, message) => post(slug, { type: 'wish', name, message }),
            sendRsvp: (name, attend) => post(slug, { type: 'rsvp', name, attend }),
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
      mediaSlug={slug}
      showExtras={false}
    />
  );
}
