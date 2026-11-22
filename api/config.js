import { adminEnabled } from './_lib/admin.js';
import { getAdminWhatsapp, getClientKey, isProduction } from './_lib/midtrans.js';

/**
 * GET /api/config
 * Konfigurasi publik untuk frontend. Hanya berisi hal yang memang aman
 * dilihat publik (Client Key bukan rahasia). Server Key TIDAK pernah dikirim.
 * Dengan cara ini Anda cukup mengatur environment variable di Vercel,
 * tanpa awalan VITE_ dan tanpa perlu build ulang.
 */
export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({
    clientKey: getClientKey(),
    isProduction: isProduction(),
    adminEnabled: adminEnabled(),
    adminWhatsapp: getAdminWhatsapp(),
  });
}
