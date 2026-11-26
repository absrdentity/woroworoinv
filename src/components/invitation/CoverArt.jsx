/** Ornamen cover per template (SVG/CSS). Warna mengikuti variabel tema. */

function Flower({ x, y, r = 14, rot = 0, fill = 'var(--t-accent)', op = 0.9 }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`} opacity={op}>
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx="0" cy={-r * 0.62} rx={r * 0.5} ry={r * 0.72} fill={fill} transform={`rotate(${a})`} />
      ))}
      <circle r={r * 0.22} fill="#fff" opacity="0.9" />
    </g>
  );
}

function Leaf({ x, y, r = 12, rot = 0, fill = 'var(--t-accent)', op = 0.85 }) {
  return (
    <path
      d={`M0 0 C ${r * 0.9} ${-r * 0.5} ${r * 0.9} ${-r * 1.7} 0 ${-r * 2.4} C ${-r * 0.9} ${-r * 1.7} ${-r * 0.9} ${-r * 0.5} 0 0 Z`}
      transform={`translate(${x} ${y}) rotate(${rot})`}
      fill={fill}
      opacity={op}
    />
  );
}

function Blossom() {
  return (
    <svg className="art art--blossom" viewBox="0 0 400 700" preserveAspectRatio="xMidYMid slice">
      <g className="art-sway">
        <path d="M410 -10 C 330 40 300 90 230 130 S 120 190 60 250" fill="none" stroke="var(--t-ink)" strokeOpacity=".45" strokeWidth="3" strokeLinecap="round" />
        <path d="M300 70 C 280 110 250 130 215 135" fill="none" stroke="var(--t-ink)" strokeOpacity=".4" strokeWidth="2" strokeLinecap="round" />
        <Flower x={330} y={55} r={22} rot={10} />
        <Flower x={265} y={100} r={17} rot={40} />
        <Flower x={215} y={138} r={24} rot={-10} />
        <Flower x={150} y={175} r={15} rot={25} op={0.75} />
        <Flower x={95} y={225} r={20} rot={-30} />
        <Flower x={365} y={110} r={12} rot={0} op={0.7} />
      </g>
      <g className="art-sway art-sway--b">
        <path d="M-10 720 C 60 650 110 640 170 600 S 270 540 330 520" fill="none" stroke="var(--t-ink)" strokeOpacity=".45" strokeWidth="3" strokeLinecap="round" />
        <Flower x={40} y={655} r={22} rot={20} />
        <Flower x={110} y={625} r={16} rot={-20} />
        <Flower x={185} y={590} r={23} rot={5} />
        <Flower x={255} y={550} r={14} rot={50} op={0.75} />
        <Flower x={325} y={520} r={19} rot={-40} />
      </g>
    </svg>
  );
}

function Leaves() {
  const arc = [];
  for (let i = 0; i < 9; i += 1) arc.push(i);
  return (
    <svg className="art art--leaves" viewBox="0 0 400 700" preserveAspectRatio="xMidYMid slice">
      <g className="art-sway">
        <path d="M-10 40 C 90 20 190 70 260 20" fill="none" stroke="var(--t-accent)" strokeWidth="2.5" strokeLinecap="round" />
        {arc.map((i) => (
          <g key={i}>
            <Leaf x={10 + i * 30} y={36 + Math.sin(i * 0.9) * 18} r={11 + (i % 3) * 2} rot={-60 + i * 14} />
            <Leaf x={20 + i * 30} y={34 + Math.sin(i * 0.9) * 18} r={9 + (i % 2) * 3} rot={120 + i * 10} fill="var(--t-ink)" op={0.35} />
          </g>
        ))}
      </g>
      <g className="art-sway art-sway--b">
        <path d="M410 660 C 310 690 210 640 140 690" fill="none" stroke="var(--t-accent)" strokeWidth="2.5" strokeLinecap="round" />
        {arc.map((i) => (
          <g key={i}>
            <Leaf x={390 - i * 30} y={664 - Math.sin(i * 0.9) * 18} r={11 + (i % 3) * 2} rot={120 + i * 14} />
            <Leaf x={380 - i * 30} y={666 - Math.sin(i * 0.9) * 18} r={9 + (i % 2) * 3} rot={-60 + i * 10} fill="var(--t-ink)" op={0.35} />
          </g>
        ))}
      </g>
      <circle cx="200" cy="350" r="150" fill="none" stroke="var(--t-line)" strokeWidth="1.5" strokeDasharray="3 7" className="art-spin" />
    </svg>
  );
}

function Frame() {
  const corner = (rot, x, y) => (
    <g transform={`translate(${x} ${y}) rotate(${rot})`} className="art-corner">
      <path d="M0 0 L 46 0 M0 0 L 0 46" stroke="var(--t-accent)" strokeWidth="2" fill="none" />
      <path d="M10 10 C 30 10 40 20 40 40 M10 10 C 10 30 20 40 40 40" stroke="var(--t-accent)" strokeWidth="1.2" fill="none" opacity=".8" />
      <circle cx="10" cy="10" r="3" fill="var(--t-accent)" />
    </g>
  );
  return (
    <svg className="art art--frame" viewBox="0 0 400 700" preserveAspectRatio="xMidYMid slice">
      <rect x="22" y="22" width="356" height="656" fill="none" stroke="var(--t-accent)" strokeWidth="1.5" className="art-draw" />
      <rect x="34" y="34" width="332" height="632" fill="none" stroke="var(--t-accent)" strokeOpacity=".5" strokeWidth="1" />
      {corner(0, 22, 22)}
      {corner(90, 378, 22)}
      {corner(180, 378, 678)}
      {corner(270, 22, 678)}
      <g transform="translate(200 120)">
        <path d="M-60 0 H-14 M14 0 H60" stroke="var(--t-accent)" strokeWidth="1.2" />
        <path d="M0 -10 L8 0 L0 10 L-8 0Z" fill="var(--t-accent)" />
      </g>
      <g transform="translate(200 590)">
        <path d="M-60 0 H-14 M14 0 H60" stroke="var(--t-accent)" strokeWidth="1.2" />
        <path d="M0 -10 L8 0 L0 10 L-8 0Z" fill="var(--t-accent)" />
      </g>
    </svg>
  );
}

function Moon() {
  return (
    <svg className="art art--moon" viewBox="0 0 400 700" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id="moonglow">
          <stop offset="0" stopColor="#CFE0FF" stopOpacity=".55" />
          <stop offset="1" stopColor="#CFE0FF" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="300" cy="110" r="120" fill="url(#moonglow)" className="art-pulse" />
      <path d="M300 62 a50 50 0 1 0 38 82 a40 40 0 1 1 -38 -82z" fill="#F3F6FF" className="art-bob" />
      <g fill="var(--t-ink)" opacity=".9">
        {[[60, 90], [120, 40], [200, 150], [350, 220], [40, 260], [250, 40]].map(([x, y], i) => (
          <path key={i} className="art-twinkle" style={{ animationDelay: `${i * 0.5}s` }} transform={`translate(${x} ${y}) scale(${0.35 + (i % 3) * 0.12})`} d="M0 -10 C1 -3 3 -1 10 0 C3 1 1 3 0 10 C-1 3 -3 1 -10 0 C-3 -1 -1 -3 0 -10Z" />
        ))}
      </g>
      <path d="M0 700 L0 620 Q 60 560 120 610 T 240 600 T 400 590 L400 700Z" fill="#0A1226" opacity=".7" />
      <path d="M0 700 L0 650 Q 80 600 160 650 T 320 640 T 400 630 L400 700Z" fill="#050B1A" opacity=".8" />
    </svg>
  );
}

function Waves() {
  return (
    <svg className="art art--waves" viewBox="0 0 400 700" preserveAspectRatio="xMidYMax slice">
      {[0.35, 0.55, 0.9].map((op, i) => (
        <g key={i} className={`art-wave art-wave--${i}`} opacity={op}>
          <path d={`M0 ${590 + i * 28} q 50 -26 100 0 t 100 0 t 100 0 t 100 0 t 100 0 t 100 0 t 100 0 t 100 0 V 720 H0Z`} fill="var(--t-accent)" />
        </g>
      ))}
      <g className="art-bob">
        <circle cx="64" cy="110" r="34" fill="#FFD66B" opacity=".9" />
        <circle cx="64" cy="110" r="52" fill="#FFD66B" opacity=".25" className="art-pulse" />
      </g>
    </svg>
  );
}

function Roses() {
  return (
    <svg className="art art--roses" viewBox="0 0 400 700" preserveAspectRatio="xMidYMid slice">
      <g className="art-beat" style={{ transformOrigin: '200px 330px' }}>
        <path d="M200 520 C 60 420 40 300 110 250 C 150 222 190 240 200 275 C 210 240 250 222 290 250 C 360 300 340 420 200 520Z" fill="none" stroke="var(--t-accent)" strokeOpacity=".45" strokeWidth="1.5" />
      </g>
      {[[40, 60, 34], [350, 70, 26], [60, 640, 30], [350, 630, 36]].map(([x, y, r], i) => (
        <g key={i} className="art-sway" style={{ animationDelay: `${i * 0.6}s` }}>
          <circle cx={x} cy={y} r={r} fill="var(--t-accent)" opacity=".85" />
          <path d={`M${x - r * 0.5} ${y} a${r * 0.5} ${r * 0.5} 0 1 1 ${r} 0 a${r * 0.35} ${r * 0.35} 0 1 1 ${-r * 0.7} 0`} fill="none" stroke="var(--t-bg)" strokeWidth="2" opacity=".8" />
          <Leaf x={x + r * 0.9} y={y + r * 0.4} r={r * 0.45} rot={110} fill="#2E7D5B" op={0.8} />
          <Leaf x={x - r * 0.9} y={y + r * 0.4} r={r * 0.45} rot={-110} fill="#2E7D5B" op={0.8} />
        </g>
      ))}
    </svg>
  );
}

function Aurora() {
  return (
    <div className="art art--aurora" aria-hidden="true">
      <span className="blob blob--1" />
      <span className="blob blob--2" />
      <span className="blob blob--3" />
      <span className="ring ring--1" />
      <span className="ring ring--2" />
    </div>
  );
}

function Balloons() {
  const B = ({ x, c, d, s = 1 }) => (
    <g transform={`translate(${x} 0)`}>
      <g className="art-bob" style={{ animationDelay: `${d}s` }}>
      <g transform={`translate(0 600) scale(${s}) translate(0 -600)`}>
        <ellipse cx="0" cy="560" rx="26" ry="32" fill={c} />
        <ellipse cx="-8" cy="548" rx="6" ry="9" fill="#fff" opacity=".4" />
        <path d="M-4 592 L4 592 L0 598Z" fill={c} />
        <path d="M0 598 C -6 630 6 650 0 690" fill="none" stroke="var(--t-ink)" strokeOpacity=".4" strokeWidth="1.3" />
      </g>
      </g>
    </g>
  );
  return (
    <svg className="art art--balloons" viewBox="0 0 400 700" preserveAspectRatio="xMidYMax slice">
      <B x={50} c="#F2557A" d={0} />
      <B x={105} c="#FFB300" d={0.7} s={0.85} />
      <B x={350} c="#2EC4B6" d={0.3} />
      <B x={300} c="#6C63FF" d={1.1} s={0.85} />
      <g className="art-sway">
        <path d="M0 0 Q 100 60 200 20 T 400 40" fill="none" stroke="var(--t-ink)" strokeOpacity=".4" strokeWidth="1.5" />
        {[20, 70, 120, 170, 220, 270, 320, 370].map((x, i) => (
          <path key={x} d={`M${x} ${28 + (i % 2) * 18} l 10 0 l -5 18Z`} fill={['#F2557A', '#FFB300', '#2EC4B6', '#6C63FF'][i % 4]} />
        ))}
      </g>
    </svg>
  );
}

function Geo() {
  return (
    <svg className="art art--geo" viewBox="0 0 400 700" preserveAspectRatio="xMidYMid slice">
      <g transform="translate(200 350)">
        <g className="art-spin" fill="none" stroke="var(--t-ink)" strokeOpacity=".25" strokeWidth="1">
          <circle r="150" />
          <circle r="110" strokeDasharray="2 6" />
          <rect x="-105" y="-105" width="210" height="210" />
        </g>
        <g className="art-spin art-spin--rev" fill="none" stroke="var(--t-accent)" strokeOpacity=".5" strokeWidth="1">
          <rect x="-78" y="-78" width="156" height="156" />
          <circle r="78" />
        </g>
      </g>
      <path d="M40 70 H110 M40 80 H80" stroke="var(--t-ink)" strokeWidth="2" className="art-draw" />
      <path d="M290 640 H360 M320 650 H360" stroke="var(--t-ink)" strokeWidth="2" className="art-draw" />
      <circle cx="350" cy="80" r="6" fill="#B3472F" className="art-pulse" />
    </svg>
  );
}

const MAP = { blossom: Blossom, leaves: Leaves, frame: Frame, moon: Moon, waves: Waves, roses: Roses, aurora: Aurora, balloons: Balloons, geo: Geo };

export default function CoverArt({ kind }) {
  const C = MAP[kind];
  return C ? <C /> : null;
}
