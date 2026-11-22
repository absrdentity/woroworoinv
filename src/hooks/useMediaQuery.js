import { useEffect, useState } from 'react';

export function useMediaQuery(query) {
  const get = () => typeof window !== 'undefined' && window.matchMedia(query).matches;
  const [matches, setMatches] = useState(get);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);
  return matches;
}

/** Tampilan mobile dipakai pada lebar layar <= 820px. */
export const MOBILE_QUERY = '(max-width: 820px)';
export const useIsMobile = () => useMediaQuery(MOBILE_QUERY);
