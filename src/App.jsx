import { useEffect } from 'react';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import { BottomNav, Header } from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import Demo from './pages/Demo.jsx';
import Order from './pages/Order.jsx';
import Success from './pages/Success.jsx';
import Admin from './pages/Admin.jsx';
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

export default function App() {
  // Dua tampilan terpisah: DESKTOP (> 820px) dan MOBILE (<= 820px)
  const isMobile = useIsMobile();
  const { pathname } = useLocation();
  const showBottomNav = isMobile && !pathname.startsWith('/pesan');

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
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer isMobile={isMobile} />
      {isMobile && <BottomNav />}
    </div>
  );
}
