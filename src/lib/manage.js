import { getAdminToken } from './admin.js';

/** Panggilan ke /api/manage: kunci pemilik (x-edit-key) atau token admin. */
export async function manageApi(slug, key, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (key) headers['x-edit-key'] = key;
  const admin = getAdminToken();
  if (admin) headers.Authorization = `Bearer ${admin}`;
  const res = await fetch(`/api/manage?slug=${encodeURIComponent(slug)}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.error || `Gagal (${res.status})`), { status: res.status });
  return data;
}
