/* Elite Chess: the animated flyovers that cross the board in seasonal and holiday themes (Santa's sleigh, the
   witch on her broom, a vampire, the dragon dance, fireworks …). Hand-drawn SVG with shading, and SMIL animation
   for the moving parts (galloping legs, flapping wings, capes and hair in the wind, glitter trails). The app moves
   each scene across the board (core.js flyover); motion: ltr / rtl / wave / hop / rise / burst / arc / swoop. */
(() => {
/* ---------- drawing helpers ---------- */
const stops = s => s.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a != null ? ` stop-opacity="${a}"` : ''}/>`).join('');
const lin = (id, s, x2 = 0, y2 = 1) => `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}">${stops(s)}</linearGradient>`;
const rad = (id, s, cx = .5, cy = .5, r = .5) => `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${stops(s)}</radialGradient>`;
const rep = (dur, begin = 0) => ` dur="${dur}s" begin="${begin ? -begin : 0}s" repeatCount="indefinite"`;
const morph = (vals, dur, begin = 0) => `<animate attributeName="d" values="${vals.join(';')}"${rep(dur, begin)} calcMode="spline" keySplines="${vals.slice(1).map(() => '.45 0 .55 1').join(';')}"/>`;
const turn = (vals, cx, cy, dur, begin = 0) => `<animateTransform attributeName="transform" type="rotate" values="${vals.map(v => `${v} ${cx} ${cy}`).join(';')}"${rep(dur, begin)} calcMode="spline" keySplines="${vals.slice(1).map(() => '.45 0 .55 1').join(';')}"/>`;
const bob = (dy, dur, begin = 0) => `<animateTransform attributeName="transform" type="translate" values="0 0;0 ${dy};0 0"${rep(dur, begin)} additive="sum" calcMode="spline" keySplines=".45 0 .55 1;.45 0 .55 1"/>`;
const blink = (dur, begin = 0) => `<animate attributeName="opacity" values="0;1;0"${rep(dur, begin)}/>`;
// a four-pointed glint that twinkles
const glint = (x, y, r, dur, begin, col = '#fff') => `<path d="M${x} ${y - r}Q${x + r * .18} ${y - r * .18} ${x + r} ${y}Q${x + r * .18} ${y + r * .18} ${x} ${y + r}Q${x - r * .18} ${y + r * .18} ${x - r} ${y}Q${x - r * .18} ${y - r * .18} ${x} ${y - r}Z" fill="${col}" opacity="0">${blink(dur, begin)}</path>`;
// a glittering trail: points fade in one after another behind the flyer
const trail = (pts, cols, dur = 1.2) => pts.map(([x, y, r], i) => i % 3 === 2
  ? `<circle cx="${x}" cy="${y}" r="${r * .45}" fill="${cols[i % cols.length]}" opacity="0">${blink(dur, i * dur / pts.length)}</circle>`
  : glint(x, y, r, dur, i * dur / pts.length, cols[i % cols.length])).join('');
const scatter = (n, x0, x1, y0, y1, r0, r1, seed) => { let s = seed; const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280; return Array.from({length:n}, () => [x0 + rnd() * (x1 - x0), y0 + rnd() * (y1 - y0), r0 + rnd() * (r1 - r0)]).map(p => p.map(v => +v.toFixed(1))); };
const svg = (vb, defs, body) => `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg"><defs>${defs}</defs>${body}</svg>`;

/* ---------- Christmas: Santa's sleigh and reindeer ---------- */
function reindeer(x, y, phase, opts = {}){
  const s = opts.back ? 'xmRdB' : 'xmRd', leg = opts.back ? '#4a2c14' : '#5c3818';
  const legG = (lx, ly, a, b, begin) => `<g transform="translate(${lx} ${ly})"><g><path d="M0 0c1 6 2 10 0 15l1 6" fill="none" stroke="${leg}" stroke-width="3.4" stroke-linecap="round"/><path d="M-1.4 20.5h4.6l.4 2.4h-5.6z" fill="#2a1a0c"/>${turn([a, b, a], 0, 0, .52, begin)}</g></g>`;
  const p = phase;
  return `<g transform="translate(${x} ${y})"><g>${bob(-3, .52, p)}
    ${legG(26, 40, 30, -24, p + .26)}${legG(62, 40, -34, 22, p)}
    <path d="M18 34c0-9 8-14 20-14h22c9 0 14 5 14 12 0 8-6 12-14 12H30c-8 0-12-4-12-10z" fill="url(#${s})"/>
    <path d="M28 43c9 3 26 3 36-1" stroke="#e8c79a" stroke-width="3" stroke-linecap="round" opacity=".55"/>
    <path d="M22 26c4-3 12-5 20-5" stroke="#fff" stroke-opacity=".25" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M19 29c-6-5-9-1-7 2 2 2 5 1 7-2z" fill="#fbf6ec"/>
    ${legG(30, 41, -26, 28, p + .26)}${legG(66, 41, 26, -30, p)}
    <path d="M64 30c2-10 8-16 14-18l7 6c-4 4-9 10-11 17z" fill="url(#${s})"/>
    <path d="M58 22c4 6 6 14 4 22" stroke="#b3122e" stroke-width="3.4"/><path d="M58 22c4 6 6 14 4 22" stroke="#f2c14e" stroke-width="1" stroke-dasharray="2 3"/>
    ${[[60, 28], [61.5, 34], [61.5, 40]].map(([bx, by]) => `<circle cx="${bx}" cy="${by}" r="2.3" fill="url(#xmGold)"/><circle cx="${bx - .7}" cy="${by - .8}" r=".7" fill="#fff"/>`).join('')}
    <g>${turn([-4, 5, -4], 80, 16, 1.04, p)}
      <path d="M79 4c-2-7 0-13 4-17M81-2c3-2 5-6 5-9M80 1c-4-2-7-6-7-10M85 3c1-6 5-10 9-11M87-1c3 0 5-2 7-5" fill="none" stroke="#d9b277" stroke-width="2" stroke-linecap="round"/>
      <path d="M75 8c4-6 14-7 19-1 3 3 2 7-2 9l-9 3c-6 1-9-3-8-11z" fill="url(#${s})"/>
      <path d="M89 15c3 1 6 0 7-2" stroke="#3a2010" stroke-width="1" fill="none"/>
      <path d="M77 6l-7-4 8 .5z" fill="#6b4220"/>
      <circle cx="84" cy="9" r="1.8" fill="#1a0c04"/><circle cx="84.6" cy="8.4" r=".6" fill="#fff"/>
      ${opts.rudolph ? `<circle cx="96" cy="12.5" r="9" fill="url(#xmGlow)">${blink(1.1)}</circle><circle cx="96" cy="12.5" r="3.2" fill="url(#xmNose)"/>` : '<circle cx="95.5" cy="12.5" r="2.2" fill="#2a1408"/>'}
    </g></g></g>`;
}
const christmas = svg('0 0 420 150',
  lin('xmRd', [[0, '#b07a44'], [.6, '#8a5a2b'], [1, '#5e3a18']]) + lin('xmRdB', [[0, '#946538'], [1, '#4c2e12']]) +
  lin('xmGold', [[0, '#fff2b0'], [.5, '#f2c14e'], [1, '#a8740c']]) + rad('xmGlow', [[0, '#ff3b3b', .9], [.5, '#ff3b3b', .35], [1, '#ff3b3b', 0]]) +
  rad('xmNose', [[0, '#ffd0d0'], [.4, '#ff2a2a'], [1, '#a00010']], .35, .35) + lin('xmRed', [[0, '#f0485a'], [.55, '#c8102e'], [1, '#7a0716']]) +
  lin('xmSleigh', [[0, '#e8394c'], [.5, '#b10d24'], [1, '#600512']]) + lin('xmSack', [[0, '#c8955a'], [1, '#7a4f22']]) +
  lin('xmFur', [[0, '#ffffff'], [1, '#dfe6f0']]) + rad('xmFace', [[0, '#ffe2cc'], [1, '#e9b48f']], .4, .4) +
  lin('xmTrail', [[0, '#ffe9a0', 0], [1, '#ffe9a0', .55]], 1, 0),
  // glitter trail
  `<path d="M0 112c20-2 34 2 46-2" stroke="url(#xmTrail)" stroke-width="7" stroke-linecap="round" fill="none"/>` +
  trail(scatter(16, 2, 50, 96, 124, 2.2, 4.4, 7), ['#fff6c8', '#ffd76a', '#ffffff']) +
  // reins and traces
  `<path d="M156 64C190 70 215 66 240 60M156 64C220 76 290 70 338 60" stroke="#6b3a14" stroke-width="1.3" fill="none"><animate attributeName="d" values="M156 64C190 70 215 66 240 60M156 64C220 76 290 70 338 60;M156 64C190 74 215 70 240 60M156 64C220 82 290 74 338 60;M156 64C190 70 215 66 240 60M156 64C220 76 290 70 338 60"${rep(.52)}/></path>` +
  `<path d="M172 100h70M268 100h70" stroke="#6b3a14" stroke-width="1.6"/>` +
  reindeer(270, 44, .13, {back:true}) + reindeer(178, 44, .38, {back:true}) +
  // sleigh
  `<g>${bob(-2, 1.04)}
    <path d="M60 22c-6-2-10 4-8 10l3 10 16-4z" fill="#2e7d32"/><rect x="64" y="14" width="18" height="16" rx="2" fill="#2a6fdb" transform="rotate(-12 73 22)"/><path d="M73 12v18M64 21h18" stroke="#ffd35c" stroke-width="2.4" transform="rotate(-12 73 22)"/>
    <rect x="80" y="20" width="16" height="14" rx="2" fill="#2e9d4a" transform="rotate(10 88 27)"/><path d="M88 19v16M80 27h16" stroke="#e8394c" stroke-width="2.4" transform="rotate(10 88 27)"/>
    <path d="M64 74c-8-18-2-38 14-42 8-2 13 3 15 10 6 14 5 24 1 32z" fill="url(#xmSack)"/><path d="M70 40c4 2 14 2 20-2" stroke="#5a3612" stroke-width="2" fill="none"/>
    <!-- Santa -->
    <g><path d="M100 76c0-22 10-38 27-38s25 16 25 38z" fill="url(#xmRed)"/>
      <path d="M126 40v36" stroke="url(#xmFur)" stroke-width="7"/><path d="M100 61h52" stroke="#1f1a1a" stroke-width="7"/><rect x="120" y="56.5" width="12" height="9" rx="1.6" fill="none" stroke="url(#xmGold)" stroke-width="2.4"/>
      <path d="M140 48c8 2 14 8 16 15" stroke="url(#xmRed)" stroke-width="9" stroke-linecap="round" fill="none"/><path d="M152 59l5 5" stroke="#fff" stroke-width="7" stroke-linecap="round"/><circle cx="158" cy="65" r="4.4" fill="#1b5e20"/>
      <g>${turn([-8, 26, -8], 111, 46, 1.4)}<path d="M111 46c-7-7-9-16-7-25" stroke="url(#xmRed)" stroke-width="9" stroke-linecap="round" fill="none"/><path d="M104 24l-1-5" stroke="#fff" stroke-width="7" stroke-linecap="round"/><circle cx="103" cy="15" r="4.6" fill="#1b5e20"/></g>
      <circle cx="127" cy="28" r="10" fill="url(#xmFace)"/>
      <path d="M115 30c0 14 6 22 12 22s12-8 12-22c-3 3-7 4-12 4s-9-1-12-4z" fill="url(#xmFur)"/>
      ${[[117, 38], [121, 44], [127, 48], [133, 44], [137, 38]].map(([cx, cy]) => `<circle cx="${cx}" cy="${cy}" r="3.4" fill="#fff"/>`).join('')}
      <path d="M119 33c3-2 6-2 8 1 2-3 5-3 8-1-2 3-6 4-8 2-2 2-6 1-8-2z" fill="#f4f6fa"/>
      <circle cx="127" cy="30.5" r="2.4" fill="#e98b7a"/><circle cx="121.5" cy="31" r="2.6" fill="#ff9b9b" opacity=".55"/><circle cx="132.5" cy="31" r="2.6" fill="#ff9b9b" opacity=".55"/>
      <path d="M121.5 25.5q1.5-1.6 3 0M129.5 25.5q1.5-1.6 3 0" stroke="#3a2010" stroke-width="1.1" fill="none" stroke-linecap="round"/>
      <path d="M116 22c0-12 9-19 19-16 9 3 13 9 19 13l-5 4c-5-3-9-5-13-4z" fill="url(#xmRed)"/>
      <path d="M115 21c7-4 17-4 23 0" stroke="url(#xmFur)" stroke-width="5.6" stroke-linecap="round" fill="none"/>
      <g>${turn([-12, 12, -12], 150, 20, 1.04)}<circle cx="153" cy="24" r="4.6" fill="url(#xmFur)"/></g></g>
    <!-- sleigh body -->
    <path d="M48 66h104c10 0 16 8 14 20l-4 14c-2 8-10 12-20 12H72c-18 0-28-10-28-28 0-12 2-18 4-18z" fill="url(#xmSleigh)"/>
    <path d="M50 70h98c8 0 12 5 12 12" stroke="#ff8a96" stroke-width="2" fill="none" opacity=".6"/>
    <path d="M58 92c6-8 16-8 20 0s14 8 20 0 14-8 20 0 14 8 20 0" stroke="url(#xmGold)" stroke-width="2.6" fill="none"/>
    <path d="M152 66c14-6 24 4 18 16-3 5-9 4-9-1" stroke="url(#xmGold)" stroke-width="3" fill="none"/>
    <path d="M46 66h108" stroke="url(#xmGold)" stroke-width="4" stroke-linecap="round"/>
    <path d="M76 112v14M138 112v14" stroke="url(#xmGold)" stroke-width="3"/>
    <path d="M38 128h120c20 0 28-10 26-24-1-6-6-8-9-4" stroke="url(#xmGold)" stroke-width="4" fill="none" stroke-linecap="round"/>
  </g>` +
  reindeer(260, 50, 0, {rudolph:true}) + reindeer(168, 50, .26) +
  trail(scatter(10, 175, 400, 10, 40, 1.8, 3.4, 3), ['#ffffff', '#fff6c8'], 1.8));

/* ---------- Halloween ---------- */
// the witch flies right-to-left, facing left
const witch = svg('0 0 300 170',
  lin('hwCloak', [[0, '#4b2470'], [1, '#1c0a2e']]) + lin('hwDress', [[0, '#5b2d86'], [1, '#2a1240']]) + rad('hwSkin', [[0, '#b8e08a'], [1, '#6fa046']], .35, .35) +
  lin('hwHat', [[0, '#3a1c58'], [1, '#120624']], 1, 0) + lin('hwWood', [[0, '#a8743e'], [.5, '#7a4a1e'], [1, '#4e2c0c']]) + lin('hwStraw', [[0, '#f2cf72'], [1, '#b8862a']], 1, 0) +
  lin('hwHair', [[0, '#ff8a2a'], [1, '#c2410c']], 1, 0) + rad('hwEye', [[0, '#fffbd0'], [.5, '#ffd400'], [1, '#c48a00']]) + rad('hwMagic', [[0, '#c9ff8a', .9], [1, '#7cff4a', 0]]),
  trail(scatter(18, 236, 298, 92, 140, 2, 4.8, 11), ['#b6ff6a', '#d8a8ff', '#ffffff', '#8affc9'], 1.3) +
  `<g>${bob(-5, 1.6)}
   <!-- cloak streaming behind -->
   <path d="M150 52c30 4 60 18 84 34-10 2-18 6-24 12-10-4-22-2-30 6-10-6-22-6-30-2z" fill="url(#hwCloak)">${morph(['M150 52c30 4 60 18 84 34-10 2-18 6-24 12-10-4-22-2-30 6-10-6-22-6-30-2z', 'M150 52c32 0 64 10 90 22-10 6-16 12-22 18-12-2-22 2-30 10-10-4-22-4-30 0z', 'M150 52c30 4 60 18 84 34-10 2-18 6-24 12-10-4-22-2-30 6-10-6-22-6-30-2z'], .9)}</path>
   <!-- hair -->
   ${[0, 1, 2].map(i => `<path d="M${142 + i * 2} ${34 + i * 5}c16 ${2 + i * 2} 30 ${-4 + i * 3} 46 ${4 + i * 2}" stroke="url(#hwHair)" stroke-width="${5 - i}" stroke-linecap="round" fill="none">${morph([`M${142 + i * 2} ${34 + i * 5}c16 ${2 + i * 2} 30 ${-4 + i * 3} 46 ${4 + i * 2}`, `M${142 + i * 2} ${34 + i * 5}c16 ${-4 + i * 2} 30 ${6 + i * 3} 46 ${-2 + i * 2}`, `M${142 + i * 2} ${34 + i * 5}c16 ${2 + i * 2} 30 ${-4 + i * 3} 46 ${4 + i * 2}`], .7, i * .2)}</path>`).join('')}
   <!-- broom -->
   <path d="M30 98l196-4" stroke="url(#hwWood)" stroke-width="6" stroke-linecap="round"/>
   <path d="M60 96.5l8-.2M110 95.4l9-.2M168 94.2l8-.2" stroke="#3a1e06" stroke-width="1" opacity=".6"/>
   <path d="M216 90l40-16c4 12 4 34 0 46l-40-12z" fill="url(#hwStraw)"/>
   ${Array.from({length:9}, (_, i) => `<path d="M220 ${92 + i * .6}L${258 + (i % 3) * 2} ${76 + i * 5}" stroke="#a87418" stroke-width=".9"/>`).join('')}
   <path d="M216 89v14M222 87v18" stroke="#7a3d0c" stroke-width="2.4"/>
   <!-- legs: striped stockings and boots -->
   <path d="M128 96c-6 6-14 10-24 12" stroke="#1d0d2a" stroke-width="8" stroke-linecap="round" fill="none"/>
   <path d="M126 98l-4 4M120 102l-4 3M113 105l-4 2" stroke="#ff7a1a" stroke-width="3.2"/>
   <path d="M106 104c-6 0-12 2-16 6 4 2 12 2 18-2z" fill="#140a1e"/><path d="M90 110c-3 0-5-2-5-4" stroke="#140a1e" stroke-width="2.4" fill="none" stroke-linecap="round"/>
   <!-- body and arms -->
   <path d="M122 98c-4-22 2-42 18-48 12-4 20 6 22 18l2 30z" fill="url(#hwDress)"/>
   <path d="M128 64c-6 10-10 22-12 30" stroke="#2a1240" stroke-width="8" stroke-linecap="round" fill="none"/>
   <circle cx="115" cy="95" r="4.4" fill="url(#hwSkin)"/>
   <path d="M150 66c-2 12-6 20-14 28" stroke="#3a1a5a" stroke-width="7" stroke-linecap="round" fill="none"/>
   <!-- head -->
   <path d="M126 36c0-9 7-14 15-12 7 2 10 9 9 16-1 9-8 13-15 12-6-1-9-7-9-16z" fill="url(#hwSkin)"/>
   <path d="M128 38l-12 5 12 1z" fill="#7fb24e"/><circle cx="118" cy="42.5" r="1.3" fill="#4e7a2a"/>
   <path d="M130 44c3 3 7 3 10 0" stroke="#2a3d10" stroke-width="1.4" fill="none" stroke-linecap="round"/><path d="M132 46l1 2 1-2" fill="#fff"/>
   <ellipse cx="133" cy="34" rx="2.2" ry="2.6" fill="#fff"/><circle cx="132.4" cy="34.4" r="1.3" fill="#2a1240"/>
   <path d="M130 30.5l5-1" stroke="#2a3d10" stroke-width="1.2" stroke-linecap="round"/>
   <!-- hat -->
   <ellipse cx="141" cy="26" rx="20" ry="5" fill="url(#hwHat)" transform="rotate(-8 141 26)"/>
   <path d="M130 25c4-12 14-22 30-26 6-2 12 2 16-2-2 8-10 10-16 10-6 4-10 12-12 20z" fill="url(#hwHat)">${morph(['M130 25c4-12 14-22 30-26 6-2 12 2 16-2-2 8-10 10-16 10-6 4-10 12-12 20z', 'M130 25c4-12 14-22 30-26 6-2 12 4 18 2-4 6-12 6-18 6-6 4-10 12-12 20z', 'M130 25c4-12 14-22 30-26 6-2 12 2 16-2-2 8-10 10-16 10-6 4-10 12-12 20z'], .8)}</path>
   <path d="M132 22.5c6-1.4 12-2 17-1.6" stroke="#ff7a1a" stroke-width="3.6"/><rect x="137" y="18.6" width="6" height="6" rx="1" fill="none" stroke="#ffd35c" stroke-width="1.6"/>
   <!-- the cat -->
   <g>${bob(-1.6, .8, .3)}
     <path d="M188 92c-2-12 4-20 12-20s12 8 10 20z" fill="#140a1e"/>
     <circle cx="196" cy="68" r="8" fill="#140a1e"/><path d="M189 64l-1-8 6 4zM201 60l5-4v8z" fill="#140a1e"/><path d="M190 62l0-3 2 2z" fill="#ff7aa8"/>
     <ellipse cx="193" cy="68" rx="2" ry="2.4" fill="url(#hwEye)"/><ellipse cx="199" cy="68" rx="2" ry="2.4" fill="url(#hwEye)"/><path d="M193 66.8v2.4M199 66.8v2.4" stroke="#140a1e" stroke-width=".9"/>
     <path d="M208 88c10 0 14-8 12-16" stroke="#140a1e" stroke-width="3.4" stroke-linecap="round" fill="none">${morph(['M208 88c10 0 14-8 12-16', 'M208 88c12 2 18-4 18-12', 'M208 88c10 0 14-8 12-16'], 1.4)}</path>
   </g>
  </g>` + `<circle cx="276" cy="104" r="16" fill="url(#hwMagic)" opacity=".5">${blink(1.3)}</circle>`);

// a bat with membrane wings that beat (the body stays put, the wings morph)
const batWing = (side, pose) => {
  const s = side === 'l' ? -1 : 1, P = {up:[[2, -2], [10, -16], [20, -20], [28, -14], [22, -10], [18, -4], [12, -6], [8, 0]], mid:[[2, -1], [12, -6], [22, -6], [30, -2], [24, 0], [18, 4], [12, 2], [8, 3]], down:[[2, 0], [12, 6], [20, 14], [26, 20], [20, 16], [16, 12], [10, 10], [6, 4]]}[pose];
  const q = P.map(([x, y]) => [x * s, y]);
  return `M${q[0]}C${q[1]} ${q[2]} ${q[3]}Q${q[4]} ${q[5]}Q${q[6]} ${q[7]}Z`.replace(/,/g, ' ');
};
const bat = (x, y, k, dur, begin) => `<g transform="translate(${x} ${y}) scale(${k})"><g>${bob(2, dur, begin)}
  ${['l', 'r'].map(sd => `<path d="${batWing(sd, 'up')}" fill="url(#btWing)">${morph([batWing(sd, 'up'), batWing(sd, 'mid'), batWing(sd, 'down'), batWing(sd, 'mid'), batWing(sd, 'up')], dur, begin)}</path>`).join('')}
  <ellipse rx="4" ry="5.6" fill="url(#btBody)"/><path d="M-3.4-4l-1.4-5 3 2.4zM3.4-4l1.4-5-3 2.4z" fill="#2a1438"/>
  <circle cx="-1.5" cy="-1.6" r="1" fill="#ff4d4d"/><circle cx="1.5" cy="-1.6" r="1" fill="#ff4d4d"/><path d="M-1 1.6l.5 1.2.5-1.2M.6 1.6l.5 1.2.5-1.2" fill="#fff"/></g></g>`;
const batDefs = lin('btWing', [[0, '#3b1d52'], [1, '#12061c']]) + rad('btBody', [[0, '#4a2a5e'], [1, '#160a20']], .4, .3);
const bats = svg('0 0 200 90', batDefs, bat(24, 40, 1.1, .34, 0) + bat(70, 18, .8, .3, .1) + bat(104, 56, .95, .36, .2) + bat(150, 28, .75, .32, .05) + bat(60, 70, .6, .28, .15) + bat(184, 60, .7, .33, .25));

// a vampire facing us, cape spread like bat wings (red lining inside), flying left-to-right with two bats
const capeWing = (pose, side) => {
  const P = {up:[[14, 24], [22, 58], [38, 88], [62, 110]], mid:[[10, 46], [22, 78], [42, 102], [66, 120]], down:[[18, 74], [30, 100], [50, 118], [74, 130]]}[pose];
  const f = side === 'r' ? ([x, y]) => [220 - x, y] : p => p, S = f([98, 56]), H = f([102, 122]), c1 = f([80, pose === 'down' ? 58 : 40]), c2 = f([40, pose === 'up' ? 22 : pose === 'mid' ? 40 : 66]);
  const [T, A, B, C] = P.map(f), q = (p, k) => f([P[k][0] + 10, P[k][1] - 12]);
  return `M${S}C${c1} ${c2} ${T}Q${q(0, 1)} ${A}Q${q(1, 2)} ${B}Q${q(2, 3)} ${C}Q${f([84, 112])} ${H}Z`.replace(/,/g, ' ');
};
const capeFlap = side => morph([capeWing('up', side), capeWing('mid', side), capeWing('down', side), capeWing('mid', side), capeWing('up', side)], 1.2);
const vampire = svg('0 0 220 170',
  lin('vpCape', [[0, '#2a0a12'], [1, '#05020a']]) + rad('vpLining', [[0, '#ff4d6d'], [.6, '#c8102e'], [1, '#5a0010']], .5, .3) + rad('vpFace', [[0, '#f2f6ee'], [1, '#a9b8a3']], .4, .35) +
  lin('vpSuit', [[0, '#34344a'], [1, '#08080e']]) + rad('vpEye', [[0, '#ffe0e0'], [.4, '#ff2a2a'], [1, '#8a0010']]) + lin('vpGold', [[0, '#fff2b0'], [1, '#b8860b']]) + batDefs,
  `<g>${bob(-6, 1.2)}
   ${['l', 'r'].map(sd => `<path d="${capeWing('up', sd)}" fill="url(#vpCape)">${capeFlap(sd)}</path>
     <g transform="translate(${sd === 'l' ? 98 : 122} 56) scale(.84) translate(${sd === 'l' ? -98 : -122} -56)"><path d="${capeWing('up', sd)}" fill="url(#vpLining)">${capeFlap(sd)}</path></g>`).join('')}
   <path d="M96 116l-4 40h12l6-30 6 30h12l-4-40z" fill="url(#vpSuit)"/><path d="M90 156h16M114 156h16" stroke="#05050a" stroke-width="4" stroke-linecap="round"/>
   <path d="M88 60c6-6 38-6 44 0l-4 60H92z" fill="url(#vpSuit)"/>
   <path d="M102 58l8 34 8-34z" fill="#f4f4f8"/><path d="M104 66l6 22 6-22" fill="#9b0f26"/>
   <path d="M104 60l6 4 6-4-6 4z" stroke="#05050a" stroke-width="3.4" stroke-linejoin="round"/>
   <path d="M96 60l14 22 14-22" stroke="#c8102e" stroke-width="1.4" fill="none"/><circle cx="110" cy="84" r="4" fill="url(#vpGold)"/><circle cx="110" cy="84" r="1.6" fill="#c8102e"/>
   <path d="M90 60L80 16l18 26zM130 60l10-44-18 26z" fill="#9b0f26"/><path d="M90 60L80 16l8 30zM130 60l10-44-8 30z" fill="#05020a"/>
   <path d="M97 36c0-11 6-18 13-18s13 7 13 18c0 12-6 20-13 20s-13-8-13-20z" fill="url(#vpFace)"/>
   <path d="M96 30c0-10 6-16 14-16s14 6 14 16c-3-4-6-6-9-6l-5 8-5-8c-3 0-6 2-9 6z" fill="#0c0c14"/>
   <path d="M97 34l-6-8 2 12zM123 34l6-8-2 12z" fill="url(#vpFace)"/>
   <path d="M102 34l5 2M118 34l-5 2" stroke="#0c0c14" stroke-width="1.8" stroke-linecap="round"/>
   <ellipse cx="105" cy="38" rx="2.2" ry="1.7" fill="url(#vpEye)"/><ellipse cx="115" cy="38" rx="2.2" ry="1.7" fill="url(#vpEye)"/>
   ${[105, 115].map((x, i) => `<circle cx="${x}" cy="38" r="3.6" fill="#ff2a2a" opacity="0"><animate attributeName="opacity" values="0;.35;0"${rep(1.6, i * .4)}/></circle>`).join('')}
   <path d="M110 40v5l-2 1" stroke="#7a8a74" stroke-width="1" fill="none"/>
   <path d="M104 48c4 3 8 3 12 0" stroke="#5a1a22" stroke-width="1.4" fill="none" stroke-linecap="round"/><path d="M106 48.6l1.2 3 1-2.6M112 48.6l1 2.6 1.2-3" fill="#fff"/>
  </g>` + bat(20, 30, .8, .3, .1) + bat(196, 22, .7, .34, .2));
// a friendly ghost
const ghostTail = k => `M18 34c0-20 12-30 26-30s26 10 26 30v24c-4 ${-4 + k} -8 ${4 - k} -12 0s-8 ${-4 + k} -12 0-8 ${4 - k} -12 0-8 ${-4 + k} -14 2z`;
const ghost = svg('0 0 90 80', rad('ghBody', [[0, '#ffffff'], [.7, '#eef2ff'], [1, '#c7d2fe']], .4, .3) + rad('ghGlow', [[0, '#e0e7ff', .7], [1, '#e0e7ff', 0]]),
  `<ellipse cx="44" cy="40" rx="42" ry="36" fill="url(#ghGlow)"/><g>${bob(-3, 1.4)}
   <path d="${ghostTail(0)}" fill="url(#ghBody)" opacity=".94">${morph([ghostTail(0), ghostTail(8), ghostTail(0)], .9)}</path>
   <path d="M20 30c-8 4-12 10-12 16 6-2 10-6 12-10zM68 30c8 4 12 10 12 16-6-2-10-6-12-10z" fill="url(#ghBody)">${morph(['M20 30c-8 4-12 10-12 16 6-2 10-6 12-10zM68 30c8 4 12 10 12 16-6-2-10-6-12-10z', 'M20 30c-10 0-14 4-16 8 6 0 10-2 16-4zM68 30c10 0 14 4 16 8-6 0-10-2-16-4z', 'M20 30c-8 4-12 10-12 16 6-2 10-6 12-10zM68 30c8 4 12 10 12 16-6-2-10-6-12-10z'], 1.2)}</path>
   <ellipse cx="36" cy="28" rx="4" ry="5.4" fill="#1e1b4b"/><ellipse cx="52" cy="28" rx="4" ry="5.4" fill="#1e1b4b"/><circle cx="37.4" cy="26" r="1.4" fill="#fff"/><circle cx="53.4" cy="26" r="1.4" fill="#fff"/>
   <ellipse cx="44" cy="40" rx="4" ry="5" fill="#1e1b4b"><animate attributeName="ry" values="5;3;5"${rep(1.4)}/></ellipse>
   <ellipse cx="30" cy="35" rx="3.4" ry="2" fill="#fda4af" opacity=".6"/><ellipse cx="58" cy="35" rx="3.4" ry="2" fill="#fda4af" opacity=".6"/></g>`);

/* ---------- New Year and Diwali fireworks ---------- */
function firework(cols, seed){
  const n = 28, arms = [];
  for (let i = 0; i < n; i++){
    const a = i / n * Math.PI * 2 + (seed % 7) * .05, L = 34 + (i % 3) * 5, c = cols[i % cols.length];
    const x = (L * Math.cos(a)).toFixed(1), y = (L * Math.sin(a)).toFixed(1);
    const mx = (x * .45).toFixed(1), my = (y * .45).toFixed(1);
    arms.push(`<line x1="${(x * .12).toFixed(1)}" y1="${(y * .12).toFixed(1)}" x2="${mx}" y2="${my}" stroke="${c}" stroke-width="1.1" stroke-linecap="round" opacity=".35"/><line x1="${mx}" y1="${my}" x2="${x}" y2="${y}" stroke="${c}" stroke-width="1.8" stroke-linecap="round" opacity=".9"/><circle cx="${x}" cy="${y}" r="2.1" fill="${c}"/><circle cx="${x}" cy="${y}" r=".9" fill="#fff"/>`);
    if (i % 2) arms.push(`<circle cx="${(x * .7).toFixed(1)}" cy="${(y * .7).toFixed(1)}" r="1" fill="#fff"/>`);
  }
  const defs = rad('fwFlash' + seed, [[0, '#ffffff', 1], [.4, '#fff3c4', .7], [1, '#fff3c4', 0]]);
  // rocket trail up, flash, the shell opens, sparks sag and fade, glitter twinkles
  return svg('-60 -60 120 160', defs,
    `<path d="M0 98V0" stroke="#fff3c4" stroke-width="2" stroke-linecap="round" stroke-dasharray="6 6" opacity="0"><animate attributeName="opacity" values="0;1;0;0" keyTimes="0;.08;.2;1" dur="2.6s" fill="freeze"/><animate attributeName="stroke-dashoffset" values="0;-40" dur=".5s" fill="freeze"/></path>
     <circle r="16" fill="url(#fwFlash${seed})" opacity="0"><animate attributeName="opacity" values="0;0;1;0;0" keyTimes="0;.18;.22;.34;1" dur="2.6s" fill="freeze"/></circle>
     <g opacity="0" transform="scale(.1)"><animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;.2;.24;.7;1" dur="2.6s" fill="freeze"/>
       <animateTransform attributeName="transform" type="scale" values=".1;.1;1;1.12" keyTimes="0;.2;.42;1" dur="2.6s" fill="freeze" calcMode="spline" keySplines="0 0 1 1;.1 .8 .3 1;.4 0 .6 1"/>
       <animateTransform attributeName="transform" type="translate" values="0 0;0 0;0 14" keyTimes="0;.42;1" dur="2.6s" fill="freeze" additive="sum"/>${arms.join('')}</g>
     ${scatter(10, -40, 40, -36, 50, 1.4, 2.4, seed).map(([x, y, r], i) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${i % 2 ? '#fff' : cols[0]}" opacity="0"><animate attributeName="opacity" values="0;0;1;0;1;0" keyTimes="0;.45;.55;.7;.82;1" dur="2.6s" fill="freeze"/></circle>`).join('')}`);
}

/* ---------- Lunar New Year: the dragon dance ---------- */
const WAVE = (d, amp = 14) => `<animateTransform attributeName="transform" type="translate" values="0 0;0 ${-amp};0 0;0 ${amp};0 0"${rep(1.6, 1.6 - d)} calcMode="spline" keySplines=".45 0 .55 1;.45 0 .55 1;.45 0 .55 1;.45 0 .55 1"/>`;
// one cloth segment of the dragon, held up on a pole by a dancer below
const dragonSeg = i => {
  const x = 214 - i * 19, s = 1 - i * .028, d = i * .1, r = 19 * s;
  return `<g transform="translate(${x} 0)"><g>${WAVE(d)}
    ${i % 2 === 0 ? `<path d="M0 ${64 + r}v${30 - i}" stroke="#7a4a1a" stroke-width="2.6"/><circle cy="${96 - i}" r="3" fill="#2b1a10"/><path d="M-4 ${99 - i}l-3 12M4 ${99 - i}l3 12" stroke="#2b1a10" stroke-width="2.6" stroke-linecap="round"/>` : ''}
    <path d="M${-r * .9} ${60 - r * .6}l${r * .3} ${-r * .7} ${r * .3} ${r * .4} ${r * .3} ${-r * .8} ${r * .3} ${r * .8} ${r * .3} ${-r * .7} ${r * .3} ${r * .6}" fill="url(#lnFin)" stroke="#b45309" stroke-width=".8"/>
    <circle cy="62" r="${r}" fill="url(#lnBody)"/>
    ${[-.5, 0, .5].map(k => `<path d="M${(k * r - r * .22).toFixed(1)} ${(56 - r * .3).toFixed(1)}q${(r * .22).toFixed(1)} ${(r * .3).toFixed(1)} ${(r * .44).toFixed(1)} 0" stroke="#ffd35c" stroke-width="1.4" fill="none"/>`).join('')}
    ${[-.25, .25].map(k => `<path d="M${(k * r - r * .22).toFixed(1)} ${(62).toFixed(1)}q${(r * .22).toFixed(1)} ${(r * .3).toFixed(1)} ${(r * .44).toFixed(1)} 0" stroke="#ffd35c" stroke-width="1.4" fill="none"/>`).join('')}
    <path d="M${-r * .8} ${62 + r * .55}q${r * .8} ${r * .5} ${r * 1.6} 0" stroke="url(#lnBelly)" stroke-width="${(r * .35).toFixed(1)}" fill="none" stroke-linecap="round"/>
    <path d="M${-r * .85} ${62 + r * .82}c${r * .3} ${r * .3} ${r * 1.4} ${r * .3} ${r * 1.7} 0" stroke="#fff3c4" stroke-width="1.6" stroke-dasharray="2 2" fill="none"/>
  </g></g>`;
};
const lunar = svg('0 0 320 130',
  rad('lnBody', [[0, '#ff7a6b'], [.55, '#d4161f'], [1, '#6b0006']], .4, .3) + rad('lnHead', [[0, '#ff8a7a'], [.6, '#d4161f'], [1, '#6b0006']], .35, .3) +
  lin('lnFin', [[0, '#fff2b0'], [1, '#f2a213']]) + lin('lnBelly', [[0, '#fff3c4'], [1, '#f2c14e']]) +
  rad('lnPearl', [[0, '#ffffff'], [.5, '#ffe9a0'], [1, '#f2b632']], .35, .35) + rad('lnPearlGlow', [[0, '#fff3c4', .8], [1, '#fff3c4', 0]]),
  `<g><g>${WAVE(1.0)}<path d="M50 62l-26-16 8 16-8 18z" fill="url(#lnFin)" stroke="#b45309" stroke-width="1"/><path d="M28 50l-10-8M28 74l-10 8" stroke="#ffd35c" stroke-width="1.6" stroke-linecap="round"/></g></g>` +
  Array.from({length:9}, (_, i) => 8 - i).map(i => dragonSeg(i)).join('') +
  `<g transform="translate(226 -4) scale(1.25)"><g>${WAVE(-.05, 11)}
    <path d="M-6 40c-8-6-14-16-10-26 8 4 12 10 14 18M2 38c2-10 8-18 18-20-2 8-6 14-12 20" fill="url(#lnFin)" stroke="#b45309" stroke-width="1"/>
    <path d="M-8 60c-2-16 10-26 26-26 14 0 28 6 34 16l-4 6 8 6-8 4c-4 10-16 14-30 12-14-2-24-8-26-18z" fill="url(#lnHead)"/>
    <path d="M44 62c4 4 10 6 16 4-2 6-8 10-16 8z" fill="#5a0004"/><path d="M46 63l2 4 2-4 2 4 2-4" fill="#fff"/><path d="M48 70c4 2 8 2 10 0" stroke="#ff9eb8" stroke-width="2.4" stroke-linecap="round"/>
    <ellipse cx="26" cy="46" rx="7" ry="6.4" fill="#fff"/><circle cx="28" cy="46" r="3.6" fill="#1a1a1a"/><circle cx="29" cy="44.6" r="1.2" fill="#fff"/>
    <path d="M16 38c6-6 14-6 20 0" stroke="#1a1a1a" stroke-width="2.6" stroke-linecap="round" fill="none"/>
    <path d="M38 40c4-2 8-2 10 2" stroke="#ffd35c" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M10 66c8 4 18 4 26 0" stroke="#ffd35c" stroke-width="2.4" fill="none" stroke-dasharray="3 3"/>
    <path d="M56 54c10-2 22 0 30 8M56 60c10 4 18 12 22 20" stroke="#ffd35c" stroke-width="1.8" fill="none" stroke-linecap="round">${morph(['M56 54c10-2 22 0 30 8M56 60c10 4 18 12 22 20', 'M56 54c10-6 22-6 30-2M56 60c12 0 20 6 26 12', 'M56 54c10-2 22 0 30 8M56 60c10 4 18 12 22 20'], 1.2)}</path>
    <path d="M-8 52c-10 0-16 8-16 16 6-2 12-6 16-8zM-6 62c-8 4-12 10-10 16 4-4 10-8 12-10z" fill="url(#lnFin)" stroke="#b45309" stroke-width=".8"/>
   </g></g>
   <g transform="translate(312 52)"><circle r="12" fill="url(#lnPearlGlow)">${blink(1.2)}</circle><circle r="6" fill="url(#lnPearl)"/>${bob(-6, .8)}</g>`);

/* ---------- Valentine's: Cupid, and rising hearts ---------- */
const featherWing = (pose) => pose ? 'M0 0C-6-14-20-22-34-20c4 4 6 6 6 8-6 0-10 2-12 6 6 0 8 2 8 4-6 0-10 4-10 8 14 2 30-2 42-6z' : 'M0 0C-10-4-24-2-36 6c4 0 6 2 6 4-6 2-10 6-10 10 6-2 8 0 8 2-6 2-8 6-8 10 14-4 28-14 40-24z';
const cupid = svg('0 0 140 110',
  rad('cpSkin', [[0, '#ffe3d3'], [1, '#f0b393']], .4, .35) + lin('cpWing', [[0, '#ffffff'], [1, '#d6e4ff']]) + lin('cpHair', [[0, '#ffe08a'], [1, '#d9a21b']]) +
  lin('cpBow', [[0, '#ffd35c'], [1, '#b8860b']]) + rad('cpHeart', [[0, '#ffb3c7'], [.6, '#ff3d6e'], [1, '#b0123f']], .35, .3),
  `<g>${bob(-5, 1.3)}
   <g transform="translate(58 44)"><path d="${featherWing(true)}" fill="url(#cpWing)" stroke="#b9c8ea" stroke-width=".8">${morph([featherWing(true), featherWing(false), featherWing(true)], .5)}</path>
     <path d="M-6-6c-6-4-14-6-22-4M-8 0c-8-2-16 0-22 4" stroke="#c8d6f2" stroke-width=".8" fill="none"/></g>
   <path d="M44 58c0-10 8-16 16-16s16 6 16 16c0 12-6 20-16 20s-16-8-16-20z" fill="url(#cpSkin)"/>
   <path d="M46 62c6 4 22 4 28-2-2 10-8 14-14 14s-12-4-14-12z" fill="#fff" opacity=".95"/><path d="M48 60l26-6" stroke="#ff8fb1" stroke-width="3"/>
   <path d="M50 76c-4 6-4 12 0 16M66 76c2 6 6 10 10 12" stroke="url(#cpSkin)" stroke-width="7" stroke-linecap="round" fill="none"/>
   <circle cx="62" cy="30" r="13" fill="url(#cpSkin)"/>
   ${[[50, 22], [55, 17], [62, 15], [69, 17], [73, 23], [52, 29]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4.6" fill="url(#cpHair)"/>`).join('')}
   <circle cx="66" cy="31" r="1.6" fill="#3a1a0a"/><circle cx="66.5" cy="30.4" r=".5" fill="#fff"/><path d="M64 37q3 2 6 0" stroke="#c2410c" stroke-width="1.2" fill="none" stroke-linecap="round"/>
   <circle cx="71" cy="35" r="2.6" fill="#ff8fa3" opacity=".6"/>
   <path d="M74 50c8 2 14 2 20-2" stroke="url(#cpSkin)" stroke-width="6" stroke-linecap="round" fill="none"/>
   <path d="M96 26c14 10 14 34 0 44" stroke="url(#cpBow)" stroke-width="3" fill="none"/><path d="M96 26L84 48 96 70" stroke="#fff" stroke-width=".8" fill="none"/>
   <path d="M84 48h42" stroke="#8a5a2b" stroke-width="2"/><path d="M126 48l-8-5v10z" fill="url(#cpHeart)"/><path d="M86 44l-6 4 6 4" fill="#ff8fb1"/>
  </g>` + trail(scatter(8, 0, 34, 30, 80, 2.2, 3.8, 5), ['#ff8fb1', '#ffd1dc', '#ffffff'], 1.4));
const heart = svg('-14 -14 28 28', rad('htFill', [[0, '#ffc2d1'], [.55, '#ff3d6e'], [1, '#b0123f']], .35, .3),
  `<path d="M0 10C-16 0-11-12 0-5 11-12 16 0 0 10z" fill="url(#htFill)"/><ellipse cx="-5" cy="-4" rx="3" ry="1.8" fill="#fff" opacity=".7" transform="rotate(-30 -5 -4)"/>`);

/* ---------- St Patrick's: rainbow to a pot of gold ---------- */
const patrick = svg('0 0 220 120',
  lin('ptGold', [[0, '#fff2b0'], [.5, '#f2c14e'], [1, '#a8740c']]) + lin('ptPot', [[0, '#3a3a3a'], [1, '#0a0a0a']]) + rad('ptCloud', [[0, '#ffffff'], [1, '#e2e8f0']], .4, .3),
  ['#e5484d', '#ff9a1f', '#ffd23f', '#3fbf62', '#3b82f6', '#8b5cf6'].map((c, i) => `<path d="M${22 + i * 6} 104A${84 - i * 6} ${84 - i * 6} 0 0 1 ${190 - i * 6} 104" fill="none" stroke="${c}" stroke-width="6.4" stroke-dasharray="270" stroke-dashoffset="270" opacity=".92"><animate attributeName="stroke-dashoffset" from="270" to="0" dur="1.4s" begin="${i * .06}s" fill="freeze"/></path>`).join('') +
  `<g opacity=".9">${[[16, 104, 14], [34, 108, 11], [4, 110, 9]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#ptCloud)"/>`).join('')}</g>` +
  `<g transform="translate(180 92)"><ellipse cx="0" cy="16" rx="20" ry="4" fill="#000" opacity=".2"/>
    ${[[-10, -6], [-3, -9], [5, -7], [11, -4], [-6, -12], [2, -14]].map(([x, y], i) => `<ellipse cx="${x}" cy="${y}" rx="5" ry="3.4" fill="url(#ptGold)" stroke="#a8740c" stroke-width=".6"/>${glint(x - 1, y - 1, 3, 1.2, i * .2)}`).join('')}
    <path d="M-17-4h34c2 6 0 18-6 20h-22c-6-2-8-14-6-20z" fill="url(#ptPot)"/><path d="M-18-4h36" stroke="#2a2a2a" stroke-width="4" stroke-linecap="round"/>
    <path d="M-12 2c4-2 8-2 10 0" stroke="#fff" stroke-opacity=".35" stroke-width="1.6" fill="none"/></g>` +
  [[60, 30], [110, 14], [150, 40]].map(([x, y], i) => `<g transform="translate(${x} ${y})" opacity="0"><animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.3;.8;1" dur="4.5s" begin="${.6 + i * .3}s" fill="freeze"/>
    <g>${turn([-15, 15, -15], 0, 0, 2, i * .4)}${[0, 120, 240].map(a => `<path d="M0 0c-6-6-6-12 0-12s6 6 0 12z" fill="#22a34a" transform="rotate(${a})"/>`).join('')}<path d="M0 0l4 10" stroke="#15803d" stroke-width="1.4"/></g></g>`).join(''));

/* ---------- Eid: crescent and stars, and rising lanterns ---------- */
const eidMoon = svg('0 0 80 70', rad('emGlow', [[0, '#ffe9a0', .5], [.55, '#ffe9a0', .18], [1, '#ffe9a0', 0]]) + lin('emMoon', [[0, '#fff6c8'], [1, '#f2b632']], 1, 1),
  `<g transform="translate(33 34) scale(1.16) translate(-33 -34)" opacity=".3"><path d="M44 8a26 26 0 1 0 10 46 21 21 0 1 1-10-46z" fill="#ffe08a"><animate attributeName="opacity" values=".5;1;.5"${rep(3)}/></path></g><path d="M44 8a26 26 0 1 0 10 46 21 21 0 1 1-10-46z" fill="url(#emMoon)"/><path d="M30 14a22 22 0 0 0-6 32" stroke="#fff" stroke-opacity=".5" stroke-width="2" fill="none" stroke-linecap="round"/>` +
  [[62, 18, 6, 1.6], [70, 40, 4, 2], [56, 58, 3.4, 1.4], [16, 10, 3, 1.8]].map(([x, y, r, d], i) => `<path d="M${x} ${y - r}l${r * .3} ${r * .7} ${r * .7} ${r * .3}-${r * .7} ${r * .3}-${r * .3} ${r * .7}-${r * .3}-${r * .7}-${r * .7}-${r * .3} ${r * .7}-${r * .3}z" fill="#fff6c8"><animate attributeName="opacity" values=".3;1;.3"${rep(d, i * .4)}/></path>`).join(''));
const fanous = (glass, metal) => svg('0 0 40 80',
  lin('fnMetal', [[0, '#ffe9a0'], [.5, metal], [1, '#6b4a00']], 1, 0) + rad('fnGlass', [[0, '#fffbe6'], [.5, glass], [1, glass]], .5, .6) + rad('fnHalo', [[0, '#ffe08a', .55], [1, '#ffe08a', 0]]),
  `<circle cx="20" cy="44" r="22" fill="url(#fnHalo)">${blink(1.8)}</circle>
   <path d="M20 2v6" stroke="url(#fnMetal)" stroke-width="1.6"/><circle cx="20" cy="4" r="2.4" fill="none" stroke="url(#fnMetal)" stroke-width="1.4"/>
   <path d="M12 12h16l-2-4h-12z" fill="url(#fnMetal)"/><path d="M10 14h20l6 12H4z" fill="url(#fnMetal)"/>
   <path d="M6 26h28l-4 30H10z" fill="url(#fnGlass)" stroke="url(#fnMetal)" stroke-width="1.6"/>
   <path d="M14 26l-2 30M26 26l2 30M20 26v30M8 36h24M9 46h22" stroke="url(#fnMetal)" stroke-width="1"/>
   <g transform="translate(20 48)"><path d="M0-10c-3 4-3 8 0 10 3-2 3-6 0-10z" fill="#ff9a1f"><animateTransform attributeName="transform" type="scale" values="1 1;1 1.15;1 .92;1 1"${rep(.6)}/></path></g>
   <path d="M10 56h20l-4 8H14z" fill="url(#fnMetal)"/><path d="M20 64v8" stroke="url(#fnMetal)" stroke-width="1.6"/><circle cx="20" cy="74" r="2.4" fill="url(#fnMetal)"/>`);

/* ---------- Easter bunny with a basket ---------- */
const bunnyEar = (k) => `M0 0C-4-10-4-22 0-30c4 ${8 - k} 4 ${20 - k} 0 30z`;
const egg = (x, y, c1, c2, pat, r = 0) => `<g transform="translate(${x} ${y}) rotate(${r})"><ellipse rx="4.6" ry="6" fill="${c1}"/>${pat === 'zig' ? `<path d="M-4.4 0l2-2 2 2 2-2 2 2 2-2" stroke="${c2}" stroke-width="1.2" fill="none"/>` : pat === 'dots' ? `<circle cx="-1.6" cy="-2" r="1" fill="${c2}"/><circle cx="1.8" cy="1" r="1" fill="${c2}"/><circle cx="-1" cy="3" r=".9" fill="${c2}"/>` : `<path d="M-4.4-1h8.8M-4 2.4h8" stroke="${c2}" stroke-width="1.4"/>`}<ellipse cx="-1.6" cy="-2.6" rx="1.2" ry="2" fill="#fff" opacity=".5"/></g>`;
const easter = svg('0 0 90 80',
  rad('ebFur', [[0, '#ffffff'], [.75, '#f1eef8'], [1, '#cfc7e2']], .4, .3) + lin('ebBasket', [[0, '#d9a066'], [1, '#8a5222']]),
  `<g><animateTransform attributeName="transform" type="rotate" values="-6 40 70;4 40 70;-6 40 70"${rep(.55)}/>
   <ellipse cx="34" cy="50" rx="20" ry="15" fill="url(#ebFur)"/><circle cx="14" cy="46" r="7" fill="#fff"/>
   <ellipse cx="22" cy="64" rx="9" ry="4" fill="url(#ebFur)"/>
   <circle cx="54" cy="36" r="12" fill="url(#ebFur)"/>
   <g transform="translate(50 26)"><path d="${bunnyEar(0)}" fill="url(#ebFur)" transform="rotate(-14)">${morph([bunnyEar(0), bunnyEar(-10), bunnyEar(0)], .55)}</path><path d="M0-4c-2-6-2-16 0-22 2 6 2 16 0 22z" fill="#ffc2d6" transform="rotate(-14)"/></g>
   <g transform="translate(58 25)"><path d="${bunnyEar(0)}" fill="url(#ebFur)" transform="rotate(16)">${morph([bunnyEar(0), bunnyEar(8), bunnyEar(0)], .55, .1)}</path><path d="M0-4c-2-6-2-16 0-22 2 6 2 16 0 22z" fill="#ffc2d6" transform="rotate(16)"/></g>
   <circle cx="59" cy="34" r="2.2" fill="#2b1a40"/><circle cx="59.8" cy="33.2" r=".8" fill="#fff"/><ellipse cx="65" cy="39" rx="2" ry="1.4" fill="#ff8fb8"/>
   <path d="M65 40l7-2M65 41l8 1M64 42l6 3" stroke="#a8a0c0" stroke-width=".6"/><circle cx="58" cy="41" r="2.4" fill="#ffb3c7" opacity=".5"/>
   <path d="M44 56c4 6 4 10 2 14" stroke="url(#ebFur)" stroke-width="6" stroke-linecap="round" fill="none"/>
   <path d="M36 58c0 10 6 16 16 16s16-6 16-16z" fill="url(#ebBasket)"/><path d="M38 64h28M40 70h24" stroke="#7a4518" stroke-width="1"/><path d="M38 58c2-14 26-14 28 0" stroke="#8a5222" stroke-width="2.4" fill="none"/>
   ${egg(44, 56, '#ff9ec7', '#fff', 'zig', -12)}${egg(52, 54, '#8fd3ff', '#2563eb', 'dots', 8)}${egg(60, 56, '#ffe066', '#f97316', 'stripe', 16)}
  </g>`);

/* ---------- Diwali sky lanterns ---------- */
const skyLantern = svg('0 0 40 60', rad('slPaper', [[0, '#fff7d6'], [.45, '#ffc34d'], [1, '#e06a00']], .5, .7) + rad('slHalo', [[0, '#ffd27a', .6], [1, '#ffd27a', 0]]),
  `<ellipse cx="20" cy="30" rx="20" ry="28" fill="url(#slHalo)">${blink(1.6)}</ellipse>
   <path d="M8 6c4-4 20-4 24 0l4 36c-4 6-28 6-32 0z" fill="url(#slPaper)"/><path d="M14 6l-2 38M26 6l2 38M20 5v40" stroke="#e07a10" stroke-width=".8" opacity=".6"/>
   <path d="M12 48h16" stroke="#7a3a00" stroke-width="1.4"/><g transform="translate(20 55)"><circle cy="-4" r="6" fill="#fff3b0" opacity=".5">${blink(.7)}</circle><path d="M0-9c-3 4-3 7 0 9 3-2 3-5 0-9z" fill="#ff7a1a"><animateTransform attributeName="transform" type="scale" values="1 1;1 1.2;1 .9;1 1"${rep(.5)}/></path></g>`);

/* ---------- Hanukkah: a spinning dreidel and gelt ---------- */
const hanukkah = svg('-30 -40 60 80', lin('hkBody', [[0, '#93c5fd'], [.45, '#e8f0ff'], [.55, '#c7d7f5'], [1, '#2a4ea0']], 1, 0) + lin('hkGold', [[0, '#fff2b0'], [.5, '#f2c14e'], [1, '#a8740c']]),
  `<ellipse cx="0" cy="36" rx="12" ry="2.4" fill="#000" opacity=".2"><animate attributeName="rx" values="12;9;12"${rep(.4)}/></ellipse>
   <g><animateTransform attributeName="transform" type="rotate" values="-14 0 30;14 0 30;-14 0 30"${rep(.4)}/>
    <rect x="-2.6" y="-36" width="5.2" height="12" rx="2" fill="url(#hkBody)"/>
    <path d="M-14-24h28v24L0 32-14 0z" fill="url(#hkBody)" stroke="#16307a" stroke-width="1.4"/>
    <text x="0" y="-6" font-size="14" font-weight="700" text-anchor="middle" fill="#16307a" font-family="serif">ש<animate attributeName="opacity" values="1;0;1"${rep(.4)}/></text>
    <text x="0" y="-6" font-size="14" font-weight="700" text-anchor="middle" fill="#16307a" font-family="serif" opacity="0">נ<animate attributeName="opacity" values="0;1;0"${rep(.4)}/></text>
    <path d="M-10-22v20" stroke="#fff" stroke-width="2" opacity=".6"/>
   </g>
   ${[[-24, 30], [22, 32]].map(([x, y], i) => `<g transform="translate(${x} ${y})"><ellipse rx="6" ry="6" fill="url(#hkGold)" stroke="#a8740c" stroke-width=".8"><animate attributeName="rx" values="6;1;6"${rep(.8, i * .3)}/></ellipse></g>`).join('')}`);

/* ---------- Spring: monarch and blue butterflies, a bumblebee ---------- */
const bfWing = (top, k) => top ? `M0-1C${-4 * k}-18 ${-26 * k}-26 ${-30 * k}-14C${-32 * k}-4 ${-16 * k} 2 0 0z` : `M0 0C${-12 * k} 2 ${-22 * k} 12 ${-18 * k} 20C${-12 * k} 26 ${-2 * k} 14 0 0z`;
const butterfly = (c1, c2, vein) => svg('-34 -28 68 56', rad('bf' + c1.slice(1), [[0, c2], [.7, c1], [1, vein]], .3, .5),
  ['L', 'R'].map(s => { const k = s === 'L' ? 1 : -1;
    return `<g>${['top', 'bot'].map(p => `<path d="${bfWing(p === 'top', k)}" fill="url(#bf${c1.slice(1)})" stroke="${vein}" stroke-width="1.2"><animate attributeName="d" values="${bfWing(p === 'top', k)};${bfWing(p === 'top', k * .2)};${bfWing(p === 'top', k)}"${rep(.32)}/></path>`).join('')}
      ${[[-22, -14], [-26, -9], [-14, 14], [-18, -18]].map(([x, y]) => `<circle cx="${x * k}" cy="${y}" r="1.2" fill="#fff"><animate attributeName="cx" values="${x * k};${x * k * .2};${x * k}"${rep(.32)}/></circle>`).join('')}</g>`; }).join('') +
  `<ellipse rx="2" ry="10" fill="#1a1208"/><path d="M-1-9c-2-4-4-6-7-7M1-9c2-4 4-6 7-7" stroke="#1a1208" stroke-width=".9" fill="none"/>`);
const bee = svg('-16 -14 32 28', rad('beBody', [[0, '#fff2a0'], [.6, '#ffc61a'], [1, '#c48a00']], .4, .35),
  `<ellipse cx="-2" cy="-8" rx="6" ry="4" fill="#e0f2ff" opacity=".75"><animate attributeName="ry" values="4;1;4"${rep(.08)}/></ellipse><ellipse cx="4" cy="-8" rx="6" ry="4" fill="#e0f2ff" opacity=".75"><animate attributeName="ry" values="1;4;1"${rep(.08)}/></ellipse>
   <ellipse rx="10" ry="7" fill="url(#beBody)"/><path d="M-4-6.6v13.2M1-6.8v13.6M6-5v10" stroke="#1a1208" stroke-width="2.4"/>
   <circle cx="9" cy="-1" r="3.6" fill="#1a1208"/><circle cx="10" cy="-2" r="1" fill="#fff"/><path d="M-10 0l-3 0" stroke="#1a1208" stroke-width="1.4"/><path d="M10-4l3-5M11-4l5-3" stroke="#1a1208" stroke-width=".8"/>`);

/* ---------- Summer: seagulls, a hot-air balloon, a beach ball ---------- */
const gullWing = (s, pose) => { const k = s === 'l' ? -1 : 1, y = {up:-16, mid:-2, down:10}[pose];
  return `M0 0Q${8 * k} ${y * .7} ${18 * k} ${y}Q${24 * k} ${y + 1} ${28 * k} ${y + 4}Q${18 * k} ${y + 4} ${10 * k} 4z`; };
const gull = (x, y, k, dur, begin) => `<g transform="translate(${x} ${y}) scale(${k})"><g>${bob(3, dur * 2, begin)}
  ${['l', 'r'].map(s => `<path d="${gullWing(s, 'up')}" fill="url(#glWing)">${morph([gullWing(s, 'up'), gullWing(s, 'mid'), gullWing(s, 'down'), gullWing(s, 'mid'), gullWing(s, 'up')], dur, begin)}</path>`).join('')}
  <ellipse cx="0" cy="2" rx="12" ry="5" fill="url(#glBody)"/><circle cx="10" cy="0" r="4" fill="#fff"/><circle cx="11" cy="-.6" r=".9" fill="#1a1a1a"/>
  <path d="M13 0l6 1.2-6 1.2z" fill="#ffc61a"/><circle cx="17.6" cy="1.4" r=".7" fill="#e5484d"/><path d="M-12 2l-5-2 1 4z" fill="#d1d5db"/></g></g>`;
const gulls = svg('0 0 160 70', lin('glWing', [[0, '#f8fafc'], [.7, '#cbd5e1'], [1, '#1f2937']], 1, 0) + lin('glBody', [[0, '#ffffff'], [1, '#d7dde6']]),
  gull(40, 36, 1.1, .5, 0) + gull(96, 20, .85, .46, .2) + gull(130, 48, .7, .52, .1));
const balloon = svg('0 0 70 100', lin('blTop', [[0, '#ffe08a'], [1, '#f59e0b']], 1, 0) + rad('blShade', [[0, '#fff', .45], [1, '#fff', 0]], .35, .3),
  `<g>${bob(-4, 2.4)}<g>${turn([-3, 3, -3], 35, 90, 3.2)}
   ${['#ef4444', '#fbbf24', '#3b82f6', '#22c55e', '#ef4444', '#fbbf24'].map((c, i) => `<path d="M35 4C${8 + i * 9} 4 ${4 + i * 10} 40 ${14 + i * 7} 56L35 70z" fill="${c}"/>`).join('')}
   <path d="M35 4C14 4 4 26 6 40c2 10 10 20 18 28h22c8-8 16-18 18-28C66 26 56 4 35 4z" fill="url(#blShade)" stroke="#7a3a00" stroke-width="1"/>
   <path d="M24 68l4 14M46 68l-4 14" stroke="#7a4a1a" stroke-width="1"/><rect x="26" y="82" width="18" height="12" rx="2" fill="#a8743e" stroke="#5a3a12"/><path d="M26 86h18M31 82v12M39 82v12" stroke="#7a4a1a" stroke-width=".8"/>
   <path d="M35 76c-2 3-2 5 0 7 2-2 2-4 0-7z" fill="#ff9a1f">${blink(.5)}</path></g></g>`);
const beachBall = svg('-22 -22 44 44', rad('bbShine', [[0, '#fff', .9], [1, '#fff', 0]], .3, .25),
  `<g><animateTransform attributeName="transform" type="rotate" values="0;360"${rep(1)}/><circle r="18" fill="#fff"/>
   ${['#ef4444', '#fbbf24', '#3b82f6'].map((c, i) => `<path d="M0 0L${(18 * Math.cos(i * 2.094)).toFixed(1)} ${(18 * Math.sin(i * 2.094)).toFixed(1)}A18 18 0 0 1 ${(18 * Math.cos(i * 2.094 + 1.047)).toFixed(1)} ${(18 * Math.sin(i * 2.094 + 1.047)).toFixed(1)}z" fill="${c}"/>`).join('')}<circle r="3.4" fill="#fff"/></g>
   <circle r="18" fill="url(#bbShine)"/><circle r="18" fill="none" stroke="#0b4a55" stroke-width="1"/>`);

/* ---------- Autumn: geese in a V, and tumbling leaves ---------- */
const gooseWing = (pose) => ({up:'M0 0C-4-10-12-16-22-18c4 4 8 10 12 16z', mid:'M0 0C-6-2-14-2-24 0c6 2 12 4 16 4z', down:'M0 0C-4 6-10 12-18 16c4-6 8-10 10-14z'}[pose]);
const goose = (x, y, k, begin) => `<g transform="translate(${x} ${y}) scale(${k})"><g>${bob(2, 1, begin)}
  <path d="M-16 2c4-6 18-8 30-4 4 2 4 6 0 8-10 4-24 4-30-4z" fill="url(#gsBody)"/><path d="M-6 4c6 2 14 2 20-1" stroke="#f3eadf" stroke-width="2" opacity=".6"/>
  <path d="M12-1c4-2 8-2 12-4" stroke="#1a1a1a" stroke-width="3.2" stroke-linecap="round"/><circle cx="25" cy="-5.4" r="3" fill="#1a1a1a"/><path d="M27-5.4l4 .6-4 1z" fill="#1a1a1a"/><path d="M23-4.4c1 1.4 2.4 1.6 3.6 1" stroke="#fff" stroke-width="1.2" fill="none"/>
  <path d="${gooseWing('up')}" fill="url(#gsWing)" transform="translate(4 -1)">${morph([gooseWing('up'), gooseWing('mid'), gooseWing('down'), gooseWing('mid'), gooseWing('up')], .5, begin)}</path>
  <path d="M-16 2l-5-2 1 4z" fill="#1a1a1a"/></g></g>`;
const leaf = (x, y, c, r, begin) => `<g transform="translate(${x} ${y})"><g>${turn([r, r + 40, r], 0, 0, 1.6, begin)}<path d="M0-8l2 4 4-2-1 4 4 1-4 3 1 3-4-1-2 4-2-4-4 1 1-3-4-3 4-1-1-4 4 2z" fill="${c}"/><path d="M0-6V8" stroke="#7a2e0a" stroke-width=".6"/></g></g>`;
const geese = svg('0 0 170 80', lin('gsBody', [[0, '#a99b88'], [1, '#6b5a46']]) + lin('gsWing', [[0, '#8a7a66'], [1, '#4a3a2a']]),
  goose(140, 14, 1, 0) + goose(112, 28, .9, .15) + goose(84, 42, .85, .3) + goose(112, 54, .8, .1) + goose(70, 66, .75, .25) +
  leaf(20, 30, '#e8590c', 0, 0) + leaf(40, 60, '#d9480f', 60, .5) + leaf(8, 54, '#f59f00', 120, .9));

/* ---------- Winter: a penguin sliding on its belly ---------- */
const winter = svg('0 0 110 50', lin('pgBack', [[0, '#3a4252'], [1, '#0f141c']]) + lin('pgBelly', [[0, '#ffffff'], [1, '#dde6f2']]),
  scatter(10, 0, 26, 26, 46, 1.2, 2.6, 4).map(([x, y, r], i) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#e8f2ff" opacity="0">${blink(.6, i * .06)}</circle>`).join('') +
  `<g>${bob(-1.4, .3)}
   <path d="M24 34c4-12 24-18 50-16 14 1 26 6 28 12 1 4-2 8-8 9H32c-6 0-10-2-8-5z" fill="url(#pgBack)"/>
   <path d="M34 38c8-6 26-10 44-8 8 1 14 4 16 9H36z" fill="url(#pgBelly)"/>
   <circle cx="92" cy="26" r="2.2" fill="#fff"/><circle cx="92.6" cy="25.6" r="1" fill="#0f141c"/>
   <path d="M100 28l8 2-8 2z" fill="#ff8a1f"/>
   <path d="M60 22c-6-8-14-10-20-8 6 2 12 6 16 10z" fill="url(#pgBack)">${morph(['M60 22c-6-8-14-10-20-8 6 2 12 6 16 10z', 'M60 22c-6-4-14-4-22 0 6 0 12 2 18 4z', 'M60 22c-6-8-14-10-20-8 6 2 12 6 16 10z'], .4)}</path>
   <path d="M24 36l-8-4 2 6zM26 38l-8 2 6 3z" fill="#ff8a1f"/>
   <path d="M84 30c2 2 4 2 6 1" stroke="#ffb3c7" stroke-width="2" stroke-linecap="round"/>
  </g>`);
const snowOwl = svg('0 0 90 60', rad('owBody', [[0, '#ffffff'], [.8, '#eef2f7'], [1, '#c9d3df']], .4, .3),
  `<g>${bob(-4, .9)}
   ${['l', 'r'].map(s => { const k = s === 'l' ? -1 : 1, up = `M45 30C${45 + k * 10} 10 ${45 + k * 30} 6 ${45 + k * 42} 14c${-k * 8} 2 ${-k * 12} 8 ${-k * 14} 14z`, dn = `M45 30C${45 + k * 12} 34 ${45 + k * 30} 44 ${45 + k * 40} 52c${-k * 8} -6 ${-k * 14} -10 ${-k * 18} -12z`;
     return `<path d="${up}" fill="url(#owBody)" stroke="#b8c4d2" stroke-width=".8">${morph([up, dn, up], .9)}</path>`; }).join('')}
   <ellipse cx="45" cy="34" rx="12" ry="14" fill="url(#owBody)"/>
   ${[[40, 34], [48, 38], [44, 42], [50, 30]].map(([x, y]) => `<path d="M${x - 2} ${y}l2 1.4 2-1.4" stroke="#94a3b8" stroke-width=".8" fill="none"/>`).join('')}
   <circle cx="45" cy="22" r="9" fill="url(#owBody)"/><circle cx="41.4" cy="21" r="2.6" fill="#ffd400"/><circle cx="48.6" cy="21" r="2.6" fill="#ffd400"/><circle cx="41.4" cy="21" r="1.3" fill="#111"/><circle cx="48.6" cy="21" r="1.3" fill="#111"/>
   <path d="M44 24.4l1 2.4 1-2.4z" fill="#1f2937"/></g>`);

/* ---------- the scenes for each theme ---------- */
const FLY = {
  christmas: [{motion:'ltr', w:74, dur:8, y:[4, 22], svg:christmas}],
  halloween: [
    {motion:'rtl', w:60, dur:7.5, y:[4, 34], svg:witch},
    {motion:'ltr', w:54, dur:7, y:[4, 36], svg:vampire},
    {motion:'ltr', w:56, dur:6, y:[4, 50], svg:bats},
    {motion:'wave', w:22, dur:8, y:[20, 56], svg:ghost}],
  newyear: [{motion:'burst', w:46, dur:2.6, count:3, svg:firework(['#fbbf24', '#ff5fb0', '#5fd0ff', '#ffffff'], 3)}, {motion:'burst', w:40, dur:2.6, count:3, svg:firework(['#a78bfa', '#34d399', '#fde68a'], 5)}],
  lunar: [{motion:'ltr', w:84, dur:9, y:[8, 40], svg:lunar}],
  valentine: [{motion:'rtl', flip:true, w:36, dur:7.5, y:[6, 40], svg:cupid}, {motion:'rise', w:11, dur:6, count:5, svg:heart}],
  patrick: [{motion:'arc', w:92, dur:4.6, y:[26, 36], svg:patrick}],
  eid: [{motion:'arc', w:34, dur:5.4, x:[56, 66], y:[3, 8], svg:eidMoon}, {motion:'rise', w:10, dur:8, count:4, svg:fanous('#ffb84d', '#d4a017')}],
  easter: [{motion:'hop', w:24, dur:7, svg:easter}],
  diwali: [{motion:'rise', w:9, dur:8, count:6, svg:skyLantern}, {motion:'burst', w:42, dur:2.6, count:2, svg:firework(['#fbbf24', '#ec4899', '#14b8a6', '#ffffff'], 7)}],
  hanukkah: [{motion:'ltr', w:15, dur:6.5, y:[76, 80], svg:hanukkah}],
  spring: [{motion:'wave', w:14, dur:7.5, y:[10, 50], svg:butterfly('#ff8a1f', '#ffd59e', '#2b1405')}, {motion:'wave', w:13, dur:8, y:[20, 60], svg:butterfly('#3b82f6', '#b8e1ff', '#0b1e4a')}, {motion:'ltr', w:10, dur:5.5, y:[30, 66], svg:bee}],
  summer: [{motion:'ltr', w:40, dur:7, y:[4, 24], svg:gulls}, {motion:'rtl', w:18, dur:10, y:[6, 30], svg:balloon}, {motion:'hop', w:13, dur:5.5, svg:beachBall}],
  autumn: [{motion:'rtl', flip:true, w:52, dur:8.5, y:[4, 22], svg:geese}],
  winter: [{motion:'ltr', w:30, dur:5.5, y:[74, 78], svg:winter}, {motion:'ltr', w:28, dur:7, y:[6, 30], svg:snowOwl}]
};
window.GW_SEASONAL = Object.assign(window.GW_SEASONAL || {}, {FLY});
})();
