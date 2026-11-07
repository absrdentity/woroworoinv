import { useEffect } from 'react';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import Demo from './pages/Demo.jsx';
import Order from './pages/Order.jsx';
import Success from './pages/Success.jsx';

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
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/demo" element={<Demo />} />
          <Route path="/pesan" element={<Order />} />
          <Route path="/sukses" element={<Success />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
