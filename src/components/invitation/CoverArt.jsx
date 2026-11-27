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

/* ---------- Jawa: kawung, gunungan (kayon), parang ---------- */
function Kawung({ x, y, r = 16, op = 0.5, fill = 'var(--t-accent)' }) {
  return (
    <g transform={`translate(${x} ${y})`} opacity={op}>
      {[0, 90, 180, 270].map((a) => (
        <ellipse key={a} cx="0" cy={-r * 0.5} rx={r * 0.3} ry={r * 0.52} fill="none" stroke={fill} strokeWidth="1.3" transform={`rotate(${a})`} />
      ))}
      <circle r={r * 0.11} fill={fill} />
    </g>
  );
}

function Gunungan() {
  const top = [];
  const bot = [];
  for (let r = 0; r < 2; r += 1) {
    for (let c = 0; c < 9; c += 1) {
      const x = 22 + c * 44 + (r % 2) * 22;
      top.push(<Kawung key={`t${r}-${c}`} x={x} y={26 + r * 30} r={19} op={r ? 0.3 : 0.5} />);
      bot.push(<Kawung key={`b${r}-${c}`} x={x} y={674 - r * 30} r={19} op={r ? 0.3 : 0.5} />);
    }
  }
  const body = 'M200 118 C 232 172 288 208 288 288 C 288 346 258 392 260 446 L 260 566 L 140 566 L 140 446 C 142 392 112 346 112 288 C 112 208 168 172 200 118 Z';
  return (
    <svg className="art art--gunungan" viewBox="0 0 400 700" preserveAspectRatio="xMidYMid slice">
      <rect x="14" y="14" width="372" height="672" fill="none" stroke="var(--t-accent)" strokeWidth="1.6" className="art-draw" />
      <rect x="22" y="22" width="356" height="656" fill="none" stroke="var(--t-accent)" strokeOpacity=".45" strokeWidth="1" />
      {top}
      {bot}
      <g className="art-bob">
        <g fill="none" stroke="var(--t-accent)" strokeLinecap="round">
          <path d={body} strokeWidth="2.2" opacity=".75" />
          <path d="M200 150 C 224 190 262 214 262 288 C 262 336 240 376 242 430 L 242 548 L 158 548 L 158 430 C 160 376 138 336 138 288 C 138 214 176 190 200 150 Z" strokeWidth="1.2" opacity=".4" />
          <path d="M200 205 C 214 232 226 246 226 280 C 226 316 214 330 200 352 C 186 330 174 316 174 280 C 174 246 186 232 200 205 Z" strokeWidth="1.2" opacity=".5" />
          <path d="M170 566 V 470 Q 170 440 200 440 Q 230 440 230 470 V 566" strokeWidth="1.4" opacity=".5" />
          <path d="M200 372 C 190 392 190 412 200 428 C 210 412 210 392 200 372" strokeWidth="1.1" opacity=".5" />
        </g>
        <circle cx="200" cy="268" r="6" fill="var(--t-accent)" opacity=".5" />
      </g>
      <g className="art-sway">
        {[-1, 1].map((d) => (
          <path key={d} d={`M${200 + d * 36} 566 c ${d * 14} -30 ${d * 6} -58 ${d * 30} -80 s ${d * 6} -50 ${d * 28} -66`} fill="none" stroke="var(--t-accent)" strokeWidth="1.4" opacity=".4" />
        ))}
      </g>
      <g className="art-spin">
        <circle cx="200" cy="350" r="180" fill="none" stroke="var(--t-line)" strokeWidth="1.2" strokeDasharray="2 8" />
      </g>
    </svg>
  );
}

/* ---------- Melati: roncen melati menjuntai + janur ---------- */
function Melati() {
  const strands = [[30, 230, 0], [70, 160, 0.6], [110, 200, 1.2], [290, 190, 0.3], [330, 150, 0.9], [370, 240, 1.5]];
  const Jas = ({ x, y, r }) => (
    <g transform={`translate(${x} ${y})`}>
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx="0" cy={-r * 0.62} rx={r * 0.42} ry={r * 0.74} fill="#FBF8EC" transform={`rotate(${a})`} />
      ))}
      <circle r={r * 0.2} fill="#D9B86A" />
    </g>
  );
  return (
    <svg className="art art--melati" viewBox="0 0 400 700" preserveAspectRatio="xMidYMid slice">
      <path d="M-10 0 H410" stroke="var(--t-accent)" strokeWidth="3" opacity=".7" />
      {strands.map(([x, len, d], i) => (
        <g key={x} className="art-hang" style={{ animationDelay: `${-d * 2}s`, '--ox': `${x}px` }}>
          <path d={`M${x} 0 V ${len}`} stroke="#5F8F5F" strokeWidth="1.5" opacity=".8" />
          {Array.from({ length: Math.floor(len / 26) }, (_, k) => (
            <g key={k}>
              <Jas x={x + (k % 2 ? 3 : -3)} y={20 + k * 26} r={9 + (k % 3)} />
              {k % 3 === 0 && <Leaf x={x + 8} y={26 + k * 26} r={5} rot={100} fill="#6FA06F" op={0.85} />}
            </g>
          ))}
          <path d={`M${x} ${len + 6} l -5 14 l 5 -4 l 5 4 z`} fill="var(--t-accent)" />
        </g>
      ))}
      <g className="art-sway art-sway--b">
        <path d="M-10 700 C 60 600 150 560 230 560" fill="none" stroke="#5F8F5F" strokeWidth="3" strokeLinecap="round" opacity=".8" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Leaf key={i} x={10 + i * 38} y={680 - i * 20} r={16} rot={30 + i * 6} fill="#4F8C5C" op={0.85} />
        ))}
        {[[40, 652], [96, 622], [152, 596], [206, 576]].map(([x, y], i) => (
          <Jas key={i} x={x} y={y} r={14} />
        ))}
      </g>
      <g className="art-sway">
        <path d="M410 700 C 340 610 270 590 210 600" fill="none" stroke="#5F8F5F" strokeWidth="3" strokeLinecap="round" opacity=".8" />
        {[0, 1, 2, 3, 4].map((i) => (
          <Leaf key={i} x={394 - i * 38} y={690 - i * 18} r={16} rot={-30 - i * 6} fill="#4F8C5C" op={0.85} />
        ))}
        {[[362, 650], [310, 624]].map(([x, y], i) => (
          <Jas key={i} x={x} y={y} r={14} />
        ))}
      </g>
    </svg>
  );
}

/* ---------- Islami: bintang 8 sudut, lentera, kubah ---------- */
function Arabesque() {
  const star = (r, rot = 0) => {
    const pts = [];
    for (let i = 0; i < 16; i += 1) {
      const rad = ((i * 22.5 + rot) * Math.PI) / 180;
      const rr = i % 2 ? r * 0.72 : r;
      pts.push(`${(Math.cos(rad) * rr).toFixed(1)},${(Math.sin(rad) * rr).toFixed(1)}`);
    }
    return pts.join(' ');
  };
  const Lantern = ({ x, len, d }) => (
    <g className="art-hang" style={{ animationDelay: `${d}s`, '--ox': `${x}px` }}>
      <path d={`M${x} 0 V ${len}`} stroke="var(--t-accent)" strokeWidth="1.3" opacity=".7" />
      <path d={`M${x - 11} ${len} h22 l5 8 h-32 z`} fill="var(--t-accent)" />
      <path d={`M${x - 14} ${len + 8} h28 l-3 40 h-22 z`} fill="#F2C14E" opacity=".9" className="art-pulse" />
      <path d={`M${x - 14} ${len + 8} h28 l-3 40 h-22 z`} fill="none" stroke="var(--t-accent)" strokeWidth="1.5" />
      <path d={`M${x - 8} ${len + 48} h16 l-3 9 h-10 z`} fill="var(--t-accent)" />
    </g>
  );
  return (
    <svg className="art art--arabesque" viewBox="0 0 400 700" preserveAspectRatio="xMidYMid slice">
      <path d="M200 40 C 150 60 120 60 70 40 V 700 H 330 V 40 C 280 60 250 60 200 40Z" fill="none" />
      <g transform="translate(200 350)" fill="none" stroke="var(--t-accent)">
        <g className="art-spin">
          <polygon points={star(190)} strokeWidth="1.2" opacity=".45" />
          <polygon points={star(150, 11.25)} strokeWidth="1" opacity=".35" />
        </g>
        <g className="art-spin art-spin--rev">
          <polygon points={star(110)} strokeWidth="1.2" opacity=".4" />
          <circle r="70" strokeDasharray="2 6" opacity=".5" />
        </g>
      </g>
      <Lantern x={46} len={120} d={0} />
      <Lantern x={354} len={160} d={-1.6} />
      <g className="art-bob" fill="var(--t-accent)">
        <path d="M200 40 a22 22 0 1 0 14 38 a17 17 0 1 1 -14 -38z" opacity=".9" />
        <path className="art-twinkle" transform="translate(236 52) scale(.5)" d="M0 -10 C1 -3 3 -1 10 0 C3 1 1 3 0 10 C-1 3 -3 1 -10 0 C-3 -1 -1 -3 0 -10Z" />
      </g>
      <g fill="var(--t-accent)" opacity=".28">
        <path d="M0 700 V 640 H 30 V 600 a14 14 0 0 1 28 0 V 640 H 80 V 610 Q 120 540 160 610 V 640 H 240 V 610 Q 280 540 320 610 V 640 H 350 V 596 a14 14 0 0 1 28 0 V 640 H 400 V 700Z" />
        <rect x="36" y="520" width="4" height="82" />
        <rect x="360" y="516" width="4" height="82" />
        <path d="M120 590 L 120 520 L 124 590" />
        <circle cx="140" cy="560" r="3" />
      </g>
    </svg>
  );
}

/* ---------- Art Deco: kipas matahari & bingkai bertingkat ---------- */
function Fan() {
  const rays = Array.from({ length: 17 }, (_, i) => -80 + i * 10);
  const fan = (cy, sign) => (
    <g className="art-pulse">
      {rays.map((a) => (
        <line key={a} x1="200" y1={cy} x2={200 + Math.sin((a * Math.PI) / 180) * 190} y2={cy + sign * Math.cos((a * Math.PI) / 180) * 190} stroke="var(--t-accent)" strokeWidth="1" opacity=".55" />
      ))}
      {[190, 150, 110, 70, 36].map((r) => (
        <path key={r} d={`M${200 - r} ${cy} A ${r} ${r} 0 0 ${sign > 0 ? 0 : 1} ${200 + r} ${cy}`} fill="none" stroke="var(--t-accent)" strokeWidth="1.3" opacity=".7" />
      ))}
    </g>
  );
  const step = (x, y, dx, dy) => <path d={`M${x} ${y} h${dx * 40} v${dy * 10} h${dx * 14} v${dy * 10} h${dx * 14} v${dy * 10}`} fill="none" stroke="var(--t-accent)" strokeWidth="1.6" />;
  return (
    <svg className="art art--fan" viewBox="0 0 400 700" preserveAspectRatio="xMidYMid slice">
      <rect x="18" y="18" width="364" height="664" fill="none" stroke="var(--t-accent)" strokeWidth="1.6" className="art-draw" />
      <rect x="28" y="28" width="344" height="644" fill="none" stroke="var(--t-accent)" strokeOpacity=".4" strokeWidth="1" />
      {fan(28, 1)}
      {fan(672, -1)}
      {step(18, 70, 1, 1)}
      {step(382, 70, -1, 1)}
      {step(18, 630, 1, -1)}
      {step(382, 630, -1, -1)}
      <g transform="translate(200 350)" opacity=".5" className="art-spin">
        <path d="M0 -150 L 18 -18 L 150 0 L 18 18 L 0 150 L -18 18 L -150 0 L -18 -18Z" fill="none" stroke="var(--t-accent)" strokeWidth="1" />
      </g>
    </svg>
  );
}

/* ---------- Boho: lengkung pelangi tanah + pampas ---------- */
function Arches() {
  const arch = (w, top, c, op) => (
    <path d={`M${200 - w} 560 V ${top + w} A ${w} ${w} 0 0 1 ${200 + w} ${top + w} V 560`} fill="none" stroke={c} strokeWidth="9" opacity={op} strokeLinecap="round" />
  );
  const Pampas = ({ x, h, rot, d }) => (
    <g transform={`translate(${x} 700) rotate(${rot})`}>
     <g className="art-sway art-sway--base" style={{ animationDelay: `${d}s` }}>
      <path d={`M0 0 C ${rot > 0 ? -8 : 8} ${-h * 0.5} 0 ${-h * 0.8} 0 ${-h}`} fill="none" stroke="#B58B6B" strokeWidth="1.6" />
      {[0.55, 0.65, 0.75, 0.85, 0.95].map((t, i) => (
        <g key={i}>
          <ellipse cx={-7 - i} cy={-h * t} rx="4" ry={h * 0.12} fill="#E8C9A8" opacity=".9" transform={`rotate(${-24 + i * 3} ${-7 - i} ${-h * t})`} />
          <ellipse cx={7 + i} cy={-h * t} rx="4" ry={h * 0.12} fill="#D9A38A" opacity=".85" transform={`rotate(${24 - i * 3} ${7 + i} ${-h * t})`} />
        </g>
      ))}
      <ellipse cx="0" cy={-h} rx="4.5" ry={h * 0.14} fill="#F3E2CF" />
     </g>
    </g>
  );
  return (
    <svg className="art art--arches" viewBox="0 0 400 700" preserveAspectRatio="xMidYMid slice">
      <g className="art-bob">
        {arch(150, 110, '#C4694A', 0.9)}
        {arch(126, 134, '#D9A38A', 0.9)}
        {arch(102, 158, '#E8C9A8', 0.95)}
        {arch(78, 182, '#A3B18A', 0.85)}
      </g>
      <circle cx="200" cy="106" r="26" fill="#C4694A" opacity=".85" className="art-pulse" />
      <path d="M40 560 H360" stroke="#5B3A2E" strokeOpacity=".4" strokeWidth="1.4" />
      <Pampas x={46} h={190} rot={-6} d={0} />
      <Pampas x={76} h={140} rot={6} d={-1.5} />
      <Pampas x={352} h={200} rot={6} d={-0.8} />
      <Pampas x={322} h={130} rot={-5} d={-2.5} />
      {[[60, 40], [340, 54], [100, 650]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3" fill="#C4694A" className="art-twinkle" style={{ animationDelay: `${i * 0.6}s` }} />
      ))}
    </svg>
  );
}

/* ---------- Tropis: daun palem, hibiscus ---------- */
function Frond({ x, y, rot, len = 220, fill = '#2E8B57', d = 0 }) {
  const n = 9;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <g className="art-sway art-sway--base" style={{ animationDelay: `${d}s` }}>
        <path d={`M0 0 Q ${len * 0.25} ${-len * 0.1} ${len} ${len * 0.1}`} fill="none" stroke="#1F6B43" strokeWidth="3" strokeLinecap="round" />
        {Array.from({ length: n }, (_, i) => {
          const t = (i + 1) / (n + 1);
          const px = len * t;
          const py = len * (0.1 * t * (2 - t * 0.5) - 0.1 * t * 0.0) * 0.9 - len * 0.025 * t;
          const L = 50 - i * 3.4;
          return (
            <g key={i}>
              <ellipse cx={px + 6} cy={py - L * 0.45} rx="5" ry={L * 0.5} fill={fill} opacity=".9" transform={`rotate(-28 ${px} ${py})`} />
              <ellipse cx={px + 6} cy={py + L * 0.45} rx="5" ry={L * 0.5} fill={fill} opacity=".8" transform={`rotate(28 ${px} ${py})`} />
            </g>
          );
        })}
      </g>
    </g>
  );
}

function Hibiscus({ x, y, r = 26, rot = 0 }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`} className="art-bob">
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx="0" cy={-r * 0.6} rx={r * 0.55} ry={r * 0.78} fill="#E4572E" transform={`rotate(${a})`} opacity=".95" />
      ))}
      <circle r={r * 0.3} fill="#FFB400" opacity=".85" />
      <path d={`M0 0 Q ${r * 0.2} ${-r * 0.8} ${r * 0.1} ${-r * 1.1}`} stroke="#FFE8A3" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <circle cx={r * 0.1} cy={-r * 1.1} r="3" fill="#FFB400" />
    </g>
  );
}

function Jungle() {
  return (
    <svg className="art art--jungle" viewBox="0 0 400 700" preserveAspectRatio="xMidYMid slice">
      <Frond x={-10} y={30} rot={22} len={240} d={0} />
      <Frond x={-10} y={30} rot={50} len={200} fill="#3FA66A" d={-1.2} />
      <Frond x={410} y={20} rot={158} len={240} d={-0.6} />
      <Frond x={410} y={20} rot={130} len={200} fill="#3FA66A" d={-1.8} />
      <Frond x={-10} y={700} rot={-30} len={230} fill="#3FA66A" d={-2} />
      <Frond x={410} y={700} rot={210} len={230} d={-1} />
      <Hibiscus x={62} y={634} r={28} rot={-10} />
      <Hibiscus x={348} y={96} r={22} rot={20} />
      <Hibiscus x={338} y={640} r={18} rot={15} />
    </svg>
  );
}

const MAP = { blossom: Blossom, leaves: Leaves, frame: Frame, moon: Moon, waves: Waves, roses: Roses, balloons: Balloons, geo: Geo, gunungan: Gunungan, roncen: Melati, arabesque: Arabesque, fan: Fan, arches: Arches, jungle: Jungle };

export default function CoverArt({ kind }) {
  const C = MAP[kind];
  return C ? <C /> : null;
}
