# WoroWoroInv — Website Jasa Undangan Digital

React + Vite, pembayaran **Midtrans Snap**, siap di-deploy ke **Vercel**.

## Fitur

- **Paket bertingkat** (Basic, Standard, Premium, Exclusive): semakin mahal paket, semakin banyak fitur
  yang terbuka dan semakin besar kuota fitur yang bisa dipilih (19 fitur).
- **Demo live**: pratinjau undangan yang berubah real-time, dengan pilihan tampilan **Ponsel** atau **Desktop**
  (bingkai browser: cover tetap di kiri, isi undangan bergulir di kanan).
- **14 template** dengan efek berbeda-beda (kelopak sakura, dedaunan, kilau emas, bintang & meteor,
  gelembung & ombak, hati melayang, konfeti & balon, bentuk geometris). Tiap template punya
  font, ornamen cover animasi, efek nama, dan animasi muncul saat di-scroll sendiri.
- **Dua tampilan terpisah** (otomatis berdasarkan lebar layar, batas 820px):
  - **Desktop**: header menu atas, pesan 2 kolom dengan ringkasan sticky, demo berdampingan.
  - **Mobile**: header ringkas + navigasi bawah, pesan berupa wizard 4 langkah dengan bilah total
    di bawah dan pratinjau bottom-sheet, demo bertab (Atur / Pratinjau), paket berupa carousel.
- **Ikon SVG** bawaan (`src/components/Icon.jsx`), tanpa emoji dan tanpa dependensi.
- **Pembayaran Midtrans Snap**: QRIS, Virtual Account, e-wallet, kartu.
- **Halaman Admin (`/admin`)**: panduan setup, pemeriksaan konfigurasi otomatis, uji koneksi
  Midtrans, dan **simulasi pembayaran tanpa bayar** (hanya untuk admin).

## Link undangan otomatis (gratis, Upstash Redis)

Setelah pembayaran lunas, link undangan dibuat **otomatis dari nama pemilik**, mis.
`https://domain-anda/u/raka-ayu` (nama kembar otomatis diberi akhiran angka). Link dibuat oleh webhook Midtrans
dan/atau halaman `/sukses` (idempoten, tidak pernah ganda), lalu ditampilkan kepada pelanggan.

- **Masa aktif** mengikuti paket (`durationDays` di `shared/catalog.js`: 30 / 90 / 180 / 365 hari) dan tampil
  di kartu harga. Admin bisa mengubah per undangan: tambah hari, atau hitung ulang dari hari ini.
- Setelah kedaluwarsa, link menampilkan "Undangan sudah berakhir"; data dihapus otomatis 30 hari kemudian.
- **Hapus manual** oleh admin kapan saja (`/admin` > tab **Undangan**).
- Admin juga bisa **membuat undangan manual**, membuat **link per tamu** (`?to=Nama`), dan melihat
  **RSVP & ucapan** yang masuk.
- RSVP dan ucapan tamu pada link asli tersimpan di server.
- **Musik latar custom**: bila paket/fitur "Musik Latar" dipilih, pelanggan menempel **link lagu** (YouTube,
  Google Drive, Dropbox, atau file audio `https://...mp3`) dan judulnya. Tanpa upload file, jadi tetap gratis.
  Musik mulai saat tamu menekan "Buka Undangan"; admin bisa mengganti/menghapusnya di tab Undangan > Musik.
  Catatan: YouTube hanya memutar lagu yang pemiliknya mengizinkan penyematan (embed).

Penyimpanan memakai **Upstash Redis (paket Free)**, tanpa library tambahan. Tanpa penyimpanan, pembayaran
tetap berjalan seperti biasa; hanya fitur link otomatis yang nonaktif.

1. Vercel > project > **Storage / Marketplace** > **Upstash** > **Redis**, pilih paket **Free**, buat database.
2. **Connect Project** (semua environment). Variabel `KV_REST_API_URL` dan `KV_REST_API_TOKEN` terisi otomatis
   (atau isi manual `UPSTASH_REDIS_REST_URL` dan `UPSTASH_REDIS_REST_TOKEN` dari upstash.com).
3. **Redeploy**, lalu buka `/admin` > tab **Undangan**.

Uji tanpa bayar: simulasi pembayaran "Berhasil" sebagai admin juga membuat undangan (bertanda "Simulasi").

## Setup pembayaran (3 variabel saja)

Mode **Sandbox/Production dikenali otomatis** dari awalan Server Key (`SB-` = Sandbox). Tidak ada
variabel `VITE_` dan tidak perlu build ulang saat mengganti key (cukup Redeploy).

| Variable              | Wajib | Keterangan                                              |
| --------------------- | :---: | ------------------------------------------------------- |
| `MIDTRANS_SERVER_KEY` |  ya   | Midtrans > Settings > Access Keys                       |
| `MIDTRANS_CLIENT_KEY` |  ya   | Pasangan dari environment yang sama                     |
| `ADMIN_PASSWORD`      |  ya   | Login `/admin`, minimal 8 karakter                      |
| `ADMIN_WHATSAPP`      | tidak | `628xxxxxxxxxx`, untuk tombol kirim detail ke admin     |
| `SITE_URL`            | tidak | Bila kosong dideteksi otomatis                          |
| `MIDTRANS_ENV`        | tidak | Paksa `sandbox` / `production`                          |

**Cara termudah**: deploy dulu, buka `https://domain-anda/admin`. Selama `ADMIN_PASSWORD` belum diisi,
halaman itu menampilkan panduan 4 langkah dan **generator isi `.env`** (tempel key, klik salin,
tempel ke Vercel). Isian hanya diproses di browser Anda, tidak dikirim ke server.

Setelah variabel terisi dan di-Redeploy:

1. Buka `/admin`, login dengan `ADMIN_PASSWORD`.
2. Dashboard menampilkan **pemeriksaan otomatis**: key terbaca, Server/Client key cocok, mode, WhatsApp.
3. Klik **Uji koneksi Midtrans** untuk memastikan Server Key diterima (tidak menagih siapa pun).
4. Salin **Notification URL** dari dashboard ke Midtrans > Settings > Payment > Notification URL.

Pindah ke Production: ganti kedua key dengan key Production di Vercel lalu Redeploy. Selesai.

## Uji coba pembayaran tanpa membayar (khusus Anda)

Login di `/admin`, lalu buka halaman **Pesan**. Muncul panel **"Uji coba tanpa bayar"**: pilih hasil
(Berhasil / Menunggu / Gagal) dan klik **Simulasikan pembayaran**. Anda diarahkan ke halaman status
dengan label "Simulasi uji coba".

- Midtrans **tidak dipanggil**, jadi tidak ada transaksi dan tidak ada biaya (bekerja di Sandbox maupun Production).
- Panel hanya muncul untuk admin yang login. Server menolak (`403`) permintaan simulasi tanpa token admin.
- Order simulasi bertanda tangan (HMAC), jadi order palsu tidak dapat dibuat dari browser.
- Token admin berlaku 12 jam dan hilang saat tab ditutup.
- Untuk menguji alur Midtrans yang sebenarnya tanpa uang sungguhan, pakai key **Sandbox** dan bayar
  lewat simulator Midtrans.

## Struktur

```
api/                     Vercel Serverless Functions (6 fungsi, aman untuk paket Hobby)
  invite.js              GET/POST  data undangan publik, RSVP & ucapan tamu
  config.js              GET   konfigurasi publik (Client Key, mode, status admin)
  admin.js               POST/GET  login, verifikasi, diagnostik, uji koneksi
  create-transaction.js  POST  buat transaksi Snap (harga dihitung di server) / simulasi admin
  notification.js        POST  webhook Midtrans (verifikasi signature)
  status.js              GET   cek status transaksi
  _lib/                  helper (midtrans.js, admin.js, store.js Upstash, invitations.js)
shared/catalog.js        paket, fitur, tema, validasi (dipakai frontend & API)
src/
  pages/                 Home, Demo, Order, Success, Admin, AdminInvitations, Invite (/u/slug)
  components/            Icon, InvitationPreview, Navbar (header + bottom nav), Footer, order/Pickers
  components/invitation/ Fx (efek partikel), CoverArt (ornamen SVG), Names (efek nama), themeVars
  invitation.css         gaya undangan: bingkai ponsel/desktop, template, efek, animasi
  lib/                   config (konteks), admin, midtrans, useOrder
  hooks/useMediaQuery.js pemilih tampilan desktop/mobile
vercel.json              rewrite SPA (React Router)
```

## Menjalankan di komputer

```bash
npm install
cp .env.example .env.local     # isi key Midtrans Sandbox + ADMIN_PASSWORD
npx vercel dev                 # frontend + /api di http://localhost:3000
```

`npm run dev` hanya menjalankan frontend. Karena `/api/*` adalah Vercel Functions, gunakan
`npx vercel dev` agar pembayaran dan halaman admin berfungsi.

## Deploy ke Vercel

1. Push ke GitHub/GitLab/Bitbucket (atau `npx vercel` dari folder ini).
2. Di Vercel: **Add New > Project**, pilih repo (terdeteksi sebagai **Vite**).
3. Tambahkan environment variable di atas, lalu Deploy.
4. Buka `/admin` untuk pemeriksaan dan uji koneksi.

## Menyesuaikan

- **Harga, kuota, fitur, template**: `shared/catalog.js` (harga hanya contoh).
- **Template baru**: tambah satu objek di `THEMES` (warna, font, `effect`, `cover`, `reveal`, `namesFx`, `card`).
  Font Google dimuat di `index.html` (butuh internet; tanpa itu tampil dengan font cadangan).
  Pratinjau menghormati pengaturan "kurangi gerakan" milik perangkat.
- **Warna & gaya**: variabel di `:root` pada `src/index.css`.
- **Ikon**: tambah/ubah path di `src/components/Icon.jsx`.

## Catatan

Database bersifat opsional (hanya untuk fitur link undangan). Setelah bayar, `/sukses` mengecek status ke Midtrans dan
menyediakan tombol kirim detail ke admin via WhatsApp (plus salin ringkasan). Ringkasan pesanan juga
tampil di Midtrans Dashboard (`custom_field1–3`). Untuk skala lebih besar, tambahkan database
(Supabase / Vercel Postgres), email otomatis saat lunas, dan halaman kelola pesanan.

## Isi undangan: teks & media (halaman Kelola)

Setelah pembayaran lunas, pelanggan menerima **link kelola rahasia** (`/kelola/<slug>?k=<kunci>`) di halaman sukses. Admin juga bisa membukanya dari tab Undangan ("Kelola isi" / "Link kelola").

Yang bisa diisi pelanggan (sesuai fitur paket yang dipilih):
- **Teks**: kata pengantar, keluarga, catatan, link Maps, kisah cinta (maks 6), rekening kado (maks 4) + alamat, link live streaming, link video YouTube, versi bahasa Inggris, data acara.
- **Foto**: foto cover, galeri (maks 6), gambar QRIS. Foto dikompres di browser (maks ~200 KB) lalu disimpan di Upstash dan dilayani lewat `/api/media`.
- **Musik / video / live** berupa tautan (YouTube, audio langsung, Google Drive, Dropbox), bukan unggahan file.
- **Daftar tamu** + tombol kirim WhatsApp per tamu (`wa.me`, bukan kirim massal otomatis), **dashboard** RSVP/ucapan/check-in, dan **check-in QR** (kamera butuh dukungan BarcodeDetector; input manual selalu tersedia).

Catatan:
- Tidak ada env var baru; cukup Upstash yang sudah dipasang.
- Kuota gratis Upstash 250 MB: sekitar 200 undangan dengan foto penuh.
- Domain kustom hanya disimpan; pengaturan DNS/domain di Vercel dilakukan admin manual.
- Jumlah fungsi API: 8 (batas Hobby 12).


Template bertema budaya: **Jawa Keraton** (gunungan, kawung), **Melati Janur** (roncen melati), **Islami Arabesque** (bintang 8 sudut, lentera, kubah), plus Art Deco Gatsby, Boho Terracotta, dan Tropis Jungle.

## Undangan "hilang" padahal link masih aktif: penyebab & perbaikan

Yang sudah diperbaiki di kode:
- Galat Redis sesaat (jaringan, 429, 5xx) otomatis dicoba ulang 3x dan tidak lagi terbaca sebagai "tidak ditemukan".
- Dua pesanan bernama sama yang masuk bersamaan tidak bisa saling menimpa (SET NX).
- Unggah foto / simpan isi / ubah durasi yang berjalan bersamaan dikunci per undangan, jadi foto tidak "lenyap" dari daftar.
- Halaman undangan mencoba ulang otomatis, menampilkan salinan terakhir yang pernah dimuat bila server sedang gangguan, dan punya tombol "Coba lagi".
- Admin menandai undangan yang masa aktifnya belum habis tetapi datanya hilang dari penyimpanan (baris merah di tab Undangan), tidak lagi dibuang diam-diam.
- Respons undangan di-cache CDN 10 detik sehingga hemat kuota Redis.

Penyebab dari sisi Upstash (cek di console.upstash.com):
1. **Eviction**: pada database, matikan "Eviction". Bila menyala dan memori penuh, Redis menghapus kunci acak.
2. **Database tidak aktif**: database gratis yang lama tidak dipakai dapat diarsipkan/dihapus. Buka dashboard sesekali atau upgrade.
3. **Kuota**: bila kuota perintah/penyimpanan habis, semua perintah gagal sampai periode berikutnya.

## Custom domain

Pelanggan paket Exclusive mengisi domain di halaman Kelola. Alamat utama domain itu (`/`) otomatis menampilkan undangannya, termasuk `?to=Nama Tamu`.
Admin menyambungkannya di tab Undangan > "Hubungkan domain":
- Tanpa token: ditampilkan instruksi DNS (A `76.76.21.21` untuk domain utama, CNAME `cname.vercel-dns.com` untuk subdomain). Domain ditambahkan manual di Vercel > Settings > Domains.
- Otomatis: isi env `VERCEL_API_TOKEN` (vercel.com/account/tokens), `VERCEL_PROJECT_ID` (Settings > General), dan bila perlu `VERCEL_TEAM_ID`. Tombol akan menambahkan domain ke proyek dan mengecek DNS.
Opsional: isi `SITE_URL` agar domain utama situs Anda tidak memicu pencarian domain kustom.

## Prioritas 24 jam
Undangan dengan fitur Prioritas ditampilkan paling atas di tab Undangan dengan banner dan batas waktu 24 jam.
