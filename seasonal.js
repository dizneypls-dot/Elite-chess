/* © 2026 Elite Chess. All rights reserved. Proprietary: no copying, reuse or AI training without written permission. See terms.html. */
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
const base = (c, w = 56) => { const x = 50 - w / 2, t = w - 8;
  return '<g class="pb">' + `<ellipse cx="50" cy="95" rx="${w / 2 + 4}" ry="3.2" fill="#000" opacity=".22"/>` +
    // a turned two-tier plinth: the wide foot, an accent bead, the upper step with its lit top face
    P(`M${x} 94h${w}a5 5 0 0 0 0-10H${x}a5 5 0 0 0 0 10z`, c.shade, c) + L(`M${x + 2} 90.6q${w / 2 - 2} 2.6 ${w - 4} 0`, c.a2 || c.hi, 1.3, ' opacity=".85"') +
    P(`M${x + 4} 86.4h${t}a3 3 0 0 0 0-5H${x + 4}a3 3 0 0 0 0 5z`, c.body, c, ' stroke-width="1.6"') +
    L(`M${x + 6} 82.6h${t - 4}`, c.hi, 1.4, ' opacity=".8"') + L(`M${x + 3} 92.4h${w - 6}`, '#000', 1, ' opacity=".18"') + '</g>'; };
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

/* The animated flyovers live in flyovers.js */

/* ---------------- detail: the finer craft painted over each character ----------------
   Fabric folds, fur and feathers, patterns, trims, faces. Small shapes carry no outline (stroke-width 0)
   so they read as paint, not as new parts. */
const N0 = ' stroke-width="0"';
const dots = (pts, r, f, x = '') => pts.map(([px, py]) => `<circle cx="${px}" cy="${py}" r="${r}" fill="${f}"${x}/>`).join('');
const fold = (d, c, w = 1.2) => L(d, c.ink, w, ' opacity=".28"');
const shine = (d, w = 1.4, o = .55) => L(d, '#fff', w, ` opacity="${o}"`);
const cheeks = (x1, x2, y, r = 2.4) => dots([[x1, y], [x2, y]], r, '#ff8a8a', ' opacity=".45"');
const fur = (x1, y1, x2, y2, n, r, f) => dots(Array.from({length: n}, (_, i) => [+(x1 + (x2 - x1) * i / (n - 1)).toFixed(1), +(y1 + (y2 - y1) * i / (n - 1) + (i % 2 ? -.8 : .8)).toFixed(1)]), r, f);
const DETAIL = {
  christmas: {
    P: c => L('M33 50q8-7 17 0t17 0', c.a2, 1.4) + dots([[36, 72], [64, 72], [50, 80]], 1.3, c.a2) + L('M46 36v7M50 36v7M54 36v7', c.ink, .8, ' opacity=".4"') +
      P('M36 52c2-8 8-12 14-12', 'none', c, ' stroke="#fff" stroke-width="3" opacity=".55"') + L('M30 62h40', '#fff', .8, ' opacity=".4"'),
    R: c => dots([[30, 54], [38, 76], [64, 54], [70, 78], [30, 78], [62, 76], [38, 54], [70, 54]], 1.6, c.a3) + L('M24 49.5h52', c.ink, 2, ' opacity=".18"') +
      L('M46 46v38M54 46v38M24 60.6h52M24 68.4h52', '#fff', .8, ' opacity=".45"') + L('M38 34q4 2 8 5M62 34q-4 2-8 5', c.ink, 1, ' opacity=".35"') +
      P('M72 62l6 2-1 7-6-2z', c.a2, c, ' stroke-width="1"') + L('M67 60l5 3', c.ink, .8),
    B: c => L('M30 44l4-3 4 3 4-3 4 3 4-3 4 3 4-3 4 3 4-3 4 3M26 62l4-3 4 3 4-3 4 3 4-3 4 3 4-3 4 3 4-3 4 3 4-3 4 3', c.ink, .9, ' opacity=".3"') +
      L('M37 37q13 8 26 0M31 56q19 9 38 0', c.a2, 1.6, ' stroke-dasharray="2 2"') +
      dots([[46, 30], [56, 40], [44, 46], [34, 66], [52, 70], [66, 66], [42, 76]], 2, c.a1) + dots([[45.4, 29.4], [55.4, 39.4], [43.4, 45.4], [33.4, 65.4], [51.4, 69.4], [65.4, 65.4], [41.4, 75.4]], .7, '#fff') +
      L('M47 80v5M53 80v5', c.ink, .8, ' opacity=".4"'),
    N: c => E(25, 55, 6, 4.4, c.hi, c, N0 + ' opacity=".55"') + E(23, 53, 1.3, 1, c.ink, c, N0) + L('M34 43q4-3 9-1', c.ink, 1.2, ' opacity=".6"') +
      E(57, 40, 2, 4, '#ff9aa8', c, N0 + ' opacity=".6" transform="rotate(30 57 40)"') + fold('M50 50q6 6 6 14M58 52q6 8 6 16M64 50q4 10 2 20', c, 1) +
      dots([[44, 72.4], [50, 73.4], [56, 72.4]], 2, c.a2) + dots([[43.4, 71.8], [49.4, 72.8], [55.4, 71.8]], .7, '#fff'),
    Q: c => fold('M44 46l-6 34M50 46v36M56 46l6 34', c) + L('M30 44q4 4 4 10M24 46q4 4 3 8M70 44q-4 4-4 10M76 46q-4 4-3 8', c.ink, 1, ' opacity=".3"') +
      dots([[34, 80], [42, 81.6], [50, 82], [58, 81.6], [66, 80]], 1.2, c.a2) + cheeks(45, 55, 34, 1.8) + L('M47.5 35q2.5 2 5 0', c.ink, 1, ' opacity=".7"') +
      L('M43 24q3-4 7-4M57 24q-3-4-7-4', c.a2, 1, ' opacity=".8"') + E(50, 15, 13, 5, c.a2, c, N0 + ' opacity=".2"'),
    K: c => fur(50, 56, 50, 65, 4, 2, '#fff') + fur(50, 74, 50, 83, 4, 2, '#fff') + fold('M38 58l-3 24M62 58l3 24', c) + L('M48.4 67.4h3.2v4.2h-3.2z', c.ink, .9) +
      L('M41 52q3-3 5 0M54 52q3-3 5 0M44 56q3-3 5 0M51 56q3-3 5 0M47 60q3-3 5 0', '#c9ccd4', 1, ' opacity=".9"') +
      P('M42 46c3-3 6-3 8 0 2-3 5-3 8 0-2 3-6 4-8 1-2 3-6 2-8-1z', '#fff', c, ' stroke-width="1"') + L('M43 35.4q3-2 6 0M51 35.4q3-2 6 0', '#fff', 1.6) + cheeks(43, 57, 43, 2) +
      dots([[37, 33], [41, 34], [45, 32.6], [49, 34], [53, 32.6], [57, 34], [61, 33], [70, 28], [73, 31.6], [74, 27.6]], .9, '#d9dde6') + L('M42 28c6-6 14-8 22-6', c.ink, 1, ' opacity=".3"')
  },
  halloween: {
    P: c => L('M44 48q-8 16 0 32M56 48q8 16 0 32M31 52q-4 12 0 24M69 52q4 12 0 24', c.ink, 1.1, ' opacity=".3"') + E(50, 62, 14, 10, c.glow, c, N0 + ' opacity=".18"') +
      shine('M33 54q1-6 5-8', 1.6, .5) + L('M51 41q3-3 7-2', c.a3, 1.2, ' opacity=".7"'),
    R: c => L('M26 46h18M58 46h16M26 62h10M64 62h10M30 72h10M60 72h12M36 54h4M62 54h4', c.ink, 1, ' opacity=".28"') + L('M26 40h8M58 40h8', c.ink, 1, ' opacity=".28"') +
      L('M37 46v10M33 51h8M63 46v10M59 51h8', c.ink, 1, ' opacity=".7"') + E(50, 75, 5, 7, c.glow, c, N0 + ' opacity=".2"') +
      L('M66 66q6 2 6 8M68 68q-3 3-1 6', c.ink, .8, ' opacity=".5"') + L('M28 36q-3 6 0 12', '#fff', 1, ' opacity=".3"'),
    B: c => shine('M36 28q4-10 12-12', 2.4, .6) + fold('M40 60q2 10 0 18M60 60q-2 10 0 18M50 64v14', c, 1) + dots([[42.4, 39], [56.4, 39]], .9, '#fff') + E(50, 46, 20, 26, '#fff', c, N0 + ' opacity=".08"'),
    N: c => L('M34 30l2 4M60 28l-1 4', '#ffb3c7', 1.4) + P('M37 41.5c-.2-2 .2-3.2 1-4.4.8 1.2 1.2 2.4 1 4.4-.2 1.6-1.8 1.6-2 0z', c.ink, c, N0) + P('M51 40.5c-.2-2 .2-3.2 1-4.4.8 1.2 1.2 2.4 1 4.4-.2 1.6-1.8 1.6-2 0z', c.ink, c, N0) +
      dots([[37.6, 39.6], [51.6, 38.6]], .7, '#fff') + L('M54 62q6 6 8 18M60 58q4 6 4 12M42 66q4 8 2 16', c.ink, 1, ' opacity=".28"') + L('M30 47q-1 4 2 5', c.ink, 1, ' opacity=".5"') +
      L('M48 30c2 4 2 6 0 8M56 30c-2 4-2 6 0 8', c.ink, .9, ' opacity=".3"'),
    Q: c => fold('M42 52l-6 30M50 50v34M58 52l6 30', c) + L('M44 30l3-6 2 6', c.a1, 1.2, ' opacity=".7"') +
      P('M54 22l2 4 4 0-3 3 1 4-4-2-4 2 1-4-3-3 4 0z', c.glow || '#ffd23f', c, N0) + L('M45.4 45.4l1 3M54.6 45.4l-1 3', c.ink, .9, ' opacity=".6"') + P('M49 39l-2 6h3', 'none', c, ` stroke="${c.ink}" stroke-width=".9" opacity=".5"`) + dots([[44, 72], [56, 72], [50, 78]], 1.2, c.a2 || '#fff', ' opacity=".7"'),
    K: c => L('M30 54l-6 28M70 54l6 28M36 50l-4 32M64 50l4 32', c.ink, 1.1, ' opacity=".3"') + L('M27 24l12 11M73 24L61 35', '#ff3d5a', 1.4, ' opacity=".6"') +
      fold('M44 56l-2 26M56 56l2 26', c) + L('M47 54l3 4 3-4', '#fff', 1.2) + L('M44 34.6l3 1M56 34.6l-3 1', c.ink, 1.2) + L('M47 47.6v1.6M53 47.6v1.6', '#c8102e', 1.2) + shine('M42 32q2-6 8-6', 1.2, .4)
  },
  newyear: {
    P: c => [[40, 50], [58, 52], [36, 64], [48, 66], [62, 70], [44, 74], [54, 46]].map(([x, y], i) => R(x, y, 4, 3.6, i % 2 ? '#ffffff' : c.a2, c, 0, N0 + ' opacity=".75"')).join('') +
      P('M38 44l1.4 3.6 3.6 1.4-3.6 1.4L38 54l-1.4-3.6-3.6-1.4 3.6-1.4z', '#fff', c, N0) + L('M50 26v-4', c.ink, 1.2),
    R: c => [...Array(12)].map((_, i) => { const a = i * Math.PI / 6, r1 = i % 3 ? 9.6 : 8.4; return `M${(50 + r1 * Math.sin(a)).toFixed(1)} ${(54 - r1 * Math.cos(a)).toFixed(1)}L${(50 + 10.8 * Math.sin(a)).toFixed(1)} ${(54 - 10.8 * Math.cos(a)).toFixed(1)}`; }).reduce((d, x) => d + x, '').replace(/^/, '') && L([...Array(12)].map((_, i) => { const a = i * Math.PI / 6, r1 = i % 3 ? 9.6 : 8.2; return `M${(50 + r1 * Math.sin(a)).toFixed(1)} ${(54 - r1 * Math.cos(a)).toFixed(1)}L${(50 + 10.8 * Math.sin(a)).toFixed(1)} ${(54 - 10.8 * Math.cos(a)).toFixed(1)}`; }).join(''), c.ink, 1) +
      L('M28 42h44M28 74h16M56 74h16M36 34v8M64 34v8M40 42v-0M28 80h16M56 80h16', c.ink, .9, ' opacity=".25"') + L('M34 74v6M66 74v6', c.ink, .9, ' opacity=".25"') + shine('M31 38v40', 1.4, .35) + L('M30 34h5M44 34h12M65 34h5', '#fff', 1, ' opacity=".5"'),
    B: c => dots([[44, 52], [47, 44], [55, 50], [52, 38], [45, 32], [57, 42], [50, 30]], 1, '#fff', ' opacity=".9"') + L('M39 26.6q2.8-2 5.5 0t5.5 0 5.5 0 5.5 0', '#fff', 2.2, ' opacity=".9"') +
      shine('M41 16l-1 28', 1.8, .6) + shine('M58 18l-.6 16', 1, .35) + L('M44 84q6-2 12 0', '#fff', 1, ' opacity=".4"'),
    N: c => L('M53 26l8-1M55 18l6 1M51 32l11-1', c.a3, 1.6) + dots([[53, 12], [58, 22], [55, 30]], 1, c.a3) + L('M66 50q4 6 4 14M68 48q5 4 7 12', c.ink, .9, ' opacity=".35"') +
      E(26, 55, 5, 3.6, c.hi, c, N0 + ' opacity=".5"') + cheeks(33, 33, 52, 2.4) + L('M36 44q3-3 7-1', c.ink, 1, ' opacity=".6"') + L('M60 6q6-4 10 2t8 2', c.a1, 1.2) + fold('M48 62q6 6 4 18M58 60q6 8 6 20', c, 1),
    Q: c => fold('M40 50l-6 30M50 48v34M60 50l6 30', c) + dots([[42, 56], [56, 54], [48, 62], [38, 70], [62, 70], [52, 74], [44, 78]], 1.1, '#fff', ' opacity=".85"') + cheeks(44.5, 55.5, 40, 1.8) +
      L('M47.6 41q2.4 2 4.8 0', c.ink, 1, ' opacity=".7"') + dots([[50, 4.6], [33, 9], [67, 9], [29, 20], [71, 20]], .9, '#fff') + L('M42 30q4-4 8-4t8 4', c.ink, 1, ' opacity=".35"'),
    K: c => L('M50 47.6v26', c.a1, 1.2) + dots([[50, 52], [49.6, 58], [50.4, 64]], .8, c.a1) + shine('M37 30q-1 20 9 26', 1.6, .5) + shine('M36 60q1 10 4 14', 1.2, .4) +
      L('M28 23.5h44M28 80.5h44', c.ink, .8, ' opacity=".35"') + dots([[30, 32], [30, 44], [30, 56], [30, 68], [70, 32], [70, 44], [70, 56], [70, 68]], 1.6, c.a1)
  },
  lunar: {
    P: c => dots([[42, 66], [48, 72], [56, 68], [60, 58], [40, 58], [52, 62], [46, 52], [58, 76], [36, 70], [64, 66]], .8, c.ink, ' opacity=".25"') + L('M52 41q7-3 12-3', c.ink, .8, ' opacity=".5"') +
      shine('M36 54q2-8 8-11', 2.2, .55),
    R: c => L('M30 40l-2 4M36 40l-1 4M42 40v4M50 40v4M58 40v4M64 40l1 4M70 40l2 4M38 33v3M44 33v3M50 33v3M56 33v3M62 33v3M44 26v3M50 25v4M56 26v3', c.ink, .9, ' opacity=".35"') +
      L('M22 44c-3 0-4-2-3-4M78 44c3 0 4-2 3-4M30 36c-3 0-4-2-3-4M70 36c3 0 4-2 3-4', c.a1, 1.6) + dots([[34, 47], [42, 47], [50, 47], [58, 47], [66, 47]], 1, c.a1) + L('M37.5 56v8M34 60h7M62.5 56v8M59 60h7', c.a2, .9) + dots([[47, 76], [53, 76]], 1, c.a2),
    B: c => P('M50 58l6 6-6 6-6-6z', 'none', c, ` stroke="${c.a2}" stroke-width="1.4"`) + P('M50 61l3 3-3 3-3-3z', c.a2, c, N0) + L('M41 30v50', '#fff', 1.6, ' opacity=".45"') +
      dots([[58, 8], [48, 6], [60, 14], [46, 14]], 1, '#ffd23f'),
    N: c => L('M50 44q4-3 8 0M54 50q4-3 8 0M48 52q4-3 8 0M56 58q4-3 8 0M60 66q3-3 6 0M52 68q3-3 6 0', c.ink, 1, ' opacity=".35"') + L('M24 50c-8 0-14 4-16 10M27 47c-8-4-14-4-18 0', c.a2, 1.2) +
      P('M28 54l2 3 2-3 2 3 2-3', 'none', c, ' stroke="#fff" stroke-width="1.2"') + L('M37 37q4-3 9 0', c.ink, 1.4) + dots([[22, 47]], 1.2, c.a2),
    Q: c => E(50, 46, 14, 14, '#fff', c, N0 + ' opacity=".18"') + L('M38 28q12-3 24 0M36 64q14 3 28 0', c.a2, 1.2) + L('M44 82v4M50 84v4M56 82v4', c.a2, 1, ' opacity=".7"') + shine('M32 40q2-10 10-14', 2, .5),
    K: c => P('M50 44l5 5-5 5-5-5z', c.a1, c, N0) + E(50, 49, 2.4, 2.4, c.a2, c, N0) + L('M34 33l-4 34M66 33l4 34', '#fff', 1, ' opacity=".3"') + L('M30 67v12M70 67v12', c.a1, 1.6) + dots([[30, 80], [70, 80]], 1.8, c.a1) + E(50, 50, 12, 18, '#fff', c, N0 + ' opacity=".12"')
  },
  valentine: {
    P: c => P('M50 70C35 61 37 49 50 54 63 49 65 61 50 70Z', 'none', c, ' stroke="#fff" stroke-width="1" stroke-dasharray="2 2" opacity=".55"') + shine('M34 52q1-7 7-9', 2.4, .6) + P('M66 44l1 3 3 1-3 1-1 3-1-3-3-1 3-1z', '#fff', c, N0),
    R: c => dots([[30, 52], [38, 52], [62, 52], [70, 52], [30, 78], [38, 78], [62, 78], [70, 78]], 1.1, c.a2) + L('M46 46v38M54 46v38', '#fff', .8, ' opacity=".5"') +
      heart(32, 64, .18, c.a1, c) + heart(68, 64, .18, c.a1, c) + L('M24 49h52', c.ink, 1.6, ' opacity=".18"') + shine('M26 52v28', 1.2, .35),
    B: c => L('M50 18c-4 2-6 6-4 10 3 3 8 2 8-2s-4-5-6-3M42 22c-2 6 0 12 6 14M60 22c2 6 0 12-6 14', c.ink, 1, ' opacity=".4"') + L('M50 64l-3-2M50 74l3-2', c.a3, 1.6) +
      L('M41 54q4-2 8 6M57 46q-3 0-6 6', c.ink, .8, ' opacity=".3"') + shine('M38 22q1-6 6-8', 1.6, .5),
    N: c => L('M50 51.4v3M46 56q4 3 8 0', c.ink, 1.2) + E(50, 70, 11, 12, c.body, c, N0 + ' opacity=".5"') + L('M50 60v24', c.ink, .8, ' stroke-dasharray="2 1.6" opacity=".4"') +
      L('M36 76q-4 4-2 9M64 76q4 4 2 9', c.ink, .9, ' opacity=".35"') + cheeks(40, 60, 48, 2.2) + L('M36 24q2-2 4 0M60 24q2-2 4 0', '#fff', 1, ' opacity=".5"'),
    Q: c => dots([[42, 15], [50, 10], [58, 15]], 1.4, c.a1) + dots([[40, 21], [60, 21]], 1, '#fff') + P('M50 74C30 60 32 42 50 48 68 42 70 60 50 74Z', 'none', c, ' stroke="#fff" stroke-width="1" stroke-dasharray="2 2" opacity=".5"') +
      shine('M30 42q2-8 10-10', 2.4, .55),
    K: c => dots([[42, 23], [50, 21], [58, 23]], 1.4, c.a1) + P('M50 74C34 64 34 50 50 54 66 50 66 64 50 74Z', 'none', c, ' stroke="#fff" stroke-width="1" stroke-dasharray="2 2" opacity=".5"') + shine('M26 46q2-10 12-12', 2.4, .5)
  },
  patrick: {
    P: c => dots(Array.from({length: 14}, (_, i) => { const a = i / 14 * Math.PI * 2; return [+(50 + 14.8 * Math.cos(a)).toFixed(1), +(60 + 19.6 * Math.sin(a)).toFixed(1)]; }), .9, c.ink, ' opacity=".35"') + L('M46 53l1-1M52 53l1-1', '#fff', 1) + shine('M38 50q2-8 7-10', 1.8, .55),
    R: c => [[36, 42], [50, 38], [64, 42], [43, 36], [57, 36]].map(([x, y]) => O(x, y, 3.6, 'none', c, ` stroke="${c.ink}" stroke-width=".8" opacity=".4"`)).join('') + dots([[34, 40], [48, 35.6], [62, 40]], 1.1, '#fff', ' opacity=".8"') +
      shine('M30 54q2 14 10 22', 2, .4) + L('M24 46h52', '#fff', 1, ' opacity=".4"') + L('M36 84l-2 4M64 84l2 4', c.ink, 2),
    B: c => L('M50 24l-3-4M50 24l3-4M38 38l-4-1M38 38l-1 4M62 38l4-1M62 38l1 4', c.ink, 1, ' opacity=".4"') + L('M44 22q2-6 6-6M32 36q2-6 6-6M56 36q2-6 6-6', '#fff', 1.2, ' opacity=".55"') + L('M50 60l-6 6M50 70l6 4', c.a1, 2),
    N: c => L('M44 34.6h24', '#fff', .9, ' opacity=".5"') + L('M64 50q4 6 4 14M66 46q6 4 6 12', c.ink, .9, ' opacity=".35"') + E(26, 55, 5, 3.6, c.hi, c, N0 + ' opacity=".5"') + L('M35 43.4q3-3 7-1', c.ink, 1, ' opacity=".6"') +
      O(57, 22, 1.6, c.a3, c, N0) + O(59.4, 22, 1.6, c.a3, c, N0) + O(58.2, 20, 1.6, c.a3, c, N0),
    Q: c => L('M42 30v54M48 34v50M54 40v44M60 48v36', '#fff', .6, ' opacity=".6"') + L('M38 30q-2 8 2 12M38 50q-2 8 2 12M38 70q-2 6 2 10', c.a2, 1.4) + dots([[40, 26], [46, 22], [54, 26], [60, 32]], 1.1, c.a2),
    K: c => L('M42 54q3-2 4 2M54 54q3-2 4 2M44 60q3-2 4 2M52 60q3-2 4 2M48 64q2-2 4 0', c.ink, 1, ' opacity=".35"') + dots([[50, 72], [50, 78]], 1.6, c.a2) + shine('M38 18v14', 1.4, .45) +
      L('M47 42l-2-1M53 42l2-1', c.a3, 1.2) + cheeks(43, 57, 50, 2) + L('M48.4 27.4h3.2v4.2h-3.2z', c.ink, .8)
  },
  eid: {
    P: c => L('M50 46v22M44 56h12M46 50q4-4 8 0', c.a2, 1) + E(50, 57, 9, 13, c.glow, c, N0 + ' opacity=".25"') + dots([[44, 77], [50, 77], [56, 77]], .9, '#fff', ' opacity=".7"') + shine('M42 44l-3 16', 1.4, .45),
    R: c => dots(Array.from({length: 11}, (_, i) => [28 + i * 4.4, +(42 + Math.sin(i / 10 * Math.PI) * 4).toFixed(1)]), .9, c.a2) + E(48, 39, 10, 2.4, '#fff', c, N0 + ' opacity=".35"') + dots([[32, 76], [40, 77], [50, 77.4], [60, 77], [68, 76]], 1, c.a2),
    B: c => P('M50 32l3 6 6 1-4 4 1 6-6-3-6 3 1-6-4-4 6-1z', 'none', c, ` stroke="${c.a2}" stroke-width="1"`) + E(50, 46, 9, 16, c.glow, c, N0 + ' opacity=".2"') + dots([[40, 76], [50, 76], [60, 76]], 1, '#fff', ' opacity=".7"') + shine('M38 24l-4 16', 1.4, .45),
    N: c => L('M38 66l-1 5M42 67l-1 5M46 68v5M50 68v5M54 67l1 5M58 66l1 5', c.a3, 1.2) + L('M37 31.4q3-2 6 0', c.ink, 1.2) + dots([[23, 41]], 1, c.ink) + L('M22 44q8 8 18 4M30 32q10 4 12 14', c.a2, .9, ' opacity=".7"') +
      L('M60 58q4 8 4 22M66 56q2 10 2 24', c.ink, .9, ' opacity=".3"'),
    Q: c => L('M56 18a20 20 0 0 0-4 38', '#fff', 1.6, ' opacity=".45"') + L('M52 22a17 17 0 0 0 0 30', c.ink, .8, ' opacity=".35" stroke-dasharray="2 2"') + E(60, 34, 2, 2, '#fff', c, N0),
    K: c => L('M50 32v36M40 44h20M43 36l14 24M57 36L43 60', c.a2, .8, ' opacity=".7"') + E(50, 50, 10, 18, c.glow, c, N0 + ' opacity=".2"') + dots([[38, 80], [44, 80], [50, 80], [56, 80], [62, 80]], 1.1, '#fff', ' opacity=".7"') + L('M44 22l-2-4M56 22l2-4', c.a2, 1)
  },
  easter: {
    P: c => [[42, 48], [58, 48], [50, 74], [40, 74], [60, 74]].map(([x, y]) => dots([[x - 1.6, y], [x + 1.6, y], [x, y - 1.6], [x, y + 1.6]], 1, c.a2) + D(x, y, .9, '#fff')).join('') + shine('M38 50q1-10 8-15', 2.2, .55),
    R: c => L('M30 50l2-6M34 50l-1-7M38 50l1-5M60 50l2-6M64 50l-1-7M70 50l2-6M46 50l-1-4M54 50l1-4', c.a3 || '#3f9e4a', 1.6) + L('M33 42l3-3 3 3M45 38l3-3 3 3M57 42l3-3 3 3', '#fff', 1.2, ' opacity=".8"') +
      dots([[50, 44], [36, 46], [64, 46]], 1, '#fff'),
    B: c => L('M42 36h4M43 48h5M45 60h4M46 72h3M54 40h4M53 52h4M52 64h3', c.ink, .9, ' opacity=".4"') + L('M44 30q2 20 6 46', '#fff', 1.4, ' opacity=".4"') + L('M42 28q-6-6-10-6M58 28q6-6 10-6M50 26V14', c.ink, .8, ' opacity=".35"'),
    N: c => E(40, 26, 1.2, 10, '#fff', c, N0 + ' opacity=".4" transform="rotate(-12 40 26)"') + cheeks(40, 60, 54, 2.4) + R(48.6, 59.4, 2.8, 3, '#fff', c, .6, ' stroke-width=".6"') +
      L('M44 70q6 4 12 0M42 74q8 6 16 0', '#fff', 1.2, ' opacity=".6"') + L('M40 44q3-2 6 0M54 44q3-2 6 0', c.ink, 1, ' opacity=".5"') + E(50, 70, 10, 12, '#fff', c, N0 + ' opacity=".2"'),
    Q: c => L('M42 22q4 8 8 16M58 22q-4 8-8 16M50 18v18', c.ink, .9, ' opacity=".3"') + L('M40 58q4-4 8 6M60 60q-4-2-8 6', c.ink, .8, ' opacity=".35"') + shine('M38 24q0-6 4-8', 1.6, .5),
    K: c => L('M34 62l4 4 4-3 3 5M66 62l-4 4-4-3-3 5', c.ink, 1, ' opacity=".4"') + L('M48 27q2-4 4 0M50 27v-2', '#ffb627', 1.4) + cheeks(41, 59, 44, 2.2) + L('M34 48q-2 4 0 6M66 48q2 4 0 6', c.ink, .9, ' opacity=".35"') + shine('M38 34q2-6 8-8', 1.6, .5)
  },
  diwali: {
    P: c => dots(Array.from({length: 7}, (_, i) => [34 + i * 5.4, 62.6]), 1.1, c.a2) + E(50, 42, 10, 12, c.flame, c, N0 + ' opacity=".18"') + shine('M32 62q4 10 12 14', 1.4, .4),
    R: c => E(50, 44.6, 18, 3, '#fff', c, N0 + ' opacity=".3"') + dots(Array.from({length: 9}, (_, i) => [28 + i * 5.5, 46]), .9, c.a2) + dots([[23, 63], [77, 63]], 1.4, c.a2) + shine('M28 52v22', 1.4, .35),
    B: c => L('M46 36h8M46 50h8M46 70h8', c.a2, 1.2) + dots([[50, 44], [50, 76]], 1.2, '#fff', ' opacity=".7"') + E(50, 12, 8, 10, c.flame, c, N0 + ' opacity=".2"') + dots([[38, 61], [44, 62], [50, 62.4], [56, 62], [62, 61]], 1, c.a2),
    N: c => L('M32 48q-4 6-2 12M36 44q-4 8-2 14M30 70l3 1M29 74l3 0M31 66l3 1', c.ink, .9, ' opacity=".35"') + dots([[40, 36], [44, 34], [52, 34], [56, 36]], 1.1, c.a1) + L('M60 44q6 2 8 10', c.ink, .9, ' opacity=".35"') +
      L('M46 59l5 4', '#fff', 1, ' opacity=".7"'),
    Q: c => L('M50 30v36M44 58q-8-4-16-4M56 58q8-4 16-4M40 64q-6-6-12-8M60 64q6-6 12-8', c.ink, .8, ' opacity=".28"') + dots([[42, 74], [50, 76], [58, 74]], 1, c.a2) + shine('M46 32q-2 14 0 24', 1.2, .45),
    K: c => [26, 36, 50, 64, 74].map((x, i) => L(`M50 66L${x} ${[50, 34, 28, 34, 50][i] + 4}`, c.a2, .8, ' opacity=".45"')).join('') + L('M46 46q4 4 8 0M45 54q5 4 10 0M44 62q6 4 12 0', c.a1, 1, ' opacity=".6"') + dots([[47, 22], [50, 21], [53, 22]], 1.2, c.a2)
  },
  hanukkah: {
    P: c => L('M34 40l16 4 16-4M50 44v34', c.ink, .8, ' opacity=".3"') + shine('M37 44v12', 1.6, .5) + dots([[50, 66]], 1.4, c.a1),
    R: c => dots(Array.from({length: 8}, (_, i) => [34 + i * 4.6, 60.4]), 1, c.a2) + shine('M32 44q-4 16 0 34', 2, .45) + L('M34 34h32', '#fff', 1, ' opacity=".5"') + E(50, 74, 12, 4, c.ink, c, N0 + ' opacity=".12"'),
    B: c => P('M42 32c1 4 2 6 1 9-1 2-2 0-2-2zM58 32c-1 3-1 5 0 7 1 1 2 0 2-2z', '#fff', c, N0 + ' opacity=".85"') + shine('M45 34v48', 1.4, .45) + E(50, 14, 7, 9, c.flame, c, N0 + ' opacity=".2"'),
    N: c => [...Array(14)].map((_, i) => { const a = i / 14 * Math.PI * 2; return `M${(48 + 15 * Math.cos(a)).toFixed(1)} ${(48 + 15 * Math.sin(a)).toFixed(1)}L${(48 + 21 * Math.cos(a)).toFixed(1)} ${(48 + 21 * Math.sin(a)).toFixed(1)}`; }).join('').replace(/^(.*)$/, d => L(d, c.ink, .9, ' opacity=".3"')) +
      dots([[42, 56], [44, 58], [50, 56], [52, 58]], .6, c.ink) + cheeks(39, 55, 53, 2) + L('M38 43q3-2 6 0M48 43q3-2 6 0', c.ink, 1, ' opacity=".5"'),
    Q: c => fold('M40 50l-6 30M50 48v34M60 50l6 30', c) + cheeks(45, 55, 38, 1.7) + L('M47.6 39q2.4 2 4.8 0', c.ink, 1, ' opacity=".7"') + dots([[40, 23], [46, 23], [54, 23], [60, 23]], 1, c.a1) + dots([[44, 48], [50, 49], [56, 48]], 1.1, c.a1),
    K: c => dots([[50, 58], [50, 66], [50, 74], [50, 80]], 1.3, c.a2) + L('M42 48q3-2 4 2M54 48q3-2 4 2M46 54q4-2 8 0', c.ink, 1, ' opacity=".35"') + dots([[42, 18], [50, 17], [58, 18]], 1.3, c.a1) + fold('M36 58l-3 24M64 58l3 24', c) + cheeks(43, 57, 42, 1.9)
  },
  spring: {
    P: c => L('M50 30v32M44 36q2 14 6 26M56 36q-2 14-6 26', c.ink, .8, ' opacity=".28"') + L('M42 72q4-2 8 2', c.ink, .8, ' opacity=".35"') + shine('M42 44q0-8 5-12', 1.6, .5),
    R: c => L('M36 44l14-14 14 14M41 46l9-9 9 9', c.ink, .9, ' opacity=".3"') + L('M30 56h12M58 56h12M30 68h40M30 78h40', c.ink, .8, ' opacity=".25"') + shine('M32 48v34', 1.2, .35) + O(64, 40, 2.6, c.a2 || '#ffd23f', c, N0),
    B: c => [[50, 16], [44, 24], [56, 24], [42, 34], [50, 32], [58, 34], [44, 44], [56, 44], [50, 52]].map(([x, y]) => L(`M${x} ${y - 4}v1.6M${x - 3.6} ${y + 1.6}l1.4-.8M${x + 3.6} ${y + 1.6}l-1.4-.8`, '#fff', 1, ' opacity=".7"')).join('') + L('M46 70q2-6 4-12', c.ink, .8, ' opacity=".35"'),
    N: c => L('M48 48q8 4 12 14M52 44q8 4 12 12M44 52q8 6 14 12', c.ink, 1, ' opacity=".3"') + L('M40 60q4 2 6 0M44 64q4 2 6 0M40 66q4 2 6 0', '#fff', 1, ' opacity=".5"') + L('M20 48h9', c.ink, .8) + L('M36 40q4-3 8 0', c.ink, 1, ' opacity=".5"'),
    Q: c => [0, 72, 144, 216, 288].map(d => { const a = (d - 90) * Math.PI / 180, x = 50 + 16 * Math.cos(a), y = 32 + 16 * Math.sin(a); return L(`M${(50 + 7 * Math.cos(a)).toFixed(1)} ${(32 + 7 * Math.sin(a)).toFixed(1)}L${x.toFixed(1)} ${y.toFixed(1)}`, c.ink, .8, ' opacity=".28"'); }).join('') +
      [0, 60, 120, 180, 240, 300].map(d => { const a = d * Math.PI / 180; return D(+(50 + 8.4 * Math.cos(a)).toFixed(1), +(32 + 8.4 * Math.sin(a)).toFixed(1), 1, c.a2); }).join(''),
    K: c => Array.from({length: 12}, (_, i) => { const a = i * 30 * Math.PI / 180; return `M${(50 + 14 * Math.cos(a)).toFixed(1)} ${(36 + 14 * Math.sin(a)).toFixed(1)}L${(50 + 21 * Math.cos(a)).toFixed(1)} ${(36 + 21 * Math.sin(a)).toFixed(1)}`; }).join('').replace(/^(.*)$/, d => L(d, c.ink, .9, ' opacity=".35"')) +
      dots(Array.from({length: 16}, (_, i) => { const a = i / 16 * Math.PI * 2; return [+(50 + 11 * Math.cos(a)).toFixed(1), +(36 + 11 * Math.sin(a)).toFixed(1)]; }), .9, c.ink, ' opacity=".35"') + cheeks(43, 57, 38, 2) + L('M40 66q-4-2-6-6', c.ink, .8, ' opacity=".35"')
  },
  summer: {
    P: c => shine('M38 50q2-8 8-10', 2.4, .6) + L('M50 40v40', '#fff', .8, ' opacity=".5"'),
    R: c => dots([[30, 66], [36, 76], [62, 64], [68, 78], [52, 48], [46, 60], [56, 58], [26, 78], [72, 70]], .8, c.ink, ' opacity=".3"') + L('M32 62h4M64 62h4M48 50h4', c.ink, 2.4, ' opacity=".55"') +
      P('M34 76c0-3 4-3 4 0z', '#fff', c, N0) + L('M22 70h18M60 70h18', c.ink, .8, ' opacity=".2"'),
    B: c => [[44, 30], [52, 28], [56, 34], [46, 38], [48, 20], [54, 18], [44, 24]].map(([x, y], i) => R(x, y, 2.6, 1, ['#ff4d6d', '#3b82f6', '#ffd23f', '#22c55e'][i % 4], c, .5, N0 + ` transform="rotate(${i * 50} ${x} ${y})"`)).join('') +
      P('M40 40c0 3 2 4 2 6 0 1-2 1-2-1zM58 40c0 4 1 6 1 7 0 1 2 1 2-1 0-2-1-4-1-6z', c.body, c, N0) + L('M50 9l2-4', '#3a7a2a', 1.2) + shine('M42 32q0-6 4-8', 1.4, .5),
    N: c => L('M48 52q4 2 8 0M46 58q5 2 10 0M48 66q4 2 8 0M52 74q3 2 6 0M58 40q3 2 4 6M60 32q2 2 2 6', c.ink, 1, ' opacity=".3"') + L('M66 50l4 2M67 54l4 2M66 58l3 2', c.ink, .8, ' opacity=".5"') + L('M34 28l-8 1', c.ink, .8) + L('M37 26q3-2 6 0', c.ink, 1, ' opacity=".5"'),
    Q: c => L('M51 32C40 24 28 26 22 33M51 32c-6-9-5-20 1-24M51 32c8-10 20-12 28-6M51 32c10-1 20 4 24 12M51 32c-10 1-20 8-22 16', c.ink, .9, ' opacity=".35"') + dots([[45, 35], [54, 36]], 1, '#fff', ' opacity=".7"'),
    K: c => L('M38 41l3 2M54 41l3 2', '#fff', 1.4, ' opacity=".8"') + cheeks(38, 62, 50, 2.4) + P('M45 53q5 3 10 0z', '#fff', c, N0) + shine('M38 34q4-6 10-7', 1.6, .5)
  },
  autumn: {
    P: c => L('M36 46l4 6M42 44l4 8M50 42v10M58 44l-4 8M64 46l-4 6M36 50l28 0', c.ink, .8, ' opacity=".3"') + shine('M40 56q0 12 6 20', 2, .45) + L('M52 76l-2 4', c.ink, 1, ' opacity=".4"'),
    R: c => L('M28 52l3-2M34 54l2-3M40 52l3 3M48 54l2-2M56 52l3 3M64 54l2-3M70 52l3 2M28 64l3 2M36 66l3-3M44 64l2 3M52 66l3-2M60 64l2 3M68 66l3-2M30 76l3 2M38 78l2-3M48 76l3 3M58 78l2-3M66 76l3 2', c.a2, 1, ' opacity=".7"') + shine('M26 48v32', 1.4, .35),
    B: c => dots([[44, 36], [56, 36], [42, 48], [58, 48], [44, 60], [56, 60], [46, 72], [54, 72], [50, 42], [50, 54], [50, 66]], .9, '#fff', ' opacity=".55"') + shine('M44 26q-4 14-2 30', 1.4, .4),
    N: c => L('M26 60l2-2 2 2 2-2 2 2M32 64l2-2 2 2 2-2 2 2', '#fff', 1, ' opacity=".7"') + P('M34 34l-1 6 3-2zM65 34l-1 6-2-3z', '#ffb3a0', c, N0) + L('M36 46q3-3 7-1', c.ink, 1.1, ' opacity=".6"') +
      L('M56 56q6 6 8 16M62 52q4 6 4 14', c.ink, .9, ' opacity=".3"') + L('M58 74q4 4 6 10M62 72q4 6 4 12', '#fff', .9, ' opacity=".5"'),
    Q: c => L('M50 44L30 40M50 44l20-4M50 36l-12-14M50 36l12-14M50 50l-16 6M50 50l16 6M50 28l-6-10M50 28l6-10', c.ink, .8, ' opacity=".35"') + shine('M44 22l-6 10', 1.4, .4),
    K: c => L('M38 30l-4-6M62 30l4-6M42 30l-2-6M58 30l2-6', c.ink, 1, ' opacity=".4"') + [...Array(10)].map((_, i) => { const a = i / 10 * Math.PI * 2; return `M${(41 + 8.6 * Math.cos(a)).toFixed(1)} ${(42 + 8.6 * Math.sin(a)).toFixed(1)}l${(1.8 * Math.cos(a)).toFixed(1)} ${(1.8 * Math.sin(a)).toFixed(1)}M${(59 + 8.6 * Math.cos(a)).toFixed(1)} ${(42 + 8.6 * Math.sin(a)).toFixed(1)}l${(1.8 * Math.cos(a)).toFixed(1)} ${(1.8 * Math.sin(a)).toFixed(1)}`; }).join('').replace(/^(.*)$/, d => L(d, c.ink, .8, ' opacity=".4"')) +
      L('M32 56q-2 12 0 22M68 56q2 12 0 22M34 62l-2 4M66 62l2 4M34 70l-2 4M66 70l2 4', c.ink, .9, ' opacity=".35"') + L('M44 76l3 3 3-3 3 3 3-3', c.ink, 1, ' opacity=".5"')
  },
  winter: {
    P: c => dots([[38, 70], [46, 76], [60, 58], [62, 72], [54, 50], [40, 62], [56, 78]], 1, c.shade, ' opacity=".6"') + P('M62 52l1 2.6 2.6 1-2.6 1-1 2.6-1-2.6-2.6-1 2.6-1z', '#fff', c, N0),
    R: c => P('M30 36l1.6 7 1.6-7M44 36l1 5 1-5M56 36l1 6 1-6M66 36l1.4 8 1.4-8M30 84', '#fff', c, N0 + ' opacity=".85"') + L('M34 58l6 4 2 6M62 54l-4 6', '#fff', 1, ' opacity=".6"') + dots([[36, 46], [64, 76], [40, 78], [60, 48]], 1, '#fff') + shine('M30 40v40', 1.4, .45),
    B: c => L('M46 16l-4 12M54 16l4 12M45 32l-3 16M55 32l3 16', '#fff', 1, ' opacity=".5"') + P('M50 84c0 3-1 5-1 6 0 1 2 1 2 0 0-1-1-3-1-6z', c.body, c, N0) + P('M44 20l1 2.6 2.6 1-2.6 1-1 2.6-1-2.6-2.6-1 2.6-1z', '#fff', c, N0),
    N: c => L('M46 42q2 4 0 8M52 40q3 4 2 8M58 44q2 4 1 8M62 50q2 4 1 8M30 50q2 2 4 2', c.ink, .9, ' opacity=".28"') + L('M44 66l-1 4M50 67v4M56 66l1 4', '#fff', 1.4, ' opacity=".8"') +
      L('M62 70l2 6M65 69l1 6', '#fff', 1.2, ' opacity=".7"') + D(17.4, 52.2, .8, '#fff') + L('M35 43q3-3 7-1', c.ink, 1, ' opacity=".5"') + P('M51 34a2 2 0 0 1 3 1', 'none', c, ' stroke="#ffb3c7" stroke-width="1"'),
    Q: c => P('M50 28l7 4v8l-7 4-7-4v-8z', 'none', c, ` stroke="${c.a1}" stroke-width="1.4"`) + D(50, 36, 3, c.a1) + D(49, 35, 1, '#fff') + dots([[50, 14], [69, 25], [69, 47], [50, 58], [31, 47], [31, 25]], 1.6, '#fff'),
    K: c => dots([[50, 32], [48, 27]], 0, c.ink) + dots([[46, 44], [48.6, 45.4], [51.4, 45.4], [54, 44]], .9, c.ink) + L('M42 50l2 4M48 51l1 4M54 51l-1 4', '#fff', 1.4, ' opacity=".7"') + L('M52 43l1 2M55 43.4l1 2', c.ink, .6, ' opacity=".5"') +
      dots([[40, 60], [62, 72], [44, 76], [58, 62], [42, 34], [60, 40]], .9, c.shade, ' opacity=".6"') + L('M32 62l-10-8M22 54l-2-4M24 56l-4 0M68 62l10-8M78 54l2-4M76 56l4 0', '#6a3a12', 1.8) + shine('M38 58q2-6 8-8', 1.6, .45) + L('M40 23h20', '#fff', 1, ' opacity=".35"')
  }
};

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
const mix = (a, b, k) => { const A = parseInt(a.slice(1), 16), B = parseInt(b.slice(1), 16); return '#' + [16, 8, 0].map(sh => Math.round((A >> sh & 255) * (1 - k) + (B >> sh & 255) * k).toString(16).padStart(2, '0')).join(''); };
function shadeGradients(g){
  // finer, coloured line work: each outline becomes a deep shade of its own fill (blended with the ink)
  g = g.replace(/<(path|ellipse|rect|circle)\b[^>]*>/g, tag => {
    const fm = tag.match(/fill="(#[0-9a-f]{6})"/i), sm = tag.match(/stroke="(#[0-9a-f]{6})"/i);
    if (!fm || !sm || !/stroke-width="2.6"/.test(tag)) return tag;
    return tag.replace(sm[0], `stroke="${mix(tint(fm[1].toLowerCase(), -.62), sm[1].toLowerCase(), .45)}"`).replace('stroke-width="2.6"', 'stroke-width="2"');
  });
  // light: a soft rim along the upper-left edge of every solid shape, and a glossy spot on the round ones
  g = g.replace(/<(path|ellipse|rect|circle)\b[^>]*?\/>/g, tag => {
    if (!/fill="#[0-9a-f]{6}"/i.test(tag) || !/stroke-width="(2|1\.6)"/.test(tag) || /opacity=/.test(tag)) return tag;
    let out = tag + tag.replace(/\s(fill|stroke|stroke-width|stroke-linejoin|stroke-linecap)="[^"]*"/g, '').replace(/\/>$/, ' fill="none" stroke="url(#rl)" stroke-width="1.1"/>');
    const m = !/transform=/.test(tag) && tag.match(/^<(?:ellipse|circle)\b.*?cx="([\d.-]+)".*?cy="([\d.-]+)".*?(?:rx|r)="([\d.]+)"(?:.*?ry="([\d.]+)")?/);
    if (m && +m[3] >= 3.5){ const cx = +m[1], cy = +m[2], rx = +m[3], ry = +(m[4] || m[3]), x = (cx - rx * .36).toFixed(1), y = (cy - ry * .42).toFixed(1);
      out += `<ellipse cx="${x}" cy="${y}" rx="${(rx * .3).toFixed(1)}" ry="${(ry * .17).toFixed(1)}" fill="url(#gl)" transform="rotate(-32 ${x} ${y})"/>`; }
    return out;
  });
  const cols = [...new Set((g.match(/fill="#[0-9a-f]{6}"/gi) || []).map(m => m.slice(6, -1).toLowerCase()))];
  let defs = '<linearGradient id="rl" x1="0" y1="0" x2=".7" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".75"/><stop offset=".42" stop-color="#fff" stop-opacity="0"/></linearGradient>' +
    '<radialGradient id="gl"><stop offset="0" stop-color="#fff" stop-opacity=".85"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>';
  // every flat colour becomes a lit volume: a bright crown at the upper left falling into a soft core shadow
  cols.forEach((h, i) => {
    defs += `<radialGradient id="sg${i}" cx=".34" cy=".26" r=".9"><stop offset="0" stop-color="${tint(h, .5)}"/><stop offset=".22" stop-color="${tint(h, .2)}"/><stop offset=".6" stop-color="${h}"/><stop offset="1" stop-color="${tint(h, -.38)}"/></radialGradient>`;
    g = g.split(`fill="${h}"`).join(`fill="url(#sg${i})"`);
  });
  return `<defs>${defs}</defs>${g}`;
}

// Register each set as a piece set the app can use like any other
const KEYS = ['K', 'Q', 'R', 'B', 'N', 'P'];
const wrap = inner => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${inner}</svg>`;
const sets = (window.GW_DATA = window.GW_DATA || {}).PIECE_SETS = window.GW_DATA.PIECE_SETS || {};
// motion: {K:['sway', args] …}; spark: {K:[[[x, y, r, s]…], colour] …}
function register(id, S, motion = MOTION[id], spark = SPARK[id]){
  const svg = {};
  for (const side of ['w', 'b']) for (const k of KEYS){
    const g = S.draw[k](S.pal[side]), cut = g.indexOf('</g>') + 4, dt = (S.detail || DETAIL[id] || {})[k];
    let body = g.slice(cut) + (dt ? dt(S.pal[side]) : '');
    const m = motion && motion[k], sp = spark && spark[k];
    if (m) body = MOVE[m[0]](body, m[1]);
    if (sp) body += sparkles(sp[0], sp[1]);
    svg[side + k] = wrap(shadeGradients(g.slice(0, cut) + body));
  }
  sets['th-' + id] = {name: S.name, author: 'Elite Chess', license: 'original', themed: true, animated: true, pack: id, svg};
}
for (const [id, S] of Object.entries(SETS)) register(id, S);
// the drawing kit, for the sports sets (sportthemes.js)
window.GW_SEASONAL = Object.assign(window.GW_SEASONAL || {}, {SETS, kit:{P, L, E, O, D, R, base, star, crown, cross, eye, register}});
})();
