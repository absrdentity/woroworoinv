import { Link, NavLink, useLocation } from 'react-router-dom';
import Icon from './Icon.jsx';
import { useAdmin } from '../lib/config.jsx';

export function Brand({ light = false }) {
  return (
    <Link className={`brand${light ? ' brand--light' : ''}`} to="/" aria-label="WoroWoroInv - Beranda">
      <span className="brand__mark">W</span>
      <span className="brand__text">
        WoroWoro<em>Inv</em>
      </span>
    </Link>
  );
}

function AdminBadge() {
  const { isAdmin } = useAdmin();
  if (!isAdmin) return null;
  return (
    <Link className="badge badge--admin" to="/admin" title="Anda login sebagai admin">
      <Icon name="flask" size={14} /> Mode Admin
    </Link>
  );
}

/** Header tampilan DESKTOP: bilah atas dengan menu teks. */
function DesktopHeader() {
  return (
    <header className="nav">
      <div className="container nav__in">
        <Brand />
        <nav className="nav__links" aria-label="Navigasi utama">
          <NavLink to="/" end>
            Beranda
          </NavLink>
          <NavLink to="/demo">Demo Live</NavLink>
          <NavLink to="/pesan">Pesan</NavLink>
        </nav>
        <div className="nav__end">
          <AdminBadge />
          <Link className="btn btn--sm" to="/pesan">
            Pesan Sekarang
          </Link>
        </div>
      </div>
    </header>
  );
}

/** Header tampilan MOBILE: bilah atas ringkas (menu ada di navigasi bawah). */
function MobileHeader() {
  return (
    <header className="mtop">
      <div className="mtop__in">
        <Brand />
        <AdminBadge />
      </div>
    </header>
  );
}

export function Header({ isMobile }) {
  return isMobile ? <MobileHeader /> : <DesktopHeader />;
}

/** Navigasi bawah (khusus mobile). Disembunyikan di halaman pesan karena punya bilah aksi sendiri. */
export function BottomNav() {
  const { isAdmin } = useAdmin();
  const { pathname } = useLocation();
  if (pathname.startsWith('/pesan')) return null;

  const items = [
    { to: '/', icon: 'home', label: 'Beranda', end: true },
    { to: '/demo', icon: 'eye', label: 'Demo' },
    { to: '/pesan', icon: 'card', label: 'Pesan' },
  ];
  if (isAdmin) items.push({ to: '/admin', icon: 'sliders', label: 'Admin' });

  return (
    <nav className="bnav" aria-label="Navigasi utama">
      {items.map((it) => (
        <NavLink key={it.to} to={it.to} end={it.end} className="bnav__item">
          <Icon name={it.icon} size={22} />
          <span>{it.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
