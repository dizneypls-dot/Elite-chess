/* Elite Chess core: helpers, settings, sound, profile and rating, the board component, tasks and screens.
   Everything shared lives on window.GW; play.js and learn.js add their screens to it. */
(() => {
const C = window.Chess, D = window.GW_DATA, LRN = window.GW_LEARN;
const {opp, sqName, sqIndex, legal, apply, san, uci, fromUci, inCheck, findKing, Engine} = C;
const $ = id => document.getElementById(id);
const now = () => performance.now();
const sleep = ms => new Promise(r => setTimeout(r, ms));
const NAME = {w:'White', b:'Black'};
const PIECE_NAME = {K:'king', Q:'queen', R:'rook', B:'bishop', N:'knight', P:'pawn'};
const esc = t => String(t).replace(/[&<>"]/g, ch => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;'})[ch]);
const store = {
  get(k, d){ try { const v = localStorage.getItem(k); return v ? Object.assign(d, JSON.parse(v)) : d; } catch (_) { return d; } },
  set(k, v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch (_) {} }
};
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const rnd = n => Math.floor(Math.random() * n);

/* ---------- Pieces as CSS classes pc-wK … pc-bP (any piece set, recoloured by the chosen colourway) ---------- */
const PIECE_KEYS = ['wK', 'wQ', 'wR', 'wB', 'wN', 'wP', 'bK', 'bQ', 'bR', 'bB', 'bN', 'bP'];
const pieceSets = () => Object.assign({cburnett: {name:'Classic', author:'Colin M.L. Burnett', license:'GPLv2+', svg:D.PIECE_SVG}}, D.PIECE_SETS || {});
const hexRGB = h => { h = h.replace('#', ''); if (h.length === 3) h = h.replace(/./g, c => c + c); const n = parseInt(h, 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
const rgbHex = c => '#' + c.map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
// Map every colour in a piece by its brightness onto the colourway: dark → ink (white pieces) or body (black pieces)
function recolor(svg, side, cw){
  if (!cw || !cw.w) return svg;
  const c = cw[side], lo = hexRGB(side === 'w' ? c.ink : c.body), hi = hexRGB(side === 'w' ? c.body : c.ink);
  const map = hex => { const [r, g, b] = hexRGB(hex), t = (0.299 * r + 0.587 * g + 0.114 * b) / 255; return rgbHex(lo.map((v, i) => v + (hi[i] - v) * t)); };
  return svg.replace(/(?<!url\(|href=")#([0-9a-f]{6}|[0-9a-f]{3})(?![0-9a-z-])/gi, m => map(m))
    .replace(/((?:fill|stroke|stop-color)\s*[:=]\s*"?)(white|black)\b/gi, (m, p, w) => p + map(w.toLowerCase() === 'white' ? '#fff' : '#000'));
}
// Premium finish: the piece drawn inside a 100×100 frame with a thin contrasting rim (so it reads on any square),
// a soft top-left highlight and a darker base. Works for every set because the original keeps its own viewBox.
const stripAnim = svg => svg.replace(/<animate(Transform)?\b[^>]*\/>/g, '');
// The parts of the premium finish: rim (behind), the piece, sheen (on top). Built around a still copy of the piece.
function premiumParts(svg, side, cw){
  const open = svg.match(/<svg[^>]*>/)[0];
  let attrs = open.slice(4, -1).replace(/\s(width|height|id|x|y)="[^"]*"/g, '');
  if (!/viewBox=/.test(attrs)){
    const w = parseFloat((open.match(/\swidth="([\d.]+)/) || [])[1]) || 45, h = parseFloat((open.match(/\sheight="([\d.]+)/) || [])[1]) || w;
    attrs += ` viewBox="0 0 ${w} ${h}"`;
  }
  const inner = svg.slice(open.length, svg.lastIndexOf('</svg>'));
  const body = cw && cw.w ? cw[side].body : side === 'w' ? '#ffffff' : '#000000';
  const [r, g, b] = hexRGB(body), light = (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.45;
  const rim = light ? 'flood-color="#000" flood-opacity=".5"' : 'flood-color="#fff" flood-opacity=".62"';
  const head = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 100 100" style="color-scheme:light only"><defs>' +
    '<filter id="gwSil"><feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0"/></filter>' +
    `<filter id="gwRim" x="-10%" y="-10%" width="120%" height="120%"><feMorphology in="SourceAlpha" operator="dilate" radius="1.5" result="d"/><feGaussianBlur in="d" stdDeviation=".35" result="db"/><feFlood ${rim}/><feComposite operator="in" in2="db"/></filter>` +
    '<linearGradient id="gwSheen" x1="0" y1="0" x2=".55" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".42"/><stop offset=".38" stop-color="#fff" stop-opacity=".06"/><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".26"/></linearGradient>' +
    `<svg id="gwSt" x="0" y="0" width="100" height="100" ${attrs}>${stripAnim(inner)}</svg>` +
    '<mask id="gwMask"><use href="#gwSt" xlink:href="#gwSt" filter="url(#gwSil)"/></mask></defs>';
  const rimG = '<g filter="url(#gwRim)"><use href="#gwSt" xlink:href="#gwSt"/></g>', sheen = '<rect width="100" height="100" fill="url(#gwSheen)" mask="url(#gwMask)"/>';
  return {
    full: head + rimG + `<svg x="0" y="0" width="100" height="100" ${attrs}>${inner}</svg>` + sheen + '</svg>',
    rim: head + rimG + '</svg>',
    sheen: head + sheen + '</svg>',
    piece: `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 100 100"><svg x="0" y="0" width="100" height="100" ${attrs}>${inner}</svg></svg>`
  };
}
const premium = (svg, side, cw) => premiumParts(svg, side, cw).full;
// Still pieces for previews and when motion is off
const finish = (svg, side, cw) => { const s = recolor(stripAnim(svg), side, cw); return settings.finish === false ? s : premium(s, side, cw); };
const svgURL = s => `url("data:image/svg+xml,${encodeURIComponent(s)}")`;
// Draw an SVG once into a PNG (filters are costly to redraw every animation frame)
async function bake(svg, size = 160){
  const img = new Image();
  img.src = 'data:image/svg+xml,' + encodeURIComponent(svg);
  await img.decode();
  const cv = document.createElement('canvas'); cv.width = cv.height = size;
  cv.getContext('2d').drawImage(img, 0, 0, size, size);
  return cv.toDataURL('image/png');
}
const pieceSheet = document.createElement('style');
document.head.appendChild(pieceSheet);
let pieceKey = '';
function applyPieces(){
  const sets = pieceSets(), set = sets[settings.pieces] || sets.cburnett;
  const cw = (D.COLORWAYS || []).find(x => x.id === settings.colorway);
  const anim = !!set.animated && settings.animPieces !== false;
  const key = (settings.pieces || '') + '|' + (settings.colorway || '') + '|' + (settings.finish !== false) + '|' + anim;
  if (key === pieceKey) return;
  pieceKey = key;
  const kids = KIDS_CSS;
  pieceSheet.textContent = PIECE_KEYS.map(k => `.pc-${k}{background-image:${svgURL(finish(set.svg[k], k[0], set.themed ? null : cw))}!important}`).join('\n') + kids;
  // Animated sets: the moving piece between a baked rim (below) and a baked sheen (above)
  if (anim){
    const myKey = key;
    Promise.all(PIECE_KEYS.map(async k => {
      const raw = set.svg[k];
      if (settings.finish === false) return `.pc-${k}{background-image:${svgURL(raw)}!important}`;
      const parts = premiumParts(raw, k[0], null), [rim, sheen] = await Promise.all([bake(parts.rim), bake(parts.sheen)]);
      return `.pc-${k}{background-image:url("${sheen}"),${svgURL(parts.piece)},url("${rim}")!important}`;
    })).then(rules => { if (pieceKey === myKey) pieceSheet.textContent = rules.join('\n') + kids; }).catch(() => {});
  }
}
const KIDS_CSS =
    // stars for the kids' collecting games
`\n.kids-collect .pc-bP{background-image:url("data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><path d="M22.5 5l5.2 11 12 1.4-8.9 8.2 2.4 11.9-10.7-6-10.7 6 2.4-11.9-8.9-8.2 12-1.4z" fill="#ffc531" stroke="#c98a00" stroke-width="1.8" stroke-linejoin="round"/></svg>')}")!important}`;
;
// One piece as an image, for previews (set and colourway can differ from the current ones)
const pieceImg = (k, setId, cwId) => { const sets = pieceSets(), set = sets[setId] || sets.cburnett; return `url("data:image/svg+xml,${encodeURIComponent(finish(set.svg[k], k[0], set.themed ? null : (D.COLORWAYS || []).find(x => x.id === cwId)))}")`; };
const avCache = new Map();
const avatarSVG = (who, mood = who.mood || '') => { const k = mood + JSON.stringify(who.look); if (!avCache.has(k)) avCache.set(k, D.avatar(who.look, mood)); return avCache.get(k); };

/* ---------- Settings ---------- */
const settings = store.get('gw-settings', {theme:'greenwood', pieces:'cburnett', colorway:'natural', sound:true, soundPack:'real', volume:0.8, fx:true, fxPack:'', autoPack:true, lastAutoPack:'', hemisphere:'auto',
  finish:true, hints:true, coords:true, premove:true, appearance:'auto', haptics:true, autoQueen:false, confirmResign:true, moveConfirm:false, boardAnim:true});
if (!D.THEMES.some(t => t.id === settings.theme)) settings.theme = 'greenwood';
// 1.0–1.3 saved a dark default; go back to the original look (follow the device) once
if (!settings.lookV2){ settings.appearance = 'auto'; settings.lookV2 = true; }
const boards = [];
if (!pieceSets()[settings.pieces]) settings.pieces = 'cburnett';
if (!settings.charV1){ if (settings.fxPack && settings.charPieces !== false && pieceSets()['th-' + settings.fxPack]) settings.pieces = 'th-' + settings.fxPack; settings.charV1 = true; }
if (!settings.sndV2){ if (!settings.soundPack || settings.soundPack === 'wood') settings.soundPack = 'real'; settings.sndV2 = true; }
applyPieces();
// Seasonal and holiday packs: a board, a piece set, a colourway and a little weather on the board
// The player's own board and pieces are remembered whenever a pack takes over, so they can always go back
function applyPack(p){
  if (!p) return;
  if (!settings.fxPack || !settings.ownLook) settings.ownLook = {theme: settings.theme, pieces: settings.pieces, colorway: settings.colorway};
  settings.theme = p.board; settings.colorway = p.colorway; settings.fxPack = p.id;
  // character pieces (pawn as a bauble, bishop as a tree …) unless the player prefers the classic shapes
  settings.pieces = settings.charPieces !== false && pieceSets()[p.pieces] ? p.pieces : (p.alt || 'cburnett');
  scheduleFly(true);
}
const ownLook = () => Object.assign({theme:'greenwood', pieces:'cburnett', colorway:'natural'}, settings.ownLook || {});
function restoreOwnLook(){
  const o = ownLook();
  settings.theme = o.theme; settings.pieces = o.pieces; settings.colorway = o.colorway; settings.fxPack = '';
}
const currentPack = () => D.packsFor ? D.packsFor(new Date(), settings.hemisphere)[0] : null;
// With auto on, a new holiday or season switches the look once; anything the player picks afterwards sticks
function autoPack(){
  if (!settings.autoPack) return null;
  const p = currentPack();
  if (!p || p.id === settings.lastAutoPack) return null;
  settings.lastAutoPack = p.id;
  applyPack(p);
  return p;
}
const FX_SHAPES = {
  snow: ['<circle cx="10" cy="10" r="6" fill="#fff"/>'],
  leaves: ['<path d="M3 17C3 7 10 3 17 3C17 12 12 17 3 17Z" fill="#e07b2a"/>', '<path d="M3 17C3 7 10 3 17 3C17 12 12 17 3 17Z" fill="#b5452a"/>', '<path d="M3 17C3 7 10 3 17 3C17 12 12 17 3 17Z" fill="#f2b33d"/>'],
  petals: ['<ellipse cx="10" cy="10" rx="7" ry="4.5" fill="#ffb3cf"/>', '<ellipse cx="10" cy="10" rx="7" ry="4.5" fill="#ffd6e7"/>'],
  hearts: ['<path d="M10 17C3 12 2 5 6 4c2-.4 4 1 4 3 0-2 2-3.4 4-3 4 1 3 8-4 13z" fill="#ff4f7b"/>', '<path d="M10 17C3 12 2 5 6 4c2-.4 4 1 4 3 0-2 2-3.4 4-3 4 1 3 8-4 13z" fill="#ff9fb7"/>'],
  bats: ['<path d="M10 9C9 7 6 6 2 7c1.5.8 2 2 2 3.5 1.5-.7 3-.7 4 .7.6-.6 1.3-1 2-1s1.4.4 2 1c1-1.4 2.5-1.4 4-.7 0-1.5.5-2.7 2-3.5-4-1-7 0-8 2z" fill="#2a1240"/>'],
  confetti: ['<rect x="6" y="3" width="8" height="14" rx="2" fill="#fbbf24"/>', '<rect x="6" y="3" width="8" height="14" rx="2" fill="#ef476f"/>', '<rect x="6" y="3" width="8" height="14" rx="2" fill="#22b8b0"/>', '<rect x="6" y="3" width="8" height="14" rx="2" fill="#8b7cff"/>'],
  sparkles: ['<path d="M10 1l2 7 7 2-7 2-2 7-2-7-7-2 7-2z" fill="#ffd35c"/>', '<path d="M10 1l2 7 7 2-7 2-2 7-2-7-7-2 7-2z" fill="#ff9f1c"/>'],
  stars: ['<path d="M10 1l2.6 5.6 6 .7-4.5 4.1 1.3 6L10 14.4l-5.4 3 1.3-6L1.4 7.3l6-.7z" fill="#fcd34d"/>', '<path d="M10 1l2.6 5.6 6 .7-4.5 4.1 1.3 6L10 14.4l-5.4 3 1.3-6L1.4 7.3l6-.7z" fill="#e5e7eb"/>'],
  shamrocks: ['<g fill="#22a34a"><circle cx="10" cy="6" r="4"/><circle cx="6" cy="11" r="4"/><circle cx="14" cy="11" r="4"/></g>'],
  lanterns: ['<rect x="5" y="4" width="10" height="13" rx="4" fill="#e11d2e"/><rect x="7" y="2" width="6" height="2" fill="#ffd35c"/><rect x="7" y="17" width="6" height="2" fill="#ffd35c"/>']
};
function renderFx(frame){
  let fx = frame.querySelector(':scope > .fx');
  const pack = settings.fx && settings.fxPack ? (D.PACKS || []).find(p => p.id === settings.fxPack) : null;
  const kind = pack && FX_SHAPES[pack.fx] ? pack.fx : '';
  if (!kind){ if (fx) fx.remove(); return; }
  if (fx && fx.dataset.kind === kind) return;
  if (!fx){ fx = document.createElement('div'); fx.className = 'fx'; fx.setAttribute('aria-hidden', 'true'); frame.appendChild(fx); }
  fx.dataset.kind = kind;
  const shapes = FX_SHAPES[kind], rise = kind === 'lanterns';
  let h = '';
  for (let i = 0; i < (kind === 'bats' ? 6 : 9); i++){
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">${shapes[i % shapes.length]}</svg>`;
    const big = {bats:2.2, lanterns:1.6, leaves:1.3, hearts:1.25}[kind] || 1;
    h += `<i class="${rise ? 'rise' : ''}" style="left:${(i * 11 + rnd(8)) % 96}%;--d:${(7 + rnd(60) / 10).toFixed(1)}s;--w:${(-6 + rnd(13))}cqi;--s:${((2.4 + rnd(16) / 10) * big).toFixed(1)}cqi;animation-delay:-${rnd(90) / 10}s;background-image:url(&quot;data:image/svg+xml,${encodeURIComponent(svg)}&quot;)"></i>`;
  }
  fx.innerHTML = h;
}
/* ---------- Flyovers: Santa's sleigh, bats, a dragon dance … cross the board now and then ---------- */
function flyover(frame, packId){
  const S = window.GW_SEASONAL, scenes = S && S.FLY[packId];
  if (!scenes || !scenes.length) return;
  const sc = scenes[rnd(scenes.length)], pick = a => Array.isArray(a) ? a[0] + Math.random() * (a[1] - a[0]) : a;
  let fx = frame.querySelector(':scope > .fx');
  if (!fx){ fx = document.createElement('div'); fx.className = 'fx'; fx.setAttribute('aria-hidden', 'true'); frame.appendChild(fx); }
  for (let i = 0; i < (sc.count || 1); i++){
    const el = document.createElement('div'), delay = i * (sc.motion === 'burst' ? .7 : 1.1);
    el.className = `fly ${sc.motion}${sc.flip ? ' flip' : ''}`;
    el.style.cssText = `--w:${sc.w}cqi;--d:${sc.dur}s;--y:${pick(sc.y || [8, 50]).toFixed(1)}cqi;--x:${pick(sc.x || [6, 78]).toFixed(1)}cqi;animation-delay:${delay}s`;
    el.innerHTML = `<div class="fly-in">${sc.svg}</div>`;
    fx.appendChild(el);
    setTimeout(() => el.remove(), (sc.dur + delay) * 1000 + 400);
  }
}
function flyNow(){
  if (!settings.fx || !settings.fxPack || document.hidden) return;
  try { if (matchMedia('(prefers-reduced-motion: reduce)').matches) return; } catch (_) {}
  const b = boards.find(x => x.frame.offsetParent && x.frame.getBoundingClientRect().width > 160);
  if (b) flyover(b.frame, settings.fxPack);
}
let flyTimer = null;
function scheduleFly(soon){
  clearTimeout(flyTimer);
  flyTimer = setTimeout(() => { flyNow(); scheduleFly(false); }, soon ? 2500 : 30000 + rnd(30000));
}
function applySettings(){
  const t = D.THEMES.find(x => x.id === settings.theme) || D.THEMES[0];
  const r = document.documentElement.style;
  r.setProperty('--sq-l', t.l); r.setProperty('--sq-d', t.d); r.setProperty('--board-bg', t.bg || 'transparent');
  r.setProperty('--co-l', t.cl || t.d); r.setProperty('--co-d', t.cd || t.l);
  applyPieces();
  sfx.setVolume(settings.volume);
  document.documentElement.toggleAttribute('data-glass', !!t.glass);
  // Appearance: dark (default), light, or follow the device
  const html = document.documentElement;
  if (settings.appearance === 'auto') html.removeAttribute('data-theme'); else html.setAttribute('data-theme', settings.appearance);

  store.set('gw-settings', settings);
  boards.forEach(b => { b.render(); renderFx(b.frame); });
}

/* ---------- Profile, rating, achievements ---------- */
const profile = store.get('gw-profile', {
  name:'', look:Object.assign({}, D.PEOPLE.you.look), rating:800, history:[], games:0, wins:0, draws:0, losses:0,
  puzzleRating:800, solved:[], streak:0, bestStreak:0, rushBest:0, achievements:[], trophies:{}, lessons:{}, cups:{},
  reviews:0, onboarded:false, best:0
});
const saveProfile = () => store.set('gw-profile', profile);
const me = () => ({name: profile.name || 'You', look: profile.look, elo: profile.rating});
function unlock(id){
  if (profile.achievements.includes(id)) return;
  const a = D.ACHIEVEMENTS.find(x => x.id === id);
  if (!a) return;
  profile.achievements.push(id);
  saveProfile();
  toast(`<b>${a.icon} Achievement unlocked</b><br>${esc(a.name)}: ${esc(a.desc)}`);
  sfx.success();
}
// Elo update after a rated game against a bot. score: 1 win, 0.5 draw, 0 loss
function rateGame(botElo, score){
  const R = profile.rating, E = 1 / (1 + Math.pow(10, (botElo - R) / 400));
  const K = profile.games < 20 ? 40 : R < 2000 ? 24 : 16;
  const delta = Math.round(K * (score - E));
  profile.rating = Math.max(100, R + delta);
  profile.best = Math.max(profile.best || 0, profile.rating);
  profile.history.push({t:Date.now(), r:profile.rating});
  if (profile.history.length > 400) profile.history.shift();
  for (const th of [1200, 1600, 2000]) if (profile.rating >= th) unlock('rating-' + th);
  saveProfile();
  return delta;
}
/* ---------- XP, levels and daily goals ---------- */
// Level n needs 50·n·(n−1) XP in total: 100 XP for level 2, 300 for 3, 600 for 4 …
const levelOf = xp => Math.floor((1 + Math.sqrt(1 + (xp || 0) / 12.5)) / 2);
const xpForLevel = n => 50 * n * (n - 1);
const GOALS = [
  {id:'win',     text:'Win a game against a bot',   need:1,  xp:40},
  {id:'game',    text:'Play 2 games',               need:2,  xp:30},
  {id:'puzzle',  text:'Solve 5 puzzles',            need:5,  xp:30},
  {id:'puzzle',  text:'Solve 10 puzzles',           need:10, xp:50},
  {id:'daily',   text:'Solve the daily puzzle',     need:1,  xp:25},
  {id:'lesson',  text:'Finish a lesson',            need:1,  xp:40},
  {id:'rush',    text:'Score 8 in Puzzle Rush',     need:8,  xp:40, max:true},
  {id:'review',  text:'Review one of your games',   need:1,  xp:25},
  {id:'online',  text:'Play an online game',        need:1,  xp:40}
];
const today = () => Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 86400000);
// Three goals a day, the same for the whole day, different from yesterday
function dailyGoals(){
  const d = today();
  if (!profile.goals || profile.goals.day !== d){
    let seed = d * 2654435761 % 4294967296;
    const rand = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
    const pool = GOALS.map((g, i) => i).filter(i => GOALS[i].id !== 'online' || profile.onlinePlayed);
    const pick = [];
    while (pick.length < 3){ const i = pool[Math.floor(rand() * pool.length)]; if (!pick.some(j => GOALS[j].id === GOALS[i].id)) pick.push(i); }
    profile.goals = {day: d, list: pick.map(i => ({g: i, n: 0, done: false})), bonus: false};
    saveProfile();
  }
  return profile.goals.list.map(x => Object.assign({}, GOALS[x.g], {n: x.n, done: x.done}));
}
function addXP(n, why){
  const before = levelOf(profile.xp);
  profile.xp = (profile.xp || 0) + n;
  const after = levelOf(profile.xp);
  saveProfile();
  if (after > before){ setTimeout(() => { toast(`<b>⭐ Level ${after}!</b><br>Keep it up.`); sfx.fanfare(); }, 600); }
  if (why) toast(`<b>+${n} XP</b> · ${esc(why)}`);
  if (window.GW && GW.renderRailMe) GW.renderRailMe();
}
// Record progress toward today's goals (and give a little XP for the activity itself)
function track(id, amount = 1){
  dailyGoals();
  for (const x of profile.goals.list){
    const g = GOALS[x.g];
    if (g.id !== id || x.done) continue;
    x.n = g.max ? Math.max(x.n, amount) : x.n + amount;
    if (x.n >= g.need){ x.n = g.need; x.done = true; addXP(g.xp, `Goal done: ${g.text}`); }
  }
  if (!profile.goals.bonus && profile.goals.list.every(x => x.done)){ profile.goals.bonus = true; addXP(75, 'All three daily goals'); }
  if (id === 'online') profile.onlinePlayed = true;
  saveProfile();
}

// Days in a row with at least one game or puzzle
function markDay(){
  const day = Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 86400000);
  if (profile.lastDay === day) return;
  profile.dayStreak = profile.lastDay === day - 1 ? (profile.dayStreak || 0) + 1 : 1;
  profile.bestDayStreak = Math.max(profile.bestDayStreak || 0, profile.dayStreak);
  profile.lastDay = day;
  saveProfile();
  if (profile.dayStreak > 1) toast(`<b>🔥 ${profile.dayStreak}-day streak</b><br>Come back tomorrow to keep it going.`);
}
// Streak shown on Home: it lapses if yesterday was missed
const dayStreak = () => {
  const day = Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 86400000);
  return profile.lastDay >= day - 1 ? (profile.dayStreak || 0) : 0;
};
function recordResult(score, botElo){
  markDay();
  profile.games++;
  track('game');
  if (score === 1) track('win');
  profile.xp = (profile.xp || 0) + (score === 1 ? 15 : score === 0.5 ? 8 : 5);
  if (score === 1) profile.wins++; else if (score === 0.5) profile.draws++; else profile.losses++;
  unlock('first-game');
  if (botElo != null && score === 1){
    unlock('first-win');
    for (const th of [1000, 1500, 2000, 2500, 3000]) if (botElo >= th) unlock('beat-' + th);
  }
  saveProfile();
}

/* ---------- Toasts and modals ---------- */
function toast(html){
  let box = $('toasts');
  if (!box){ box = document.createElement('div'); box.id = 'toasts'; document.body.appendChild(box); }
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = html;
  box.appendChild(t);
  setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 400); }, 3600);
}
let modalClose = null;
function modal(html, {onClose, wide} = {}){
  closeModal();
  const back = document.createElement('div');
  back.className = 'modal-back';
  back.id = 'modal';
  back.innerHTML = `<div class="modal${wide ? ' wide' : ''}" role="dialog" aria-modal="true">${html}</div>`;
  back.addEventListener('click', e => { if (e.target === back) closeModal(); });
  document.body.appendChild(back);
  modalClose = onClose || null;
  return back.querySelector('.modal');
}
function closeModal(){
  const m = $('modal');
  if (m){ m.remove(); const f = modalClose; modalClose = null; if (f) f(); }
}

/* ---------- Haptics (phones that support vibration) ---------- */
const buzz = pattern => { if (settings.haptics && navigator.vibrate) try { navigator.vibrate(pattern); } catch (_) {} };

/* ---------- Sound ----------
   Sound packs are rendered once into audio buffers when sound is first unlocked: a piece meeting the board is modelled
   as a short contact noise exciting a handful of decaying wooden (or stone) resonances, with small random variations
   so repeated moves never sound machine-like. There are no musical chimes: check, checkmate and game start are piece taps. 'classic' keeps the old synth. */
const SOUND_PACKS = [
  {id:'real', name:'Wooden board', desc:'Real Staunton pieces on a wooden board, recorded', recorded:'wood'},
  {id:'hall', name:'Tournament hall', desc:'Recorded from across a quiet playing hall', recorded:'hall'},
  {id:'marble', name:'Marble', desc:'A real piece on alabaster stone, recorded', recorded:'stone'},
  {id:'wood', name:'Modelled wood', desc:'Synthesised wooden knocks'},
  {id:'stone', name:'Modelled stone', desc:'Synthesised stone clicks'},
  {id:'soft', name:'Felt', desc:'Quiet and soft, for late nights'},
  {id:'classic', name:'Classic', desc:'The original electronic sounds'}
];
const sfx = (() => {
  let ctx = null, master = null, bank = null, bankFor = '', volume = 0.8;
  const R = (a, b) => a + Math.random() * (b - a);
  // Body resonances for each pack: [frequency Hz, amplitude, decay seconds]
  const BODY = {
    wood:  {modes:[[155, .55, .03], [410, .45, .022], [760, .8, .03], [1180, .45, .018], [1850, .28, .01], [2900, .15, .006]], click:.55, clickMs:2.2, tone:.32},
    stone: {modes:[[300, .3, .02], [1350, .55, .045], [2450, .6, .04], [3700, .4, .03], [5200, .22, .02]], click:.5, clickMs:1.2, tone:.75},
    soft:  {modes:[[130, .6, .035], [320, .4, .025], [560, .35, .02], [900, .15, .012]], click:.2, clickMs:4, tone:.12}
  };
  function render(sec, fn){
    const sr = ctx.sampleRate, n = Math.ceil(sec * sr), buf = ctx.createBuffer(1, n, sr), d = buf.getChannelData(0);
    fn(d, sr);
    let peak = 0; for (let i = 0; i < n; i++) peak = Math.max(peak, Math.abs(d[i]));
    if (peak > 0) { const k = 0.9 / peak; for (let i = 0; i < n; i++) d[i] *= k; }
    return buf;
  }
  // One contact: noise burst through a one-pole low-pass, then damped sine modes
  function hit(d, sr, at, body, {gain = 1, bright = 0, pitch = 1} = {}){
    const s0 = Math.floor(at * sr), lp = Math.min(.95, body.tone + bright * .25);
    let y = 0;
    const clickN = Math.floor(body.clickMs / 1000 * sr * 3);
    for (let i = 0; i < clickN && s0 + i < d.length; i++){
      y += lp * ((Math.random() * 2 - 1) - y);
      d[s0 + i] += y * body.click * gain * Math.exp(-i / (body.clickMs / 1000 * sr));
    }
    for (const [f0, amp, dec] of body.modes){
      const f = f0 * pitch * R(.95, 1.05), ph = Math.random() * 6.28, decay = dec * R(.85, 1.15), w = 2 * Math.PI * f / sr;
      const a = amp * gain * (f0 > 1500 ? 1 + bright : 1), n = Math.min(d.length - s0, Math.floor(decay * sr * 7));
      for (let i = 0; i < n; i++) d[s0 + i] += a * Math.sin(w * i + ph) * Math.exp(-i / (decay * sr)) * Math.min(1, i / (sr * .0006));
    }
  }

  // Sounds are rendered on first use (a few ms each) and up to four variations are kept per sound
  function buildBank(pack){
    const body = BODY[pack] || BODY.wood;
    const one = fn => ({make: fn, n: 1, list: []}), many = fn => ({make: fn, n: 4, list: []});
    bank = {
      move: many(() => render(.25, (d, sr) => hit(d, sr, .002, body))),
      moveSelf: many(() => render(.25, (d, sr) => hit(d, sr, .002, body, {bright: .15, pitch: 1.04}))),
      capture: many(() => render(.3, (d, sr) => { hit(d, sr, .002, body, {gain: 1.15, bright: .6, pitch: 1.08}); hit(d, sr, .024, body, {gain: .55, bright: .3, pitch: 1.25}); })),
      castle: many(() => render(.38, (d, sr) => { hit(d, sr, .002, body); hit(d, sr, .13, body, {gain: .85, pitch: .96}); })),
      check: many(() => render(.4, (d, sr) => { hit(d, sr, .002, body, {bright: .3}); hit(d, sr, .13, body, {gain: .8, pitch: 1.03}); })),
      mate: one(() => render(.6, (d, sr) => { hit(d, sr, .002, body, {gain: 1.2, bright: .5}); hit(d, sr, .14, body, {gain: .9}); hit(d, sr, .3, body, {gain: 1}); })),
      promote: one(() => render(.35, (d, sr) => { hit(d, sr, .002, body); hit(d, sr, .11, body, {gain: .55, pitch: 1.05}); })),
      illegal: one(() => render(.2, (d, sr) => hit(d, sr, .002, BODY.soft, {gain: .7, pitch: .7}))),
      start: one(() => render(.4, (d, sr) => { hit(d, sr, .002, body, {gain: .6}); hit(d, sr, .16, body, {gain: .65, pitch: 1.05}); })),
      wrong: one(() => render(.25, (d, sr) => hit(d, sr, .002, BODY.soft, {gain: .8, pitch: .65}))),
      lowTime: one(() => render(.35, (d, sr) => { hit(d, sr, .002, body, {gain: .5, pitch: 1.2}); hit(d, sr, .14, body, {gain: .5, pitch: 1.2}); })),
      tick: one(() => render(.06, (d, sr) => hit(d, sr, .001, BODY.stone, {gain: .3, pitch: 2})))
    };
    bankFor = pack;
    // warm up the common sounds while the page is idle
    const idle = window.requestIdleCallback || (f => setTimeout(f, 200));
    const warm = ['moveSelf', 'move', 'capture', 'castle', 'check', 'moveSelf', 'move', 'capture'];
    const step = () => { const k = warm.shift(); if (!k || bankFor !== pack) return; const e = bank[k]; if (e.list.length < e.n) e.list.push(e.make()); idle(step); };
    idle(step);
  }
  function unlockAudio(){
    if (!ctx){
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      ctx = new AC();
      master = ctx.createGain(); master.gain.value = volume; master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    decodeRecorded();
  }
  // Recorded packs: real pieces on real boards (sounds.js), decoded once when sound is unlocked
  const rec = {};
  function decodeRecorded(){
    const S = window.GW_SOUNDS;
    if (!S || rec.started || !ctx) return;
    rec.started = true;
    const dec = b64 => new Promise((ok, no) => {
      const bin = atob(b64), u = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
      const p = ctx.decodeAudioData(u.buffer, ok, no);
      if (p && p.then) p.then(ok, no);
    });
    for (const [pack, sounds] of Object.entries(S)){
      rec[pack] = {};
      for (const [name, list] of Object.entries(sounds)) Promise.all(list.map(dec)).then(bufs => { rec[pack][name] = bufs; }).catch(() => {});
    }
  }
  const recPack = () => { const p = SOUND_PACKS.find(x => x.id === settings.soundPack); return p && p.recorded && rec[p.recorded] && rec[p.recorded].moveSelf ? rec[p.recorded] : null; };
  function playRec(P, name, delay = 0, gain = 1){
    const list = P[name] || P.moveSelf;
    const src = ctx.createBufferSource(); src.buffer = list[rnd(list.length)];
    src.playbackRate.value = R(.97, 1.03);
    const g = ctx.createGain(); g.gain.value = gain;
    src.connect(g); g.connect(master); src.start(ctx.currentTime + delay);
  }
  const ensure = () => { const p = SOUND_PACKS.find(x => x.id === settings.soundPack); const body = p && p.recorded ? 'wood' : (settings.soundPack || 'wood'); if (settings.soundPack !== 'classic' && bankFor !== body) buildBank(body); };
  function playBuf(name, gain = 1){
    if (!settings.sound || !ctx || ctx.state !== 'running') return;
    ensure();
    const Rp = recPack();
    if (Rp){
      if (name === 'move' || name === 'moveSelf'){ playRec(Rp, name, 0, .9); return; }
      if (name === 'capture'){ playRec(Rp, 'capture'); return; }
      if (name === 'castle'){ playRec(Rp, 'moveSelf', 0, .9); playRec(Rp, 'move', .12, .75); return; }
      if (name === 'check'){ playRec(Rp, 'moveSelf', 0, .9); playRec(Rp, 'move', .13, .8); return; }
      if (name === 'mate'){ playRec(Rp, 'capture', 0, 1); playRec(Rp, 'moveSelf', .14, .9); playRec(Rp, 'moveSelf', .3, 1); return; }
      if (name === 'promote'){ playRec(Rp, 'moveSelf', 0, .9); playRec(Rp, 'move', .11, .55); return; }
      if (name === 'start'){ playRec(Rp, 'move', 0, .55); playRec(Rp, 'moveSelf', .16, .6); return; }
      if (name === 'lowTime'){ playRec(Rp, 'move', 0, .5); playRec(Rp, 'move', .14, .5); return; }
    }
    const e = bank[name];
    if (!e) return;
    if (!e.list.length || (e.list.length < e.n && Math.random() < .5)) e.list.push(e.make());
    const src = ctx.createBufferSource(); src.buffer = e.list[rnd(e.list.length)];
    src.playbackRate.value = R(.985, 1.015);
    const g = ctx.createGain(); g.gain.value = gain;
    src.connect(g); g.connect(master); src.start();
  }
  /* --- the classic synth, kept as its own pack --- */
  let noise = null;
  function env(g, t, peak, decay){ g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(peak, t + 0.002); g.gain.exponentialRampToValueAtTime(0.0001, t + decay); }
  function knock(t, freq, thump, gain, decay){
    if (!noise){ noise = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.2), ctx.sampleRate); const d = noise.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 4); }
    const src = ctx.createBufferSource(); src.buffer = noise;
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = freq; bp.Q.value = 1.4;
    const g = ctx.createGain(); env(g, t, gain, decay);
    src.connect(bp); bp.connect(g); g.connect(master); src.start(t); src.stop(t + decay + 0.05);
    const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(thump, t); o.frequency.exponentialRampToValueAtTime(thump * 0.5, t + 0.08);
    const og = ctx.createGain(); env(og, t, gain * 0.7, 0.09); o.connect(og); og.connect(master); o.start(t); o.stop(t + 0.12);
  }
  function tone(t, f, dur, gain, type){ const o = ctx.createOscillator(); o.type = type || 'sine'; o.frequency.setValueAtTime(f, t); const g = ctx.createGain(); env(g, t, gain, dur); o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.05); }
  const synth = fn => { if (settings.sound && ctx && ctx.state === 'running') fn(ctx.currentTime + 0.005); };
  const mv = (t, self) => knock(t, self ? 1700 : 1350, self ? 200 : 170, 0.9, 0.06);
  const CLASSIC = {
    move: t => mv(t, false), moveSelf: t => mv(t, true),
    capture: t => { knock(t, 2600, 150, 1.1, 0.08); knock(t + 0.03, 1500, 210, 0.5, 0.05); },
    castle: t => { mv(t, true); knock(t + 0.1, 1450, 185, 0.8, 0.06); },
    check: t => { mv(t, true); mv(t + 0.13, false); },
    mate: t => { mv(t, true); mv(t + 0.14, true); mv(t + 0.3, true); },
    promote: t => { mv(t, true); tone(t + 0.03, 784, 0.12, 0.1, 'triangle'); tone(t + 0.11, 1175, 0.22, 0.1, 'triangle'); },
    start: t => { tone(t, 523, 0.25, 0.11, 'triangle'); tone(t + 0.12, 784, 0.4, 0.11, 'triangle'); },
    end: t => { tone(t + 0.15, 659, 0.3, 0.11, 'triangle'); tone(t + 0.3, 784, 0.3, 0.11, 'triangle'); tone(t + 0.45, 1047, 0.6, 0.11, 'triangle'); },
    correct: t => { tone(t + 0.05, 880, 0.14, 0.12, 'triangle'); tone(t + 0.16, 1319, 0.3, 0.12, 'triangle'); },
    wrong: t => { tone(t, 220, 0.16, 0.08, 'square'); tone(t + 0.13, 175, 0.2, 0.08, 'square'); },
    success: t => { [523, 659, 784, 1047].forEach((f, k) => tone(t + k * 0.09, f, 0.35, 0.1, 'triangle')); },
    fanfare: t => { [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, k) => tone(t + k * 0.11, f, 0.4, 0.1, 'triangle')); },
    illegal: t => { tone(t, 196, 0.1, 0.06, 'square'); tone(t + 0.1, 165, 0.14, 0.06, 'square'); },
    lowTime: t => { tone(t, 1046, 0.07, 0.09, 'square'); tone(t + 0.14, 1046, 0.07, 0.09, 'square'); },
    tick: t => tone(t, 1500, 0.03, 0.05, 'square')
  };
  const play = (name, gain) => settings.soundPack === 'classic' ? synth(CLASSIC[name]) : playBuf(name, gain);
  addEventListener('pointerdown', unlockAudio, true);
  addEventListener('keydown', unlockAudio, true);
  return {
    unlock: unlockAudio,
    setVolume(v){ volume = v == null ? 0.8 : v; if (master) master.gain.value = volume; },
    forMove(kind, self){
      buzz(kind === 'mate' ? [70, 50, 70, 50, 240] : kind === 'check' ? [22, 40, 22] : kind === 'capture' ? [14] : [8]);
      play(kind === 'move' ? (self ? 'moveSelf' : 'move') : kind);
    },
    preview(){ unlockAudio(); setTimeout(() => { play('moveSelf'); setTimeout(() => play('capture'), 380); setTimeout(() => play('check'), 820); }, 60); },
    start(){ if (settings.soundPack !== 'classic') play('start'); }, end(){}, correct(){},
    wrong(){ buzz([30, 40, 30]); play('wrong'); }, success(){}, fanfare(){},
    illegal(){ play('illegal'); }, lowTime(){ play('lowTime'); }, tick(){ play('tick', .6); }
  };
})();
const moveKind = (m, after) => inCheck(after) ? (legal(after).length ? 'check' : 'mate') : m.flag === 'K' || m.flag === 'Q' ? 'castle' : m.promo ? 'promote' : m.cap ? 'capture' : 'move';

/* ---------- Openings: names and book moves ---------- */
const OPEN_BY_LINE = new Map(), BOOK_PREFIX = new Set();
for (const [eco, name, line] of (window.GW_OPENINGS || [])){
  if (!OPEN_BY_LINE.has(line)) OPEN_BY_LINE.set(line, {eco, name});
  const mv = line.split(' ');
  for (let i = 1; i <= mv.length; i++) BOOK_PREFIX.add(mv.slice(0, i).join(' '));
}
// Longest named opening that matches the start of a move list (UCI strings)
function openingName(ucis){
  for (let n = Math.min(ucis.length, 40); n > 0; n--){
    const o = OPEN_BY_LINE.get(ucis.slice(0, n).join(' '));
    if (o) return o;
  }
  return null;
}

/* ---------- Puzzle bank ---------- */
const THEME_LABEL = {
  mateIn1:'Mate in 1', mateIn2:'Mate in 2', mateIn3:'Mate in 3', mateIn4:'Mate in 4', fork:'Fork', pin:'Pin', skewer:'Skewer',
  discoveredAttack:'Discovered attack', doubleCheck:'Double check', deflection:'Deflection', attraction:'Attraction',
  hangingPiece:'Hanging piece', trappedPiece:'Trapped piece', sacrifice:'Sacrifice', backRankMate:'Back-rank mate',
  smotheredMate:'Smothered mate', promotion:'Promotion', advancedPawn:'Advanced pawn', xRayAttack:'X-ray', interference:'Interference',
  clearance:'Clearance', intermezzo:'Intermezzo', capturingDefender:'Remove the defender', quietMove:'Quiet move',
  defensiveMove:'Defensive move', zugzwang:'Zugzwang', exposedKing:'Exposed king', kingsideAttack:'Kingside attack',
  queensideAttack:'Queenside attack', anastasiaMate:'Anastasia’s mate', arabianMate:'Arabian mate', bodenMate:'Boden’s mate',
  doubleBishopMate:'Double bishop mate', dovetailMate:'Dovetail mate', hookMate:'Hook mate', underPromotion:'Underpromotion',
  enPassant:'En passant', castling:'Castling', rookEndgame:'Rook endgame', queenEndgame:'Queen endgame', pawnEndgame:'Pawn endgame',
  bishopEndgame:'Bishop endgame', knightEndgame:'Knight endgame', endgame:'Endgame', middlegame:'Middlegame', opening:'Opening',
  short:'Short', long:'Long', veryLong:'Very long', oneMove:'One move', crushing:'Crushing', advantage:'Advantage',
  equality:'Equality', mate:'Checkmate', master:'Master game', superGM:'Super GM game'
};
const BANK = (window.GW_PUZZLES ? window.GW_PUZZLES.list : []).map(l => {
  const [id, fen, moves, rating, th] = l.split(';');
  return {id, fen, moves: moves.split(' '), rating: +rating, themes: th ? th.split('.').map(i => window.GW_PUZZLES.themes[+i]) : []};
});
// A puzzle near `target` rating, optionally filtered by theme and range, avoiding ids in `skip`
function pickPuzzle({target = 1000, theme = null, min = 0, max = 4000, skip = []} = {}){
  let pool = BANK.filter(p => p.rating >= min && p.rating <= max && (!theme || p.themes.includes(theme)));
  const fresh = pool.filter(p => !skip.includes(p.id));
  if (fresh.length) pool = fresh;
  if (!pool.length) return null;
  pool.sort((a, b) => Math.abs(a.rating - target) - Math.abs(b.rating - target));
  return pool[rnd(Math.min(8, pool.length))];
}
const bankSpec = p => ({type:'bank', fen:p.fen, pre:p.moves[0], line:p.moves.slice(1), puzzle:p});
const classicSpec = p => ({type: p.type === 'mate' ? 'mate' : 'line', fen:p.fen, n:p.n, line:p.line, puzzle:p});

/* ---------- Move classification icons (review) ---------- */
const CLS = {
  book:       {label:'Book',       glyph:'≡', color:'#a88865'},
  great:      {label:'Great',      glyph:'!',  color:'#4d8fd6'},
  best:       {label:'Best',       glyph:'★', color:'#22b07d'},
  excellent:  {label:'Excellent',  glyph:'↑', color:'#5cc48d'},
  good:       {label:'Good',       glyph:'✓', color:'#8fae9f'},
  inaccuracy: {label:'Inaccuracy', glyph:'?!', color:'#e9b531'},
  mistake:    {label:'Mistake',    glyph:'?',  color:'#f07c2b'},
  miss:       {label:'Miss',       glyph:'✕', color:'#e5604f'},
  blunder:    {label:'Blunder',    glyph:'??', color:'#d1293d'}
};
const clsIcon = k => `<span class="ci" style="background:${CLS[k].color}">${CLS[k].glyph}</span>`;
const clsSVG = k => `<svg viewBox="0 0 24 24" width="100%" height="100%"><circle cx="12" cy="12" r="11" fill="${CLS[k].color}" stroke="#fff" stroke-width="1.6"/><text x="12" y="16" text-anchor="middle" font-family="Outfit,system-ui,sans-serif" font-weight="800" font-size="${CLS[k].glyph.length > 1 ? 10 : 12}" fill="#fff">${CLS[k].glyph}</text></svg>`;

/* ---------- Board component ---------- */
const ARROW = {o:'rgb(255,170,0)', g:'rgb(34,176,125)', b:'rgb(92,124,255)', r:'rgb(235,85,70)', v:'rgb(139,124,255)'};
function slidesFor(m, dragged){
  const s = [];
  if (!dragged) s.push([m.from, m.to]);
  if (m.flag === 'K') s.push([m.from + 3, m.from + 1]);
  if (m.flag === 'Q') s.push([m.from - 4, m.from - 1]);
  return s;
}
const ANIM_MS = 180;

class Board {
  constructor(host, opts = {}){
    this.opts = opts;
    host.classList.add('board-host');
    host.innerHTML = '<div class="frame"><div class="grid"></div><svg class="arrows" viewBox="0 0 800 800" aria-hidden="true"></svg><div class="promo" hidden><div class="promo-card"></div></div></div>';
    this.host = host;
    this.frame = host.querySelector('.frame');
    this.grid = host.querySelector('.grid');
    this.svg = host.querySelector('.arrows');
    this.promoEl = host.querySelector('.promo');
    this.promoCard = host.querySelector('.promo-card');
    Object.assign(this, {s:C.initState(), flipped:false, last:null, sel:-1, moves:[], drag:null, ghost:null, hover:-1, anim:null,
      arrows:[], marks:new Set(), auto:[], badge:null, hint:-1, sqHL:{}, promo:null, rdown:-1, rcolor:'o', free:false});
    boards.push(this);
    this.bind();
    this.render();
    renderFx(this.frame);
  }
  canMove(){ return !!(this.opts.canMove && this.opts.canMove()); }
  // Premoves: during the opponent's turn, queue a move for your own colour (the game screen supplies that colour)
  preColor(){ return settings.premove !== false && this.opts.premove ? this.opts.premove() : null; }
  preTargets(i){ const t = Object.assign({}, this.s, {turn: this.s.board[i][0], ep: -1}); return legal(t).filter(m => m.from === i); }
  setPre(from, to){ this.premove = {from, to}; this.sel = -1; this.moves = []; this.render(); }
  set(s, o = {}){
    this.s = s; this.last = o.last || null; this.sel = -1; this.moves = []; this.promo = null;
    this.arrows = []; this.marks.clear(); this.auto = o.arrows || []; this.badge = o.badge || null;
    this.hint = -1; this.sqHL = o.sqHL || {};
    (o.marks || []).forEach(q => this.marks.add(q));
    this.anim = o.slides && o.slides.length ? {slides:o.slides, t:now()} : null;
    this.render();
  }
  vis(i){ return this.flipped ? 63 - i : i; }
  legalFrom(i){ return legal(this.s).filter(m => m.from === i); }
  render(){
    const s = this.s, chk = findKing(s.board, s.turn) >= 0 && inCheck(s) ? findKing(s.board, s.turn) : -1;
    const targets = new Map();
    if (this.sel >= 0) for (const m of this.moves){
      targets.set(m.to, m);
      // the rook is a target too: drop the king on it to castle
      if (m.flag === 'K' && !targets.has(m.from + 3)) targets.set(m.from + 3, m);
      if (m.flag === 'Q' && !targets.has(m.from - 4)) targets.set(m.from - 4, m);
    }
    let h = '';
    for (let v = 0; v < 64; v++){
      const i = this.vis(v), r = i >> 3, c = i & 7;
      let inner = '';
      if (this.last && (i === this.last.from || i === this.last.to)) inner += '<span class="hl last"></span>';
      if (this.sqHL[i]) inner += `<span class="hl ${this.sqHL[i]}"></span>`;
      if (i === this.sel) inner += '<span class="hl sel"></span>';
      if (this.marks.has(i)) inner += '<span class="hl mark"></span>';
      if (i === chk) inner += '<span class="hl chk"></span>';
      if (i === this.hint) inner += '<span class="hl hint"></span>';
      if (this.premove && (i === this.premove.from || i === this.premove.to)) inner += '<span class="hl pre"></span>';
      const p = s.board[i];
      if (p && !(this.drag && this.drag.moved && this.drag.from === i)) inner += `<span class="piece pc-${p}"></span>`;
      if (settings.hints && targets.has(i)) inner += (p || targets.get(i).flag === 'ep') ? '<span class="ring"></span>' : '<span class="dot"></span>';
      if (settings.coords){
        if (v % 8 === 0) inner += `<span class="coord rk">${8 - r}</span>`;
        if (v >= 56) inner += `<span class="coord fl">${C.FILES[c]}</span>`;
      }
      if (this.badge && this.badge.sq === i) inner += `<span class="badge">${clsSVG(this.badge.kind)}</span>`;
      h += `<div class="sq ${(r + c) % 2 ? 'd' : 'l'}" data-i="${i}">${inner}</div>`;
    }
    this.grid.innerHTML = h;
    if (this.hover >= 0) this.grid.querySelector(`.sq[data-i="${this.hover}"]`)?.classList.add('hover');
    this.runSlides();
    this.drawArrows();
    this.renderPromo();
  }
  runSlides(){
    const a = this.anim;
    if (!a) return;
    const left = ANIM_MS - (now() - a.t);
    if (left <= 10){ this.anim = null; return; }
    const frac = left / ANIM_MS;
    for (const [from, to] of a.slides){
      const el = this.grid.querySelector(`.sq[data-i="${to}"] .piece`);
      if (!el) continue;
      const dc = ((this.vis(from) & 7) - (this.vis(to) & 7)) * 100 * frac, dr = ((this.vis(from) >> 3) - (this.vis(to) >> 3)) * 100 * frac;
      el.classList.add('moving');
      el.style.transform = `translate(${dc}%, ${dr}%)`;
      el.getBoundingClientRect();
      el.style.transition = `transform ${left}ms cubic-bezier(.25,.8,.35,1)`;
      el.style.transform = '';
    }
  }
  drawArrows(){
    const center = i => { const v = this.vis(i); return [(v & 7) * 100 + 50, (v >> 3) * 100 + 50]; };
    let out = '';
    for (const a of [...this.auto, ...this.arrows]){
      const [x1, y1] = center(a.from), [x2, y2] = center(a.to);
      const adx = Math.abs(x2 - x1), ady = Math.abs(y2 - y1);
      const knight = (adx === 100 && ady === 200) || (adx === 200 && ady === 100);
      const pts = knight ? [[x1, y1], ady > adx ? [x1, y2] : [x2, y1], [x2, y2]] : [[x1, y1], [x2, y2]];
      const [sx, sy] = pts[0], [nx, ny] = pts[1], sl = Math.hypot(nx - sx, ny - sy);
      pts[0] = [sx + (nx - sx) / sl * 24, sy + (ny - sy) / sl * 24];
      const [px, py] = pts[pts.length - 2], [ex, ey] = pts[pts.length - 1];
      const len = Math.hypot(ex - px, ey - py), ux = (ex - px) / len, uy = (ey - py) / len;
      const head = 40, half = 26, bx = ex - ux * head, by = ey - uy * head;
      const line = [...pts.slice(0, -1), [bx, by]].map(p => p.map(n => n.toFixed(1)).join(',')).join(' ');
      const col = ARROW[a.color || 'o'], op = a.opacity || .85, w = a.width || 17;
      out += `<g opacity="${op}"><polyline points="${line}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linejoin="miter"/>` +
             `<polygon points="${ex},${ey} ${(bx - uy * half).toFixed(1)},${(by + ux * half).toFixed(1)} ${(bx + uy * half).toFixed(1)},${(by - ux * half).toFixed(1)}" fill="${col}"/></g>`;
    }
    this.svg.innerHTML = out;
  }
  renderPromo(){
    this.promoEl.hidden = !this.promo;
    if (!this.promo) return;
    this.promoCard.innerHTML = this.promo.map((m, k) =>
      `<button type="button" data-k="${k}" aria-label="Promote to ${PIECE_NAME[m.promo]}"><span class="piece pc-${this.s.turn}${m.promo}"></span></button>`).join('');
  }
  setHover(i){
    if (this.hover === i) return;
    this.grid.querySelector('.sq.hover')?.classList.remove('hover');
    this.hover = i;
    if (i >= 0) this.grid.querySelector(`.sq[data-i="${i}"]`)?.classList.add('hover');
  }
  clearDrag(){
    if (this.ghost){ this.ghost.remove(); this.ghost = null; }
    this.setHover(-1);
    this.drag = null;
  }
  sqAt(x, y){
    const el = document.elementFromPoint(x, y);
    const sq = el && el.closest('.sq');
    return sq && this.frame.contains(sq) ? +sq.dataset.i : -1;
  }
  // Castling by gesture: the king dropped on its own rook, or swiped two or more squares along its rank toward a side it can castle
  castleTo(from, to){
    const p = this.s.board[from];
    if (!p || p[1] !== 'K' || from < 0 || to < 0 || (from >> 3) !== (to >> 3) || from === to) return null;
    const dx = (to & 7) - (from & 7), q = this.s.board[to];
    if (Math.abs(dx) < 2 && !(q && q === p[0] + 'R')) return null;
    return this.moves.find(m => m.from === from && (dx > 0 ? m.flag === 'K' : m.flag === 'Q')) || null;
  }
  tryMove(from, to, dragged){
    let c = this.moves.filter(m => m.from === from && m.to === to);
    if (!c.length){ const k = this.castleTo(from, to); if (k) c = [k]; }
    if (!c.length) return false;
    if (c.length > 1 && settings.autoQueen) this.commit(c.find(m => m.promo === 'Q') || c[0], dragged);
    else if (c.length > 1){ this.promo = c; this.render(); }
    else this.commit(c[0], dragged);
    return true;
  }
  commit(m, dragged){
    this.sel = -1; this.moves = []; this.promo = null;
    if (this.opts.onMove) this.opts.onMove(m, dragged);
  }
  cancelPromo(){ if (this.promo){ this.promo = null; this.sel = -1; this.moves = []; this.render(); } }
  bind(){
    const f = this.frame;
    f.addEventListener('contextmenu', e => e.preventDefault());
    f.addEventListener('pointerdown', e => {
      const sqEl = e.target.closest('.sq');
      if (!sqEl) return;
      const i = +sqEl.dataset.i;
      if (e.button === 2){
        this.rdown = i;
        this.rcolor = e.shiftKey ? 'g' : (e.ctrlKey || e.metaKey) ? 'b' : e.altKey ? 'r' : 'o';
        return;
      }
      if (e.button !== 0) return;
      let dirty = false;
      if (this.arrows.length || this.marks.size){ this.arrows = []; this.marks.clear(); dirty = true; }
      if (this.promo){ if (dirty) this.render(); return; }
      if (!this.canMove()){
        const mine = this.preColor();
        if (!mine){ if (dirty) this.render(); return; }
        if (this.sel >= 0 && i !== this.sel){ const k = this.castleTo(this.sel, i); if (k || this.moves.some(m => m.to === i)){ this.setPre(this.sel, k ? k.to : i); return; } }
        const pc = this.s.board[i];
        if (pc && pc[0] === mine){
          const was = this.sel === i;
          this.premove = null;
          this.sel = i; this.moves = this.preTargets(i);
          this.drag = {from:i, x:e.clientX, y:e.clientY, moved:false, was};
          try { f.setPointerCapture(e.pointerId); } catch (_) {}
        } else { this.premove = null; this.sel = -1; this.moves = []; }
        this.render();
        return;
      }
      const s = this.s;
      if (this.sel >= 0 && i !== this.sel && (this.moves.some(m => m.to === i) || this.castleTo(this.sel, i))){ this.tryMove(this.sel, i, false); return; }
      const p = s.board[i];
      if (p && p[0] === s.turn){
        const was = this.sel === i;
        this.sel = i;
        this.moves = this.legalFrom(i);
        this.drag = {from:i, x:e.clientX, y:e.clientY, moved:false, was};
        try { f.setPointerCapture(e.pointerId); } catch (_) {}
        this.render();
      } else if (this.sel >= 0 || dirty){
        this.sel = -1; this.moves = []; this.render();
      }
    });
    f.addEventListener('pointermove', e => {
      const d = this.drag;
      if (!d) return;
      if (!d.moved && Math.hypot(e.clientX - d.x, e.clientY - d.y) > 5){
        d.moved = true;
        const g = document.createElement('span');
        g.className = 'drag-ghost pc-' + this.s.board[d.from];
        const size = f.getBoundingClientRect().width / 8;
        g.style.width = g.style.height = size + 'px';
        document.body.appendChild(g);
        this.ghost = g;
        this.render();
      }
      if (this.ghost){
        this.ghost.style.left = e.clientX + 'px';
        this.ghost.style.top = e.clientY + 'px';
        this.setHover(this.sqAt(e.clientX, e.clientY));
      }
    });
    f.addEventListener('pointerup', e => {
      if (e.button === 2){
        const from = this.rdown, to = this.sqAt(e.clientX, e.clientY);
        this.rdown = -1;
        if (from < 0 || to < 0) return;
        if (from === to){ this.marks.has(to) ? this.marks.delete(to) : this.marks.add(to); }
        else {
          const k = this.arrows.findIndex(a => a.from === from && a.to === to);
          if (k >= 0) this.arrows.splice(k, 1); else this.arrows.push({from, to, color:this.rcolor});
        }
        this.render();
        return;
      }
      const d = this.drag;
      if (!d) return;
      this.clearDrag();
      if (d.moved){
        const to = this.sqAt(e.clientX, e.clientY);
        if (to >= 0 && this.canMove() && this.tryMove(d.from, to, true)) return;
        if (to >= 0 && !this.canMove() && this.preColor()){ const k = this.castleTo(d.from, to); if (k || this.moves.some(m => m.to === to)){ this.setPre(d.from, k ? k.to : to); return; } }
        if (to >= 0 && to !== d.from) sfx.illegal();
        this.render();
      } else if (d.was){
        this.sel = -1; this.moves = []; this.render();
      }
    });
    f.addEventListener('pointercancel', () => { if (this.drag){ this.clearDrag(); this.render(); } });
    this.promoCard.addEventListener('click', e => {
      const b = e.target.closest('button');
      if (b && this.promo) this.commit(this.promo[+b.dataset.k], false);
    });
    this.promoEl.addEventListener('click', e => { if (e.target === this.promoEl) this.cancelPromo(); });
  }
}
// A small static board (home screen, cards)
function miniBoard(fen, flip){
  const s = C.fromFEN(fen);
  let h = '<div class="mini">';
  for (let v = 0; v < 64; v++){
    const i = flip ? 63 - v : v, r = i >> 3, c = i & 7, p = s.board[i];
    h += `<i class="${(r + c) % 2 ? 'd' : 'l'}">${p ? `<b class="pc-${p}"></b>` : ''}</i>`;
  }
  return h + '</div>';
}

/* ---------- Engine helpers ---------- */
const engineDepth = () => Engine.fast ? 13 : 10;
async function engineBest(fenOrPos, {depth, ms = 0, skill = 20, multipv = 1} = {}){
  const s = typeof fenOrPos === 'string' ? C.fromFEN(fenOrPos) : fenOrPos;
  if (await Engine.boot()){
    const r = await Engine.search(`position fen ${C.toFEN(s)}`, {skill, depth: depth || engineDepth(), ms, multipv});
    if (r && r.best) return r;
  }
  const q = C.quickAnalyse(s);
  return {best:q.best, lines:[{score:q.score, pv:q.best ? [q.best] : []}]};
}

/* ---------- Tasks: puzzles, lesson exercises, drills, play-outs, opening practice ---------- */
// spec.type: 'mate' | 'line' | 'bank' | 'accept' | 'check' | 'collect' | 'playout' | 'opening'
class Task {
  constructor(board, spec, cb){ this.b = board; this.spec = spec; this.cb = cb || {}; this.reset(); }
  reset(){
    const sp = this.spec;
    this.token = (this.token || 0) + 1;
    Object.assign(this, {idx:0, done:false, busy:false, failed:false, hintLevel:0, lastMove:null, moves:0, wrong:0});
    if (sp.type === 'opening'){
      this.s = C.initState();
      this.lineArr = sp.line.split(' ');
      this.solver = sp.side;
    } else this.s = C.fromFEN(sp.fen);
    this.b.host.classList.toggle('kids-collect', sp.type === 'collect');
    if (sp.type === 'bank'){
      // the opponent's move that sets up the puzzle
      const pre = fromUci(this.s, sp.pre);
      this.solver = opp(this.s.turn);
      this.b.flipped = this.solver === 'b';
      this.b.set(this.s);
      this.busy = true;
      const tok = this.token;
      setTimeout(() => {
        if (tok !== this.token || !pre) return;
        this.s = apply(this.s, pre); this.lastMove = pre; this.busy = false;
        this.b.set(this.s, {last:pre, slides:slidesFor(pre, false)});
        sfx.forMove(moveKind(pre, this.s), false);
        if (this.cb.onReady) this.cb.onReady();
      }, 650);
      return;
    }
    if (sp.type !== 'opening') this.solver = this.s.turn;
    this.b.flipped = this.solver === 'b';
    this.b.set(this.s, {arrows: sp.arrows || []});
    if (sp.type === 'opening' && this.solver === 'b') this.autoReply();
    else if (this.cb.onReady) this.cb.onReady();
  }
  canMove(){ return !this.done && !this.busy && this.s.turn === this.solver; }
  expected(){
    const sp = this.spec;
    if (sp.type === 'accept') return sp.moves;
    if (sp.type === 'opening') return [this.lineArr[this.idx]];
    return [].concat((sp.line || [])[this.idx] || []);
  }
  isCorrect(m){
    const u = uci(m), sp = this.spec;
    if (sp.type === 'collect' || sp.type === 'playout') return true;
    if (sp.type === 'check') return C.givesCheck(this.s, m);
    if (this.expected().includes(u)) return true;
    const after = apply(this.s, m);
    if (sp.type === 'mate') return C.isMatedWithin(after, sp.n - this.idx / 2 - 1);
    // puzzles accept any checkmate on the final move
    if ((sp.type === 'bank' || sp.type === 'line') && this.idx === sp.line.length - 1 && C.isMate(after)) return true;
    return false;
  }
  findCorrect(){
    for (const u of this.expected()){ const m = fromUci(this.s, u); if (m) return m; }
    return legal(this.s).find(m => this.isCorrect(m)) || null;
  }
  handle(m, dragged){
    if (!this.canMove()) return;
    const sp = this.spec, ok = this.isCorrect(m);
    const before = this.s, after = apply(before, m);
    this.moves++;
    const hl = sp.type === 'collect' || sp.type === 'playout' ? {} : {[m.to]: ok ? 'good' : 'bad'};
    this.b.set(after, {last:m, slides:slidesFor(m, dragged), sqHL:hl});
    sfx.forMove(moveKind(m, after), true);
    if (!ok){
      this.failed = true; this.busy = true; this.wrong++;
      const tok = this.token;
      setTimeout(() => sfx.wrong(), 120);
      if (this.cb.onWrong) this.cb.onWrong(m);
      setTimeout(() => {
        if (tok !== this.token) return;
        this.busy = false;
        this.b.set(before, {last:this.lastMove});
        if (sp.type === 'opening' && this.wrong >= 2) this.hint();
      }, 750);
      return;
    }
    this.advance(m, after);
  }
  advance(m, after){
    const sp = this.spec;
    this.s = after; this.lastMove = m;
    if (sp.type === 'collect'){
      this.s = Object.assign({}, after, {turn:'w', ep:-1});
      this.b.s = this.s;   // black never moves in the collecting games
      if (!this.s.board.some(p => p === 'bP')){
        this.done = true;
        const stars = this.moves <= sp.par ? 3 : this.moves <= sp.par + 2 ? 2 : 1;
        setTimeout(() => sfx.success(), 150);
        if (this.cb.onSolved) this.cb.onSolved(false, {stars, moves:this.moves});
      } else if (this.cb.onProgress) this.cb.onProgress();
      return;
    }
    if (sp.type === 'playout') return this.playoutStep(m);
    const finished = sp.type === 'accept' || sp.type === 'check' || C.isMate(after) ||
      (sp.type === 'opening' ? this.idx + 1 >= this.lineArr.length : this.idx + 1 >= (sp.line || []).length);
    if (finished){ this.done = true; setTimeout(() => sfx.correct(), 150); if (this.cb.onSolved) this.cb.onSolved(this.failed); return; }
    if (this.cb.onProgress) this.cb.onProgress();
    this.idx++;
    this.autoReply();
  }
  autoReply(){
    const sp = this.spec;
    this.busy = true;
    const tok = this.token;
    setTimeout(() => {
      if (tok !== this.token) return;
      let want = sp.type === 'opening' ? this.lineArr[this.idx] : [].concat((sp.line || [])[this.idx] || [])[0];
      const r = fromUci(this.s, want) || legal(this.s)[0];
      if (!r){ this.busy = false; return; }
      this.s = apply(this.s, r); this.lastMove = r; this.idx++; this.busy = false;
      this.b.set(this.s, {last:r, slides:slidesFor(r, false)});
      sfx.forMove(moveKind(r, this.s), false);
      if (sp.type === 'opening' && this.idx >= this.lineArr.length){ this.done = true; sfx.correct(); if (this.cb.onSolved) this.cb.onSolved(this.failed); return; }
      if (this.cb.onProgress) this.cb.onProgress();
    }, 520);
  }
  // Play-outs: the engine defends; the goal is mate or promotion within the move limit
  async playoutStep(m){
    const sp = this.spec, tok = this.token;
    const promoted = m.promo && m.piece[0] === this.solver;
    if (C.isMate(this.s) || (sp.goal === 'promote' && promoted)){
      this.done = true; setTimeout(() => sfx.success(), 150);
      if (this.cb.onSolved) this.cb.onSolved(false, {moves:this.moves});
      return;
    }
    const drawn = !legal(this.s).length || C.insufficient(this.s.board);
    if (drawn || this.moves >= sp.limit){
      this.done = true;
      if (this.cb.onFail) this.cb.onFail(drawn ? (legal(this.s).length ? 'Draw: not enough material left.' : 'Stalemate! The king had no moves but wasn’t in check.') : `Out of moves (${sp.limit}). Try again.`);
      return;
    }
    if (this.cb.onProgress) this.cb.onProgress();
    this.busy = true;
    const r = await engineBest(this.s, {depth: Engine.fast ? 12 : 8});
    if (tok !== this.token) return;
    const reply = fromUci(this.s, r.best) || legal(this.s)[0];
    await sleep(250);
    if (tok !== this.token) return;
    this.s = apply(this.s, reply); this.lastMove = reply; this.busy = false;
    this.b.set(this.s, {last:reply, slides:slidesFor(reply, false)});
    sfx.forMove(moveKind(reply, this.s), false);
    if (!legal(this.s).length){
      this.done = true;
      if (this.cb.onFail) this.cb.onFail(inCheck(this.s) ? 'You were checkmated.' : 'Stalemate.');
      return;
    }
    if (reply.cap && sp.goal === 'promote' && !this.s.board.some(p => p === this.solver + 'P')){
      this.done = true;
      if (this.cb.onFail) this.cb.onFail('Your pawn was captured. Try again.');
      return;
    }
    if (this.cb.onProgress) this.cb.onProgress();
  }
  async hint(){
    if (this.done || this.busy) return;
    this.failed = true;
    this.hintLevel++;
    let m = null;
    if (this.spec.type === 'playout' || this.spec.type === 'collect'){
      if (this.spec.type === 'collect'){
        const targets = legal(this.s).filter(x => x.cap);
        m = targets[0] || legal(this.s)[0];
      } else { const r = await engineBest(this.s); m = fromUci(this.s, r.best); }
    } else m = this.findCorrect();
    if (!m) return;
    if (this.hintLevel === 1 && this.spec.type !== 'playout'){ this.b.hint = m.from; this.b.render(); }
    else { this.b.auto = [{from:m.from, to:m.to, color:'b'}]; this.b.hint = m.from; this.b.render(); }
  }
  async solution(){
    if (this.done || ['playout', 'collect'].includes(this.spec.type)) return;
    this.failed = true;
    const tok = this.token;
    while (!this.done && tok === this.token){
      while (this.busy){ await sleep(80); if (tok !== this.token) return; }
      if (this.done || this.s.turn !== this.solver) { await sleep(80); if (this.done) return; continue; }
      const m = this.findCorrect();
      if (!m) return;
      const after = apply(this.s, m);
      this.b.set(after, {last:m, slides:slidesFor(m, false), sqHL:{[m.to]:'good'}});
      sfx.forMove(moveKind(m, after), true);
      this.advance(m, after);
      await sleep(700);
    }
  }
}

/* ---------- Screens ---------- */
const screens = {};
let current = null;
const NAV_OF = {history:'history', home:'home', setup:'play', game:'play', review:'play', cups:'cups', puzzles:'puzzles', learn:'learn', lesson:'learn',
                openings:'openings', analysis:'analysis', profile:'profile', world:'world', legends:'legends', customize:'customize'};
function register(name, def){ screens[name] = def; }
function show(name, arg){
  const def = screens[name];
  if (!def) return;
  if (current && screens[current].onHide) screens[current].onHide();
  current = name;
  for (const sec of document.querySelectorAll('.screen')) sec.hidden = sec.id !== 'scr-' + name;
  document.querySelectorAll('.nav').forEach(b => { if (b.dataset.nav === NAV_OF[name]) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); });
  document.body.dataset.screen = name;
  if (window.GW.renderRailMe) window.GW.renderRailMe();
  if (def.onShow) def.onShow(arg);
  window.scrollTo(0, 0);
}
const currentScreen = () => current;

function barHTML(who, color, extra = {}){
  return `<div class="av">${avatarSVG(who, extra.mood || (extra.think ? 'think' : ''))}</div><div class="pinfo"><div class="pname">${esc(who.name)}${who.elo ? `<span class="elo">(${who.elo})</span>` : ''}</div>` +
    `<div class="caps">${extra.caps || ''}${extra.adv || ''}</div></div>` +
    (extra.chat ? `<div class="pbubble${extra.chatNew ? ' new' : ''}" role="status">${extra.think ? '<span class="think">Thinking</span>' : esc(extra.chat)}</div>` : '<span class="spacer"></span>') +
    `${extra.think && !extra.chat ? '<span class="think">Thinking</span>' : ''}${extra.clock ? `<span class="clock" id="clock-${color}" aria-label="${NAME[color]} clock"></span>` : ''}`;
}

/* ---------- Claude runtime: who is viewing, and the artifact database (null when running on its own) ---------- */
const cloudReady = (async () => {
  if (!(window.claude && typeof window.claude.use === 'function')) return null;
  try {
    const [db, user] = await Promise.all([window.claude.use('db').catch(() => null), window.claude.use('user').catch(() => null)]);
    const me = user ? await user.me() : null;
    return {db, user, me: me && me.id ? me : null};
  } catch (_) { return null; }
})();

window.GW = {
  cloudReady,
  C, D, LRN, $, now, sleep, NAME, PIECE_NAME, esc, store, clamp, rnd, avatarSVG, settings, applySettings, boards,
  pieceSets, pieceImg, applyPack, autoPack, currentPack, ownLook, restoreOwnLook, flyNow, scheduleFly, SOUND_PACKS, PIECE_KEYS,
  profile, saveProfile, me, unlock, markDay, dayStreak, buzz, levelOf, xpForLevel, dailyGoals, addXP, track, rateGame, recordResult, toast, modal, closeModal, sfx, moveKind,
  openingName, BOOK_PREFIX, OPEN_BY_LINE, THEME_LABEL, BANK, pickPuzzle, bankSpec, classicSpec, CLS, clsIcon, clsSVG,
  ARROW, slidesFor, Board, miniBoard, engineBest, engineDepth, Task, register, show, currentScreen, barHTML
};
})();
