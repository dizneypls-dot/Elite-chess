/* © 2026 Elite Chess. All rights reserved. Proprietary: no copying, reuse or AI training without written permission. See terms.html. */
/* Elite Chess: "Tournament Wood", an original tournament-style set drawn like real turned pieces:
   boxwood for White, polished ebony for Black, each turning shaded as a cylinder with grain, beads, a carved knight
   and a baize pad underneath. Pieces are drawn on a 100×100 grid; the app adds its premium finish (sheen and rim) on
   top, and colourways recolour it by brightness like any other set. */
(() => {
const E = .2;   // how much of each turning's top we see (view tilt)
const WOOD = {
  w: {edge:'#9c6b36', deep:'#b9884f', mid:'#e2c38e', light:'#f4e2bd', hi:'#fff8e8', grain:'#b07c44', ink:'#6b4520', top:'#f7e8c8', pad:'#2f6b3a'},
  b: {edge:'#050302', deep:'#140d0a', mid:'#2a1d17', light:'#4a3a31', hi:'#b8a69a', grain:'#000000', ink:'#000000', top:'#3a2c24', pad:'#2f6b3a'}
};
const f = n => +n.toFixed(2);
function defs(c, side){
  const stops = s => s.map(([o, col, a]) => `<stop offset="${o}" stop-color="${col}"${a != null ? ` stop-opacity="${a}"` : ''}/>`).join('');
  return '<defs>' +
    // a turning lit from the upper left: dark rim, bright band, a crisp highlight, falling into shadow on the right
    `<linearGradient id="cy"><stop offset="0" stop-color="${c.edge}"/>${stops([[.12, c.deep], [.3, c.mid], [.42, c.light], [.47, c.hi], [.53, c.light], [.72, c.mid], [.9, c.deep], [1, c.edge]])}</linearGradient>` +
    `<linearGradient id="kn" x1="0" y1="0" x2="1" y2=".7">${stops([[0, c.hi], [.18, c.light], [.5, c.mid], [.85, c.deep], [1, c.edge]])}</linearGradient>` +
    `<radialGradient id="ba" cx=".36" cy=".3" r=".75">${stops([[0, c.hi], [.2, c.light], [.55, c.mid], [.85, c.deep], [1, c.edge]])}</radialGradient>` +
    `<radialGradient id="tp" cx=".4" cy=".35" r=".7">${stops([[0, c.hi], [.5, c.top], [1, c.mid]])}</radialGradient>` +
    `<radialGradient id="ao" cx=".5" cy=".5" r=".5">${stops([[0, '#000', side === 'w' ? .35 : .5], [1, '#000', 0]])}</radialGradient>` +
    `<linearGradient id="pd">${stops([[0, '#1d4a26'], [.4, c.pad], [1, '#16381d']])}</linearGradient>` +
    // fine wood grain (boxwood shows it; on ebony it only deepens the black)
    `<pattern id="gr" width="7" height="40" patternUnits="userSpaceOnUse"><path d="M1.5 0c1.2 10-1 20 .4 40M4.6 0c-.8 12 1.3 24-.2 40" stroke="${c.grain}" stroke-width=".45" fill="none" opacity="${side === 'w' ? .35 : .5}"/></pattern>` +
    '</defs>';
}
// one turning from (y1, r1) to (y2, r2); b bulges the sides (+out, −in); the front edges are ellipse arcs
const turn = (y1, r1, y2, r2, b = 0, o = {}) => {
  const h = y2 - y1, L1 = 50 - r1, L2 = 50 - r2, R1 = 50 + r1, R2 = 50 + r2;
  const d = `M${f(L1)} ${f(y1)}C${f(L1 - b)} ${f(y1 + h / 3)} ${f(L2 - b)} ${f(y1 + h * 2 / 3)} ${f(L2)} ${f(y2)}` +
    `A${f(r2)} ${f(r2 * E)} 0 0 0 ${f(R2)} ${f(y2)}C${f(R2 + b)} ${f(y1 + h * 2 / 3)} ${f(R1 + b)} ${f(y1 + h / 3)} ${f(R1)} ${f(y1)}` +
    `A${f(r1)} ${f(r1 * E)} 0 0 0 ${f(L1)} ${f(y1)}Z`;
  return `<path d="${d}" fill="url(#cy)" stroke="url(#ink)" stroke-width=".7"/>` + (o.grain ? `<path d="${d}" fill="url(#gr)"/>` : '') +
    (o.top ? `<ellipse cx="50" cy="${f(y1)}" rx="${f(r1)}" ry="${f(r1 * E)}" fill="url(#tp)" stroke="url(#ink)" stroke-width=".5"/>` : '') +
    // a soft shadow where this turning meets the one below
    (o.shade !== false ? `<path d="M${f(L2 + .6)} ${f(y2 - .4)}A${f(r2 - .6)} ${f((r2 - .6) * E)} 0 0 0 ${f(R2 - .6)} ${f(y2 - .4)}" stroke="#000" stroke-opacity=".18" stroke-width="1.2" fill="none"/>` : '');
};
const ball = (cx, cy, r) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#ba)" stroke="url(#ink)" stroke-width=".7"/><ellipse cx="${f(cx - r * .32)}" cy="${f(cy - r * .38)}" rx="${f(r * .3)}" ry="${f(r * .18)}" fill="#fff" opacity=".55" transform="rotate(-30 ${f(cx - r * .32)} ${f(cy - r * .38)})"/>`;
// the shared foot: baize pad, the wide plinth, a bead and a cove up into the stem (top radius r)
const foot = (r = 15, y = 76) => `<ellipse cx="50" cy="95" rx="33" ry="4" fill="url(#ao)"/>` +
  `<path d="M20.5 92.6A29.5 5.6 0 0 0 79.5 92.6V93.6A29.5 5.6 0 0 1 20.5 93.6Z" fill="url(#pd)"/>` +
  turn(86, 29.5, 92.6, 29.5, 1.6, {grain:true}) + turn(83.4, 26, 86.6, 27, .8, {top:true}) + turn(80.6, 23, 83.6, 24, 1.2) +
  turn(y, r, 81, 21.5, -2.2, {grain:true});
// a thin collar (the disc under a head)
const collar = (y, r, h = 3) => turn(y, r, y + h, r, .9, {top:true});
const svg = (c, side, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${defs(c, side).replace('</defs>', `<linearGradient id="ink"><stop offset="0" stop-color="${c.ink}" stop-opacity=".9"/><stop offset="1" stop-color="${c.ink}" stop-opacity=".9"/></linearGradient></defs>`)}${body}</svg>`;

const DRAW = {
  P: c => foot(10, 70) +
    turn(52, 7.6, 71, 10.5, -1.6, {grain:true}) + collar(47.5, 12, 3.2) + turn(50.7, 12, 52.4, 9, 0, {shade:false}) + ball(50, 36, 11.6),
  R: c => foot(17, 72) +
    turn(33, 15.5, 73, 18, -1.4, {grain:true}) + collar(30, 18.6, 3) +
    // battlements: the back wall seen through the gaps, then the front merlons and the hollow top
    `<path d="M32 18h36v14H32z" fill="url(#cy)" stroke="url(#ink)" stroke-width=".7"/><path d="M32 18h36v14H32z" fill="#000" opacity=".35"/>` +
    `<path d="M31 30.5V15.5h7.4V21h6.6v-5.5h10V21h6.6v-5.5H69V30.5A19 3.8 0 0 1 31 30.5Z" fill="url(#cy)" stroke="url(#ink)" stroke-width=".7"/><path d="M31 30.5V15.5h7.4V21h6.6v-5.5h10V21h6.6v-5.5H69V30.5A19 3.8 0 0 1 31 30.5Z" fill="url(#gr)"/>` +
    `<path d="M31 15.5h7.4M45 15.5h10M61.6 15.5H69" stroke="#fff" stroke-opacity=".45" stroke-width=".9"/>` +
    `<path d="M38.4 21h6.6M55 21h6.6" stroke="#000" stroke-opacity=".35" stroke-width="1"/>` +
    `<path d="M31.6 25A18.4 3.6 0 0 0 68.4 25" stroke="#000" stroke-opacity=".2" stroke-width="1" fill="none"/>`,
  B: c => foot(9.6, 72) +
    turn(50, 6.6, 73, 9.8, -2.4, {grain:true}) + collar(45.6, 11.4, 2.8) + turn(48.4, 11.4, 50.2, 8, 0, {shade:false}) +
    // the mitre with its slit, and the finial
    `<path d="M50 11C60 18 64.5 30 61.6 39.6Q50 46.4 38.4 39.6C35.5 30 40 18 50 11Z" fill="url(#cy)" stroke="url(#ink)" stroke-width=".7"/><path d="M50 11C60 18 64.5 30 61.6 39.6Q50 46.4 38.4 39.6C35.5 30 40 18 50 11Z" fill="url(#gr)"/>` +
    `<path d="M52.6 19.2L62 31.4" stroke="#000" stroke-opacity=".55" stroke-width="1.8" stroke-linecap="round"/><path d="M52.2 21L61 32.6" stroke="#fff" stroke-opacity=".4" stroke-width=".8" stroke-linecap="round"/>` +
    `<path d="M39.4 40.2Q50 45.6 60.6 40.2" stroke="#000" stroke-opacity=".25" stroke-width="1.4" fill="none"/>` +
    ball(50, 8.2, 3.6),
  Q: c => foot(11, 72) +
    turn(42, 7.4, 73, 11, -2.6, {grain:true}) + collar(37.6, 13, 3) + turn(40.6, 13, 42.4, 9, 0, {shade:false}) +
    // the coronet: a flared cup with eight points (five face us), a ball on each, and a dome inside
    ball(50, 19.4, 6.6) + turn(24.6, 16.6, 37.8, 9, -2.6, {grain:true}) +
    `<path d="M33.4 24.6L34.6 15.4 38.6 21.6 42 13.8 46 21.4 50 12.6 54 21.4 58 13.8 61.4 21.6 65.4 15.4 66.6 24.6A16.6 3.32 0 0 1 33.4 24.6Z" fill="url(#cy)" stroke="url(#ink)" stroke-width=".7"/>` +
    `<path d="M34.4 21.4Q50 26 65.6 21.4" stroke="#fff" stroke-opacity=".35" stroke-width=".8" fill="none"/><path d="M33.6 24.2A16.4 3.2 0 0 0 66.4 24.2" stroke="#000" stroke-opacity=".3" stroke-width="1.2" fill="none"/>` +
    [[34.6, 15.4], [42, 13.8], [50, 12.6], [58, 13.8], [65.4, 15.4]].map(([x, y]) => ball(x, f(y - 1.6), 2.5)).join(''),
  K: c => foot(12, 72) +
    turn(42, 7.8, 73, 12, -2.8, {grain:true}) + collar(37.4, 13.6, 3) + turn(40.4, 13.6, 42.4, 9.4, 0, {shade:false}) +
    turn(24.6, 14.8, 37.6, 9.6, -1.6, {grain:true}) + collar(22.2, 15.4, 2.6) +
    // the cap and the cross
    `<path d="M38.4 22.6C39 15.6 44 12.6 50 12.6S61 15.6 61.6 22.6Z" fill="url(#ba)" stroke="url(#ink)" stroke-width=".7"/>` + collar(11.2, 4.4, 2.2) +
    `<path d="M47.6 1.4h4.8v3.6h3.8v4.4h-3.8v2.6h-4.8V9.4h-3.8V5h3.8Z" fill="url(#cy)" stroke="url(#ink)" stroke-width=".7"/><path d="M48.4 2.4v8.6M44.6 6h10" stroke="#fff" stroke-opacity=".4" stroke-width=".7"/>`,
  // the knight: a carved horse head on the plinth, mane in grooves, an almond eye and flared nostril
  N: c => foot(16, 73) +
    `<path d="M33.6 75C33 67 37 61 42.6 57.4 37.4 57.2 30.6 59.4 25 59.6 19.4 59.8 15.4 57 15 52.4 14.6 48 17 44 21 40 26.6 34 33 27.6 39.6 22.6L40.6 12.4C42.4 11 45.4 11.4 47.8 15 51.8 14 56.2 15 60 17.6 70.6 25 75.4 38.6 73.8 52 72.6 61.6 70 69 68.4 75Z" fill="url(#kn)" stroke="url(#ink)" stroke-width=".8"/>` +
    `<path d="M33.6 75C33 67 37 61 42.6 57.4 37.4 57.2 30.6 59.4 25 59.6 19.4 59.8 15.4 57 15 52.4 14.6 48 17 44 21 40 26.6 34 33 27.6 39.6 22.6L40.6 12.4C42.4 11 45.4 11.4 47.8 15 51.8 14 56.2 15 60 17.6 70.6 25 75.4 38.6 73.8 52 72.6 61.6 70 69 68.4 75Z" fill="url(#gr)"/>` +
    // mane: carved ridges down the back of the neck
    [0, 1, 2, 3, 4, 5].map(i => { const t = i / 6, x = 56 + t * 13 - t * t * 4, y = 21 + t * 46; return `<path d="M${f(x - 5)} ${f(y + 1)}Q${f(x + 1)} ${f(y - 1)} ${f(x + 4)} ${f(y + 5)}" stroke="#000" stroke-opacity=".32" stroke-width="1.3" fill="none"/><path d="M${f(x - 5)} ${f(y + 2.4)}Q${f(x + 1)} ${f(y + .4)} ${f(x + 3.6)} ${f(y + 6.2)}" stroke="#fff" stroke-opacity=".3" stroke-width=".7" fill="none"/>`; }).join('') +
    // forelock, ear hollow, cheek, eye, nostril, mouth
    `<path d="M47.8 15C46 18.6 42.6 21.6 39.6 22.6 43.4 23.6 47.4 22 49.8 18.8" fill="#000" opacity=".22"/>` +
    `<path d="M41.8 14.2L42 20.6 45.6 17.4Z" fill="#000" opacity=".35"/>` +
    `<path d="M47 33C53 36 55.6 43.6 52.6 50.4 49.8 55 45 57 42.6 57.4" stroke="#000" stroke-opacity=".3" stroke-width="1.6" fill="none"/><path d="M46.2 34.4C51.6 37.6 53.6 44 51 49.6" stroke="#fff" stroke-opacity=".3" stroke-width=".8" fill="none"/>` +
    `<path d="M33.4 30.6Q37.4 27.2 41.4 30.2Q37.4 32.8 33.4 30.6Z" fill="#120a06" stroke="${c.ink}" stroke-width=".4"/><circle cx="38.6" cy="29.8" r=".8" fill="#fff" opacity=".9"/><path d="M32.4 28.4Q37 24.6 42.4 28.2" stroke="#000" stroke-opacity=".35" stroke-width="1" fill="none"/>` +
    `<path d="M20.2 46.4Q22.8 44.4 25 46.6Q22.6 48.4 20.2 46.4Z" fill="#120a06" opacity=".85"/><path d="M19.4 44.2Q23 41.6 26.4 45" stroke="#fff" stroke-opacity=".35" stroke-width=".7" fill="none"/>` +
    `<path d="M15.4 53.2Q20 53.6 24.6 52.4" stroke="#000" stroke-opacity=".45" stroke-width="1" fill="none"/>` +
    `<path d="M24 37.4C28 34 33.6 33.6 36 35" stroke="#fff" stroke-opacity=".35" stroke-width="1.2" fill="none"/>` +
    `<path d="M35 74.4Q51 78 67.6 74.4" stroke="#000" stroke-opacity=".25" stroke-width="1.4" fill="none"/>`
};
const svgs = {};
for (const side of ['w', 'b']) for (const k of ['K', 'Q', 'R', 'B', 'N', 'P']) svgs[side + k] = svg(WOOD[side], side, DRAW[k](WOOD[side]));
const D = window.GW_DATA = window.GW_DATA || {};
// listed first after the original Classic set
D.PIECE_SETS = Object.assign({staunton: {name:'Tournament Wood', author:'Elite Chess', license:'original', svg: svgs}}, D.PIECE_SETS || {});
})();
