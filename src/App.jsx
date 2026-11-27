import { useEffect, useState } from 'react';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import { BottomNav, Header } from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import Demo from './pages/Demo.jsx';
import Order from './pages/Order.jsx';
import Success from './pages/Success.jsx';
import Admin from './pages/Admin.jsx';
import Invite from './pages/Invite.jsx';
import Manage from './pages/Manage.jsx';
import { useIsMobile } from './hooks/useMediaQuery.js';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function NotFound() {
  return (
    <div className="container page-center">
      <h1>Halaman tidak ditemukan</h1>
      <p className="muted">Alamat yang Anda tuju tidak tersedia.</p>
      <Link className="btn" to="/">
        Kembali ke Beranda
      </Link>
    </div>
  );
}

/** Domain kustom pelanggan (mis. rakaayu.com): alamat utama (/) menampilkan undangannya. */
function useCustomDomain(pathname) {
  const host = typeof window === 'undefined' ? '' : window.location.hostname.toLowerCase();
  const skip = pathname !== '/' || !host || host === 'localhost' || /^[\d.]+$/.test(host) || host.endsWith('.vercel.app');
  const key = `wwi:dom:${host}`;
  const known = (() => {
    try {
      return sessionStorage.getItem(key);
    } catch {
      return null;
    }
  })();
  const [state, setState] = useState(skip || known === 'no' ? 'no' : 'check');
  useEffect(() => {
    if (state !== 'check') return undefined;
    let off = false;
    fetch(`/api/invite?domain=${encodeURIComponent(host)}`)
      .then((r) => {
        const v = r.status === 200 || r.status === 410 ? 'yes' : 'no';
        try {
          sessionStorage.setItem(key, v);
        } catch {
          /* abaikan */
        }
        if (!off) setState(v);
      })
      .catch(() => !off && setState('no'));
    return () => {
      off = true;
    };
  }, [state, host, key]);
  return { state, host };
}

export default function App() {
  // Dua tampilan terpisah: DESKTOP (> 820px) dan MOBILE (<= 820px)
  const isMobile = useIsMobile();
  const { pathname } = useLocation();
  const isInvite = pathname.startsWith('/u/');
  const custom = useCustomDomain(pathname);
  const showBottomNav = isMobile && !isInvite && !pathname.startsWith('/pesan');

  // Halaman undangan milik pelanggan: layar penuh, tanpa header/footer situs
  if (isInvite) return <Invite />;
  if (custom.state === 'check') return <div className="invite-state"><p>Memuat…</p></div>;
  if (custom.state === 'yes') return <Invite domain={custom.host.replace(/^www\./, '')} />;

  return (
    <div className={`app ${isMobile ? 'is-mobile' : 'is-desktop'}${showBottomNav ? ' has-bottomnav' : ''}`}>
      <ScrollToTop />
      <Header isMobile={isMobile} />
      <main>
        <Routes>
          <Route path="/" element={<Home isMobile={isMobile} />} />
          <Route path="/demo" element={<Demo isMobile={isMobile} />} />
          <Route path="/pesan" element={<Order isMobile={isMobile} />} />
          <Route path="/sukses" element={<Success />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/kelola/*" element={<Manage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer isMobile={isMobile} />
      {isMobile && <BottomNav />}
    </div>
  );
}
