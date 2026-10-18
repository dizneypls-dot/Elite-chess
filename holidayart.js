/* © 2026 Elite Chess. All rights reserved. Proprietary: no copying, reuse or AI training without written permission. See terms.html. */
/* Elite Chess: storybook-detail artwork for the holiday and season flyovers, replacing the simpler first drawings
   in flyovers.js: Santa's sleigh and reindeer, the witch, bats, the ghost, Cupid and a glass heart, the Easter bunny,
   butterflies and a bumblebee, geese, a penguin, a snowy owl, gulls, a beach ball, the rainbow to a pot of gold,
   the crescent moon and the dreidel. Gradients and patterns only (no per-frame filters), so it stays smooth. */
(() => {
const F = window.GW_SEASONAL && window.GW_SEASONAL.FLY;
if (!F) return;
const SANTA = (() => {
const st = s => s.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a != null ? ` stop-opacity="${a}"` : ''}/>`).join('');
const LG = (id, s, x1 = 0, y1 = 0, x2 = 0, y2 = 1) => `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${st(s)}</linearGradient>`;
const RG = (id, s, cx = .5, cy = .5, r = .5) => `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${st(s)}</radialGradient>`;
const rep = (d, b = 0) => ` dur="${d}s" begin="${b ? -b : 0}s" repeatCount="indefinite"`;
const ease = n => ` calcMode="spline" keySplines="${Array(n).fill('.45 0 .55 1').join(';')}"`;
const rot = (vals, cx, cy, d, b) => `<animateTransform attributeName="transform" type="rotate" values="${vals.map(v => `${v} ${cx} ${cy}`).join(';')}"${rep(d, b)}${ease(vals.length - 1)}/>`;
const defs =
  LG('snFur', [[0, '#c48a52'], [.5, '#9a6232'], [1, '#5e3814']]) + LG('snFurDark', [[0, '#8a5a2e'], [1, '#4a2a0e']]) + LG('snChest', [[0, '#f6ead8'], [1, '#d9c2a2']]) +
  LG('snAntler', [[0, '#f2e2c2'], [1, '#b8955a']], 0, 0, 1, 0) + LG('snLeather', [[0, '#d9363e'], [1, '#7a0a12']]) + RG('snBell', [[0, '#fff6c8'], [.35, '#f2c14e'], [.8, '#b8860b'], [1, '#6a4a04']], .35, .3) +
  RG('snNose', [[0, '#ffd0d0'], [.35, '#ff2a2a'], [1, '#8a0010']], .35, .3) + RG('snGlow', [[0, '#ff4a4a', .8], [.5, '#ff4a4a', .25], [1, '#ff4a4a', 0]]) +
  LG('snLacquer', [[0, '#ff5a64'], [.3, '#d4142a'], [.75, '#8a0614'], [1, '#4a020a']]) + LG('snGold', [[0, '#fff3b8'], [.45, '#f2c14e'], [.8, '#b8860b'], [1, '#fff0a0']]) +
  LG('snGoldV', [[0, '#fff3b8'], [.5, '#e8b730'], [1, '#8a5a08']], 0, 0, 1, 0) + LG('snSuit', [[0, '#f0485a'], [.5, '#c8102e'], [1, '#6a0612']]) + RG('snFace', [[0, '#ffe6d4'], [.7, '#f4c2a2'], [1, '#d99a7a']], .4, .35) +
  RG('snFluff', [[0, '#ffffff'], [.7, '#f1f4fa'], [1, '#c9d2e0']], .4, .35) + LG('snSack', [[0, '#c8955a'], [.6, '#8a5a28'], [1, '#5a3612']]) + LG('snWood', [[0, '#7a4a22'], [1, '#3a1e08']]) +
  RG('snShadow', [[0, '#000', .35], [1, '#000', 0]]) + LG('snTrail', [[0, '#fff6c8', 0], [.7, '#ffe08a', .5], [1, '#ffffff', .8]], 0, 0, 1, 0) +
  `<pattern id="snBurlap" width="4" height="4" patternUnits="userSpaceOnUse"><path d="M0 1H4M0 3H4" stroke="#5a3612" stroke-width=".5" opacity=".5"/><path d="M1 0V4M3 0V4" stroke="#e8c08a" stroke-width=".4" opacity=".4"/></pattern>` +
  `<pattern id="snFurTex" width="6" height="6" patternUnits="userSpaceOnUse"><path d="M1 5c1-2 2-3 3-4M3 6c1-2 2-3 3-4" stroke="#3a2008" stroke-width=".6" opacity=".35" fill="none"/></pattern>`;
// fluffy white trim: overlapping puffs along a path of points
const fluff = (pts, r) => pts.map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${(r * (.85 + (i % 3) * .1)).toFixed(1)}" fill="url(#snFluff)"/>`).join('');
// one reindeer at x, with a galloping two-part leg on each corner
function deer(x, y, phase, o = {}){
  const fur = o.back ? 'url(#snFurDark)' : 'url(#snFur)';
  const leg = (hx, hy, a1, a2, k1, k2, b) => `<g transform="translate(${hx} ${hy})"><g>${rot([a1, a2, a1], 0, 0, .56, b)}
    <path d="M-4 0C-6 8-4 16-1 20h6C8 14 7 6 5 0z" fill="${fur}"/>
    <g transform="translate(1 19)"><g>${rot([k1, k2, k1], 0, 0, .56, b)}<path d="M-2.4 0L-2 17h4.6L2.6 0z" fill="${fur}"/><path d="M-3 16h6.6l.8 4H-3.6z" fill="#1a0e04"/><path d="M-1.6 2v12" stroke="#fff" stroke-opacity=".12" stroke-width="1"/></g></g></g></g>`;
  return `<g transform="translate(${x} ${y})"><g><animateTransform attributeName="transform" type="translate" values="0 0;0 -4;0 0"${rep(.56, phase)}${ease(2)}/>
    ${leg(22, 38, 34, -26, -40, 6, phase + .28)}${leg(66, 36, -34, 24, 8, -46, phase)}
    <path d="M14 34C12 22 22 14 38 14h26c12 0 20 8 20 18 0 10-8 16-18 16H32C20 48 15 42 14 34z" fill="${fur}"/>
    <path d="M14 34C12 22 22 14 38 14h26c12 0 20 8 20 18 0 10-8 16-18 16H32C20 48 15 42 14 34z" fill="url(#snFurTex)"/>
    <path d="M28 44c12 4 30 4 42 0" stroke="url(#snChest)" stroke-width="5" stroke-linecap="round" opacity=".7"/>
    <path d="M24 20c10-5 26-7 40-6" stroke="#fff" stroke-opacity=".22" stroke-width="3" stroke-linecap="round" fill="none"/>
    <path d="M15 28c-6-6-11-2-9 2 2 3 6 3 9 0z" fill="url(#snChest)"/>
    ${leg(26, 40, -30, 30, 8, -40, phase + .28)}${leg(70, 38, 28, -32, -44, 10, phase)}
    <path d="M72 26c2-12 8-20 16-24l9 7c-5 6-10 14-12 22z" fill="${fur}"/><path d="M74 28c4 6 6 12 6 18l8-6c-2-6-6-10-8-14z" fill="url(#snChest)"/>
    <path d="M68 16c6 6 10 14 10 24" stroke="url(#snLeather)" stroke-width="5" fill="none"/>
    ${[[72, 22], [75, 30], [77, 38]].map(([bx, by]) => `<circle cx="${bx}" cy="${by}" r="3.4" fill="url(#snBell)"/><path d="M${bx - 1.6} ${by + 1}h3.2" stroke="#4a3204" stroke-width=".8"/>`).join('')}
    <g>${rot([-5, 6, -5], 88, 6, 1.12, phase)}
      <path d="M86 0C84-10 86-20 92-28M88-14c-4-2-8-6-9-12M90-21c3-2 6-6 6-11M91-6c5-4 10-6 15-6M100-10c2-4 6-7 10-8" fill="none" stroke="url(#snAntler)" stroke-width="3" stroke-linecap="round"/>
      <path d="M95 2C93-8 96-16 103-22M98-10c4-2 8-2 12 0M100-16c2-4 5-6 9-7" fill="none" stroke="url(#snAntler)" stroke-width="2.4" stroke-linecap="round" opacity=".85"/>
      <path d="M80 8c3-8 13-11 21-6 6 3 9 8 8 13-1 5-6 7-12 8l-10 2c-6 0-9-6-7-17z" fill="${fur}"/>
      <path d="M98 18c4 1 8 0 10-3" stroke="#2a1404" stroke-width="1.2" fill="none"/><path d="M80 6l-9-6 11 2z" fill="${o.back ? '#3a2208' : '#6b4220'}"/><path d="M81 5l-6-3" stroke="#e8c2a0" stroke-width="1.4" opacity=".6"/>
      <ellipse cx="91" cy="9" rx="2.6" ry="2.8" fill="#1a0a02"/><circle cx="92" cy="8" r=".9" fill="#fff"/><path d="M88 6q3-2 6 0" stroke="#3a2008" stroke-width="1" fill="none"/>
      ${o.rudolph ? `<circle cx="110" cy="15" r="11" fill="url(#snGlow)"><animate attributeName="opacity" values="1;.45;1"${rep(1.1)}/></circle><circle cx="109.5" cy="15" r="4" fill="url(#snNose)"/>` : '<ellipse cx="108.5" cy="15" rx="2.8" ry="2.4" fill="#2a1408"/>'}
    </g></g></g>`;
}
const curls = (cx, cy, n, r) => Array.from({length: n}, (_, i) => { const a = Math.PI * .1 + i / (n - 1) * Math.PI * .8; return `<circle cx="${(cx + r * Math.cos(a) * 1.1).toFixed(1)}" cy="${(cy + r * Math.sin(a)).toFixed(1)}" r="${(4.4 + (i % 2)).toFixed(1)}" fill="url(#snFluff)"/>`; }).join('');
const glitter = Array.from({length: 22}, (_, i) => { const x = (4 + (i * 37) % 70).toFixed(1), y = (118 + (i * 23) % 34).toFixed(1), r = (1.4 + (i % 4) * .7).toFixed(1);
  return `<path d="M${x} ${+y - r * 2}Q${+x + r * .3} ${+y - r * .3} ${+x + r * 2} ${y}Q${+x + r * .3} ${+y + r * .3} ${x} ${+y + r * 2}Q${+x - r * .3} ${+y + r * .3} ${+x - r * 2} ${y}Q${+x - r * .3} ${+y - r * .3} ${x} ${+y - r * 2}Z" fill="${i % 3 ? '#fff6c8' : '#ffffff'}" opacity="0"><animate attributeName="opacity" values="0;1;0"${rep(1.3, (i * .13).toFixed(2))}/></path>`; }).join('');
return `<svg viewBox="0 0 560 200" xmlns="http://www.w3.org/2000/svg"><defs>${defs}</defs>
  <path d="M0 140C30 132 60 140 90 134" stroke="url(#snTrail)" stroke-width="16" stroke-linecap="round" fill="none" opacity=".6"/>${glitter}
  <!-- reins and traces -->
  <path d="M206 92C250 100 292 92 324 84M206 92C280 108 370 100 432 84" stroke="#5a2a0a" stroke-width="1.6" fill="none"><animate attributeName="d" values="M206 92C250 100 292 92 324 84M206 92C280 108 370 100 432 84;M206 92C250 106 292 98 324 84M206 92C280 114 370 106 432 84;M206 92C250 100 292 92 324 84M206 92C280 108 370 100 432 84"${rep(.56)}/></path>
  ${deer(340, 66, .14, {back:true})}${deer(232, 66, .4, {back:true})}
  <!-- the sleigh -->
  <g><animateTransform attributeName="transform" type="translate" values="0 0;0 -3;0 0"${rep(1.12)}${ease(2)}/>
    <!-- sack of toys -->
    <path d="M78 104c-12-24-6-52 14-58 10-3 18 2 20 12 10 16 10 30 4 46z" fill="url(#snSack)"/><path d="M78 104c-12-24-6-52 14-58 10-3 18 2 20 12 10 16 10 30 4 46z" fill="url(#snBurlap)"/>
    <path d="M84 58c6 3 18 3 26-2" stroke="#4a2a08" stroke-width="3" fill="none"/>
    <g transform="rotate(-14 92 40)"><rect x="80" y="26" width="24" height="20" rx="2" fill="#2563eb"/><rect x="80" y="26" width="24" height="20" rx="2" fill="url(#snFluff)" opacity=".18"/><path d="M92 26v20M80 36h24" stroke="url(#snGold)" stroke-width="3"/><path d="M92 26c-6-8-12-6-10-1 2 3 8 2 10 1zM92 26c6-8 12-6 10-1-2 3-8 2-10 1z" fill="url(#snGold)"/></g>
    <g transform="rotate(10 116 44)"><rect x="104" y="34" width="22" height="18" rx="2" fill="#16a34a"/><path d="M115 34v18M104 43h22" stroke="#e5484d" stroke-width="3"/></g>
    <circle cx="70" cy="56" r="9" fill="#a8743e"/><circle cx="63" cy="49" r="4" fill="#a8743e"/><circle cx="77" cy="49" r="4" fill="#a8743e"/><circle cx="67" cy="55" r="1.4" fill="#1a0a02"/><circle cx="73" cy="55" r="1.4" fill="#1a0a02"/><ellipse cx="70" cy="59" rx="3" ry="2" fill="#e8c8a0"/>
    <path d="M60 70V44c0-6 8-6 8 0" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M60 70V44c0-6 8-6 8 0" stroke="#e5484d" stroke-width="4" stroke-dasharray="4 4" fill="none" stroke-linecap="round"/>
    <!-- Santa -->
    <path d="M128 108c0-28 12-48 34-48s32 20 32 48z" fill="url(#snSuit)"/>
    <path d="M150 64c-6 14-8 30-8 44M176 66c4 14 6 28 6 42" stroke="#6a0612" stroke-width="2" opacity=".5" fill="none"/>
    ${fluff([[160, 62], [160, 70], [160, 78], [161, 86], [161, 94], [162, 102]], 5.4)}
    <path d="M128 88h66" stroke="#14161b" stroke-width="9"/><rect x="152" y="82" width="16" height="12" rx="2" fill="none" stroke="url(#snGold)" stroke-width="3"/>
    <path d="M182 74c12 4 20 12 22 22" stroke="url(#snSuit)" stroke-width="12" stroke-linecap="round" fill="none"/>${fluff([[200, 92], [204, 96]], 5)}<circle cx="208" cy="96" r="6" fill="#14532d"/><circle cx="206" cy="94" r="2" fill="#2f8a4a"/>
    <g>${rot([-8, 28, -8], 140, 72, 1.5)}<path d="M140 72c-10-10-12-22-8-34" stroke="url(#snSuit)" stroke-width="12" stroke-linecap="round" fill="none"/>${fluff([[132, 40], [134, 34]], 5)}<circle cx="133" cy="27" r="6.4" fill="#14532d"/><path d="M128 22c2-4 6-6 9-4" stroke="#2f8a4a" stroke-width="2" fill="none"/></g>
    <circle cx="162" cy="46" r="14" fill="url(#snFace)"/>
    <path d="M146 50c0 20 8 30 16 30s16-10 16-30c-4 4-9 6-16 6s-12-2-16-6z" fill="url(#snFluff)"/>${curls(162, 60, 7, 15)}
    <path d="M150 52c4-3 8-3 12 1 4-4 8-4 12-1-3 5-8 6-12 3-4 3-9 2-12-3z" fill="#f4f6fa"/>
    <circle cx="162" cy="48" r="3.4" fill="#e99080"/><circle cx="152" cy="49" r="3.6" fill="#ff9b9b" opacity=".5"/><circle cx="172" cy="49" r="3.6" fill="#ff9b9b" opacity=".5"/>
    <circle cx="155" cy="42" r="4.2" fill="none" stroke="url(#snGold)" stroke-width="1.2"/><circle cx="169" cy="42" r="4.2" fill="none" stroke="url(#snGold)" stroke-width="1.2"/><path d="M159 42h6" stroke="url(#snGold)" stroke-width="1.2"/>
    <path d="M153 42q2-2 4 0M167 42q2-2 4 0" stroke="#3a2010" stroke-width="1.2" fill="none" stroke-linecap="round"/><path d="M151 36q4-3 8-1M165 35q4-2 8 1" stroke="#e8edf4" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M147 36c0-16 12-26 26-22 12 4 18 12 26 18l-6 6c-8-4-12-8-18-6z" fill="url(#snSuit)"/><path d="M152 26c8-6 18-6 26-2" stroke="#ff7a86" stroke-opacity=".5" stroke-width="2" fill="none"/>
    ${fluff([[148, 36], [154, 33], [161, 32], [168, 33], [174, 36]], 5.4)}
    <g>${rot([-14, 14, -14], 196, 34, 1.12)}<circle cx="201" cy="40" r="7" fill="url(#snFluff)"/></g>
    <!-- sleigh body: lacquer, gold scrollwork, runners -->
    <path d="M58 110h150c14 0 22 10 20 26l-4 16c-2 10-12 16-26 16H90c-24 0-38-14-38-36 0-12 2-22 6-22z" fill="url(#snLacquer)"/>
    <path d="M62 116h142c10 0 16 6 16 16" stroke="#ff9aa2" stroke-opacity=".55" stroke-width="2.4" fill="none"/>
    <path d="M70 150c10-14 24-14 30-2 6 10 18 10 22-2 6-16 24-16 30-2 6 12 18 12 24-2" stroke="url(#snGold)" stroke-width="3" fill="none"/>
    <path d="M80 140c-4-8 4-14 10-10M146 136c-4-8 4-14 10-10" stroke="url(#snGold)" stroke-width="2" fill="none"/>
    <circle cx="116" cy="138" r="7" fill="url(#snGold)"/><circle cx="116" cy="138" r="3.4" fill="#d4142a"/>
    <path d="M208 110c20-10 34 6 26 22-4 7-12 6-12-1" stroke="url(#snGold)" stroke-width="4" fill="none"/>
    <path d="M54 110h158" stroke="url(#snGold)" stroke-width="6" stroke-linecap="round"/><path d="M60 108h146" stroke="#fff" stroke-opacity=".5" stroke-width="1.4"/>
    <path d="M92 168v18M184 168v18" stroke="url(#snGoldV)" stroke-width="4"/>
    <path d="M44 188h160c26 0 38-14 34-32-2-8-10-10-14-4" stroke="url(#snGold)" stroke-width="6" fill="none" stroke-linecap="round"/>
    <path d="M48 186h150" stroke="#fff" stroke-opacity=".6" stroke-width="1.4"/>
  </g>
  ${deer(336, 72, 0, {rudolph:true})}${deer(226, 72, .28)}
  <ellipse cx="300" cy="196" rx="250" ry="5" fill="url(#snShadow)" opacity=".5"/>
</svg>`;
})();

const SPOOKY = (() => {
const st = s => s.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a != null ? ` stop-opacity="${a}"` : ''}/>`).join('');
const LG = (id, s, x1 = 0, y1 = 0, x2 = 0, y2 = 1) => `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${st(s)}</linearGradient>`;
const RG = (id, s, cx = .5, cy = .5, r = .5) => `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${st(s)}</radialGradient>`;
const rep = (d, b = 0) => ` dur="${d}s" begin="${b ? -b : 0}s" repeatCount="indefinite"`;
const ease = n => ` calcMode="spline" keySplines="${Array(n).fill('.45 0 .55 1').join(';')}"`;
const morph = (vals, d, b = 0) => `<animate attributeName="d" values="${vals.join(';')}"${rep(d, b)}${ease(vals.length - 1)}/>`;
const glints = (n, x0, x1, y0, y1, cols, seed) => Array.from({length: n}, (_, i) => { const x = (x0 + ((i * 37 + seed) % 100) / 100 * (x1 - x0)).toFixed(1), y = (y0 + ((i * 53 + seed) % 100) / 100 * (y1 - y0)).toFixed(1), r = (1.4 + (i % 4) * .8).toFixed(1);
  return `<path d="M${x} ${+y - r * 2}Q${+x + r * .3} ${+y - r * .3} ${+x + r * 2} ${y}Q${+x + r * .3} ${+y + r * .3} ${x} ${+y + r * 2}Q${+x - r * .3} ${+y + r * .3} ${+x - r * 2} ${y}Q${+x - r * .3} ${+y - r * .3} ${x} ${+y - r * 2}Z" fill="${cols[i % cols.length]}" opacity="0"><animate attributeName="opacity" values="0;1;0"${rep(1.3, (i * .11).toFixed(2))}/></path>`; }).join('');

/* ---- the witch ---- */
const hair = i => { const y = 40 + i * 4, a = `M150 ${y}c18 ${2 + i} 34 ${-6 + i * 2} 54 ${2 + i * 2}c8 3 14 8 18 14`, b = `M150 ${y}c18 ${-4 + i} 34 ${6 + i * 2} 54 ${-2 + i * 2}c8-3 14-6 20-2`;
  return `<path d="${a}" stroke="url(#wtHair)" stroke-width="${5 - i * .6}" stroke-linecap="round" fill="none">${morph([a, b, a], .7, i * .15)}</path>`; };
const cloakA = 'M156 58c30 2 66 14 96 34-8 4-14 10-18 18-10-6-22-6-32 2-8-6-18-8-28-4-8-6-18-8-28-6z', cloakB = 'M156 58c34-2 72 6 104 18-6 6-12 12-16 22-12-4-24 0-32 8-10-4-20-4-28 0-8-4-18-6-28-4z';
const witch = `<svg viewBox="0 -16 320 206" xmlns="http://www.w3.org/2000/svg"><defs>
  ${LG('wtCloak', [[0, '#5b2d86'], [.5, '#2a1240'], [1, '#12061e']])}${LG('wtLining', [[0, '#8b3dbf'], [1, '#3a145a']])}${LG('wtDress', [[0, '#3a1a5a'], [1, '#14061f']])}
  ${RG('wtSkin', [[0, '#c8ec9a'], [.7, '#8cc05c'], [1, '#5e8a36']], .4, .35)}${LG('wtHat', [[0, '#3a1c58'], [.5, '#1a0a2a'], [1, '#08020e']], 0, 0, 1, 0)}${LG('wtBand', [[0, '#ff9a3a'], [1, '#c2410c']])}
  ${LG('wtHair', [[0, '#ff9a3a'], [.5, '#e05a12'], [1, '#8a2a04']], 0, 0, 1, 0)}${LG('wtWood', [[0, '#b88048'], [.5, '#7a4a1e'], [1, '#3e220a']])}${LG('wtStraw', [[0, '#ffe08a'], [.5, '#e0a83a'], [1, '#8a5a14']], 0, 0, 1, 0)}
  ${LG('wtBuckle', [[0, '#fff2b0'], [1, '#b8860b']])}${RG('wtEye', [[0, '#fffbd0'], [.5, '#ffd400'], [1, '#c48a00']])}${RG('wtMagic', [[0, '#d0ff9a', .8], [1, '#7cff4a', 0]])}${RG('wtCatEye', [[0, '#fff6a0'], [.6, '#ffc400'], [1, '#a86a00']])}
  <pattern id="wtGrain" width="10" height="3" patternUnits="userSpaceOnUse"><path d="M0 1.5h6" stroke="#2a1404" stroke-width=".5" opacity=".5"/></pattern></defs>
  ${glints(22, 250, 318, 96, 150, ['#c9ff8a', '#e2b8ff', '#ffffff', '#8affd9'], 7)}<circle cx="290" cy="118" r="22" fill="url(#wtMagic)" opacity=".55"><animate attributeName="opacity" values=".55;.2;.55"${rep(1.3)}/></circle>
  <g><animateTransform attributeName="transform" type="translate" values="0 0;0 -6;0 0"${rep(1.6)}${ease(2)}/>
  <path d="${cloakA}" fill="url(#wtLining)" transform="translate(4 6)">${morph([cloakA, cloakB, cloakA], .9)}</path>
  <path d="${cloakA}" fill="url(#wtCloak)">${morph([cloakA, cloakB, cloakA], .9, .1)}</path>
  <path d="M170 66c20 8 40 18 58 30M176 60c24 4 46 12 64 22" stroke="#7a4aa8" stroke-opacity=".4" stroke-width="1.4" fill="none"/>
  ${[0, 1, 2, 3, 4].map(hair).join('')}
  <!-- the broom: grain, binding, straw -->
  <path d="M28 112l204-6" stroke="url(#wtWood)" stroke-width="7" stroke-linecap="round"/><path d="M28 112l204-6" stroke="url(#wtGrain)" stroke-width="7" stroke-linecap="round"/>
  <path d="M28 110l200-6" stroke="#fff" stroke-opacity=".25" stroke-width="1.6"/>
  <path d="M222 102l44-18c6 14 6 38 0 52l-44-14z" fill="url(#wtStraw)"/>
  ${Array.from({length: 16}, (_, i) => `<path d="M226 ${104 + i * .5}L${262 + (i % 4) * 3} ${84 + i * 3.4}" stroke="${i % 2 ? '#a8741e' : '#ffe9a8'}" stroke-width="${i % 3 ? .9 : 1.4}"/>`).join('')}
  <path d="M222 101v16M228 99v20" stroke="#5a2a08" stroke-width="3"/><path d="M222 104l6-1M222 110l6-1" stroke="#ffd27a" stroke-width="1"/>
  <!-- legs: striped stockings, buckled boots -->
  <path d="M134 108c-6 8-16 12-28 14" stroke="#1a0a28" stroke-width="10" stroke-linecap="round" fill="none"/>
  ${[0, 1, 2, 3].map(i => `<path d="M${132 - i * 7} ${110 + i * 3.4}l-4 4" stroke="#ff7a1a" stroke-width="3.4"/>`).join('')}
  <path d="M110 118c-8-1-16 2-22 8 6 3 16 3 24-2z" fill="#14081e"/><path d="M90 126c-4 0-7-3-6-6" stroke="#14081e" stroke-width="3" fill="none" stroke-linecap="round"/><rect x="100" y="117" width="6" height="5" fill="none" stroke="url(#wtBuckle)" stroke-width="1.4"/>
  <!-- dress, arms -->
  <path d="M128 112c-4-24 2-46 20-54 14-6 22 6 24 20l2 34z" fill="url(#wtDress)"/><path d="M140 66c-4 12-6 26-6 40M156 64c2 14 2 30 0 46" stroke="#5b2d86" stroke-opacity=".5" stroke-width="1.4" fill="none"/>
  <path d="M136 72c-8 10-12 22-14 34" stroke="url(#wtDress)" stroke-width="9" stroke-linecap="round" fill="none"/><path d="M120 106c-4 2-6 6-4 8 3 2 8 0 9-4z" fill="url(#wtSkin)"/>
  <path d="M160 74c-2 12-8 22-16 30" stroke="#2a1240" stroke-width="8" stroke-linecap="round" fill="none"/>
  <!-- head -->
  <path d="M130 44c0-11 8-17 17-15 8 2 12 10 11 18-1 11-9 16-17 14-8-1-11-8-11-17z" fill="url(#wtSkin)"/>
  <path d="M132 42l-15 6c-3 1-3 4 0 4l15 0z" fill="url(#wtSkin)"/><circle cx="121" cy="48" r="1.8" fill="#5e8a36"/><path d="M118 50c2 1 5 1 7 0" stroke="#4e7a2a" stroke-width="1" fill="none"/>
  <path d="M134 54c4 4 9 4 13 0" stroke="#3a1a2a" stroke-width="1.8" fill="none" stroke-linecap="round"/><path d="M136 55l1.4 2.4 1.4-2.4M143 55l1.2 2 1.2-2" fill="#fff"/>
  <ellipse cx="138" cy="38" rx="3.4" ry="3.8" fill="#fff"/><circle cx="137" cy="38.6" r="2.2" fill="url(#wtEye)"/><circle cx="136.6" cy="38.8" r="1.1" fill="#14081e"/><circle cx="137.4" cy="37.8" r=".6" fill="#fff"/>
  <path d="M133 33l8-2" stroke="#2a1a0a" stroke-width="1.6" stroke-linecap="round"/><path d="M134 36c2-1 5-1 7 0" stroke="#5e8a36" stroke-width="1" fill="none"/>
  <!-- hat: crumpled cone, band and buckle -->
  <ellipse cx="148" cy="30" rx="24" ry="5.6" fill="url(#wtHat)" transform="rotate(-8 148 30)"/>
  <path d="M136 29c4-14 14-26 32-30 6-2 12 3 18-1-2 8-10 10-16 11-6 4-10 10-12 20z" fill="url(#wtHat)">${morph(['M136 29c4-14 14-26 32-30 6-2 12 3 18-1-2 8-10 10-16 11-6 4-10 10-12 20z', 'M136 29c4-14 14-26 32-30 6-2 12 5 20 3-4 6-12 6-18 7-6 4-10 10-12 20z', 'M136 29c4-14 14-26 32-30 6-2 12 3 18-1-2 8-10 10-16 11-6 4-10 10-12 20z'], .8)}</path>
  <path d="M146 20c4-6 10-12 18-14" stroke="#5b2d86" stroke-opacity=".5" stroke-width="1.6" fill="none"/>
  <path d="M138 26c7-2 14-3 20-2" stroke="url(#wtBand)" stroke-width="4.4"/><rect x="144" y="21.6" width="7" height="7" rx="1" fill="none" stroke="url(#wtBuckle)" stroke-width="1.8"/>
  <!-- the cat -->
  <g><animateTransform attributeName="transform" type="translate" values="0 0;0 -2;0 0"${rep(.8, .3)}/>
    <path d="M196 102c-3-14 4-24 14-24s15 10 12 24z" fill="#120818"/><path d="M200 86c4-4 12-4 16 0" stroke="#3a2a4a" stroke-width="1.4" fill="none"/>
    <circle cx="206" cy="74" r="9.6" fill="#120818"/><path d="M198 70l-1-10 7 5zM212 64l6-5v10z" fill="#120818"/><path d="M199 67l0-4 3 2zM213 63l3-2v4z" fill="#ff8ab8"/>
    <ellipse cx="202.4" cy="74" rx="2.4" ry="3" fill="url(#wtCatEye)"/><ellipse cx="209.6" cy="74" rx="2.4" ry="3" fill="url(#wtCatEye)"/><path d="M202.4 71.6v4.8M209.6 71.6v4.8" stroke="#120818" stroke-width="1.1"/>
    <path d="M205 78.4l1 1 1-1" stroke="#ff8ab8" stroke-width="1"/><path d="M198 79l-6-1M198 80.6l-6 1M214 79l6-1M214 80.6l6 1" stroke="#9a8aa8" stroke-width=".5"/>
    <path d="M220 98c12 0 16-10 14-18" stroke="#120818" stroke-width="4" stroke-linecap="round" fill="none">${morph(['M220 98c12 0 16-10 14-18', 'M220 98c14 2 20-4 20-14', 'M220 98c12 0 16-10 14-18'], 1.4)}</path></g>
  </g></svg>`;

/* ---- bats: membranes with finger bones, furry bodies ---- */
const wingPts = {up:[[2, -2], [10, -18], [22, -24], [32, -18], [26, -12], [22, -4], [14, -6], [8, 0]], mid:[[2, -1], [12, -7], [24, -8], [34, -3], [27, 0], [21, 4], [14, 2], [8, 3]], down:[[2, 0], [12, 7], [22, 16], [28, 22], [22, 17], [17, 13], [11, 11], [6, 5]]};
const wing = (s, pose) => { const k = s === 'l' ? -1 : 1, q = wingPts[pose].map(([x, y]) => [x * k, y]);
  return `M${q[0]}C${q[1]} ${q[2]} ${q[3]}Q${q[4]} ${q[5]}Q${q[6]} ${q[7]}Z`.replace(/,/g, ' '); };
const bones = (s, pose) => { const k = s === 'l' ? -1 : 1, q = wingPts[pose].map(([x, y]) => [x * k, y]); return `M${2 * k} 0L${q[3]}M${2 * k} 0L${q[5]}M${2 * k} 0L${q[6]}`.replace(/,/g, ' '); };
const poses = ['up', 'mid', 'down', 'mid', 'up'];
const bat = (x, y, k, d, b) => `<g transform="translate(${x} ${y}) scale(${k})"><g><animateTransform attributeName="transform" type="translate" values="0 0;0 3;0 0"${rep(d * 2, b)}/>
  ${['l', 'r'].map(s => `<path d="${wing(s, 'up')}" fill="url(#btMem)">${morph(poses.map(p => wing(s, p)), d, b)}</path><path d="${bones(s, 'up')}" stroke="#0a0410" stroke-width=".9" fill="none" opacity=".8">${morph(poses.map(p => bones(s, p)), d, b)}</path>`).join('')}
  <ellipse rx="4.6" ry="6.4" fill="url(#btFur)"/><path d="M-2 -5l-1 9M2-5l1 9M0-6v11" stroke="#6b4a8a" stroke-width=".5" opacity=".6"/>
  <path d="M-3.6-4.4l-1.8-5.6 3.4 2.8zM3.6-4.4l1.8-5.6-3.4 2.8z" fill="#2a1438"/><path d="M-3.4-5.4l-.8-2.6 1.4 1.2zM3.4-5.4l.8-2.6-1.4 1.2z" fill="#a85a8a"/>
  <circle cx="-1.7" cy="-2" r="1.1" fill="#ff4d4d"/><circle cx="1.7" cy="-2" r="1.1" fill="#ff4d4d"/><circle cx="-1.4" cy="-2.3" r=".35" fill="#fff"/><circle cx="2" cy="-2.3" r=".35" fill="#fff"/>
  <path d="M-1.1 1.4l.5 1.4.5-1.4M.6 1.4l.5 1.4.5-1.4" fill="#fff"/></g></g>`;
const bats = `<svg viewBox="0 0 200 90" xmlns="http://www.w3.org/2000/svg"><defs>${LG('btMem', [[0, '#4a2466'], [.6, '#24103a'], [1, '#0e0418']])}${RG('btFur', [[0, '#5a3a72'], [.7, '#2a1440'], [1, '#12061e']], .4, .3)}</defs>
  ${bat(24, 40, 1.15, .34, 0)}${bat(70, 18, .85, .3, .1)}${bat(104, 58, 1, .36, .2)}${bat(150, 28, .8, .32, .05)}${bat(62, 72, .62, .28, .15)}${bat(186, 62, .72, .33, .25)}</svg>`;

/* ---- the ghost: layered, translucent, with a wispy tail ---- */
const tail = (k, w = 0) => `M18 36c0-20 12-32 26-32s26 12 26 32v22c-4 ${-4 + k} -8 ${6 - k} -12 ${1 + w}s-8 ${-5 + k} -12 ${1 + w}-8 ${6 - k} -12 ${1 + w}-8 ${-5 + k} -14 ${3 + w}z`;
const ghost = `<svg viewBox="0 0 90 84" xmlns="http://www.w3.org/2000/svg"><defs>${RG('ghBody', [[0, '#ffffff'], [.65, '#eef2ff'], [1, '#b9c6f5']], .38, .28)}${RG('ghGlow', [[0, '#dfe6ff', .75], [.6, '#c9d4ff', .25], [1, '#c9d4ff', 0]])}${RG('ghInner', [[0, '#ffffff', 0], [1, '#8a9ae0', .35]], .5, .4, .6)}${RG('ghEye', [[0, '#3a3a8a'], [1, '#0e0e3a']], .35, .3)}</defs>
  <ellipse cx="44" cy="42" rx="44" ry="38" fill="url(#ghGlow)"><animate attributeName="opacity" values="1;.6;1"${rep(2)}/></ellipse>
  <g><animateTransform attributeName="transform" type="translate" values="0 0;0 -4;0 0"${rep(1.4)}${ease(2)}/>
   <path d="${tail(0, 4)}" fill="#c9d4ff" opacity=".35" transform="translate(-3 6)">${morph([tail(0, 4), tail(8, 4), tail(0, 4)], .9, .3)}</path>
   <path d="${tail(0)}" fill="url(#ghBody)" opacity=".95">${morph([tail(0), tail(8), tail(0)], .9)}</path>
   <path d="${tail(0)}" fill="url(#ghInner)">${morph([tail(0), tail(8), tail(0)], .9)}</path>
   <path d="M24 22c4-10 12-14 20-14" stroke="#fff" stroke-width="3" stroke-linecap="round" fill="none" opacity=".9"/>
   <path d="M20 32c-9 4-13 11-13 17 6-2 11-6 13-11zM68 32c9 4 13 11 13 17-6-2-11-6-13-11z" fill="url(#ghBody)">${morph(['M20 32c-9 4-13 11-13 17 6-2 11-6 13-11zM68 32c9 4 13 11 13 17-6-2-11-6-13-11z', 'M20 32c-11 0-15 4-17 9 6 0 11-2 17-5zM68 32c11 0 15 4 17 9-6 0-11-2-17-5z', 'M20 32c-9 4-13 11-13 17 6-2 11-6 13-11zM68 32c9 4 13 11 13 17-6-2-11-6-13-11z'], 1.2)}</path>
   <ellipse cx="36" cy="30" rx="4.6" ry="6.2" fill="url(#ghEye)"/><ellipse cx="52" cy="30" rx="4.6" ry="6.2" fill="url(#ghEye)"/><circle cx="37.6" cy="27.6" r="1.7" fill="#fff"/><circle cx="53.6" cy="27.6" r="1.7" fill="#fff"/><circle cx="35" cy="32.6" r=".8" fill="#fff" opacity=".7"/><circle cx="51" cy="32.6" r=".8" fill="#fff" opacity=".7"/>
   <path d="M31 22q5-3 9 0M48 22q5-3 9 0" stroke="#8a9ae0" stroke-width="1.2" fill="none" stroke-linecap="round"/>
   <ellipse cx="44" cy="42" rx="4.2" ry="5.2" fill="url(#ghEye)"><animate attributeName="ry" values="5.2;3;5.2"${rep(1.4)}/></ellipse>
   <ellipse cx="29" cy="37" rx="3.6" ry="2.2" fill="#ffb3c7" opacity=".6"/><ellipse cx="59" cy="37" rx="3.6" ry="2.2" fill="#ffb3c7" opacity=".6"/></g>
  ${glints(6, 4, 86, 6, 78, ['#ffffff', '#dfe6ff'], 3)}</svg>`;
return {witch, bats, ghost, _sheet: `<svg viewBox="0 0 640 200" xmlns="http://www.w3.org/2000/svg"><g transform="translate(0 0)">${witch.replace('<svg ', '<svg x="0" y="0" width="320" height="190" ')}</g><g>${bats.replace('<svg ', '<svg x="330" y="0" width="200" height="90" ')}</g><g>${ghost.replace('<svg ', '<svg x="540" y="0" width="90" height="84" ')}</g></svg>`};
})();
const SWEET = (() => {
const st = s => s.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a != null ? ` stop-opacity="${a}"` : ''}/>`).join('');
const LG = (id, s, x1 = 0, y1 = 0, x2 = 0, y2 = 1) => `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${st(s)}</linearGradient>`;
const RG = (id, s, cx = .5, cy = .5, r = .5) => `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${st(s)}</radialGradient>`;
const rep = (d, b = 0) => ` dur="${d}s" begin="${b ? -b : 0}s" repeatCount="indefinite"`;
const ease = n => ` calcMode="spline" keySplines="${Array(n).fill('.45 0 .55 1').join(';')}"`;
const morph = (vals, d, b = 0) => `<animate attributeName="d" values="${vals.join(';')}"${rep(d, b)}${ease(vals.length - 1)}/>`;

/* ---- Cupid: curly hair, feathered wings, bow drawn ---- */
const feathers = (up) => Array.from({length: 7}, (_, i) => { const a = (up ? -150 : -200) + i * (up ? 14 : 20), r = 30 + i * 3, x = (r * Math.cos(a * Math.PI / 180)).toFixed(1), y = (r * Math.sin(a * Math.PI / 180) * .8).toFixed(1);
  return `M0 0Q${(x * .5 + 4).toFixed(1)} ${(y * .5 - 6).toFixed(1)} ${x} ${y}Q${(x * .6 - 2).toFixed(1)} ${(y * .6 + 6).toFixed(1)} 0 4`; });
const wingSet = up => feathers(up).join('');
const cupid = `<svg viewBox="0 0 150 120" xmlns="http://www.w3.org/2000/svg"><defs>${RG('cpSkin', [[0, '#ffe8dc'], [.7, '#f6c3a6'], [1, '#e09a7c']], .4, .35)}${LG('cpWing', [[0, '#ffffff'], [.7, '#e4ecff'], [1, '#b9c8ee']])}
  ${LG('cpHair', [[0, '#fff0a0'], [.5, '#f2c14e'], [1, '#b8860b']])}${LG('cpBow', [[0, '#fff2b0'], [.5, '#e8b730'], [1, '#8a5a08']], 0, 0, 1, 0)}${RG('cpHeart', [[0, '#ffc2d1'], [.55, '#ff3d6e'], [1, '#a3123f']], .35, .3)}${LG('cpSash', [[0, '#ffffff'], [1, '#ffd1dc']])}</defs>
  ${Array.from({length: 8}, (_, i) => `<path d="M${10 + i * 4} ${40 + (i % 3) * 14}c-6-6-10 2 0 6 10-4 6-12 0-6z" fill="${i % 2 ? '#ff8fb1' : '#ffd1dc'}" opacity="0"><animate attributeName="opacity" values="0;1;0"${rep(1.4, i * .17)}/></path>`).join('')}
  <g><animateTransform attributeName="transform" type="translate" values="0 0;0 -5;0 0"${rep(1.3)}${ease(2)}/>
   <g transform="translate(62 48)"><path d="${wingSet(true)}" fill="url(#cpWing)" stroke="#b9c8ee" stroke-width=".7">${morph([wingSet(true), wingSet(false), wingSet(true)], .5)}</path></g>
   <path d="M48 64c0-12 8-18 18-18s18 6 18 18c0 14-7 22-18 22s-18-8-18-22z" fill="url(#cpSkin)"/>
   <path d="M50 68c8 6 26 6 32-2-2 12-9 17-16 17s-14-5-16-15z" fill="url(#cpSash)"/><path d="M52 66l30-8" stroke="#ff8fb1" stroke-width="3.4"/>
   <path d="M54 84c-4 6-4 13 0 18M70 84c3 6 7 11 12 13" stroke="url(#cpSkin)" stroke-width="8" stroke-linecap="round" fill="none"/>
   <circle cx="66" cy="32" r="15" fill="url(#cpSkin)"/>
   ${[[52, 24], [57, 18], [65, 15], [73, 17], [79, 23], [54, 32], [80, 30]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5.4" fill="url(#cpHair)"/><path d="M${x - 2} ${y - 1}a2.4 2.4 0 1 1 3 2" stroke="#b8860b" stroke-width=".9" fill="none"/>`).join('')}
   <ellipse cx="71" cy="33" rx="2.2" ry="2.6" fill="#3a1a0a"/><circle cx="71.8" cy="32" r=".8" fill="#fff"/><path d="M68 29q3-2 6 0" stroke="#b8860b" stroke-width="1" fill="none"/>
   <path d="M68 40q3 2.4 6 0" stroke="#c2410c" stroke-width="1.4" fill="none" stroke-linecap="round"/><circle cx="76" cy="37" r="3" fill="#ff8fa3" opacity=".55"/><path d="M58 34c-1 2-1 4 0 5" stroke="#e09a7c" stroke-width="1.2" fill="none"/>
   <path d="M80 54c8 2 16 2 22-2" stroke="url(#cpSkin)" stroke-width="7" stroke-linecap="round" fill="none"/>
   <path d="M102 26c16 12 16 38 0 50" stroke="url(#cpBow)" stroke-width="3.4" fill="none"/><path d="M102 26L88 52 102 76" stroke="#fff" stroke-width=".8" fill="none"/>
   <path d="M88 52h50" stroke="#8a5a2b" stroke-width="2.2"/><path d="M138 52c-8-8-16-4-10 4 4 4 8 4 10-4z" fill="url(#cpHeart)"/><path d="M92 47l-6 5 6 5M96 47l-6 5 6 5" stroke="#ff8fb1" stroke-width="2" fill="none"/>
  </g></svg>`;
const heart = `<svg viewBox="-16 -16 32 32" xmlns="http://www.w3.org/2000/svg"><defs>${RG('htFill', [[0, '#ffd0dc'], [.5, '#ff3d6e'], [.85, '#c2185b'], [1, '#7a0a30']], .35, .3)}${LG('htRim', [[0, '#fff', 0], [1, '#fff', .6]])}</defs>
  <path d="M0 11C-18 0-12-14 0-6 12-14 18 0 0 11z" fill="url(#htFill)"/><path d="M-9-7c-3 1-5 4-4 8" stroke="#fff" stroke-width="2" stroke-linecap="round" fill="none" opacity=".75"/><ellipse cx="-6" cy="-5" rx="3" ry="1.6" fill="#fff" opacity=".85" transform="rotate(-30 -6 -5)"/>
  <path d="M6 6c3-2 5-5 5-8" stroke="url(#htRim)" stroke-width="1.4" fill="none"/></svg>`;

/* ---- the Easter bunny with a basket of painted eggs ---- */
const fur = (cx, cy, rx, ry, n, col) => Array.from({length: n}, (_, i) => { const a = i / n * Math.PI * 2, x = cx + rx * Math.cos(a), y = cy + ry * Math.sin(a); return `<path d="M${x.toFixed(1)} ${y.toFixed(1)}q${(1.6 * Math.cos(a) - .8 * Math.sin(a)).toFixed(1)} ${(1.6 * Math.sin(a) + .8 * Math.cos(a)).toFixed(1)} ${(1.2 * Math.cos(a)).toFixed(1)} ${(1.6 * Math.sin(a)).toFixed(1)}" stroke="${col}" stroke-width="1.4" stroke-linecap="round" fill="none" opacity=".8"/>`; }).join('');
const ear = k => `M0 0C-5-12-5-26 0-36c5 ${10 - k} 5 ${24 - k} 0 36z`;
const egg = (x, y, c1, c2, pat, r = 0) => `<g transform="translate(${x} ${y}) rotate(${r})"><ellipse rx="5" ry="6.6" fill="${c1}"/>${pat === 'zig' ? `<path d="M-4.8 0l2.4-2 2.4 2 2.4-2 2.4 2" stroke="${c2}" stroke-width="1.3" fill="none"/>` : pat === 'dots' ? `<circle cx="-1.6" cy="-2.4" r="1.1" fill="${c2}"/><circle cx="2" cy="1" r="1.1" fill="${c2}"/><circle cx="-1" cy="3.4" r="1" fill="${c2}"/>` : `<path d="M-4.8-1h9.6M-4.4 2.6h8.8" stroke="${c2}" stroke-width="1.5"/>`}<ellipse cx="-1.8" cy="-3" rx="1.3" ry="2.2" fill="#fff" opacity=".55"/><ellipse rx="5" ry="6.6" fill="url(#ebEggShade)"/></g>`;
const bunny = `<svg viewBox="0 0 100 90" xmlns="http://www.w3.org/2000/svg"><defs>${RG('ebFur', [[0, '#ffffff'], [.7, '#f1eef8'], [1, '#c9c0de']], .4, .3)}${LG('ebInner', [[0, '#ffc2d6'], [1, '#ff8fb8']])}${LG('ebBasket', [[0, '#e0a866'], [.6, '#a86a2a'], [1, '#6a3a12']])}
  ${RG('ebEggShade', [[0, '#fff', 0], [.7, '#000', 0], [1, '#000', .25]], .4, .35)}${RG('ebEye', [[0, '#7a4a2a'], [.6, '#2a1404'], [1, '#000']], .4, .35)}
  <pattern id="ebWeave" width="6" height="5" patternUnits="userSpaceOnUse"><path d="M0 2.5h6" stroke="#6a3a12" stroke-width=".8"/><path d="M3 0v2.5M0 2.5v2.5M6 2.5v2.5" stroke="#6a3a12" stroke-width=".6"/></pattern></defs>
  <ellipse cx="44" cy="84" rx="30" ry="4" fill="#000" opacity=".15"/>
  <g><animateTransform attributeName="transform" type="rotate" values="-6 44 78;4 44 78;-6 44 78"${rep(.55)}/>
   <ellipse cx="38" cy="56" rx="22" ry="17" fill="url(#ebFur)"/>${fur(38, 56, 22, 17, 30, '#f4f1fa')}
   <circle cx="16" cy="52" r="8" fill="#fff"/>${fur(16, 52, 8, 8, 12, '#e6e0f2')}
   <ellipse cx="26" cy="71" rx="10" ry="4.4" fill="url(#ebFur)"/>
   <circle cx="60" cy="40" r="14" fill="url(#ebFur)"/>${fur(60, 40, 14, 14, 18, '#ddd6ec')}
   <g transform="translate(56 29)"><path d="${ear(0)}" fill="url(#ebFur)" transform="rotate(-14)">${morph([ear(0), ear(-10), ear(0)], .55)}</path><path d="M0-5c-2-7-2-20 0-26 2 6 2 19 0 26z" fill="url(#ebInner)" transform="rotate(-14)"/></g>
   <g transform="translate(65 28)"><path d="${ear(0)}" fill="url(#ebFur)" transform="rotate(16)">${morph([ear(0), ear(8), ear(0)], .55, .1)}</path><path d="M0-5c-2-7-2-20 0-26 2 6 2 19 0 26z" fill="url(#ebInner)" transform="rotate(16)"/></g>
   <ellipse cx="66" cy="38" rx="2.8" ry="3.2" fill="url(#ebEye)"/><circle cx="67" cy="37" r="1" fill="#fff"/><path d="M63 34.6q3-1.8 6 0" stroke="#b9b0d0" stroke-width=".8" fill="none"/>
   <path d="M72 43c1.4 0 2.4 1 1.6 2.2l-1.6 1.2-1.6-1.2c-.8-1.2.2-2.2 1.6-2.2z" fill="#ff8fb8"/><path d="M72 46.4v2M72 48.4c-1 1-2.4 1-3 0M72 48.4c1 1 2.4 1 3 0" stroke="#b07a9a" stroke-width=".8" fill="none"/>
   <path d="M73 46l9-2M73 47l10 1M72 48l8 3" stroke="#a8a0c0" stroke-width=".6"/><circle cx="62" cy="45" r="3" fill="#ffb3c7" opacity=".45"/>
   <path d="M48 62c4 6 4 11 2 15" stroke="url(#ebFur)" stroke-width="7" stroke-linecap="round" fill="none"/>
   <path d="M40 62c0 12 7 18 18 18s18-6 18-18z" fill="url(#ebBasket)"/><path d="M40 62c0 12 7 18 18 18s18-6 18-18z" fill="url(#ebWeave)" opacity=".7"/>
   <path d="M42 62c2-16 30-16 32 0" stroke="#8a5222" stroke-width="2.6" fill="none"/><path d="M40 62h36" stroke="#6a3a12" stroke-width="2"/>
   ${egg(47, 58, '#ff9ec7', '#ffffff', 'zig', -12)}${egg(56, 56, '#8fd3ff', '#2563eb', 'dots', 8)}${egg(65, 58, '#ffe066', '#f97316', 'stripe', 16)}
   <path d="M44 62c4-3 10-3 14 0" stroke="#7fbf62" stroke-width="2" fill="none"/></g></svg>`;

/* ---- butterflies: a monarch and a blue morpho, veined wings ---- */
const bwTop = k => `M0-1C${-4 * k}-20 ${-30 * k}-30 ${-34 * k}-16C${-36 * k}-4 ${-18 * k} 3 0 0z`, bwBot = k => `M0 0C${-14 * k} 2 ${-26 * k} 14 ${-21 * k} 23C${-14 * k} 30 ${-2 * k} 16 0 0z`;
const veins = k => `M0 0L${-30 * k}-17M0 0L${-24 * k}-24M0 0L${-33 * k}-8M0 0L${-20 * k} 20M0 0L${-12 * k} 24`;
const butterfly = (id, base, light, vein, spots) => `<svg viewBox="-38 -34 76 68" xmlns="http://www.w3.org/2000/svg"><defs>${RG(id + 'W', [[0, light], [.65, base], [1, vein]], .25, .5, .8)}${LG(id + 'Body', [[0, '#3a2a1a'], [1, '#0a0602']])}</defs>
  ${['l', 'r'].map(s => { const k = s === 'l' ? 1 : -1, sq = k * .15;
    const flap = (fn) => `<animate attributeName="d" values="${fn(k)};${fn(sq)};${fn(k)}"${rep(.32)}/>`;
    return `<path d="${bwTop(k)}" fill="url(#${id}W)" stroke="${vein}" stroke-width="2">${flap(bwTop)}</path><path d="${bwBot(k)}" fill="url(#${id}W)" stroke="${vein}" stroke-width="2">${flap(bwBot)}</path>
      <path d="${veins(k)}" stroke="${vein}" stroke-width=".9" fill="none" opacity=".85">${flap(veins)}</path>
      ${spots.map(([x, y, r]) => `<circle cx="${x * k}" cy="${y}" r="${r}" fill="#fff"><animate attributeName="cx" values="${x * k};${x * sq};${x * k}"${rep(.32)}/></circle>`).join('')}`; }).join('')}
  <ellipse rx="2.2" ry="11" fill="url(#${id}Body)"/><circle cy="-11" r="2.6" fill="url(#${id}Body)"/><path d="M-1-12c-2-4-4-7-7-8M1-12c2-4 4-7 7-8" stroke="#1a1208" stroke-width=".9" fill="none"/><circle cx="-8" cy="-20" r="1" fill="#1a1208"/><circle cx="8" cy="-20" r="1" fill="#1a1208"/></svg>`;
const monarch = butterfly('mo', '#ff8a1f', '#ffd59e', '#1a0a02', [[-30, -14, 1.3], [-27, -9, 1.1], [-32, -19, 1], [-20, 20, 1.1], [-15, 23, 1]]);
const morpho = butterfly('mp', '#2563eb', '#b8e6ff', '#081a40', [[-30, -12, 1.2], [-26, -20, 1], [-18, 21, 1]]);

/* ---- a fuzzy bumblebee with veined, blurring wings ---- */
const fuzz = (cx, cy, rx, ry, n, col) => Array.from({length: n}, (_, i) => { const a = i / n * Math.PI * 2; return `<path d="M${(cx + rx * Math.cos(a)).toFixed(1)} ${(cy + ry * Math.sin(a)).toFixed(1)}l${(1.8 * Math.cos(a)).toFixed(1)} ${(1.8 * Math.sin(a)).toFixed(1)}" stroke="${col}" stroke-width="1" stroke-linecap="round"/>`; }).join('');
const bee = `<svg viewBox="-20 -18 40 34" xmlns="http://www.w3.org/2000/svg"><defs>${RG('beBody', [[0, '#fff3a0'], [.55, '#ffc61a'], [1, '#b87a00']], .4, .35)}${RG('beWing', [[0, '#ffffff', .9], [1, '#cfe8ff', .4]])}</defs>
  <g><ellipse cx="-2" cy="-9" rx="7" ry="4.4" fill="url(#beWing)" stroke="#9ab8d6" stroke-width=".4"><animate attributeName="ry" values="4.4;1;4.4"${rep(.08)}/></ellipse><ellipse cx="4" cy="-9" rx="7" ry="4.4" fill="url(#beWing)" stroke="#9ab8d6" stroke-width=".4"><animate attributeName="ry" values="1;4.4;1"${rep(.08)}/></ellipse></g>
  <ellipse rx="11" ry="7.6" fill="url(#beBody)"/>${fuzz(0, 0, 11, 7.6, 34, '#e0a000')}<path d="M-4.6-7.2c1 5 1 10 0 14.4M.4-7.6c1 5 1 10 0 15.2M5.4-6c.8 4 .8 8 0 12" stroke="#1a1208" stroke-width="2.6" fill="none"/>
  <path d="M-11 0l-3.4 0" stroke="#1a1208" stroke-width="1.6" stroke-linecap="round"/><circle cx="10" cy="-1" r="4" fill="#1a1208"/><circle cx="11.2" cy="-2.2" r="1.1" fill="#fff"/><path d="M11-4.4l3-5M12-4.4l5-3" stroke="#1a1208" stroke-width=".8"/>
  <ellipse cx="-3" cy="-4" rx="5" ry="1.8" fill="#fff" opacity=".35"/></svg>`;
return {cupid, heart, bunny, monarch, morpho, bee};
})();
// a rainbow to a pot of gold, a crescent moon with stars, a polished dreidel
const NATURE = (() => {
const st = s => s.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a != null ? ` stop-opacity="${a}"` : ''}/>`).join('');
const LG = (id, s, x1 = 0, y1 = 0, x2 = 0, y2 = 1) => `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${st(s)}</linearGradient>`;
const RG = (id, s, cx = .5, cy = .5, r = .5) => `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${st(s)}</radialGradient>`;
const rep = (d, b = 0) => ` dur="${d}s" begin="${b ? -b : 0}s" repeatCount="indefinite"`;
const ease = n => ` calcMode="spline" keySplines="${Array(n).fill('.45 0 .55 1').join(';')}"`;
const morph = (vals, d, b = 0) => `<animate attributeName="d" values="${vals.join(';')}"${rep(d, b)}${ease(vals.length - 1)}/>`;
const P5 = ['up', 'mid', 'down', 'mid', 'up'];

/* ---- Canada geese in a V ---- */
const gW = {up:'M0 0C-4-10-14-20-28-22c6 4 10 10 14 18-2 0-6 0-8 2 8 0 14 2 22 2z', mid:'M0 0C-8-3-18-3-30 0c6 2 12 3 16 4-2 1-4 2-6 4 8-2 14-4 20-8z', down:'M0 0C-4 6-12 14-22 20c4-6 8-10 10-14-2 0-4-1-6-2 6-1 12-2 18-4z'};
const goose = (x, y, k, b) => `<g transform="translate(${x} ${y}) scale(${k})"><g><animateTransform attributeName="transform" type="translate" values="0 0;0 2;0 0"${rep(1, b)}/>
  <path d="${gW.up}" fill="url(#gsWingFar)" transform="translate(2 -2)">${morph(P5.map(p => gW[p]), .5, b + .05)}</path>
  <path d="M-18 2c4-7 20-9 32-4 4 2 4 6 0 8-10 5-26 4-32-4z" fill="url(#gsBody)"/><path d="M-12 6c8 3 18 3 24-1" stroke="#f3eadf" stroke-width="2.4" opacity=".7"/>
  <path d="M-16 0c6-2 12-2 16 0M-12 3c6-1 10-1 14 0" stroke="#5a4a36" stroke-width=".7" opacity=".7" fill="none"/>
  <path d="M12-1c4-2 8-3 12-6" stroke="#141414" stroke-width="3.6" stroke-linecap="round"/><ellipse cx="26" cy="-7.4" rx="4" ry="3" fill="#141414"/><path d="M29-7.6l5 .8-5 1.4z" fill="#141414"/>
  <path d="M23-6c1 2 3 2.6 5 1.6" stroke="#fff" stroke-width="1.6" fill="none"/><circle cx="27" cy="-8.4" r=".7" fill="#fff"/>
  <path d="${gW.up}" fill="url(#gsWing)" transform="translate(4 -1)">${morph(P5.map(p => gW[p]), .5, b)}</path>
  <path d="M-18 2l-6-2 1 5z" fill="#141414"/><path d="M-20 3l-4 1" stroke="#fff" stroke-width=".8"/></g></g>`;
const geese = `<svg viewBox="0 0 180 90" xmlns="http://www.w3.org/2000/svg"><defs>${LG('gsBody', [[0, '#b6a68f'], [.6, '#8a7660'], [1, '#5a4a36']])}${LG('gsWing', [[0, '#9a8a74'], [.6, '#6a5a46'], [1, '#3a2e22']])}${LG('gsWingFar', [[0, '#6a5a46'], [1, '#2a2018']])}</defs>
  ${goose(150, 16, 1, 0)}${goose(122, 30, .92, .15)}${goose(94, 44, .86, .3)}${goose(122, 58, .82, .1)}${goose(80, 70, .76, .25)}</svg>`;

/* ---- a penguin sliding on its belly, snow spraying ---- */
const penguin = `<svg viewBox="0 0 120 56" xmlns="http://www.w3.org/2000/svg"><defs>${LG('pgBack', [[0, '#4a5466'], [.5, '#1a212c'], [1, '#05070a']])}${LG('pgBelly', [[0, '#ffffff'], [.7, '#eef3f9'], [1, '#c9d4e2']])}${LG('pgGold', [[0, '#fff2b0'], [1, '#f59e0b']], 0, 0, 1, 0)}</defs>
  ${Array.from({length: 12}, (_, i) => `<circle cx="${8 + (i * 7) % 28}" cy="${32 + (i * 5) % 18}" r="${1.2 + (i % 3) * .7}" fill="#eef6ff" opacity="0"><animate attributeName="opacity" values="0;1;0"${rep(.6, i * .05)}/><animateTransform attributeName="transform" type="translate" values="0 0;-10 -6"${rep(.6, i * .05)}/></circle>`).join('')}
  <path d="M30 46h70" stroke="#cfe3ff" stroke-width="3" stroke-linecap="round" opacity=".6"/>
  <g><animateTransform attributeName="transform" type="translate" values="0 0;0 -1.4;0 0"${rep(.3)}/>
   <path d="M26 38c4-13 26-20 54-18 15 1 28 7 30 13 1 4-2 8-9 9H34c-6 0-10-2-8-4z" fill="url(#pgBack)"/>
   <path d="M36 42c9-7 28-11 47-9 9 1 15 4 17 9H38z" fill="url(#pgBelly)"/>
   <path d="M86 28c4 2 8 6 10 10" stroke="url(#pgGold)" stroke-width="4" stroke-linecap="round" fill="none" opacity=".9"/>
   <ellipse cx="97" cy="28" rx="2.6" ry="2.4" fill="#fff"/><circle cx="97.6" cy="27.8" r="1.3" fill="#05070a"/><circle cx="98" cy="27.3" r=".4" fill="#fff"/>
   <path d="M104 30l11 2-11 3z" fill="url(#pgGold)"/><path d="M104 32.6l10-.4" stroke="#7a3a00" stroke-width=".6"/>
   <path d="M60 22c-6-9-15-12-22-10 6 3 12 8 17 12z" fill="url(#pgBack)">${morph(['M60 22c-6-9-15-12-22-10 6 3 12 8 17 12z', 'M60 22c-7-5-16-5-24-1 7 0 13 2 19 4z', 'M60 22c-6-9-15-12-22-10 6 3 12 8 17 12z'], .4)}</path>
   <path d="M40 30c10-6 26-9 40-8" stroke="#fff" stroke-opacity=".18" stroke-width="2" fill="none"/>
   <path d="M26 38l-9-4 2 6zM28 41l-9 2 6 3z" fill="#ff8a1f"/></g></svg>`;

/* ---- a snowy owl: layered feathers, gold eyes ---- */
const owlWing = (k, pose) => { const up = `M60 34C${60 + k * 12} 12 ${60 + k * 34} 6 ${60 + k * 48} 14c${-k * 6} 1 ${-k * 9} 4 ${-k * 10} 8 ${k * 4} 0 ${k * 6} 2 ${k * 6} 5 ${-k * 8} 0 ${-k * 14} 3 ${-k * 18} 9z`,
  dn = `M60 34C${60 + k * 14} 38 ${60 + k * 34} 48 ${60 + k * 46} 58c${-k * 7} -3 ${-k * 11} -2 ${-k * 13} 0 ${k * 2} -4 ${k * 2} -7 ${k * 1} -9 ${-k * 9} -1 ${-k * 16} -3 ${-k * 22} -6z`; return pose === 'up' ? up : dn; };
const owl = `<svg viewBox="0 0 120 76" xmlns="http://www.w3.org/2000/svg"><defs>${RG('owBody', [[0, '#ffffff'], [.75, '#eef2f7'], [1, '#c3cedb']], .4, .3)}${RG('owEye', [[0, '#fff3a0'], [.5, '#ffc400'], [1, '#a86a00']])}<pattern id="owSpots" width="7" height="6" patternUnits="userSpaceOnUse"><path d="M1 4q2-2 4 0" stroke="#7a8696" stroke-width=".9" fill="none"/></pattern></defs>
  <g><animateTransform attributeName="transform" type="translate" values="0 0;0 -4;0 0"${rep(.9)}/>
   ${[-1, 1].map(k => `<path d="${owlWing(k, 'up')}" fill="url(#owBody)" stroke="#b7c3d2" stroke-width=".8">${morph([owlWing(k, 'up'), owlWing(k, 'dn'), owlWing(k, 'up')], .9)}</path><path d="${owlWing(k, 'up')}" fill="url(#owSpots)" opacity=".7">${morph([owlWing(k, 'up'), owlWing(k, 'dn'), owlWing(k, 'up')], .9)}</path>`).join('')}
   <ellipse cx="60" cy="42" rx="14" ry="17" fill="url(#owBody)"/><ellipse cx="60" cy="44" rx="13" ry="15" fill="url(#owSpots)" opacity=".6"/>
   <circle cx="60" cy="26" r="12" fill="url(#owBody)"/><path d="M50 22c4-4 16-4 20 0" stroke="#d6dde6" stroke-width="2" fill="none"/>
   <circle cx="55" cy="25" r="4" fill="url(#owEye)"/><circle cx="65" cy="25" r="4" fill="url(#owEye)"/><circle cx="55" cy="25" r="2" fill="#0a0a0a"/><circle cx="65" cy="25" r="2" fill="#0a0a0a"/><circle cx="55.8" cy="24.2" r=".8" fill="#fff"/><circle cx="65.8" cy="24.2" r=".8" fill="#fff"/>
   <path d="M51 21l6 2M69 21l-6 2" stroke="#9aa6b6" stroke-width="1" stroke-linecap="round"/><path d="M58.6 28.4l1.4 3 1.4-3z" fill="#2a2f3a"/>
   <path d="M54 58l-2 6M58 59v6M62 59v6M66 58l2 6" stroke="#3a3f4a" stroke-width="1.2" stroke-linecap="round"/></g></svg>`;

/* ---- herring gulls ---- */
const glW = (s, pose) => { const k = s === 'l' ? -1 : 1, y = {up:-18, mid:-3, down:11}[pose];
  return `M0 0Q${9 * k} ${y * .7} ${19 * k} ${y}Q${25 * k} ${y + 1} ${30 * k} ${y + 5}Q${20 * k} ${y + 5} ${11 * k} 4z`; };
const gull = (x, y, k, d, b) => `<g transform="translate(${x} ${y}) scale(${k})"><g><animateTransform attributeName="transform" type="translate" values="0 0;0 3;0 0"${rep(d * 2, b)}/>
  ${['l', 'r'].map(s => `<path d="${glW(s, 'up')}" fill="url(#glWing)">${morph(P5.map(p => glW(s, p)), d, b)}</path>`).join('')}
  <ellipse cx="0" cy="2" rx="13" ry="5.4" fill="url(#glBody)"/><path d="M-10 4c6 2 14 2 20 0" stroke="#d7dde6" stroke-width="1.4" fill="none"/>
  <circle cx="11" cy="0" r="4.4" fill="url(#glBody)"/><circle cx="12.4" cy="-.8" r="1" fill="#1a1a1a"/><circle cx="12.6" cy="-1" r=".3" fill="#fff"/>
  <path d="M14.6 0l7 1.4-7 1.6z" fill="#ffc61a"/><circle cx="20" cy="1.6" r=".8" fill="#e5484d"/><path d="M-13 2l-6-2 1 5z" fill="#cfd6df"/><path d="M-19 0l2 2" stroke="#1f2937" stroke-width="1"/></g></g>`;
const gulls = `<svg viewBox="0 0 170 74" xmlns="http://www.w3.org/2000/svg"><defs>${LG('glWing', [[0, '#f8fafc'], [.62, '#c3cbd6'], [.9, '#1f2937'], [1, '#0a0e14']], 0, 0, 1, 0)}${LG('glBody', [[0, '#ffffff'], [1, '#d3dae4']])}</defs>
  ${gull(42, 38, 1.15, .5, 0)}${gull(100, 20, .9, .46, .2)}${gull(138, 50, .74, .52, .1)}</svg>`;

/* ---- a vinyl beach ball ---- */
const beachBall = `<svg viewBox="-24 -24 48 48" xmlns="http://www.w3.org/2000/svg"><defs>${RG('bhShade', [[0, '#fff', 0], [.6, '#000', 0], [.9, '#000', .2], [1, '#000', .45]], .38, .3, .75)}${RG('bhSpec', [[0, '#fff', .95], [1, '#fff', 0]])}<clipPath id="bhClip"><circle r="20"/></clipPath></defs>
  <g clip-path="url(#bhClip)"><g><animateTransform attributeName="transform" type="rotate" values="0;360"${rep(1.1)}/><circle r="20" fill="#ffffff"/>
   ${['#ef4444', '#fbbf24', '#3b82f6'].map((c, i) => { const a1 = i * 2.094, a2 = a1 + 1.047; return `<path d="M0 0L${(22 * Math.cos(a1)).toFixed(1)} ${(22 * Math.sin(a1)).toFixed(1)}A22 22 0 0 1 ${(22 * Math.cos(a2)).toFixed(1)} ${(22 * Math.sin(a2)).toFixed(1)}z" fill="${c}"/>`; }).join('')}
   ${Array.from({length: 6}, (_, i) => `<path d="M0 0L${(22 * Math.cos(i * 1.047)).toFixed(1)} ${(22 * Math.sin(i * 1.047)).toFixed(1)}" stroke="#000" stroke-opacity=".15" stroke-width=".6"/>`).join('')}<circle r="3.6" fill="#f4f4f4" stroke="#bbb" stroke-width=".5"/></g></g>
  <circle r="20" fill="url(#bhShade)"/><ellipse cx="-7" cy="-9" rx="7" ry="4" fill="url(#bhSpec)" transform="rotate(-30 -7 -9)"/><circle r="20" fill="none" stroke="#0b4a55" stroke-opacity=".5" stroke-width=".8"/></svg>`;

/* ---- a rainbow drawn across the sky to a pot of gold between fluffy clouds ---- */
const cloud = (x, y, k) => `<g transform="translate(${x} ${y}) scale(${k})">${[[-14, 4, 10], [0, -4, 14], [14, 2, 11], [26, 6, 8], [-24, 8, 7]].map(([cx, cy, r]) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#rbCloud)"/>`).join('')}<path d="M-30 12h62" stroke="#c9d4e2" stroke-width="4" stroke-linecap="round" opacity=".6"/></g>`;
const rainbow = `<svg viewBox="0 0 220 124" xmlns="http://www.w3.org/2000/svg"><defs>${RG('rbCloud', [[0, '#ffffff'], [.75, '#f1f4fa'], [1, '#c9d4e2']], .4, .3)}${LG('rbGold', [[0, '#fff2b0'], [.5, '#f2c14e'], [1, '#a8740c']])}${LG('rbPot', [[0, '#4a4a4a'], [.5, '#1a1a1a'], [1, '#050505']], 0, 0, 1, 0)}${RG('rbGlow', [[0, '#fff6c8', .9], [1, '#fff6c8', 0]])}</defs>
  ${['#e5484d', '#ff9a1f', '#ffd23f', '#3fbf62', '#3b82f6', '#6366f1', '#8b5cf6'].map((c, i) => `<path d="M${22 + i * 5.4} 108A${84 - i * 5.4} ${84 - i * 5.4} 0 0 1 ${190 - i * 5.4} 108" fill="none" stroke="${c}" stroke-width="5.8" opacity=".9" stroke-dasharray="280" stroke-dashoffset="280"><animate attributeName="stroke-dashoffset" from="280" to="0" dur="1.4s" begin="${(i * .06).toFixed(2)}s" fill="freeze"/></path>`).join('')}
  <path d="M30 108A76 76 0 0 1 182 108" fill="none" stroke="#fff" stroke-width="1.2" opacity=".4" stroke-dasharray="280" stroke-dashoffset="280"><animate attributeName="stroke-dashoffset" from="280" to="0" dur="1.4s" fill="freeze"/></path>
  ${cloud(26, 106, .8)}
  <g transform="translate(184 98)"><circle cx="0" cy="-6" r="22" fill="url(#rbGlow)"><animate attributeName="opacity" values=".5;1;.5"${rep(1.4)}/></circle>
   ${[[-10, -8], [-3, -11], [5, -9], [11, -6], [-6, -14], [2, -16], [8, -13]].map(([x, y], i) => `<ellipse cx="${x}" cy="${y}" rx="5" ry="3.4" fill="url(#rbGold)" stroke="#8a5a08" stroke-width=".6"/><path d="M${x - 3} ${y - 1}h4" stroke="#fff" stroke-width=".8" opacity=".7"/>`).join('')}
   <path d="M-17-5h34c3 7 1 19-6 22h-22c-7-3-9-15-6-22z" fill="url(#rbPot)"/><path d="M-19-5h38" stroke="#3a3a3a" stroke-width="4.4" stroke-linecap="round"/><path d="M-12 1c4-2 8-2 10 0" stroke="#fff" stroke-opacity=".35" stroke-width="1.6" fill="none"/>
   <path d="M-14 17l-3 4M14 17l3 4" stroke="#1a1a1a" stroke-width="2.4" stroke-linecap="round"/></g></svg>`;

/* ---- a crescent moon with soft craters and twinkling stars ---- */
const moon = `<svg viewBox="0 0 84 74" xmlns="http://www.w3.org/2000/svg"><defs>${LG('mnFace', [[0, '#fffbe0'], [.5, '#ffe9a0'], [1, '#e0b84a']], 0, 0, 1, 1)}${RG('mnCrater', [[0, '#d9b23a', .6], [1, '#d9b23a', 0]])}<clipPath id="mnClip"><path d="M46 8a27 27 0 1 0 10 48 22 22 0 1 1-10-48z"/></clipPath></defs>
  <g transform="translate(35 36) scale(1.18) translate(-35 -36)" opacity=".28"><path d="M46 8a27 27 0 1 0 10 48 22 22 0 1 1-10-48z" fill="#ffe08a"><animate attributeName="opacity" values=".5;1;.5"${rep(3)}/></path></g>
  <path d="M46 8a27 27 0 1 0 10 48 22 22 0 1 1-10-48z" fill="url(#mnFace)"/>
  <g clip-path="url(#mnClip)">${[[22, 24, 5], [16, 40, 3.4], [28, 50, 4], [34, 16, 2.6], [22, 58, 2.4]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#mnCrater)"/><path d="M${x - r * .6} ${y - r * .3}a${r * .7} ${r * .7} 0 0 1 ${r * 1.2} 0" stroke="#fff" stroke-opacity=".5" stroke-width=".8" fill="none"/>`).join('')}</g>
  <path d="M32 12a26 26 0 0 0-6 34" stroke="#fff" stroke-opacity=".55" stroke-width="2.4" fill="none" stroke-linecap="round"/>
  ${[[66, 18, 6, 1.6], [76, 40, 4, 2], [60, 60, 3.4, 1.4], [16, 8, 3, 1.8], [72, 6, 2.4, 2.2]].map(([x, y, r, d], i) => `<path d="M${x} ${y - r}Q${x + r * .2} ${y - r * .2} ${x + r} ${y}Q${x + r * .2} ${y + r * .2} ${x} ${y + r}Q${x - r * .2} ${y + r * .2} ${x - r} ${y}Q${x - r * .2} ${y - r * .2} ${x} ${y - r}Z" fill="#fff6c8"><animate attributeName="opacity" values=".25;1;.25"${rep(d, i * .4)}/></path>`).join('')}</svg>`;

/* ---- a polished dreidel spinning, with chocolate gelt ---- */
const dreidel = `<svg viewBox="-34 -46 68 92" xmlns="http://www.w3.org/2000/svg"><defs>${LG('drBody', [[0, '#6aa2f0'], [.35, '#e8f0ff'], [.5, '#c7d7f5'], [.7, '#3b6ac0'], [1, '#14306a']], 0, 0, 1, 0)}${LG('drTop', [[0, '#e8f0ff'], [1, '#6aa2f0']], 0, 0, 1, 0)}${LG('drGold', [[0, '#fff2b0'], [.5, '#f2c14e'], [1, '#a8740c']])}${RG('drShadow', [[0, '#000', .35], [1, '#000', 0]])}</defs>
  <ellipse cx="0" cy="40" rx="16" ry="3" fill="url(#drShadow)"><animate attributeName="rx" values="16;12;16"${rep(.4)}/></ellipse>
  <g><animateTransform attributeName="transform" type="rotate" values="-12 0 36;12 0 36;-12 0 36"${rep(.4)}/>
   <rect x="-3.4" y="-42" width="6.8" height="14" rx="2.4" fill="url(#drTop)" stroke="#14306a" stroke-width=".8"/>
   <path d="M-16-28h32v26L0 36-16-2z" fill="url(#drBody)" stroke="#14306a" stroke-width="1.4"/><path d="M-16-28h32" stroke="url(#drGold)" stroke-width="3"/><path d="M-16-2L0 36 16-2" stroke="url(#drGold)" stroke-width="1.6" fill="none"/>
   <text x="0" y="-7" font-size="16" font-weight="700" text-anchor="middle" fill="#14306a" font-family="serif">ש<animate attributeName="opacity" values="1;0;1"${rep(.4)}/></text><text x="0" y="-7" font-size="16" font-weight="700" text-anchor="middle" fill="#14306a" font-family="serif" opacity="0">נ<animate attributeName="opacity" values="0;1;0"${rep(.4)}/></text>
   <path d="M-11-24v20" stroke="#fff" stroke-width="2.4" opacity=".7"/></g>
  ${[[-26, 34], [24, 36]].map(([x, y], i) => `<g transform="translate(${x} ${y})"><ellipse rx="7" ry="7" fill="url(#drGold)" stroke="#8a5a08" stroke-width=".8"><animate attributeName="rx" values="7;1;7"${rep(.8, i * .3)}/></ellipse><circle r="3.4" fill="none" stroke="#8a5a08" stroke-width=".6"><animate attributeName="r" values="3.4;.4;3.4"${rep(.8, i * .3)}/></circle></g>`).join('')}</svg>`;
return {geese, penguin, owl, gulls, beachBall, rainbow, moon, dreidel};
})();
const set = (pack, i, svg) => { if (F[pack] && F[pack][i]) F[pack][i].svg = svg; };
set('christmas', 0, SANTA);
set('halloween', 0, SPOOKY.witch); set('halloween', 2, SPOOKY.bats); set('halloween', 3, SPOOKY.ghost);
set('valentine', 0, SWEET.cupid); set('valentine', 1, SWEET.heart);
set('easter', 0, SWEET.bunny);
set('spring', 0, SWEET.monarch); set('spring', 1, SWEET.morpho); set('spring', 2, SWEET.bee);
set('autumn', 0, NATURE.geese);
set('winter', 0, NATURE.penguin); set('winter', 1, NATURE.owl);
set('summer', 0, NATURE.gulls); set('summer', 2, NATURE.beachBall);
set('patrick', 0, NATURE.rainbow); set('eid', 0, NATURE.moon); set('hanukkah', 0, NATURE.dreidel);
})();
