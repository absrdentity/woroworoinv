import { Link } from 'react-router-dom';
import { ADMIN_WA } from '../lib/config.js';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__in">
        <div>
          <div className="brand brand--footer">
            <span className="brand__mark">W</span>
            <span className="brand__text">
              WoroWoro<em>Inv</em>
            </span>
          </div>
          <p className="muted small">
            “Woro-woro” berarti mengabarkan. Kami membantu Anda mengabarkan hari bahagia, secara digital.
          </p>
        </div>
        <div className="footer__col">
          <strong>Jelajahi</strong>
          <Link to="/">Beranda</Link>
          <Link to="/demo">Demo Live</Link>
          <Link to="/pesan">Pesan Undangan</Link>
        </div>
        <div className="footer__col">
          <strong>Kontak</strong>
          <a href={`https://wa.me/${ADMIN_WA}`} target="_blank" rel="noreferrer">
            WhatsApp Admin
          </a>
          <span className="muted small">Pembayaran aman via Midtrans</span>
        </div>
      </div>
      <div className="container footer__copy">© {new Date().getFullYear()} WoroWoroInv. Seluruh hak cipta dilindungi.</div>
    </footer>
  );
}
