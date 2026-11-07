# WoroWoroInv — Website Jasa Undangan Digital

React + Vite, pembayaran **Midtrans Snap**, siap di-deploy ke **Vercel**.

## Fitur

- **Paket bertingkat** (Basic → Standard → Premium → Exclusive). Semakin mahal paket, semakin banyak
  fitur yang terbuka **dan** semakin besar kuota fitur yang bisa dipilih.
- **Pilih fitur sendiri** (19 fitur) — fitur di atas level paket terkunci, kuota dihitung otomatis.
- **Demo live**: pratinjau undangan berbentuk layar ponsel yang berubah real-time (countdown, RSVP,
  galeri, ucapan, QR check-in, multi bahasa, dll). Halaman `/demo` bisa mengaktifkan semua fitur dan
  merekomendasikan paket yang pas.
- **Pembayaran Midtrans Snap** (popup): QRIS, Virtual Account, e-wallet, kartu — sesuai yang
  diaktifkan di akun Midtrans Anda.
- **Aman**: harga & aturan fitur divalidasi ulang di server (`shared/catalog.js`), webhook
  memverifikasi `signature_key`.

## Struktur

```
api/                     Vercel Serverless Functions
  create-transaction.js  POST  buat transaksi Snap (hitung harga di server)
  notification.js        POST  webhook Midtrans (verifikasi signature)
  status.js              GET   cek status transaksi ke Midtrans
  _lib/midtrans.js       helper (auth, signature, URL sandbox/production)
shared/catalog.js        paket, fitur, tema, validasi (dipakai frontend & API)
src/                     aplikasi React
  pages/                 Home, Demo, Order, Success
  components/            Navbar, Footer, InvitationPreview
vercel.json              rewrite SPA (React Router) + konfigurasi build
```

## Menjalankan di komputer

```bash
npm install
cp .env.example .env.local     # lalu isi key Midtrans Sandbox
npx vercel dev                 # menjalankan frontend + /api (http://localhost:3000)
```

> `npm run dev` hanya menjalankan frontend. Karena endpoint `/api/*` adalah Vercel Functions,
> gunakan `npx vercel dev` agar pembayaran bisa dicoba secara lokal.

## Konfigurasi Midtrans

1. Daftar di <https://dashboard.midtrans.com> dan pilih environment **Sandbox**.
2. Buka **Settings → Access Keys**, salin **Server Key** dan **Client Key**.
3. Isi di `.env.local` (lokal) dan di Vercel (lihat di bawah):

   | Variable                      | Keterangan                                        |
   | ----------------------------- | ------------------------------------------------- |
   | `MIDTRANS_SERVER_KEY`         | Server Key (rahasia, hanya dipakai di `/api`)     |
   | `MIDTRANS_IS_PRODUCTION`      | `false` = Sandbox, `true` = Production            |
   | `VITE_MIDTRANS_CLIENT_KEY`    | Client Key (aman terbaca di browser)              |
   | `VITE_MIDTRANS_IS_PRODUCTION` | `false` / `true` (harus sama dengan di atas)      |
   | `VITE_ADMIN_WHATSAPP`         | Nomor WA admin, format `628xxxxxxxxxx`            |
   | `SITE_URL`                    | (opsional) URL website, mis. `https://domain.com` |

4. Di Midtrans: **Settings → Payment → Notification URL** isi
   `https://DOMAIN-ANDA/api/notification`.
5. Uji dengan kartu / simulator Sandbox dari dokumentasi Midtrans. Saat siap live, ganti key ke
   Production dan set kedua `*_IS_PRODUCTION` menjadi `true`.

## Deploy ke Vercel

1. Push project ke GitHub/GitLab/Bitbucket (atau jalankan `npx vercel` dari folder ini).
2. Di Vercel: **Add New → Project**, pilih repo. Framework otomatis terdeteksi sebagai **Vite**.
3. Tambahkan semua environment variable di atas (**Settings → Environment Variables**).
4. Deploy. Folder `api/` otomatis menjadi Serverless Functions dan `vercel.json` mengurus routing
   React Router (refresh di `/pesan`, `/demo`, dll tidak 404).

## Menyesuaikan

- **Harga, kuota, nama paket, daftar fitur, tema**: edit `shared/catalog.js` (harga di file ini
  hanya contoh).
- **Tampilan**: `src/index.css` (variabel warna di `:root`).
- **Nomor WA & merek**: `VITE_ADMIN_WHATSAPP`, `src/components/Navbar.jsx`, `Footer.jsx`.

## Catatan & pengembangan lanjutan

Proyek ini sengaja **tanpa database** agar mudah di-deploy. Alurnya: setelah bayar, halaman
`/sukses` mengecek status ke Midtrans dan menyediakan tombol **"Kirim Detail ke Admin via
WhatsApp"** berisi ringkasan pesanan. Ringkasan singkat juga tampil di Midtrans Dashboard
(`custom_field1–3`).

Untuk produksi skala lebih besar, disarankan menambahkan:

- Database (Supabase / Vercel Postgres) untuk menyimpan pesanan & status dari `api/notification.js`.
- Email otomatis ke pelanggan/admin saat status lunas (mis. Resend).
- Halaman admin untuk mengelola pesanan dan membuat undangan final per pelanggan.
