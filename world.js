/* © 2026 Elite Chess. All rights reserved. Proprietary: no copying, reuse or AI training without written permission. See terms.html. */
/* Elite Chess: World (FIDE rankings, events, the title match) and Legends (the story of chess, champions,
   famous games with a move-by-move viewer). Rankings and events prefer the live copy in the artifact database. */
(() => {
const GW = window.GW, W = window.GW_WORLD;
const {C, $, esc, sfx, moveKind, Board, slidesFor, ICON} = GW;

/* ---------- Flags and names ---------- */
const FED = {NOR:'NO', USA:'US', UZB:'UZ', IND:'IN', GER:'DE', CHN:'CN', FRA:'FR', NED:'NL', POL:'PL', VIE:'VN', TUR:'TR', IRI:'IR', RUS:'RU', HUN:'HU', AZE:'AZ',
  BUL:'BG', SLO:'SI', ARM:'AM', ESP:'ES', UKR:'UA', KAZ:'KZ', GEO:'GE', SWE:'SE', ROU:'RO', CZE:'CZ', ISR:'IL', CUB:'CU', PER:'PE', BRA:'BR', ARG:'AR', CAN:'CA',
  AUS:'AU', ENG:'GB', SCO:'GB', SRB:'RS', CRO:'HR', GRE:'GR', ITA:'IT', SUI:'CH', AUT:'AT', BEL:'BE', DEN:'DK', FIN:'FI', LAT:'LV', LTU:'LT', EST:'EE', MGL:'MN', BAN:'BD', PHI:'PH', INA:'ID', MAS:'MY', SGP:'SG', UAE:'AE', EGY:'EG', RSA:'ZA', MEX:'MX', CHI:'CL', COL:'CO', VEN:'VE', ISL:'IS', IRL:'IE', POR:'PT', MNC:'MC', BLR:'BY', MDA:'MD'};
const flag = fed => { const iso = FED[fed]; return iso ? String.fromCodePoint(...[...iso].map(c => 0x1F1E6 + c.charCodeAt(0) - 65)) : '🏳️'; };
// "Carlsen, Magnus" → "Magnus Carlsen"; names without a comma stay as they are
const nice = n => n.includes(',') ? n.split(',').map(x => x.trim()).reverse().join(' ') : n;
const initials = n => nice(n).split(/[\s-]+/).filter(Boolean).map(w => w[0]).slice(0, 2).join('').toUpperCase();
const fmtDate = (s, opts = {day:'numeric', month:'short', year:'numeric'}) => { if (!s) return ''; if (s.length === 7) return new Date(s + '-01T12:00:00').toLocaleDateString(undefined, {month:'long', year:'numeric'}); return new Date(s + 'T12:00:00').toLocaleDateString(undefined, opts); };
const range = (a, b) => b ? `${fmtDate(a, {day:'numeric', month:'short'})} – ${fmtDate(b)}` : fmtDate(a);
const dayMs = 86400000, todayStr = () => new Date().toISOString().slice(0, 10);

/* ---------- Live data: the artifact database first, the built-in copy otherwise ---------- */
const LIVE = {rankings: W.RANKINGS, events: W.EVENTS, live: false};
GW.cloudReady?.then(async cloud => {
  if (!cloud || !cloud.db) return;
  const sub = (path, key) => {
    try {
      cloud.db.doc(path).onSnapshot(snap => {
        const d = snap.exists ? snap.data() : null;
        if (d && d[key === 'rankings' ? 'open' : 'upcoming']){ LIVE[key] = d; LIVE.live = true; if (GW.currentScreen() === 'world') renderWorld(); }
      }, () => {});
    } catch (_) {}
  };
  sub('world/rankings', 'rankings');
  sub('world/events', 'events');
});

/* ============================== WORLD ============================== */
const WS = {tab:'rankings', list:'open', fav: GW.store.get('gw-fav', {ids:[]}).ids};
const saveFav = () => GW.store.set('gw-fav', {ids: WS.fav});
function spotlightHTML(sp){
  const first = new Date(sp.firstGame + 'T12:00:00'), end = new Date(sp.to + 'T23:59:00'), now = new Date();
  const days = Math.ceil((first - now) / dayMs);
  const status = now > end ? 'Finished' : now >= new Date(sp.from + 'T00:00:00') ? (now >= first ? 'Live now' : 'Opening ceremony') : `${days} day${days === 1 ? '' : 's'} to game 1`;
  return `<section class="spot">
    <div class="spot-top"><span class="tag gold">${now > end ? 'Result' : 'World title'}</span><span class="spot-status${status === 'Live now' ? ' live' : ''}">${status === 'Live now' ? '<i></i>' : ''}${status}</span></div>
    <h2>${esc(sp.name)}</h2>
    <div class="spot-vs">${sp.players.map((p, i) => `${i ? '<b class="spot-v">vs</b>' : ''}<div class="spot-p"><div class="mono" style="--c:${i ? '#1a9e8f' : '#ff8f1f'}">${initials(p.name)}</div><div><b>${flag(p.fed)} ${esc(p.name)}</b><span>${esc(p.note)}</span></div></div>`).join('')}</div>
    <p>${esc(sp.text)}</p>
    <div class="muted small">${range(sp.from, sp.to)} · ${esc(sp.place)} · <a href="${esc(sp.source)}" target="_blank" rel="noopener">FIDE</a></div>
  </section>`;
}
function renderWorld(){
  const R = LIVE.rankings, E = LIVE.events, list = R[WS.list] || [];
  const top = list[0] ? list[0].rating : 2800, low = list.length ? list[list.length - 1].rating - 20 : 2600;
  const age = b => b ? new Date().getFullYear() - b : '';
  const tab = WS.tab;
  const t = todayStr();
  const liveNow = e => e.to && e.from <= t && e.to >= t;
  $('scr-world').innerHTML = `
  <div class="page-head"><div><div class="kicker">${LIVE.live ? 'Synced' : 'Built-in copy'} · FIDE ${esc(R.period || '')}</div><h1>World chess</h1>
    <div class="muted">The official top ${list.length}, the title match and what’s on around the world.</div></div>
    <div class="tabs" id="wTabs" style="min-width:260px"><button type="button" data-t="rankings" aria-pressed="${tab === 'rankings'}">Rankings</button><button type="button" data-t="events" aria-pressed="${tab === 'events'}">Events</button></div></div>
  ${E.spotlight ? spotlightHTML(E.spotlight) : ''}
  ${tab === 'rankings' ? `
  <section class="panel">
    <div class="row"><div class="tabs small" id="wList" style="min-width:220px"><button type="button" data-l="open" aria-pressed="${WS.list === 'open'}">Open</button><button type="button" data-l="women" aria-pressed="${WS.list === 'women'}">Women</button></div>
      <span class="grow"></span><span class="muted small">FIDE standard ratings, ${esc(R.period || '')}. Updated ${fmtDate(R.updated)}. <a href="https://ratings.fide.com/a_top.php?list=${WS.list}" target="_blank" rel="noopener">Source</a></span></div>
    <ol class="rank-list">${list.map(p => {
      const fav = WS.fav.includes(p.fideId), w = Math.max(6, Math.round((p.rating - low) / (top - low) * 100));
      return `<li class="rank${fav ? ' fav' : ''}"><span class="rk-n">${p.rank}</span><span class="mono sm" style="--c:hsl(${(p.rank * 47) % 360} 55% 45%)">${initials(p.name)}</span>
        <span class="rk-who"><b>${flag(p.fed)} ${esc(nice(p.name))}</b><span class="muted small">${esc(p.fed)}${p.born ? ` · age ${age(p.born)}` : ''}</span></span>
        <span class="rk-bar"><i style="width:${w}%"></i></span><b class="rk-r">${p.rating}</b>
        <button class="rk-star" type="button" data-fav="${esc(p.fideId || '')}" aria-pressed="${fav}" aria-label="${fav ? 'Unfollow' : 'Follow'} ${esc(nice(p.name))}">${fav ? '★' : '☆'}</button>
        ${p.fideId ? `<a class="rk-link" href="https://ratings.fide.com/profile/${esc(p.fideId)}" target="_blank" rel="noopener" aria-label="FIDE profile">↗</a>` : ''}</li>`;
    }).join('')}</ol>
    <div class="muted small">★ Follow players to pin them on your home screen. FIDE publishes a new list on the first day of each month.</div>
  </section>` : `
  <section class="panel"><h2>Coming up</h2><div class="ev-list">${(E.upcoming || []).filter(e => (e.to || e.from) >= t.slice(0, (e.to || e.from).length)).map(e => `
    <div class="ev${e.star ? ' star' : ''}"><div class="ev-date"><b>${e.from.length === 7 ? fmtDate(e.from, {}) : new Date(e.from + 'T12:00:00').getDate()}</b><span>${e.from.length === 7 ? '' : new Date(e.from + 'T12:00:00').toLocaleDateString(undefined, {month:'short'})}</span></div>
      <div class="grow"><b>${esc(e.name)}</b> ${liveNow(e) ? '<span class="tag live-tag">Live</span>' : ''}<div class="muted small">${range(e.from, e.to)} · ${esc(e.place)}</div></div><span class="tag">${esc(e.kind)}</span></div>`).join('') || '<p class="muted">Nothing scheduled yet.</p>'}</div></section>
  <section class="panel"><h2>Recent results</h2><div class="ev-list">${(E.results || []).map(r => `
    <div class="ev"><div class="ev-date done"><b>${new Date(r.date + 'T12:00:00').getDate()}</b><span>${new Date(r.date + 'T12:00:00').toLocaleDateString(undefined, {month:'short'})}</span></div>
      <div class="grow"><b>${esc(r.name)}</b><div class="muted small">${esc(r.place)} · ${fmtDate(r.date)}</div><p>${esc(r.text)}${r.source ? ` <a href="${esc(r.source)}" target="_blank" rel="noopener">Source</a>` : ''}</p></div></div>`).join('')}</div>
    <div class="muted small">Events updated ${fmtDate(E.updated)}. Dates come from FIDE and organisers; check with the organiser before you travel.</div></section>`}`;
}
$('scr-world').addEventListener('click', e => {
  const b = e.target.closest('[data-t],[data-l],[data-fav]');
  if (!b) return;
  if (b.dataset.t){ WS.tab = b.dataset.t; return renderWorld(); }
  if (b.dataset.l){ WS.list = b.dataset.l; return renderWorld(); }
  if (b.dataset.fav != null){
    const id = b.dataset.fav;
    WS.fav = WS.fav.includes(id) ? WS.fav.filter(x => x !== id) : [...WS.fav, id];
    saveFav(); renderWorld();
  }
});
GW.register('world', {onShow: arg => { if (arg && arg.tab) WS.tab = arg.tab; renderWorld(); }});
// Followed players for the home screen
GW.followed = () => {
  const all = [...(LIVE.rankings.open || []), ...(LIVE.rankings.women || [])];
  return WS.fav.map(id => all.find(p => p.fideId === id)).filter(Boolean).map(p => ({name:nice(p.name), fed:p.fed, flag:flag(p.fed), rating:p.rating, rank:p.rank}));
};
GW.worldSpotlight = () => LIVE.events.spotlight;

/* ============================== LEGENDS ============================== */
const LG = {tab:'story', game:null, ply:0, timer:null};
const legendCard = L => `<button class="legend" type="button" data-legend="${L.id}" style="--c:${L.color}">
  <div class="lg-top"><span class="mono" style="--c:${L.color}">${initials(L.name)}</span>${L.no ? `<span class="lg-no">#${L.no}</span>` : ''}</div>
  <b>${esc(L.name)}</b><span class="muted small">${esc(L.fed)} · ${esc(L.life)}</span>
  ${L.reign ? `<span class="lg-reign">${L.kind === 'wwc' ? 'Women’s champion ' : 'Champion '}${esc(L.reign)}</span>` : ''}
  <span class="lg-style">${esc(L.style)}</span></button>`;
function renderLegends(){
  if (LG.game) return renderViewer();
  const tab = LG.tab;
  const tabs = [['story', 'Story of chess'], ['champions', 'World champions'], ['women', 'Women’s champions'], ['legends', 'Legends'], ['games', 'Famous games']];
  let body = '';
  if (tab === 'story') body = `<ol class="timeline">${W.HISTORY.map(h => `<li><span class="tl-when">${esc(h.when)}</span><div class="tl-card"><b>${esc(h.title)}</b><p>${esc(h.text)}</p></div></li>`).join('')}</ol>`;
  else if (tab === 'games') body = `<div class="game-grid">${W.GAMES.map(g => {
      const mv = C.parsePGN(g.pgn); let s = C.initState(); for (const m of mv) s = C.apply(s, m);
      return `<button class="famous" type="button" data-game="${g.id}"><div class="famous-mini">${GW.miniBoard(C.toFEN(s), g.result === '0-1')}</div><div><div class="kicker">${g.year} · ${esc(g.where)}</div><h3>${esc(g.title)}</h3><p class="muted small">${esc(g.white)} – ${esc(g.black)} · ${g.result}</p><p class="small">${esc(g.intro)}</p></div></button>`;
    }).join('')}</div>`;
  else {
    const kind = {champions:'wc', women:'wwc', legends:'legend'}[tab];
    body = `<div class="legend-grid">${W.LEGENDS.filter(L => L.kind === kind).map(legendCard).join('')}</div>`;
  }
  $('scr-legends').innerHTML = `
  <div class="page-head"><div><div class="kicker">Hall of fame</div><h1>Legends of chess</h1><div class="muted">1,400 years of history, every world champion and the games everyone should know.</div></div></div>
  <div class="chips" id="lgTabs" style="margin-bottom:16px">${tabs.map(([k, t]) => `<button class="chip-btn" type="button" data-tab="${k}" aria-pressed="${k === tab}">${t}</button>`).join('')}</div>
  ${body}`;
}
function openLegend(id){
  const L = W.LEGENDS.find(x => x.id === id);
  if (!L) return;
  const g = L.game && W.GAMES.find(x => x.id === L.game);
  const m = GW.modal(`<div class="lg-head"><span class="mono lg" style="--c:${L.color}">${initials(L.name)}</span><div><div class="kicker">${L.kind === 'wc' ? `World Champion #${L.no}` : L.kind === 'wwc' ? 'Women’s World Champion' : 'Legend'}</div><h2 style="text-align:left">${esc(L.name)}</h2><div class="muted small">${esc(L.fed)} · ${esc(L.life)}${L.reign ? ` · ${esc(L.reign)}` : ''}</div></div></div>
    <div class="tag">${esc(L.style)}</div><p class="story">${esc(L.story)}</p>
    <div class="row">${g ? `<button class="btn pop grow" type="button" id="lgPlay">Replay: ${esc(g.title)}</button>` : ''}<button class="btn grow" type="button" id="lgClose">Close</button></div>`, {wide:true});
  m.querySelector('#lgClose').addEventListener('click', () => GW.closeModal());
  m.querySelector('#lgPlay')?.addEventListener('click', () => { GW.closeModal(); openGame(g.id); });
}

/* ---------- Famous game viewer ---------- */
let viewBoard = null;
function openGame(id){
  const g = W.GAMES.find(x => x.id === id);
  if (!g) return;
  LG.game = {g, moves: C.parsePGN(g.pgn)};
  LG.ply = 0;
  if (GW.currentScreen() !== 'legends') GW.show('legends'); else renderLegends();
}
function stopAuto(){ if (LG.timer){ clearInterval(LG.timer); LG.timer = null; } }
function renderViewer(){
  const {g, moves} = LG.game;
  $('scr-legends').innerHTML = `
  <div class="play">
    <div class="board-col"><div class="player"><b>${esc(g.black)}</b><span class="spacer"></span><span class="muted small">Black</span></div><div id="lgBoard"></div><div class="player"><b>${esc(g.white)}</b><span class="spacer"></span><span class="muted small">White</span></div></div>
    <aside class="panel">
      <div class="row"><button class="btn ghost" id="lgBack" type="button">← Famous games</button></div>
      <div><div class="kicker">${g.year} · ${esc(g.where)}</div><h2>${esc(g.title)}</h2><div class="muted small">${esc(g.white)} – ${esc(g.black)} · ${g.result}</div></div>
      <div class="coach small-coach" id="lgNote"></div>
      <div class="progress"><div id="lgProg"></div></div>
      <div class="navbar"><button class="btn" id="lgFirst" type="button" aria-label="Start">${ICON.first}</button><button class="btn" id="lgPrev" type="button" aria-label="Back">${ICON.prev}</button><button class="btn violet" id="lgAuto" type="button">Play</button><button class="btn" id="lgNext" type="button" aria-label="Forward">${ICON.next}</button></div>
      <ol class="moves" id="lgMoves"></ol>
      <div class="row"><button class="btn grow" id="lgAnalyse" type="button">Open in analysis</button><button class="btn grow" id="lgPgn" type="button">Copy PGN</button></div>
    </aside>
  </div>`;
  if (viewBoard){ const i = GW.boards.indexOf(viewBoard); if (i >= 0) GW.boards.splice(i, 1); }
  viewBoard = new Board($('lgBoard'), {canMove: () => false});
  viewBoard.flipped = g.result === '0-1';
  $('lgBack').addEventListener('click', () => { stopAuto(); LG.game = null; LG.tab = 'games'; renderLegends(); });
  $('lgFirst').addEventListener('click', () => { stopAuto(); goPly(0); });
  $('lgPrev').addEventListener('click', () => { stopAuto(); goPly(LG.ply - 1); });
  $('lgNext').addEventListener('click', () => { stopAuto(); goPly(LG.ply + 1, true); });
  $('lgAuto').addEventListener('click', () => {
    if (LG.timer){ stopAuto(); paintAuto(); return; }
    if (LG.ply >= moves.length) goPly(0);
    LG.timer = setInterval(() => { if (LG.ply >= moves.length){ stopAuto(); paintAuto(); return; } goPly(LG.ply + 1, true); }, 1500);
    paintAuto();
  });
  $('lgMoves').addEventListener('click', e => { const b = e.target.closest('[data-ply]'); if (b){ stopAuto(); goPly(+b.dataset.ply); } });
  $('lgAnalyse').addEventListener('click', () => { stopAuto(); GW.show('analysis', {moves: moves.slice(), ply: LG.ply}); });
  $('lgPgn').addEventListener('click', () => GW.copyText(C.toPGN(moves, {Event: g.title, Site: g.where, Date: String(g.year), White: g.white, Black: g.black, Result: g.result}), 'PGN copied'));
  goPly(LG.ply);
}
const paintAuto = () => { const b = $('lgAuto'); if (b) b.textContent = LG.timer ? 'Pause' : 'Play'; };
function goPly(p, animate){
  const {g, moves} = LG.game;
  LG.ply = Math.max(0, Math.min(moves.length, p));
  let s = C.initState();
  for (let i = 0; i < LG.ply; i++) s = C.apply(s, moves[i]);
  const last = LG.ply ? moves[LG.ply - 1] : null;
  viewBoard.set(s, {last, slides: animate && last ? slidesFor(last, false) : null});
  if (animate && last) sfx.forMove(moveKind(last, s), false);
  // nearest note at or before this ply
  const keys = Object.keys(g.notes).map(Number).sort((a, b) => a - b);
  const k = [...keys].reverse().find(x => x <= LG.ply);
  const fresh = k === LG.ply;
  $('lgNote').innerHTML = LG.ply === 0 ? `<div class="grow"><h3>Before the game</h3><p>${esc(g.intro)}</p></div>` :
    `<div class="grow"><h3>${fresh ? 'Key moment' : 'Move ' + Math.ceil(LG.ply / 2)}</h3><p>${k != null ? esc(g.notes[k]) : 'Press play or step through the moves.'}</p></div>`;
  $('lgNote').classList.toggle('hot', fresh);
  $('lgProg').style.width = (LG.ply / moves.length * 100) + '%';
  let html = '', st = C.initState();
  moves.forEach((m, i) => {
    const sanTxt = C.san(st, m); st = C.apply(st, m);
    const cell = `<button class="mv${i + 1 === LG.ply ? ' cur' : ''}${g.notes[i + 1] ? ' noted' : ''}" type="button" data-ply="${i + 1}">${sanTxt}</button>`;
    if (i % 2 === 0) html += `<li><span class="n">${i / 2 + 1}.</span>${cell}`; else html += `${cell}</li>`;
  });
  if (moves.length % 2) html += '<span></span></li>';
  $('lgMoves').innerHTML = html + (LG.ply === moves.length ? `<span class="res">${g.result}</span>` : '');
  $('lgMoves').querySelector('.cur')?.scrollIntoView({block:'nearest'});
}
$('scr-legends').addEventListener('click', e => {
  const b = e.target.closest('[data-tab],[data-legend],[data-game]');
  if (!b) return;
  if (b.dataset.tab){ LG.tab = b.dataset.tab; return renderLegends(); }
  if (b.dataset.legend) return openLegend(b.dataset.legend);
  if (b.dataset.game) return openGame(b.dataset.game);
});
document.addEventListener('keydown', e => {
  if (GW.currentScreen() !== 'legends' || !LG.game || e.target.closest('input,textarea')) return;
  if (e.key === 'ArrowRight'){ stopAuto(); goPly(LG.ply + 1, true); e.preventDefault(); }
  if (e.key === 'ArrowLeft'){ stopAuto(); goPly(LG.ply - 1); e.preventDefault(); }
});
GW.register('legends', {onShow: arg => { if (arg && arg.tab){ LG.tab = arg.tab; LG.game = null; } if (arg && arg.game) return openGame(arg.game); renderLegends(); }, onHide: () => stopAuto()});
GW.openFamousGame = openGame;
})();
