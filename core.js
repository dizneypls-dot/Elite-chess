/* Greenwood Chess core: helpers, settings, sound, profile and rating, the board component, tasks and screens.
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

/* ---------- Pieces as CSS classes pc-wK … pc-bP ---------- */
{
  const st = document.createElement('style');
  st.textContent = Object.entries(D.PIECE_SVG)
    .map(([k, svg]) => `.pc-${k}{background-image:url("data:image/svg+xml,${encodeURIComponent(svg)}")!important}`).join('\n') +
    // stars for the kids' collecting games
    `\n.kids-collect .pc-bP{background-image:url("data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><path d="M22.5 5l5.2 11 12 1.4-8.9 8.2 2.4 11.9-10.7-6-10.7 6 2.4-11.9-8.9-8.2 12-1.4z" fill="#ffc531" stroke="#c98a00" stroke-width="1.8" stroke-linejoin="round"/></svg>')}")!important}`;
  document.head.appendChild(st);
}
const avCache = new Map();
const avatarSVG = who => { const k = JSON.stringify(who.look); if (!avCache.has(k)) avCache.set(k, D.avatar(who.look)); return avCache.get(k); };

/* ---------- Settings ---------- */
const settings = store.get('gw-settings', {theme:'greenwood', sound:true, hints:true, coords:true});
if (!D.THEMES.some(t => t.id === settings.theme)) settings.theme = 'greenwood';
const boards = [];
function applySettings(){
  const t = D.THEMES.find(x => x.id === settings.theme) || D.THEMES[0];
  const r = document.documentElement.style;
  r.setProperty('--sq-l', t.l); r.setProperty('--sq-d', t.d); r.setProperty('--board-bg', t.bg || 'transparent');
  document.documentElement.toggleAttribute('data-glass', !!t.glass);
  store.set('gw-settings', settings);
  boards.forEach(b => b.render());
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
function recordResult(score, botElo){
  profile.games++;
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

/* ---------- Sound (synthesised with Web Audio, no files) ---------- */
const sfx = (() => {
  let ctx = null, master = null, noise = null;
  function unlockAudio(){
    if (!ctx){
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      ctx = new AC();
      master = ctx.createGain(); master.gain.value = 0.8; master.connect(ctx.destination);
      noise = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.2), ctx.sampleRate);
      const d = noise.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 4);
    }
    if (ctx.state === 'suspended') ctx.resume();
  }
  function env(g, t, peak, decay){
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(peak, t + 0.002);
    g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
  }
  function knock(t, freq, thump, gain, decay){
    const src = ctx.createBufferSource(); src.buffer = noise;
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = freq; bp.Q.value = 1.4;
    const g = ctx.createGain(); env(g, t, gain, decay);
    src.connect(bp); bp.connect(g); g.connect(master); src.start(t); src.stop(t + decay + 0.05);
    const o = ctx.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(thump, t); o.frequency.exponentialRampToValueAtTime(thump * 0.5, t + 0.08);
    const og = ctx.createGain(); env(og, t, gain * 0.7, 0.09);
    o.connect(og); og.connect(master); o.start(t); o.stop(t + 0.12);
  }
  function tone(t, f, dur, gain, type){
    const o = ctx.createOscillator(); o.type = type || 'sine'; o.frequency.setValueAtTime(f, t);
    const g = ctx.createGain(); env(g, t, gain, dur);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.05);
  }
  const play = fn => { if (settings.sound && ctx && ctx.state === 'running') fn(ctx.currentTime + 0.005); };
  const move = (t, self) => knock(t, self ? 1700 : 1350, self ? 200 : 170, 0.9, 0.06);
  addEventListener('pointerdown', unlockAudio, true);
  addEventListener('keydown', unlockAudio, true);
  return {
    unlock: unlockAudio,
    forMove(kind, self){
      play(t => {
        if (kind === 'capture'){ knock(t, 2600, 150, 1.1, 0.08); knock(t + 0.03, 1500, 210, 0.5, 0.05); }
        else if (kind === 'castle'){ move(t, self); knock(t + 0.1, 1450, 185, 0.8, 0.06); }
        else if (kind === 'check'){ move(t, self); tone(t + 0.02, 988, 0.22, 0.13, 'triangle'); tone(t + 0.02, 1480, 0.16, 0.05); }
        else if (kind === 'promote'){ move(t, self); tone(t + 0.03, 784, 0.12, 0.1, 'triangle'); tone(t + 0.11, 1175, 0.22, 0.1, 'triangle'); }
        else move(t, self);
      });
    },
    start(){ play(t => { tone(t, 523, 0.25, 0.11, 'triangle'); tone(t + 0.12, 784, 0.4, 0.11, 'triangle'); }); },
    end(){ play(t => { tone(t + 0.15, 659, 0.3, 0.11, 'triangle'); tone(t + 0.3, 784, 0.3, 0.11, 'triangle'); tone(t + 0.45, 1047, 0.6, 0.11, 'triangle'); }); },
    correct(){ play(t => { tone(t + 0.05, 880, 0.14, 0.12, 'triangle'); tone(t + 0.16, 1319, 0.3, 0.12, 'triangle'); }); },
    wrong(){ play(t => { tone(t, 220, 0.16, 0.08, 'square'); tone(t + 0.13, 175, 0.2, 0.08, 'square'); }); },
    success(){ play(t => { [523, 659, 784, 1047].forEach((f, k) => tone(t + k * 0.09, f, 0.35, 0.1, 'triangle')); }); },
    fanfare(){ play(t => { [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, k) => tone(t + k * 0.11, f, 0.4, 0.1, 'triangle')); }); },
    illegal(){ play(t => { tone(t, 196, 0.1, 0.06, 'square'); tone(t + 0.1, 165, 0.14, 0.06, 'square'); }); },
    lowTime(){ play(t => { tone(t, 1046, 0.07, 0.09, 'square'); tone(t + 0.14, 1046, 0.07, 0.09, 'square'); }); },
    tick(){ play(t => tone(t, 1500, 0.03, 0.05, 'square')); }
  };
})();
const moveKind = (m, after) => inCheck(after) ? 'check' : m.flag === 'K' || m.flag === 'Q' ? 'castle' : m.promo ? 'promote' : m.cap ? 'capture' : 'move';

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
  }
  canMove(){ return !!(this.opts.canMove && this.opts.canMove()); }
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
    if (this.sel >= 0) for (const m of this.moves) targets.set(m.to, m);
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
  tryMove(from, to, dragged){
    const c = this.moves.filter(m => m.from === from && m.to === to);
    if (!c.length) return false;
    if (c.length > 1){ this.promo = c; this.render(); }
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
      if (this.promo || !this.canMove()){ if (dirty) this.render(); return; }
      const s = this.s;
      if (this.sel >= 0 && i !== this.sel && this.moves.some(m => m.to === i)){ this.tryMove(this.sel, i, false); return; }
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
const engineDepth = () => Engine.kind === 'wasm' ? 13 : 10;
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
    const r = await engineBest(this.s, {depth: Engine.kind === 'wasm' ? 12 : 8});
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
const NAV_OF = {home:'home', setup:'play', game:'play', review:'play', cups:'cups', puzzles:'puzzles', learn:'learn', lesson:'learn',
                openings:'openings', analysis:'analysis', profile:'profile'};
function register(name, def){ screens[name] = def; }
function show(name, arg){
  const def = screens[name];
  if (!def) return;
  if (current && screens[current].onHide) screens[current].onHide();
  current = name;
  for (const sec of document.querySelectorAll('.screen')) sec.hidden = sec.id !== 'scr-' + name;
  document.querySelectorAll('.nav').forEach(b => { if (b.dataset.nav === NAV_OF[name]) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); });
  document.body.dataset.screen = name;
  if (def.onShow) def.onShow(arg);
  window.scrollTo(0, 0);
}
const currentScreen = () => current;

function barHTML(who, color, extra = {}){
  return `<div class="av">${avatarSVG(who)}</div><div class="pinfo"><div class="pname">${esc(who.name)}${who.elo ? `<span class="elo">(${who.elo})</span>` : ''}</div>` +
    `<div class="caps">${extra.caps || ''}${extra.adv || ''}</div></div><span class="spacer"></span>` +
    `${extra.think ? '<span class="think">Thinking</span>' : ''}${extra.clock ? `<span class="clock" id="clock-${color}" aria-label="${NAME[color]} clock"></span>` : ''}`;
}

window.GW = {
  C, D, LRN, $, now, sleep, NAME, PIECE_NAME, esc, store, clamp, rnd, avatarSVG, settings, applySettings, boards,
  profile, saveProfile, me, unlock, rateGame, recordResult, toast, modal, closeModal, sfx, moveKind,
  openingName, BOOK_PREFIX, OPEN_BY_LINE, THEME_LABEL, BANK, pickPuzzle, bankSpec, classicSpec, CLS, clsIcon, clsSVG,
  ARROW, slidesFor, Board, miniBoard, engineBest, engineDepth, Task, register, show, currentScreen, barHTML
};
})();
