// Penyimpanan token admin (sessionStorage: hilang saat tab/browser ditutup)
const KEY = 'woro_admin_token';
export const ADMIN_EVENT = 'woro-admin-change';

export function getAdminToken() {
  try {
    return sessionStorage.getItem(KEY) || '';
  } catch {
    return '';
  }
}

export function setAdminToken(token) {
  try {
    if (token) sessionStorage.setItem(KEY, token);
    else sessionStorage.removeItem(KEY);
  } catch {
    /* sessionStorage bisa saja tidak tersedia */
  }
  window.dispatchEvent(new Event(ADMIN_EVENT));
}

/** Panggil /api/admin?action=... dengan token admin (bila ada). */
export async function adminApi(action, { method = 'GET', body, query = {} } = {}) {
  const token = getAdminToken();
  const extra = Object.entries(query)
    .map(([k, v]) => `&${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('');
  const res = await fetch(`/api/admin?action=${encodeURIComponent(action)}${extra}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || 'Permintaan gagal.');
    err.status = res.status;
    throw err;
  }
  return data;
}
