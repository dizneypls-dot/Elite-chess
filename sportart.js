/* Elite Chess: high-detail artwork for the sports flyovers (sportthemes.js): a modern F1 car and a MotoGP bike
   at speed in a fictional "Elite" livery, and realistic balls (felt, pebbled leather, stitched seams, dimples) whose
   lighting stays put while the surface spins. Plain SVG with gradients, a few small texture filters and SMIL. */
(() => {
// ---- F1 car ----
const f1car = (() => {
const g = (id, s, x1 = 0, y1 = 0, x2 = 0, y2 = 1) => `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${s.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a != null ? ` stop-opacity="${a}"` : ''}/>`).join('')}</linearGradient>`;
const r = (id, s, cx = .5, cy = .5, rr = .5) => `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${rr}">${s.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a != null ? ` stop-opacity="${a}"` : ''}/>`).join('')}</radialGradient>`;
const defs =
  g('fcPaint', [[0, '#3b5bdb'], [.18, '#1e3a8a'], [.55, '#0b1d4d'], [1, '#050c24']]) +            // deep blue body
  g('fcPaintSide', [[0, '#173aa8'], [.5, '#0b1d4d'], [1, '#040a1f']]) +
  g('fcRed', [[0, '#ff5a4f'], [.5, '#d9141e'], [1, '#7a0009']]) +
  g('fcGold', [[0, '#fff2b0'], [.45, '#f2c14e'], [1, '#9a6b08']]) +
  g('fcCarbon', [[0, '#3a3f4a'], [.5, '#1a1d24'], [1, '#08090c']]) +
  g('fcSheen', [[0, '#ffffff', .75], [.5, '#ffffff', .15], [1, '#ffffff', 0]]) +
  g('fcHalo', [[0, '#5a5f6a'], [.5, '#1a1d24'], [1, '#0a0b0e']]) +
  r('fcTyre', [[0, '#2c2c30'], [.72, '#1a1a1d'], [.86, '#0d0d0f'], [1, '#050506']]) +
  r('fcRim', [[0, '#9aa3b2'], [.6, '#3a3f4a'], [1, '#14161b']]) +
  r('fcHelmet', [[0, '#ffffff'], [.5, '#e8ecf4'], [1, '#8a93a6']], .35, .3) +
  r('fcShadow', [[0, '#000', .55], [1, '#000', 0]]) +
  g('fcVisor', [[0, '#7fd1ff'], [.5, '#1b3a6b'], [1, '#05101f']]) +
  `<filter id="fcSpin" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="2.2"/></filter>`;
const wheel = (cx, cy, R) => `<g transform="translate(${cx} ${cy})">
  <circle r="${R}" fill="url(#fcTyre)"/>
  <circle r="${R - 2}" fill="none" stroke="#000" stroke-opacity=".6" stroke-width="1"/>
  <circle r="${R * .74}" fill="none" stroke="#e5484d" stroke-width="${R * .05}"/>
  <circle r="${R * .74}" fill="none" stroke="#fff" stroke-width="${R * .015}" stroke-dasharray="${R * .9} ${R * .5}" opacity=".7"/>
  <circle r="${R * .62}" fill="url(#fcRim)"/>
  <g filter="url(#fcSpin)"><g>${Array.from({length: 10}, (_, i) => `<path d="M0 0L${(R * .6 * Math.cos(i * .628)).toFixed(1)} ${(R * .6 * Math.sin(i * .628)).toFixed(1)}" stroke="#c9ced8" stroke-width="${R * .07}" opacity=".55"/>`).join('')}
    <animateTransform attributeName="transform" type="rotate" values="0;360" dur=".12s" repeatCount="indefinite"/></g></g>
  <circle r="${R * .58}" fill="#0b1d4d" opacity=".55"/><circle r="${R * .58}" fill="none" stroke="#f2c14e" stroke-width="1.6"/>
  <circle r="${R * .2}" fill="#14161b" stroke="#9aa3b2" stroke-width="1.2"/>
  <path d="M${-R * .55} ${-R * .2}A${R * .6} ${R * .6} 0 0 1 ${-R * .1} ${-R * .58}" stroke="#fff" stroke-opacity=".35" stroke-width="2" fill="none"/>
  <path d="M${-R + 3} ${-R * .3}A${R} ${R} 0 0 1 ${-R * .4} ${-R + 3}" stroke="#fff" stroke-opacity=".12" stroke-width="3" fill="none"/>
</g>`;
const sparks = Array.from({length: 9}, (_, i) => { const x = 250 - i * 9, y = 152 + (i % 3) * 2, d = (.18 + (i % 4) * .05).toFixed(2), b = (i * .07).toFixed(2);
  return `<path d="M${x} ${y}l${-14 - i * 2} ${3 + (i % 2) * 4}" stroke="${i % 2 ? '#ffd27a' : '#ffffff'}" stroke-width="${1.6 - (i % 3) * .3}" stroke-linecap="round" opacity="0"><animate attributeName="opacity" values="0;1;0;0" keyTimes="0;.1;.4;1" dur="1.4s" begin="${b}s" repeatCount="indefinite"/></path>`; }).join('');
const streaks = [38, 62, 84, 104, 122].map((y, i) => `<path d="M${-40 - i * 20} ${y}H${60 - i * 6}" stroke="#fff" stroke-width="${1.2 + (i % 2) * .8}" stroke-linecap="round" opacity="0"><animate attributeName="opacity" values="0;.55;0" dur=".45s" begin="${(i * .09).toFixed(2)}s" repeatCount="indefinite"/><animateTransform attributeName="transform" type="translate" values="30 0;-30 0" dur=".45s" begin="${(i * .09).toFixed(2)}s" repeatCount="indefinite"/></path>`).join('');
return `<svg viewBox="-60 0 700 180" xmlns="http://www.w3.org/2000/svg"><defs>${defs}</defs>
  ${streaks}
  <ellipse cx="300" cy="162" rx="270" ry="9" fill="url(#fcShadow)"/>
  <!-- rear wing: endplates, main plane, DRS flap, beam wing, swan-neck pylon -->
  <path d="M86 98C84 80 82 60 78 44" stroke="#1a1d24" stroke-width="5" fill="none"/>
  <path d="M30 26h16l4 84H36z" fill="url(#fcCarbon)"/><path d="M33 30h10" stroke="#f2c14e" stroke-width="1.4"/>
  <path d="M24 46c26-5 58-5 84-1l-2 9c-26-3-54-3-80 1z" fill="url(#fcPaint)"/>
  <path d="M22 30c28-6 64-6 90-1l-3 11c-26-4-56-4-84 1z" fill="url(#fcRed)"/>
  <path d="M24 31c28-4 58-4 86 0" stroke="#fff" stroke-opacity=".55" stroke-width="1.2" fill="none"/>
  <text x="48" y="39" font-size="8.5" font-weight="900" fill="#fff" font-family="Arial,sans-serif" letter-spacing="1.2">ELITE</text>
  <path d="M44 100h48l-2 6H46z" fill="url(#fcCarbon)"/>
  <!-- floor and plank -->
  <path d="M66 140H470l-8 8H76z" fill="url(#fcCarbon)"/><path d="M90 147h360" stroke="#c49a5a" stroke-width="2" opacity=".7"/>
  ${sparks}
  <!-- body: airbox and roll hoop, engine cover sweeping down to the gearbox, shark fin -->
  <path d="M290 66L274 34c-4-6-16-6-22 0C200 50 140 72 104 92l-14 6-4 40h210z" fill="url(#fcPaint)"/>
  <path d="M252 36C196 54 140 76 106 94" stroke="url(#fcSheen)" stroke-width="3" fill="none"/>
  <path d="M250 40C200 58 150 78 116 96" stroke="#d9141e" stroke-width="4" fill="none"/>
  <path d="M252 38C210 52 170 66 140 78l-4-12c34-12 76-24 112-30z" fill="#0b1d4d" opacity=".55"/>
  <path d="M254 34c6-4 16-4 20 0l-2 12h-16z" fill="#05070c"/><path d="M257 36h12" stroke="#3a3f4a" stroke-width="2"/>
  <path d="M96 100h10v38H96z" fill="url(#fcCarbon)"/>
  <!-- sidepod with inlet and undercut -->
  <path d="M160 104c30-12 80-18 140-18l20 4v34c-60 2-110 6-160 16-8-12-8-26 0-36z" fill="url(#fcPaint)"/>
  <path d="M168 132c40-8 90-12 152-12" stroke="#000" stroke-opacity=".35" stroke-width="6" fill="none"/>
  <path d="M300 88h18c4 0 6 2 6 6v14h-24z" fill="#05070c"/><path d="M302 92h14" stroke="#f2c14e" stroke-width="1.4"/>
  <path d="M176 104c40-10 90-14 130-14" stroke="url(#fcSheen)" stroke-width="2.4" fill="none"/>
  <path d="M190 112h90l4 8h-96z" fill="url(#fcRed)"/>
  <text x="200" y="128" font-size="15" font-weight="900" font-style="italic" fill="url(#fcGold)" font-family="Arial,sans-serif" letter-spacing="2">ELITE</text>
  <!-- cockpit, monocoque and nose -->
  <path d="M290 64c30-4 70-4 110 4 60 10 120 32 170 50l4 10c-60-6-130-10-200-8l-90 4z" fill="url(#fcPaint)"/>
  <path d="M300 70c40-4 90 0 130 10s90 24 140 40" stroke="url(#fcSheen)" stroke-width="2.6" fill="none"/>
  <path d="M440 92c40 8 86 20 132 34" stroke="#d9141e" stroke-width="5" stroke-linecap="round"/>
  <path d="M520 108l54 18" stroke="#fff" stroke-width="1.6" opacity=".6"/>
  <text x="456" y="104" font-size="20" font-weight="900" fill="#fff" font-family="Arial,sans-serif" transform="rotate(10 456 104)">1</text>
  <!-- rear wheel (outside the bodywork) -->
  <path d="M150 110L200 104M150 124L196 120" stroke="#1a1d24" stroke-width="3.4" stroke-linecap="round"/>
  ${wheel(126, 124, 38)}
  <!-- front wheel with suspension and wheel cover -->
  <path d="M420 104L496 118M424 116L498 126M440 98l52 22" stroke="#1a1d24" stroke-width="3.4" stroke-linecap="round"/>
  ${wheel(504, 126, 34)}
  <!-- front wing: three elements and an endplate -->
  <path d="M520 146h96l6 6h-108z" fill="url(#fcCarbon)"/><path d="M528 138h84l4 6h-92z" fill="url(#fcRed)"/><path d="M536 131h72l3 5h-78z" fill="url(#fcPaint)"/>
  <path d="M600 122h18l4 30h-20z" fill="url(#fcCarbon)"/><path d="M604 128h10" stroke="#f2c14e" stroke-width="1.2"/>
  <path d="M568 126l14 22" stroke="#1a1d24" stroke-width="2.4"/>
  <!-- driver: helmet in the cockpit, under the halo -->
  <path d="M286 72c4-6 30-6 40 0v6h-40z" fill="#05070c"/>
  <circle cx="305" cy="58" r="15" fill="url(#fcHelmet)"/>
  <path d="M296 56h22c3 0 4 6 1 8h-22z" fill="url(#fcVisor)"/><path d="M298 57h16" stroke="#fff" stroke-opacity=".6" stroke-width="1"/>
  <path d="M292 50c6-8 20-10 28-4" stroke="#d9141e" stroke-width="3" fill="none"/><path d="M291 62c8 4 20 4 28 0" stroke="#f2c14e" stroke-width="2" fill="none"/>
  <path d="M276 74C278 46 330 40 352 66l-6 6c-14-20-50-18-60 6z" fill="url(#fcHalo)"/><path d="M344 70l8 22" stroke="#1a1d24" stroke-width="5" stroke-linecap="round"/>
  <path d="M282 62c10-14 40-16 58-2" stroke="#fff" stroke-opacity=".35" stroke-width="1.4" fill="none"/>
  <!-- mirror and camera pod -->
  <path d="M352 80l14-4 4 6-14 3z" fill="url(#fcPaint)"/><path d="M262 30l6-8 6 8z" fill="#f2c14e"/>
</svg>`;
})();

// ---- MotoGP ----
const motoBike = (() => {
const g = (id, s, x1 = 0, y1 = 0, x2 = 0, y2 = 1) => `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${s.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a != null ? ` stop-opacity="${a}"` : ''}/>`).join('')}</linearGradient>`;
const r = (id, s, cx = .5, cy = .5, rr = .5) => `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${rr}">${s.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a != null ? ` stop-opacity="${a}"` : ''}/>`).join('')}</radialGradient>`;
const defs = g('mgRed', [[0, '#ff5a4f'], [.45, '#d9141e'], [1, '#6a0008']]) + g('mgBlack', [[0, '#3a3f4a'], [.5, '#14161b'], [1, '#050506']]) +
  g('mgWhite', [[0, '#ffffff'], [1, '#c9d1dc']]) + g('mgGold', [[0, '#fff2b0'], [.5, '#e8b730'], [1, '#8a5a08']], 0, 0, 1, 0) +
  g('mgAlu', [[0, '#e8ecf2'], [.5, '#9aa3b2'], [1, '#4a5160']]) + g('mgTi', [[0, '#d9c7f2'], [.4, '#8a7aa8'], [.7, '#c9a26a'], [1, '#4a3a5a']], 0, 0, 1, 0) +
  g('mgScreen', [[0, '#9ad7ff', .7], [1, '#0b1d4d', .85]]) + g('mgSheen', [[0, '#fff', .7], [1, '#fff', 0]]) +
  r('mgTyre', [[0, '#2c2c30'], [.78, '#18181b'], [1, '#050506']]) + r('mgHelmet', [[0, '#ffffff'], [.55, '#e8ecf4'], [1, '#8a93a6']], .35, .3) +
  r('mgShadow', [[0, '#000', .5], [1, '#000', 0]]) + r('mgDisc', [[0, '#5a5f6a'], [.7, '#c9ced8'], [.85, '#8a93a6'], [1, '#3a3f4a']]) +
  g('mgVisor', [[0, '#ffd27a'], [.5, '#c2410c'], [1, '#2a0a00']]) + `<filter id="mgSpin"><feGaussianBlur stdDeviation="2.4"/></filter>`;
const wheel = (cx, cy, R, disc) => `<g transform="translate(${cx} ${cy})"><circle r="${R}" fill="url(#mgTyre)"/><circle r="${R * .8}" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="1.4" stroke-dasharray="${R * .7} ${R * 1.4}"/>
  <circle r="${R * .74}" fill="#0c0d10"/>
  ${disc ? `<circle r="${R * .6}" fill="url(#mgDisc)"/>${Array.from({length: 18}, (_, i) => { const a = i * .349; return `<circle cx="${(R * .52 * Math.cos(a)).toFixed(1)}" cy="${(R * .52 * Math.sin(a)).toFixed(1)}" r="1.4" fill="#3a3f4a"/>`; }).join('')}` : ''}
  <g filter="url(#mgSpin)"><g>${Array.from({length: 5}, (_, i) => { const a = i * 1.2566; return `<path d="M0 0L${(R * .72 * Math.cos(a - .12)).toFixed(1)} ${(R * .72 * Math.sin(a - .12)).toFixed(1)}M0 0L${(R * .72 * Math.cos(a + .12)).toFixed(1)} ${(R * .72 * Math.sin(a + .12)).toFixed(1)}" stroke="#d9141e" stroke-width="3"/>`; }).join('')}<animateTransform attributeName="transform" type="rotate" values="0;360" dur=".11s" repeatCount="indefinite"/></g></g>
  <circle r="${R * .74}" fill="none" stroke="#d9141e" stroke-width="2.4"/><circle r="${R * .14}" fill="url(#mgAlu)" stroke="#14161b"/>
  <path d="M${-R + 4} ${-R * .3}A${R} ${R} 0 0 1 ${-R * .4} ${-R + 4}" stroke="#fff" stroke-opacity=".14" stroke-width="3" fill="none"/></g>`;
const streaks = [70, 110, 150, 190, 230].map((y, i) => `<path d="M${-60 - i * 20} ${y}H${50 - i * 8}" stroke="#fff" stroke-width="${1.4 + (i % 2)}" stroke-linecap="round" opacity="0"><animate attributeName="opacity" values="0;.55;0" dur=".45s" begin="${(i * .09).toFixed(2)}s" repeatCount="indefinite"/><animateTransform attributeName="transform" type="translate" values="30 0;-30 0" dur=".45s" begin="${(i * .09).toFixed(2)}s" repeatCount="indefinite"/></path>`).join('');
return `<svg viewBox="-60 0 560 300" xmlns="http://www.w3.org/2000/svg"><defs>${defs}</defs>${streaks}
  <ellipse cx="250" cy="286" rx="200" ry="8" fill="url(#mgShadow)"/>
  <!-- swingarm, rear wheel, chain -->
  <path d="M112 232L214 198l8 14-104 28z" fill="url(#mgAlu)" stroke="#3a3f4a" stroke-width="1.2"/>
  ${wheel(112, 232, 54, false)}
  <path d="M112 232l20-8" stroke="#3a3f4a" stroke-width="3"/>
  <!-- exhaust -->
  <path d="M214 178C186 170 152 158 122 148l-3 11c30 10 62 22 92 30z" fill="url(#mgTi)" stroke="#2a1a3a" stroke-width="1.2"/><ellipse cx="121" cy="153" rx="4.4" ry="6.4" fill="#1a0f22"/>
  <!-- tail unit and seat -->
  <path d="M206 140C170 132 136 122 100 112c6 14 34 30 64 40l42 6z" fill="url(#mgRed)" stroke="#3a0004" stroke-width="1.4"/>
  <path d="M104 114c32 8 64 18 96 26" stroke="url(#mgSheen)" stroke-width="2.4" fill="none"/>
  <path d="M120 126l50 14" stroke="#fff" stroke-width="3"/><path d="M180 140c8 2 18 2 26 0" stroke="#14161b" stroke-width="5"/>
  <!-- main fairing, belly pan, winglets -->
  <path d="M204 150c40-16 96-28 146-26 34 2 66 12 92 28l-12 8c-8 30-58 58-122 62l-96 2c-16-18-20-50-8-74z" fill="url(#mgRed)" stroke="#3a0004" stroke-width="1.4"/>
  <path d="M214 154c44-14 94-24 136-22 30 1 58 10 80 22" stroke="url(#mgSheen)" stroke-width="3" fill="none"/>
  <path d="M210 200c40 6 100 6 150-6" stroke="#000" stroke-opacity=".3" stroke-width="8" fill="none"/>
  <path d="M250 222c30 2 70 0 100-8l-6 14c-30 6-64 8-96 6z" fill="url(#mgBlack)"/>
  <path d="M300 156c20-4 44-4 64 2l-2 10c-20-4-42-4-62 0z" fill="url(#mgBlack)"/><path d="M304 172c20-4 40-4 58 0l-2 9c-18-3-38-3-56 0z" fill="url(#mgBlack)"/>
  <path d="M232 150c30-6 50-6 66-2v38c-24 2-50 0-70-4z" fill="url(#mgWhite)" opacity=".95"/>
  <text x="240" y="182" font-size="34" font-weight="900" font-style="italic" fill="#d9141e" font-family="Arial,sans-serif">11</text>
  <text x="318" y="210" font-size="13" font-weight="900" font-style="italic" fill="url(#mgGold)" font-family="Arial,sans-serif" letter-spacing="1.5">ELITE</text>
  <!-- front: fork, brake, wheel, mudguard -->
  <path d="M332 120L382 230" stroke="url(#mgGold)" stroke-width="12" stroke-linecap="round"/><path d="M350 160L382 230" stroke="url(#mgBlack)" stroke-width="13" stroke-linecap="round"/>
  ${wheel(384, 232, 52, true)}
  <path d="M366 212l12-6 6 14-12 6z" fill="url(#mgGold)" stroke="#5a3a00" stroke-width="1"/>
  <path d="M344 186c20-8 52-6 68 6l-6 6c-16-8-40-10-58-4z" fill="url(#mgRed)" stroke="#3a0004" stroke-width="1.2"/>
  <!-- nose and windscreen -->
  <path d="M406 146c10 0 20 2 28 6-8 2-18 2-28 0z" fill="#fff6c8"/>
  <path d="M300 128c18-14 46-20 74-14l-8 14c-22-2-44 0-66 6z" fill="url(#mgScreen)" stroke="#0b1d4d" stroke-width="1"/>
  <!-- rider, tucked in: leg, back, arm, helmet -->
  <path d="M206 142c18 10 34 28 44 50l-10 8c-12-18-26-30-42-40z" fill="url(#mgBlack)" stroke="#000" stroke-width="1"/>
  <path d="M244 196c-12 8-26 14-40 16l2 12c16-2 32-8 46-18z" fill="url(#mgBlack)" stroke="#000" stroke-width="1"/>
  <ellipse cx="248" cy="198" rx="6" ry="4" fill="#d9c7a2" transform="rotate(30 248 198)"/>
  <path d="M196 214c6-4 18-4 22 2l-4 8h-20z" fill="url(#mgWhite)" stroke="#14161b" stroke-width="1"/>
  <path d="M184 136c24-26 70-38 112-30 12 3 14 14 6 20-30 14-72 20-106 20-12 0-18-4-12-10z" fill="url(#mgBlack)" stroke="#000" stroke-width="1"/>
  <path d="M196 124c28-16 64-22 98-16" stroke="#d9141e" stroke-width="4" fill="none"/><path d="M194 132c32-10 68-14 100-10" stroke="url(#mgSheen)" stroke-width="2" fill="none"/>
  <path d="M198 116c6-8 16-10 24-6l-6 12z" fill="#2a2f3a"/>
  <path d="M290 128c14 4 28 6 42 6" stroke="url(#mgBlack)" stroke-width="12" stroke-linecap="round" fill="none"/><circle cx="336" cy="134" r="7" fill="url(#mgWhite)" stroke="#14161b"/>
  <g transform="translate(-4 18)">
  <path d="M286 92c0-16 14-26 30-24 16 2 24 14 22 28-2 12-14 18-28 18-14 0-24-8-24-22z" fill="url(#mgHelmet)" stroke="#14161b" stroke-width="1.2"/>
  <path d="M306 84c8-2 22-2 30 4 2 6 0 12-4 14l-26 2c-4-6-4-14 0-20z" fill="url(#mgVisor)"/><path d="M310 86c6-1 16-1 22 3" stroke="#fff" stroke-opacity=".6" stroke-width="1.2" fill="none"/>
  <path d="M290 84c6-10 18-16 30-14" stroke="#d9141e" stroke-width="4" fill="none"/><path d="M288 100c8 6 20 8 32 6" stroke="url(#mgGold)" stroke-width="3" fill="none"/>
  </g>
</svg>`;
})();

// ---- balls ----
const BALLS = (() => {
const st = s => s.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a != null ? ` stop-opacity="${a}"` : ''}/>`).join('');
const rg = (id, s, cx = .5, cy = .5, r = .5) => `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${st(s)}</radialGradient>`;
const lg = (id, s, x2 = 0, y2 = 1) => `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}">${st(s)}</linearGradient>`;
const spin = (dur, back = false) => dur ? `<animateTransform attributeName="transform" type="rotate" values="${back ? '360;0' : '0;360'}" dur="${dur}s" repeatCount="indefinite"/>` : '';
// sphere lighting: soft top-left light, darker rim, a specular highlight and a faint rim light
const light = (p, r = 40) => `<circle r="${r}" fill="url(#${p}Shade)"/><ellipse cx="${-r * .34}" cy="${-r * .4}" rx="${r * .3}" ry="${r * .2}" fill="url(#${p}Spec)" transform="rotate(-30 ${-r * .34} ${-r * .4})"/>
  <path d="M${r * .62} ${r * .5}A${r * .8} ${r * .8} 0 0 1 ${-r * .2} ${r * .78}" stroke="#fff" stroke-opacity=".18" stroke-width="${r * .06}" fill="none"/>`;
const lightDefs = p => rg(p + 'Shade', [[0, '#fff', 0], [.55, '#000', 0], [.85, '#000', .28], [1, '#000', .6]], .38, .32, .78) + rg(p + 'Spec', [[0, '#fff', .9], [1, '#fff', 0]]);
const clip = (p, r = 40) => `<clipPath id="${p}Clip"><circle r="${r}"/></clipPath>`;
// a cheap speckle texture (pebbled leather, felt): a tiny repeating pattern, drawn once
const speck = (id, dark, light, size = 4) => `<pattern id="${id}" width="${size}" height="${size}" patternUnits="userSpaceOnUse"><circle cx="${size * .25}" cy="${size * .3}" r="${size * .16}" fill="${dark}"/><circle cx="${size * .72}" cy="${size * .75}" r="${size * .14}" fill="${light}"/><circle cx="${size * .8}" cy="${size * .2}" r="${size * .1}" fill="${dark}"/></pattern>`;

const B = {};
B.tennis = s => ({defs: rg('tbBase', [[0, '#eef870'], [.6, '#cfe03a'], [1, '#9fb21e']], .4, .35) + lightDefs('tb') + clip('tb') +
  // felt as a light speckle pattern (a noise filter here would redraw every frame and stutter on phones)
  `<pattern id="tbFelt" width="5" height="5" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".7" fill="#f6ffb0" opacity=".55"/><circle cx="3.6" cy="2.4" r=".6" fill="#7a8a10" opacity=".35"/><circle cx="2" cy="4" r=".5" fill="#ffffff" opacity=".35"/></pattern>`,
  g: `<circle r="40.6" fill="#c9db34" opacity=".35"/><circle r="40" fill="url(#tbBase)"/><g clip-path="url(#tbClip)"><circle r="40" fill="url(#tbFelt)"/>
    <g>${spin(s)}<path d="M-30-30C-10-14-10 14-30 30" stroke="#f4f6ea" stroke-width="5" fill="none"/><path d="M30-30C10-14 10 14 30 30" stroke="#f4f6ea" stroke-width="5" fill="none"/>
    <path d="M-30-30C-10-14-10 14-30 30M30-30C10-14 10 14 30 30" stroke="#8a9a20" stroke-opacity=".4" stroke-width="1" fill="none" transform="translate(1.4 1.4)"/></g></g>${light('tb')}`});
B.soccer = s => {
  const pent = (cx, cy, r, rot) => { let d = ''; for (let i = 0; i < 5; i++){ const a = rot + i * 1.2566; d += (i ? 'L' : 'M') + (cx + r * Math.cos(a)).toFixed(1) + ' ' + (cy + r * Math.sin(a)).toFixed(1); } return d + 'Z'; };
  const outer = Array.from({length: 5}, (_, i) => { const a = -Math.PI / 2 + i * 1.2566; return pent(36 * Math.cos(a), 36 * Math.sin(a), 11, a + Math.PI); }).join('');
  const seams = Array.from({length: 5}, (_, i) => { const a = -Math.PI / 2 + i * 1.2566, a2 = a + .628; return `M${(10.5 * Math.cos(a)).toFixed(1)} ${(10.5 * Math.sin(a)).toFixed(1)}L${(25 * Math.cos(a)).toFixed(1)} ${(25 * Math.sin(a)).toFixed(1)}M${(25 * Math.cos(a)).toFixed(1)} ${(25 * Math.sin(a)).toFixed(1)}L${(27 * Math.cos(a2)).toFixed(1)} ${(27 * Math.sin(a2)).toFixed(1)}`; }).join('');
  return {defs: rg('sbBase', [[0, '#ffffff'], [.7, '#eef1f6'], [1, '#c9d1dc']], .4, .35) + lightDefs('sb') + clip('sb') + lg('sbPent', [[0, '#3a3f4a'], [1, '#0a0b0e']]),
    g: `<circle r="40" fill="url(#sbBase)"/><g clip-path="url(#sbClip)"><g>${spin(s)}<path d="${pent(0, 0, 13, -Math.PI / 2)}${outer}" fill="url(#sbPent)"/><path d="${seams}" stroke="#9aa3b2" stroke-width="1.2" fill="none"/></g></g>${light('sb')}`};
};
// prolate balls (gridiron, Sherrin, rugby): drawn wider than tall; a slight wobble instead of a spin
const oval = (p, base, stitch, extra, rx = 46, ry = 28) => ({defs: lg(p + 'Base', base, 0, 1) + rg(p + 'Shade', [[0, '#fff', 0], [.55, '#000', 0], [.9, '#000', .35], [1, '#000', .6]], .4, .3, .8) + rg(p + 'Spec', [[0, '#fff', .8], [1, '#fff', 0]]) +
    `<clipPath id="${p}Clip"><ellipse rx="${rx}" ry="${ry}"/></clipPath>` + speck(p + 'Peb', 'rgba(0,0,0,.35)', 'rgba(255,255,255,.18)', 3.4),
  g: wobble => `<g>${wobble}<ellipse rx="${rx}" ry="${ry}" fill="url(#${p}Base)"/><g clip-path="url(#${p}Clip)"><ellipse rx="${rx}" ry="${ry}" fill="url(#${p}Peb)"/>${extra}</g>
    <ellipse rx="${rx}" ry="${ry}" fill="url(#${p}Shade)"/><ellipse cx="-14" cy="-13" rx="16" ry="6" fill="url(#${p}Spec)" transform="rotate(-10 -14 -13)"/><path d="M${-rx + 4} 0C${-rx + 8} ${-ry + 4} ${-rx * .3} ${-ry} 0 ${-ry}" stroke="${stitch}" stroke-opacity=".3" stroke-width="1" fill="none"/></g>`});
const laces = (col, y = -8, n = 7, w = 26) => `<path d="M${-w / 2} ${y}h${w}" stroke="${col}" stroke-width="2.4"/>` + Array.from({length: n}, (_, i) => `<path d="M${(-w / 2 + 2 + i * (w - 4) / (n - 1)).toFixed(1)} ${y - 4}v8" stroke="${col}" stroke-width="2.6" stroke-linecap="round"/>`).join('');
const wob = s => `<animateTransform attributeName="transform" type="rotate" values="-6;6;-6" dur="${s || .8}s" repeatCount="indefinite"/>`;
B.gridiron = s => { const o = oval('gfb', [[0, '#a8662e'], [.5, '#7a4218'], [1, '#4a2408']], '#fff', laces('#f4efe4') + `<path d="M-46 0C-30 -6 30 -6 46 0" stroke="#3a1a04" stroke-width="1.2" fill="none" opacity=".6"/><path d="M-40 -12c4 8 4 16 0 24M40 -12c-4 8-4 16 0 24" stroke="#f4efe4" stroke-width="3" fill="none" opacity=".0"/>`); return {defs:o.defs, g:o.g(wob(s))}; };
B.sherrin = s => { const o = oval('afb', [[0, '#ff4b52'], [.5, '#d71920'], [1, '#7a060b']], '#fff', laces('#ffffff', -6) + `<path d="M-46 0C-30 6 30 6 46 0M-46 0C-30 -6 30 -6 46 0" stroke="#5a0408" stroke-width="1" fill="none" opacity=".7"/><text x="18" y="16" font-size="8" font-weight="900" fill="#ffd23f" font-family="Arial,sans-serif" transform="rotate(-8 18 16)">AFL</text>`, 44, 27); return {defs:o.defs, g:o.g(wob(s))}; };
B.rugby = s => { const o = oval('rgb', [[0, '#ffffff'], [.6, '#eef1f6'], [1, '#b9c2cf']], '#0b6e4f', `<path d="M-30-24c8 14 8 34 0 48M30-24c-8 14-8 34 0 48" stroke="#0b6e4f" stroke-width="7" fill="none"/><path d="M-22-24c6 14 6 34 0 48M22-24c-6 14-6 34 0 48" stroke="#f2c14e" stroke-width="3" fill="none"/>` + Array.from({length: 36}, (_, i) => `<circle cx="${-24 + (i % 9) * 6}" cy="${-12 + Math.floor(i / 9) * 7}" r="1" fill="#9aa3b2" opacity=".5"/>`).join('')); return {defs:o.defs, g:o.g(wob(s))}; };
B.baseball = s => {
  const curve = (sx) => `M${sx * 26}-30C${sx * 10}-12 ${sx * 10} 12 ${sx * 26} 30`;
  const stitches = sx => Array.from({length: 11}, (_, i) => { const t = i / 10, y = -30 + 60 * t, x = sx * (26 - 16 * Math.sin(t * Math.PI)); return `<path d="M${(x - sx * 3).toFixed(1)} ${(y - 2.4).toFixed(1)}L${x.toFixed(1)} ${y.toFixed(1)}L${(x - sx * 3).toFixed(1)} ${(y + 2.4).toFixed(1)}" stroke="#d9141e" stroke-width="1.6" fill="none" stroke-linecap="round"/>`; }).join('');
  return {defs: rg('bbBase', [[0, '#ffffff'], [.7, '#f4f0e6'], [1, '#cfc7b6']], .4, .35) + lightDefs('bb') + clip('bb') + speck('bbLeather', 'rgba(122,106,74,.18)', 'rgba(255,255,255,.4)', 3.6),
    g: `<circle r="40" fill="url(#bbBase)"/><g clip-path="url(#bbClip)"><circle r="40" fill="url(#bbLeather)"/><g>${spin(s)}<path d="${curve(-1)}${curve(1)}" stroke="#c9b99a" stroke-width="1.4" fill="none"/>${stitches(-1)}${stitches(1)}</g></g>${light('bb')}`};
};
B.basketball = s => ({defs: rg('kbBase', [[0, '#ffa35c'], [.55, '#ee6a20'], [1, '#a33a06']], .4, .35) + lightDefs('kb') + clip('kb') + speck('kbPeb', 'rgba(58,20,4,.4)', 'rgba(255,190,140,.35)', 3),
  g: `<circle r="40" fill="url(#kbBase)"/><g clip-path="url(#kbClip)"><circle r="40" fill="url(#kbPeb)"/><g>${spin(s)}<path d="M-40 0H40M0-40V40M-28-30C-12-14-12 14-28 30M28-30C12-14 12 14 28 30" stroke="#1a0a02" stroke-width="2.4" fill="none"/></g></g>${light('kb')}`});
B.cricket = s => {
  const rows = [-5, -1.7, 1.7, 5].map((o, i) => `<path d="M-40 ${o}H40" stroke="${i % 3 ? '#fff6e6' : '#e8d9c0'}" stroke-width="1.1" stroke-dasharray="2.4 1.6"/>`).join('');
  return {defs: rg('cbBase', [[0, '#ff5a52'], [.55, '#b3101c'], [1, '#5a0008']], .38, .32) + lightDefs('cb') + clip('cb') + rg('cbShine', [[0, '#fff', .55], [1, '#fff', 0]], .5, .5),
    g: `<circle r="40" fill="url(#cbBase)"/><g clip-path="url(#cbClip)"><g>${spin(s)}<g transform="rotate(-30)"><path d="M-40 0H40" stroke="#7a0a12" stroke-width="13"/>${rows}<path d="M0-40V40" stroke="#7a0a12" stroke-width="1.4" stroke-dasharray="3 2" opacity=".7"/></g></g></g>
      <ellipse cx="-14" cy="-16" rx="20" ry="13" fill="url(#cbShine)"/>${light('cb')}`};
};
B.golf = s => ({defs: rg('gbBase', [[0, '#ffffff'], [.7, '#eef2f6'], [1, '#b9c2cf']], .4, .35) + lightDefs('gb') + clip('gb') + rg('gbDimple', [[0, '#9aa3b2', .9], [.7, '#c9d1dc', .5], [1, '#fff', 0]], .6, .65) +
  `<pattern id="gbDots" width="7" height="6" patternUnits="userSpaceOnUse"><circle cx="3.5" cy="3" r="2.4" fill="url(#gbDimple)"/><circle cx="0" cy="0" r="2.4" fill="url(#gbDimple)"/><circle cx="7" cy="0" r="2.4" fill="url(#gbDimple)"/><circle cx="0" cy="6" r="2.4" fill="url(#gbDimple)"/><circle cx="7" cy="6" r="2.4" fill="url(#gbDimple)"/></pattern>`,
  g: `<circle r="40" fill="url(#gbBase)"/><g clip-path="url(#gbClip)"><g>${spin(s)}<circle r="44" fill="url(#gbDots)" opacity=".85"/></g></g>${light('gb')}`});
B.puck = () => ({defs: lg('pkSide', [[0, '#2a2c30'], [.5, '#0e0f12'], [1, '#2a2c30']], 1, 0) + rg('pkTop', [[0, '#3a3c42'], [1, '#0a0b0d']], .4, .4) + lg('pkShine', [[0, '#fff', .35], [1, '#fff', 0]]),
  g: `<ellipse cx="0" cy="10" rx="42" ry="16" fill="url(#pkSide)"/><path d="M-42-2V10C-42 19-23 26 0 26S42 19 42 10V-2" fill="url(#pkSide)"/>${Array.from({length: 22}, (_, i) => `<path d="M${-40 + i * 3.8} ${3 + Math.sin(i / 21 * Math.PI) * 12}v8" stroke="#3a3c42" stroke-width="1"/>`).join('')}
    <ellipse cx="0" cy="-2" rx="42" ry="16" fill="url(#pkTop)"/><ellipse cx="0" cy="-2" rx="24" ry="9" fill="none" stroke="#9aa3b2" stroke-width="1.6" opacity=".7"/><text x="0" y="1" font-size="8" font-weight="900" fill="#9aa3b2" text-anchor="middle" font-family="Arial,sans-serif" opacity=".8">ELITE</text>
    <ellipse cx="-12" cy="-8" rx="16" ry="4" fill="url(#pkShine)"/>`});
B.glove = () => ({defs: lg('glRed', [[0, '#ff6a60'], [.45, '#d1121f'], [1, '#5a0008']]) + lg('glCuff', [[0, '#ffffff'], [1, '#c9d1dc']]) + rg('glSpec', [[0, '#fff', .75], [1, '#fff', 0]]),
  // a fist in a glove, side on, punching to the right: rounded padded fist, thumb along the side, laced cuff
  g: `<path d="M-34 24C-44 6-44-20-24-34C-6-46 24-44 38-24C48-8 44 16 28 26C14 34-18 36-34 24Z" fill="url(#glRed)" stroke="#3a0004" stroke-width="1.6"/>
    <path d="M-6 8C-20 8-28-2-24-12C-20-20-8-18-2-10C2-4 2 4-6 8Z" fill="url(#glRed)" stroke="#3a0004" stroke-width="1.4"/>
    <path d="M10-34C22-30 32-20 34-8" stroke="#ff9a90" stroke-width="2" fill="none" opacity=".6"/>
    <path d="M-50 14C-48 30-36 40-22 40L-14 22C-26 22-36 18-42 8Z" fill="url(#glCuff)" stroke="#5a6070" stroke-width="1.2"/>
    <path d="M-44 16l8 4M-40 24l8 4M-34 31l8 3" stroke="#d1121f" stroke-width="2.2" stroke-linecap="round"/>
    <ellipse cx="4" cy="-24" rx="20" ry="9" fill="url(#glSpec)" transform="rotate(-12 4 -24)"/>
    <text x="16" y="12" font-size="9" font-weight="900" fill="#fff" font-family="Arial,sans-serif" font-style="italic" opacity=".9">ELITE</text>`});
return B;
})();

// ---- scenes ----
const st2 = s => s.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a != null ? ` stop-opacity="${a}"` : ''}/>`).join('');
const LG = (id, s, x2 = 0, y2 = 1) => `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}">${st2(s)}</linearGradient>`;
const RG = (id, s, cx = .5, cy = .5, r = .5) => `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${st2(s)}</radialGradient>`;
const rep = (d, b = 0) => ` dur="${d}s" begin="${b ? -b : 0}s" repeatCount="indefinite"`;
const once = (d, b = 0) => ` dur="${d}s" begin="${b}s" fill="freeze"`;
// a ball streaking across: blurred ghosts behind it and wind lines
function ballFly(key, tint, spinDur){
  const b = BALLS[key](spinDur), oval = ['gridiron', 'sherrin', 'rugby'].includes(key);
  const ghost = (x, o) => `<ellipse rx="${oval ? 50 : 46}" ry="${oval ? 26 : 36}" cx="${x}" cy="0" fill="url(#bfGhost${key})" opacity="${o}"/>`;
  return `<svg viewBox="0 0 330 100" xmlns="http://www.w3.org/2000/svg"><defs>${b.defs}${RG('bfGhost' + key, [[0, tint, .9], [.6, tint, .5], [1, tint, 0]])}${LG('bfTrail' + key, [[0, tint, 0], [1, tint, .5]], 1, 0)}</defs>
    ${[30, 44, 58, 70].map((y, i) => `<path d="M${10 + i * 14} ${y}H${200 - i * 10}" stroke="#fff" stroke-width="${1.2 + (i % 2)}" stroke-linecap="round" opacity="0"><animate attributeName="opacity" values="0;.6;0"${rep(.4, i * .1)}/><animateTransform attributeName="transform" type="translate" values="24 0;-24 0"${rep(.4, i * .1)}/></path>`).join('')}
    <path d="M40 50C110 44 190 56 250 50" stroke="url(#bfTrail${key})" stroke-width="18" stroke-linecap="round" fill="none" opacity=".3"/>
    <g transform="translate(272 50)">${ghost(-54, .14)}${ghost(-34, .22)}${ghost(-16, .32)}<g transform="scale(.95)">${b.g}</g></g></svg>`;
}
// golf: a TV shot tracer onto the green, then the ball rolls into the cup
const golfShot = (() => { const b = BALLS.golf(0);
  return `<svg viewBox="0 0 420 210" xmlns="http://www.w3.org/2000/svg"><defs>${b.defs}${RG('gsGreen', [[0, '#7fd06a'], [.7, '#3f9a3a'], [1, '#2a6f2a']], .5, .35, .6)}${RG('gsFringe', [[.85, '#2a6f2a', 0], [1, '#1f5a24', .9]], .5, .5, .5)}
    ${LG('gsPin', [[0, '#ffffff'], [.5, '#ffd23f'], [1, '#ffffff']], 1, 0)}${LG('gsFlag', [[0, '#ff5a4f'], [1, '#b3101c']], 1, 0)}${RG('gsCup', [[0, '#000'], [1, '#1a3a1a']])}${LG('gsTracer', [[0, '#ff3b3b', 0], [.6, '#ff3b3b', .9], [1, '#ffffff']], 1, 0)}
    </defs>
    <ellipse cx="300" cy="178" rx="118" ry="28" fill="url(#gsGreen)"/><ellipse cx="300" cy="178" rx="118" ry="28" fill="url(#gsFringe)"/>
    ${[-60, -30, 0, 30, 60].map((x, i) => `<path d="M${300 + x - 20} 152L${300 + x + 20} 204" stroke="#fff" stroke-opacity="${i % 2 ? .07 : .12}" stroke-width="18"/>`).join('')}
    <ellipse cx="324" cy="176" rx="8" ry="3" fill="url(#gsCup)"/><ellipse cx="322" cy="177" rx="10" ry="2" fill="#000" opacity=".18"/>
    <rect x="322.5" y="58" width="3" height="118" fill="url(#gsPin)"/>
    <path d="M325 60C340 56 352 64 366 60V82C352 86 340 78 325 82Z" fill="url(#gsFlag)"><animate attributeName="d" values="M325 60C340 56 352 64 366 60V82C352 86 340 78 325 82Z;M325 60C340 64 352 56 366 62V84C352 78 340 86 325 82Z;M325 60C340 56 352 64 366 60V82C352 86 340 78 325 82Z"${rep(.9)}/></path>
    <text x="337" y="76" font-size="11" font-weight="900" fill="#fff" font-family="Arial,sans-serif">18</text>
    <path d="M14 196Q150 -40 296 170" stroke="url(#gsTracer)" stroke-width="3.4" stroke-linecap="round" fill="none" stroke-dasharray="520" stroke-dashoffset="520"><animate attributeName="stroke-dashoffset" values="520;0"${once(1.7)}/><animate attributeName="opacity" values="1;1;0" keyTimes="0;.7;1"${once(3.2)}/></path>
    <ellipse cx="296" cy="174" rx="4" ry="1.4" fill="#000" opacity="0"><animate attributeName="opacity" values="0;0;.4;.4;0" keyTimes="0;.5;.55;.85;1"${once(3.2)}/><animate attributeName="cx" values="296;296;324" keyTimes="0;.55;.85"${once(3.2)}/></ellipse>
    <g><g transform="scale(.13)">${b.g}</g><animateMotion path="M14 196Q150 -40 296 170L300 168Q312 167 324 172" keyPoints="0;.86;1" keyTimes="0;.55;.85" calcMode="linear"${once(3.2)}/><animate attributeName="opacity" values="1;1;0" keyTimes="0;.86;.9"${once(3.2)}/></g>
    ${[0, 1, 2, 3, 4].map(i => `<path d="M324 168l${-14 + i * 7} ${-14 - (i % 2) * 6}" stroke="#fff6c8" stroke-width="2" stroke-linecap="round" opacity="0"><animate attributeName="opacity" values="0;0;1;0" keyTimes="0;.86;.9;1"${once(3.2)}/></path>`).join('')}</svg>`; })();
// football: a curling shot into the top corner; the net billows
const goalShot = (() => { const b = BALLS.soccer(.5);
  return `<svg viewBox="0 0 420 210" xmlns="http://www.w3.org/2000/svg"><defs>${b.defs}${LG('gpPost', [[0, '#ffffff'], [.6, '#e3e8ef'], [1, '#9aa3b2']], 1, 0)}${LG('gpBar', [[0, '#ffffff'], [1, '#aab3c2']])}
    <pattern id="gpNet" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0H9M0 0V9" stroke="#fff" stroke-width=".9" opacity=".75"/></pattern>
    ${LG('gpTrail', [[0, '#fff', 0], [1, '#fff', .55]], 1, 0)}</defs>
    <path d="M262 46L304 30H404V196L380 182H262Z" fill="#000" opacity=".12"/>
    <g><path d="M268 50L306 34H398V188L376 176H268Z" fill="url(#gpNet)"/><path d="M306 34V176L268 188M306 176H376" stroke="#fff" stroke-width="1.2" opacity=".6" fill="none"/>
      <animateTransform attributeName="transform" type="translate" values="0 0;0 0;10 -4;-3 1;0 0" keyTimes="0;.5;.58;.7;1"${once(2.8)}/></g>
    <rect x="262" y="42" width="140" height="8" rx="4" fill="url(#gpBar)"/><rect x="262" y="42" width="8" height="156" rx="4" fill="url(#gpPost)"/><rect x="392" y="42" width="8" height="156" rx="4" fill="url(#gpPost)"/><path d="M266 196h130" stroke="#000" stroke-opacity=".2" stroke-width="3"/>
    <path d="M14 190C110 186 190 40 350 74" stroke="url(#gpTrail)" stroke-width="10" stroke-linecap="round" fill="none" opacity=".7" stroke-dasharray="420" stroke-dashoffset="420"><animate attributeName="stroke-dashoffset" values="420;0" keyTimes="0;1"${once(1.4)}/><animate attributeName="opacity" values="1;0"${once(2.4)}/></path>
    <g><g transform="scale(.22)">${b.g}</g><animateMotion path="M14 190C110 186 190 40 350 74" keyPoints="0;1;1" keyTimes="0;.5;1" calcMode="linear"${once(2.8)}/></g>
    ${Array.from({length: 10}, (_, i) => { const a = i * .628; return `<path d="M350 74l${(18 * Math.cos(a)).toFixed(1)} ${(18 * Math.sin(a)).toFixed(1)}" stroke="${i % 2 ? '#ffd23f' : '#fff'}" stroke-width="2.4" stroke-linecap="round" opacity="0"><animate attributeName="opacity" values="0;0;1;0" keyTimes="0;.5;.55;.8"${once(2.8)}/></path>`; }).join('')}</svg>`; })();
// basketball: up and through the hoop; the net swishes
const hoopShot = (() => { const b = BALLS.basketball(.6);
  const net = k => `M328 108L${332 + k} 150M340 110L${342 + k} 152M352 110L${352 + k} 152M364 110L${362 + k} 152M376 108L${372 + k} 150M330 122C344 ${130 + k} 362 ${130 + k} 374 122M332 136C344 ${144 + k} 360 ${144 + k} 372 136`;
  return `<svg viewBox="0 0 420 230" xmlns="http://www.w3.org/2000/svg"><defs>${b.defs}${LG('hpGlass', [[0, '#ffffff', .55], [1, '#cfe3ff', .25]], 1, 1)}${LG('hpRim', [[0, '#ff8a3a'], [1, '#b8460c']])}${LG('hpPole', [[0, '#3a3f4a'], [.5, '#9aa3b2'], [1, '#3a3f4a']], 1, 0)}</defs>
    <path d="M404 230V60h10v170z" fill="url(#hpPole)"/><path d="M404 70h-14v10h14z" fill="url(#hpPole)"/>
    <rect x="312" y="30" width="80" height="56" rx="3" fill="url(#hpGlass)" stroke="#fff" stroke-width="3"/><rect x="336" y="52" width="32" height="24" fill="none" stroke="#ff6a2a" stroke-width="2.4"/>
    <path d="M328 98l2 10h44l2-10z" fill="#9aa3b2"/>
    <path d="${net(0)}" stroke="#fff" stroke-width="1.6" fill="none" opacity=".9"><animate attributeName="d" values="${net(0)};${net(0)};${net(10)};${net(-4)};${net(0)}" keyTimes="0;.62;.7;.82;1"${once(2.6)}/></path>
    <g><g transform="scale(.36)">${b.g}</g><animateMotion path="M20 214Q160 -60 352 104L352 200" keyPoints="0;.8;1" keyTimes="0;.62;.85" calcMode="linear"${once(2.6)}/></g>
    <ellipse cx="352" cy="106" rx="26" ry="5" fill="none" stroke="url(#hpRim)" stroke-width="4"/>
    <path d="M326 106a26 5 0 0 0 52 0" stroke="#b8460c" stroke-width="4" fill="none"/></svg>`; })();
// hockey: the puck slides with a spray of ice
const puckSlide = (() => { const b = BALLS.puck();
  return `<svg viewBox="0 0 300 90" xmlns="http://www.w3.org/2000/svg"><defs>${b.defs}${LG('pkIce', [[0, '#e8f4ff', 0], [1, '#e8f4ff', .7]], 1, 0)}${RG('pkShadow', [[0, '#000', .35], [1, '#000', 0]])}</defs>
    <path d="M20 70H240" stroke="url(#pkIce)" stroke-width="5" stroke-linecap="round" opacity=".8"/>
    ${Array.from({length: 16}, (_, i) => { const x = 210 - (i % 8) * 14, y = 58 - (i % 5) * 7; return `<circle cx="${x}" cy="${y}" r="${1.4 + (i % 3)}" fill="#f4faff" opacity="0"><animate attributeName="opacity" values="0;.95;0"${rep(.5, i * .03)}/><animateTransform attributeName="transform" type="translate" values="0 0;${-18 - (i % 4) * 6} ${-6 - (i % 3) * 4}"${rep(.5, i * .03)}/></circle>`; }).join('')}
    <ellipse cx="254" cy="76" rx="46" ry="8" fill="url(#pkShadow)"/>
    <g transform="translate(254 52) scale(.9)">${b.g}</g></svg>`; })();
// UFC: a punch lands, with a flash and shockwave rings
const punch = (() => { const b = BALLS.glove();
  return `<svg viewBox="-130 -80 260 160" xmlns="http://www.w3.org/2000/svg"><defs>${b.defs}${RG('puFlash', [[0, '#ffffff', 1], [.4, '#fff3c4', .8], [1, '#ffb627', 0]])}${LG('puTrail', [[0, '#fff', 0], [1, '#fff', .4]], 1, 0)}</defs>
    <circle cx="40" r="56" fill="url(#puFlash)" opacity="0"><animate attributeName="opacity" values="0;0;1;0" keyTimes="0;.3;.36;.8"${once(1.8)}/></circle>
    ${[0, .1, .2].map(d => `<circle cx="40" r="10" fill="none" stroke="#fff" stroke-width="3" opacity="0"><animate attributeName="r" values="10;10;70" keyTimes="0;${(.32 + d).toFixed(2)};1"${once(1.8)}/><animate attributeName="opacity" values="0;0;.9;0" keyTimes="0;${(.32 + d).toFixed(2)};${(.4 + d).toFixed(2)};1"${once(1.8)}/></circle>`).join('')}
    ${Array.from({length: 12}, (_, i) => { const a = i * .5236; return `<path d="M${(40 + 20 * Math.cos(a)).toFixed(1)} ${(20 * Math.sin(a)).toFixed(1)}L${(40 + 52 * Math.cos(a)).toFixed(1)} ${(52 * Math.sin(a)).toFixed(1)}" stroke="${i % 2 ? '#ffd23f' : '#ffffff'}" stroke-width="3" stroke-linecap="round" opacity="0"><animate attributeName="opacity" values="0;0;1;0" keyTimes="0;.32;.4;.7"${once(1.8)}/></path>`; }).join('')}
    <g><path d="M-120 0H-40" stroke="url(#puTrail)" stroke-width="16" stroke-linecap="round"/><g transform="scale(.8)">${b.g}</g>
      <animateTransform attributeName="transform" type="translate" values="-120 0;0 0;-8 0" keyTimes="0;.34;1" calcMode="spline" keySplines=".5 0 .9 .4;.2 .6 .4 1"${once(1.8)}/></g></svg>`; })();
window.GW_SPORT_ART = {f1car, motoBike, BALLS, ballFly, golfShot, goalShot, hoopShot, puckSlide, punch};

})();
