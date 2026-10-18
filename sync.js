/* Elite Chess: linked devices. The Android app and the website (or any two devices) pair once with a code, then
   swap progress directly whenever both are open: the newer profile wins, and games, puzzles, achievements and
   trophies from both are kept. No server stores anything; the PeerJS server only introduces the devices.
   Inside Claude, progress syncs through the Claude account instead (auth.js). */
(() => {
const GW = window.GW, P2P = GW.P2P;
if (!P2P) return;
const {$, esc, store} = GW;
const KEYS = ['gw-profile', 'gw-settings', 'gw-archive', 'gw-fav'];
const MEDAL = {gold:3, silver:2, bronze:1};

/* ---------- This device and the devices linked to it ---------- */
function deviceName(){
  if (window.EliteApp) return 'Android app';
  const ua = navigator.userAgent;
  const os = /Android/.test(ua) ? 'Android' : /iPhone|iPad/.test(ua) ? 'iPhone' : /Windows/.test(ua) ? 'Windows' : /Mac/.test(ua) ? 'Mac' : 'computer';
  return `Website on ${os}`;
}
const me = store.get('gw-dev', {id:'', name:''});
if (!me.id){ me.id = P2P.randStr(12); me.name = deviceName(); store.set('gw-dev', me); }
const links = () => store.get('gw-links', {list:[]}).list;
const saveLinks = list => store.set('gw-links', {list});
const devPeer = id => `${P2P.PREFIX}dev-${id}`;
const mod = () => +(localStorage.getItem('gw-mod') || 0);

/* ---------- Progress as a bundle, merged from two devices ---------- */
function bundle(){
  const d = {};
  for (const k of KEYS){ try { const v = localStorage.getItem(k); if (v) d[k] = JSON.parse(v); } catch (_) {} }
  return {mod: mod(), data: d};
}
const amount = b => { const p = (b.data && b.data['gw-profile']) || {}; return (p.games || 0) + (p.solved || []).length + Math.round((p.xp || 0) / 10); };
const summary = b => { const p = (b.data && b.data['gw-profile']) || {}; return {name: p.name || 'Player', rating: p.rating || 800, games: p.games || 0, puzzles: (p.solved || []).length, mod: b.mod}; };
// The winner's profile and settings, plus everything collected on either device
function merge(win, lose){
  const w = win.data || {}, l = lose.data || {}, out = {};
  const wp = w['gw-profile'], lp = l['gw-profile'];
  if (wp || lp){
    const p = Object.assign({}, lp || {}, wp || {});
    if (wp && lp){
      for (const k of ['solved', 'achievements']) p[k] = [...new Set([...(lp[k] || []), ...(wp[k] || [])])];
      p.lessons = Object.assign({}, lp.lessons || {}, wp.lessons || {});
      p.trophies = Object.assign({}, lp.trophies || {}, wp.trophies || {});
      for (const [c, m] of Object.entries(lp.trophies || {})) if ((MEDAL[m] || 0) > (MEDAL[p.trophies[c]] || 0)) p.trophies[c] = m;
      for (const k of ['best', 'rushBest', 'bestStreak']) p[k] = Math.max(+wp[k] || 0, +lp[k] || 0);
    }
    out['gw-profile'] = p;
  }
  if (w['gw-settings'] || l['gw-settings']) out['gw-settings'] = w['gw-settings'] || l['gw-settings'];
  const games = new Map();
  for (const g of [...(l['gw-archive'] || []), ...(w['gw-archive'] || [])]) if (g && g.moves) games.set(g.t + ':' + g.moves.join(''), g);
  if (games.size) out['gw-archive'] = [...games.values()].sort((a, b) => b.t - a.t).slice(0, 80);
  const fav = [...new Set([...((l['gw-fav'] || {}).ids || []), ...((w['gw-fav'] || {}).ids || [])])];
  if (fav.length) out['gw-fav'] = {ids: fav};
  return {mod: Math.max(win.mod || 0, lose.mod || 0), data: out};
}
// The avatar is drawn into SVG, so only plain colours, words, numbers and flags are accepted from another device
function cleanProfile(p){
  if (!p || typeof p !== 'object') return p;
  const look = {};
  for (const [k, v] of Object.entries(p.look || {})){
    if (!/^[a-z]{1,12}$/i.test(k)) continue;
    if (typeof v === 'boolean' || (typeof v === 'number' && isFinite(v)) || (typeof v === 'string' && /^#?[a-z0-9-]{1,20}$/i.test(v))) look[k] = v;
  }
  return Object.assign({}, p, {look, country: /^[A-Z]{2}$/.test(p.country || '') ? p.country : '', name: String(p.name || '').slice(0, 20)});
}
// Put a merged bundle on this device, updating the running app without a reload
function apply(b){
  if (b.data['gw-profile']) b.data['gw-profile'] = cleanProfile(b.data['gw-profile']);
  const cur = bundle();
  if (JSON.stringify(cur.data) === JSON.stringify(b.data)){ localStorage.setItem('gw-mod', String(b.mod)); return false; }
  for (const k of KEYS){ try { if (b.data[k]) localStorage.setItem(k, JSON.stringify(b.data[k])); } catch (_) {} }
  if (b.data['gw-profile']){ for (const k of Object.keys(GW.profile)) delete GW.profile[k]; Object.assign(GW.profile, b.data['gw-profile']); }
  if (b.data['gw-settings']){ Object.assign(GW.settings, b.data['gw-settings']); GW.applySettings(); }
  try { localStorage.setItem('gw-mod', String(b.mod)); } catch (_) {}
  if (GW.renderRailMe) GW.renderRailMe();
  if (['home', 'profile', 'history'].includes(GW.currentScreen())) GW.show(GW.currentScreen());
  return true;
}
function noteSync(dev){
  const list = links().filter(x => x.id !== dev.id);
  list.unshift({id: dev.id, name: String(dev.name || 'Device').slice(0, 40), last: Date.now()});
  saveLinks(list.slice(0, 8));
  renderPanel();
}
const cleanDev = d => d && /^[a-z0-9]{6,20}$/.test(d.id) ? {id: d.id, name: String(d.name || 'Device').replace(/[\u0000-\u001f<>]/g, '').slice(0, 40)} : null;

/* ---------- The conversation between two devices ----------
   caller → {t:'hello', dev, link}; answerer → {t:'state', dev, b}; the caller merges and sends {t:'apply', b}. */
function answer(conn, {linking = false, onDone} = {}){
  conn.on('data', d => {
    if (d.t === 'hello'){
      const dev = cleanDev(d.dev);
      // only linked devices may sync, unless this connection came in through a link code
      if (!dev || (!linking && !links().some(x => x.id === dev.id))){ conn.send({t:'refused'}); return; }
      conn.dev = dev;
      conn.send({t:'state', dev:{id: me.id, name: me.name}, b: bundle()});
    } else if (d.t === 'apply' && conn.dev && d.b && d.b.data){
      const changed = apply(d.b);
      noteSync(conn.dev);
      if (changed) GW.toast(`<b>Synced</b><br>Progress updated from ${esc(conn.dev.name)}.`);
      conn.send({t:'done'});
      if (onDone) onDone(conn.dev);
      setTimeout(() => conn.close(true), 1500);
    }
  });
}
// choose(theirs, mine) → 'mine' | 'theirs' | null (ask the player when linking for the first time)
async function call(conn, {link = false, choose = null} = {}){
  const got = P2P.expect(conn, ['state', 'refused'], 8000);
  conn.send({t:'hello', dev:{id: me.id, name: me.name}, link});
  const d = await got;
  if (!d || d.t !== 'state' || !d.b) return {ok:false, why: d && d.t === 'refused' ? 'refused' : 'timeout'};
  const dev = cleanDev(d.dev);
  if (!dev) return {ok:false, why:'bad'};
  const mine = bundle(), theirs = d.b;
  let keep;
  if (choose) keep = await choose(summary(theirs), summary(mine), dev);
  else keep = amount(mine) === 0 ? 'theirs' : amount(theirs) === 0 ? 'mine' : (theirs.mod || 0) > mine.mod ? 'theirs' : 'mine';
  if (!keep) return {ok:false, why:'cancelled'};
  const merged = keep === 'mine' ? merge(mine, theirs) : merge(theirs, mine);
  const done = P2P.expect(conn, ['done'], 8000);
  conn.send({t:'apply', b: merged});
  const changed = apply(merged);
  await done;
  noteSync(dev);
  return {ok:true, dev, changed};
}

/* ---------- Always listening while the app is open (when linked) ---------- */
const S = {peer:null, busy:false, again:null, timer:null, status:{}};
async function listen(){
  if (S.peer || !links().length || !P2P.supported()) return;
  const peer = new P2P.Peer(devPeer(me.id));
  try { await peer.open(); } catch (_) { return; }   // e.g. the website open in two tabs: the first one listens
  S.peer = peer;
  peer.on('connection', c => c.on('open', () => answer(c)));
  peer.on('close', () => { if (S.peer === peer){ S.peer = null; setTimeout(listen, 5000); } });
}
// Reach out to every linked device that is open right now
async function syncAll(manual = false){
  if (!P2P.supported() || !links().length) return;
  // a sync asked for while another runs goes next, so a change made meanwhile isn't missed
  if (S.busy){ S.again = S.again === 'timer' || !S.again ? manual || 'auto' : S.again; return; }
  await listen();
  if (!S.peer) return;
  S.busy = true; renderPanel();
  for (const dev of links()){
    // on the regular timer only one of the two devices calls; opening the app or asking always calls
    if (manual === 'timer' && dev.id < me.id) continue;
    S.status[dev.id] = 'checking'; renderPanel();
    const c = await P2P.dial(S.peer, devPeer(dev.id), 9000);
    if (!c){ S.status[dev.id] = 'offline'; renderPanel(); continue; }
    const r = await call(c).catch(() => ({ok:false}));
    c.close(true);
    S.status[dev.id] = r.ok ? 'synced' : 'offline';
    if (r.ok && r.changed) GW.toast(`<b>Synced</b><br>Progress updated from ${esc(dev.name)}.`);
  }
  S.busy = false; renderPanel();
  if (S.again){ const m = S.again; S.again = null; syncAll(m); }
}
GW.syncDevices = () => syncAll(true);
function schedule(){
  if (!links().length || !P2P.supported()) return;
  listen();
  setTimeout(() => syncAll(), 4000);
  clearInterval(S.timer);
  S.timer = setInterval(() => { if (document.visibilityState === 'visible') syncAll('timer'); }, 120000);
}
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && links().length) setTimeout(() => syncAll(), 1500); });

/* ---------- Linking with a code ---------- */
const L = {peer:null, code:''};
function stopHosting(){ if (L.peer){ L.peer.destroy(); L.peer = null; } L.code = ''; }
async function hostLink(){
  stopHosting();
  for (let i = 0; i < 4 && !L.peer; i++){
    const code = P2P.randStr(6, P2P.CODE_CHARS), peer = new P2P.Peer(`${P2P.PREFIX}link-${code}`);
    try { await peer.open(); } catch (e){ if (e.taken) continue; throw e; }
    L.peer = peer; L.code = code;
    peer.on('connection', c => c.on('open', () => answer(c, {linking:true, onDone: dev => {
      stopHosting(); schedule(); renderPanel();
      GW.toast(`<b>Linked</b><br>This device now syncs with ${esc(dev.name)}.`);
    }})));
  }
  if (!L.peer) throw new Error('no code');
}
async function joinLink(code){
  const peer = new P2P.Peer(`${P2P.PREFIX}p-${P2P.randStr(10)}`);
  await peer.open();
  try {
    const c = await P2P.dial(peer, `${P2P.PREFIX}link-${code}`, 10000);
    if (!c) return {ok:false, why:'nocode'};
    const r = await call(c, {link:true, choose: askWhich});
    c.close(true);
    return r;
  } finally { setTimeout(() => peer.destroy(), 2000); }
}
// First link: which progress should both devices keep? (games, puzzles and trophies from both are kept either way)
function askWhich(theirs, mine, dev){
  return new Promise(resolve => {
    const ago = t => t ? new Date(t).toLocaleString() : 'not yet';
    const card = (s, title, v) => `<button class="btn big-row sync-pick" type="button" data-keep="${v}"><span class="grow" style="text-align:left"><b>${esc(title)}</b><br><span class="muted small">${esc(s.name)} · rating ${s.rating} · ${s.games} games · ${s.puzzles} puzzles<br>Last change: ${esc(ago(s.mod))}</span></span></button>`;
    const rec = amount({data:{'gw-profile':{games:theirs.games, solved:Array(theirs.puzzles), xp:0}}}) > amount({data:{'gw-profile':{games:mine.games, solved:Array(mine.puzzles), xp:0}}}) ? 'theirs' : 'mine';
    const m = GW.modal(`<h2>Link with ${esc(dev.name)}</h2><div class="sub">Whose profile and rating should both devices use? Games, solved puzzles, achievements and trophies from both are kept either way.</div>
      <div class="stack">${rec === 'mine' ? card(mine, 'This device (' + me.name + ')', 'mine') + card(theirs, dev.name, 'theirs') : card(theirs, dev.name, 'theirs') + card(mine, 'This device (' + me.name + ')', 'mine')}
      <button class="btn ghost" type="button" id="syCancel">Cancel</button></div>`, {onClose: () => resolve(null)});
    m.querySelectorAll('[data-keep]').forEach(b => b.addEventListener('click', () => { resolve(b.dataset.keep); GW.closeModal(); }));
    m.querySelector('#syCancel').addEventListener('click', () => { GW.closeModal(); resolve(null); });
  });
}

/* ---------- The "Linked devices" window (from Settings) ---------- */
let panel = null;
function renderPanel(){
  if (!panel || !document.body.contains(panel)) { panel = null; return; }
  const list = links();
  const st = id => ({checking:'Checking…', offline:'Not open right now', synced:'Synced just now'})[S.status[id]] || '';
  panel.querySelector('#syList').innerHTML = list.length ? list.map(d => `<div class="sync-dev"><span class="sync-ico">${/Android app/.test(d.name) ? '📱' : '🌐'}</span><div class="grow"><b>${esc(d.name)}</b><div class="muted small">${st(d.id) || (d.last ? 'Last synced ' + new Date(d.last).toLocaleString() : '')}</div></div><button class="btn ghost" type="button" data-unlink="${d.id}">Unlink</button></div>`).join('')
    : '<div class="muted small">No devices linked yet.</div>';
  panel.querySelector('#sySync').hidden = !list.length;
  panel.querySelector('#sySync').disabled = S.busy;
  panel.querySelector('#sySync').textContent = S.busy ? 'Syncing…' : 'Sync now';
  panel.querySelector('#syCode').innerHTML = L.code ? `<div class="label">Enter this code on your other device</div><div class="sync-code">${L.code}</div><div class="muted small">Waiting for your other device… Keep this window open.</div>` : '';
}
function openPanel(){
  if (!P2P.supported()){ GW.toast('Linking devices works in the Android app and on elitechess.online.'); return; }
  panel = GW.modal(`<h2>Linked devices</h2><div class="sub">Link the Android app and elitechess.online (or any two devices) to keep the same progress on both. They sync whenever both are open.</div>
    <div class="muted small">This device: <b>${esc(me.name)}</b></div>
    <div class="stack" id="syList"></div>
    <button class="btn pop" type="button" id="sySync">Sync now</button>
    <div class="stack"><div class="label">Link a new device</div>
      <button class="btn" type="button" id="syHost">Show a code on this device</button>
      <div class="row"><input class="search grow" id="syIn" maxlength="6" placeholder="Or enter a code" autocapitalize="characters" autocomplete="off"><button class="btn violet" type="button" id="syJoin">Link</button></div>
      <div id="syCode"></div><div class="feedback bad" id="syErr" hidden></div></div>
    <div class="row"><span class="grow"></span><button class="btn pop" type="button" id="syDone">Done</button></div>`, {onClose: stopHosting});
  const err = t => { const e = panel.querySelector('#syErr'); e.hidden = !t; e.textContent = t || ''; };
  panel.querySelector('#syDone').addEventListener('click', () => { stopHosting(); GW.closeModal(); });
  panel.querySelector('#sySync').addEventListener('click', () => syncAll(true));
  panel.querySelector('#syHost').addEventListener('click', async e => {
    err(''); e.target.disabled = true;
    try { await hostLink(); } catch (_) { err('Couldn’t reach the link service. Check your internet connection.'); }
    e.target.disabled = false; renderPanel();
  });
  panel.querySelector('#syJoin').addEventListener('click', async e => {
    const code = panel.querySelector('#syIn').value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (code.length !== 6) return err('Codes have 6 letters and numbers.');
    err(''); e.target.disabled = true; e.target.textContent = 'Linking…';
    const keepPanel = panel;
    const r = await joinLink(code).catch(() => ({ok:false, why:'net'}));
    if (!r.ok && r.why === 'cancelled') return;
    if (r.ok){ schedule(); GW.toast(`<b>Linked</b><br>This device now syncs with ${esc(r.dev.name)}.`); if (document.body.contains(keepPanel)) renderPanel(); else openPanel(); return; }
    if (!document.body.contains(keepPanel)) openPanel();
    err(r.why === 'nocode' ? `No device is showing the code ${code}. Check it, and keep the other device’s window open.` : 'Couldn’t link. Check your internet connection and try again.');
  });
  panel.addEventListener('click', e => {
    const b = e.target.closest('[data-unlink]');
    if (!b) return;
    saveLinks(links().filter(x => x.id !== b.dataset.unlink));
    if (!links().length && S.peer){ S.peer.destroy(); S.peer = null; }
    renderPanel();
  });
  renderPanel();
}
GW.openSync = openPanel;
schedule();
})();
