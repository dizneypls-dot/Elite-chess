/* Elite Chess: the front page, sign-in and cloud save.
   - Claude account: inside Claude the page knows who is viewing; progress syncs to the artifact database
     (each player's own private data/users/<id>/save document), so it follows you to any device.
   - Email: profiles kept on this device (several people can share one phone or tablet), password-protected
     with PBKDF2. Nothing is sent anywhere.
   - Google: shown only where a Google client ID is configured (GW_CONFIG.googleClientId) and the page runs
     on its own website; Google’s sign-in script cannot load inside Claude.
   - Guest: play straight away; you can attach the progress to an account later. */
(() => {
const GW = window.GW;
const {$, esc, store} = GW;
const KEYS = ['gw-profile', 'gw-settings', 'gw-setup', 'gw-archive', 'gw-fav'];
const CONFIG = Object.assign({googleClientId:''}, window.GW_CONFIG || {});
const framed = !!(window.claude && typeof window.claude.use === 'function');

/* ---------- Accounts on this device ---------- */
const acctStore = () => store.get('gw-accounts', {list:[]});
const saveAccts = a => store.set('gw-accounts', a);
const current = () => { try { return JSON.parse(localStorage.getItem('gw-account') || 'null'); } catch (_) { return null; } };
const setCurrent = a => { try { a ? localStorage.setItem('gw-account', JSON.stringify(a)) : localStorage.removeItem('gw-account'); } catch (_) {} };
GW.account = current;
const bundle = () => { const d = {}; for (const k of KEYS){ try { const v = localStorage.getItem(k); if (v) d[k] = v; } catch (_) {} } return d; };
const restore = d => { for (const k of KEYS){ try { if (d && d[k]) localStorage.setItem(k, d[k]); else localStorage.removeItem(k); } catch (_) {} } try { localStorage.removeItem('gw-live'); } catch (_) {} };
const stash = id => { try { localStorage.setItem('gw-stash:' + id, JSON.stringify(bundle())); } catch (_) {} };
const unstash = id => { try { return JSON.parse(localStorage.getItem('gw-stash:' + id) || 'null'); } catch (_) { return null; } };
const hasProgress = () => GW.profile.games > 0 || GW.profile.solved.length > 0 || (GW.profile.xp || 0) > 0;

async function hashPass(pass, salt){
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(pass), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({name:'PBKDF2', salt: enc.encode(salt), iterations: 120000, hash:'SHA-256'}, key, 256);
  return [...new Uint8Array(bits)].map(b => b.toString(16).padStart(2, '0')).join('');
}
const newId = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

// Switch the device to an account: the current progress goes into its own stash, the account’s comes out.
// keepCurrent attaches whatever is on the device now to the account (first sign-in after playing as a guest).
function switchTo(acct, {keepCurrent = false} = {}){
  const was = current();
  if (was && was.id !== acct.id) stash(was.id);
  if (!keepCurrent && (!was || was.id !== acct.id)){
    const saved = unstash(acct.id);
    restore(saved);
  }
  setCurrent(acct);
  location.reload();
}
function signOut(){
  const was = current();
  if (was) stash(was.id);
  restore(null);
  setCurrent(null);
  try { localStorage.removeItem('gw-sync-t'); } catch (_) {}
  location.reload();
}
GW.signOut = signOut;

/* ---------- Cloud save for Claude accounts ---------- */
let lastSent = '';
const saveDoc = cloud => cloud.db.doc(`data/users/${cloud.me.id}/save`);
function packForCloud(){
  const d = bundle();
  // keep the archive small enough for one document (newest games first in the archive)
  if (d['gw-archive']){
    try {
      const a = JSON.parse(d['gw-archive']);
      let list = a.list || a.games || a;
      if (Array.isArray(list)){ let n = list.length; while (n > 5 && JSON.stringify(list.slice(0, n)).length > 150000) n = Math.floor(n * 0.75); list = list.slice(0, n); }
      d['gw-archive'] = JSON.stringify(Array.isArray(a) ? list : Object.assign({}, a, a.list ? {list} : {games: list}));
    } catch (_) {}
  }
  return d;
}
async function pushCloud(force){
  const cloud = await GW.cloudReady;
  const acct = current();
  if (!cloud || !cloud.db || !cloud.me || !acct || acct.provider !== 'claude') return;
  const d = packForCloud(), sig = JSON.stringify(d);
  if (!force && sig === lastSent) return;
  try {
    await saveDoc(cloud).set({v:1, t:Date.now(), data:d});
    lastSent = sig;
    try { localStorage.setItem('gw-sync-t', String(Date.now())); } catch (_) {}
    GW.syncedAt = Date.now();
  } catch (_) { GW.syncError = true; }
}
GW.syncNow = () => pushCloud(true);
setInterval(() => pushCloud(false), 25000);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') pushCloud(false); });

// After signing in with Claude: bring down the cloud copy when it is newer than this device’s
async function pullCloud(cloud, {ask}){
  try {
    const snap = await saveDoc(cloud).get();
    if (!snap.exists) return false;
    const doc = snap.data();
    const localT = +(localStorage.getItem('gw-sync-t') || 0);
    if (!doc || !doc.data || doc.t <= localT) return false;
    let p = {};
    try { p = JSON.parse(doc.data['gw-profile'] || '{}'); } catch (_) {}
    const apply = () => { restore(doc.data); try { localStorage.setItem('gw-sync-t', String(doc.t)); } catch (_) {} location.reload(); };
    if (!ask || !hasProgress()){ apply(); return true; }
    const m = GW.modal(`<h2>Progress found in the cloud</h2><div class="sub">Saved ${new Date(doc.t).toLocaleString()}</div>
      <div class="stat-row"><div class="stat"><b>${p.rating || '–'}</b><span>Rating</span></div><div class="stat"><b>${p.games || 0}</b><span>Games</span></div><div class="stat"><b>${(p.solved || []).length}</b><span>Puzzles</span></div></div>
      <div class="muted small">This device also has progress (rating ${GW.profile.rating}, ${GW.profile.games} games). Which one should we keep?</div>
      <div class="row"><button class="btn grow" id="cdKeep" type="button">Keep this device’s</button><button class="btn pop grow" id="cdUse" type="button">Use the cloud copy</button></div>`);
    m.querySelector('#cdUse').addEventListener('click', apply);
    m.querySelector('#cdKeep').addEventListener('click', () => { GW.closeModal(); pushCloud(true); });
    return true;
  } catch (_) { return false; }
}

/* ---------- The front page ---------- */
const FEATURES = [
  ['🤖', '27 characters to play', 'From total beginner to full-strength Stockfish, each with a personality.'],
  ['🧩', `${(GW.BANK.length || 0).toLocaleString()} puzzles`, 'Rated puzzles, themes, Puzzle Rush and a daily puzzle.'],
  ['🎓', 'Lessons that stick', 'Kids Academy to grandmaster technique, with interactive exercises.'],
  ['🌍', 'World chess, live', 'FIDE top 25, the 2026 title match, events and results.'],
  ['🏛️', 'Legends and history', 'Every world champion, 1,400 years of chess and the immortal games.'],
  ['🎨', 'Make it yours', 'Dozens of boards and piece sets, seasonal and holiday themes, real sounds.']
];
let demo = null;
function landing({onDone} = {}){
  document.getElementById('landing')?.remove();
  const el = document.createElement('div');
  el.id = 'landing';
  el.className = 'landing';
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-label', 'Welcome to Elite Chess');
  const accts = acctStore().list;
  el.innerHTML = `
  <div class="ld-wrap">
    <section class="ld-hero">
      <div class="ld-brand"><div class="ld-logo">${document.querySelector('.logo img, .logo svg')?.outerHTML || ''}</div><span>Elite<b>Chess</b></span></div>
      <h1>Chess that feels <em>alive</em>.</h1>
      <p class="ld-sub">Play characters with real personalities, solve puzzles, follow the world’s best players and learn from the legends. Free, no adverts.</p>
      <div class="ld-board"><div class="ld-mini" id="ldMini"></div><div class="ld-cap" id="ldCap">The Opera Game · Morphy, 1858</div></div>
    </section>
    <section class="ld-card">
      <h2>Welcome</h2>
      <p class="muted small" id="ldNote">Sign in to keep your rating, trophies and games.</p>
      <div class="stack" id="ldButtons">
        <div id="ldClaude"></div>
        <button class="btn big-row ld-btn" type="button" id="ldEmail"><span class="ld-ico">✉️</span><span class="grow">Continue with email</span></button>
        ${CONFIG.googleClientId && !framed ? '<div id="ldGoogle" class="ld-google"></div>' : ''}
        <button class="btn ghost" type="button" id="ldGuest">Play as a guest</button>
      </div>
      <form class="stack" id="ldForm" hidden autocomplete="on">
        <div class="tabs small" id="ldMode"><button type="button" data-m="in" aria-pressed="true">Sign in</button><button type="button" data-m="up" aria-pressed="false">Create profile</button></div>
        <input class="search" id="ldName" maxlength="20" placeholder="Your name" autocomplete="nickname" hidden>
        <input class="search" id="ldMail" type="email" placeholder="Email" autocomplete="email" required>
        <input class="search" id="ldPass" type="password" placeholder="Password (6+ characters)" autocomplete="current-password" minlength="6" required>
        <div class="feedback bad" id="ldErr" hidden></div>
        <button class="btn pop big" type="submit" id="ldGo">Sign in</button>
        <button class="btn ghost" type="button" id="ldBack">← Other options</button>
        <p class="muted small">Email profiles are saved on this device only, so several people can share one phone or tablet. To sync across devices, sign in with your Claude account.</p>
      </form>
      ${accts.length ? `<div class="ld-accts"><div class="label">On this device</div><div class="row">${accts.map(a => `<button class="chip-btn" type="button" data-acct="${esc(a.id)}">${esc(a.name || a.email)}</button>`).join('')}</div></div>` : ''}
    </section>
    <section class="ld-features">${FEATURES.map(([i, t, d]) => `<div class="ld-f"><span>${i}</span><b>${esc(t)}</b><p>${esc(d)}</p></div>`).join('')}</section>
    <p class="ld-foot muted small">Pieces, puzzles, openings and the Stockfish engine are open-source; see Profile → About for credits.</p>
  </div>`;
  document.body.appendChild(el);
  document.body.classList.add('landing-open');
  runDemo();

  const finish = () => { el.remove(); document.body.classList.remove('landing-open'); if (demo){ clearInterval(demo); demo = null; } if (onDone) onDone(); };
  const keep = hasProgress();
  // Claude account
  GW.cloudReady.then(cloud => {
    const box = el.querySelector('#ldClaude');
    if (!box || !cloud || !cloud.me) return;
    const me = cloud.me;
    box.innerHTML = `<button class="btn pop big-row ld-btn" type="button" id="ldClaudeBtn"><img class="ld-avatar" src="${esc(me.avatarUrl)}" alt=""><span class="grow">Continue as ${esc(me.name || 'you')}<small>Claude account · syncs across devices</small></span></button>`;
    box.querySelector('#ldClaudeBtn').addEventListener('click', async () => {
      const acct = {id:'claude:' + me.id, provider:'claude', name: me.name || '', created: Date.now()};
      const was = current();
      if (!GW.profile.name && me.name){ GW.profile.name = me.name.split(' ')[0].slice(0, 20); GW.saveProfile(); }
      if (was && was.id !== acct.id){ switchTo(acct); return; }
      setCurrent(acct);
      finish();
      const pulled = await pullCloud(cloud, {ask: true});
      if (!pulled) pushCloud(true);
      GW.toast(`<b>Signed in</b><br>Your progress now syncs to your Claude account.`);
    });
  });
  // Email
  const form = el.querySelector('#ldForm'), buttons = el.querySelector('#ldButtons'), err = el.querySelector('#ldErr');
  let mode = 'in';
  const setMode = m => {
    mode = m;
    el.querySelectorAll('#ldMode button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.m === m)));
    el.querySelector('#ldName').hidden = m !== 'up';
    el.querySelector('#ldGo').textContent = m === 'up' ? 'Create profile' : 'Sign in';
    el.querySelector('#ldPass').autocomplete = m === 'up' ? 'new-password' : 'current-password';
    err.hidden = true;
  };
  el.querySelector('#ldEmail').addEventListener('click', () => { buttons.hidden = true; form.hidden = false; setMode(acctStore().list.length ? 'in' : 'up'); el.querySelector(mode === 'up' ? '#ldName' : '#ldMail').focus(); });
  el.querySelector('#ldBack').addEventListener('click', () => { form.hidden = true; buttons.hidden = false; });
  el.querySelector('#ldMode').addEventListener('click', e => { const b = e.target.closest('[data-m]'); if (b) setMode(b.dataset.m); });
  const fail = msg => { err.hidden = false; err.innerHTML = `<span class="ic">!</span><div>${esc(msg)}</div>`; };
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const email = el.querySelector('#ldMail').value.trim().toLowerCase(), pass = el.querySelector('#ldPass').value, name = el.querySelector('#ldName').value.trim().slice(0, 20);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail('Please enter a valid email address.');
    if (pass.length < 6) return fail('Passwords need at least 6 characters.');
    if (!(window.crypto && crypto.subtle)) return fail('This browser can’t protect passwords here. Try playing as a guest.');
    const A = acctStore();
    let a = A.list.find(x => x.email === email);
    if (mode === 'up'){
      if (a) return fail('There is already a profile for that email on this device. Sign in instead.');
      const salt = newId();
      a = {id:'email:' + newId(), provider:'email', email, name, salt, hash: await hashPass(pass, salt), created: Date.now()};
      A.list.push(a); saveAccts(A);
      if (name){ GW.profile.name = name; GW.saveProfile(); }
      const pub = {id:a.id, provider:'email', email, name};
      // A brand-new profile takes over whatever is on the device if nobody was signed in
      if (!current()){ setCurrent(pub); finish(); GW.toast(`<b>Profile created</b><br>Welcome${name ? ', ' + esc(name) : ''}!`); return; }
      switchTo(pub);
      return;
    }
    if (!a) return fail('No profile with that email on this device. Create one instead.');
    if (await hashPass(pass, a.salt) !== a.hash) return fail('That password doesn’t match.');
    const pub = {id:a.id, provider:'email', email, name:a.name};
    if (!current()){
      // signing in from a fresh start: use the saved progress if there is any, otherwise keep what’s here
      if (unstash(a.id)) return switchTo(pub);
      setCurrent(pub); finish(); return;
    }
    switchTo(pub);
  });
  el.querySelectorAll('[data-acct]').forEach(b => b.addEventListener('click', () => {
    const a = acctStore().list.find(x => x.id === b.dataset.acct);
    if (!a) return;
    buttons.hidden = true; form.hidden = false; setMode('in');
    el.querySelector('#ldMail').value = a.email; el.querySelector('#ldPass').focus();
  }));
  // Google (only where configured and not inside Claude)
  if (CONFIG.googleClientId && !framed) loadGoogle(el.querySelector('#ldGoogle'), cred => {
    const acct = {id:'google:' + cred.sub, provider:'google', email: cred.email || '', name: cred.given_name || cred.name || ''};
    if (!GW.profile.name && acct.name){ GW.profile.name = acct.name.slice(0, 20); GW.saveProfile(); }
    if (!current()){ setCurrent(acct); finish(); return; }
    switchTo(acct);
  });
  // Guest
  el.querySelector('#ldGuest').addEventListener('click', () => { setCurrent({id:'guest', provider:'guest', name:''}); finish(); });
  el.querySelector('#ldNote').textContent = keep ? 'Your progress on this device comes with you when you sign in.' : 'Sign in to keep your rating, trophies and games.';
}
function loadGoogle(host, onCred){
  if (!host) return;
  const s = document.createElement('script');
  s.src = 'https://accounts.google.com/gsi/client';
  s.onload = () => {
    try {
      google.accounts.id.initialize({client_id: CONFIG.googleClientId, callback: r => {
        try { const p = JSON.parse(decodeURIComponent(escape(atob(r.credential.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))))); onCred(p); } catch (_) {}
      }});
      google.accounts.id.renderButton(host, {theme:'outline', size:'large', width: 320, text:'continue_with'});
    } catch (_) { host.remove(); }
  };
  s.onerror = () => host.remove();
  document.head.appendChild(s);
}
// The front page plays through the Opera Game in the current board and piece style
function runDemo(){
  const game = (window.GW_WORLD && window.GW_WORLD.GAMES.find(g => g.id === 'opera'));
  const box = document.getElementById('ldMini');
  if (!game || !box) return;
  const moves = GW.C.parsePGN(game.pgn);
  let ply = 0;
  const draw = () => { let s = GW.C.initState(); for (let i = 0; i < ply; i++) s = GW.C.apply(s, moves[i]); box.innerHTML = GW.miniBoard(GW.C.toFEN(s), false); };
  draw();
  demo = setInterval(() => { ply = ply >= moves.length ? 0 : ply + 1; draw(); }, ply >= moves.length ? 2600 : 1100);
}
GW.landing = landing;
GW.needsLanding = () => !current();

/* ---------- Account card (profile screen) ---------- */
GW.accountCard = () => {
  const a = current();
  if (!a) return '';
  const how = {claude:'Claude account · synced', email:'Email profile on this device', google:'Google account on this device', guest:'Guest on this device'}[a.provider] || '';
  const sync = a.provider === 'claude' ? (GW.syncedAt ? `Last synced ${new Date(GW.syncedAt).toLocaleTimeString()}` : 'Syncs every few seconds while you play') : a.provider === 'guest' ? 'Sign in to keep your progress safe.' : 'Use a backup code (Settings) to move it to another device.';
  return `<div class="panel acct"><div class="row"><div class="grow"><div class="label">Account</div><b>${esc(a.name || a.email || (a.provider === 'guest' ? 'Guest' : 'Player'))}</b><div class="muted small">${esc(how)}${a.email ? ' · ' + esc(a.email) : ''}</div><div class="muted small">${esc(sync)}</div></div>
    ${a.provider === 'claude' ? '<button class="btn" type="button" id="acSync">Sync now</button>' : ''}${a.provider === 'guest' ? '<button class="btn pop" type="button" id="acSignIn">Sign in</button>' : '<button class="btn ghost" type="button" id="acOut">Sign out</button>'}</div></div>`;
};
document.addEventListener('click', e => {
  const t = e.target.closest('#acSync,#acSignIn,#acOut');
  if (!t) return;
  if (t.id === 'acSync') GW.syncNow().then(() => GW.toast('Synced'));
  if (t.id === 'acSignIn'){ setCurrent(null); landing(); }
  if (t.id === 'acOut'){
    const m = GW.modal(`<h2>Sign out?</h2><div class="sub">Your progress stays saved with your account${current()?.provider === 'claude' ? ' in the cloud' : ' on this device'}.</div><div class="row"><button class="btn grow" id="soNo" type="button">Cancel</button><button class="btn pop grow" id="soYes" type="button">Sign out</button></div>`);
    m.querySelector('#soNo').addEventListener('click', () => GW.closeModal());
    m.querySelector('#soYes').addEventListener('click', async () => { await pushCloud(true); signOut(); });
  }
});
// Keep a Claude account's cloud copy fresh when the app opens
GW.cloudReady.then(cloud => { const a = current(); if (cloud && cloud.me && a && a.provider === 'claude') pullCloud(cloud, {ask: true}).then(p => { if (!p) pushCloud(false); }); });
})();
