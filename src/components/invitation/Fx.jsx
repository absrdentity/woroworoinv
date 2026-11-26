import { useMemo } from 'react';

/** PRNG deterministik agar partikel stabil tiap render. */
function rng(seedStr) {
  let h = 2166136261;
  for (const ch of seedStr) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
  return () => {
    h = (h + 0x6d2b79f5) >>> 0;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const RANGE = {
  // [ukuran min, max (px)], [durasi min, max (detik)]
  petal: [[10, 18], [9, 16]],
  leaf: [[12, 20], [10, 18]],
  sparkle: [[8, 16], [3, 6]],
  star: [[2, 4], [2, 5]],
  bubble: [[8, 26], [9, 16]],
  heart: [[10, 22], [8, 14]],
  orb: [[90, 170], [14, 24]],
  confetti: [[6, 10], [6, 11]],
  shape: [[14, 34], [14, 24]],
};

/**
 * Lapisan efek partikel. Ukuran mengikuti kontainer (container query units),
 * sehingga sama baiknya di layar ponsel maupun desktop.
 */
export default function Fx({ kind, colors = ['#fff'], count = 18, seed = 'x' }) {
  const items = useMemo(() => {
    const r = rng(`${seed}-${kind}`);
    const [sz, du] = RANGE[kind] || RANGE.petal;
    return Array.from({ length: count }, (_, i) => {
      const size = sz[0] + r() * (sz[1] - sz[0]);
      const dur = du[0] + r() * (du[1] - du[0]);
      return {
        k: i,
        x: (r() * 100).toFixed(1),
        y: (r() * 100).toFixed(1),
        s: size.toFixed(1),
        d: dur.toFixed(1),
        dl: (-r() * dur).toFixed(1), // negatif: animasi langsung berjalan di tengah
        sw: (10 + r() * 28).toFixed(0),
        rot: (r() * 360).toFixed(0),
        c: colors[i % colors.length],
        v: Math.floor(r() * 3),
      };
    });
  }, [kind, count, seed, colors]);

  return (
    <div className={`fx-layer fx-layer--${kind}`} aria-hidden="true">
      {items.map((p) => (
        <i
          key={p.k}
          className={`fx fx--${kind} fx--v${p.v}`}
          style={{
            '--x': `${p.x}%`,
            '--y': `${p.y}%`,
            '--s': `${p.s}px`,
            '--d': `${p.d}s`,
            '--dl': `${p.dl}s`,
            '--sw': `${p.sw}px`,
            '--rot': `${p.rot}deg`,
            '--c': p.c,
          }}
        >
          <b />
        </i>
      ))}
      {kind === 'star' && <span className="fx-shoot" />}
      {kind === 'star' && <span className="fx-shoot fx-shoot--2" />}
    </div>
  );
}
