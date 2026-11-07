// ============================================================
// Katalog paket & fitur WoroWoroInv.
// File ini dipakai BERSAMA oleh frontend (src/) dan API (api/),
// sehingga harga & aturan fitur divalidasi ulang di server
// (user tidak bisa mengubah harga lewat browser).
// Ubah harga / fitur / kuota cukup di file ini.
// ============================================================

export const FEATURES = [
  // ---- Tier 1 (mulai paket Basic) ----
  { id: 'countdown', tier: 1, icon: '⏳', visible: true, name: 'Hitung Mundur Acara', desc: 'Countdown real-time menuju hari H.' },
  { id: 'maps', tier: 1, icon: '📍', visible: true, name: 'Peta Lokasi (Google Maps)', desc: 'Tombol navigasi langsung ke lokasi acara.' },
  { id: 'whatsapp_share', tier: 1, icon: '💬', visible: true, name: 'Bagikan via WhatsApp', desc: 'Tombol bagikan undangan dengan pesan siap kirim.' },
  { id: 'music', tier: 1, icon: '🎵', visible: true, name: 'Musik Latar', desc: 'Lagu pilihan Anda mengalun saat undangan dibuka.' },
  { id: 'calendar', tier: 1, icon: '🗓️', visible: true, name: 'Simpan ke Kalender', desc: 'Tamu bisa menyimpan jadwal ke Google Calendar.' },

  // ---- Tier 2 (mulai paket Standard) ----
  { id: 'gallery', tier: 2, icon: '🖼️', visible: true, name: 'Galeri Foto', desc: 'Galeri hingga 6 foto prewedding / kenangan.' },
  { id: 'rsvp', tier: 2, icon: '✅', visible: true, name: 'RSVP Konfirmasi Kehadiran', desc: 'Tamu konfirmasi hadir / tidak hadir langsung dari undangan.' },
  { id: 'guestname', tier: 2, icon: '🏷️', visible: true, name: 'Nama Tamu Personal', desc: 'Setiap tamu melihat namanya sendiri di cover (?to=Nama).' },
  { id: 'wishes', tier: 2, icon: '💌', visible: true, name: 'Buku Tamu & Ucapan', desc: 'Tamu menulis ucapan dan doa yang tampil di undangan.' },
  { id: 'love_story', tier: 2, icon: '📖', visible: true, name: 'Timeline Cerita', desc: 'Perjalanan cerita Anda dalam bentuk linimasa.' },

  // ---- Tier 3 (mulai paket Premium) ----
  { id: 'gift', tier: 3, icon: '🎁', visible: true, name: 'Amplop Digital', desc: 'Nomor rekening / e-wallet dengan tombol salin.' },
  { id: 'video', tier: 3, icon: '🎬', visible: true, name: 'Video Embed', desc: 'Sematkan video prewedding dari YouTube.' },
  { id: 'livestream', tier: 3, icon: '📡', visible: true, name: 'Link Live Streaming', desc: 'Tombol siaran langsung untuk tamu yang tidak bisa hadir.' },
  { id: 'qr_checkin', tier: 3, icon: '🔳', visible: true, name: 'QR Code Check-in Tamu', desc: 'QR unik per tamu untuk registrasi di lokasi.' },
  { id: 'dashboard', tier: 3, icon: '📊', visible: false, name: 'Dashboard Tamu', desc: 'Pantau RSVP, ucapan, dan daftar tamu dalam satu dashboard.' },

  // ---- Tier 4 (khusus paket Exclusive) ----
  { id: 'custom_domain', tier: 4, icon: '🌐', visible: true, name: 'Custom Domain', desc: 'Undangan di domain sendiri (contoh: rakaayu.com).' },
  { id: 'multilang', tier: 4, icon: '🌍', visible: true, name: 'Multi Bahasa (ID/EN)', desc: 'Tamu bisa berganti bahasa Indonesia / Inggris.' },
  { id: 'broadcast', tier: 4, icon: '📣', visible: false, name: 'Broadcast WhatsApp Massal', desc: 'Kirim undangan personal ke banyak tamu sekaligus.' },
  { id: 'priority', tier: 4, icon: '⚡', visible: false, name: 'Prioritas Pengerjaan 24 Jam', desc: 'Antrian prioritas dan revisi cepat dari tim kami.' },
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
    tagline: 'Sederhana, cepat, tetap rapi.',
    includes: ['Cover & detail acara', '1 tema pilihan', 'Link undangan unik', 'Revisi 1x', 'Masa aktif 30 hari'],
  },
  {
    id: 'standard',
    name: 'Standard',
    tier: 2,
    price: 199000,
    quota: 6,
    active: '3 bulan',
    popular: true,
    tagline: 'Paling banyak dipilih pasangan.',
    includes: ['Semua yang ada di Basic', 'Pilih dari 4 tema', 'Revisi 3x', 'Masa aktif 3 bulan'],
  },
  {
    id: 'premium',
    name: 'Premium',
    tier: 3,
    price: 349000,
    quota: 10,
    active: '6 bulan',
    tagline: 'Interaktif untuk tamu & tuan rumah.',
    includes: ['Semua yang ada di Standard', 'Penyesuaian warna & font', 'Revisi 5x', 'Masa aktif 6 bulan'],
  },
  {
    id: 'exclusive',
    name: 'Exclusive',
    tier: 4,
    price: 599000,
    quota: FEATURES.length,
    active: '12 bulan',
    tagline: 'Semua fitur terbuka, tanpa batas.',
    includes: ['Semua yang ada di Premium', 'Akses semua fitur', 'Revisi hingga puas*', 'Masa aktif 12 bulan'],
  },
];

export const THEMES = [
  { id: 'sakura', name: 'Sakura Blush', vars: { bg: '#FFF2F4', ink: '#5A2A3A', accent: '#D0607F', soft: '#FBDCE3', line: '#F0C2CD' } },
  { id: 'rustic', name: 'Rustic Sage', vars: { bg: '#F5EFE3', ink: '#3A3A2C', accent: '#6B7A4F', soft: '#E4E9D6', line: '#CFD5BD' } },
  { id: 'royal', name: 'Royal Gold', vars: { bg: '#1D1511', ink: '#F4E8D0', accent: '#C9A24B', soft: '#2D211B', line: '#4A3A2E' } },
  { id: 'midnight', name: 'Midnight Navy', vars: { bg: '#101C34', ink: '#E9EFFA', accent: '#7FB0FF', soft: '#1C2D4F', line: '#2F4573' } },
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
