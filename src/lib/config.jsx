import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ADMIN_EVENT, adminApi, getAdminToken, setAdminToken } from './admin.js';

const DEFAULTS = {
  loading: true,
  error: '',
  clientKey: '',
  isProduction: false,
  adminEnabled: false,
  adminWhatsapp: '',
};

const Ctx = createContext({ ...DEFAULTS, admin: { checking: true, isAdmin: false, recheck: () => {} } });

/**
 * Memuat konfigurasi publik dari /api/config (di-set lewat environment variable
 * di Vercel, tanpa awalan VITE_) dan status login admin.
 */
export function ConfigProvider({ children }) {
  const [config, setConfig] = useState(DEFAULTS);
  const [admin, setAdmin] = useState({ checking: true, isAdmin: false });

  useEffect(() => {
    let off = false;
    fetch('/api/config')
      .then((r) => r.json())
      .then((d) => {
        if (off) return;
        setConfig({
          loading: false,
          error: '',
          clientKey: d.clientKey || '',
          isProduction: !!d.isProduction,
          adminEnabled: !!d.adminEnabled,
          adminWhatsapp: String(d.adminWhatsapp || '').replace(/\D/g, ''),
        });
      })
      .catch(() => {
        if (!off) setConfig({ ...DEFAULTS, loading: false, error: 'Konfigurasi server tidak dapat dimuat.' });
      });
    return () => {
      off = true;
    };
  }, []);

  const recheck = useCallback(async () => {
    if (!config.adminEnabled || !getAdminToken()) {
      setAdmin({ checking: config.loading, isAdmin: false });
      return;
    }
    try {
      await adminApi('verify');
      setAdmin({ checking: false, isAdmin: true });
    } catch {
      setAdminToken('');
      setAdmin({ checking: false, isAdmin: false });
    }
  }, [config.adminEnabled, config.loading]);

  useEffect(() => {
    recheck();
    window.addEventListener(ADMIN_EVENT, recheck);
    return () => window.removeEventListener(ADMIN_EVENT, recheck);
  }, [recheck]);

  const value = useMemo(() => ({ ...config, admin: { ...admin, recheck } }), [config, admin, recheck]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useConfig = () => useContext(Ctx);
export const useAdmin = () => useContext(Ctx).admin;
