# WoroWoroInv — Website Jasa Undangan Digital

React + Vite, pembayaran **Midtrans Snap**, siap di-deploy ke **Vercel**.

## Fitur

- **Paket bertingkat** (Basic, Standard, Premium, Exclusive): semakin mahal paket, semakin banyak fitur
  yang terbuka dan semakin besar kuota fitur yang bisa dipilih (19 fitur).
- **Demo live**: pratinjau undangan berbentuk layar ponsel yang berubah real-time.
- **Dua tampilan terpisah** (otomatis berdasarkan lebar layar, batas 820px):
  - **Desktop**: header menu atas, pesan 2 kolom dengan ringkasan sticky, demo berdampingan.
  - **Mobile**: header ringkas + navigasi bawah, pesan berupa wizard 4 langkah dengan bilah total
    di bawah dan pratinjau bottom-sheet, demo bertab (Atur / Pratinjau), paket berupa carousel.
- **Ikon SVG** bawaan (`src/components/Icon.jsx`), tanpa emoji dan tanpa dependensi.
- **Pembayaran Midtrans Snap**: QRIS, Virtual Account, e-wallet, kartu.
- **Halaman Admin (`/admin`)**: panduan setup, pemeriksaan konfigurasi otomatis, uji koneksi
  Midtrans, dan **simulasi pembayaran tanpa bayar** (hanya untuk admin).

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
api/                     Vercel Serverless Functions (5 fungsi, aman untuk paket Hobby)
  config.js              GET   konfigurasi publik (Client Key, mode, status admin)
  admin.js               POST/GET  login, verifikasi, diagnostik, uji koneksi
  create-transaction.js  POST  buat transaksi Snap (harga dihitung di server) / simulasi admin
  notification.js        POST  webhook Midtrans (verifikasi signature)
  status.js              GET   cek status transaksi
  _lib/                  helper (midtrans.js, admin.js)
shared/catalog.js        paket, fitur, tema, validasi (dipakai frontend & API)
src/
  pages/                 Home, Demo, Order, Success, Admin
  components/            Icon, InvitationPreview, Navbar (header + bottom nav), Footer, order/Pickers
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

- **Harga, kuota, fitur, tema**: `shared/catalog.js` (harga hanya contoh).
- **Warna & gaya**: variabel di `:root` pada `src/index.css`.
- **Ikon**: tambah/ubah path di `src/components/Icon.jsx`.

## Catatan

Tanpa database agar mudah di-deploy. Setelah bayar, `/sukses` mengecek status ke Midtrans dan
menyediakan tombol kirim detail ke admin via WhatsApp (plus salin ringkasan). Ringkasan pesanan juga
tampil di Midtrans Dashboard (`custom_field1–3`). Untuk skala lebih besar, tambahkan database
(Supabase / Vercel Postgres), email otomatis saat lunas, dan halaman kelola pesanan.
