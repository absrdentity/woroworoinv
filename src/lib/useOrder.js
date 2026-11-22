import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  EVENT_TYPES,
  FEATURES,
  THEMES,
  getFeature,
  getPackage,
  validateCustomer,
  validateSelection,
} from '../../shared/catalog.js';
import { createTransaction, payWithSnap } from './midtrans.js';
import { getAdminToken } from './admin.js';
import { useConfig } from './config.jsx';

const DEFAULT_PICK = ['countdown', 'maps', 'whatsapp_share'];

/** State & aksi pemesanan — dipakai bersama oleh tampilan desktop dan mobile. */
export function useOrder() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const cfg = useConfig();

  const initialPkg = getPackage(params.get('paket')) || getPackage('standard');

  const [packageId, setPackageId] = useState(initialPkg.id);
  const [features, setFeatures] = useState(() => {
    const wanted = (params.get('fitur') || '').split(',').filter(Boolean);
    const source = wanted.length ? wanted : DEFAULT_PICK;
    return source
      .filter((id) => {
        const f = getFeature(id);
        return f && f.tier <= initialPkg.tier;
      })
      .slice(0, initialPkg.quota);
  });
  const [themeId, setThemeId] = useState(THEMES.some((t) => t.id === params.get('tema')) ? params.get('tema') : 'sakura');
  const [eventTypeId, setEventTypeId] = useState(
    EVENT_TYPES.some((e) => e.id === params.get('acara')) ? params.get('acara') : 'pernikahan'
  );
  const [event, setEvent] = useState({ name1: '', name2: '', date: '', time: '10:00', venue: '', address: '' });
  const [customer, setCustomer] = useState({ name: '', email: '', phone: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const pkg = getPackage(packageId);
  const ev = EVENT_TYPES.find((e) => e.id === eventTypeId);
  const quotaFull = features.length >= pkg.quota;
  const quotaLabel = pkg.quota >= FEATURES.length ? 'tanpa batas' : `${features.length}/${pkg.quota}`;

  const changePackage = (id) => {
    const next = getPackage(id);
    const trimmed = features.filter((fid) => getFeature(fid).tier <= next.tier).slice(0, next.quota);
    setPackageId(id);
    setFeatures(trimmed);
    setError('');
    setNotice(
      trimmed.length < features.length
        ? `Beberapa fitur dilepas karena tidak tersedia / melebihi kuota paket ${next.name}.`
        : ''
    );
  };

  const toggleFeature = (f) => {
    setNotice('');
    if (features.includes(f.id)) {
      setFeatures(features.filter((x) => x !== f.id));
      return;
    }
    if (f.tier > pkg.tier) return;
    if (quotaFull) {
      setNotice(`Kuota paket ${pkg.name} sudah penuh. Lepas satu fitur atau naikkan paket.`);
      return;
    }
    setFeatures([...features, f.id]);
  };

  const setEv = (key) => (e) => setEvent({ ...event, [key]: e.target.value });
  const setCus = (key) => (e) => setCustomer({ ...customer, [key]: e.target.value });

  // ----- validasi per bagian (mengembalikan pesan error atau '') -----
  const selectionError = () => {
    const sel = validateSelection({ packageId, features, theme: themeId, eventType: eventTypeId });
    return sel.ok ? '' : sel.error;
  };
  const eventError = () => {
    if (!event.name1.trim()) return ev.double ? 'Isi nama mempelai pria.' : 'Isi nama pada undangan.';
    if (ev.double && !event.name2.trim()) return 'Isi nama mempelai wanita.';
    if (!event.date) return 'Pilih tanggal acara.';
    return '';
  };
  const customerError = () => validateCustomer(customer) || '';
  const firstError = () => selectionError() || eventError() || customerError();

  const payload = () => ({ packageId, features, theme: themeId, eventType: eventTypeId, customer, event });

  const saveLast = (orderId) => {
    try {
      localStorage.setItem(
        'woro_last_order',
        JSON.stringify({ orderId, packageId, features, themeId, eventTypeId, event, customer: { name: customer.name } })
      );
    } catch {
      /* abaikan jika storage tidak tersedia */
    }
  };

  /** Bayar sungguhan lewat Midtrans Snap. */
  const pay = async () => {
    setError('');
    const err = firstError();
    if (err) return setError(err);
    setBusy(true);
    try {
      const { token, order_id: orderId } = await createTransaction(payload());
      saveLast(orderId);
      await payWithSnap(token, cfg, {
        onSuccess: () => navigate(`/sukses?order_id=${orderId}`),
        onPending: () => navigate(`/sukses?order_id=${orderId}`),
        onError: () => {
          setBusy(false);
          setError('Pembayaran gagal. Silakan coba lagi.');
        },
        onClose: () => {
          setBusy(false);
          setNotice('Popup pembayaran ditutup. Anda dapat menekan tombol bayar lagi kapan saja.');
        },
      });
    } catch (e) {
      setBusy(false);
      setError(e.message || 'Terjadi kesalahan. Silakan coba lagi.');
    }
  };

  /** Simulasi pembayaran (khusus admin, tanpa Midtrans, tanpa biaya). */
  const simulate = async (outcome) => {
    setError('');
    const err = firstError();
    if (err) return setError(err);
    setBusy(true);
    try {
      const d = await createTransaction(payload(), { simulate: outcome, adminToken: getAdminToken() });
      saveLast(d.order_id);
      navigate(`/sukses?order_id=${d.order_id}`);
    } catch (e) {
      setError(e.message || 'Simulasi gagal.');
    } finally {
      setBusy(false);
    }
  };

  return {
    cfg,
    packageId, pkg, features, themeId, setThemeId, eventTypeId, setEventTypeId, ev,
    event, customer, busy, error, setError, notice, setNotice,
    quotaFull, quotaLabel,
    changePackage, toggleFeature, setEv, setCus,
    selectionError, eventError, customerError,
    pay, simulate,
  };
}
