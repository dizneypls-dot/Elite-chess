/* Elite Chess: friends and tournaments (elitechess.online and the Android app).
   Every player has a permanent friend code. While the app is open it listens for friends on that code (through the
   same PeerJS introductions and direct connections as online play), so friends can add each other, see who is
   online, challenge each other and invite each other to tournaments. Nothing is stored on a server.
   Tournaments are run by the creator's app: players join with the tournament code (or from the public list), the
   creator's app pairs every round (round robin or knockout), the paired players connect to each other and play an
   ordinary online game, and both report the result back. The creator's app has to stay open until it ends. */
(() => {
const GW = window.GW, P2P = GW.P2P;
if (!P2P) return;
const {$, esc, store, avatarSVG, D} = GW;
const opp = c => c === 'w' ? 'b' : 'w';
const tcName = id => (D.TIME_CONTROLS.find(t => t.id === id) || {label:id}).label;
const PLAY_TCS = () => D.TIME_CONTROLS.filter(t => t.id !== '0');
const CODE = /^[A-Z0-9]{6}$/;
const sleep = ms => new Promise(r => setTimeout(r, ms));

/* ---------- Me and my friends ---------- */
function myCode(){
  if (!CODE.test(GW.profile.fcode || '')){ GW.profile.fcode = P2P.randStr(6, P2P.CODE_CHARS); GW.saveProfile(); }
  return GW.profile.fcode;
}
const meWho = () => ({name: String(GW.profile.name || 'Player').slice(0, 20), look: GW.profile.look, elo: GW.profile.rating, country: GW.profile.country || '', code: myCode()});
const cleanWho = w => { if (!w || !CODE.test(w.code || '')) return null; return Object.assign(P2P.cleanWho(w), {code: w.code}); };
const friends = () => store.get('gw-friends', {list:[]}).list;
const saveFriends = list => store.set('gw-friends', {list});
const isFriend = code => friends().some(f => f.code === code);
function addFriend(w){
  const list = friends().filter(f => f.code !== w.code);
  list.unshift({code: w.code, name: w.name, look: w.look, elo: w.elo, country: w.country, added: Date.now()});
  saveFriends(list.slice(0, 200));
}
const userPeer = code => `${P2P.PREFIX}u-${code}`;
// In a game that isn't finished: an online game, or a bot game with moves played
const busy = () => { const g = GW.currentGame(); return !!(g && !g.over && (g.mode === 'online' || (g.mode === 'cpu' && g.hist.length))); };

/* ---------- Listening on my friend code while the app is open ---------- */
const ST = {peer:null, opening:null, status:{}, checking:false};
function ensurePeer(){
  if (ST.peer) return Promise.resolve(ST.peer);
  if (ST.opening) return ST.opening;
  if (!P2P.supported()) return Promise.resolve(null);
  ST.opening = (async () => {
    const p = new P2P.Peer(userPeer(myCode()));
    try { await p.open(); }
    catch (_) {
      // the code is already listening (the app open in another tab): call out from a spare id instead
      const spare = new P2P.Peer(`${P2P.PREFIX}p-${P2P.randStr(10)}`);
      try { await spare.open(); } catch (__) { ST.opening = null; return null; }
      spare.spare = true; ST.peer = spare; ST.opening = null; return spare;
    }
    p.on('connection', c => c.on('open', () => serve(c)));
    p.on('close', () => { if (ST.peer === p){ ST.peer = null; setTimeout(ensurePeer, 4000); } });
    ST.peer = p; ST.opening = null;
    return p;
  })();
  return ST.opening;
}
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') ensurePeer(); });

// A yes/no question that answers itself "no" after a while
function ask(title, sub, yes, no, ms = 30000){
  return new Promise(resolve => {
    let done = false;
    const fin = v => { if (done) return; done = true; clearTimeout(t); resolve(v); };
    GW.sfx.success && GW.sfx.success();
    GW.buzz && GW.buzz([60, 80, 60]);
    const m = GW.modal(`<h2>${title}</h2><div class="sub">${sub}</div><div class="row"><button class="btn grow" id="akNo" type="button">${esc(no)}</button><button class="btn pop grow" id="akYes" type="button">${esc(yes)}</button></div>`, {onClose: () => fin(false)});
    const t = setTimeout(() => { if (!done && document.body.contains(m)) GW.closeModal(); fin(false); }, ms);
    m.querySelector('#akYes').addEventListener('click', () => { fin(true); GW.closeModal(); });
    m.querySelector('#akNo').addEventListener('click', () => { fin(false); GW.closeModal(); });
  });
}
const whoLine = w => `${esc(w.name)}${GW.nameFlag(w)}${w.elo ? ` <span class="muted">(${w.elo})</span>` : ''}`;

// Someone reached me on my friend code
function serve(conn){
  conn.on('data', async d => {
    // (not 'ping': the connection itself uses that name for its keep-alive)
    if (d.t === 'presence') return conn.send({t:'here', who: meWho(), busy: busy()});
    const who = cleanWho(d.who);
    if (!who) return;
    if (d.t === 'friend-req'){
      if (isFriend(who.code)){ addFriend(who); return conn.send({t:'friend-ok', who: meWho()}); }
      const ok = await ask('Friend request', `${whoLine(who)} wants to add you as a friend.`, 'Accept', 'Decline');
      conn.send(ok ? {t:'friend-ok', who: meWho()} : {t:'friend-no'});
      if (ok){ addFriend(who); GW.toast(`<b>${esc(who.name)} is now your friend</b>`); render(); }
    } else if (d.t === 'challenge'){
      if (!isFriend(who.code)) return conn.send({t:'no', why:'friend'});
      if (busy()) return conn.send({t:'no', why:'busy'});
      const ok = await ask('Challenge!', `${whoLine(who)} challenges you to a <b>${esc(tcName(d.tc))}</b> game.`, 'Play', 'Not now');
      if (!ok || busy()) return conn.send({t:'no', why:'declined'});
      const theirs = d.color === 'w' || d.color === 'b' ? d.color : (Math.random() < 0.5 ? 'w' : 'b');
      conn.send({t:'challenge-ok', color: theirs, who: meWho()});
      addFriend(who);
      GW.Online.playOn(conn, opp(theirs), d.tc, who, {friend: who.code});
    } else if (d.t === 'tour-invite'){
      if (TP.code === d.code) return conn.send({t:'no'});
      const ok = await ask('Tournament invitation', `${whoLine(who)} invites you to <b>${esc(String(d.name || 'a tournament').slice(0, 40))}</b> · ${esc(tcName(d.tc))}.`, 'Join', 'Not now', 45000);
      conn.send({t: ok ? 'yes' : 'no'});
      if (ok){ GW.show('friends'); joinTour(String(d.code || '')); }
    } else if (d.t === 'tour-game'){
      // my tournament opponent connecting for the game the host paired us in
      const x = TP.expect;
      if (!x || x.gameId !== d.gameId || x.opp.code !== who.code || x.color !== 'b'){ conn.send({t:'no'}); return; }
      conn.send({t:'tour-game-ok', who: meWho()});
      startTourGame(conn, x, who);
    }
  });
}
// Reach a player on their friend code and say something; resolves with the connection and their answer
async function contact(code, msg, answers, ms = 35000){
  const peer = await ensurePeer();
  if (!peer) return {err:'net'};
  const c = await P2P.dial(peer, userPeer(code), 9000);
  if (!c) return {err:'offline'};
  const got = P2P.expect(c, answers, ms);
  c.send(Object.assign({who: meWho()}, msg));
  const d = await got;
  if (!d){ c.close(true); return {err:'noanswer'}; }
  return {c, d};
}

/* ---------- Friends: adding, who is online, challenges ---------- */
async function addByCode(raw){
  const code = String(raw || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (!CODE.test(code)) return 'Friend codes have 6 letters and numbers.';
  if (code === myCode()) return 'That’s your own code. Share it with your friends!';
  const r = await contact(code, {t:'friend-req'}, ['friend-ok', 'friend-no']);
  if (r.err === 'net') return 'Can’t reach the online service. Check your internet connection.';
  if (r.err === 'offline') return 'That player isn’t online right now. Friend requests need you both to have Elite Chess open.';
  if (r.err) return 'They didn’t answer. Try again when they’re looking at the app.';
  r.c.close(true);
  if (r.d.t !== 'friend-ok') return 'They declined the friend request.';
  const w = cleanWho(r.d.who);
  if (w){ addFriend(w); ST.status[w.code] = 'online'; }
  GW.toast(`<b>${esc(w ? w.name : 'Your friend')} is now your friend</b>`);
  return '';
}
async function checkFriends(){
  if (ST.checking || !friends().length) return;
  ST.checking = true;
  for (const f of friends()) if (!ST.status[f.code]) ST.status[f.code] = 'checking';
  render();
  await Promise.all(friends().map(async f => {
    const r = await contact(f.code, {t:'presence'}, ['here'], 5000);
    if (r.c) r.c.close(true);
    const w = r.d && cleanWho(r.d.who);
    ST.status[f.code] = !r.d ? 'offline' : r.d.busy ? 'playing' : 'online';
    if (w && w.code === f.code) addFriendKeepOrder(w);
  }));
  ST.checking = false;
  render();
}
function addFriendKeepOrder(w){ saveFriends(friends().map(f => f.code === w.code ? Object.assign({}, f, {name:w.name, look:w.look, elo:w.elo, country:w.country}) : f)); }
async function challenge(f, tc, color){
  if (busy()) return GW.toast('Finish your current game first.');
  let cancelled = false;
  const m = GW.modal(`<h2>Challenging ${esc(f.name)}</h2><div class="sub">${esc(tcName(tc))} · waiting for them to accept…</div><div class="row"><button class="btn grow" id="chCancel" type="button">Cancel</button></div>`);
  m.querySelector('#chCancel').addEventListener('click', () => { cancelled = true; GW.closeModal(); });
  const r = await contact(f.code, {t:'challenge', tc, color}, ['challenge-ok', 'no'], 40000);
  if (cancelled){ if (r.c) r.c.close(true); return; }
  GW.closeModal();
  if (r.err === 'offline' || r.err === 'net'){ ST.status[f.code] = 'offline'; render(); return GW.toast(`<b>${esc(f.name)} isn’t online right now</b>`); }
  if (!r.d || r.d.t !== 'challenge-ok'){
    if (r.c) r.c.close(true);
    return GW.toast(r.d && r.d.why === 'busy' ? `<b>${esc(f.name)} is in a game</b><br>Try again in a little while.` : `<b>${esc(f.name)} can’t play right now</b>`);
  }
  GW.Online.playOn(r.c, r.d.color === 'b' ? 'b' : 'w', tc, cleanWho(r.d.who) || f, {friend: f.code});
}

/* ---------- Tournaments: the creator's app runs them ---------- */
const tourPeer = code => `${P2P.PREFIX}t-${code}`;
const SLOTS = 12, slotPeer = n => `${P2P.PREFIX}tl-${n}`;   // public tournaments announce themselves here
let H = null;   // the tournament I am running
const TP = {code:'', view:null, conn:null, expect:null, timers:[], lost:false, tries:0};   // the one I am playing in

const pub = p => ({code:p.code, who:p.who, gone:!!p.gone});
function viewOf(){
  return {code:H.code, name:H.name, format:H.format, tc:H.tc, max:H.max, open:H.open, host:H.host, state:H.state, round:H.round,
          players:H.players.map(pub), rounds:H.rounds, table:table(H)};
}
// Points (and Sonneborn-Berger for round robins); knockouts list the winner first
function table(T){
  const pts = {}, sb = {}, played = {};
  for (const p of T.players){ pts[p.code] = 0; sb[p.code] = 0; played[p.code] = 0; }
  const games = T.rounds.flat().filter(g => g.res && g.b);
  for (const g of games){
    const [w, b] = g.res === '1-0' ? [1, 0] : g.res === '0-1' ? [0, 1] : [0.5, 0.5];
    pts[g.w] += w; pts[g.b] += b; played[g.w]++; played[g.b]++;
  }
  for (const g of games){
    const [w, b] = g.res === '1-0' ? [1, 0] : g.res === '0-1' ? [0, 1] : [0.5, 0.5];
    sb[g.w] += w * pts[g.b]; sb[g.b] += b * pts[g.w];
  }
  return T.players.map(p => ({code:p.code, pts:pts[p.code], sb:sb[p.code], played:played[p.code]}))
    .sort((a, b) => b.pts - a.pts || b.sb - a.sb || ((T.players.find(p => p.code === b.code) || {who:{}}).who.elo || 0) - ((T.players.find(p => p.code === a.code) || {who:{}}).who.elo || 0));
}
function broadcast(){
  if (!H) return;
  const v = viewOf();
  for (const p of H.players) if (p.conn) p.conn.send({t:'tstate', v});
  toPlayer(myCode(), {t:'tstate', v});
}
function toPlayer(code, msg){
  if (code === H.host) return setTimeout(() => onTour(msg), 0);
  const p = H.players.find(x => x.code === code);
  if (p && p.conn) p.conn.send(msg);
}
async function createTour({name, format, tc, max, open}){
  stopHosting();
  const peer = await ensurePeer();
  if (!peer) throw new Error('net');
  for (let i = 0; i < 5; i++){
    const code = P2P.randStr(6, P2P.CODE_CHARS), tp = new P2P.Peer(tourPeer(code));
    try { await tp.open(); } catch (e){ if (e.taken) continue; throw e; }
    H = {code, name, format, tc, max, open, host: myCode(), state:'lobby', round:-1, rounds:[], players:[{code: myCode(), who: meWho(), conn:null}], peer: tp, slot:null};
    tp.on('connection', c => c.on('open', () => hostServe(c)));
    if (open) announce();
    TP.code = code; TP.view = viewOf(); TP.conn = null; TP.lost = false;
    render();
    return code;
  }
  throw new Error('code');
}
// A public tournament takes the first free announcement slot, so anyone can find it under "Open tournaments"
async function announce(){
  for (let n = 0; n < SLOTS && H && H.state === 'lobby'; n++){
    const sp = new P2P.Peer(slotPeer(n));
    try { await sp.open(); } catch (_) { continue; }
    if (!H || H.state !== 'lobby'){ sp.destroy(); return; }
    H.slot = sp;
    sp.on('connection', c => c.on('open', () => c.on('data', d => { if (d.t === 'tinfo' && H) c.send({t:'tinfo', info:{code:H.code, name:H.name, format:H.format, tc:H.tc, max:H.max, n:H.players.length, state:H.state, host:H.players[0].who}}); setTimeout(() => c.close(true), 1500); })));
    return;
  }
}
function unannounce(){ if (H && H.slot){ H.slot.destroy(); H.slot = null; } }
function stopHosting(){
  if (!H) return;
  for (const p of H.players) if (p.conn) p.conn.send({t:'tclosed'});
  unannounce();
  const peer = H.peer;
  setTimeout(() => peer.destroy(), 800);
  H = null;
}
function hostServe(c){
  c.on('data', d => {
    if (!H) return;
    const who = cleanWho(d.who);
    if (d.t === 'tinfo') return c.send({t:'tinfo', info:{code:H.code, name:H.name, format:H.format, tc:H.tc, max:H.max, n:H.players.length, state:H.state, host:H.players[0].who}});
    if (!who) return;
    if (d.t === 'join'){
      const known = H.players.find(p => p.code === who.code);
      if (known){ known.conn = c; known.gone = false; known.who = who; }   // back after losing the connection
      else if (H.state !== 'lobby') return c.send({t:'tno', why:'started'});
      else if (H.players.length >= H.max) return c.send({t:'tno', why:'full'});
      else H.players.push({code: who.code, who, conn: c});
      c.code = who.code;
      broadcast();
      if (known && H.state === 'running') resendPairing(who.code);
      if (H.players.length >= H.max) unannounce();
    } else if (d.t === 'leave') playerGone(who.code, true);
    else if (d.t === 'tres') hostResult(who.code, d);
  });
  c.on('close', () => { if (H && c.code) { const p = H.players.find(x => x.code === c.code); if (p && p.conn === c) playerGone(c.code, H.state === 'lobby'); } });
}
function playerGone(code, remove){
  if (!H || code === H.host) return;
  const p = H.players.find(x => x.code === code);
  if (!p) return;
  if (remove && H.state === 'lobby') H.players = H.players.filter(x => x !== p);
  else { p.gone = true; p.conn = null; }
  if (H.state === 'lobby' && H.open && !H.slot && H.players.length < H.max) announce();
  broadcast();
}

/* Pairings */
function roundRobin(codes){
  const list = codes.slice();
  if (list.length % 2) list.push(null);
  const n = list.length, rounds = [];
  for (let r = 0; r < n - 1; r++){
    const games = [];
    for (let i = 0; i < n / 2; i++){
      let a = list[i], b = list[n - 1 - i];
      if (i === 0 ? r % 2 : i % 2) [a, b] = [b, a];      // colours alternate
      if (a && b) games.push({w:a, b});
      else games.push({w: a || b, b: null, res:'bye'});
    }
    rounds.push(games);
    list.splice(1, 0, list.pop());                         // circle method: everyone but the first moves round
  }
  return rounds;
}
const eloOf = code => ((H.players.find(p => p.code === code) || {who:{}}).who.elo || 0);
function knockoutRound(codes){
  // seeds 1 vs last, 2 vs second-last …; the top seeds get byes when the field isn't a power of two
  let size = 1;
  while (size < codes.length) size *= 2;
  const seeded = codes.slice(), games = [];
  for (let i = 0; i < size / 2; i++){
    const a = seeded[i], b = seeded[size - 1 - i];
    if (a && b) games.push({w:a, b});
    else if (a || b) games.push({w: a || b, b: null, res:'bye'});
  }
  return games;
}
let gameSeq = 0;
const tag = g => Object.assign(g, {id: `${H.code}-${++gameSeq}-${P2P.randStr(4)}`});
function startTour(){
  if (!H || H.state !== 'lobby' || H.players.length < 2) return;
  unannounce();
  H.state = 'running';
  const codes = H.players.map(p => p.code);
  if (H.format === 'rr'){ H.rounds = roundRobin(codes).map(r => r.map(tag)); }
  else { H.rounds = [knockoutRound(codes.sort((a, b) => eloOf(b) - eloOf(a))).map(tag)]; }
  startRound(0);
}
function startRound(r){
  H.round = r;
  for (const g of H.rounds[r]) pairGame(g);
  broadcast();
  checkRound();
}
function pairGame(g){
  if (g.res) return;
  const W = H.players.find(p => p.code === g.w), B = H.players.find(p => p.code === g.b);
  // a player who has left loses their games
  if (W.gone || B.gone){ g.res = W.gone && B.gone ? '½-½' : W.gone ? '0-1' : '1-0'; g.forfeit = true; return; }
  g.status = 'paired';
  toPlayer(g.w, {t:'tpair', gameId:g.id, color:'w', opp:B.who, tc:H.tc, round:H.round});
  toPlayer(g.b, {t:'tpair', gameId:g.id, color:'b', opp:W.who, tc:H.tc, round:H.round});
}
function resendPairing(code){
  const g = (H.rounds[H.round] || []).find(x => !x.res && (x.w === code || x.b === code));
  if (g) pairGame(g);
}
function hostResult(from, d){
  const g = H && H.rounds.flat().find(x => x.id === d.gameId);
  if (!g || g.res || (from !== g.w && from !== g.b) || !['1-0', '0-1', '½-½'].includes(d.res)) return;
  g.res = d.res; g.forfeit = !!d.forfeit; g.status = 'done';
  broadcast();
  checkRound();
}
function checkRound(){
  if (!H || H.state !== 'running') return;
  const games = H.rounds[H.round];
  if (games.some(g => !g.res)) return;
  if (H.format === 'ko'){
    // drawn matches get one replay with colours swapped; a second draw goes to the higher-rated player
    const pairs = new Map();
    for (const g of games) if (g.b){ const k = [g.w, g.b].sort().join(':'); (pairs.get(k) || pairs.set(k, []).get(k)).push(g); }
    let replay = false;
    for (const list of pairs.values()){
      const last = list[list.length - 1];
      if (last.res === '½-½' && list.length < 2){ const g = tag({w:last.b, b:last.w, replay:true}); games.push(g); pairGame(g); replay = true; }
    }
    if (replay){ broadcast(); return; }
    const winners = [];
    for (const g of games){
      if (!g.b){ winners.push(g.w); continue; }
      if (g.replay) continue;
      const list = pairs.get([g.w, g.b].sort().join(':')), last = list[list.length - 1];
      winners.push(last.res === '1-0' ? last.w : last.res === '0-1' ? last.b : (eloOf(last.w) >= eloOf(last.b) ? last.w : last.b));
    }
    if (winners.length <= 1){ H.state = 'done'; H.winner = winners[0]; broadcast(); return; }
    H.rounds.push(knockoutRound(winners).map(tag));
  } else if (H.round >= H.rounds.length - 1){ H.state = 'done'; broadcast(); return; }
  broadcast();
  setTimeout(() => { if (H && H.state === 'running') startRound(H.round + 1); }, 8000);
}

/* Playing in a tournament (also the creator's own games) */
async function joinTour(raw){
  const code = String(raw || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (!CODE.test(code)) return 'Tournament codes have 6 letters and numbers.';
  if (H && H.code === code) return '';
  if (TP.code && TP.code !== code) leaveTour();
  const peer = await ensurePeer();
  if (!peer) return 'Can’t reach the online service. Check your internet connection.';
  const c = await P2P.dial(peer, tourPeer(code), 9000);
  if (!c) return `No tournament is open with the code ${code}.`;
  const got = P2P.expect(c, ['tstate', 'tno'], 8000);
  c.send({t:'join', who: meWho()});
  const d = await got;
  if (!d || d.t === 'tno'){ c.close(true); return d && d.why === 'full' ? 'That tournament is full.' : d && d.why === 'started' ? 'That tournament has already started.' : 'Couldn’t join. Try again.'; }
  Object.assign(TP, {code, conn:c, lost:false, tries:0});
  c.on('data', onTour);
  c.on('close', () => hostLost(c));
  c.on('error', () => hostLost(c));
  onTour(d);
  return '';
}
function sendHost(msg){
  const m = Object.assign({who: meWho()}, msg);
  if (H && H.code === TP.code){ hostServeLocal(m); return; }
  if (TP.conn) TP.conn.send(m);
}
function hostServeLocal(m){ if (m.t === 'tres') hostResult(myCode(), m); }
// The connection to the creator dropped: keep trying to get back for two minutes
async function hostLost(c){
  if (TP.conn !== c || !TP.code) return;
  TP.conn = null; TP.lost = true; render();
  const code = TP.code;
  for (let i = 0; i < 12 && TP.code === code && !TP.conn; i++){
    await sleep(10000);
    if (TP.code !== code || TP.conn) return;
    const err = await joinTour(code);
    if (!err) return;
  }
  if (TP.code === code && !TP.conn){ GW.toast('<b>The tournament has stopped</b><br>Its creator closed the app.'); clearTour(); }
}
function onTour(d){
  if (d.t === 'tstate'){
    const was = TP.view;
    TP.view = d.v; TP.lost = false;
    if (d.v.state === 'done' && (!was || was.state !== 'done')) finished(d.v);
    render();
  } else if (d.t === 'tpair') onPairing(d);
  else if (d.t === 'tclosed'){ if (!H || H.code !== TP.code){ GW.toast('<b>The tournament was closed</b> by its creator.'); clearTour(); } }
}
function finished(v){
  const t = v.table, mine = t.findIndex(r => r.code === myCode());
  GW.sfx.success && GW.sfx.success();
  const champ = v.format === 'ko' ? koWinner(v) : t[0] && t[0].code;
  GW.toast(champ === myCode() ? `🏆 <b>You won ${esc(v.name)}!</b>` : `<b>${esc(v.name)} has finished</b><br>${mine >= 0 && v.format === 'rr' ? `You came ${ordinal(mine + 1)}.` : 'See the final results under Friends.'}`);
}
const ordinal = n => n + (['th', 'st', 'nd', 'rd'][(n % 100 > 10 && n % 100 < 14) ? 0 : n % 10] || 'th');
function koWinner(v){
  const last = v.rounds[v.rounds.length - 1] || [];
  const g = last.filter(x => !x.replay && x.b).slice(-1)[0];
  if (!g) return last[0] && last[0].w;
  const list = last.filter(x => [x.w, x.b].sort().join() === [g.w, g.b].sort().join()), fin = list[list.length - 1];
  return fin.res === '1-0' ? fin.w : fin.res === '0-1' ? fin.b : null;
}
// The creator paired me: White calls Black; whoever can't reach (or isn't reached by) the other wins by forfeit
function onPairing(d){
  if (!d.opp) return;
  const x = {gameId:d.gameId, color:d.color, opp:cleanWho(d.opp) || d.opp, tc:d.tc, round:d.round, started:false};
  TP.expect = x;
  TP.timers.forEach(clearTimeout); TP.timers = [];
  render();
  GW.toast(`<b>Round ${d.round + 1}</b><br>You play ${esc(x.opp.name)} with ${d.color === 'w' ? 'White' : 'Black'}. Starting…`);
  if (d.color === 'w'){
    (async () => {
      for (let i = 0; i < 5 && TP.expect === x && !x.started; i++){
        const r = await contact(x.opp.code, {t:'tour-game', gameId:x.gameId}, ['tour-game-ok', 'no'], 8000);
        if (TP.expect !== x || x.started){ if (r.c) r.c.close(true); return; }
        if (r.d && r.d.t === 'tour-game-ok'){ startTourGame(r.c, x, cleanWho(r.d.who) || x.opp); return; }
        if (r.c) r.c.close(true);
        await sleep(5000);
      }
      if (TP.expect === x && !x.started){ x.started = true; sendHost({t:'tres', gameId:x.gameId, res:'1-0', forfeit:true}); GW.toast(`<b>${esc(x.opp.name)} didn’t show up</b><br>You win by forfeit.`); }
    })();
  } else TP.timers.push(setTimeout(() => {
    if (TP.expect === x && !x.started){ x.started = true; sendHost({t:'tres', gameId:x.gameId, res:'0-1', forfeit:true}); GW.toast(`<b>${esc(x.opp.name)} didn’t show up</b><br>You win by forfeit.`); }
  }, 150000));   // longer than White keeps trying, so a slow connection isn't mistaken for a no-show
}
function startTourGame(conn, x, who){
  if (x.started){ conn.close(true); return; }
  x.started = true;
  TP.timers.forEach(clearTimeout); TP.timers = [];
  const g = GW.currentGame();
  if (g && !g.over && g.mode !== 'online' && g.hist.length) GW.toast('Your other game is saved under Continue game.');
  GW.Online.playOn(conn, x.color, x.tc, who, {tour:{code:TP.code, gameId:x.gameId, round:x.round}});
}
// The game finished: both players report it to the creator
GW.onlineGameOver = (g, st) => {
  const t = g.online && g.online.tour;
  if (!t || t.code !== TP.code) return;
  const res = st.winner === 'w' ? '1-0' : st.winner === 'b' ? '0-1' : '½-½';
  sendHost({t:'tres', gameId:t.gameId, res});
  if (TP.expect && TP.expect.gameId === t.gameId) TP.expect = null;
};
function leaveTour(){
  if (H && H.code === TP.code){ stopHosting(); }
  else if (TP.conn){ TP.conn.send({t:'leave', who: meWho()}); const c = TP.conn; setTimeout(() => c.close(true), 600); }
  clearTour();
}
function clearTour(){ TP.timers.forEach(clearTimeout); Object.assign(TP, {code:'', view:null, conn:null, expect:null, timers:[], lost:false}); render(); }
async function inviteFriend(f){
  const v = TP.view;
  if (!v) return;
  const r = await contact(f.code, {t:'tour-invite', code:v.code, name:v.name, tc:v.tc}, ['yes', 'no'], 50000);
  if (r.c) r.c.close(true);
  GW.toast(r.err === 'offline' ? `<b>${esc(f.name)} isn’t online right now</b>` : r.d && r.d.t === 'yes' ? `<b>${esc(f.name)} is joining</b>` : `<b>${esc(f.name)} can’t join right now</b>`);
}
// Find public tournaments that are waiting for players
async function browse(){
  const peer = await ensurePeer();
  if (!peer) return null;
  const found = await Promise.all(Array.from({length:SLOTS}, async (_, n) => {
    const c = await P2P.dial(peer, slotPeer(n), 7000);
    if (!c) return null;
    const got = P2P.expect(c, ['tinfo'], 4000);
    c.send({t:'tinfo'});
    const d = await got;
    c.close(true);
    return d && d.info && d.info.state === 'lobby' && d.info.n < d.info.max ? d.info : null;
  }));
  return found.filter(Boolean);
}

/* ---------- The Friends screen ---------- */
const UI = {open:null, browsing:false, err:'', tourErr:''};
$('scr-friends').innerHTML = '<div id="frBody"></div>';
function statusChip(code){
  const s = ST.status[code];
  return s === 'online' ? '<span class="fr-st on">● Online</span>' : s === 'playing' ? '<span class="fr-st play">● Playing</span>' : s === 'checking' ? '<span class="fr-st">Checking…</span>' : '<span class="fr-st off">Offline</span>';
}
function tourHTML(){
  const v = TP.view;
  if (!v) return '';
  const name = code => { const p = v.players.find(x => x.code === code); return p ? `${esc(p.who.name)}${GW.nameFlag(p.who)}${code === myCode() ? ' <span class="muted">(you)</span>' : ''}` : '–'; };
  const amHost = H && H.code === v.code;
  const fmt = v.format === 'rr' ? 'Round robin' : 'Knockout';
  let body = '';
  if (v.state === 'lobby'){
    body = `<div class="label">Players ${v.players.length} / ${v.max}</div><div class="tr-players">${v.players.map(p => `<div class="tr-p"><div class="av">${avatarSVG(p.who)}</div><span>${name(p.code)}${p.code === v.host ? ' <span class="tag">Creator</span>' : ''}</span><span class="muted small">${p.who.elo || ''}</span></div>`).join('')}</div>` +
      (amHost ? `<div class="muted small">Share the code <b class="mono-code">${v.code}</b>${v.open ? ' or let online players find it under “Open tournaments”' : ''}. Keep the app open until the tournament ends.</div>
        <div class="row wrap">${friends().length ? '<button class="btn" type="button" data-tinv>Invite friends</button>' : ''}<button class="btn" type="button" data-tcopy>Copy code</button><span class="grow"></span><button class="btn pop" type="button" data-tstart ${v.players.length < 2 ? 'disabled' : ''}>Start${v.players.length < 2 ? ' (2+ players)' : ''}</button></div>`
        : '<div class="muted small">Waiting for the creator to start. Your games begin automatically.</div>');
  } else {
    const x = TP.expect;
    const now = v.state === 'done' ? `<div class="tr-banner">${v.format === 'ko' ? `🏆 Winner: ${name(koWinner(v))}` : `🏆 Winner: ${name(v.table[0] && v.table[0].code)}`}</div>`
      : TP.lost ? '<div class="tr-banner warn">Lost the connection to the creator. Trying to reconnect…</div>'
      : x && !x.started ? `<div class="tr-banner">Round ${v.round + 1}: your game against ${esc(x.opp.name)} is starting…</div>`
      : `<div class="tr-banner">Round ${v.round + 1} of ${v.format === 'rr' ? v.rounds.length : 'the knockout'} is being played.</div>`;
    const standings = v.format === 'rr' ? `<table class="tr-table"><tr><th>#</th><th>Player</th><th>Pts</th><th class="hide-s">Tiebreak</th><th>Played</th></tr>${v.table.map((r, i) => `<tr class="${r.code === myCode() ? 'me' : ''}"><td>${i + 1}</td><td>${name(r.code)}</td><td><b>${r.pts}</b></td><td class="hide-s">${r.sb}</td><td>${r.played}</td></tr>`).join('')}</table>` : '';
    const rounds = v.rounds.map((games, r) => r > v.round ? '' : `<div class="tr-round"><div class="label">${v.format === 'ko' ? koLabel(v, r) : `Round ${r + 1}`}</div>${games.map(g => `<div class="tr-g${g.w === myCode() || g.b === myCode() ? ' me' : ''}">${g.b ? `<span>${name(g.w)}</span><b>${g.res ? esc(g.res) + (g.forfeit ? ' <span class="muted small">forfeit</span>' : '') : '<span class="muted">playing</span>'}</b><span>${name(g.b)}</span>` : `<span>${name(g.w)}</span><b class="muted">bye</b><span></span>`}</div>`).join('')}</div>`).reverse().join('');
    body = now + standings + rounds;
  }
  return `<section class="panel tr"><div class="row"><div class="grow"><div class="kicker">Tournament · ${fmt} · ${esc(tcName(v.tc))}</div><h2>${esc(v.name)}</h2><div class="muted small">Code ${v.code}${v.open ? ' · open to online players' : ' · friends only'}</div></div>
    <button class="btn ghost" type="button" data-tleave>${amHost ? (v.state === 'done' ? 'Close' : 'End tournament') : 'Leave'}</button></div>${body}</section>`;
}
function koLabel(v, r){
  const left = r === 0 ? v.players.length : (v.rounds[r] || []).filter(g => !g.replay).reduce((n, g) => n + (g.b ? 2 : 1), 0);
  return left <= 2 ? 'Final' : left <= 4 ? 'Semifinals' : left <= 8 ? 'Quarterfinals' : `Round ${r + 1}`;
}
function render(){
  if (GW.currentScreen() !== 'friends') return;
  const el = $('frBody');
  if (!P2P.supported()){ el.innerHTML = `<div class="page-head"><div><h1>Friends</h1></div></div><div class="panel"><p>Friends and tournaments work in the Android app and on <b>elitechess.online</b>.</p></div>`; return; }
  const list = friends();
  el.innerHTML = `
  <div class="page-head"><div><div class="kicker">Play together</div><h1>Friends & tournaments</h1></div></div>
  ${tourHTML()}
  <div class="fr-grid">
    <section class="panel stack">
      <div class="fr-code"><div><div class="label">Your friend code</div><div class="mono-code big">${myCode()}</div><div class="muted small">Friends add you with this code.</div></div>
        <div class="stack"><button class="btn" type="button" data-copycode>Copy</button>${navigator.share ? '<button class="btn" type="button" data-sharecode>Share</button>' : ''}</div></div>
      <form class="row" id="frAdd"><input class="search grow" id="frCode" maxlength="6" placeholder="Friend’s code" autocapitalize="characters" autocomplete="off"><button class="btn violet" type="submit">Add friend</button></form>
      ${UI.err ? `<div class="feedback bad"><div>${esc(UI.err)}</div></div>` : ''}
      <div class="row"><h2 class="grow">Friends ${list.length ? `<span class="muted">${list.length}</span>` : ''}</h2>${list.length ? `<button class="btn ghost" type="button" data-refresh>${ST.checking ? 'Checking…' : 'Who’s online?'}</button>` : ''}</div>
      ${list.length ? `<div class="fr-list">${list.map(f => `<div class="fr"><div class="av">${avatarSVG(f)}</div><div class="grow"><b>${esc(f.name)}${GW.nameFlag(f)}</b><div class="small">${f.elo ? `<span class="muted">${f.elo} · </span>` : ''}${statusChip(f.code)}</div></div>
          ${ST.status[f.code] === 'online' ? `<button class="btn pop" type="button" data-chal="${f.code}">Challenge</button>` : ''}${TP.view && TP.view.state === 'lobby' && H && ST.status[f.code] === 'online' && !TP.view.players.some(p => p.code === f.code) ? `<button class="btn" type="button" data-inv="${f.code}">Invite</button>` : ''}
          <button class="btn ghost icon-btn" type="button" data-rm="${f.code}" aria-label="Remove ${esc(f.name)}">✕</button></div>`).join('')}</div>`
        : '<div class="muted small">No friends yet. Share your code, or add a friend with theirs. You both need Elite Chess open at the time.</div>'}
    </section>
    <section class="panel stack">
      <h2>Tournaments</h2>
      ${TP.view ? '<div class="muted small">You are in a tournament (above). Leave it to create or join another.</div>' : `
      <button class="btn pop big-row" type="button" data-tcreate><span class="grow" style="text-align:left">🏆 Create a tournament</span><span>›</span></button>
      <form class="row" id="trJoin"><input class="search grow" id="trCode" maxlength="6" placeholder="Tournament code" autocapitalize="characters" autocomplete="off"><button class="btn violet" type="submit">Join</button></form>
      ${UI.tourErr ? `<div class="feedback bad"><div>${esc(UI.tourErr)}</div></div>` : ''}
      <div class="row"><div class="label grow">Open tournaments</div><button class="btn ghost" type="button" data-browse>${UI.browsing ? 'Looking…' : 'Refresh'}</button></div>
      ${UI.open == null ? '<div class="muted small">Tap Refresh to find tournaments that online players have opened.</div>' : UI.open.length ? `<div class="fr-list">${UI.open.map(t => `<div class="fr"><div class="tile-ico" style="--c:#ffb627">🏆</div><div class="grow"><b>${esc(t.name)}</b><div class="muted small">${t.format === 'rr' ? 'Round robin' : 'Knockout'} · ${esc(tcName(t.tc))} · ${t.n}/${t.max} players · by ${esc((t.host || {}).name || 'a player')}</div></div><button class="btn pop" type="button" data-tjoin="${esc(t.code)}">Join</button></div>`).join('')}</div>` : '<div class="muted small">No open tournaments right now. Create one!</div>'}`}
    </section>
  </div>`;
}
function createForm(){
  const tcs = PLAY_TCS();
  const m = GW.modal(`<h2>Create a tournament</h2>
    <input class="search" id="tfName" maxlength="40" placeholder="Name, e.g. Friday Blitz" value="${esc((GW.profile.name || 'My') + '’s tournament')}">
    <div><div class="label">Format</div><div class="tabs" id="tfFmt"><button type="button" data-v="rr" aria-pressed="true">Round robin</button><button type="button" data-v="ko" aria-pressed="false">Knockout</button></div>
      <div class="muted small" id="tfFmtNote">Everyone plays everyone once. Most points wins.</div></div>
    <div><div class="label">Time control</div><div class="tc-grid" id="tfTc">${tcs.map((t, i) => `<button class="tc" type="button" data-v="${t.id}" aria-pressed="${t.id === '300+0' || (!tcs.some(x => x.id === '300+0') && i === 0)}"><small>${t.group}</small>${t.label}</button>`).join('')}</div></div>
    <div><div class="label">Players</div><div class="tabs small" id="tfMax">${[4, 6, 8, 12, 16].map(n => `<button type="button" data-v="${n}" aria-pressed="${n === 8}">Up to ${n}</button>`).join('')}</div></div>
    <div class="switch">Open to online players<button type="button" id="tfOpen" aria-pressed="true" aria-label="Open to online players"></button></div>
    <div class="feedback bad" id="tfErr" hidden></div>
    <div class="row"><button class="btn grow" type="button" id="tfNo">Cancel</button><button class="btn pop grow" type="button" id="tfGo">Create</button></div>`, {wide:true});
  const pick = (id, b) => { m.querySelectorAll(`#${id} [data-v]`).forEach(x => x.setAttribute('aria-pressed', String(x === b))); };
  m.addEventListener('click', e => {
    const b = e.target.closest('[data-v]');
    if (b){ const id = b.parentElement.id; pick(id, b); if (id === 'tfFmt') m.querySelector('#tfFmtNote').textContent = b.dataset.v === 'rr' ? 'Everyone plays everyone once. Most points wins.' : 'Lose and you’re out. A drawn game is replayed with colours swapped.'; }
    if (e.target.id === 'tfOpen') e.target.setAttribute('aria-pressed', String(e.target.getAttribute('aria-pressed') !== 'true'));
  });
  m.querySelector('#tfNo').addEventListener('click', () => GW.closeModal());
  m.querySelector('#tfGo').addEventListener('click', async e => {
    const val = id => (m.querySelector(`#${id} [aria-pressed="true"]`) || {}).dataset.v;
    e.target.disabled = true; e.target.textContent = 'Creating…';
    try {
      await createTour({name: (m.querySelector('#tfName').value.trim() || 'Tournament').slice(0, 40), format: val('tfFmt'), tc: val('tfTc'), max: +val('tfMax'), open: m.querySelector('#tfOpen').getAttribute('aria-pressed') === 'true'});
      GW.closeModal(); render();
    } catch (_) { const er = m.querySelector('#tfErr'); er.hidden = false; er.textContent = 'Couldn’t reach the online service. Check your internet connection.'; e.target.disabled = false; e.target.textContent = 'Create'; }
  });
}
function challengeForm(f){
  const tcs = PLAY_TCS();
  const m = GW.modal(`<h2>Challenge ${esc(f.name)}</h2>
    <div><div class="label">Time control</div><div class="tc-grid" id="cfTc">${tcs.map((t, i) => `<button class="tc" type="button" data-v="${t.id}" aria-pressed="${t.id === '300+0' || (!tcs.some(x => x.id === '300+0') && i === 0)}"><small>${t.group}</small>${t.label}</button>`).join('')}</div></div>
    <div><div class="label">Your colour</div><div class="tabs" id="cfCol"><button type="button" data-v="w" aria-pressed="false">White</button><button type="button" data-v="r" aria-pressed="true">Random</button><button type="button" data-v="b" aria-pressed="false">Black</button></div></div>
    <div class="row"><button class="btn grow" type="button" id="cfNo">Cancel</button><button class="btn pop grow" type="button" id="cfGo">Send challenge</button></div>`, {wide:true});
  m.addEventListener('click', e => { const b = e.target.closest('[data-v]'); if (b) b.parentElement.querySelectorAll('[data-v]').forEach(x => x.setAttribute('aria-pressed', String(x === b))); });
  m.querySelector('#cfNo').addEventListener('click', () => GW.closeModal());
  m.querySelector('#cfGo').addEventListener('click', () => {
    const tc = m.querySelector('#cfTc [aria-pressed="true"]').dataset.v, col = m.querySelector('#cfCol [aria-pressed="true"]').dataset.v;
    challenge(f, tc, col === 'r' ? (Math.random() < 0.5 ? 'w' : 'b') : col);
  });
}
$('scr-friends').addEventListener('click', async e => {
  const b = e.target.closest('button');
  if (!b) return;
  const d = b.dataset;
  if ('copycode' in d) return GW.copyText(myCode(), 'Friend code copied');
  if ('sharecode' in d){ try { await navigator.share({title:'Elite Chess', text:`Add me on Elite Chess! My friend code is ${myCode()}. Play at https://elitechess.online`}); } catch (_) {} return; }
  if ('refresh' in d) return checkFriends();
  if (d.chal){ const f = friends().find(x => x.code === d.chal); if (f) challengeForm(f); return; }
  if (d.inv){ const f = friends().find(x => x.code === d.inv); if (f) inviteFriend(f); return; }
  if (d.rm){
    const f = friends().find(x => x.code === d.rm);
    const m = GW.modal(`<h2>Remove ${esc(f ? f.name : 'friend')}?</h2><div class="row"><button class="btn grow" id="rmNo" type="button">Cancel</button><button class="btn danger grow" id="rmYes" type="button">Remove</button></div>`);
    m.querySelector('#rmNo').addEventListener('click', () => GW.closeModal());
    m.querySelector('#rmYes').addEventListener('click', () => { saveFriends(friends().filter(x => x.code !== d.rm)); GW.closeModal(); render(); });
    return;
  }
  if ('tcreate' in d) return createForm();
  if ('browse' in d){ UI.browsing = true; render(); UI.open = await browse() || []; UI.browsing = false; render(); return; }
  if (d.tjoin){ b.disabled = true; UI.tourErr = await joinTour(d.tjoin); render(); return; }
  if ('tstart' in d) return startTour();
  if ('tcopy' in d) return GW.copyText(TP.view.code, 'Tournament code copied');
  if ('tinv' in d){ await checkFriends(); const on = friends().filter(f => ST.status[f.code] === 'online' && !TP.view.players.some(p => p.code === f.code)); if (!on.length) GW.toast('None of your friends are online right now.'); on.forEach(inviteFriend); return; }
  if ('tleave' in d){
    const v = TP.view, amHost = H && H.code === v.code;
    if (v.state === 'done' || v.state === 'lobby' && !amHost) return leaveTour();
    const m = GW.modal(`<h2>${amHost ? 'End the tournament?' : 'Leave the tournament?'}</h2><div class="sub">${amHost ? 'It stops for everyone.' : 'Your remaining games will be lost by forfeit.'}</div><div class="row"><button class="btn grow" id="lvNo" type="button">Cancel</button><button class="btn danger grow" id="lvYes" type="button">${amHost ? 'End it' : 'Leave'}</button></div>`);
    m.querySelector('#lvNo').addEventListener('click', () => GW.closeModal());
    m.querySelector('#lvYes').addEventListener('click', () => { GW.closeModal(); leaveTour(); });
  }
});
$('scr-friends').addEventListener('submit', async e => {
  e.preventDefault();
  if (e.target.id === 'frAdd'){
    const btn = e.target.querySelector('button'); btn.disabled = true; btn.textContent = 'Asking…';
    UI.err = await addByCode($('frCode').value);
    render();
  } else if (e.target.id === 'trJoin'){
    const btn = e.target.querySelector('button'); btn.disabled = true; btn.textContent = 'Joining…';
    UI.tourErr = await joinTour($('trCode').value);
    render();
  }
});
let presenceTimer = null;
GW.register('friends', {onShow: () => { UI.err = ''; UI.tourErr = ''; render(); ensurePeer().then(() => checkFriends()); clearInterval(presenceTimer); presenceTimer = setInterval(() => { if (document.visibilityState === 'visible') checkFriends(); }, 60000); },
  onHide: () => clearInterval(presenceTimer)});
GW.social = {myCode, friends, addByCode, joinTour, createTour, startTour, state: () => ({H, TP, ST})};
// Listen for friends as soon as the app is open (after a moment, so start-up stays quick)
if (P2P.supported()) setTimeout(ensurePeer, 2500);
})();
