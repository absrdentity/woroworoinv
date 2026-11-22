import { Link } from 'react-router-dom';
import Icon from './Icon.jsx';
import { Brand } from './Navbar.jsx';
import { useConfig } from '../lib/config.jsx';

export default function Footer({ isMobile }) {
  const { adminWhatsapp } = useConfig();
  const year = new Date().getFullYear();

  if (isMobile) {
    return (
      <footer className="footer footer--compact">
        <div className="container">
          <Brand light />
          <p className="footer__note">Mengabarkan hari bahagia Anda, secara digital.</p>
          {adminWhatsapp && (
            <a className="btn btn--light btn--block" href={`https://wa.me/${adminWhatsapp}`} target="_blank" rel="noreferrer">
              <Icon name="whatsapp" size={18} /> Hubungi Admin
            </a>
          )}
          <p className="footer__copy">
            © {year} WoroWoroInv · <Link to="/admin">Admin</Link>
          </p>
        </div>
      </footer>
    );
  }

  return (
    <footer className="footer">
      <div className="container footer__in">
        <div>
          <Brand light />
          <p className="footer__note">
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
          {adminWhatsapp && (
            <a href={`https://wa.me/${adminWhatsapp}`} target="_blank" rel="noreferrer">
              WhatsApp Admin
            </a>
          )}
          <span className="footer__note">
            <Icon name="shield" size={14} /> Pembayaran aman via Midtrans
          </span>
        </div>
      </div>
      <div className="container footer__bar">
        <span>© {year} WoroWoroInv. Seluruh hak cipta dilindungi.</span>
        <Link to="/admin">Admin</Link>
      </div>
    </footer>
  );
}
