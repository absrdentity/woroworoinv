import { Link } from 'react-router-dom';
import { PACKAGES, FEATURES, formatIDR, tierName } from '../../shared/catalog.js';
import InvitationPreview from '../components/InvitationPreview.jsx';

const HERO_FEATURES = ['countdown', 'maps', 'calendar', 'gallery', 'rsvp', 'guestname', 'wishes', 'music'];

const STEPS = [
  { n: '1', t: 'Pilih paket', d: 'Semakin tinggi paket, semakin banyak fitur yang bisa Anda pilih.' },
  { n: '2', t: 'Racik fitur sendiri', d: 'Centang fitur yang Anda mau dan lihat hasilnya langsung di pratinjau.' },
  { n: '3', t: 'Bayar via Midtrans', d: 'QRIS, Virtual Account, e-wallet, atau kartu — aman & otomatis.' },
  { n: '4', t: 'Undangan siap dibagikan', d: 'Kirim detail acara, tim kami menyiapkan undangan Anda dalam 1–2 hari kerja.' },
];

const FAQ = [
  {
    q: 'Bagaimana cara kerja pemilihan fitur?',
    a: 'Setiap paket punya kuota fitur pilihan dan tingkat akses fitur. Paket Basic bisa memilih 3 fitur dasar, sedangkan Exclusive membuka seluruh fitur tanpa batas kuota. Anda bebas memilih fitur mana pun yang tersedia di paket Anda.',
  },
  {
    q: 'Metode pembayaran apa saja yang tersedia?',
    a: 'Pembayaran diproses oleh Midtrans, sehingga Anda dapat membayar menggunakan metode yang tersedia seperti QRIS, transfer Virtual Account, e-wallet, atau kartu. Kami tidak menyimpan data kartu atau akun e-wallet Anda.',
  },
  {
    q: 'Berapa lama undangan selesai dibuat?',
    a: 'Umumnya 1–2 hari kerja setelah pembayaran dan data acara lengkap kami terima. Paket Exclusive mendapat prioritas pengerjaan 24 jam.',
  },
  {
    q: 'Bisa upgrade paket setelah memesan?',
    a: 'Bisa. Hubungi admin via WhatsApp dan cukup bayar selisih harga paket.',
  },
  {
    q: 'Apakah saya bisa mencoba dulu?',
    a: 'Tentu. Buka halaman Demo Live, aktifkan fitur apa pun, dan lihat langsung bagaimana undangan Anda akan terlihat sebelum memesan.',
  },
];

export default function Home() {
  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="hero">
        <div className="container hero__in">
          <div className="hero__copy">
            <span className="eyebrow">Undangan Digital · Pernikahan · Khitanan · Aqiqah · Ulang Tahun</span>
            <h1>
              Kabarkan bahagiamu,
              <br />
              <em>woro-woro</em> secara digital.
            </h1>
            <p className="lead">
              Pilih paket, racik fitur undangan sesuai keinginan Anda, lihat hasilnya lewat demo live, lalu bayar dengan
              mudah. Tanpa ribet, tanpa cetak, tetap berkesan.
            </p>
            <div className="hero__cta">
              <Link className="btn" to="/demo">
                Coba Demo Live
              </Link>
              <a className="btn btn--ghost" href="#paket">
                Lihat Paket
              </a>
            </div>
            <ul className="hero__points">
              <li>✓ Fitur pilih sendiri</li>
              <li>✓ Demo langsung sebelum bayar</li>
              <li>✓ Pembayaran via Midtrans</li>
            </ul>
          </div>
          <div className="hero__demo">
            <InvitationPreview features={HERO_FEATURES} themeId="sakura" guest="Keluarga Besar Anda" height={600} />
          </div>
        </div>
      </section>

      {/* ---------- Cara kerja ---------- */}
      <section className="section">
        <div className="container">
          <div className="section__head">
            <span className="eyebrow">Cara Pesan</span>
            <h2>Empat langkah, undangan siap</h2>
          </div>
          <div className="steps">
            {STEPS.map((s) => (
              <div className="step" key={s.n}>
                <span className="step__n">{s.n}</span>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Paket ---------- */}
      <section className="section section--tint" id="paket">
        <div className="container">
          <div className="section__head">
            <span className="eyebrow">Paket</span>
            <h2>Semakin tinggi paket, semakin bebas memilih fitur</h2>
            <p className="muted">Harga sudah termasuk semua fitur yang Anda pilih sesuai kuota paket.</p>
          </div>
          <div className="pkg-grid">
            {PACKAGES.map((p) => (
              <article className={`pkg ${p.popular ? 'pkg--popular' : ''}`} key={p.id}>
                {p.popular && <span className="pkg__flag">Paling Populer</span>}
                <h3>{p.name}</h3>
                <p className="muted">{p.tagline}</p>
                <div className="pkg__price">{formatIDR(p.price)}</div>
                <div className="pkg__quota">
                  {p.quota >= FEATURES.length ? `Semua ${FEATURES.length} fitur` : `Pilih hingga ${p.quota} fitur`}
                </div>
                <p className="small muted">
                  Akses fitur level 1{p.tier > 1 ? `–${p.tier}` : ''} · aktif {p.active}
                </p>
                <ul className="pkg__list">
                  {p.includes.map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
                <Link className={`btn ${p.popular ? '' : 'btn--ghost'} btn--block`} to={`/pesan?paket=${p.id}`}>
                  Pilih {p.name}
                </Link>
              </article>
            ))}
          </div>
          <p className="small muted center">* Revisi wajar sesuai ketentuan layanan. Harga contoh, dapat disesuaikan.</p>
        </div>
      </section>

      {/* ---------- Katalog fitur ---------- */}
      <section className="section">
        <div className="container">
          <div className="section__head">
            <span className="eyebrow">Katalog Fitur</span>
            <h2>Racik undangan sesuai kebutuhan</h2>
            <p className="muted">Fitur dikelompokkan berdasarkan paket minimal yang dibutuhkan.</p>
          </div>
          {[1, 2, 3, 4].map((tier) => (
            <div className="tier" key={tier}>
              <h3 className="tier__title">
                Mulai paket <span>{tierName(tier)}</span>
              </h3>
              <div className="feat-grid">
                {FEATURES.filter((f) => f.tier === tier).map((f) => (
                  <div className="feat" key={f.id}>
                    <span className="feat__icon">{f.icon}</span>
                    <div>
                      <strong>{f.name}</strong>
                      <p>{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div className="center">
            <Link className="btn" to="/demo">
              Coba Semua Fitur di Demo Live
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- FAQ ---------- */}
      <section className="section section--tint">
        <div className="container container--narrow">
          <div className="section__head">
            <span className="eyebrow">FAQ</span>
            <h2>Pertanyaan yang sering ditanyakan</h2>
          </div>
          <div className="faq">
            {FAQ.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="cta">
        <div className="container center">
          <h2>Siap mengabarkan hari bahagia Anda?</h2>
          <p>Mulai racik undangan Anda sekarang. Demo gratis, bayar hanya jika sudah cocok.</p>
          <Link className="btn btn--gold" to="/pesan">
            Mulai Pesan
          </Link>
        </div>
      </section>
    </>
  );
}
