/* Elite Chess: play menu, games against bots and friends, rating, game review and cups. */
(() => {
const GW = window.GW;
const {C, D, $, esc, sleep, now, NAME, PIECE_NAME, avatarSVG, sfx, moveKind, Board, slidesFor, barHTML, profile, store} = GW;
const {opp, sqName, legal, apply, san, uci, fromUci, inCheck, posKey, insufficient, Engine} = C;

const ICON = {
  undo:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14 4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 0 10h-3"/></svg>',
  pause:'<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>',
  flip:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4v16M7 20l-3-3M7 20l3-3M17 20V4M17 4l-3 3M17 4l3 3"/></svg>',
  flag:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 21V4M5 4h11l-2 4 2 4H5"/></svg>',
  plus:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  draw:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20 20 4"/><path d="M5 5h3v6M14 15h5l-5 5h5"/></svg>',
  live:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 6l6 6-6 6M13 6l6 6-6 6"/></svg>',
  bulb:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.8.8 1 1.5 1 2.5h6c0-1 .2-1.7 1-2.5A6 6 0 0 0 12 3z"/></svg>',
  first:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 5v14M18 6l-7 6 7 6"/></svg>',
  prev:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg>',
  next:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>',
  last:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M18 5v14M6 6l7 6-7 6"/></svg>'
};
GW.ICON = ICON;
const trophySVG = (color, medal) => `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M18 8h28v14a14 14 0 0 1-28 0z" fill="${color}"/><path d="M18 12H9a9 9 0 0 0 11 12M46 12h9a9 9 0 0 1-11 12" fill="none" stroke="${color}" stroke-width="4"/><path d="M28 36h8v8h-8z" fill="${color}"/><rect x="20" y="44" width="24" height="8" rx="2" fill="${color}"/><rect x="16" y="52" width="32" height="6" rx="2" fill="#4b3a1a" opacity=".8"/><path d="M24 12h6v12a7 7 0 0 1-6-6z" fill="#fff" opacity=".35"/>${medal ? `<circle cx="50" cy="50" r="10" fill="${{gold:'#ffc531', silver:'#c9d1dc', bronze:'#d08a4f'}[medal]}" stroke="#fff" stroke-width="2"/>` : ''}</svg>`;
GW.trophySVG = trophySVG;
const tcLabel = id => (D.TIME_CONTROLS.find(t => t.id === id) || {label:'No clock'}).label;

/* ============================== SETUP (the start menu) ============================== */
const setup = store.get('gw-setup', {mode:'cpu', bot:5, tier:1, side:'w', cvcW:9, cvcB:13, tc:'0', rated:true});
$('scr-setup').innerHTML = `
<div class="play">
  <div class="board-col">
    <div class="player" id="setupTop"></div>
    <div id="setupBoard"></div>
    <div class="player" id="setupBot"></div>
  </div>
  <aside class="panel">
    <div class="row"><h2 class="grow">Play</h2><span class="rating-chip" id="setupRating"></span></div>
    <div class="tabs" id="modeTabs" role="group" aria-label="Opponent">
      <button type="button" data-v="cpu">Bots</button><button type="button" data-v="online">Online</button><button type="button" data-v="pvp">Local</button><button type="button" data-v="cvc">Bot vs bot</button>
    </div>
    <div id="cpuSetup" class="stack">
      <div class="bot-hero" id="botHero"></div>
      <div class="tabs small" id="tierTabs"></div>
      <div class="bot-grid" id="botGrid" role="group" aria-label="Choose a bot"></div>
    </div>
    <div id="cvcSetup" class="stack">
      <div class="label">White</div><div class="bot-grid" id="cvcW"></div>
      <div class="label">Black</div><div class="bot-grid" id="cvcB"></div>
    </div>
    <div id="pvpSetup" class="muted small">Two players share this device and take turns.</div>
    <div id="onlineSetup" class="stack">
      <p class="muted small" style="margin:0">Find someone to play at this time control, or play a friend with a code.</p>
      <div id="olBox"></div>
    </div>
    <div class="engine-note" id="engineNote" hidden></div>
    <div id="sideField">
      <div class="label" style="margin-bottom:6px">Your colour</div>
      <div class="sides" id="sides">
        <button class="side" type="button" data-v="w"><span class="pc pc-wK"></span>White</button>
        <button class="side" type="button" data-v="r"><span class="pc-pair"><i class="pc-wK"></i><i class="pc-bK"></i></span>Random</button>
        <button class="side" type="button" data-v="b"><span class="pc pc-bK"></span>Black</button>
      </div>
    </div>
    <div><div class="label" style="margin-bottom:6px">Time control</div><div class="tc-grid" id="tcGrid"></div></div>
    <div class="switch" id="ratedRow">Rated game<button type="button" id="ratedBtn" aria-label="Rated game"></button></div>
    <div class="play-cta"><button class="btn pop big" id="playBtn" type="button">Play</button></div>
  </aside>
</div>`;
const setupBoard = new Board($('setupBoard'));
const sfNeeded = () => setup.mode === 'cpu' ? !!D.BOTS[setup.bot].sf : setup.mode === 'cvc' ? !!(D.BOTS[setup.cvcW].sf || D.BOTS[setup.cvcB].sf) : false;
const botTiles = (sel, list) => list.map(k => { const b = D.BOTS[k]; return `<button class="tile" type="button" data-k="${k}" aria-pressed="${k === sel}" aria-label="${b.name}, rating ${b.elo}" title="${b.name} · ${b.elo}"><div class="av">${avatarSVG(b)}</div><span class="r">${b.elo}</span></button>`; }).join('');
const allBots = D.BOTS.map((_, k) => k);

function renderSetup(){
  syncEcho();
  store.set('gw-setup', setup);
  $('setupRating').innerHTML = `<b>${profile.rating}</b> rating`;
  $('modeTabs').querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === setup.mode)));
  $('cpuSetup').hidden = setup.mode !== 'cpu';
  $('cvcSetup').hidden = setup.mode !== 'cvc';
  $('pvpSetup').hidden = setup.mode !== 'pvp';
  $('onlineSetup').hidden = setup.mode !== 'online';
  $('onlineSetup').closest('.panel').classList.toggle('is-online', setup.mode === 'online');
  $('playBtn').closest('.play-cta').hidden = setup.mode === 'online';
  if (setup.mode === 'online'){ if (setup.tc === '0') setup.tc = '300+0'; renderOnline(); }
  $('sideField').hidden = setup.mode !== 'cpu';
  $('ratedRow').hidden = setup.mode !== 'cpu';
  $('ratedBtn').setAttribute('aria-pressed', String(setup.rated));
  const bot = D.BOTS[setup.bot];
  $('botHero').innerHTML = `<div class="av">${avatarSVG(bot)}</div><div class="grow"><h3>${bot.name}<span class="elo">${bot.elo}</span></h3><div class="muted" style="font-size:13px">${esc(bot.blurb)} <span class="tag">${esc(bot.style)}</span></div><div class="bubble">${esc(bot.greet)}</div></div>`;
  $('tierTabs').innerHTML = D.TIERS.map((t, k) => `<button type="button" data-v="${k}" aria-pressed="${k === setup.tier}">${t}</button>`).join('');
  $('botGrid').innerHTML = botTiles(setup.bot, allBots.filter(k => D.BOTS[k].tier === setup.tier));
  $('cvcW').innerHTML = botTiles(setup.cvcW, allBots);
  $('cvcB').innerHTML = botTiles(setup.cvcB, allBots);
  $('sides').querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === setup.side)));
  $('tcGrid').innerHTML = D.TIME_CONTROLS.filter(t => setup.mode !== 'online' || t.id !== '0').map(t => `<button class="tc" type="button" data-v="${t.id}" aria-pressed="${t.id === setup.tc}"><small>${t.group}</small>${t.label}</button>`).join('');
  const note = $('engineNote');
  note.hidden = !sfNeeded() || Engine.status === 'ready';
  note.className = 'engine-note' + (Engine.status === 'failed' ? ' warn' : '');
  note.textContent = Engine.status === 'failed' ? 'Stockfish could not load, so bots rated above 1250 play at about 1250.' : 'Loading Stockfish for the stronger bots…';
  let top, bottom, flip = false;
  if (setup.mode === 'cpu'){ top = bot; bottom = GW.me(); flip = setup.side === 'b'; }
  else if (setup.mode === 'online'){ top = {name:'Online opponent', look:D.PEOPLE.black.look}; bottom = GW.me(); }
  else if (setup.mode === 'cvc'){ top = D.BOTS[setup.cvcB]; bottom = D.BOTS[setup.cvcW]; }
  else { top = D.PEOPLE.black; bottom = D.PEOPLE.white; }
  $('setupTop').innerHTML = barHTML(top, 'b');
  $('setupBot').innerHTML = barHTML(bottom, 'w');
  setupBoard.flipped = flip;
  setupBoard.render();
  if (sfNeeded()) Engine.boot();
}
$('modeTabs').addEventListener('click', e => { const b = e.target.closest('button'); if (b){ setup.mode = b.dataset.v; renderSetup(); } });
$('tierTabs').addEventListener('click', e => { const b = e.target.closest('button'); if (b){ setup.tier = +b.dataset.v; const first = allBots.find(k => D.BOTS[k].tier === setup.tier); if (D.BOTS[setup.bot].tier !== setup.tier) setup.bot = first; renderSetup(); } });
$('botGrid').addEventListener('click', e => { const b = e.target.closest('.tile'); if (b){ setup.bot = +b.dataset.k; renderSetup(); } });
$('cvcW').addEventListener('click', e => { const b = e.target.closest('.tile'); if (b){ setup.cvcW = +b.dataset.k; renderSetup(); } });
$('cvcB').addEventListener('click', e => { const b = e.target.closest('.tile'); if (b){ setup.cvcB = +b.dataset.k; renderSetup(); } });
$('sides').addEventListener('click', e => { const b = e.target.closest('button'); if (b){ setup.side = b.dataset.v; renderSetup(); } });
$('tcGrid').addEventListener('click', e => { const b = e.target.closest('button'); if (b){ setup.tc = b.dataset.v; renderSetup(); } });
$('ratedBtn').addEventListener('click', () => { setup.rated = !setup.rated; renderSetup(); });
// Starting a new game while one is unfinished: continue it, or resign it (a rated game counts as a loss) and start
$('playBtn').addEventListener('click', () => {
  const g = G;
  if (!g || g.over || !g.hist.length || g.mode === 'online') return startGame(configFromSetup());
  const ratedCpu = g.rated && g.mode === 'cpu';
  const m = GW.modal(`<h2>Game in progress</h2><div class="sub">You have an unfinished game${ratedCpu ? ' (rated)' : ''}.</div>
    <div class="stack"><button class="btn pop big" id="gpCont" type="button">Continue that game</button>
      <button class="btn" id="gpNew" type="button">${ratedCpu ? 'Resign it and start the new game' : 'Start the new game'}</button>
      ${ratedCpu ? '<div class="muted small">Resigning counts as a loss for your rating.</div>' : ''}
      <button class="btn ghost" id="gpCancel" type="button">Cancel</button></div>`);
  m.querySelector('#gpCont').addEventListener('click', () => { GW.closeModal(); GW.show('game'); });
  m.querySelector('#gpCancel').addEventListener('click', () => GW.closeModal());
  m.querySelector('#gpNew').addEventListener('click', () => {
    GW.closeModal();
    if (ratedCpu){ g.resigned = g.human; ui.away = false; renderGame(); }
    startGame(configFromSetup());
  });
});
Engine.onStatus(() => { if (GW.currentScreen() === 'setup') renderSetup(); if (G) renderGame(); });
/* ---------- Online: find a game ---------- */
function renderOnline(){
  const box = $('olBox');
  if (!box || !GW.Online) return;
  const st = GW.Online.state(), tc = tcLabel(setup.tc);
  const busy = ['searching', 'hosting', 'joining'].includes(st.state);
  if (st.state === 'hosting' && st.code){
    box.innerHTML = `<div class="ol-card"><div class="label">Your game code</div><div class="ol-code" aria-label="Game code ${st.code.split('').join(' ')}">${st.code}</div>
      <div class="muted small">Send this code to your friend. They open Elite Chess → Play → Online and enter it. Time: ${esc(tc)}.</div>
      <div class="ol-status"><span class="spin" aria-hidden="true"></span>${esc(st.note)}</div>
      <div class="row"><button class="btn violet grow" id="olCopy" type="button">Copy code</button><button class="btn grow" id="olCancel" type="button">Cancel</button></div></div>`;
  } else if (busy){
    box.innerHTML = `<div class="ol-card"><div class="ol-status big"><span class="spin" aria-hidden="true"></span>${esc(st.note)}</div>
      <div class="muted small">${st.state === 'searching' ? `Time control: ${esc(tc)}. Keep this screen open.` : ''}</div>
      <div class="ol-now muted small" id="olNow" hidden></div>
      <button class="btn" id="olCancel" type="button">Cancel</button></div>`;
  } else {
    box.innerHTML = `${st.state === 'error' ? `<div class="feedback bad"><span class="ic">!</span><div>${esc(st.note)}</div></div>` : ''}
      <div class="ol-now muted small" id="olNow" hidden></div>
      <button class="btn pop big" id="olQuick" type="button">Quick match · ${esc(tc)}</button>
      <div class="ol-or"><span>or play a friend</span></div>
      <div class="ol-friend">
        <button class="btn violet" id="olHost" type="button">Create a code</button>
        <form class="ol-join" id="olJoinForm"><input class="search" id="olCode" maxlength="5" placeholder="Enter code" autocomplete="off" autocapitalize="characters" spellcheck="false" aria-label="Friend's game code"><button class="btn" id="olJoin" type="submit">Join</button></form>
      </div>`;
  }
  renderOnlineNow();
}
GW.renderOnline = () => { if (GW.currentScreen() === 'setup' && setup.mode === 'online') renderOnline(); };
// Who else has the app open right now (only known when playing inside Claude)
function renderOnlineNow(){
  const el = $('olNow');
  if (!el || !GW.Online) return;
  const {here, seeking} = GW.Online.state();
  el.hidden = here == null;
  if (here == null) return;
  el.innerHTML = here === 0
    ? '<span class="ol-dot off"></span>No one else is on right now. Share the app with a friend, then send them a code.'
    : `<span class="ol-dot"></span>${here} other player${here === 1 ? '' : 's'} on now${seeking ? ` · ${seeking} looking for a game` : ''}`;
}
GW.renderOnlineNow = () => { if (GW.currentScreen() === 'setup' && setup.mode === 'online') renderOnlineNow(); };
$('olBox').addEventListener('click', e => {
  const b = e.target.closest('button');
  if (!b) return;
  if (b.id === 'olQuick'){ store.set('gw-setup', setup); GW.Online.quickMatch(setup.tc); }
  if (b.id === 'olHost'){ store.set('gw-setup', setup); GW.Online.hostInvite(setup.tc); }
  if (b.id === 'olCancel') GW.Online.cancel();
  if (b.id === 'olCopy') GW.copyText(GW.Online.state().code, 'Code copied');
});
$('olBox').addEventListener('submit', e => { e.preventDefault(); GW.Online.joinCode($('olCode').value); });
$('olBox').addEventListener('input', e => { if (e.target.id === 'olCode') e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''); });

GW.register('setup', {onHide: () => { const st = GW.Online && GW.Online.state(); if (st && ['searching', 'hosting', 'joining'].includes(st.state)) GW.Online.cancel(); }, onShow: arg => { if (arg && arg.bot != null){ setup.mode = 'cpu'; setup.bot = arg.bot; setup.tier = D.BOTS[arg.bot].tier; } renderSetup(); }});

function configFromSetup(){
  const human = setup.mode === 'cpu' ? (setup.side === 'r' ? (Math.random() < 0.5 ? 'w' : 'b') : setup.side) : null;
  const bots = setup.mode === 'cpu' ? {[opp(human)]: setup.bot, [human]: null}
             : setup.mode === 'cvc' ? {w: setup.cvcW, b: setup.cvcB} : {w:null, b:null};
  return {mode: setup.mode, human, bots, tc: setup.tc, rated: setup.mode === 'cpu' && setup.rated};
}

/* ============================== GAME ============================== */
$('scr-game').innerHTML = `
<div class="play">
  <div class="board-col">
    <div class="player" id="topBar"></div>
    <div id="gameBoard"></div>
    <div class="player" id="botBar"></div>
  </div>
  <aside class="panel">
    <div class="game-head" id="gameHead"></div>
    <div><div class="status" id="status"></div><div class="status-sub" id="statusSub"></div><div class="opening-name" id="gameOpening"></div></div>
    <button class="btn violet" id="liveBtn" type="button" hidden>${ICON.live}Back to the game</button>
    <ol class="moves" id="moves"></ol>
    <button class="btn pop" id="reviewNowBtn" type="button" hidden>Game Review</button>
    <div class="controls">
      <button class="btn" id="hintBtn" type="button">${ICON.bulb}Hint</button>
      <button class="btn" id="undoBtn" type="button">${ICON.undo}Takeback</button>
      <button class="btn" id="drawBtn" type="button">${ICON.draw}Draw</button>
      <button class="btn" id="pauseBtn" type="button">${ICON.pause}<span>Pause</span></button>
      <button class="btn" id="flipBtn" type="button">${ICON.flip}Flip</button>
      <button class="btn" id="resignBtn" type="button">${ICON.flag}Resign</button>
      <button class="btn" id="newBtn" type="button">${ICON.plus}New</button>
    </div>
  </aside>
</div>`;

let G = null;
const ui = {thinking:false, paused:false, away:false, flipped:false, view:null, lastChat:null};
let thinkToken = 0, turnStart = now();
const cur = () => G.states[G.states.length - 1];
const gameBoard = new Board($('gameBoard'), {canMove: () => humanCanMove(), onMove: (m, dragged) => doMove(m, dragged),
  // premoves while a bot or an online opponent is to move
  premove: () => G && !G.over && ui.view == null && !ui.paused && (G.mode === 'cpu' || G.mode === 'online') && cur().turn !== G.human ? G.human : null});
// Play a queued premove as soon as it is our turn, if it is still legal
function tryPremove(){
  const p = gameBoard.premove;
  if (!p) return;
  gameBoard.premove = null;
  if (!humanCanMove()){ gameBoard.render(); return; }
  const c = legal(cur()).filter(m => m.from === p.from && m.to === p.to);
  if (!c.length){ gameBoard.render(); return; }
  doMove(c.find(m => m.promo === 'Q') || c[0], false);
}
GW.currentGame = () => G;

function parseTc(v){
  if (!v || v === '0') return null;
  const [base, inc] = v.split('+').map(Number);
  return {base: base * 1000, inc: (inc || 0) * 1000};
}
function playerOf(cfg, c){
  if (cfg.bots[c] != null) return D.BOTS[cfg.bots[c]];
  if (cfg.mode === 'cpu') return GW.me();
  if (cfg.mode === 'online') return c === cfg.human ? GW.me() : Object.assign({name:'Opponent', look:D.PEOPLE.black.look}, cfg.online && cfg.online.opp);
  return c === 'w' ? D.PEOPLE.white : D.PEOPLE.black;
}

// Thinking time for rated bots: enough for the calibrated strength to show, quicker for the lower ratings
const botThinkMs = elo => elo >= 3190 ? 2500 : Math.max(350, Math.min(1500, 350 + (elo - 1320) * 0.6));
// Echo plays at your rating: borrow the engine settings of the regular bot closest to it
function syncEcho(){
  const echo = D.BOTS.find(b => b.adaptive);
  if (!echo) return;
  const r = Math.round(profile.rating / 50) * 50;
  const near = D.BOTS.filter(b => b.tier < 5).reduce((a, b) => Math.abs(b.elo - r) < Math.abs(a.elo - r) ? b : a);
  echo.elo = Math.max(100, r);
  if (near.sf){ echo.sf = Object.assign({}, near.sf); delete echo.local; }
  else { echo.local = Object.assign({}, near.local); delete echo.sf; }
}
GW.syncEcho = syncEcho;
function startGame(cfg){
  syncEcho();
  if (cfg.mode !== 'online' && GW.Online && GW.Online.state().state === 'playing') GW.Online.leave();
  thinkToken++;
  GW.closeModal();
  const s = C.initState(), tc = parseTc(cfg.tc);
  G = Object.assign({}, cfg, {states:[s], hist:[], keys:[posKey(s)], tcObj:tc,
        times:[{w: tc ? tc.base : 0, b: tc ? tc.base : 0}], flag:null, resigned:null, warned:{}, over:false, endShown:false,
        assisted:false, tookBack:false});
  turnStart = now();
  Engine.newGame();
  Object.assign(ui, {thinking:false, paused:false, away:false, flipped: cfg.human === 'b', view:null});
  gameBoard.premove = null;
  if (Object.values(cfg.bots).some(k => k != null && D.BOTS[k].sf)) Engine.boot();
  G.chat = cfg.mode === 'cpu' ? D.BOTS[cfg.bots[opp(cfg.human)]].greet : '';
  GW.show('game');
  syncBoard(null);
  renderGame();
  sfx.start();
  maybeCpu();
}
GW.startGame = startGame;

function gameStatus(){
  const s = cur();
  if (G.resigned) { const w = opp(G.resigned); return {over:true, title:`${NAME[w]} wins`, reason:'by resignation', result: w === 'w' ? '1–0' : '0–1', winner:w}; }
  if (G.drawAgreed) return {over:true, title:'Draw', reason:'by agreement', result:'½–½'};
  if (G.oppLeft){ const w = G.human; return {over:true, title:`${NAME[w]} wins`, reason:'because your opponent left', result: w === 'w' ? '1–0' : '0–1', winner:w}; }
  if (G.flag){
    const w = opp(G.flag);
    if (s.board.every(p => !p || p[0] !== w || p[1] === 'K')) return {over:true, title:'Draw', reason:'timeout, but no mating material', result:'½–½'};
    return {over:true, title:`${NAME[w]} wins`, reason:'on time', result: w === 'w' ? '1–0' : '0–1', winner:w};
  }
  const moves = legal(s), check = inCheck(s);
  if (!moves.length){
    if (check) return {over:true, title:`${NAME[opp(s.turn)]} wins`, reason:'by checkmate', result: s.turn === 'w' ? '0–1' : '1–0', check, winner:opp(s.turn)};
    return {over:true, title:'Draw', reason:'by stalemate', result:'½–½', check};
  }
  const key = G.keys[G.keys.length - 1];
  if (G.keys.filter(k => k === key).length >= 3) return {over:true, title:'Draw', reason:'by repetition', result:'½–½'};
  if (s.half >= 100) return {over:true, title:'Draw', reason:'by the fifty-move rule', result:'½–½'};
  if (insufficient(s.board)) return {over:true, title:'Draw', reason:'by insufficient material', result:'½–½'};
  return {over:false, check};
}

/* Clocks: G.times[k] holds both players' remaining ms when position k began; the side to move's clock runs from turnStart */
const clockRunning = () => !!(G && G.tcObj && G.hist.length > 0 && !G.over && !ui.paused && !ui.away);
function clockLeft(c){
  const t = G.times[G.times.length - 1][c];
  return clockRunning() && cur().turn === c ? t - (now() - turnStart) : t;
}
function fmtClock(ms){
  if (ms < 10000) return (Math.floor(ms / 100) / 10).toFixed(1);
  const s = Math.ceil(ms / 1000);
  return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
}
function paintClocks(){
  if (!G || !G.tcObj) return;
  const running = clockRunning(), turn = cur().turn;
  for (const c of ['w', 'b']){
    const el = $('clock-' + c);
    if (!el) continue;
    const ms = Math.max(0, clockLeft(c));
    el.textContent = fmtClock(ms);
    el.classList.toggle('on', running && turn === c);
    el.classList.toggle('low', ms < 20000 && ((running && turn === c) || G.flag === c));
  }
}
function flagFall(c){
  G.times[G.times.length - 1][c] = 0;
  G.flag = c;
  thinkToken++;
  ui.thinking = false;
  gameBoard.clearDrag(); gameBoard.cancelPromo();
  renderGame();
}
setInterval(() => {
  if (!clockRunning()) return;
  const c = cur().turn, left = clockLeft(c);
  if (left <= 0){
    if (G.mode === 'online' && c !== G.human && left > -2000) return paintClocks();
    if (G.mode === 'online' && c === G.human) GW.Online.send({t:'flag'});
    return flagFall(c);
  }
  const human = G.mode === 'pvp' || ((G.mode === 'cpu' || G.mode === 'online') && c === G.human);
  if (human && left < 10000 && !G.warned[c]){ G.warned[c] = true; sfx.lowTime(); }
  paintClocks();
}, 100);

function syncBoard(m, dragged){
  gameBoard.flipped = ui.flipped;
  if (ui.view != null && ui.view < G.hist.length){
    // browsing an earlier position: read-only
    gameBoard.set(G.states[ui.view], {last: ui.view ? G.hist[ui.view - 1].m : null});
    return;
  }
  ui.view = null;
  const last = G.hist.length ? G.hist[G.hist.length - 1].m : null;
  gameBoard.set(cur(), {last, slides: m ? slidesFor(m, dragged) : null});
}
// Step through the moves of the game in progress (arrow keys or tapping a move)
function viewPly(n){
  if (!G) return;
  n = Math.max(0, Math.min(G.hist.length, n));
  const prev = ui.view == null ? G.hist.length : ui.view;
  if (n === prev) return;
  ui.view = n >= G.hist.length ? null : n;
  const m = n > prev && n === prev + 1 ? G.hist[n - 1].m : null;
  gameBoard.flipped = ui.flipped;
  gameBoard.set(G.states[n], {last: n ? G.hist[n - 1].m : null, slides: m ? slidesFor(m, false) : null});
  if (m) sfx.forMove(moveKind(m, G.states[n]), true);
  renderGame();
}

const REACT = {
  check: ['Check!', 'Watch your king.', 'Check. Your move.'],
  grab: ['Thanks for that!', 'Mine now.', 'I’ll take it.', 'A gift? Don’t mind if I do.'],
  ouch: ['Ouch.', 'I didn’t see that coming.', 'Hmm, nice one.', 'Well spotted.']
};
const pick = a => a[GW.rnd(a.length)];

function doMove(m, dragged){
  if (!G || G.over) return;
  ui.view = null;
  const s = cur();
  const t = Object.assign({}, G.times[G.times.length - 1]);
  if (G.tcObj && G.hist.length){
    const left = clockLeft(s.turn);
    if (left <= 0){ flagFall(s.turn); return; }
    t[s.turn] = left + G.tcObj.inc;
  }
  const text = san(s, m);
  const n = apply(s, m);
  G.states.push(n); G.hist.push({m, san:text}); G.keys.push(posKey(n)); G.times.push(t);
  turnStart = now();
  gameBoard.auto = [];
  syncBoard(m, dragged);
  if (G.mode === 'cpu'){
    const botMoved = G.bots[s.turn] != null;
    if (botMoved && inCheck(n) && Math.random() < 0.5) G.chat = pick(REACT.check);
    else if (botMoved && m.cap && C.VAL[m.cap[1]] >= 300 && Math.random() < 0.6) G.chat = pick(REACT.grab);
    else if (!botMoved && m.cap && C.VAL[m.cap[1]] >= 300 && Math.random() < 0.6) G.chat = pick(REACT.ouch);
  }
  renderGame();
  const self = G.mode === 'pvp' || ((G.mode === 'cpu' || G.mode === 'online') && s.turn === G.human);
  if ((G.mode === 'cpu' || G.mode === 'online') && s.turn !== G.human && gameBoard.premove) setTimeout(tryPremove, 60);
  if (G.mode === 'online' && s.turn === G.human){
    const tt = G.times[G.times.length - 1];
    GW.Online.send({t:'move', u:uci(m), ply:G.hist.length, w:tt.w, b:tt.b});
  }
  sfx.forMove(moveKind(m, n), self);
  maybeCpu();
}

function undo(){
  if (!G || !G.hist.length || G.mode === 'cvc' || G.cup) return;
  thinkToken++;
  ui.thinking = false;
  G.tookBack = true;
  gameBoard.premove = null;
  const pop = () => { G.states.pop(); G.hist.pop(); G.keys.pop(); G.times.pop(); };
  pop();
  if (G.mode === 'cpu') while (G.hist.length && cur().turn !== G.human) pop();
  G.flag = null; G.resigned = null; G.over = false; G.endShown = false;
  turnStart = now();
  GW.closeModal();
  syncBoard(null);
  renderGame();
  maybeCpu();
}

function togglePause(){
  if (!G || G.over || G.mode !== 'cvc') return;
  if (!ui.paused){
    if (clockRunning()) G.times[G.times.length - 1][cur().turn] = clockLeft(cur().turn);
    ui.paused = true; ui.thinking = false; thinkToken++;
    renderGame();
  } else {
    ui.paused = false; turnStart = now();
    renderGame();
    maybeCpu();
  }
}

async function hint(){
  if (!humanCanMove()) return;
  G.assisted = true;
  const s = cur();
  $('hintBtn').disabled = true;
  const r = await GW.engineBest(s);
  $('hintBtn').disabled = false;
  if (cur() !== s) return;
  const m = fromUci(s, r.best);
  if (m){ gameBoard.auto = [{from:m.from, to:m.to, color:'v'}]; gameBoard.render(); }
  renderGame();
}

const cpuToMove = () => G && !G.over && !ui.paused && !ui.away && G.bots[cur().turn] != null;
const humanCanMove = () => G && ui.view == null && (G.mode !== 'online' || cur().turn === G.human) && !ui.thinking && !G.over && !ui.paused && G.bots[cur().turn] == null && GW.currentScreen() === 'game';

async function maybeCpu(){
  if (!cpuToMove()) return;
  const token = ++thinkToken;
  ui.thinking = true;
  renderGame();
  const t0 = now(), bot = D.BOTS[G.bots[cur().turn]];
  let m = null;
  await sleep(30);
  if (token !== thinkToken) return;
  // personality bots follow their own repertoire while the game stays in it
  if (bot.book && G.hist.length < 24){
    const prefix = G.hist.map(h => uci(h.m)).join(' ');
    const nexts = bot.book.map(l => l.split(' ')).filter(l => l.length > G.hist.length && l.slice(0, G.hist.length).join(' ') === prefix).map(l => l[G.hist.length]);
    if (nexts.length) m = fromUci(cur(), nexts[GW.rnd(nexts.length)]);
  }
  // bots like to play known opening moves early on
  if (!m && G.hist.length < 10 && bot.elo >= 1000 && Math.random() < 0.7){
    const prefix = G.hist.map(h => uci(h.m)).join(' ');
    const nexts = [];
    for (const line of GW.OPEN_BY_LINE.keys()){
      if (prefix && !line.startsWith(prefix + ' ')) continue;
      const mv = line.split(' ')[G.hist.length];
      if (mv) nexts.push(mv);
    }
    const popular = ['e2e4', 'd2d4', 'c2c4', 'g1f3', 'e7e5', 'c7c5', 'e7e6', 'c7c6', 'd7d5', 'g8f6'];
    const pool = nexts.filter(u => G.hist.length > 1 || popular.includes(u));
    if (pool.length && bot.sf){
      // check the book move with a quick engine look so strong bots never play junk lines
      const cand = pool[GW.rnd(pool.length)];
      const r = await Engine.boot() ? await Engine.search('position startpos' + (prefix ? ' moves ' + prefix : ''), {depth:8, ms:0, multipv:4}) : null;
      if (token !== thinkToken) return;
      if (r && r.lines.some(l => l.pv[0] === cand)) m = fromUci(cur(), cand);
    } else if (pool.length && bot.elo < 1300) m = fromUci(cur(), pool[GW.rnd(pool.length)]);
  }
  if (!m && bot.sf && await Engine.boot()){
    if (token !== thinkToken) return;
    // Stockfish 17.1 plays at the bot's exact rating (its calibrated UCI_Elo); older engines use the skill settings
    const exact = Engine.modern;
    let ms = exact ? botThinkMs(bot.elo) : bot.sf.ms;
    if (G.tcObj) ms = Math.min(ms, clockLeft(cur().turn) / 30 + G.tcObj.inc * 0.8);
    const r = await Engine.search('position startpos' + (G.hist.length ? ' moves ' + G.hist.map(h => uci(h.m)).join(' ') : ''),
                                  exact ? {elo: bot.elo >= 3190 ? 0 : bot.elo, ms: Math.max(50, ms)} : {skill: bot.sf.skill, depth: bot.sf.depth, ms: Math.max(50, ms)});
    if (token !== thinkToken) return;
    m = r && fromUci(cur(), r.best);
  }
  if (token !== thinkToken) return;
  if (!m){
    // weaker bots sometimes play like a beginner who doesn't check what the opponent can take
    const L = bot.local || D.BOTS[7].local;
    m = L.blunder && Math.random() < L.blunder ? C.bestMove(cur(), {depth:1, qd:0, noise:200}) : C.bestMove(cur(), L);
  }
  const rest = (G.mode === 'cvc' ? 450 : 320) - (now() - t0);
  if (rest > 0) await sleep(rest);
  if (token !== thinkToken) return;
  ui.thinking = false;
  if (m) doMove(m, false); else renderGame();
}

function capturedHTML(color){
  const taken = [];
  for (const h of G.hist) if (h.m.cap && h.m.piece[0] === color) taken.push(h.m.cap[1]);
  taken.sort((a, b) => C.VAL[b] - C.VAL[a]);
  return taken.map((t, k) => `<span class="cap pc-${opp(color)}${t}${k && taken[k - 1] !== t ? ' gap' : ''}"></span>`).join('');
}
function materialDiff(color){
  let d = 0;
  for (const p of cur().board) if (p) d += (p[0] === color ? 1 : -1) * C.VAL[p[1]];
  return Math.round(d / 100);
}
const isRated = () => G && G.rated && !G.assisted && !G.tookBack;

function renderGame(){
  if (!G) return;
  const s = cur(), st = gameStatus();
  G.over = st.over;
  const bottom = ui.flipped ? 'b' : 'w', top = opp(bottom);
  for (const [el, c] of [[$('topBar'), top], [$('botBar'), bottom]]){
    const diff = materialDiff(c);
    el.innerHTML = barHTML(playerOf(G, c), c, {
      caps: capturedHTML(c), adv: diff > 0 ? `<span class="adv">+${diff}</span>` : '',
      think: ui.thinking && !st.over && s.turn === c && G.bots[c] != null, clock: !!G.tcObj,
      mood: st.over ? (st.winner === c ? 'happy' : st.winner ? 'sad' : '') : '',
      // the bot talks in a speech bubble next to its own name
      chat: G.mode === 'cpu' && G.bots[c] != null ? (G.chat || D.BOTS[G.bots[c]].greet) : '',
      chatNew: G.mode === 'cpu' && G.bots[c] != null && G.chat !== ui.lastChat
    });
  }
  ui.lastChat = G.chat;
  paintClocks();
  const head = $('gameHead');
  head.hidden = G.mode === 'cpu';
  const cupTag = G.cup ? `<span class="tag gold">${esc(D.CUPS.find(c => c.id === G.cup.id).name)} · ${['Quarterfinal', 'Semifinal', 'Final'][G.cup.round]}</span>` : '';
  if (G.mode === 'cpu'){
    const b = D.BOTS[G.bots[opp(G.human)]];
    head.innerHTML = `<div class="av">${avatarSVG(b)}</div><div class="grow"><div style="font-weight:800">${b.name} <span class="muted" style="font-weight:600">${b.elo}</span> ${cupTag}</div><div class="bubble" style="margin-top:4px">${esc(G.chat || b.greet)}</div></div>`;
  } else if (G.mode === 'cvc'){
    head.innerHTML = `<div class="av">${avatarSVG(D.BOTS[G.bots.w])}</div><div class="grow" style="font-weight:800">${D.BOTS[G.bots.w].name} vs ${D.BOTS[G.bots.b].name}<div class="muted" style="font-weight:600;font-size:13px">Bot vs bot · ${tcLabel(G.tc)}</div></div><div class="av">${avatarSVG(D.BOTS[G.bots.b])}</div>`;
  } else {
    head.innerHTML = `<div class="av">${avatarSVG(D.PEOPLE.white)}</div><div class="grow" style="font-weight:800">Friend game<div class="muted" style="font-weight:600;font-size:13px">Same screen · ${tcLabel(G.tc)}</div></div><div class="av">${avatarSVG(D.PEOPLE.black)}</div>`;
  }
  let title, sub = '';
  if (st.over){ title = st.title; sub = st.reason[0].toUpperCase() + st.reason.slice(1) + ' · ' + st.result; }
  else if (ui.paused){ title = 'Paused'; sub = `Move ${s.full} · ${NAME[s.turn]} to play`; }
  else if (G.mode === 'cpu'){
    title = s.turn === G.human ? (st.check ? 'You are in check' : 'Your move') : `${D.BOTS[G.bots[s.turn]].name} is thinking`;
    sub = `${G.cup ? `${D.CUPS.find(c => c.id === G.cup.id).name} ${['quarterfinal', 'semifinal', 'final'][G.cup.round]} · ` : ''}Move ${s.full} · ${G.rated ? (isRated() ? 'Rated' : 'Unrated (hint or takeback used)') : 'Casual'} · ${tcLabel(G.tc)}`;
  } else if (G.mode === 'online'){
    title = s.turn === G.human ? (st.check ? 'You are in check' : 'Your move') : `${playerOf(G, opp(G.human)).name} to move`;
    sub = `Online · Move ${s.full} · ${tcLabel(G.tc)}`;
  } else if (G.mode === 'cvc'){ title = `${D.BOTS[G.bots[s.turn]].name} to move`; sub = `Move ${s.full} · ${NAME[s.turn]} to play`; }
  else { title = st.check ? `${NAME[s.turn]} is in check` : `${NAME[s.turn]} to move`; sub = `Move ${s.full}`; }
  if (G.tcObj && !G.hist.length && !st.over) sub += ' · Clocks start after the first move';
  $('status').textContent = title;
  $('statusSub').textContent = sub;
  const op = GW.openingName(G.hist.map(h => uci(h.m)));
  $('gameOpening').textContent = op ? `${op.eco} · ${op.name}` : '';

  const list = $('moves');
  if (!G.hist.length) list.innerHTML = '<li class="empty">No moves yet. White starts.</li>';
  else {
    let out = '';
    for (let k = 0; k < G.hist.length; k += 2){
      const at = (ui.view == null ? G.hist.length : ui.view) - 1;
      const cell = j => j < G.hist.length ? `<button type="button" class="mv${j === at ? ' cur' : ''}" data-ply="${j + 1}">${G.hist[j].san}</button>` : '<span></span>';
      out += `<li><span class="n">${k / 2 + 1}.</span>${cell(k)}${cell(k + 1)}</li>`;
    }
    if (st.over) out += `<li class="res">${st.result}</li>`;
    list.innerHTML = out;
    if (ui.view == null) list.scrollTop = list.scrollHeight;
    else list.querySelector('.mv.cur')?.scrollIntoView({block:'nearest'});
  }
  const human = G.mode !== 'cvc';
  $('hintBtn').hidden = !human || st.over || !!G.cup || G.mode === 'online';
  $('undoBtn').hidden = !human || st.over || !!G.cup || G.mode === 'online';
  $('pauseBtn').hidden = G.mode !== 'cvc';
  $('drawBtn').hidden = G.mode === 'cvc' || st.over;
  $('drawBtn').disabled = !humanCanMove() || G.hist.length < 2;
  $('newBtn').hidden = $('newBtn').hidden || (G.mode === 'online' && !st.over);
  $('liveBtn').hidden = ui.view == null;
  persistGame();
  $('undoBtn').disabled = !G.hist.length || (G.mode === 'cpu' && !G.hist.some((h, k) => G.states[k].turn === G.human));
  $('hintBtn').disabled = !humanCanMove();
  $('pauseBtn').disabled = st.over;
  $('pauseBtn').querySelector('span').textContent = ui.paused ? 'Resume' : 'Pause';
  $('resignBtn').hidden = G.mode === 'cvc' || st.over;
  $('newBtn').hidden = !(G.mode === 'cvc' || st.over);
  $('reviewNowBtn').hidden = !st.over || G.hist.length < 2;

  if (st.over && !G.endShown){
    G.endShown = true;
    thinkToken++;
    ui.thinking = false;
    finishGame(st);
    if (!/checkmate/.test(st.reason)) sfx.end();
    setTimeout(() => showResult(st), 700);
    renderGame();
  }
}
const tcLabelFn = tcLabel;

/* ---------- Online: messages from the opponent ---------- */
GW.onlineData = d => {
  if (!G || G.mode !== 'online') return;
  if (d.t === 'move'){
    if (G.over || d.ply !== G.hist.length + 1 || cur().turn === G.human) return;
    const m = fromUci(cur(), d.u);
    if (!m) return;                       // never trust an illegal move
    G.drawSent = 0;
    doMove(m, false);
    if (G.tcObj && typeof d.w === 'number' && typeof d.b === 'number'){
      // their clock as they saw it; ours keeps running from now
      G.times[G.times.length - 1] = {w: d.w, b: d.b};
      turnStart = now();
      paintClocks();
    }
  } else if (d.t === 'resign' && !G.over){ G.resigned = opp(G.human); renderGame(); }
  else if (d.t === 'flag' && !G.over){ flagFall(opp(G.human)); }
  else if (d.t === 'draw-offer' && !G.over){
    const who = playerOf(G, opp(G.human)).name;
    G.chat = `${who} offers a draw`;
    const m = GW.modal(`<h2>${esc(who)} offers a draw</h2><div class="row"><button class="btn grow" id="dwNo" type="button">Decline</button><button class="btn pop grow" id="dwYes" type="button">Accept draw</button></div>`);
    m.querySelector('#dwNo').addEventListener('click', () => { GW.closeModal(); GW.Online.send({t:'draw-decline'}); });
    m.querySelector('#dwYes').addEventListener('click', () => { GW.closeModal(); if (G.over) return; GW.Online.send({t:'draw-accept'}); G.drawAgreed = true; renderGame(); });
  }
  else if (d.t === 'draw-accept' && !G.over){ G.drawAgreed = true; renderGame(); }
  else if (d.t === 'draw-decline'){ GW.toast('Your draw offer was declined.'); }
  else if (d.t === 'rematch'){
    if (d.n !== gameNo() || !G.over) return;
    if (G.rematchAsked){ GW.Online.send({t:'rematch-ok', n:gameNo()}); return startRematch(); }
    const who = playerOf(G, opp(G.human)).name;
    const m = GW.modal(`<h2>Rematch?</h2><div class="sub">${esc(who)} wants to play again with colours swapped.</div><div class="row"><button class="btn grow" id="rmNo" type="button">No thanks</button><button class="btn pop grow" id="rmYes" type="button">Play again</button></div>`);
    m.querySelector('#rmNo').addEventListener('click', () => { GW.closeModal(); GW.Online.send({t:'rematch-no'}); });
    m.querySelector('#rmYes').addEventListener('click', () => { GW.Online.send({t:'rematch-ok', n:gameNo()}); startRematch(); });
  }
  else if (d.t === 'rematch-ok'){ if (d.n === gameNo()) startRematch(); }
  else if (d.t === 'rematch-no'){ GW.toast('Your opponent doesn’t want a rematch.'); }
  else if (d.t === 'bye'){ G.oppGone = true; if (!G.over){ G.oppLeft = true; renderGame(); } else GW.toast('Your opponent has left.'); }
};
// Games in one online session are numbered, so a late rematch message never starts a second game
const gameNo = () => (G && G.online && G.online.n) || 1;
function startRematch(){
  if (!G || G.mode !== 'online' || G.rematchStarted) return;
  G.rematchStarted = true;
  GW.closeModal();
  startGame({mode:'online', human:opp(G.human), bots:{w:null, b:null}, tc:G.tc, rated:false, online:{opp:G.online.opp, n:gameNo() + 1}});
}
GW.onlineClosed = () => {
  if (!G || G.mode !== 'online') return;
  if (!G.over){ G.oppLeft = true; GW.toast('Your opponent disconnected.'); renderGame(); }
};

/* ---------- Saving: the game in progress survives a reload, finished games go to My games ---------- */
function persistGame(){
  try {
    const snap = GW.snapshotGame && GW.snapshotGame();
    if (snap && G.hist.length) localStorage.setItem('gw-live', JSON.stringify(snap));
    else localStorage.removeItem('gw-live');
  } catch (_) {}
}
const archive = () => { try { return JSON.parse(localStorage.getItem('gw-archive') || '[]'); } catch (_) { return []; } };
function archiveGame(st){
  if (G.hist.length < 2) return;
  const list = archive();
  const op = GW.openingName(G.hist.map(h => uci(h.m)));
  list.unshift({t:Date.now(), mode:G.mode, human:G.human, bots:G.bots, tc:G.tc, rated:G.rated, moves:G.hist.map(h => uci(h.m)),
    result:st.result, reason:st.reason, winner:st.winner || null, delta:G.outcome && G.outcome.delta, opening: op ? op.name : '',
    online: G.online ? {opp: G.online.opp} : undefined});
  try { localStorage.setItem('gw-archive', JSON.stringify(list.slice(0, 80))); } catch (_) {}
}
GW.archive = archive;
// Rebuild a saved game so it can be reviewed again
GW.reviewArchived = g => {
  let s = C.initState();
  const states = [s], hist = [];
  for (const u of g.moves){ const m = fromUci(s, u); if (!m) break; hist.push({m, san:san(s, m)}); s = apply(s, m); states.push(s); }
  startReview({mode:g.mode, human:g.human, bots:g.bots, states, hist});
};
GW.archivedPGN = g => {
  let s = C.initState(); const ms = [];
  for (const u of g.moves){ const m = fromUci(s, u); if (!m) break; ms.push(m); s = apply(s, m); }
  const p = c => playerOf(g, c).name;
  return C.toPGN(ms, {Event:'Elite Chess', Date:new Date(g.t).toISOString().slice(0, 10).replace(/-/g, '.'), White:p('w'), Black:p('b'), Result:g.result.replace('–', '-').replace('½', '1/2').replace('½', '1/2')});
};
GW.playerOf = playerOf;

// Rating, stats, achievements and cup progress once a game ends
function finishGame(st){
  G.outcome = {delta:null};
  try { localStorage.removeItem('gw-live'); } catch (_) {}
  if (G.mode === 'online'){
    GW.markDay();
    const score = st.winner === G.human ? 1 : st.winner ? 0 : 0.5;
    GW.track('online'); GW.track('game'); profile.xp = (profile.xp || 0) + 10;
    profile.online = profile.online || {w:0, d:0, l:0};
    profile.online[score === 1 ? 'w' : score === 0 ? 'l' : 'd']++;
    GW.saveProfile();
  }
  if (G.mode !== 'cpu'){ archiveGame(st); return; }
  const b = D.BOTS[G.bots[opp(G.human)]];
  const score = st.winner === G.human ? 1 : st.winner ? 0 : 0.5;
  G.chat = score === 1 ? b.lose : score === 0 ? b.win : 'A draw. Well fought!';
  if (G.hist.length >= 2) GW.recordResult(score, b.elo);
  if (isRated() && G.hist.length >= 2){ G.outcome.before = profile.rating; G.outcome.delta = GW.rateGame(b.elo, score); }
  if (G.cup) G.outcome.cup = cupResult(G.cup, score);
  archiveGame(st);
}

function showResult(st){
  if (!G || !G.over) return;
  let title = st.title;
  if (G.mode === 'cpu' || G.mode === 'online') title = st.winner === G.human ? 'You won!' : st.winner ? 'You lost' : 'Draw';
  else if (G.mode === 'cvc' && st.winner) title = `${D.BOTS[G.bots[st.winner]].name} won`;
  const who = c => `<div class="who${st.winner === c ? ' win' : ''}"><div class="av">${avatarSVG(playerOf(G, c), st.winner === c ? 'happy' : st.winner ? 'sad' : '')}</div>${esc(playerOf(G, c).name)}</div>`;
  const o = G.outcome || {};
  const delta = o.delta != null ? `<div class="rating-change ${o.delta >= 0 ? 'up' : 'down'}"><span>${o.before}</span> → <b>${profile.rating}</b> <i>${o.delta >= 0 ? '+' : ''}${o.delta}</i></div>` : '';
  const cupMsg = o.cup ? `<div class="cup-msg">${o.cup.html}</div>` : '';
  const nextBtn = o.cup && o.cup.next ? `<button class="btn violet grow" id="resNext" type="button">${o.cup.next}</button>` : `<button class="btn grow" id="resRematch" type="button">Rematch</button>`;
  const m = GW.modal(`<h2>${title}</h2><div class="sub">${st.reason[0].toUpperCase() + st.reason.slice(1)}</div>
    <div class="vs">${who('w')}<div class="score">${st.result.replace('–', ' – ')}</div>${who('b')}</div>${delta}${cupMsg}
    <div class="stack">${G.hist.length >= 2 ? '<button class="btn pop big" id="resReview" type="button">Game Review</button>' : ''}
      <div class="row">${nextBtn}<button class="btn grow" id="resNew" type="button">New game</button></div>
      <button class="btn ghost" id="resClose" type="button">View board</button></div>`);
  m.querySelector('#resReview')?.addEventListener('click', () => { GW.closeModal(); startReview(G); });
  m.querySelector('#resRematch')?.addEventListener('click', e => {
    if (G.mode !== 'online') return startGame({mode:G.mode, human:G.human, bots:G.bots, tc:G.tc, rated:G.rated});
    if (G.oppLeft || !GW.Online.send({t:'rematch', n:gameNo()})){ GW.toast('Your opponent has left, so a rematch isn’t possible.'); return; }
    G.rematchAsked = true;
    e.target.disabled = true; e.target.textContent = 'Rematch asked…';
  });
  m.querySelector('#resNext')?.addEventListener('click', () => { GW.closeModal(); playCupMatch(G.cup.id); });
  m.querySelector('#resNew').addEventListener('click', () => { GW.closeModal(); if (G.mode === 'online') GW.Online.leave(); GW.show(G.cup ? 'cups' : 'setup'); });
  m.querySelector('#resClose').addEventListener('click', () => GW.closeModal());
  if (o.cup && o.cup.won) setTimeout(() => celebrate(G.cup.id), 400);
}

$('hintBtn').addEventListener('click', hint);
$('undoBtn').addEventListener('click', undo);
$('pauseBtn').addEventListener('click', togglePause);
$('flipBtn').addEventListener('click', () => { if (!G) return; ui.flipped = !ui.flipped; gameBoard.flipped = ui.flipped; gameBoard.render(); renderGame(); });
$('resignBtn').addEventListener('click', () => {
  if (!G || G.over) return;
  const m = GW.modal(`<h2>Resign this game?</h2><div class="row"><button class="btn grow" id="rsNo" type="button">Keep playing</button><button class="btn danger grow" id="rsYes" type="button">Resign</button></div>`);
  m.querySelector('#rsNo').addEventListener('click', () => GW.closeModal());
  m.querySelector('#rsYes').addEventListener('click', () => {
    GW.closeModal();
    if (!G || G.over) return;
    G.resigned = G.mode === 'cpu' || G.mode === 'online' ? G.human : cur().turn;
    if (G.mode === 'online') GW.Online.send({t:'resign'});
    thinkToken++; ui.thinking = false;
    renderGame();
  });
});
$('newBtn').addEventListener('click', () => { if (G && G.mode === 'online') GW.Online.leave(); GW.show(G && G.cup ? 'cups' : 'setup'); });
$('liveBtn').addEventListener('click', () => { if (G) viewPly(G.hist.length); });
$('moves').addEventListener('click', e => { const b = e.target.closest('[data-ply]'); if (b) viewPly(+b.dataset.ply); });
document.addEventListener('keydown', e => {
  if (GW.currentScreen() !== 'game' || !G || e.target.closest('input,textarea') || document.getElementById('modal')) return;
  const at = ui.view == null ? G.hist.length : ui.view;
  const k = {ArrowLeft: at - 1, ArrowRight: at + 1, ArrowUp: 0, ArrowDown: G.hist.length, Home: 0, End: G.hist.length}[e.key];
  if (k === undefined) return;
  e.preventDefault();
  viewPly(k);
});
// Draw offers: a friend accepts on the same screen; a bot accepts when its position is no better than level
$('drawBtn').addEventListener('click', async () => {
  if (!G || G.over || !humanCanMove()) return;
  if (G.mode === 'online'){
    if (G.drawSent && G.drawSent >= G.hist.length - 1){ GW.toast('You already offered a draw. Make a move before offering again.'); return; }
    G.drawSent = G.hist.length;
    GW.Online.send({t:'draw-offer'});
    GW.toast('Draw offered. Waiting for your opponent.');
    return;
  }
  if (G.mode === 'pvp'){
    const m = GW.modal(`<h2>${NAME[cur().turn]} offers a draw</h2><div class="sub">${NAME[opp(cur().turn)]}, do you accept?</div><div class="row"><button class="btn grow" id="dwNo" type="button">Decline</button><button class="btn pop grow" id="dwYes" type="button">Accept draw</button></div>`);
    m.querySelector('#dwNo').addEventListener('click', () => GW.closeModal());
    m.querySelector('#dwYes').addEventListener('click', () => { GW.closeModal(); G.drawAgreed = true; thinkToken++; renderGame(); });
    return;
  }
  const bot = D.BOTS[G.bots[opp(G.human)]], s = cur();
  if (G.hist.length < 20){ G.chat = 'It’s far too early for a draw. Let’s play!'; renderGame(); return; }
  $('drawBtn').disabled = true;
  const r = await GW.engineBest(s);
  if (!G || cur() !== s || G.over) return;
  const mine = povCp(r.lines[0].score);   // from your side: positive means you stand better
  if (mine >= -40){ G.chat = 'A draw sounds fair. Agreed.'; G.drawAgreed = true; thinkToken++; }
  else G.chat = pick(['No thanks, I like my position.', 'I’ll play on.', 'Not yet. Let’s see how this goes.']);
  renderGame();
});
$('reviewNowBtn').addEventListener('click', () => startReview(G));
// Leaving the game screen pauses a game against bots (clocks and thinking stop) until you come back;
// an online game can't wait, so it keeps going and says so
GW.register('game', {
  onShow: () => { if (G){ if (ui.away){ ui.away = false; turnStart = now(); } syncBoard(null); renderGame(); maybeCpu(); } },
  onHide: () => {
    if (!G || G.over) return;
    if (G.mode === 'online'){ GW.toast('<b>Your online game is still running</b><br>Tap Play to go back to it.'); return; }
    if (!ui.away){
      if (clockRunning()) G.times[G.times.length - 1][cur().turn] = clockLeft(cur().turn);
      ui.away = true; ui.thinking = false; thinkToken++;
      persistGame();
    }
  }
});

/* ============================== GAME REVIEW ============================== */
$('scr-review').innerHTML = `
<div class="play">
  <div class="board-col">
    <div class="player" id="rvTop"></div>
    <div class="board-with-bar"><div class="evalbar" id="evalbar"><div class="fill"></div><div class="num top"></div><div class="num bot"></div></div><div id="reviewBoard"></div></div>
    <div class="player" id="rvBot"></div>
  </div>
  <aside class="panel">
    <div class="row"><h2 class="grow">Game Review</h2><button class="btn ghost" id="rvBack" type="button">Close</button></div>
    <div class="opening-name" id="rvOpening"></div>
    <div id="rvProgress" class="stack"><div class="muted" id="rvProgressText">Analysing…</div><div class="progress"><div id="rvProgressBar" style="width:0"></div></div></div>
    <div class="coach" id="rvCoach"></div>
    <div id="rvRetryBox" hidden></div>
    <svg class="graph" id="rvGraph" viewBox="0 0 400 96" preserveAspectRatio="none" role="img" aria-label="Evaluation graph"></svg>
    <div class="acc" id="rvAcc"></div>
    <div id="rvKey"></div>
    <table class="cls" id="rvCls"></table>
    <ol class="moves" id="rvMoves"></ol>
    <div class="navbar">
      <button class="btn" id="rvFirst" type="button" aria-label="First move">${ICON.first}</button>
      <button class="btn" id="rvPrev" type="button" aria-label="Previous move">${ICON.prev}</button>
      <button class="btn pop" id="rvNext" type="button" aria-label="Next move">${ICON.next}</button>
      <button class="btn" id="rvLast" type="button" aria-label="Last move">${ICON.last}</button>
    </div>
    <div class="row"><button class="btn violet grow" id="rvRetry" type="button">Retry my mistakes</button><button class="btn grow" id="rvAnalyse" type="button">Analysis board</button></div>
    <div class="row"><button class="btn grow" id="rvPgn" type="button">Copy PGN</button><button class="btn grow" id="rvNew" type="button">New game</button></div>
  </aside>
</div>`;

let R = null, reviewToken = 0;
const reviewBoard = new Board($('reviewBoard'), {canMove: () => !!(R && R.retry && !R.retry.busy && !R.retry.solved), onMove: (m, d) => retryMove(m, d)});
const winPct = v => 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * v)) - 1);
const winFor = (c, v) => c === 'w' ? winPct(v) : 100 - winPct(v);
function whiteCp(score, turn){
  const sgn = turn === 'w' ? 1 : -1;
  if (score.mate !== undefined){ const m = score.mate; if (m === 0) return -sgn * 10000; return (m > 0 ? sgn : -sgn) * (10000 - Math.abs(m) * 10); }
  return sgn * score.cp;
}
function povCp(score){
  if (score.mate !== undefined){ const m = score.mate; return m === 0 ? -10000 : (m > 0 ? 1 : -1) * (10000 - Math.abs(m) * 10); }
  return score.cp;
}
function fmtEval(v){
  if (Math.abs(v) >= 9000){ const n = Math.round((10000 - Math.abs(v)) / 10); return n === 0 ? (v > 0 ? '1-0' : '0-1') : (v > 0 ? 'M' : '-M') + n; }
  return (v >= 0 ? '+' : '') + (v / 100).toFixed(1);
}
GW.fmtEval = fmtEval; GW.whiteCp = whiteCp; GW.winPct = winPct;

function startReview(game){
  const tok = ++reviewToken;
  const human = game.mode === 'cpu' ? game.human : null;
  R = {token:tok, states:game.states.slice(), hist:game.hist.slice(), N:game.hist.length, ev:[], best:[], cls:[], loss:[], sb:[], sp:[], s2:[], bestPv:[],
       players:{w:playerOf(game, 'w'), b:playerOf(game, 'b')}, human, flipped: human === 'b', ply:0, done:false, engine:null, retry:null};
  reviewBoard.flipped = R.flipped;
  profile.reviews = (profile.reviews || 0) + 1; GW.saveProfile();
  GW.track('review');
  if (profile.reviews >= 5) GW.unlock('review-5');
  GW.show('review');
  renderReview();
  analyse(tok);
}
GW.startReview = startReview;

async function analyse(tok){
  const ok = await Engine.boot();
  if (!R || tok !== R.token) return;
  R.engine = ok;
  const depth = Engine.fast ? 12 : 9;
  const pos = k => 'position startpos' + (k ? ' moves ' + R.hist.slice(0, k).map(h => uci(h.m)).join(' ') : '');
  for (let k = 0; k <= R.N; k++){
    if (!R || tok !== R.token) return;
    const s = R.states[k];
    const played = k < R.N ? uci(R.hist[k].m) : null;
    const book = k < R.N && k < 24 && GW.BOOK_PREFIX.has(R.hist.slice(0, k + 1).map(h => uci(h.m)).join(' '));
    if (!legal(s).length){ R.ev[k] = whiteCp(inCheck(s) ? {mate:0} : {cp:0}, s.turn); R.best[k] = null; }
    else if (ok){
      const r = await Engine.search(pos(k), {skill:20, depth, ms:0, multipv:2});
      if (!R || tok !== R.token) return;
      const l0 = r && r.lines[0], l1 = r && r.lines[1];
      const score = (l0 && l0.score) || {cp:0};
      R.ev[k] = whiteCp(score, s.turn);
      R.best[k] = r ? r.best : null;
      R.bestPv[k] = l0 ? l0.pv : [];
      R.sb[k] = povCp(score);
      R.s2[k] = l1 ? povCp(l1.score) : null;
      if (played && !book){
        if (played === R.best[k]) R.sp[k] = R.sb[k];
        else if (l1 && l1.pv[0] === played) R.sp[k] = R.s2[k];
        else {
          const rp = await Engine.search(pos(k), {skill:20, depth, ms:0, multipv:1, searchmoves:played});
          if (!R || tok !== R.token) return;
          R.sp[k] = rp && rp.lines[0] ? povCp(rp.lines[0].score) : R.sb[k];
        }
      }
    } else { await sleep(0); const q = C.quickAnalyse(s); R.ev[k] = whiteCp(q.score, s.turn); R.best[k] = q.best; }
    if (book){ R.cls[k] = 'book'; R.loss[k] = 0; }
    else if (ok && played) classify(k);
    if (!ok && k > 0 && !R.cls[k - 1]) classify(k - 1);
    renderReview();
  }
  R.done = true;
  renderReview();
}

function classify(k){
  const c = R.states[k].turn, played = uci(R.hist[k].m);
  let before, after;
  if (R.sp[k] !== undefined){ before = winPct(R.sb[k]); after = winPct(R.sp[k]); }
  else { before = winFor(c, R.ev[k]); after = winFor(c, R.ev[k + 1]); }
  const loss = Math.max(0, before - after);
  R.loss[k] = loss;
  let kind;
  if (played === R.best[k]){ kind = 'best'; if (R.s2[k] != null && before - winPct(R.s2[k]) >= 12 && before < 97) kind = 'great'; }
  else if (loss < 2) kind = 'excellent';
  else if (loss < 5) kind = 'good';
  else if (loss < 10) kind = 'inaccuracy';
  else if (loss < 20) kind = 'mistake';
  else kind = 'blunder';
  if (k > 0 && ['mistake', 'blunder'].includes(R.cls[k - 1]) && loss >= 5 && loss < 20) kind = 'miss';
  R.cls[k] = kind;
}
const moveAcc = loss => Math.max(0, Math.min(100, 103.1668 * Math.exp(-0.04354 * loss) - 3.1669));
// Book moves don't count: accuracy and the estimate only describe moves the player had to find
function judged(c){ const xs = []; for (let k = 0; k < R.N; k++) if (R.loss[k] !== undefined && R.cls[k] !== 'book' && R.states[k].turn === c) xs.push(moveAcc(R.loss[k])); return xs; }
function accuracy(c){ const xs = judged(c); return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null; }
const canEstimate = c => judged(c).length >= 6;
// A rough performance estimate from accuracy (clearly labelled as an estimate in the UI)
function perfEstimate(acc){
  const T = [[0, 250], [40, 600], [50, 900], [60, 1200], [70, 1550], [80, 1900], [87, 2200], [92, 2500], [96, 2750], [100, 3000]];
  for (let i = 1; i < T.length; i++) if (acc <= T[i][0]){ const [a0, r0] = T[i - 1], [a1, r1] = T[i]; return Math.round((r0 + (r1 - r0) * (acc - a0) / (a1 - a0)) / 50) * 50; }
  return 3000;
}

/* --- explaining moves in words --- */
function attacksAfter(s, m){
  // enemy pieces the moved piece attacks once it lands
  const after = apply(s, m), me = s.turn;
  const probe = Object.assign({}, after, {turn:me, ep:-1});
  return legal(probe).filter(x => x.from === m.to && x.cap).map(x => ({sq:x.to, p:x.cap[1]}));
}
function motif(s, m){
  if (!m) return '';
  const after = apply(s, m), targets = attacksAfter(s, m);
  const check = inCheck(after), myVal = C.VAL[m.piece[1]] || 0;
  const big = targets.filter(t => t.p !== 'K' && (C.VAL[t.p] > myVal || !legal(after).some(x => x.to === t.sq && false)));
  const valuable = targets.filter(t => t.p !== 'K' && C.VAL[t.p] >= 300);
  if (C.isMate(after)) return 'delivers checkmate';
  if (check && valuable.length) return `forks the king and the ${PIECE_NAME[valuable[0].p]}`;
  if (valuable.length >= 2) return `forks the ${PIECE_NAME[valuable[0].p]} and the ${PIECE_NAME[valuable[1].p]}`;
  if (m.cap && !legal(after).some(x => x.to === m.to)) return `wins the ${PIECE_NAME[m.cap[1]]} for free`;
  if (m.cap && C.VAL[m.cap[1]] > myVal) return `wins material (${PIECE_NAME[m.piece[1]]} takes ${PIECE_NAME[m.cap[1]]})`;
  if (check) return 'gives check and keeps the initiative';
  if (m.promo) return 'promotes the pawn';
  return big.length ? `attacks the ${PIECE_NAME[big[0].p]}` : '';
}
function coachText(){
  if (R.retry) return null;
  if (R.ply === 0){
    if (!R.done) return {title:'Analysing your game', text:'Step through the moves while I look at each one.'};
    const w = accuracy('w'), b = accuracy('b');
    const side = R.human || 'w', acc = accuracy(side);
    if (acc == null) return {title:'Review ready', text:'The game ended while still in opening theory, so there is nothing to judge yet. Play a longer game and review it here.'};
    const perf = canEstimate(side) ? perfEstimate(acc) : null;
    const errs = R.cls.filter((x, i) => R.states[i].turn === side && ['mistake', 'blunder', 'miss'].includes(x)).length;
    return {title:'Review ready', text:`White played with ${w == null ? '–' : w.toFixed(1)}% accuracy and Black with ${b == null ? '–' : b.toFixed(1)}%.` +
      (perf ? ` ${R.human ? 'Your' : 'White’s'} play was roughly at a ${perf} level (estimate).` : '') +
      (errs ? ` There ${errs === 1 ? 'was 1 key mistake' : `were ${errs} key mistakes`} to learn from: try "Retry my mistakes".` : ' Clean game!')};
  }
  const k = R.ply - 1, h = R.hist[k], kind = R.cls[k];
  if (!kind) return {title:h.san, text:'Still analysing this move…'};
  const s = R.states[k], c = s.turn, them = opp(c);
  const bm = fromUci(s, R.best[k]), bestSan = bm ? san(s, bm) : null;
  const label = GW.CLS[kind].label;
  const sbm = R.sb[k];
  const bestWhy = bm ? (sbm != null && sbm >= 9000 ? `leads to mate in ${Math.round((10000 - sbm) / 10)}` : motif(s, bm)) : '';
  let text;
  const phase = k < 20 ? 'opening' : R.states[k].board.filter(p => p && 'QRBN'.includes(p[1])).length <= 6 ? 'endgame' : 'middlegame';
  if (kind === 'book') text = `${h.san} is a well-known opening move.` + (GW.openingName(R.hist.slice(0, k + 1).map(x => uci(x.m))) ? ` This is the ${GW.openingName(R.hist.slice(0, k + 1).map(x => uci(x.m))).name}.` : '');
  else if (kind === 'best') text = `${h.san} is the best move${motif(s, h.m) ? `: it ${motif(s, h.m)}` : ''}.`;
  else if (kind === 'great') text = `${h.san} is a great move: the only way to keep the advantage${motif(s, h.m) ? ` (it ${motif(s, h.m)})` : ''}.`;
  else if (kind === 'excellent') text = `${h.san} is excellent, almost as good as ${bestSan}.`;
  else if (kind === 'good') text = `${h.san} is a good move. ${bestSan} was a little stronger${bestWhy ? `: it ${bestWhy}` : ''}.`;
  else {
    let reason = '';
    const v = R.ev[k + 1], themMate = them === 'w' ? v >= 9000 : v <= -9000;
    const usMate = sbm != null && sbm >= 9000;
    if (usMate && !(c === 'w' ? v >= 9000 : v <= -9000)) reason = 'You had a forced mate. ';
    else if (themMate) reason = `It allows mate in ${Math.round((10000 - Math.abs(v)) / 10)}. `;
    else {
      const after = R.states[k + 1], reply = fromUci(after, R.best[k + 1]);
      if (reply && reply.cap && reply.to === h.m.to) reason = `It hangs your ${PIECE_NAME[h.m.piece[1]]}: ${NAME[them]} can take it on ${sqName(reply.to)}. `;
      else if (reply && reply.cap) reason = `It lets ${NAME[them]} take your ${PIECE_NAME[reply.cap[1]]} on ${sqName(reply.to)}. `;
      else if (reply){ const mt = motif(after, reply); if (mt && /fork/.test(mt)) reason = `It allows ${san(after, reply)}, which ${mt}. `; }
      if (!reason && kind === 'miss') reason = 'You missed a chance to punish the last move. ';
    }
    text = `${h.san} is ${kind === 'inaccuracy' ? 'an' : 'a'} ${label.toLowerCase()}. ${reason}The best move was ${bestSan}${bestWhy ? `, which ${bestWhy}` : ''}.`;
    if (phase === 'opening' && !reason) text += ' In the opening, focus on development, the centre and king safety.';
  }
  return {title:`${h.san} · ${label}`, kind, text, ev: R.ev[R.ply]};
}

function renderReview(){
  if (!R) return;
  const N = R.N, have = R.ev.length;
  $('rvProgress').hidden = R.done;
  $('rvProgressText').textContent = R.engine === false ? `Quick analysis (Stockfish unavailable): move ${Math.max(0, have - 1)} of ${N}` : `Analysing move ${Math.max(0, have - 1)} of ${N}…`;
  $('rvProgressBar').style.width = (have / (N + 1) * 100).toFixed(1) + '%';
  const op = GW.openingName(R.hist.map(h => uci(h.m)));
  $('rvOpening').textContent = op ? `${op.eco} · ${op.name}` : '';
  if (!R.retry){
    const k = R.ply - 1, m = k >= 0 ? R.hist[k].m : null;
    const arrows = [];
    if (k >= 0 && R.cls[k] && !['best', 'great', 'book'].includes(R.cls[k]) && R.best[k]){
      const bm = fromUci(R.states[k], R.best[k]);
      if (bm) arrows.push({from:bm.from, to:bm.to, color:'g'});
    }
    reviewBoard.flipped = R.flipped;
    if (R.shownPly !== R.ply || R.shownCls !== R.cls[k] || R.shownRetry){
      const forward = R.shownPly === R.ply - 1;
      reviewBoard.set(R.states[R.ply], {last:m, slides: forward && m ? slidesFor(m, false) : null, arrows, badge: m && R.cls[k] ? {sq:m.to, kind:R.cls[k]} : null});
      R.shownPly = R.ply; R.shownCls = R.cls[k]; R.shownRetry = false;
    }
  }
  const bottom = R.flipped ? 'b' : 'w', top = opp(bottom);
  $('rvTop').innerHTML = barHTML(R.players[top], top);
  $('rvBot').innerHTML = barHTML(R.players[bottom], bottom);
  const v = R.ev[R.retry ? R.retry.list[R.retry.i] : R.ply];
  const bar = $('evalbar'), fill = bar.querySelector('.fill');
  const wp = v === undefined ? 50 : winPct(Math.max(-1500, Math.min(1500, v)));
  fill.style.height = wp + '%';
  fill.style.top = R.flipped ? '0' : 'auto';
  fill.style.bottom = R.flipped ? 'auto' : '0';
  const txt = v === undefined ? '' : fmtEval(v).replace('+', '');
  bar.querySelector('.num.top').textContent = (R.flipped ? v >= 0 : v < 0) ? txt : '';
  bar.querySelector('.num.bot').textContent = (R.flipped ? v < 0 : v >= 0) ? txt : '';
  bar.querySelector('.num.top').style.color = R.flipped ? '#2b2950' : '#f4f4fb';
  bar.querySelector('.num.bot').style.color = R.flipped ? '#f4f4fb' : '#2b2950';
  const ct = coachText();
  $('rvCoach').hidden = !ct;
  if (ct) $('rvCoach').innerHTML = `<div class="av">${avatarSVG(D.PEOPLE.coach)}</div><div class="grow"><h3>${ct.kind ? GW.clsIcon(ct.kind) : ''}${esc(ct.title)}${ct.ev !== undefined ? `<span class="ev">${fmtEval(ct.ev)}</span>` : ''}</h3><p>${esc(ct.text)}</p></div>`;
  let g = '<rect width="400" height="96" fill="#2b2950"/>';
  if (have > 0){
    const x = i => N ? i / N * 400 : 0, y = i => 96 - winPct(Math.max(-1500, Math.min(1500, R.ev[i]))) * 0.96;
    let d = `M0,96 L0,${y(0).toFixed(1)}`;
    for (let i = 1; i < have; i++) d += ` L${x(i).toFixed(1)},${y(i).toFixed(1)}`;
    d += ` L${x(have - 1).toFixed(1)},96 Z`;
    g += `<path d="${d}" fill="#f4f4fb"/><line x1="0" y1="48" x2="400" y2="48" stroke="#8a8aa8" stroke-opacity=".5" stroke-dasharray="3 3"/>`;
    for (let i = 0; i < R.N; i++){
      const kd = R.cls[i];
      if (['great', 'mistake', 'miss', 'blunder'].includes(kd)) g += `<circle cx="${x(i + 1).toFixed(1)}" cy="${y(i + 1).toFixed(1)}" r="4" fill="${GW.CLS[kd].color}" stroke="#fff" stroke-width="1.2" vector-effect="non-scaling-stroke"/>`;
    }
  }
  if (N) g += `<line x1="${(R.ply / N * 400).toFixed(1)}" y1="0" x2="${(R.ply / N * 400).toFixed(1)}" y2="96" stroke="#ffb627" stroke-width="2" vector-effect="non-scaling-stroke"/>`;
  $('rvGraph').innerHTML = g;
  $('rvAcc').innerHTML = ['w', 'b'].map(c => { const a = accuracy(c); return `<div class="card"><div class="av">${avatarSVG(R.players[c])}</div><div><small>${esc(R.players[c].name)}</small><div class="num">${R.done ? (a != null ? a.toFixed(1) : '–') : '…'}</div><small>${R.done && a != null && canEstimate(c) ? `Accuracy · ~${perfEstimate(a)}` : 'Accuracy'}</small></div></div>`; }).join('');
  // key moments
  const key = R.done ? R.cls.map((x, i) => ({x, i})).filter(o => ['great', 'mistake', 'miss', 'blunder'].includes(o.x)).slice(0, 8) : [];
  $('rvKey').innerHTML = key.length ? `<div class="label" style="margin-bottom:6px">Key moments</div><div class="chips">${key.map(o => `<button class="chip-btn" type="button" data-ply="${o.i + 1}">${GW.clsIcon(o.x)}${Math.floor(o.i / 2) + 1}${o.i % 2 ? '…' : '.'} ${R.hist[o.i].san}</button>`).join('')}</div>` : '';
  const count = (c, kd) => R.cls.filter((x, i) => x === kd && R.states[i].turn === c).length;
  $('rvCls').innerHTML = `<tr><td></td><td class="c label">W</td><td class="c label">B</td></tr>` +
    Object.keys(GW.CLS).map(kd => `<tr><td><span class="lab">${GW.clsIcon(kd)}${GW.CLS[kd].label}</span></td><td class="c" style="color:${GW.CLS[kd].color}">${count('w', kd)}</td><td class="c" style="color:${GW.CLS[kd].color}">${count('b', kd)}</td></tr>`).join('');
  let out = '';
  for (let i = 0; i < R.N; i += 2){
    const cell = j => j < R.N ? `<button type="button" class="mv${j === R.ply - 1 ? ' cur' : ''}" data-ply="${j + 1}">${R.cls[j] ? GW.clsIcon(R.cls[j]) : ''}${R.hist[j].san}</button>` : '<span></span>';
    out += `<li><span class="n">${i / 2 + 1}.</span>${cell(i)}${cell(i + 1)}</li>`;
  }
  const list = $('rvMoves');
  list.innerHTML = out;
  list.querySelector('.mv.cur')?.scrollIntoView({block:'nearest'});
  $('rvFirst').disabled = $('rvPrev').disabled = R.ply === 0 || !!R.retry;
  $('rvNext').disabled = $('rvLast').disabled = R.ply >= N || !!R.retry;
  $('rvRetry').disabled = !R.done;
  $('rvRetry').textContent = R.retry ? 'Stop retrying' : 'Retry my mistakes';
}
function rvGo(p){
  if (!R || R.retry) return;
  const target = Math.max(0, Math.min(R.N, p));
  if (target === R.ply) return;
  const forward = target === R.ply + 1;
  R.ply = target;
  renderReview();
  if (forward){ const m = R.hist[target - 1].m; sfx.forMove(moveKind(m, R.states[target]), true); }
}

/* --- Retry my mistakes: replay each bad position and find a better move --- */
function startRetry(){
  if (!R || !R.done) return;
  if (R.retry){ R.retry = null; R.shownRetry = true; $('rvRetryBox').hidden = true; renderReview(); return; }
  const list = [];
  for (let k = 0; k < R.N; k++) if (['mistake', 'blunder', 'miss'].includes(R.cls[k]) && (!R.human || R.states[k].turn === R.human)) list.push(k);
  if (!list.length){ GW.toast('No mistakes to retry. Nicely played!'); return; }
  R.retry = {list, i:0, busy:false, tries:0, solved:false, score:0};
  showRetry();
}
function showRetry(){
  const rt = R.retry, k = rt.list[rt.i], s = R.states[k];
  rt.tries = 0; rt.solved = false;
  reviewBoard.flipped = s.turn === 'b';
  reviewBoard.set(s, {last: k > 0 ? R.hist[k - 1].m : null});
  $('rvRetryBox').hidden = false;
  $('rvRetryBox').innerHTML = `<div class="feedback info"><div><b>Mistake ${rt.i + 1} of ${rt.list.length}</b> · Move ${Math.floor(k / 2) + 1}, ${NAME[s.turn]} to play.<br>In the game you played <b>${R.hist[k].san}</b>. Find a better move.</div></div>`;
  renderReview();
}
async function retryMove(m, dragged){
  const rt = R.retry, k = rt.list[rt.i], s = R.states[k];
  const after = apply(s, m);
  reviewBoard.set(after, {last:m, slides:slidesFor(m, dragged)});
  sfx.forMove(moveKind(m, after), true);
  rt.busy = true;
  let good = uci(m) === R.best[k], loss = 0;
  if (!good && R.engine){
    const r = await Engine.search('position startpos' + (k ? ' moves ' + R.hist.slice(0, k).map(h => uci(h.m)).join(' ') : ''), {depth: Engine.fast ? 12 : 9, ms:0, searchmoves:uci(m)});
    loss = r && r.lines[0] ? Math.max(0, winPct(R.sb[k]) - winPct(povCp(r.lines[0].score))) : 100;
    good = loss < 4;
  }
  if (!R || R.retry !== rt) return;
  rt.busy = false;
  const box = $('rvRetryBox');
  if (good){
    rt.solved = true; rt.score++;
    sfx.correct();
    reviewBoard.sqHL = {[m.to]:'good'}; reviewBoard.render();
    const last = rt.i === rt.list.length - 1;
    box.innerHTML = `<div class="feedback ok"><span class="ic">✓</span><div><b>${uci(m) === R.best[k] ? 'Best move!' : 'Good: that works too.'}</b> ${uci(m) === R.best[k] ? '' : `The engine’s top choice was ${san(s, fromUci(s, R.best[k]))}.`}</div></div><button class="btn pop" id="rtNext" type="button">${last ? 'Finish' : 'Next mistake'}</button>`;
  } else {
    rt.tries++;
    sfx.wrong();
    reviewBoard.sqHL = {[m.to]:'bad'}; reviewBoard.render();
    const reveal = rt.tries >= 2;
    const bm = fromUci(s, R.best[k]);
    box.innerHTML = `<div class="feedback bad"><span class="ic">✕</span><div>${reveal ? `Not quite. The best move was <b>${san(s, bm)}</b>${motif(s, bm) ? `, which ${motif(s, bm)}` : ''}.` : 'Not quite. Try again.'}</div></div>` +
      (reveal ? `<button class="btn pop" id="rtNext" type="button">${rt.i === rt.list.length - 1 ? 'Finish' : 'Next mistake'}</button>` : '');
    if (reveal){ rt.solved = true; reviewBoard.auto = [{from:bm.from, to:bm.to, color:'g'}]; setTimeout(() => { reviewBoard.set(s, {arrows:[{from:bm.from, to:bm.to, color:'g'}]}); }, 700); }
    else setTimeout(() => { if (R && R.retry === rt && !rt.solved) reviewBoard.set(s, {last: k > 0 ? R.hist[k - 1].m : null}); }, 800);
  }
  box.querySelector('#rtNext')?.addEventListener('click', () => {
    if (rt.i < rt.list.length - 1){ rt.i++; showRetry(); }
    else { GW.toast(`Retry finished: ${rt.score} of ${rt.list.length} found.`); R.retry = null; R.shownRetry = true; box.hidden = true; renderReview(); }
  });
}

$('rvFirst').addEventListener('click', () => rvGo(0));
$('rvPrev').addEventListener('click', () => rvGo(R.ply - 1));
$('rvNext').addEventListener('click', () => rvGo(R.ply + 1));
$('rvLast').addEventListener('click', () => rvGo(R.N));
$('rvMoves').addEventListener('click', e => { const b = e.target.closest('[data-ply]'); if (b) rvGo(+b.dataset.ply); });
$('rvKey').addEventListener('click', e => { const b = e.target.closest('[data-ply]'); if (b) rvGo(+b.dataset.ply); });
$('rvGraph').addEventListener('click', e => { const r = e.currentTarget.getBoundingClientRect(); rvGo(Math.round((e.clientX - r.left) / r.width * R.N)); });
$('rvRetry').addEventListener('click', startRetry);
$('rvBack').addEventListener('click', () => { reviewToken++; R = null; GW.show(G && !G.over ? 'game' : 'home'); });
$('rvNew').addEventListener('click', () => { reviewToken++; R = null; GW.show('setup'); });
$('rvAnalyse').addEventListener('click', () => { if (R) GW.show('analysis', {moves: R.hist.map(h => h.m), ply: R.ply}); });
$('rvPgn').addEventListener('click', () => {
  if (!R) return;
  const pgn = C.toPGN(R.hist.map(h => h.m), {Event:'Elite Chess', White:R.players.w.name, Black:R.players.b.name});
  GW.copyText(pgn, 'PGN copied');
});
document.addEventListener('keydown', e => {
  if (GW.currentScreen() !== 'review' || !R || e.target.closest('input,textarea')) return;
  if (e.key === 'ArrowRight'){ rvGo(R.ply + 1); e.preventDefault(); }
  if (e.key === 'ArrowLeft'){ rvGo(R.ply - 1); e.preventDefault(); }
});
GW.register('review', {onShow: () => renderReview()});

/* ============================== CUPS ============================== */
$('scr-cups').innerHTML = `<div class="page-head"><div><h1>Cups</h1><div class="muted">Knockout tournaments against the bots. Win three matches to lift the trophy.</div></div></div><div id="cupsBody"></div>`;
const ROUNDS = ['Quarterfinal', 'Semifinal', 'Final'];
function cupState(id){ return profile.cups[id]; }
function newCup(cup){
  const st = {status:'active', round:0, field:['you', ...cup.bots], winners:[[], [], []], replays:0};
  simulateRound(st, 0);
  profile.cups[cup.id] = st;
  GW.saveProfile();
  return st;
}
function fieldOf(st, round){
  if (round === 0) return st.field;
  return st.winners[round - 1];
}
// decide the matches that don't involve you, by rating
function simulateRound(st, round){
  const f = fieldOf(st, round), w = [];
  for (let i = 0; i < f.length; i += 2){
    const a = f[i], b = f[i + 1];
    if (a === 'you' || b === 'you'){ w.push(null); continue; }
    const ea = 1 / (1 + Math.pow(10, (D.BOTS[b].elo - D.BOTS[a].elo) / 400));
    w.push(Math.random() < ea ? a : b);
  }
  st.winners[round] = w;
}
function opponentOf(st){
  const f = fieldOf(st, st.round), i = f.indexOf('you');
  return f[i % 2 === 0 ? i + 1 : i - 1];
}
function playCupMatch(id){
  const cup = D.CUPS.find(c => c.id === id);
  let st = cupState(id);
  if (!st || st.status !== 'active') st = newCup(cup);
  const opp_ = opponentOf(st);
  const human = (st.round + st.replays) % 2 === 0 ? 'w' : 'b';
  startGame({mode:'cpu', human, bots:{[opp(human)]: opp_, [human]: null}, tc:cup.tc, rated:true, cup:{id, round:st.round}});
  G.cup = {id, round:st.round};
}
function cupResult(c, score){
  const cup = D.CUPS.find(x => x.id === c.id), st = cupState(c.id);
  if (!st || st.status !== 'active') return null;
  const medalRank = {gold:3, silver:2, bronze:1};
  const award = m => { if (!profile.trophies[c.id] || medalRank[m] > medalRank[profile.trophies[c.id]]) profile.trophies[c.id] = m; };
  if (score === 0.5){ st.replays++; GW.saveProfile(); return {html:'Draw: a tiebreak game decides it. Colours switch.', next:'Play tiebreak'}; }
  if (score === 0){
    st.status = 'out';
    if (st.round === 2) award('silver'); else if (st.round === 1) award('bronze');
    GW.saveProfile();
    return {html:`Knocked out in the ${ROUNDS[st.round].toLowerCase()}.${st.round >= 1 ? ` You earned a ${st.round === 2 ? 'silver' : 'bronze'} medal.` : ''}`, next:null};
  }
  // won the match: record it, advance
  const f = fieldOf(st, st.round), i = f.indexOf('you');
  st.winners[st.round][Math.floor(i / 2)] = 'you';
  st.replays = 0;
  if (st.round === 2){
    st.status = 'won';
    award('gold');
    GW.unlock('cup');
    GW.saveProfile();
    return {html:`<b>You won the ${esc(cup.name)}!</b> The trophy is in your cabinet.`, won:true, next:null};
  }
  st.round++;
  simulateRound(st, st.round);
  GW.saveProfile();
  const nextOpp = D.BOTS[opponentOf(st)];
  return {html:`Through to the ${ROUNDS[st.round].toLowerCase()}! Next: ${esc(nextOpp.name)} (${nextOpp.elo}).`, next:`Play the ${ROUNDS[st.round].toLowerCase()}`};
}
function celebrate(id){
  const cup = D.CUPS.find(c => c.id === id);
  sfx.fanfare();
  const m = GW.modal(`<div class="celebrate"><div class="big-trophy">${trophySVG(cup.color, 'gold')}</div><h2>Champion!</h2><div class="sub">You won the ${esc(cup.name)}.</div><div class="confetti">${Array.from({length:30}, (_, i) => `<i style="left:${(i * 37) % 100}%;animation-delay:${(i % 10) * 0.12}s;background:${['#ffb627', '#6c5ce7', '#22c55e', '#ef476f', '#3b82f6'][i % 5]}"></i>`).join('')}</div><button class="btn pop big" id="celOk" type="button">Awesome</button></div>`);
  m.querySelector('#celOk').addEventListener('click', () => GW.closeModal());
}
function bracketHTML(cup, st){
  const name = x => x === 'you' ? esc(profile.name || 'You') : esc(D.BOTS[x].name);
  const elo = x => x === 'you' ? profile.rating : D.BOTS[x].elo;
  const av = x => avatarSVG(x === 'you' ? GW.me() : D.BOTS[x]);
  let h = '<div class="bracket">';
  for (let r = 0; r < 3; r++){
    const f = fieldOf(st, r) || [];
    h += `<div class="round"><div class="label">${ROUNDS[r]}</div>`;
    for (let i = 0; i < 8 / Math.pow(2, r); i += 2){
      const a = f[i], b = f[i + 1], w = (st.winners[r] || [])[i / 2];
      const slot = x => x == null ? '<div class="slot empty">—</div>' : `<div class="slot${x === 'you' ? ' you' : ''}${w != null && w === x ? ' won' : w != null ? ' lost' : ''}"><span class="av">${av(x)}</span><span class="nm">${name(x)}</span><span class="el">${elo(x)}</span></div>`;
      h += `<div class="match">${slot(a)}${slot(b)}</div>`;
    }
    h += '</div>';
  }
  return h + '</div>';
}
function renderCups(){
  const body = $('cupsBody');
  body.innerHTML = '<div class="cup-grid">' + D.CUPS.map(cup => {
    const st = cupState(cup.id), medal = profile.trophies[cup.id];
    const status = !st ? 'Not entered' : st.status === 'active' ? `In progress · ${ROUNDS[st.round]}` : st.status === 'won' ? 'Champion!' : 'Knocked out';
    const lo = Math.min(...cup.bots.map(b => D.BOTS[b].elo)), hi = Math.max(...cup.bots.map(b => D.BOTS[b].elo));
    return `<div class="cup-card" style="--cup:${cup.color}"><div class="cup-top"><div class="trophy">${trophySVG(cup.color, medal)}</div><div class="grow"><h3>${esc(cup.name)}</h3><div class="muted">${esc(cup.blurb)}</div>
      <div class="cup-meta"><span>Bots ${lo}–${hi}</span><span>${tcLabel(cup.tc)}</span>${profile.rating < cup.min ? `<span class="warn">Recommended ${cup.min}+</span>` : ''}</div></div></div>
      <div class="cup-status">${status}</div>
      ${st ? bracketHTML(cup, st) : ''}
      <div class="row"><button class="btn ${st && st.status === 'active' ? 'pop' : 'violet'} grow" type="button" data-play="${cup.id}">${st && st.status === 'active' ? `Play ${ROUNDS[st.round].toLowerCase()}` : st ? 'Enter again' : 'Enter cup'}</button></div></div>`;
  }).join('') + '</div>';
}
$('cupsBody').addEventListener('click', e => {
  const b = e.target.closest('[data-play]');
  if (!b) return;
  const id = b.dataset.play, st = cupState(id);
  if (st && st.status !== 'active') delete profile.cups[id];
  playCupMatch(id);
});
GW.register('cups', {onShow: renderCups});

/* ---------- Keep a game in progress across live page updates ---------- */
GW.snapshotGame = () => {
  if (!G || G.over || G.mode === 'online') return null;
  const times = G.times.map(t => Object.assign({}, t));
  if (clockRunning()) times[times.length - 1][cur().turn] = clockLeft(cur().turn);
  return {mode:G.mode, human:G.human, bots:G.bots, tc:G.tc, rated:G.rated, cup:G.cup || null, moves:G.hist.map(h => uci(h.m)), times, flipped:ui.flipped};
};
GW.restoreGame = g => {
  startGame({mode:g.mode, human:g.human, bots:g.bots, tc:g.tc, rated:g.rated});
  if (g.cup) G.cup = g.cup;
  for (const u of g.moves){
    const s = cur(), m = fromUci(s, u);
    if (!m) break;
    const text = san(s, m), n = apply(s, m);
    G.states.push(n); G.hist.push({m, san:text}); G.keys.push(posKey(n)); G.times.push(Object.assign({}, G.times[G.times.length - 1]));
  }
  if (Array.isArray(g.times) && g.times.length === G.states.length) G.times = g.times;
  ui.flipped = !!g.flipped;
  thinkToken++;
  syncBoard(null);
  renderGame();
  maybeCpu();
};
})();
