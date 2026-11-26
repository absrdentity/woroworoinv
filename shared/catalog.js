// ============================================================
// Katalog paket & fitur WoroWoroInv.
// File ini dipakai BERSAMA oleh frontend (src/) dan API (api/),
// sehingga harga & aturan fitur divalidasi ulang di server
// (user tidak bisa mengubah harga lewat browser).
// Ubah harga / fitur / kuota cukup di file ini.
// ============================================================

// `icon` = nama ikon SVG (lihat src/components/Icon.jsx)
export const FEATURES = [
  // ---- Tier 1 (mulai paket Basic) ----
  { id: 'countdown', tier: 1, icon: 'hourglass', visible: true, name: 'Hitung Mundur Acara', desc: 'Countdown real-time menuju hari H.' },
  { id: 'maps', tier: 1, icon: 'map-pin', visible: true, name: 'Peta Lokasi (Google Maps)', desc: 'Tombol navigasi langsung ke lokasi acara.' },
  { id: 'whatsapp_share', tier: 1, icon: 'whatsapp', visible: true, name: 'Bagikan via WhatsApp', desc: 'Tombol bagikan undangan dengan pesan siap kirim.' },
  { id: 'music', tier: 1, icon: 'music', visible: true, name: 'Musik Latar', desc: 'Lagu pilihan Anda mengalun saat undangan dibuka.' },
  { id: 'calendar', tier: 1, icon: 'calendar', visible: true, name: 'Simpan ke Kalender', desc: 'Tamu bisa menyimpan jadwal ke Google Calendar.' },

  // ---- Tier 2 (mulai paket Standard) ----
  { id: 'gallery', tier: 2, icon: 'image', visible: true, name: 'Galeri Foto', desc: 'Galeri hingga 6 foto prewedding / kenangan.' },
  { id: 'rsvp', tier: 2, icon: 'check-circle', visible: true, name: 'RSVP Konfirmasi Kehadiran', desc: 'Tamu konfirmasi hadir / tidak hadir langsung dari undangan.' },
  { id: 'guestname', tier: 2, icon: 'user', visible: true, name: 'Nama Tamu Personal', desc: 'Setiap tamu melihat namanya sendiri di cover (?to=Nama).' },
  { id: 'wishes', tier: 2, icon: 'message', visible: true, name: 'Buku Tamu & Ucapan', desc: 'Tamu menulis ucapan dan doa yang tampil di undangan.' },
  { id: 'love_story', tier: 2, icon: 'book', visible: true, name: 'Timeline Cerita', desc: 'Perjalanan cerita Anda dalam bentuk linimasa.' },

  // ---- Tier 3 (mulai paket Premium) ----
  { id: 'gift', tier: 3, icon: 'gift', visible: true, name: 'Amplop Digital', desc: 'Nomor rekening / e-wallet dengan tombol salin.' },
  { id: 'video', tier: 3, icon: 'video', visible: true, name: 'Video Embed', desc: 'Sematkan video prewedding dari YouTube.' },
  { id: 'livestream', tier: 3, icon: 'radio', visible: true, name: 'Link Live Streaming', desc: 'Tombol siaran langsung untuk tamu yang tidak bisa hadir.' },
  { id: 'qr_checkin', tier: 3, icon: 'qr', visible: true, name: 'QR Code Check-in Tamu', desc: 'QR unik per tamu untuk registrasi di lokasi.' },
  { id: 'dashboard', tier: 3, icon: 'chart', visible: false, name: 'Dashboard Tamu', desc: 'Pantau RSVP, ucapan, dan daftar tamu dalam satu dashboard.' },

  // ---- Tier 4 (khusus paket Exclusive) ----
  { id: 'custom_domain', tier: 4, icon: 'globe', visible: true, name: 'Custom Domain', desc: 'Undangan di domain sendiri (contoh: rakaayu.com).' },
  { id: 'multilang', tier: 4, icon: 'languages', visible: true, name: 'Multi Bahasa (ID/EN)', desc: 'Tamu bisa berganti bahasa Indonesia / Inggris.' },
  { id: 'broadcast', tier: 4, icon: 'megaphone', visible: false, name: 'Broadcast WhatsApp Massal', desc: 'Kirim undangan personal ke banyak tamu sekaligus.' },
  { id: 'priority', tier: 4, icon: 'zap', visible: false, name: 'Prioritas Pengerjaan 24 Jam', desc: 'Antrian prioritas dan revisi cepat dari tim kami.' },
];

// Harga di bawah ini hanya contoh. Silakan sesuaikan.
export const PACKAGES = [
  {
    id: 'basic',
    name: 'Basic',
    tier: 1,
    price: 99000,
    quota: 3,
    active: '30 hari',
    durationDays: 30,
    tagline: 'Sederhana, cepat, tetap rapi.',
    includes: ['Cover & detail acara', '1 tema pilihan', 'Link undangan otomatis (nama-anda)', 'Revisi 1x', 'Link aktif 30 hari'],
  },
  {
    id: 'standard',
    name: 'Standard',
    tier: 2,
    price: 199000,
    quota: 6,
    active: '3 bulan',
    durationDays: 90,
    popular: true,
    tagline: 'Paling banyak dipilih pasangan.',
    includes: ['Semua yang ada di Basic', 'Pilih dari 9 template', 'Revisi 3x', 'Link aktif 3 bulan'],
  },
  {
    id: 'premium',
    name: 'Premium',
    tier: 3,
    price: 349000,
    quota: 10,
    active: '6 bulan',
    durationDays: 180,
    tagline: 'Interaktif untuk tamu & tuan rumah.',
    includes: ['Semua yang ada di Standard', 'Penyesuaian warna & font', 'Revisi 5x', 'Link aktif 6 bulan'],
  },
  {
    id: 'exclusive',
    name: 'Exclusive',
    tier: 4,
    price: 599000,
    quota: FEATURES.length,
    active: '12 bulan',
    durationDays: 365,
    tagline: 'Semua fitur terbuka, tanpa batas.',
    includes: ['Semua yang ada di Premium', 'Akses semua fitur', 'Revisi hingga puas*', 'Link aktif 12 bulan'],
  },
];

/**
 * Template undangan. Setiap template punya tipografi, efek partikel, ornamen cover,
 * animasi kemunculan section dan efek nama sendiri (dirender oleh src/components/invitation/*).
 *  effect : petal | leaf | sparkle | star | bubble | heart | orb | confetti | shape
 *  cover  : blossom | leaves | frame | moon | waves | roses | aurora | balloons | geo
 *  reveal : rise | fade | zoom | blur | slide | flip | wipe | pop
 *  namesFx: rise | wipe | shimmer | glow | float | pulse | gradient | pop | track
 *  card   : soft | outline | glass | flat | solid
 */
export const THEMES = [
  {
    id: 'sakura',
    name: 'Sakura Blush',
    mood: 'Lembut & romantis',
    best: ['pernikahan', 'aqiqah'],
    effect: 'petal',
    effectLabel: 'Kelopak sakura berjatuhan',
    cover: 'blossom',
    reveal: 'rise',
    namesFx: 'rise',
    card: 'soft',
    fonts: { head: "'Cormorant Garamond', serif", body: "'Plus Jakarta Sans', sans-serif", name: "'Great Vibes', cursive" },
    vars: { bg: '#FFF4F6', ink: '#5A2A3A', accent: '#D0607F', soft: '#FBDCE3', line: '#F0C2CD', on: '#ffffff', grad: 'linear-gradient(180deg,#FFE3EA 0%,#FFF4F6 70%)', fx: ['#F7A8BC', '#FBC4D2', '#F28BA6', '#FFD6E0'] },
  },
  {
    id: 'rustic',
    name: 'Rustic Sage',
    mood: 'Alami & hangat',
    best: ['pernikahan', 'khitanan', 'aqiqah'],
    effect: 'leaf',
    effectLabel: 'Dedaunan melayang',
    cover: 'leaves',
    reveal: 'fade',
    namesFx: 'wipe',
    card: 'outline',
    fonts: { head: "'Playfair Display', serif", body: "'Plus Jakarta Sans', sans-serif", name: "'Caveat', cursive" },
    vars: { bg: '#F5EFE3', ink: '#3A3A2C', accent: '#6B7A4F', soft: '#E4E9D6', line: '#CFD5BD', on: '#ffffff', grad: 'linear-gradient(180deg,#EBE6D2 0%,#F5EFE3 75%)', fx: ['#8FA06A', '#6B7A4F', '#A9B586', '#B89B5E'] },
  },
  {
    id: 'royal',
    name: 'Royal Gold',
    mood: 'Mewah & elegan',
    best: ['pernikahan', 'ulangtahun'],
    effect: 'sparkle',
    effectLabel: 'Kilau emas berkelip',
    cover: 'frame',
    reveal: 'zoom',
    namesFx: 'shimmer',
    card: 'outline',
    fonts: { head: "'Cinzel', serif", body: "'Plus Jakarta Sans', sans-serif", name: "'Cinzel', serif" },
    vars: { bg: '#1D1511', ink: '#F4E8D0', accent: '#C9A24B', soft: '#2D211B', line: '#5A4630', on: '#1D1511', grad: 'radial-gradient(120% 80% at 50% 0%,#3A2A1E 0%,#1D1511 70%)', fx: ['#F2D27A', '#C9A24B', '#FFE9A8', '#E6BE5C'] },
  },
  {
    id: 'midnight',
    name: 'Midnight Navy',
    mood: 'Tenang & syahdu',
    best: ['pernikahan', 'khitanan'],
    effect: 'star',
    effectLabel: 'Bintang berkelip & meteor',
    cover: 'moon',
    reveal: 'blur',
    namesFx: 'glow',
    card: 'glass',
    fonts: { head: "'Cormorant Garamond', serif", body: "'Plus Jakarta Sans', sans-serif", name: "'Cormorant Garamond', serif" },
    vars: { bg: '#101C34', ink: '#E9EFFA', accent: '#7FB0FF', soft: '#1C2D4F', line: '#2F4573', on: '#0B1426', grad: 'linear-gradient(180deg,#0A1226 0%,#16284A 100%)', fx: ['#FFFFFF', '#CFE0FF', '#9CC2FF', '#FFF3C4'] },
  },
  {
    id: 'ocean',
    name: 'Ocean Breeze',
    mood: 'Segar & ceria',
    best: ['aqiqah', 'khitanan', 'ulangtahun'],
    effect: 'bubble',
    effectLabel: 'Gelembung & ombak bergerak',
    cover: 'waves',
    reveal: 'slide',
    namesFx: 'float',
    card: 'soft',
    fonts: { head: "'Quicksand', sans-serif", body: "'Plus Jakarta Sans', sans-serif", name: "'Quicksand', sans-serif" },
    vars: { bg: '#EAF7FA', ink: '#12424F', accent: '#1593A8', soft: '#CDEEF3', line: '#A9DDE6', on: '#ffffff', grad: 'linear-gradient(180deg,#D4F1F6 0%,#EAF7FA 70%)', fx: ['#7CD3E2', '#B5E8F0', '#4DB9CD', '#FFFFFF'] },
  },
  {
    id: 'romance',
    name: 'Rose Romance',
    mood: 'Hangat & penuh cinta',
    best: ['pernikahan'],
    effect: 'heart',
    effectLabel: 'Hati melayang naik',
    cover: 'roses',
    reveal: 'flip',
    namesFx: 'pulse',
    card: 'soft',
    fonts: { head: "'Playfair Display', serif", body: "'Plus Jakarta Sans', sans-serif", name: "'Great Vibes', cursive" },
    vars: { bg: '#3A0F1F', ink: '#FFE6EB', accent: '#FF7A93', soft: '#531A2D', line: '#7A2E45', on: '#3A0F1F', grad: 'radial-gradient(110% 80% at 50% 10%,#6A1F38 0%,#3A0F1F 72%)', fx: ['#FF7A93', '#FF9DB0', '#FFB8C6', '#E5486B'] },
  },
  {
    id: 'aurora',
    name: 'Aurora Glow',
    mood: 'Modern & memukau',
    best: ['pernikahan', 'ulangtahun', 'khitanan'],
    effect: 'orb',
    effectLabel: 'Cahaya aurora mengalir',
    cover: 'aurora',
    reveal: 'wipe',
    namesFx: 'gradient',
    card: 'glass',
    fonts: { head: "'Syne', sans-serif", body: "'Plus Jakarta Sans', sans-serif", name: "'Syne', sans-serif" },
    vars: { bg: '#0F1226', ink: '#EEF0FF', accent: '#A78BFA', soft: '#1A1E3F', line: '#3A3F7A', on: '#0F1226', grad: 'linear-gradient(180deg,#0B0E22 0%,#141838 100%)', fx: ['#7C5CFF', '#2DD4BF', '#F472B6', '#60A5FA'] },
  },
  {
    id: 'confetti',
    name: 'Confetti Party',
    mood: 'Meriah & penuh warna',
    best: ['ulangtahun', 'khitanan', 'aqiqah'],
    effect: 'confetti',
    effectLabel: 'Konfeti & balon',
    cover: 'balloons',
    reveal: 'pop',
    namesFx: 'pop',
    card: 'solid',
    fonts: { head: "'Fredoka', sans-serif", body: "'Plus Jakarta Sans', sans-serif", name: "'Fredoka', sans-serif" },
    vars: { bg: '#FFF9EC', ink: '#2F2A55', accent: '#F2557A', soft: '#FFEBC2', line: '#FFD98A', on: '#ffffff', grad: 'linear-gradient(180deg,#FFF1CF 0%,#FFF9EC 70%)', fx: ['#F2557A', '#FFB300', '#2EC4B6', '#6C63FF', '#FF8A3D'] },
  },
  {
    id: 'minimal',
    name: 'Mono Minimal',
    mood: 'Bersih & modern',
    best: ['pernikahan', 'ulangtahun'],
    effect: 'shape',
    effectLabel: 'Bentuk geometris melayang',
    cover: 'geo',
    reveal: 'rise',
    namesFx: 'track',
    card: 'flat',
    fonts: { head: "'DM Serif Display', serif", body: "'Jost', sans-serif", name: "'DM Serif Display', serif" },
    vars: { bg: '#F4F2EE', ink: '#1E1E1E', accent: '#1E1E1E', soft: '#E7E4DD', line: '#CFCAC0', on: '#F4F2EE', grad: 'linear-gradient(180deg,#ECE9E2 0%,#F4F2EE 70%)', fx: ['#1E1E1E', '#8A857A', '#C7B79A', '#B3472F'] },
  },
];

export const EVENT_TYPES = [
  { id: 'pernikahan', name: 'Pernikahan', title: 'The Wedding of', double: true },
  { id: 'khitanan', name: 'Khitanan', title: 'Undangan Khitanan', double: false },
  { id: 'aqiqah', name: 'Aqiqah', title: 'Undangan Aqiqah', double: false },
  { id: 'ulangtahun', name: 'Ulang Tahun', title: 'Undangan Ulang Tahun', double: false },
];

// ---------- helper ----------
export const formatIDR = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');

export const getPackage = (id) => PACKAGES.find((p) => p.id === id);
export const getFeature = (id) => FEATURES.find((f) => f.id === id);
export const tierName = (tier) => PACKAGES.find((p) => p.tier === tier)?.name ?? '';

/** Paket termurah yang cukup untuk daftar fitur tertentu. */
export function recommendPackage(featureIds) {
  const feats = featureIds.map(getFeature).filter(Boolean);
  const maxTier = feats.reduce((m, f) => Math.max(m, f.tier), 1);
  return (
    PACKAGES.find((p) => p.tier >= maxTier && p.quota >= feats.length) ?? PACKAGES[PACKAGES.length - 1]
  );
}

/** Validasi paket + fitur + tema + jenis acara. Dipakai di client DAN server. */
export function validateSelection({ packageId, features, theme, eventType }) {
  const pkg = getPackage(packageId);
  if (!pkg) return { ok: false, error: 'Paket tidak valid.' };
  if (!Array.isArray(features)) return { ok: false, error: 'Daftar fitur tidak valid.' };

  const unique = [...new Set(features)];
  for (const id of unique) {
    const f = getFeature(id);
    if (!f) return { ok: false, error: 'Ada fitur yang tidak dikenali.' };
    if (f.tier > pkg.tier) {
      return { ok: false, error: `Fitur "${f.name}" membutuhkan paket ${tierName(f.tier)} atau lebih tinggi.` };
    }
  }
  if (unique.length > pkg.quota) {
    return { ok: false, error: `Paket ${pkg.name} maksimal ${pkg.quota} fitur pilihan.` };
  }
  if (!THEMES.some((t) => t.id === theme)) return { ok: false, error: 'Tema tidak valid.' };
  if (!EVENT_TYPES.some((e) => e.id === eventType)) return { ok: false, error: 'Jenis acara tidak valid.' };

  return { ok: true, pkg, features: unique };
}

export function validateCustomer({ name, email, phone } = {}) {
  const n = String(name ?? '').trim();
  const e = String(email ?? '').trim();
  const p = String(phone ?? '').replace(/[\s-]/g, '');
  if (n.length < 2) return 'Nama pemesan minimal 2 karakter.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e)) return 'Format email tidak valid.';
  if (!/^(\+62|62|0)8[0-9]{8,12}$/.test(p)) return 'Nomor WhatsApp tidak valid (contoh: 08123456789).';
  return null;
}

/** Teks durasi aktif link undangan, mis. "3 bulan". */
export const durationLabel = (pkg) => (pkg && pkg.active) || '';

/** Membuat slug link dari nama pemilik undangan: "Raka" & "Ayu" -> "raka-ayu". */
export function slugify(...names) {
  const base = names
    .filter(Boolean)
    .join(' ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
    .replace(/-+$/g, '');
  return base || 'undangan';
}
