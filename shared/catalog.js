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
    includes: ['Semua yang ada di Basic', 'Pilih dari 14 template', 'Revisi 3x', 'Link aktif 3 bulan'],
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
 *  effect : petal | leaf | sparkle | star | bubble | heart | confetti | shape
 *  cover  : blossom | leaves | frame | moon | waves | roses | balloons | geo
 *  reveal : rise | fade | zoom | blur | slide | flip | wipe | pop
 *  namesFx: rise | wipe | shimmer | glow | float | pulse | pop | track
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
  {
    id: 'jawa',
    name: 'Jawa Keraton',
    mood: 'Klasik, sakral & berbudaya',
    best: ['pernikahan', 'khitanan', 'aqiqah'],
    effect: 'kawung',
    effectLabel: 'Ornamen kawung emas berkilau',
    cover: 'gunungan',
    reveal: 'blur',
    namesFx: 'shimmer',
    card: 'outline',
    fonts: { head: "'Marcellus', serif", body: "'Plus Jakarta Sans', sans-serif", name: "'Cinzel Decorative', serif" },
    vars: { bg: '#F1DDB0', ink: '#3B2412', accent: '#8B4A1C', soft: '#E8CF98', line: '#C9A262', on: '#FFF3D6', grad: 'linear-gradient(180deg,#E9CF96 0%,#F4E3BC 72%)', fx: ['#B8862F', '#8B4A1C', '#D9A646', '#6E3A14'] },
  },
  {
    id: 'melati',
    name: 'Melati Janur',
    mood: 'Suci, harum & anggun',
    best: ['pernikahan', 'aqiqah'],
    effect: 'melati',
    effectLabel: 'Bunga melati berguguran',
    cover: 'roncen',
    reveal: 'rise',
    namesFx: 'rise',
    card: 'glass',
    fonts: { head: "'Cormorant Garamond', serif", body: "'Plus Jakarta Sans', sans-serif", name: "'Allura', cursive" },
    vars: { bg: '#12302A', ink: '#F4F1E4', accent: '#D9B86A', soft: '#1B443B', line: '#3E6A5C', on: '#12302A', grad: 'radial-gradient(120% 80% at 50% 0%,#215145 0%,#12302A 72%)', fx: ['#FFFFFF', '#F7F2DE', '#EDE3BE', '#D9B86A'] },
  },
  {
    id: 'islami',
    name: 'Islami Arabesque',
    mood: 'Religius & teduh',
    best: ['pernikahan', 'khitanan', 'aqiqah'],
    effect: 'lantern',
    effectLabel: 'Lentera cahaya naik perlahan',
    cover: 'arabesque',
    reveal: 'zoom',
    namesFx: 'glow',
    card: 'outline',
    fonts: { head: "'Amiri', serif", body: "'Plus Jakarta Sans', sans-serif", name: "'Amiri', serif" },
    vars: { bg: '#F6F1E4', ink: '#0F3F3D', accent: '#0F766E', soft: '#E3EDE4', line: '#B7D0C4', on: '#ffffff', grad: 'linear-gradient(180deg,#E4EFE6 0%,#F6F1E4 70%)', fx: ['#E0A526', '#F2C14E', '#FFD98A', '#0F766E'] },
  },
  {
    id: 'artdeco',
    name: 'Art Deco Gatsby',
    mood: 'Glamor & berkelas',
    best: ['pernikahan', 'ulangtahun'],
    effect: 'streak',
    effectLabel: 'Garis emas berjatuhan',
    cover: 'fan',
    reveal: 'slide',
    namesFx: 'track',
    card: 'outline',
    fonts: { head: "'Poiret One', sans-serif", body: "'Jost', sans-serif", name: "'Poiret One', sans-serif" },
    vars: { bg: '#14131A', ink: '#F3EBD3', accent: '#D4AF37', soft: '#211F2B', line: '#4B4333', on: '#14131A', grad: 'linear-gradient(180deg,#0C0B10 0%,#1D1B27 100%)', fx: ['#D4AF37', '#F0D77B', '#2A9D8F', '#FFF1B8'] },
  },
  {
    id: 'boho',
    name: 'Boho Terracotta',
    mood: 'Hangat, santai & artistik',
    best: ['pernikahan', 'ulangtahun', 'aqiqah'],
    effect: 'feather',
    effectLabel: 'Pampas grass melayang',
    cover: 'arches',
    reveal: 'fade',
    namesFx: 'wipe',
    card: 'soft',
    fonts: { head: "'Josefin Sans', sans-serif", body: "'Plus Jakarta Sans', sans-serif", name: "'Sacramento', cursive" },
    vars: { bg: '#F8EDE4', ink: '#5B3A2E', accent: '#C4694A', soft: '#F1D9C6', line: '#E3BFA6', on: '#ffffff', grad: 'linear-gradient(180deg,#F3DCCB 0%,#F8EDE4 72%)', fx: ['#E8C9A8', '#D9A38A', '#F3E2CF', '#B58B6B'] },
  },
  {
    id: 'tropis',
    name: 'Tropis Jungle',
    mood: 'Segar, ceria & eksotis',
    best: ['ulangtahun', 'khitanan', 'aqiqah'],
    effect: 'butterfly',
    effectLabel: 'Kupu-kupu beterbangan',
    cover: 'jungle',
    reveal: 'pop',
    namesFx: 'float',
    card: 'solid',
    fonts: { head: "'Abril Fatface', serif", body: "'Plus Jakarta Sans', sans-serif", name: "'Pacifico', cursive" },
    vars: { bg: '#E9F5DF', ink: '#0F3D2E', accent: '#E4572E', soft: '#CFEAB9', line: '#9CCB7A', on: '#ffffff', grad: 'linear-gradient(180deg,#D5EDC3 0%,#E9F5DF 72%)', fx: ['#E4572E', '#FFB400', '#2BB3A3', '#8E5BD6'] },
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

/**
 * Musik latar custom (fitur "music"). Tanpa upload file: pelanggan memberi LINK.
 * Didukung: YouTube (watch / youtu.be / shorts), file audio langsung (https ... .mp3/.m4a/.ogg/.wav),
 * Google Drive (bagikan "Siapa saja yang memiliki link"), Dropbox.
 * Dipakai di frontend (validasi cepat) dan di API (validasi ulang).
 */
export function parseMusic(raw) {
  const url = String(raw ?? '').trim();
  if (!url) return { ok: true, empty: true };
  if (url.length > 400) return { ok: false, error: 'Link musik terlalu panjang.' };
  let u;
  try {
    u = new URL(url);
  } catch {
    return { ok: false, error: 'Link musik tidak valid. Tempel link lengkap yang diawali https://' };
  }
  if (u.protocol !== 'https:') return { ok: false, error: 'Link musik harus diawali https://' };
  const host = u.hostname.toLowerCase().replace(/^(www|m)\./, '');

  let yt = null;
  const isYt = host === 'youtu.be' || host === 'youtube.com' || host === 'music.youtube.com';
  if (host === 'youtu.be') yt = u.pathname.slice(1).split('/')[0];
  else if (host === 'youtube.com' || host === 'music.youtube.com') {
    if (u.pathname === '/watch') yt = u.searchParams.get('v');
    else {
      const m = /^\/(?:shorts|embed|live)\/([^/?]+)/.exec(u.pathname);
      if (m) yt = m[1];
    }
  }
  if (isYt) {
    if (!/^[A-Za-z0-9_-]{11}$/.test(yt || '')) return { ok: false, error: 'Link YouTube tidak dikenali. Gunakan link video (bukan playlist/channel).' };
    return { ok: true, type: 'youtube', url, ytId: yt, source: 'YouTube' };
  }
  if (host === 'drive.google.com') {
    const m = /\/file\/d\/([A-Za-z0-9_-]+)/.exec(u.pathname);
    const id = m ? m[1] : u.searchParams.get('id');
    if (!id || !/^[A-Za-z0-9_-]{10,80}$/.test(id)) return { ok: false, error: 'Link Google Drive tidak dikenali. Gunakan link "Bagikan" file audio.' };
    return { ok: true, type: 'audio', url: `https://drive.google.com/uc?export=download&id=${id}`, source: 'Google Drive' };
  }
  if (host === 'dropbox.com') {
    u.searchParams.delete('dl');
    u.searchParams.set('raw', '1');
    return { ok: true, type: 'audio', url: u.toString(), source: 'Dropbox' };
  }
  return { ok: true, type: 'audio', url: u.toString(), source: 'File audio' };
}

/** { url, title } dari form -> objek musik tersimpan, atau null bila kosong. Melempar pesan error bila tidak valid. */
export function normalizeMusic(input) {
  if (!input || !String(input.url ?? '').trim()) return null;
  const r = parseMusic(input.url);
  if (!r.ok) throw new Error(r.error);
  const title = String(input.title ?? '').replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, 60);
  return { type: r.type, url: r.url, ...(r.ytId ? { ytId: r.ytId } : {}), title };
}

/* ============================================================
   Isi undangan (teks & media) yang diinput pelanggan
   ============================================================ */
export const CONTENT_LIMITS = { gallery: 6, story: 6, accounts: 4, imageBytes: 220000, uploadsPerInvitation: 10 };
const IMG_ID = /^[a-f0-9]{16}$/;
export const isImageId = (v) => IMG_ID.test(String(v || ''));

const txt = (v, n) =>
  String(v ?? '')
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f<>]/g, '')
    .trim()
    .slice(0, n);
const httpsUrl = (v, n = 300) => {
  try {
    const u = new URL(String(v || '').trim());
    const out = u.toString();
    return u.protocol === 'https:' && out.length <= n ? out : '';
  } catch {
    return '';
  }
};

/**
 * Membersihkan & membatasi isi undangan. Hanya bagian yang fiturnya aktif yang disimpan.
 * Gambar: id hasil upload server (16 hex). `allowDataImages` hanya untuk pratinjau lokal (demo).
 */
export function cleanContent(raw, features = [], { allowDataImages = false } = {}) {
  const c = raw && typeof raw === 'object' ? raw : {};
  const has = (id) => features.includes(id);
  const arr = (v) => (Array.isArray(v) ? v : []);
  const img = (v) => {
    const s = String(v || '');
    if (IMG_ID.test(s)) return s;
    return allowDataImages && /^data:image\/(jpeg|png|webp);base64,/.test(s) ? s : '';
  };
  const out = {
    intro: txt(c.intro, 300),
    family1: txt(c.family1, 100),
    family2: txt(c.family2, 100),
    note: txt(c.note, 200),
    cover: img(c.cover),
  };
  if (has('multilang')) out.introEn = txt(c.introEn, 300);
  if (has('maps')) out.mapsUrl = httpsUrl(c.mapsUrl);
  if (has('gallery')) out.gallery = arr(c.gallery).map(img).filter(Boolean).slice(0, CONTENT_LIMITS.gallery);
  if (has('love_story')) {
    out.story = arr(c.story)
      .map((r) => ({ when: txt(r && r.when, 20), text: txt(r && r.text, 200) }))
      .filter((r) => r.text)
      .slice(0, CONTENT_LIMITS.story);
  }
  if (has('gift')) {
    const g = c.gift && typeof c.gift === 'object' ? c.gift : {};
    out.gift = {
      accounts: arr(g.accounts)
        .map((a) => ({ bank: txt(a && a.bank, 30), number: txt(a && a.number, 40), name: txt(a && a.name, 60) }))
        .filter((a) => a.number)
        .slice(0, CONTENT_LIMITS.accounts),
      address: txt(g.address, 160),
      qris: img(g.qris),
    };
  }
  if (has('video')) {
    const r = parseMusic(c.videoUrl);
    out.videoId = r.ok && r.type === 'youtube' ? r.ytId : '';
    out.videoUrl = out.videoId ? String(c.videoUrl).trim().slice(0, 200) : '';
  }
  if (has('livestream')) {
    const l = c.live && typeof c.live === 'object' ? c.live : {};
    out.live = { url: httpsUrl(l.url), note: txt(l.note, 120), when: txt(l.when, 60) };
  }
  if (has('custom_domain')) {
    const d = txt(c.domain, 80).toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/^www\./, '');
    out.domain = /^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}$/.test(d) ? d : '';
  }
  return out;
}

/** Semua id gambar yang dirujuk oleh sebuah isi undangan. */
export function contentImageIds(content) {
  const c = content || {};
  return [c.cover, ...(c.gallery || []), c.gift && c.gift.qris].filter((x) => isImageId(x));
}

/** Daftar tamu (nama + nomor WA opsional) untuk tautan personal & kirim WhatsApp. */
export function cleanGuests(raw) {
  return (Array.isArray(raw) ? raw : [])
    .map((g) => ({ name: txt(g && g.name, 60), phone: String((g && g.phone) || '').replace(/[^\d]/g, '').slice(0, 16) }))
    .filter((g) => g.name)
    .slice(0, 500);
}
