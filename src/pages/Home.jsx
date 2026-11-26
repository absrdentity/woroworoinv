import { Link } from 'react-router-dom';
import { PACKAGES, FEATURES, THEMES, formatIDR, tierName } from '../../shared/catalog.js';
import InvitationPreview from '../components/InvitationPreview.jsx';
import Icon from '../components/Icon.jsx';
import { MiniCover } from '../components/order/Pickers.jsx';

const HERO_FEATURES = ['countdown', 'maps', 'calendar', 'gallery', 'rsvp', 'guestname', 'wishes', 'music'];

const TRUST = [
  { icon: 'shield', t: 'Pembayaran aman', d: 'Diproses Midtrans' },
  { icon: 'eye', t: 'Demo gratis', d: 'Coba sebelum bayar' },
  { icon: 'clock', t: 'Selesai 1–2 hari', d: 'Setelah data lengkap' },
  { icon: 'sliders', t: 'Fitur pilih sendiri', d: 'Sesuai kebutuhan' },
];

const STEPS = [
  { icon: 'package', t: 'Pilih paket', d: 'Semakin tinggi paket, semakin banyak fitur yang bisa Anda pilih.' },
  { icon: 'sliders', t: 'Racik fitur sendiri', d: 'Centang fitur yang diinginkan dan lihat hasilnya langsung di pratinjau.' },
  { icon: 'card', t: 'Bayar via Midtrans', d: 'QRIS, Virtual Account, e-wallet, atau kartu. Aman dan otomatis.' },
  { icon: 'mail', t: 'Undangan siap dibagikan', d: 'Kirim detail acara, tim kami menyiapkan undangan dalam 1–2 hari kerja.' },
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

function PackageCard({ p }) {
  return (
    <article className={`pkg${p.popular ? ' pkg--popular' : ''}`}>
      {p.popular && <span className="pkg__flag">Paling populer</span>}
      <h3>{p.name}</h3>
      <p className="muted pkg__tag">{p.tagline}</p>
      <div className="pkg__price">{formatIDR(p.price)}</div>
      <div className="pkg__quota">
        {p.quota >= FEATURES.length ? `Semua ${FEATURES.length} fitur` : `Pilih hingga ${p.quota} fitur`}
      </div>
      <p className="pkg__dur">
        <Icon name="clock" size={14} /> Link undangan aktif <b>{p.active}</b>
      </p>
      <p className="small muted">Akses fitur level 1{p.tier > 1 ? `–${p.tier}` : ''}</p>
      <ul className="pkg__list">
        {p.includes.map((i) => (
          <li key={i}>
            <Icon name="check" size={16} strokeWidth={2.4} />
            <span>{i}</span>
          </li>
        ))}
      </ul>
      <Link className={`btn btn--block${p.popular ? '' : ' btn--ghost'}`} to={`/pesan?paket=${p.id}`}>
        Pilih {p.name}
      </Link>
    </article>
  );
}

function FeatureItem({ f }) {
  return (
    <div className="feat">
      <span className="feat__icon">
        <Icon name={f.icon} size={20} />
      </span>
      <div>
        <strong>{f.name}</strong>
        <p>{f.desc}</p>
      </div>
    </div>
  );
}

export default function Home({ isMobile }) {
  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="hero">
        <div className="container hero__in">
          <div className="hero__copy">
            <span className="eyebrow">Undangan digital untuk setiap momen</span>
            <h1>
              Kabarkan bahagiamu,
              <br />
              <em>woro-woro</em> secara digital.
            </h1>
            <p className="lead">
              Pilih paket, racik fitur undangan sesuai keinginan, lihat hasilnya lewat demo live, lalu bayar dengan mudah.
              Tanpa cetak, tanpa ribet, tetap berkesan.
            </p>
            <div className="hero__cta">
              <Link className="btn" to="/demo">
                Coba Demo Live <Icon name="arrow-right" size={18} />
              </Link>
              <a className="btn btn--ghost" href="#paket">
                Lihat Paket
              </a>
            </div>
            {!isMobile && (
              <ul className="hero__points">
                <li>
                  <Icon name="check" size={16} strokeWidth={2.4} /> Pernikahan, khitanan, aqiqah, ulang tahun
                </li>
                <li>
                  <Icon name="check" size={16} strokeWidth={2.4} /> Demo langsung sebelum bayar
                </li>
                <li>
                  <Icon name="check" size={16} strokeWidth={2.4} /> Pembayaran via Midtrans
                </li>
              </ul>
            )}
          </div>
          <div className="hero__demo">
            <InvitationPreview
              features={HERO_FEATURES}
              themeId="sakura"
              guest="Keluarga Besar Anda"
              height={isMobile ? 520 : 600}
            />
          </div>
        </div>
      </section>

      {/* ---------- Strip kepercayaan ---------- */}
      <section className="trust">
        <div className="container trust__in">
          {TRUST.map((t) => (
            <div className="trust__item" key={t.t}>
              <span className="trust__icon">
                <Icon name={t.icon} size={20} />
              </span>
              <div>
                <strong>{t.t}</strong>
                <span>{t.d}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Galeri template ---------- */}
      <section className="section" id="template">
        <div className="container">
          <div className="section__head">
            <span className="eyebrow">Template</span>
            <h2>{THEMES.length} template, masing-masing dengan efek sendiri</h2>
            <p className="muted">
              Kelopak berjatuhan, kilau emas, bintang berkelip, gelembung, konfeti, dan lainnya. Klik untuk mencoba di demo.
            </p>
          </div>
          <div className="tpl-grid tpl-grid--gallery">
            {THEMES.map((t) => (
              <Link key={t.id} to={`/demo?tema=${t.id}`} className="tpl">
                <MiniCover theme={t} />
                <span className="tpl__meta">
                  <strong>{t.name}</strong>
                  <small>{t.mood}</small>
                  <small className="tpl__fx">
                    <Icon name="sparkles" size={11} /> {t.effectLabel}
                  </small>
                </span>
              </Link>
            ))}
          </div>
          {!isMobile && (
            <div className="tpl-desktop">
              <div className="tpl-desktop__copy">
                <span className="eyebrow">Dua tampilan</span>
                <h3>Nyaman dibuka di ponsel maupun desktop</h3>
                <p className="muted">
                  Tamu yang membuka lewat laptop melihat tata letak dua kolom: cover tetap di kiri, isi undangan bergulir di kanan.
                </p>
                <Link className="btn btn--ghost" to="/demo?tema=royal&tampilan=desktop">
                  <Icon name="monitor" size={16} /> Lihat versi desktop
                </Link>
              </div>
              <InvitationPreview features={HERO_FEATURES} themeId="royal" guest="Keluarga Besar Anda" device="desktop" />
            </div>
          )}
        </div>
      </section>

      {/* ---------- Cara pesan ---------- */}
      <section className="section">
        <div className="container">
          <div className="section__head">
            <span className="eyebrow">Cara pesan</span>
            <h2>Empat langkah, undangan siap</h2>
          </div>
          <div className="steps">
            {STEPS.map((s, i) => (
              <div className="step" key={s.t}>
                <span className="step__n">{i + 1}</span>
                <div className="step__body">
                  <h3>{s.t}</h3>
                  <p>{s.d}</p>
                </div>
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
        </div>
        <div className={isMobile ? 'pkg-scroll' : 'container'}>
          <div className="pkg-grid">
            {PACKAGES.map((p) => (
              <PackageCard key={p.id} p={p} />
            ))}
          </div>
        </div>
        <div className="container">
          <p className="small muted center pkg-note">* Revisi wajar sesuai ketentuan layanan. Harga contoh, dapat disesuaikan.</p>
        </div>
      </section>

      {/* ---------- Katalog fitur ---------- */}
      <section className="section">
        <div className="container">
          <div className="section__head">
            <span className="eyebrow">Katalog fitur</span>
            <h2>Racik undangan sesuai kebutuhan</h2>
            <p className="muted">Fitur dikelompokkan berdasarkan paket minimal yang dibutuhkan.</p>
          </div>

          {[1, 2, 3, 4].map((tier) => {
            const list = FEATURES.filter((f) => f.tier === tier);
            return isMobile ? (
              <details className="acc" key={tier} open={tier === 1}>
                <summary className="acc__sum">
                  <span>
                    Mulai paket <b>{tierName(tier)}</b>
                  </span>
                  <span className="acc__count">{list.length} fitur</span>
                  <Icon name="chevron-down" size={18} className="acc__chev" />
                </summary>
                <div className="feat-grid">
                  {list.map((f) => (
                    <FeatureItem f={f} key={f.id} />
                  ))}
                </div>
              </details>
            ) : (
              <div className="tier" key={tier}>
                <h3 className="tier__title">
                  Mulai paket <span>{tierName(tier)}</span>
                </h3>
                <div className="feat-grid">
                  {list.map((f) => (
                    <FeatureItem f={f} key={f.id} />
                  ))}
                </div>
              </div>
            );
          })}

          <div className="center">
            <Link className="btn" to="/demo">
              Coba semua fitur di Demo Live
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- FAQ ---------- */}
      <section className="section section--tint" id="faq">
        <div className="container container--narrow">
          <div className="section__head">
            <span className="eyebrow">FAQ</span>
            <h2>Pertanyaan yang sering diajukan</h2>
          </div>
          <div className="faq">
            {FAQ.map((f) => (
              <details key={f.q}>
                <summary>
                  {f.q}
                  <Icon name="chevron-down" size={18} className="faq__chev" />
                </summary>
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
            Mulai Pesan <Icon name="arrow-right" size={18} />
          </Link>
        </div>
      </section>
    </>
  );
}
