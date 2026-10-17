/* Elite Chess: seasonal character pieces and animated flyovers.
   Each holiday and season has its own set where every piece stays recognisable by role and height:
   pawn small and round, rook squat and flat-topped, bishop tall and pointed, knight an animal head,
   queen tall and crowned, king tallest. White pieces are light, black pieces deep, theme colours are accents.
   Pieces are drawn on a 100×100 grid; the app adds its premium finish (sheen and rim) on top. */
(() => {
const SW = 2.6;   // outline width
// shape helpers: path, ellipse, rect, circle with the side's outline colour
// outline attributes unless the caller sets its own (an SVG attribute may appear only once)
const st = (c, x) => (/(^|\s)stroke=/.test(x) ? '' : ` stroke="${c.ink}"`) + (/stroke-width=/.test(x) ? '' : ` stroke-width="${SW}"`);
const P = (d, f, c, x = '') => `<path d="${d}" fill="${f}"${st(c, x)} stroke-linejoin="round" stroke-linecap="round"${x}/>`;
const L = (d, s, w, x = '') => `<path d="${d}" fill="none" stroke="${s}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"${x}/>`;
const E = (cx, cy, rx, ry, f, c, x = '') => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${f}"${st(c, x)}${x}/>`;
const O = (cx, cy, r, f, c, x = '') => E(cx, cy, r, r, f, c, x);
const D = (cx, cy, r, f) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${f}"/>`;
const R = (x, y, w, h, f, c, rx = 2, z = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${f}"${st(c, z)}${z}/>`;
// the shared pedestal every piece stands on (width w)
const base = (c, w = 56) => '<g class="pb">' + P(`M${50 - w / 2} 94h${w}a5 5 0 0 0 0-10H${50 - w / 2}a5 5 0 0 0 0 10z`, c.shade, c) + L(`M${50 - w / 2 + 4} 87h${w - 8}`, c.hi, 1.6, ' opacity=".7"') + '</g>';
const star = (cx, cy, r, f, c) => { let d = ''; for (let i = 0; i < 10; i++){ const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .45 : r; d += (i ? 'L' : 'M') + (cx + rr * Math.cos(a)).toFixed(1) + ' ' + (cy + rr * Math.sin(a)).toFixed(1); } return P(d + 'Z', f, c); };
const crown = (cx, y, f, c, w = 16) => P(`M${cx - w / 2} ${y + 10}l-1-10 ${w / 4} 5 ${w / 4 + 1}-7 ${w / 4 + 1} 7 ${w / 4} -5-1 10z`, f, c, ' stroke-width="1.8"');
const cross = (cx, y, f, c) => P(`M${cx - 2.5} ${y}h5v5h5v5h-5v6h-5v-6h-5v-5h5z`, f, c);
let blinkN = 0;
const eye = (x, y, c, r = 2.6) => { const dur = (3.2 + (blinkN++ % 7) * .37).toFixed(2); return `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r}" fill="${c.eye}"><animate attributeName="ry" values="${r};${r};${(r * .15).toFixed(2)};${r}" keyTimes="0;.9;.95;1" dur="${dur}s" repeatCount="indefinite"/></ellipse>` + D(x + r * .35, y - r * .35, r * .35, '#fff'); };
const heart = (cx, cy, s, f, c) => P(`M${cx} ${cy + 14 * s}C${cx - 22 * s} ${cy}${''} ${cx - 16 * s} ${cy - 14 * s} ${cx} ${cy - 6 * s}C${cx + 16 * s} ${cy - 14 * s} ${cx + 22 * s} ${cy} ${cx} ${cy + 14 * s}Z`, f, c);
const flame = (cx, y, s, c) => `<g transform="translate(${cx} ${y + 15 * s})"><g>` + `<g transform="translate(${-cx} ${-(y + 15 * s)})">` + P(`M${cx} ${y}c${5 * s} ${6 * s} ${7 * s} ${10 * s} ${4 * s} ${15 * s}c${-2 * s} ${3 * s} ${-6 * s} ${3 * s} ${-8 * s} 0c${-3 * s} ${-5 * s} ${-1 * s} ${-9 * s} ${4 * s} ${-15 * s}z`, c.flame, c) + P(`M${cx} ${y + 7 * s}c${2 * s} ${3 * s} ${3 * s} ${5 * s} ${1.5 * s} ${7 * s}c${-1 * s} ${1.4 * s} ${-2.6 * s} ${1.4 * s} ${-3.4 * s} 0c${-1 * s} ${-2 * s} 0 ${-4 * s} ${1.9 * s} ${-7 * s}z`, c.flame2, c, ' stroke-width="0"') + `</g><animateTransform attributeName="transform" type="scale" values="1 1;.93 1.06;1.04 .96;1 1" dur="${(.5 + (cx % 5) * .07).toFixed(2)}s" repeatCount="indefinite" additive="sum"/></g></g>`;

/* ---------------- motion ---------------- */
const loop = (attr, type, values, dur, extra = '') => `<animateTransform attributeName="${attr}" type="${type}" values="${values}" dur="${dur}s" repeatCount="indefinite"${extra}/>`;
const MOVE = {
  sway: (g, [cx, cy, deg = 5, dur = 3]) => `<g>${g}${loop('transform', 'rotate', `${-deg} ${cx} ${cy};${deg} ${cx} ${cy};${-deg} ${cx} ${cy}`, dur, ' calcMode="spline" keySplines=".45 0 .55 1;.45 0 .55 1"')}</g>`,
  bob: (g, [dy = 2, dur = 2.4]) => `<g>${g}${loop('transform', 'translate', `0 0;0 ${-dy};0 0`, dur, ' calcMode="spline" keySplines=".45 0 .55 1;.45 0 .55 1"')}</g>`,
  pulse: (g, [cx, cy, s = 1.06, dur = 1.1]) => `<g transform="translate(${cx} ${cy})"><g><g transform="translate(${-cx} ${-cy})">${g}</g>${loop('transform', 'scale', `1;${s};1;${(1 + (s - 1) * .6).toFixed(3)};1`, dur, ' keyTimes="0;.15;.3;.45;1"')}</g></g>`,
  spin: (g, [cx, cy, dur = 6]) => `<g>${g}${loop('transform', 'rotate', `0 ${cx} ${cy};360 ${cx} ${cy}`, dur)}</g>`,
  flip: (g, [cx, cy, dur = 2.6]) => `<g transform="translate(${cx} ${cy})"><g><g transform="translate(${-cx} ${-cy})">${g}</g>${loop('transform', 'scale', '1 1;.15 1;1 1', dur, ' calcMode="spline" keySplines=".45 0 .55 1;.45 0 .55 1"')}</g></g>`,
  wobble: (g, [cx, cy, deg = 7, dur = 1.8]) => `<g>${g}${loop('transform', 'rotate', `0 ${cx} ${cy};${-deg} ${cx} ${cy};${deg * .7} ${cx} ${cy};0 ${cx} ${cy};0 ${cx} ${cy}`, dur, ' keyTimes="0;.12;.26;.4;1"')}</g>`
};
// little twinkling sparkles placed around a piece
const sparkles = (pts, col) => pts.map(([x, y, r, d], i) => `<path d="M${x} ${y - r}l${r * .3} ${r * .7} ${r * .7} ${r * .3}-${r * .7} ${r * .3}-${r * .3} ${r * .7}-${r * .3}-${r * .7}-${r * .7}-${r * .3} ${r * .7}-${r * .3}z" fill="${col}" opacity="0"><animate attributeName="opacity" values="0;1;0" dur="${d}s" begin="${(i * .45).toFixed(2)}s" repeatCount="indefinite"/></path>`).join('');

/* ---------------- the sets ---------------- */
const SETS = {};

// Christmas: bauble, gift, tree, reindeer, angel, Santa
SETS.christmas = {name:'Christmas characters', pal:{
  w:{body:'#fffdf7', shade:'#e9dcc0', hi:'#ffffff', ink:'#4a2a12', a1:'#c8102e', a2:'#e8b730', a3:'#1f7a3a', hat:'#c8102e', skin:'#f6d3b8', eye:'#2b1a10', flame:'#ffb627', flame2:'#fff3b0'},
  b:{body:'#7a0a1a', shade:'#4e0610', hi:'#c2414f', ink:'#1a0306', a1:'#ffd76a', a2:'#ffd76a', a3:'#2f9a52', hat:'#e0283c', skin:'#f0c8a8', eye:'#1a0306', flame:'#ffb627', flame2:'#fff3b0'}},
 draw:{
  P: c => base(c, 44) + O(50, 62, 21, c.body, c) + P('M30 58q20 8 40 0v8q-20 8-40 0z', c.a1, c, ' stroke-width="1.6"') + D(42, 54, 2.2, c.a2) + D(58, 54, 2.2, c.a2) + D(50, 74, 2.2, c.a2) + R(44, 36, 12, 7, c.a2, c, 1.5) + L('M47 36c0-6 6-6 6 0', c.ink, 2.2) + E(43, 55, 4, 6, '#fff', c, ' stroke-width="0" opacity=".35"'),
  R: c => base(c, 62) + R(24, 46, 52, 38, c.body, c) + R(45, 46, 10, 38, c.a1, c, 0) + R(24, 60, 52, 9, c.a1, c, 0) + R(21, 40, 58, 9, c.shade, c) + R(45, 40, 10, 9, c.a1, c, 0) + P('M50 40c-6-12-20-12-18-2 2 6 12 4 18 2z', c.a1, c) + P('M50 40c6-12 20-12 18-2-2 6-12 4-18 2z', c.a1, c) + O(50, 39, 3.6, c.a2, c),
  B: c => base(c, 46) + R(45, 78, 10, 8, c.shade, c, 1) + P('M50 18L70 44H60L76 62H64L80 80H20L36 62H24L40 44H30Z', c.body, c) + L('M34 56q16 6 32 0M28 74q22 7 44 0', c.a1, 2.4) + D(42, 50, 2.6, c.a2) + D(58, 66, 2.6, c.a2) + D(38, 70, 2.6, c.a1) + D(60, 48, 2.6, c.a1) + star(50, 13, 8.5, c.a2, c),
  N: c => base(c, 54) + P('M70 86C70 70 74 58 66 46C61 38 52 34 44 35C35 36 27 43 22 51C20 55 23 59 28 59C34 59 38 57 43 59C45 67 39 75 34 86Z', c.body, c) + L('M58 37C60 27 66 21 72 12M64 25l9 2M61 31l-7-9M48 36C46 28 42 22 37 16M45 28l-8 1', c.a2, 4.2) + E(57, 40, 4, 7, c.shade, c, ' transform="rotate(30 57 40)"') + eye(39, 47, c) + O(21, 53, 5, c.a1, c) + D(19.5, 51.5, 1.4, '#fff') + L('M40 70q8 3 18 0', c.a1, 3),
  Q: c => base(c, 52) + P('M38 44C24 36 16 44 20 56c8-2 14-4 18-8z', c.hi, c) + P('M62 44c14-8 22 0 18 12-8-2-14-4-18-8z', c.hi, c) + P('M40 40Q50 36 60 40L72 84H28Z', c.body, c) + P('M28 84l2-9q20 6 40 0l2 9z', c.a1, c) + O(50, 30, 9, c.skin, c) + P('M41 28c2-9 16-9 18 0-4-4-14-4-18 0z', c.a2, c, ' stroke-width="1.6"') + E(50, 15, 11, 3.6, 'none', c, ` stroke="${c.a2}" stroke-width="3"`) + eye(46.5, 31, c, 1.5) + eye(53.5, 31, c, 1.5) + star(50, 56, 6, c.a2, c),
  K: c => base(c, 58) + P('M30 84L34 54Q50 46 66 54L70 84Z', c.body, c) + R(31, 66, 38, 7, c.ink, c, 1) + R(46, 65, 8, 9, c.a2, c, 1.5) + O(50, 40, 11, c.skin, c) + P('M37 42c-2 14 6 20 13 20s15-6 13-20c-4 6-8 6-13 6s-9 0-13-6z', '#fff', c) + P('M38 32C38 18 52 12 66 18L72 28C66 26 64 30 62 32Z', c.hat, c) + R(35, 30, 30, 6, '#fff', c, 3) + O(72, 30, 4.5, '#fff', c) + cross(72, 16, c.a2, c) + eye(46, 40, c, 1.6) + eye(54, 40, c, 1.6) + D(50, 45, 2.2, '#e88')
 }};

// Halloween: jack-o'-lantern, haunted tower, ghost, black cat, witch, vampire
SETS.halloween = {name:'Halloween characters', pal:{
  w:{body:'#ffe7c2', shade:'#e8c38a', hi:'#fff7e6', ink:'#3a1600', pump:'#ff8a1f', pump2:'#ffa54a', a1:'#ff8a1f', a2:'#5e3290', a3:'#7bd35a', skin:'#f2e6c9', eye:'#2a1240', glow:'#ffd23f', cape:'#c8102e', flame:'#ffb627', flame2:'#fff3b0'},
  b:{body:'#2b1238', shade:'#160820', hi:'#6b3b8c', ink:'#06020a', pump:'#2b1238', pump2:'#4a2470', a1:'#4a2470', a2:'#c9a2ff', a3:'#7bd35a', skin:'#d8e8c8', eye:'#ff4d4d', glow:'#7bd35a', cape:'#8b0000', flame:'#7bd35a', flame2:'#d8ffd0'}},
 draw:{
  P: c => base(c, 46) + E(38, 64, 12, 18, c.pump, c) + E(62, 64, 12, 18, c.pump, c) + E(50, 64, 13, 19, c.pump2, c) + P('M49 46c0-5 1-9 5-11', c.a3, c, ' stroke-width="4"') + P('M40 58l5-6 5 6zM50 58l5-6 5 6z', c.glow, c, ' stroke-width="1.2"') + P('M38 68q12 10 24 0l-4 2-3-3-3 3-3-3-3 3-3-3z', c.glow, c, ' stroke-width="1.2"'),
  R: c => base(c, 60) + P('M26 84V36h8v-8h8v8h16v-8h8v8h8v48Z', c.body, c) + P('M44 84V66a6 6 0 0 1 12 0v18Z', c.shade, c) + P('M33 46h8v10h-8zM59 46h8v10h-8z', c.glow, c) + L('M30 36l6 6M66 30l-4 8', c.ink, 1.6) + P('M72 22c-3-3-7-3-9 0 3-1 5 0 6 2-2-1-4 0-5 2 3 0 6 1 8-1z', c.a2, c, ' stroke-width="1.4"'),
  B: c => base(c, 46) + P('M50 14C66 14 72 30 72 46V82l-5.5-6-5.5 6-5.5-6-5.5 6-5.5-6-5.5 6-5.5-6-5.5 6V46C28 30 34 14 50 14Z', c.body, c) + E(43, 40, 3.6, 5.5, c.eye, c, ' stroke-width="0"') + E(57, 40, 3.6, 5.5, c.eye, c, ' stroke-width="0"') + E(50, 54, 4.5, 6, c.eye, c, ' stroke-width="0"') + P('M28 50c-6 2-9 8-8 14 4-2 7-6 8-10z', c.body, c) + P('M72 50c6 2 9 8 8 14-4-2-7-6-8-10z', c.body, c),
  N: c => base(c, 54) + P('M68 86C70 72 72 60 66 50C64 42 60 36 60 30L66 18 54 26C50 24 44 24 40 26L32 16 32 30C26 36 22 44 24 52C26 58 32 60 38 60C42 64 40 74 34 86Z', c.body, c) + P('M36 20l-2 8 5-3zM62 21l1 7-5-2z', c.a1, c, ' stroke-width="1"') + E(38, 41, 3.6, 4.6, c.glow, c) + D(38, 41, 1.6, c.ink) + E(52, 40, 3.6, 4.6, c.glow, c) + D(52, 40, 1.6, c.ink) + P('M28 50l-3 2 3 1z', c.a2, c, ' stroke-width="1.2"') + L('M30 52l-12-2M30 55l-12 2M44 52l12-2M44 55l12 2', c.ink, 1.2),
  Q: c => base(c, 52) + P('M36 50Q50 44 64 50L72 84H28Z', c.body, c) + O(50, 42, 10, c.skin, c) + L('M38 44c-4 10-4 18 0 26M62 44c4 10 4 18 0 26', c.a1, 4) + P('M22 34h56c0 4-4 6-8 6H30c-4 0-8-2-8-6z', c.a2, c) + P('M34 34L48 6c2-2 4-2 4 2L66 34Z', c.a2, c) + R(36, 28, 28, 6, c.a1, c, 1) + eye(46, 42, c, 1.5) + eye(54, 42, c, 1.5) + L('M46 47q4 3 8 0', c.ink, 1.6),
  K: c => base(c, 58) + P('M18 84L30 46 50 56 70 46 82 84Z', c.cape, c) + P('M30 84L36 54Q50 48 64 54L70 84Z', c.body, c) + P('M30 46L26 22 42 36ZM70 46L74 22 58 36Z', c.cape, c) + O(50, 38, 11, c.skin, c) + P('M38 34C38 22 62 22 62 34C58 30 54 28 50 34C46 28 42 30 38 34Z', c.eye === '#2a1240' ? '#1a0a24' : '#000', c) + eye(45.5, 38, c, 1.7) + eye(54.5, 38, c, 1.7) + P('M45 45h10l-1.5 3-1.5-2-1.5 3-1.5-3-1.5 2z', '#fff', c, ' stroke-width="1"') + O(50, 64, 4, c.a2 === '#5e3290' ? '#c8102e' : c.a2, c) + crown(50, 12, '#e8b730', c)
 }};

// New Year: disco ball, clock tower, champagne flute, party horse, firework queen, Father Time's hourglass
SETS.newyear = {name:'New Year characters', pal:{
  w:{body:'#fffaf0', shade:'#e3d3a5', hi:'#ffffff', ink:'#4a3600', a1:'#e8b730', a2:'#e0479e', a3:'#38bdf8', skin:'#f6d3b8', eye:'#2b1a10', glass:'#fff7d6', flame:'#ffb627', flame2:'#fff3b0'},
  b:{body:'#1b2033', shade:'#0b0d14', hi:'#4a5578', ink:'#000', a1:'#fbbf24', a2:'#ff5fb0', a3:'#5fd0ff', skin:'#e8c8a8', eye:'#000', glass:'#3a4060', flame:'#ffb627', flame2:'#fff3b0'}},
 draw:{
  P: c => base(c, 44) + L('M50 26v8', c.ink, 2) + R(46, 33, 8, 5, c.a1, c, 1) + O(50, 60, 21, c.body, c) + L('M30 52h40M29 60h42M30 68h40M36 44q-6 16 0 32M50 39v42M64 44q6 16 0 32', c.ink, 1.1, ' opacity=".55"') + R(36, 47, 6, 5, c.a3, c, 0, ' stroke-width="0"') + R(56, 63, 6, 5, c.a2, c, 0, ' stroke-width="0"') + R(44, 55, 6, 5, c.a1, c, 0, ' stroke-width="0"'),
  R: c => base(c, 60) + P('M28 84V34h7v-7h7v7h16v-7h7v7h7v50Z', c.body, c) + O(50, 54, 12, c.glass, c) + L('M50 54V45M50 54l6 3', c.ink, 2.4) + D(50, 54, 1.8, c.a2) + R(44, 70, 12, 14, c.shade, c, 1) + L('M38 46v0M62 46v0', c.a1, 3),
  B: c => base(c, 40) + L('M50 62v20M40 84h20', c.ink, 3) + P('M38 14h24l-2 34c-1 9-5 14-10 14s-9-5-10-14Z', c.glass, c) + P('M39 26h22l-1 22c-1 7-5 11-10 11s-9-4-10-11Z', c.a1, c, ' opacity=".9"') + D(46, 40, 1.6, '#fff') + D(53, 33, 1.3, '#fff') + D(49, 48, 1.4, '#fff') + D(54, 20, 1.6, c.a2) + D(44, 10, 1.4, c.a3),
  N: c => base(c, 54) + P('M70 86C70 70 74 58 66 46C61 38 52 34 44 35C35 36 27 43 22 51C20 55 23 59 28 59C34 59 38 57 43 59C45 67 39 75 34 86Z', c.body, c) + P('M48 35L56 8 64 38Z', c.a2, c) + O(56, 8, 3, c.a1, c) + L('M51 22l8 2M49 30l11 2', c.a1, 2) + P('M64 44c6 4 10 12 8 22-4-6-8-10-10-12z', c.a3, c, ' stroke-width="1.6"') + eye(39, 47, c) + D(25, 54, 1.6, c.ink),
  Q: c => base(c, 52) + P('M38 46Q50 42 62 46L72 84H28Z', c.body, c) + O(50, 36, 9, c.skin, c) + P('M36 26L50 8 64 26Z', 'none', c, ` stroke="${c.a1}" stroke-width="0"`) + L('M50 26V10M50 26L38 14M50 26l12-12M50 26L34 22M50 26l16-4', c.a1, 2.6) + D(50, 9, 2.6, c.a2) + D(37, 13, 2.4, c.a3) + D(63, 13, 2.4, c.a2) + D(33, 22, 2.2, c.a1) + D(67, 22, 2.2, c.a3) + eye(46.5, 37, c, 1.5) + eye(53.5, 37, c, 1.5) + L('M32 66q18 8 36 0', c.a1, 2.6),
  K: c => base(c, 50) + R(28, 20, 44, 7, c.a1, c, 2) + R(28, 77, 44, 7, c.a1, c, 2) + P('M33 27h34c0 14-12 18-12 24s12 10 12 26H33c0-16 12-20 12-26S33 41 33 27Z', c.glass, c) + P('M37 33h26c-2 7-9 11-13 14-4-3-11-7-13-14ZM50 56c3 4 13 9 13 21H37c0-12 10-17 13-21Z', c.a1, c, ' stroke-width="1.4"') + L('M30 27v50M70 27v50', c.shade, 3) + cross(50, 4, c.a1, c)
 }};

// Lunar New Year: mandarin, pagoda, firecracker, dragon, round lantern, palace lantern
SETS.lunar = {name:'Lunar New Year characters', pal:{
  w:{body:'#fff8e7', shade:'#ecd3a0', hi:'#ffffff', ink:'#6b1300', a1:'#c8102e', a2:'#e8b730', a3:'#2f9a52', fruit:'#ff9a1f', lant:'#fff1d6', eye:'#2b1a10', flame:'#ffb627', flame2:'#fff3b0'},
  b:{body:'#2a0a06', shade:'#140402', hi:'#7a2a1a', ink:'#000', a1:'#e0283c', a2:'#ffd35c', a3:'#3fb46a', fruit:'#b5520f', lant:'#7a0a10', eye:'#ffd35c', flame:'#ffb627', flame2:'#fff3b0'}},
 draw:{
  P: c => base(c, 44) + O(50, 62, 20, c.fruit, c) + O(50, 62, 20, c.body, c, ' opacity=".18" stroke-width="0"') + P('M50 42c4-6 12-8 16-4-6 2-10 4-16 4z', c.a3, c) + D(50, 43, 2, c.ink) + E(43, 55, 4, 6, '#fff', c, ' stroke-width="0" opacity=".3"') + P('M42 64h16M46 60v8M54 60v8', 'none', c, ` stroke="${c.a2}" stroke-width="0"`),
  R: c => base(c, 62) + P('M22 44h56l-8-8H30Z', c.a1, c) + P('M30 36h40l-6-7H36Z', c.a1, c) + P('M36 29h28l-14-12Z', c.a1, c) + R(30, 44, 40, 40, c.body, c, 1) + R(30, 44, 40, 6, c.a2, c, 0) + P('M44 84V68a6 6 0 0 1 12 0v16Z', c.shade, c) + R(34, 56, 7, 8, c.a1, c, 1) + R(59, 56, 7, 8, c.a1, c, 1) + D(50, 15, 2.4, c.a2),
  B: c => base(c, 40) + R(38, 26, 24, 58, c.body, c, 4) + R(38, 34, 24, 6, c.a1, c, 0) + R(38, 70, 24, 6, c.a1, c, 0) + R(38, 52, 24, 4, c.a2, c, 0) + P('M47 46h6l-3 4z', c.a2, c, ' stroke-width="1"') + L('M50 26c0-6 4-8 2-14', c.ink, 2) + star(53, 10, 6, c.a2, c),
  N: c => base(c, 56) + P('M70 86C72 70 74 60 66 48L72 36 62 38C58 32 50 30 42 32L30 36 22 46C20 50 22 54 26 54L40 56C44 64 38 76 32 86Z', c.body, c) + P('M44 32l4-14 6 12M54 31l8-12 2 14', c.a2, c, ' stroke-width="2"') + L('M24 50c-6 2-10 8-8 14M30 54c-4 4-4 10 0 14', c.a2, 2) + P('M66 48l10-4-4 8 8 2-8 4 6 6-10-2', c.a1, c, ' stroke-width="1.6"') + eye(42, 42, c) + L('M30 42l6 2', c.ink, 2) + D(25, 48, 1.4, c.ink) + L('M46 66q8 4 16 0M44 74q10 4 20 0', c.a1, 2.4),
  Q: c => base(c, 48) + L('M50 12v8', c.ink, 2) + R(40, 18, 20, 6, c.a2, c, 2) + E(50, 46, 24, 22, c.lant, c) + P('M50 24c-10 6-10 38 0 44M50 24c10 6 10 38 0 44M30 46h40', 'none', c, ` stroke="${c.a1}" stroke-width="2"`) + R(40, 66, 20, 6, c.a2, c, 2) + L('M44 72v10M50 72v12M56 72v10', c.a2, 2.4) + crown(50, 2, c.a2, c, 14),
  K: c => base(c, 50) + R(36, 16, 28, 7, c.a2, c, 2) + P('M34 23h32l4 10v34l-4 10H34l-4-10V33Z', c.lant, c) + L('M30 33h40M30 67h40M42 23v54M58 23v54', c.a1, 2) + R(43, 42, 14, 14, c.a2, c, 2) + R(36, 77, 28, 7, c.a2, c, 2) + cross(50, 2, c.a2, c)
 }};

// Valentine's: heart, chocolate box, rose, teddy bear, tiara heart, crowned heart
SETS.valentine = {name:'Valentine’s characters', pal:{
  w:{body:'#fff5f8', shade:'#f4c6d4', hi:'#ffffff', ink:'#7a0f30', a1:'#e11d48', a2:'#e8b730', a3:'#2f9a52', bear:'#e6c3a0', eye:'#3a0a18', flame:'#ffb627', flame2:'#fff3b0'},
  b:{body:'#3d0716', shade:'#22030c', hi:'#8a2240', ink:'#000', a1:'#ff4f7b', a2:'#ffd35c', a3:'#3fb46a', bear:'#6a3a28', eye:'#000', flame:'#ffb627', flame2:'#fff3b0'}},
 draw:{
  P: c => base(c, 44) + heart(50, 58, 1.25, c.body, c) + heart(50, 58, .62, c.a1, c, ' stroke-width="0"') + E(41, 52, 3, 4.5, '#fff', c, ' stroke-width="0" opacity=".4"'),
  R: c => base(c, 62) + R(24, 46, 52, 38, c.body, c, 3) + P('M24 46l4-8 4 8 4-8 4 8 4-8 4 8 4-8 4 8 4-8 4 8 4-8 4 8', c.shade, c, ' stroke-width="1.6"') + R(46, 46, 8, 38, c.a1, c, 0) + heart(50, 62, .7, c.a1, c) + D(50, 60, 2, c.a2),
  B: c => base(c, 40) + L('M50 84V40', c.a3, 4) + P('M50 62c-10-2-14-8-12-14 6 0 10 6 12 14z', c.a3, c, ' stroke-width="1.6"') + P('M50 54c8-2 12-8 10-14-6 0-9 6-10 14z', c.a3, c, ' stroke-width="1.6"') + P('M36 24c0-10 8-14 14-10 6-4 14 0 14 10 0 10-6 18-14 18S36 34 36 24Z', c.a1, c) + P('M42 22c4-6 12-6 16 0-4 2-12 2-16 0z', c.body, c, ' stroke-width="1.4" opacity=".7"') + L('M44 30q6 4 12 0', c.ink, 1.4),
  N: c => base(c, 52) + P('M66 86C68 72 70 62 64 54C66 46 64 38 58 34C52 30 44 30 38 34C32 38 28 46 30 54C24 62 30 74 34 86Z', c.bear, c) + O(36, 30, 7, c.bear, c) + O(64, 30, 7, c.bear, c) + O(36, 30, 3, c.a1, c, ' stroke-width="0"') + O(64, 30, 3, c.a1, c, ' stroke-width="0"') + E(50, 52, 9, 7, c.body, c) + D(50, 49, 2.4, c.ink) + eye(43, 42, c) + eye(57, 42, c) + heart(50, 72, .45, c.a1, c),
  Q: c => base(c, 50) + heart(50, 50, 1.9, c.body, c) + P('M36 24l4-12 6 8 4-12 4 12 6-8 4 12z', c.a2, c, ' stroke-width="1.8"') + D(50, 12, 2, c.a1) + heart(50, 50, .8, c.a1, c),
  K: c => base(c, 56) + heart(50, 54, 2.1, c.a1, c) + heart(50, 54, 1.25, c.body, c, ' stroke-width="1.6"') + crown(50, 18, c.a2, c, 22) + cross(50, 2, c.a2, c)
 }};

// St Patrick's: gold coin, pot of gold, shamrock, horse in a bowler hat, harp, leprechaun
SETS.patrick = {name:'St Patrick’s characters', pal:{
  w:{body:'#fbfff8', shade:'#cfe6c0', hi:'#ffffff', ink:'#14401f', a1:'#1f8a3a', a2:'#ffd23f', a3:'#e0702a', coat:'#bfe8b0', skin:'#f6d3b8', eye:'#14401f', flame:'#ffb627', flame2:'#fff3b0'},
  b:{body:'#0b2414', shade:'#04120a', hi:'#2f6a42', ink:'#000', a1:'#3fbf62', a2:'#ffd23f', a3:'#e0702a', coat:'#123a20', skin:'#e8c8a8', eye:'#000', flame:'#ffb627', flame2:'#fff3b0'}},
 draw:{
  P: c => base(c, 40) + E(50, 60, 17, 22, c.a2, c) + E(50, 60, 12.5, 17, c.body, c, ' stroke-width="1.6"') + O(47, 55, 4, c.a1, c, ' stroke-width="1"') + O(53, 55, 4, c.a1, c, ' stroke-width="1"') + O(50, 61, 4, c.a1, c, ' stroke-width="1"') + L('M50 64v6', c.a1, 2),
  R: c => base(c, 60) + O(36, 42, 7, c.a2, c) + O(50, 38, 8, c.a2, c) + O(64, 42, 7, c.a2, c) + O(43, 36, 6, c.a2, c) + O(57, 36, 6, c.a2, c) + P('M24 46h52c0 26-10 38-26 38S24 72 24 46Z', c.body, c) + R(21, 42, 58, 8, c.shade, c, 4) + L('M30 62q20 8 40 0', c.a1, 2.4),
  B: c => base(c, 40) + L('M50 84V46', c.a1, 4) + O(50, 24, 10, c.body, c) + O(38, 38, 10, c.body, c) + O(62, 38, 10, c.body, c) + O(50, 24, 5, c.a1, c, ' stroke-width="0"') + O(38, 38, 5, c.a1, c, ' stroke-width="0"') + O(62, 38, 5, c.a1, c, ' stroke-width="0"') + D(50, 34, 3, c.a2),
  N: c => base(c, 54) + P('M70 86C70 70 74 58 66 46C61 38 52 34 44 35C35 36 27 43 22 51C20 55 23 59 28 59C34 59 38 57 43 59C45 67 39 75 34 86Z', c.body, c) + P('M42 36c-4-6-2-14 8-16 10-2 16 4 14 12z', c.a1, c) + R(36, 32, 32, 5, c.a1, c, 2) + R(44, 26, 18, 3, c.a2, c, 1, ' stroke-width="1"') + P('M66 46c6 4 10 14 8 24-4-8-8-12-10-14z', c.a3, c, ' stroke-width="1.6"') + eye(39, 47, c) + D(25, 54, 1.6, c.ink),
  Q: c => base(c, 50) + P('M36 84V22c0-8 8-12 14-8 10 6 18 18 22 36l-4 34Z', c.body, c) + P('M36 22c10 0 20 10 26 22', 'none', c, ` stroke="${c.a2}" stroke-width="4"`) + L('M42 30v54M48 34v50M54 40v44M60 48v36M66 60v24', c.a2, 1.6) + O(40, 18, 5, c.a2, c) + crown(40, 4, c.a2, c, 12),
  K: c => base(c, 54) + P('M32 84L36 58Q50 52 64 58L68 84Z', c.coat, c) + O(50, 46, 11, c.skin, c) + P('M38 48c-2 14 6 20 12 20s14-6 12-20c-3 4-7 6-12 6s-9-2-12-6z', c.a3, c) + R(30, 34, 40, 5, c.a1, c, 2) + P('M36 34V16h28v18Z', c.body, c) + R(36, 26, 28, 5, c.ink, c, 0) + R(46, 25, 8, 7, c.a2, c, 1) + eye(46, 45, c, 1.5) + eye(54, 45, c, 1.5) + cross(50, 2, c.a2, c)
 }};

// Ramadan & Eid: small lantern, drum, tall lantern, camel, crescent and star, ornate lantern
SETS.eid = {name:'Ramadan & Eid characters', pal:{
  w:{body:'#f8fffd', shade:'#cfe9e2', hi:'#ffffff', ink:'#0d3b38', a1:'#1f8a80', a2:'#e8b730', a3:'#c8102e', camel:'#e6c08a', eye:'#0d3b38', glow:'#ffe08a', flame:'#ffb627', flame2:'#fff3b0'},
  b:{body:'#04201e', shade:'#021210', hi:'#1f5f5a', ink:'#000', a1:'#2fb5a8', a2:'#fcd34d', a3:'#e0283c', camel:'#8a6038', eye:'#000', glow:'#ffd35c', flame:'#ffb627', flame2:'#fff3b0'}},
 draw:{
  P: c => base(c, 40) + L('M50 28v6', c.ink, 2) + P('M42 36h16l-8-6z', c.a2, c) + P('M40 40h20l4 10-4 24H40l-4-24Z', c.body, c) + P('M44 46h12l2 8-2 14H44l-2-14Z', c.glow, c, ' stroke-width="1.4"') + R(40, 74, 20, 6, c.a2, c, 2),
  R: c => base(c, 60) + P('M26 40h48v40c0 4-48 4-48 0Z', c.body, c) + E(50, 40, 24, 6, c.shade, c) + P('M26 50l8 10 8-10 8 10 8-10 8 10 8-10', 'none', c, ` stroke="${c.a1}" stroke-width="3"`) + L('M26 70h48', c.a2, 3) + L('M40 30l6 10M62 28l-6 12', c.ink, 2.4),
  B: c => base(c, 44) + L('M50 8v8', c.ink, 2) + P('M40 18h20l-10-8z', c.a2, c) + P('M38 22h24l6 16-4 34H36l-4-34Z', c.body, c) + P('M42 28h16l4 12-3 26H41l-3-26Z', c.glow, c, ' stroke-width="1.4"') + L('M50 28v38M40 40h20', c.a2, 1.6) + R(36, 72, 28, 8, c.a2, c, 2),
  N: c => base(c, 56) + P('M70 86C70 72 70 62 64 54C60 50 58 44 58 36C58 30 54 26 48 26C42 26 36 28 30 32L22 38C20 42 22 46 26 46L38 46C44 48 44 58 40 66C36 74 34 80 34 86Z', c.camel, c) + E(54, 26, 4, 7, c.camel, c, ' transform="rotate(20 54 26)"') + eye(40, 34, c) + L('M22 42q4 2 8 0', c.ink, 1.6) + P('M38 60c6 6 18 6 26-2', 'none', c, ` stroke="${c.a3}" stroke-width="4"`) + L('M42 62v6M50 64v6M58 62v6', c.a2, 2),
  Q: c => base(c, 46) + R(46, 66, 8, 18, c.shade, c, 1) + P('M58 16a24 24 0 1 0 6 40 20 20 0 1 1-6-40z', c.body, c) + star(60, 34, 9, c.a2, c) + crown(50, 6, c.a2, c, 12),
  K: c => base(c, 50) + L('M50 14v4', c.ink, 2) + P('M38 20h24l-12-6z', c.a2, c) + P('M34 24h32l6 18-4 34H32l-4-34Z', c.body, c) + P('M40 32h20l4 12-3 24H39l-3-24Z', c.glow, c, ' stroke-width="1.4"') + P('M52 40a8 8 0 1 0 3 14 6 6 0 1 1-3-14z', c.a2, c, ' stroke-width="1.2"') + R(32, 76, 36, 8, c.a2, c, 2) + P('M54 2a6 6 0 1 0 2 10 5 5 0 1 1-2-10z', c.a2, c, ' stroke-width="1.4"')
 }};

// Easter: egg, basket, carrot, bunny, tulip, chick in an egg
SETS.easter = {name:'Easter characters', pal:{
  w:{body:'#fffdf2', shade:'#e6dcc0', hi:'#ffffff', ink:'#4b3a8c', a1:'#ff9ec7', a2:'#ffd23f', a3:'#7bd35a', a4:'#8fd3ff', chick:'#ffe066', eye:'#2b1a40', flame:'#ffb627', flame2:'#fff3b0'},
  b:{body:'#2a1a4a', shade:'#160d2a', hi:'#5a4a8a', ink:'#000', a1:'#ff7eb3', a2:'#ffd23f', a3:'#5fc05a', a4:'#5fb8ff', chick:'#e8b730', eye:'#000', flame:'#ffb627', flame2:'#fff3b0'}},
 draw:{
  P: c => base(c, 42) + E(50, 60, 16, 21, c.body, c) + P('M35 56l5-4 5 4 5-4 5 4 5-4 5 4', 'none', c, ` stroke="${c.a1}" stroke-width="3"`) + L('M35 66q15 6 30 0', c.a4, 3) + D(44, 48, 2, c.a2) + D(56, 74, 2, c.a3),
  R: c => base(c, 62) + E(38, 44, 8, 10, c.a1, c) + E(50, 40, 8, 10, c.a4, c) + E(62, 44, 8, 10, c.a2, c) + P('M22 48h56l-6 36H28Z', c.body, c) + L('M24 58h52M26 68h48M27 78h46M34 48l2 36M44 48l1 36M56 48l-1 36M66 48l-2 36', c.shade, 1.8) + L('M24 50c4-30 48-30 52 0', c.ink, 3),
  B: c => base(c, 40) + P('M42 30c-2-10-10-14-14-10 6 0 10 4 12 10zM50 28c0-12 0-18 2-20 2 6 2 14-2 20zM58 30c2-10 10-14 14-10-6 0-10 4-12 10z', c.a3, c, ' stroke-width="1.8"') + P('M40 30h20c0 20-6 40-10 52-4-12-10-32-10-52z', c.body, c) + L('M44 42h6M46 54h6M47 66h4', c.a1, 2.4),
  N: c => base(c, 52) + E(40, 26, 6, 18, c.body, c, ' transform="rotate(-12 40 26)"') + E(58, 26, 6, 18, c.body, c, ' transform="rotate(12 58 26)"') + E(40, 26, 2.6, 12, c.a1, c, ' stroke-width="0" transform="rotate(-12 40 26)"') + E(58, 26, 2.6, 12, c.a1, c, ' stroke-width="0" transform="rotate(12 58 26)"') + P('M66 86C68 72 68 62 64 56C68 48 64 40 56 38C52 37 46 37 42 38C34 40 30 48 34 56C28 64 30 76 34 86Z', c.body, c) + eye(43, 48, c) + eye(57, 48, c) + D(50, 55, 2.4, c.a1) + L('M50 57v3M46 61q4 2 8 0', c.ink, 1.6) + L('M38 56l-8-1M38 59l-8 2M62 56l8-1M62 59l8 2', c.ink, 1),
  Q: c => base(c, 46) + L('M50 84V48', c.a3, 4) + P('M50 66c-12-2-16-10-14-18 8 2 12 8 14 18zM50 70c12-4 16-12 14-20-8 2-12 10-14 20z', c.a3, c, ' stroke-width="1.6"') + P('M34 16l8 10 8-14 8 14 8-10v14c0 10-8 16-16 16s-16-6-16-16Z', c.body, c) + P('M42 26l8-14 8 14', 'none', c, ` stroke="${c.a1}" stroke-width="2"`) + D(50, 34, 2.6, c.a1) + crown(50, 2, c.a2, c, 12),
  K: c => base(c, 52) + P('M30 56c0 18 8 28 20 28s20-10 20-28l-5 4-5-6-5 6-5-6-5 6-5-6-5 6z', c.body, c) + O(50, 42, 15, c.chick, c) + P('M46 44l8 0-4 5z', '#ff9a1f', c, ' stroke-width="1.2"') + eye(44, 39, c, 2) + eye(56, 39, c, 2) + P('M36 46c-6-2-8 4-4 8 2-2 4-4 4-8zM64 46c6-2 8 4 4 8-2-2-4-4-4-8z', c.chick, c, ' stroke-width="1.6"') + P('M34 30c2-6 30-6 32 0', c.body, c, ' stroke-width="1.8"') + crown(50, 18, c.a2, c, 18) + cross(50, 2, c.a2, c)
 }};

// Diwali: diya, dhol drum, lamp stand, elephant, lotus, peacock
SETS.diwali = {name:'Diwali characters', pal:{
  w:{body:'#fffaf0', shade:'#f0d6a0', hi:'#ffffff', ink:'#6b1f00', a1:'#f59e0b', a2:'#be185d', a3:'#0d9488', clay:'#e07a3a', ele:'#e6e2ea', eye:'#2b1a10', flame:'#ffb627', flame2:'#fff3b0'},
  b:{body:'#2a0626', shade:'#150313', hi:'#6a1a5a', ink:'#000', a1:'#fbbf24', a2:'#ec4899', a3:'#14b8a6', clay:'#8a3a12', ele:'#5a4a6a', eye:'#000', flame:'#ffb627', flame2:'#fff3b0'}},
 draw:{
  P: c => base(c, 46) + flame(50, 36, 1.3, c) + P('M28 60h44c-2 12-10 18-22 18s-20-6-22-18z', c.body, c) + P('M28 60c6-4 38-4 44 0', c.clay, c) + L('M34 68l4 3 4-3 4 3 4-3 4 3 4-3 4 3', c.a2, 2),
  R: c => base(c, 62) + P('M24 46c0-6 52-6 52 0v32c0 6-52 6-52 0Z', c.body, c) + E(50, 46, 26, 6, c.a1, c) + L('M24 50l10 24 10-24 10 24 10-24 10 24', c.a2, 2.2) + R(20, 58, 6, 10, c.a1, c, 2) + R(74, 58, 6, 10, c.a1, c, 2),
  B: c => base(c, 46) + R(46, 30, 8, 54, c.a1, c, 2) + P('M32 58h36c-2 6-8 8-18 8s-16-2-18-8z', c.body, c) + P('M36 40h28c-2 5-6 6-14 6s-12-1-14-6z', c.body, c) + flame(36, 46, .6, c) + flame(64, 46, .6, c) + flame(40, 28, .6, c) + flame(60, 28, .6, c) + flame(50, 6, 1, c) + P('M42 22h16c-1 4-4 5-8 5s-7-1-8-5z', c.body, c),
  N: c => base(c, 56) + P('M68 86C70 72 72 60 66 50C64 40 56 34 46 34C36 34 28 42 28 52C28 58 30 62 30 68C30 76 24 80 20 78C22 84 30 84 34 78C38 74 38 66 40 60C44 66 40 76 36 86Z', c.ele, c) + P('M58 40c10-4 16 4 14 16-2 8-8 10-12 8', c.ele, c) + P('M36 38c6-10 20-10 24 0-8-2-16-2-24 0z', c.a2, c, ' stroke-width="1.8"') + D(48, 33, 3, c.a1) + eye(40, 48, c) + P('M44 58l8 6-2 2', 'none', c, ` stroke="#fff" stroke-width="2.4"`),
  Q: c => base(c, 52) + P('M50 26c8 10 8 30 0 44-8-14-8-34 0-44z', c.body, c) + P('M50 70c-6-10-18-20-28-18 0 12 12 20 28 18zM50 70c6-10 18-20 28-18 0 12-12 20-28 18z', c.body, c) + P('M50 70c-2-14-10-28-18-30-2 12 6 24 18 30zM50 70c2-14 10-28 18-30 2 12-6 24-18 30z', c.a2, c, ' opacity=".9"') + P('M30 70h40c-4 8-12 12-20 12s-16-4-20-12z', c.a3, c) + crown(50, 12, c.a1, c, 14),
  K: c => base(c, 56) + P('M50 20c-20 2-34 22-30 46h60c4-24-10-44-30-46z', c.a3, c) + [26, 36, 50, 64, 74].map((x, i) => O(x, [50, 34, 28, 34, 50][i], 4.6, c.a1, c, ' stroke-width="1.4"') + D(x, [50, 34, 28, 34, 50][i], 2, c.a2)).join('') + P('M50 40c6 0 8 8 6 18l4 26H40l4-26c-2-10 0-18 6-18z', c.body, c) + O(50, 38, 6, c.body, c) + eye(52, 37, c, 1.4) + P('M56 38l6 1-6 2z', c.a1, c, ' stroke-width="1"') + L('M47 32l-3-8M50 31v-9M53 32l3-8', c.a2, 1.6) + cross(50, 6, c.a1, c)
 }};

// Hanukkah: dreidel, oil jug, candle, lion, crown of flames, crowned king
SETS.hanukkah = {name:'Hanukkah characters', pal:{
  w:{body:'#ffffff', shade:'#d8e2f4', hi:'#ffffff', ink:'#16307a', a1:'#2563eb', a2:'#c9d1dc', a3:'#e8b730', lion:'#f2d38a', skin:'#f6d3b8', eye:'#16307a', flame:'#ffb627', flame2:'#fff3b0'},
  b:{body:'#0a1433', shade:'#050a1c', hi:'#2c4a9c', ink:'#000', a1:'#5b8cff', a2:'#e5e7eb', a3:'#fbbf24', lion:'#9a6a2a', skin:'#e8c8a8', eye:'#000', flame:'#ffb627', flame2:'#fff3b0'}},
 draw:{
  P: c => base(c, 40) + R(47, 26, 6, 14, c.a2, c, 2) + P('M34 40h32v18L50 80 34 58Z', c.body, c) + L('M34 48h32', c.a1, 2) + P('M45 56h10M50 52v10', 'none', c, ` stroke="${c.a1}" stroke-width="2.6"`),
  R: c => base(c, 58) + P('M34 34h32l2 8c8 6 8 30 4 42H28c-4-12-4-36 4-42z', c.body, c) + R(32, 28, 36, 8, c.a2, c, 2) + P('M68 46c10 0 12 16 2 20', 'none', c, ` stroke="${c.ink}" stroke-width="3"`) + L('M30 56h40', c.a1, 3) + D(50, 68, 3, c.a3),
  B: c => base(c, 36) + R(42, 30, 16, 54, c.body, c, 3) + L('M42 44l16 8M42 58l16 8M42 72l16 8', c.a1, 2) + L('M50 30v-4', c.ink, 2) + flame(50, 8, 1.2, c),
  N: c => base(c, 56) + O(48, 48, 22, c.lion, c) + P('M30 40l-6-4 4 8-8 2 8 4-6 6 9-1M64 30l6-6-2 9 8-1-6 6', c.lion, c, ' stroke-width="1.8"') + O(46, 50, 13, c.body, c) + eye(41, 47, c) + eye(51, 47, c) + P('M44 54h6l-3 3z', c.ink, c, ' stroke-width="1"') + L('M47 57v3M43 61q4 2 8 0', c.ink, 1.4) + P('M60 64c4 8 6 14 6 22H34c0-8 4-14 8-18z', c.lion, c),
  Q: c => base(c, 52) + P('M36 44Q50 40 64 44L72 84H28Z', c.body, c) + L('M30 66q20 8 40 0', c.a1, 3) + O(50, 34, 9, c.skin, c) + R(36, 20, 28, 6, c.a3, c, 2) + flame(38, 6, .55, c) + flame(44, 3, .6, c) + flame(50, 0, .7, c) + flame(56, 3, .6, c) + flame(62, 6, .55, c) + eye(46.5, 35, c, 1.5) + eye(53.5, 35, c, 1.5),
  K: c => base(c, 58) + P('M30 84L34 52Q50 46 66 52L70 84Z', c.body, c) + P('M44 52h12v32H44z', c.a1, c, ' stroke-width="1.6"') + O(50, 38, 11, c.skin, c) + P('M39 42c0 10 4 16 11 16s11-6 11-16c-3 4-7 5-11 5s-8-1-11-5z', c.a2, c) + crown(50, 14, c.a3, c, 24) + O(50, 8, 3.4, c.a1, c) + eye(46, 37, c, 1.6) + eye(54, 37, c, 1.6)
 }};

// Spring: bud, birdhouse, hyacinth, robin, cherry blossom, sunflower
SETS.spring = {name:'Spring characters', pal:{
  w:{body:'#ffffff', shade:'#f4d6e2', hi:'#ffffff', ink:'#7a2a4a', a1:'#ff8fb8', a2:'#ffd23f', a3:'#5fb36b', a4:'#9b7be8', bird:'#c86a3a', eye:'#2b1a10', flame:'#ffb627', flame2:'#fff3b0'},
  b:{body:'#173a2a', shade:'#0b1f16', hi:'#3a6a52', ink:'#000', a1:'#ff7eb3', a2:'#ffd23f', a3:'#7bd35a', a4:'#b9a6f5', bird:'#d0703a', eye:'#000', flame:'#ffb627', flame2:'#fff3b0'}},
 draw:{
  P: c => base(c, 40) + L('M50 84V62', c.a3, 4) + P('M50 74c-8 0-12-4-12-8 6 0 10 2 12 8z', c.a3, c, ' stroke-width="1.4"') + P('M38 48c0-10 6-16 12-20 6 4 12 10 12 20s-6 16-12 16-12-6-12-16z', c.body, c) + P('M44 36c2 8 10 8 12 0', 'none', c, ` stroke="${c.a1}" stroke-width="2.4"`),
  R: c => base(c, 58) + P('M26 46L50 22 74 46Z', c.a1, c) + R(30, 46, 40, 38, c.body, c, 2) + O(50, 60, 7, c.shade, c) + D(50, 60, 4, c.ink) + L('M50 70v6', c.ink, 2.4) + P('M24 46L50 20 76 46', 'none', c, ` stroke="${c.ink}" stroke-width="3.2"`),
  B: c => base(c, 40) + L('M50 84V58', c.a3, 4) + P('M50 76c-10-4-12-14-10-20 6 4 10 10 10 20z', c.a3, c, ' stroke-width="1.4"') + [[50, 16], [44, 24], [56, 24], [42, 34], [50, 32], [58, 34], [44, 44], [56, 44], [50, 52]].map(([x, y]) => O(x, y, 6.4, c.body, c, ' stroke-width="1.6"') + D(x, y, 2, c.a4)).join(''),
  N: c => base(c, 54) + P('M70 86C70 72 70 62 66 54C64 44 58 36 48 34C40 33 32 38 30 44L18 48 30 52C32 60 40 64 44 70C42 76 38 80 36 86Z', c.body, c) + P('M30 52c4 12 16 18 26 14 4 8 6 14 6 20H44c0-6 2-10 2-14-8-2-14-10-16-20z', c.bird, c, ' stroke-width="1.8"') + P('M18 48l12-4v8z', c.a2, c) + eye(40, 44, c) + P('M62 40c8 0 12 8 10 14-4-4-8-8-10-14z', c.body, c),
  Q: c => base(c, 46) + L('M50 84V54', '#6a3a28', 4) + P('M50 70l12-8M50 64l-10-6', 'none', c, ` stroke="#6a3a28" stroke-width="3"`) + [0, 72, 144, 216, 288].map(d => { const a = (d - 90) * Math.PI / 180; return E(50 + 12 * Math.cos(a), 32 + 12 * Math.sin(a), 8, 10, c.body, c, ` transform="rotate(${d} ${(50 + 12 * Math.cos(a)).toFixed(1)} ${(32 + 12 * Math.sin(a)).toFixed(1)})"`); }).join('') + O(50, 32, 6, c.a1, c) + D(50, 32, 2.4, c.a2) + crown(50, 4, c.a2, c, 12),
  K: c => base(c, 50) + L('M50 84V54', c.a3, 5) + P('M50 74c-12-2-16-10-14-16 8 2 12 8 14 16z', c.a3, c, ' stroke-width="1.6"') + Array.from({length: 12}, (_, i) => { const a = i * 30 * Math.PI / 180; return E(50 + 17 * Math.cos(a), 36 + 17 * Math.sin(a), 6, 9, c.a2, c, ` stroke-width="1.6" transform="rotate(${i * 30 + 90} ${(50 + 17 * Math.cos(a)).toFixed(1)} ${(36 + 17 * Math.sin(a)).toFixed(1)})"`); }).join('') + O(50, 36, 13, c.body, c) + D(46, 33, 1.6, c.ink) + D(54, 33, 1.6, c.ink) + L('M45 39q5 4 10 0', c.ink, 1.6) + cross(50, 2, c.a2, c)
 }};

// Summer: beach ball, sandcastle, ice cream, seahorse, palm tree, sun in sunglasses
SETS.summer = {name:'Summer characters', pal:{
  w:{body:'#fffdf6', shade:'#f0dcae', hi:'#ffffff', ink:'#0b4a55', a1:'#ff6b6b', a2:'#ffd23f', a3:'#38bdf8', a4:'#2fa36b', sand:'#f4c26b', eye:'#0b2a30', flame:'#ffb627', flame2:'#fff3b0'},
  b:{body:'#06343a', shade:'#031c20', hi:'#1f6a74', ink:'#000', a1:'#ff7a7a', a2:'#ffd23f', a3:'#5fd0ff', a4:'#3fbf7a', sand:'#a8742a', eye:'#000', flame:'#ffb627', flame2:'#fff3b0'}},
 draw:{
  P: c => base(c, 44) + O(50, 60, 20, c.body, c) + P('M50 40c-8 8-8 32 0 40-14-4-20-14-20-20s6-16 20-20z', c.a1, c, ' stroke-width="1.6"') + P('M50 40c8 8 8 32 0 40 14-4 20-14 20-20s-6-16-20-20z', c.a3, c, ' stroke-width="1.6"') + O(50, 60, 4, c.a2, c, ' stroke-width="1.4"'),
  R: c => base(c, 64) + P('M22 84V56h6v-6h6v6h6V40h6v-6h8v6h6v16h6v-6h6v6h6v28Z', c.sand, c) + P('M22 84V56h6v-6h6v6h6V40h6v-6h8v6h6v16h6v-6h6v6h6v28Z', c.body, c, ' opacity=".3" stroke-width="0"') + P('M44 84V72a6 6 0 0 1 12 0v12Z', c.shade, c) + L('M50 34V20', c.ink, 2) + P('M50 20h12l-4 4 4 4H50z', c.a1, c, ' stroke-width="1.4"'),
  B: c => base(c, 40) + P('M38 42h24L50 84Z', c.sand, c) + L('M40 48l16 10M42 56l12 8M38 46l20 20M56 48l-12 18', c.ink, 1, ' opacity=".5"') + O(50, 36, 12, c.body, c) + O(50, 22, 9, c.a1, c) + P('M40 38c4 4 8-2 10 2 2-4 6 2 10-2', 'none', c, ` stroke="${c.a1}" stroke-width="2.4"`) + O(50, 12, 3.4, '#e11d48', c, ' stroke-width="1.4"'),
  N: c => base(c, 50) + P('M58 86C66 80 68 70 62 62C56 56 56 50 60 44C64 36 62 28 54 24C48 20 40 22 36 28L24 30 34 36C36 42 42 46 46 48C42 56 42 66 50 72C54 76 52 80 46 82C50 86 56 86 58 86Z', c.body, c) + P('M56 26l6-8 2 8 6-4-2 8 6 0-6 6', c.a1, c, ' stroke-width="1.6"') + L('M50 52l8-2M48 60l10 0M50 68l8 2', c.a3, 2) + eye(40, 30, c) + P('M64 48c6 2 8 8 6 14-4-4-6-8-6-14z', c.a3, c, ' stroke-width="1.6"'),
  Q: c => base(c, 48) + P('M48 84c2-16 4-34 0-50h6c4 16 2 34 0 50z', c.sand, c) + L('M49 76h5M50 66h5M50 56h5M50 46h4', c.ink, 1.2) + P('M51 32C40 22 26 24 20 34 30 30 40 30 51 32zM51 32c-8-10-6-22 2-26-2 8 0 18-2 26zM51 32c8-12 22-14 30-6-10-2-20 0-30 6zM51 32c12-2 22 4 26 14-8-6-16-10-26-14zM51 32c-12 0-22 8-24 18 6-8 14-14 24-18z', c.a4, c, ' stroke-width="1.6"') + O(46, 36, 3.6, '#8a5a2b', c, ' stroke-width="1.2"') + O(55, 37, 3.6, '#8a5a2b', c, ' stroke-width="1.2"') + crown(51, 6, c.a2, c, 12),
  K: c => base(c, 54) + Array.from({length: 12}, (_, i) => { const a = i * 30 * Math.PI / 180, x = 50 + 24 * Math.cos(a), y = 44 + 24 * Math.sin(a); return P(`M${(50 + 16 * Math.cos(a - .18)).toFixed(1)} ${(44 + 16 * Math.sin(a - .18)).toFixed(1)}L${x.toFixed(1)} ${y.toFixed(1)}L${(50 + 16 * Math.cos(a + .18)).toFixed(1)} ${(44 + 16 * Math.sin(a + .18)).toFixed(1)}z`, c.a2, c, ' stroke-width="1.4"'); }).join('') + O(50, 44, 17, c.body, c) + P('M36 40h12l-1 6q-5 3-10 0zM52 40h12l-1 6q-5 3-10 0z', '#111', c, ' stroke-width="1.2"') + L('M48 41h4', '#111', 2) + L('M43 52q7 6 14 0', c.ink, 2) + R(44, 70, 12, 14, c.shade, c, 2) + cross(50, 2, c.a2, c)
 }};

// Autumn: acorn, hay bale, pine cone, fox, maple leaf, owl
SETS.autumn = {name:'Autumn characters', pal:{
  w:{body:'#fff6e8', shade:'#ecd0a6', hi:'#ffffff', ink:'#5a2a0a', a1:'#e07b2a', a2:'#b5452a', a3:'#f2b33d', nut:'#c98a4a', fox:'#e07b2a', eye:'#2b1a10', flame:'#ffb627', flame2:'#fff3b0'},
  b:{body:'#2e0f04', shade:'#170702', hi:'#6a3a1a', ink:'#000', a1:'#f0903a', a2:'#d0603a', a3:'#f2b33d', nut:'#6a3a12', fox:'#a8471a', eye:'#000', flame:'#ffb627', flame2:'#fff3b0'}},
 draw:{
  P: c => base(c, 40) + P('M36 52h28c0 16-6 26-14 28-8-2-14-12-14-28z', c.body, c) + P('M34 52c0-10 8-14 16-14s16 4 16 14Z', c.nut, c) + L('M38 46h24M40 42h20', c.ink, 1.2, ' opacity=".5"') + L('M50 38c0-4 2-6 4-8', c.ink, 2.6),
  R: c => base(c, 60) + R(24, 44, 52, 40, c.a3, c, 6) + R(24, 44, 52, 40, c.body, c, 6, ' opacity=".35" stroke-width="0"') + L('M24 58h52M24 70h52', c.a2, 3) + L('M30 48l-2-8M40 46l1-9M52 46l-1-8M62 47l3-8M70 49l4-6', c.a3, 2) + L('M30 50v32M44 50v32M58 50v32M70 50v32', c.ink, 1, ' opacity=".35"'),
  B: c => base(c, 40) + L('M50 20v-8', '#6a3a12', 3) + P('M50 18c14 6 16 30 12 46-2 10-6 16-12 18-6-2-10-8-12-18-4-16-2-40 12-46z', c.body, c) + L('M40 32l20 8M38 44l24 8M38 56l24 8M40 68l20 6M60 32l-20 8M62 44l-24 8M62 56l-24 8M60 68l-20 6', c.nut, 2.2),
  N: c => base(c, 56) + P('M70 86C72 72 72 60 66 50L70 26 58 38C54 36 46 36 42 38L30 26 32 46 18 56C20 60 26 62 30 62 36 62 40 64 42 68 40 76 38 80 36 86Z', c.fox, c) + P('M18 56c8 0 14 2 18 6 4 6 8 8 14 6-6 8-20 6-26-2-2-4-4-6-6-10z', c.body, c, ' stroke-width="1.6"') + P('M34 32l-2 10 6-4zM66 32l-2 10-4-6z', c.ink, c, ' stroke-width="1"') + eye(40, 50, c) + D(18, 56, 2.2, c.ink) + P('M58 68c8 4 12 10 12 18H54c2-6 4-12 4-18z', c.body, c, ' stroke-width="1.6"'),
  Q: c => base(c, 46) + L('M50 84V54', '#6a3a12', 3.4) + P('M50 10l5 12 8-4-2 12 12-6-4 12 10 2-14 8 4 6-14-2-5 10-5-10-14 2 4-6-14-8 10-2-4-12 12 6-2-12 8 4z', c.a2, c) + P('M50 10l5 12 8-4-2 12 12-6-4 12 10 2-14 8 4 6-14-2-5 10-5-10-14 2 4-6-14-8 10-2-4-12 12 6-2-12 8 4z', c.body, c, ' opacity=".3" stroke-width="0"') + L('M50 54V22M50 44L36 32M50 44l14-12', c.ink, 1.4, ' opacity=".6"') + crown(50, 0, c.a3, c, 12),
  K: c => base(c, 56) + P('M30 84C26 64 28 44 34 34L30 18 42 28C46 26 54 26 58 28L70 18 66 34C72 44 74 64 70 84Z', c.body, c) + P('M38 54c4 10 20 10 24 0 4 10 2 22-2 28H40c-4-6-6-18-2-28z', c.nut, c, ' stroke-width="1.6"') + L('M42 64l3 3 3-3 3 3 3-3 3 3', c.ink, 1.2) + O(41, 42, 8, c.a3, c) + O(59, 42, 8, c.a3, c) + D(41, 42, 3.6, c.ink) + D(59, 42, 3.6, c.ink) + D(42, 41, 1.2, '#fff') + D(60, 41, 1.2, '#fff') + P('M47 48h6l-3 5z', c.a1, c, ' stroke-width="1.2"') + crown(50, 13, c.a3, c, 16) + cross(50, 0, c.a3, c)
 }};

// Winter: snowball, ice tower, icicle, polar bear, snowflake, snowman
SETS.winter = {name:'Winter characters', pal:{
  w:{body:'#ffffff', shade:'#d6e8f6', hi:'#ffffff', ink:'#1f4a78', a1:'#4f9fe6', a2:'#c8102e', a3:'#e8b730', a4:'#ff8a1f', bear:'#ffffff', eye:'#10243c', flame:'#ffb627', flame2:'#fff3b0'},
  b:{body:'#0e2038', shade:'#06101e', hi:'#2f5a8a', ink:'#000', a1:'#7fc4ff', a2:'#e0283c', a3:'#fbbf24', a4:'#ff8a1f', bear:'#3a5a7a', eye:'#000', flame:'#ffb627', flame2:'#fff3b0'}},
 draw:{
  P: c => base(c, 42) + O(50, 62, 19, c.body, c) + D(42, 56, 2, c.a1) + D(56, 66, 2.4, c.a1) + D(50, 52, 1.6, c.a1) + E(44, 55, 4, 6, '#fff', c, ' stroke-width="0" opacity=".45"') + L('M64 46l4-4M66 50h5M62 44v-5', c.a1, 2),
  R: c => base(c, 60) + P('M28 84V36h7v-7h7v7h16v-7h7v7h7v48Z', c.body, c) + L('M28 50h44M28 64h44M40 36v14M60 36v14M50 50v14M38 64v20M62 64v20', c.a1, 1.6, ' opacity=".7"') + P('M44 84V72a6 6 0 0 1 12 0v12Z', c.shade, c) + P('M30 36l2 8 2-8M64 36l2 10 2-10', c.a1, c, ' stroke-width="1.2"'),
  B: c => base(c, 40) + P('M50 8L64 28 58 30 62 50 56 52 58 74 50 84 42 74 44 52 38 50 42 30 36 28Z', c.body, c) + L('M50 14v66M44 32l12 0M42 52h16', c.a1, 1.6, ' opacity=".7"') + D(46, 24, 1.6, '#fff'),
  N: c => base(c, 56) + P('M70 86C72 72 72 60 66 52C64 42 56 36 46 36C38 36 32 40 28 46L18 50C16 54 18 58 22 58L36 60C40 66 38 76 34 86Z', c.bear, c) + O(52, 36, 5, c.bear, c) + D(52, 36, 2, c.a1) + eye(38, 46, c) + D(18, 53, 2.6, c.ink) + P('M40 64c8 4 18 4 26-2', 'none', c, ` stroke="${c.a2}" stroke-width="5"`) + P('M60 66l4 12 6-10', c.a2, c, ' stroke-width="1.6"'),
  Q: c => base(c, 44) + R(47, 60, 6, 24, c.shade, c, 1) + Array.from({length: 6}, (_, i) => { const a = i * 60 * Math.PI / 180, x = 50 + 22 * Math.cos(a), y = 36 + 22 * Math.sin(a); return L(`M50 36L${x.toFixed(1)} ${y.toFixed(1)}M${(50 + 13 * Math.cos(a) + 6 * Math.cos(a + 1)).toFixed(1)} ${(36 + 13 * Math.sin(a) + 6 * Math.sin(a + 1)).toFixed(1)}L${(50 + 13 * Math.cos(a)).toFixed(1)} ${(36 + 13 * Math.sin(a)).toFixed(1)}L${(50 + 13 * Math.cos(a) + 6 * Math.cos(a - 1)).toFixed(1)} ${(36 + 13 * Math.sin(a) + 6 * Math.sin(a - 1)).toFixed(1)}`, c.ink, 7) + L(`M50 36L${x.toFixed(1)} ${y.toFixed(1)}M${(50 + 13 * Math.cos(a) + 6 * Math.cos(a + 1)).toFixed(1)} ${(36 + 13 * Math.sin(a) + 6 * Math.sin(a + 1)).toFixed(1)}L${(50 + 13 * Math.cos(a)).toFixed(1)} ${(36 + 13 * Math.sin(a)).toFixed(1)}L${(50 + 13 * Math.cos(a) + 6 * Math.cos(a - 1)).toFixed(1)} ${(36 + 13 * Math.sin(a) + 6 * Math.sin(a - 1)).toFixed(1)}`, c.body, 3.6); }).join('') + O(50, 36, 5, c.a1, c, ' stroke-width="1.6"') + crown(50, 2, c.a3, c, 12),
  K: c => base(c, 54) + O(50, 66, 18, c.body, c) + O(50, 40, 12, c.body, c) + D(50, 60, 2.2, c.ink) + D(50, 70, 2.2, c.ink) + P('M38 48c8 6 16 6 24 0l2 5c-8 6-20 6-28 0z', c.a2, c, ' stroke-width="1.6"') + P('M60 50l6 12-6 1z', c.a2, c, ' stroke-width="1.4"') + eye(46, 38, c, 1.6) + eye(54, 38, c, 1.6) + P('M50 42l10 2-10 2z', c.a4, c, ' stroke-width="1"') + R(36, 26, 28, 4, c.ink, c, 1) + R(40, 15, 20, 12, c.ink, c, 2) + R(40, 21, 20, 4, c.a2, c, 0, ' stroke-width="0"') + cross(50, 0, c.a3, c)
 }};

/* ---------------- animated flyovers ----------------
   Each scene is a small SVG with its own looping motion (wings, legs, flames); the app moves it across the board.
   motion: ltr / rtl (across), hop (along the bottom), rise (bottom to top), burst (in place), arc (fades in and out) */
const flap = (cx, cy, dur = .35) => `<animateTransform attributeName="transform" type="scale" values="1 1;1 .25;1 1" dur="${dur}s" repeatCount="indefinite" additive="sum"/>`;
const wing = (d, fill, cx, cy, dur = .35) => `<g transform="translate(${cx} ${cy})"><g><path d="${d}" fill="${fill}"/>${flap(0, 0, dur)}</g></g>`;
const bat = (x, y, s, dur = .3) => `<g transform="translate(${x} ${y}) scale(${s})">${wing('M0 0C-6-10-18-12-26-6c4 1 6 4 6 8-4-2-8-1-10 2 6 0 10 2 12 6C-12 4-6 2 0 0Z', '#1a0a24', 0, 0, dur)}${wing('M0 0C6-10 18-12 26-6c-4 1-6 4-6 8 4-2 8-1 10 2-6 0-10 2-12 6C12 4 6 2 0 0Z', '#1a0a24', 0, 0, dur)}<ellipse rx="4" ry="5" fill="#1a0a24"/><path d="M-3-4l-1-4 3 2zM3-4l1-4-3 2z" fill="#1a0a24"/><circle cx="-1.5" cy="-1" r=".9" fill="#ff4d4d"/><circle cx="1.5" cy="-1" r=".9" fill="#ff4d4d"/></g>`;
const legs = (x, y, col) => `<g stroke="${col}" stroke-width="3" stroke-linecap="round"><path d="M${x} ${y}l-4 10"><animate attributeName="d" values="M${x} ${y}l-4 10;M${x} ${y}l4 10;M${x} ${y}l-4 10" dur=".4s" repeatCount="indefinite"/></path><path d="M${x + 6} ${y}l4 10"><animate attributeName="d" values="M${x + 6} ${y}l4 10;M${x + 6} ${y}l-4 10;M${x + 6} ${y}l4 10" dur=".4s" repeatCount="indefinite"/></path></g>`;
const reindeer = x => `<g transform="translate(${x} 0)"><path d="M0 34c0-8 6-12 16-12h12c6 0 8 4 8 8 0 6-4 8-10 8H6C2 38 0 36 0 34z" fill="#8a5a2b" stroke="#3a2010" stroke-width="1.6"/>${legs(6, 36, '#5a3a1a')}${legs(24, 36, '#5a3a1a')}<path d="M34 26c2-6 8-8 12-6 2 2 0 6-4 6l-4 4z" fill="#8a5a2b" stroke="#3a2010" stroke-width="1.6"/><circle cx="47" cy="22" r="2.6" fill="#e0283c"/><path d="M38 20l-2-8 4 2 0-6 3 6 2-4" fill="none" stroke="#c98a4a" stroke-width="1.8" stroke-linecap="round"/></g>`;
const sparkle = (x, y, d, c = '#ffd76a') => `<path d="M${x} ${y - 4}l1.2 2.8 2.8 1.2-2.8 1.2L${x} ${y + 4}l-1.2-2.8-2.8-1.2 2.8-1.2z" fill="${c}"><animate attributeName="opacity" values="0;1;0" dur="${d}s" repeatCount="indefinite"/></path>`;
const burstSVG = (cols) => `<svg viewBox="-50 -50 100 100">${Array.from({length: 16}, (_, i) => { const a = i * Math.PI / 8; return `<line x1="${(8 * Math.cos(a)).toFixed(1)}" y1="${(8 * Math.sin(a)).toFixed(1)}" x2="${(40 * Math.cos(a)).toFixed(1)}" y2="${(40 * Math.sin(a)).toFixed(1)}" stroke="${cols[i % cols.length]}" stroke-width="3" stroke-linecap="round"/><circle cx="${(44 * Math.cos(a)).toFixed(1)}" cy="${(44 * Math.sin(a)).toFixed(1)}" r="2.4" fill="${cols[(i + 1) % cols.length]}"/>`; }).join('')}</svg>`;
const butterfly = (col, col2) => `<svg viewBox="-20 -16 40 32">${wing('M0 0C-6-14-20-16-18-4-16 2-8 2 0 0zM0 0c-6 6-14 12-14 6s8-8 14-6z', col, 0, 0, .25).replace('scale', 'scale')}${wing('M0 0C6-14 20-16 18-4 16 2 8 2 0 0zM0 0c6 6 14 12 14 6S6-2 0 0z', col2, 0, 0, .25)}<ellipse rx="1.6" ry="8" fill="#2b1a10"/><path d="M-1-8l-3-5M1-8l3-5" stroke="#2b1a10" stroke-width=".8"/></svg>`;
const lanternUp = (col, glow) => `<svg viewBox="0 0 30 44"><path d="M5 6h20l3 26c0 6-26 6-26 0z" fill="${col}" stroke="#7a2a0a" stroke-width="1.4"/><ellipse cx="15" cy="34" rx="7" ry="3" fill="${glow}"><animate attributeName="opacity" values=".6;1;.6" dur="1.2s" repeatCount="indefinite"/></ellipse><path d="M9 14q6 4 12 0" stroke="#7a2a0a" stroke-width="1" fill="none"/></svg>`;
const FLY = {
  christmas: [{motion:'ltr', w:62, dur:7, y:[6, 26], svg:`<svg viewBox="0 0 240 70">${[30, 54, 78, 102].map((x, i) => sparkle(x, 30 + (i % 2) * 8, 1 + i * .2)).join('')}<path d="M118 34h28M158 34h20" stroke="#c98a4a" stroke-width="1.4"/>${reindeer(146)}${reindeer(186)}<path d="M110 30h-30c-6 0-8 18 2 22h34c8 0 10-6 8-12z" fill="#c8102e" stroke="#4e0610" stroke-width="2"/><path d="M78 52c-6 4-10 2-12-2M76 56h40" stroke="#e8b730" stroke-width="2.4" fill="none" stroke-linecap="round"/><ellipse cx="88" cy="26" rx="10" ry="9" fill="#8a5a2b" stroke="#3a2010" stroke-width="1.4"/><circle cx="104" cy="22" r="7" fill="#f6d3b8"/><path d="M98 24c0 8 4 10 6 10s6-2 6-10z" fill="#fff"/><path d="M97 19c2-8 12-10 16-4l3 4c-4-1-6 0-6 2z" fill="#c8102e"/><circle cx="117" cy="19" r="2.4" fill="#fff"/><rect x="96" y="17" width="16" height="3.4" rx="1.6" fill="#fff"/></svg>`}],
  halloween: [
    {motion:'rtl', w:44, dur:6.5, y:[6, 40], svg:`<svg viewBox="0 0 120 60"><g><path d="M30 26c20-16 50-18 70-6-10 4-14 12-12 20-16-4-40 0-58-14z" fill="#8b0000" stroke="#2a0000" stroke-width="2"><animate attributeName="d" values="M30 26c20-16 50-18 70-6-10 4-14 12-12 20-16-4-40 0-58-14z;M30 26c20-6 50-2 70 6-10 0-14 8-12 16-16-4-40-6-58-22z;M30 26c20-16 50-18 70-6-10 4-14 12-12 20-16-4-40 0-58-14z" dur=".7s" repeatCount="indefinite"/></path></g><path d="M34 22h34c6 0 8 4 8 8H34z" fill="#1a0a24"/><circle cx="26" cy="24" r="8" fill="#d8e8c8" stroke="#1a0a24" stroke-width="1.6"/><path d="M19 22c0-8 14-8 14 0-3-3-5-3-7 0-2-3-4-3-7 0z" fill="#1a0a24"/><circle cx="23" cy="24" r="1.2" fill="#ff2a2a"/><circle cx="28" cy="24" r="1.2" fill="#ff2a2a"/><path d="M24 29l1 2 1-2" fill="#fff"/></svg>`},
    {motion:'ltr', w:56, dur:6, y:[4, 50], svg:`<svg viewBox="0 0 160 70">${bat(20, 30, 1, .26)}${bat(60, 14, .8, .3)}${bat(90, 44, .9, .24)}${bat(130, 24, .7, .28)}${bat(48, 54, .6, .32)}</svg>`},
    {motion:'ltr', w:50, dur:7, y:[4, 30], svg:`<svg viewBox="0 0 140 60"><path d="M10 40h90" stroke="#7a4a1a" stroke-width="3" stroke-linecap="round"/><path d="M4 34l14 6-14 6c-2-4-2-8 0-12z" fill="#c98a4a"/><path d="M50 40c0-16 8-22 16-22l8 22z" fill="#2b1238"/><circle cx="68" cy="16" r="6" fill="#9bd36a"/><path d="M58 12h20l-8-14z" fill="#2b1238"/><path d="M56 12h24" stroke="#2b1238" stroke-width="3"/><path d="M62 40c4 6 10 8 16 6" stroke="#2b1238" stroke-width="3" fill="none"/>${sparkle(120, 20, 1.1, '#9bd36a')}${sparkle(130, 34, 1.4, '#c9a2ff')}</svg>`}],
  newyear: [{motion:'burst', w:46, dur:2.6, count:3, svg:burstSVG(['#fbbf24', '#ff5fb0', '#5fd0ff', '#ffffff'])}],
  lunar: [{motion:'ltr', w:80, dur:8, y:[10, 40], svg:`<svg viewBox="0 0 260 60"><path d="M10 30C30 10 50 50 70 30S110 10 130 30 170 50 190 30" fill="none" stroke="#c8102e" stroke-width="16" stroke-linecap="round"><animate attributeName="d" values="M10 30C30 10 50 50 70 30S110 10 130 30 170 50 190 30;M10 30C30 50 50 10 70 30S110 50 130 30 170 10 190 30;M10 30C30 10 50 50 70 30S110 10 130 30 170 50 190 30" dur="1.4s" repeatCount="indefinite"/></path><path d="M10 30C30 10 50 50 70 30S110 10 130 30 170 50 190 30" fill="none" stroke="#ffd35c" stroke-width="4" stroke-dasharray="4 8"><animate attributeName="d" values="M10 30C30 10 50 50 70 30S110 10 130 30 170 50 190 30;M10 30C30 50 50 10 70 30S110 50 130 30 170 10 190 30;M10 30C30 10 50 50 70 30S110 10 130 30 170 50 190 30" dur="1.4s" repeatCount="indefinite"/></path><path d="M186 18c14-6 34-2 40 8-4 2-8 2-10 0 6 6 4 12-4 14-12 4-24 0-28-10z" fill="#c8102e" stroke="#6b1300" stroke-width="2"/><path d="M196 18l-4-10 8 6M206 16l2-10 4 10" fill="#ffd35c" stroke="#6b1300" stroke-width="1.4"/><circle cx="210" cy="24" r="2.6" fill="#ffd35c"/><path d="M224 30c8 2 14 8 16 14M222 34c6 4 8 10 8 16" stroke="#ffd35c" stroke-width="1.6" fill="none"/></svg>`}],
  valentine: [{motion:'rtl', flip:true, w:30, dur:7, y:[8, 40], svg:`<svg viewBox="0 0 80 60">${wing('M0 0c-8-12-22-10-22 0 6 0 14 2 22 0z', '#fff', 30, 24, .3)}<circle cx="38" cy="30" r="12" fill="#f6d3b8" stroke="#7a0f30" stroke-width="1.6"/><circle cx="42" cy="28" r="1.4" fill="#3a0a18"/><path d="M44 34q-3 2-6 0" stroke="#7a0f30" stroke-width="1.2" fill="none"/><path d="M28 40c4 8 18 8 20 0" fill="#ff8fb1"/><path d="M60 10c10 10 10 30 0 40" stroke="#c98a4a" stroke-width="2.4" fill="none"/><path d="M60 10v40M44 30h26" stroke="#e11d48" stroke-width="1.4"/><path d="M70 26l6 4-6 4z" fill="#e11d48"/></svg>`},
    {motion:'rise', w:12, dur:6, count:4, svg:'<svg viewBox="-12 -12 24 24"><path d="M0 9C-14 0-10-10 0-4 10-10 14 0 0 9z" fill="#ff4f7b" stroke="#a3123f" stroke-width="1.2"/></svg>'}],
  patrick: [{motion:'arc', w:90, dur:4.5, y:[30, 40], svg:`<svg viewBox="0 0 200 110">${['#e5484d', '#ff9a1f', '#ffd23f', '#3fbf62', '#3b82f6', '#8b5cf6'].map((c, i) => `<path d="M${20 + i * 6} 100A${80 - i * 6} ${80 - i * 6} 0 0 1 ${180 - i * 6} 100" fill="none" stroke="${c}" stroke-width="6" stroke-dasharray="260" stroke-dashoffset="260"><animate attributeName="stroke-dashoffset" from="260" to="0" dur="1.2s" fill="freeze"/></path>`).join('')}<g><circle cx="176" cy="96" r="6" fill="#ffd23f" stroke="#a87a00"/><circle cx="186" cy="100" r="6" fill="#ffd23f" stroke="#a87a00"/><path d="M168 98h26l-3 10h-20z" fill="#1a1a1a"/></g></svg>`}],
  eid: [{motion:'arc', w:30, dur:5, x:[60, 75], y:[4, 10], svg:'<svg viewBox="0 0 40 40"><path d="M26 4a16 16 0 1 0 6 28 13 13 0 1 1-6-28z" fill="#fcd34d" stroke="#a87a00" stroke-width="1.2"/><path d="M30 14l1.4 3 3.2.4-2.4 2.2.6 3.2-2.8-1.6-2.8 1.6.6-3.2-2.4-2.2 3.2-.4z" fill="#fcd34d"/></svg>'},
    {motion:'rise', w:9, dur:7, count:4, svg:lanternUp('#1f8a80', '#ffe08a')}],
  easter: [{motion:'hop', w:22, dur:6.5, svg:`<svg viewBox="0 0 60 60"><ellipse cx="28" cy="40" rx="16" ry="12" fill="#fff" stroke="#4b3a8c" stroke-width="1.8"/><circle cx="44" cy="30" r="9" fill="#fff" stroke="#4b3a8c" stroke-width="1.8"/><ellipse cx="42" cy="12" rx="3.4" ry="11" fill="#fff" stroke="#4b3a8c" stroke-width="1.6" transform="rotate(-10 42 12)"/><ellipse cx="49" cy="13" rx="3.4" ry="11" fill="#fff" stroke="#4b3a8c" stroke-width="1.6" transform="rotate(14 49 13)"/><circle cx="47" cy="28" r="1.6" fill="#2b1a40"/><circle cx="52" cy="32" r="1.6" fill="#ff8fb8"/><circle cx="13" cy="38" r="5" fill="#fff" stroke="#4b3a8c" stroke-width="1.4"/><path d="M22 46h16l-2 8H24z" fill="#c98a4a" stroke="#6a3a12" stroke-width="1.2"/><ellipse cx="26" cy="45" rx="3" ry="4" fill="#ff9ec7"/><ellipse cx="33" cy="45" rx="3" ry="4" fill="#8fd3ff"/></svg>`}],
  diwali: [{motion:'rise', w:9, dur:7, count:5, svg:lanternUp('#f59e0b', '#fff3b0')}, {motion:'burst', w:40, dur:2.6, count:2, svg:burstSVG(['#fbbf24', '#ec4899', '#14b8a6', '#fff'])}],
  hanukkah: [{motion:'ltr', w:16, dur:6, y:[78, 82], svg:'<svg viewBox="-20 -24 40 48"><g><path d="M-3-22h6v8h-6zM-12-14h24v14L0 20-12 0z" fill="#fff" stroke="#16307a" stroke-width="2"/><path d="M-6-6h12M0-11V0" stroke="#2563eb" stroke-width="2.4"/><animateTransform attributeName="transform" type="rotate" values="-12;12;-12" dur=".5s" repeatCount="indefinite"/></g></svg>'}],
  spring: [{motion:'wave', w:12, dur:7, y:[10, 50], svg:butterfly('#ff8fb8', '#ffb3cf')}, {motion:'wave', w:10, dur:8, y:[20, 60], svg:butterfly('#9b7be8', '#b9a6f5')}],
  summer: [{motion:'ltr', w:22, dur:6, y:[4, 24], svg:`<svg viewBox="-30 -14 60 28">${wing('M0 0C-8-10-20-12-28-4 -18-4-10-2 0 2z', '#fff', 0, 0, .4)}${wing('M0 0C8-10 20-12 28-4 18-4 10-2 0 2z', '#fff', 0, 0, .4)}<ellipse rx="8" ry="4" fill="#fff" stroke="#55606e" stroke-width="1"/><path d="M7-1l6 1-6 2z" fill="#ffd23f"/></svg>`},
    {motion:'hop', w:14, dur:5.5, svg:'<svg viewBox="-20 -20 40 40"><g><circle r="18" fill="#fff" stroke="#0b4a55" stroke-width="1.6"/><path d="M0-18c-8 8-8 28 0 36-12-4-18-12-18-18S-12-14 0-18z" fill="#ff6b6b"/><path d="M0-18c8 8 8 28 0 36 12-4 18-12 18-18S12-14 0-18z" fill="#38bdf8"/><animateTransform attributeName="transform" type="rotate" values="0;360" dur="1s" repeatCount="indefinite"/></g></svg>'}],
  autumn: [{motion:'rtl', flip:true, w:46, dur:8, y:[4, 20], svg:`<svg viewBox="0 0 140 60">${[[20, 30], [42, 20], [42, 40], [64, 10], [64, 50]].map(([x, y]) => `<g transform="translate(${x} ${y})">${wing('M0 0c-4-8-12-10-18-6 6 0 12 4 18 6z', '#5a4a3a', 0, 0, .45)}${wing('M0 0c4-8 12-10 18-6-6 0-12 4-18 6z', '#5a4a3a', 0, 0, .45)}<ellipse rx="6" ry="2.6" fill="#7a6a5a"/><path d="M5-1l6-2v3z" fill="#2b1a10"/></g>`).join('')}</svg>`}],
  winter: [{motion:'ltr', w:22, dur:6, y:[76, 80], svg:'<svg viewBox="0 0 70 30"><path d="M4 22c0-10 14-16 34-14 12 1 22 6 22 12 0 4-4 6-10 6H10c-4 0-6-2-6-4z" fill="#1a1a2a"/><path d="M20 22c2-6 14-10 28-8 6 1 10 4 10 8z" fill="#fff"/><circle cx="58" cy="16" r="1.4" fill="#fff"/><path d="M62 18l6 2-6 1z" fill="#ff8a1f"/><path d="M2 26c-4 0-6-2-4-4" stroke="#cfe8ff" stroke-width="2" fill="none"/></svg>'}],
};
FLY.spring.push({motion:'ltr', w:9, dur:6, y:[30, 60], svg:`<svg viewBox="-12 -10 24 20">${wing('M0-2c-4-8-12-6-10 0z', '#dbeafe', 0, 0, .12)}<ellipse rx="7" ry="5" fill="#ffd23f" stroke="#2b1a10"/><path d="M-2-5v10M2-5v10" stroke="#2b1a10" stroke-width="1.6"/></svg>`});

/* ---------------- life: each piece's idle motion and sparkles ---------------- */
// [motion, args]; the pedestal stays still, the character moves
const MOTION = {
  christmas: {P:['sway', [50, 34, 6, 3.2]], R:['wobble', [50, 84, 3, 3.4]], B:['sway', [50, 86, 2, 4.2]], N:['bob', [1.4, 2.6]], Q:['bob', [2, 3]], K:['sway', [50, 86, 2.4, 3.6]]},
  halloween: {P:['wobble', [50, 84, 4, 2.8]], B:['bob', [3.5, 2.6]], N:['sway', [50, 86, 2, 3.4]], Q:['sway', [50, 86, 2.4, 3]], K:['bob', [1.6, 2.8]]},
  newyear:   {P:['sway', [50, 26, 7, 2.8]], B:['sway', [50, 86, 2, 3.6]], N:['bob', [1.4, 2.2]], Q:['bob', [1.6, 2.6]], K:['sway', [50, 86, 2, 4]]},
  lunar:     {P:['wobble', [50, 82, 5, 2.4]], B:['wobble', [50, 84, 3, 2]], N:['bob', [1.6, 2.4]], Q:['sway', [50, 18, 6, 3]], K:['sway', [50, 16, 4, 3.6]]},
  valentine: {P:['pulse', [50, 60, 1.1, 1.1]], R:['pulse', [50, 62, 1.03, 1.3]], B:['sway', [50, 86, 4, 3.4]], N:['bob', [1.4, 2.4]], Q:['pulse', [50, 52, 1.06, 1.2]], K:['pulse', [50, 56, 1.05, 1.3]]},
  patrick:   {P:['flip', [50, 60, 2.8]], B:['sway', [50, 86, 5, 3]], N:['bob', [1.4, 2.4]], Q:['sway', [50, 86, 2, 4]], K:['sway', [50, 86, 2, 3.4]]},
  eid:       {P:['sway', [50, 28, 5, 3]], B:['sway', [50, 10, 3, 3.6]], N:['bob', [1.4, 2.6]], Q:['sway', [50, 86, 3, 4]], K:['sway', [50, 14, 2.4, 4]]},
  easter:    {P:['wobble', [50, 82, 7, 2.2]], B:['sway', [50, 86, 3, 3.2]], N:['bob', [2, 1.9]], Q:['sway', [50, 86, 4, 3.4]], K:['wobble', [50, 84, 4, 2.6]]},
  diwali:    {N:['bob', [1.4, 2.8]], Q:['pulse', [50, 60, 1.04, 2.4]], K:['sway', [50, 86, 1.6, 4]]},
  hanukkah:  {P:['wobble', [50, 80, 10, 1.6]], N:['bob', [1.2, 2.6]], K:['bob', [1.2, 3]]},
  spring:    {P:['sway', [50, 86, 6, 3.2]], B:['sway', [50, 86, 4, 3.6]], N:['bob', [1.6, 2]], Q:['sway', [50, 86, 3, 4]], K:['sway', [50, 86, 4, 3.4]]},
  summer:    {P:['spin', [50, 60, 4]], B:['sway', [50, 84, 3, 3]], N:['bob', [2.4, 2.2]], Q:['sway', [50, 86, 4, 3.6]], K:['sway', [50, 86, 2, 4]]},
  autumn:    {P:['sway', [50, 38, 6, 3]], B:['sway', [50, 14, 4, 3.6]], N:['bob', [1.4, 2.4]], Q:['sway', [50, 86, 4, 3.2]], K:['bob', [1.4, 3]]},
  winter:    {P:['wobble', [50, 80, 4, 3]], N:['bob', [1.4, 2.6]], Q:['spin', [50, 36, 12]], K:['sway', [50, 86, 2, 3.6]]}
};
// [[x, y, size, seconds]…, colour]
const SPARK = {
  christmas: {P:[[[41, 52, 3, 2.2]], '#ffffff'], B:[[[42, 50, 3, 1.6], [58, 66, 3, 1.9], [38, 70, 3, 1.4], [60, 48, 3, 2.1], [50, 13, 6, 1.3]], '#fff6c8'], Q:[[[36, 14, 3, 1.8], [64, 16, 3, 2.2]], '#ffe27a']},
  halloween: {R:[[[37, 51, 4, 1.1], [63, 51, 4, 1.4]], '#ffe27a'], Q:[[[66, 20, 3, 1.8]], '#c9a2ff']},
  newyear:   {P:[[[34, 50, 3, 1.2], [66, 58, 3, 1.5], [50, 42, 2.5, 1.8]], '#ffffff'], Q:[[[36, 12, 3, 1.1], [64, 12, 3, 1.3], [50, 6, 3, 1.6]], '#ffffff'], B:[[[46, 40, 2, 1], [53, 30, 2, 1.3]], '#ffffff']},
  lunar:     {B:[[[53, 10, 5, 0.6]], '#ffe27a'], R:[[[50, 15, 3, 1.6]], '#ffe27a']},
  valentine: {K:[[[30, 30, 3, 1.6], [70, 30, 3, 2]], '#ffd1dc'], Q:[[[32, 34, 3, 1.8], [68, 34, 3, 1.4]], '#ffd1dc']},
  patrick:   {R:[[[40, 36, 3, 1.6], [58, 34, 3, 2]], '#ffffff'], Q:[[[44, 40, 2.5, 1.3], [56, 56, 2.5, 1.7]], '#ffffff']},
  eid:       {Q:[[[60, 34, 5, 1.6], [30, 22, 2.5, 2]], '#ffffff'], K:[[[54, 6, 3, 1.8]], '#ffffff'], P:[[[50, 56, 3, 1.4]], '#ffffff']},
  easter:    {R:[[[38, 38, 2.5, 1.6], [62, 38, 2.5, 2]], '#ffffff']},
  diwali:    {K:[[[26, 50, 2.5, 1.4], [50, 28, 2.5, 1.8], [74, 50, 2.5, 1.6]], '#ffffff'], R:[[[40, 46, 2.5, 1.5]], '#fff3b0']},
  hanukkah:  {R:[[[44, 44, 3, 1.8]], '#ffffff'], K:[[[50, 8, 3, 1.5]], '#ffffff']},
  spring:    {K:[[[30, 22, 3, 1.6], [70, 24, 3, 2]], '#fff6c8'], Q:[[[34, 20, 2.5, 1.8]], '#ffffff']},
  summer:    {K:[[[24, 22, 3, 1.4], [76, 24, 3, 1.8], [24, 66, 2.5, 2]], '#ffffff'], R:[[[30, 52, 2.5, 1.6]], '#ffffff']},
  autumn:    {Q:[[[34, 26, 2.5, 1.8]], '#fff3b0']},
  winter:    {P:[[[42, 54, 3, 1.6], [60, 70, 2.5, 2]], '#ffffff'], B:[[[46, 24, 3, 1.4], [54, 56, 3, 1.9]], '#ffffff'], R:[[[34, 40, 3, 1.7], [66, 42, 3, 2.1]], '#ffffff'], Q:[[[26, 14, 2.5, 1.5], [74, 58, 2.5, 1.9]], '#ffffff']}
};

// Soft shading: every flat colour becomes a top-lit gradient on its own shape
const tint = (hex, k) => { const n = parseInt(hex.slice(1), 16), ch = [n >> 16 & 255, n >> 8 & 255, n & 255].map(v => Math.round(k > 0 ? v + (255 - v) * k : v * (1 + k))); return '#' + ch.map(v => v.toString(16).padStart(2, '0')).join(''); };
function shadeGradients(g){
  const cols = [...new Set((g.match(/fill="#[0-9a-f]{6}"/gi) || []).map(m => m.slice(6, -1).toLowerCase()))];
  let defs = '';
  cols.forEach((h, i) => {
    defs += `<linearGradient id="sg${i}" x1="0" y1="0" x2=".35" y2="1"><stop offset="0" stop-color="${tint(h, .32)}"/><stop offset=".55" stop-color="${h}"/><stop offset="1" stop-color="${tint(h, -.28)}"/></linearGradient>`;
    g = g.split(`fill="${h}"`).join(`fill="url(#sg${i})"`);
  });
  return `<defs>${defs}</defs>${g}`;
}

// Register each set as a piece set the app can use like any other
const KEYS = ['K', 'Q', 'R', 'B', 'N', 'P'];
const wrap = inner => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${inner}</svg>`;
const sets = (window.GW_DATA = window.GW_DATA || {}).PIECE_SETS = window.GW_DATA.PIECE_SETS || {};
for (const [id, S] of Object.entries(SETS)){
  const svg = {};
  for (const side of ['w', 'b']) for (const k of KEYS){
    const g = S.draw[k](S.pal[side]), cut = g.indexOf('</g>') + 4;
    let body = g.slice(cut);
    const m = MOTION[id] && MOTION[id][k], sp = SPARK[id] && SPARK[id][k];
    if (m) body = MOVE[m[0]](body, m[1]);
    if (sp) body += sparkles(sp[0], sp[1]);
    svg[side + k] = wrap(shadeGradients(g.slice(0, cut) + body));
  }
  sets['th-' + id] = {name: S.name, author: 'Elite Chess', license: 'original', themed: true, animated: true, pack: id, svg};
}
window.GW_SEASONAL = {SETS, FLY};
})();
