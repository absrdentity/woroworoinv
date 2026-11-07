import { Link, NavLink } from 'react-router-dom';

export default function Navbar() {
  return (
    <header className="nav">
      <div className="container nav__in">
        <Link className="brand" to="/" aria-label="WoroWoroInv - Beranda">
          <span className="brand__mark">W</span>
          <span className="brand__text">
            WoroWoro<em>Inv</em>
          </span>
        </Link>
        <nav className="nav__links" aria-label="Navigasi utama">
          <NavLink to="/" end>
            Beranda
          </NavLink>
          <NavLink to="/demo">Demo Live</NavLink>
          <NavLink to="/pesan">Pesan</NavLink>
        </nav>
        <Link className="btn btn--sm" to="/pesan">
          Pesan Sekarang
        </Link>
      </div>
    </header>
  );
}
