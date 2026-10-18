/* © 2026 Elite Chess. All rights reserved. Proprietary: no copying, reuse or AI training without written permission. See terms.html. */
/* Elite Chess: the front page, sign-in and cloud save.
   - Claude account: inside Claude the page knows who is viewing; progress syncs to the artifact database
     (each player's own private data/users/<id>/save document), so it follows you to any device.
   - Elite Chess account (elitechess.online and the Android app, when Firebase is set up in config.js): email and
     password, or Google on the website; progress syncs to the player's own Firestore document (firebase.js).
   - Email without Firebase: profiles kept on this device (several people can share one phone or tablet),
     password-protected with PBKDF2. Nothing is sent anywhere. With Firebase they move into an account on sign-in.
   - Google: shown only where a Google client ID is configured (GW_CONFIG.googleClientId) and the page runs
     on its own website; Google’s sign-in script cannot load inside Claude or the Android app.
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
  if (was && was.provider === 'firebase' && GW.FB) GW.FB.signOut();
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
/* ---------- Cloud save for Elite Chess accounts (Firebase) ---------- */
const FB = GW.FB || {enabled:false};
const fbAcct = u => ({id:'fb:' + u.uid, provider:'firebase', uid:u.uid, email:u.email || '', name:u.name || '', via:u.provider});
const fbActive = () => { const a = current(), u = FB.enabled && FB.user(); return !!(u && a && a.provider === 'firebase' && a.uid === u.uid); };
let fbSent = '', fbBusy = null;
// Two-way sync with the account's copy: changes from another device are merged in (the newer profile wins; games,
// puzzles and trophies from both are kept), then this device's progress goes up. first: signing in on this device.
function fbSync(opts = {}){ if (!fbBusy) fbBusy = fbSyncRun(opts).finally(() => { fbBusy = null; }); return fbBusy; }
async function fbSyncRun({first = false, force = false} = {}){
  if (!fbActive() || !GW.progress) return;
  const P = GW.progress, local = P.bundle(), sig = JSON.stringify(local.data);
  if (!first && !force && sig === fbSent) return;
  try {
    const remote = await FB.getSave();
    const lastT = +(localStorage.getItem('gw-sync-t') || 0);
    let result = local;
    if (remote && remote.data && remote.t > lastT){
      const theirs = {mod: remote.t, data: remote.data};
      let keep = P.amount(local) === 0 ? 'theirs' : P.amount(theirs) === 0 ? 'mine' : local.mod > remote.t ? 'mine' : 'theirs';
      if (first && P.amount(local) > 0 && P.amount(theirs) > 0 && JSON.stringify(theirs.data) !== sig) keep = await askKeep(P.summary(theirs), P.summary(local), keep);
      result = keep === 'mine' ? P.merge(local, theirs) : P.merge(theirs, local);
      P.apply(result);
    }
    // the cloud copy is stamped with when its progress last changed (not when it was uploaded), so the newer play wins
    let t = remote ? remote.t : 0;
    if (!remote || JSON.stringify(result.data) !== JSON.stringify(remote.data)){
      t = Math.max(result.mod || 0, remote ? remote.t + 1 : 0) || Date.now();
      await FB.putSave(result.data, t);
      try { localStorage.setItem('gw-mod', String(t)); } catch (_) {}
    }
    try { localStorage.setItem('gw-sync-t', String(t)); } catch (_) {}
    fbSent = JSON.stringify(P.bundle().data);
    GW.syncedAt = Date.now(); GW.syncError = false;
  } catch (e){ GW.syncError = e.message || true; }
}
// Signing in on a device that already has progress: which profile should the account use?
function askKeep(theirs, mine, fallback){
  return new Promise(resolve => {
    const card = (x, title, v) => `<button class="btn big-row" type="button" data-keep="${v}" style="white-space:normal"><span class="grow" style="text-align:left"><b>${esc(title)}</b><br><span class="muted small">${esc(x.name)} · rating ${x.rating} · ${x.games} games · ${x.puzzles} puzzles</span></span></button>`;
    const m = GW.modal(`<h2>Progress found in your account</h2><div class="sub">This device has progress too. Whose profile and rating should your account use? Games, puzzles, achievements and trophies from both are kept.</div>
      <div class="stack">${card(theirs, 'Your account', 'theirs')}${card(mine, 'This device', 'mine')}</div>`, {onClose: () => resolve(fallback)});
    m.querySelectorAll('[data-keep]').forEach(b => b.addEventListener('click', () => { resolve(b.dataset.keep); GW.closeModal(); }));
  });
}
GW.syncNow = () => fbActive() ? fbSync({force:true}) : pushCloud(true);
setInterval(() => pushCloud(false), 25000);
// Elite Chess accounts save every 2 minutes while something changed (and when the app is closed or hidden), which
// keeps a busy day well inside Firebase's free 20,000 writes
setInterval(() => fbSync(), 120000);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden'){ pushCloud(false); fbSync(); }
  else fbSync({force:true});   // back in the app: pick up anything played on another device
});

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
// Google's sign-in button needs a real website (not Claude, not the Android app's local page)
const googleOK = () => !!CONFIG.googleClientId && !framed && !window.EliteApp && /^https?:$/.test(location.protocol);
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
        ${googleOK() ? '<div id="ldGoogle" class="ld-google"></div>' : ''}
        <button class="btn ghost" type="button" id="ldGuest">Play as a guest</button>
        <p class="muted small ob-agree">By continuing you agree to the <a href="#" data-ldoc="terms">Terms of Use</a> and the <a href="#" data-ldoc="privacy">Privacy Policy</a>. © 2026 Elite Chess.</p>
      </div>
      <form class="stack" id="ldForm" hidden autocomplete="on">
        <div class="tabs small" id="ldMode"><button type="button" data-m="in" aria-pressed="true">Sign in</button><button type="button" data-m="up" aria-pressed="false">${FB.enabled ? 'Create account' : 'Create profile'}</button></div>
        <input class="search" id="ldName" maxlength="20" placeholder="Your name" autocomplete="nickname" hidden>
        <input class="search" id="ldMail" type="email" placeholder="Email" autocomplete="email" required>
        <input class="search" id="ldPass" type="password" placeholder="Password (6+ characters)" autocomplete="current-password" minlength="6" required>
        <div class="feedback bad" id="ldErr" hidden></div>
        <button class="btn pop big" type="submit" id="ldGo">Sign in</button>
        ${FB.enabled ? '<button class="btn ghost" type="button" id="ldForgot">Forgot your password?</button>' : ''}
        <button class="btn ghost" type="button" id="ldBack">← Other options</button>
        <p class="muted small">${FB.enabled ? 'Your Elite Chess account works on elitechess.online and in the Android app. Your progress is saved to your account, so it is safe if you change phones.' : 'Email profiles are saved on this device only, so several people can share one phone or tablet. To sync across devices, sign in with your Claude account.'}</p>
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
    el.querySelector('#ldGo').textContent = m === 'up' ? (FB.enabled ? 'Create account' : 'Create profile') : 'Sign in';
    const fg = el.querySelector('#ldForgot'); if (fg) fg.hidden = m === 'up';
    el.querySelector('#ldPass').autocomplete = m === 'up' ? 'new-password' : 'current-password';
    err.hidden = true;
  };
  el.querySelector('#ldEmail').addEventListener('click', () => { buttons.hidden = true; form.hidden = false; setMode(acctStore().list.length || FB.enabled ? 'in' : 'up'); el.querySelector(mode === 'up' ? '#ldName' : '#ldMail').focus(); });
  el.querySelector('#ldBack').addEventListener('click', () => { form.hidden = true; buttons.hidden = false; });
  el.querySelector('#ldMode').addEventListener('click', e => { const b = e.target.closest('[data-m]'); if (b) setMode(b.dataset.m); });
  const fail = msg => { err.hidden = false; err.className = 'feedback bad'; err.innerHTML = `<span class="ic">!</span><div>${esc(msg)}</div>`; };
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const email = el.querySelector('#ldMail').value.trim().toLowerCase(), pass = el.querySelector('#ldPass').value, name = el.querySelector('#ldName').value.trim().slice(0, 20);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail('Please enter a valid email address.');
    if (pass.length < 6) return fail('Passwords need at least 6 characters.');
    if (FB.enabled) return fbSubmit(email, pass, name);
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
  // Elite Chess accounts (Firebase)
  async function fbSubmit(email, pass, name){
    const go = el.querySelector('#ldGo');
    go.disabled = true;
    try {
      let u, moved = false;
      if (mode === 'up') u = await FB.signUp(email, pass, name);
      else {
        try { u = await FB.signIn(email, pass); }
        catch (e){
          // a profile made on this device before accounts existed moves into a new account with the same details
          const A = acctStore(), old = A.list.find(x => x.email === email && x.provider === 'email');
          if (!old || !['INVALID_LOGIN_CREDENTIALS', 'EMAIL_NOT_FOUND', 'INVALID_PASSWORD'].includes(e.code) || await hashPass(pass, old.salt) !== old.hash) throw e;
          u = await FB.signUp(email, pass, old.name);
          const saved = unstash(old.id);
          if (saved && current() === null) restore(saved);
          A.list = A.list.filter(x => x !== old); saveAccts(A);
          moved = true;
        }
      }
      if (mode === 'up' && name){ GW.profile.name = name; GW.saveProfile(); }
      setCurrent(fbAcct(u));
      if (moved){ location.reload(); return; }
      // bring the account's progress down before the app opens (so a returning player isn't welcomed as new)
      go.textContent = 'Loading your progress…';
      await fbSync({first:true});
      finish();
      GW.toast(mode === 'up' ? `<b>Account created</b><br>Welcome${name ? ', ' + esc(name) : ''}! Your progress is saved to your account.` : '<b>Signed in</b><br>Your progress is saved to your account.');
    } catch (e){ fail(e.message); }
    finally { go.disabled = false; }
  }
  el.querySelector('#ldForgot')?.addEventListener('click', async () => {
    const email = el.querySelector('#ldMail').value.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail('Type your email above first, then tap “Forgot your password?”.');
    try { await FB.resetPassword(email); err.hidden = false; err.className = 'feedback ok'; err.innerHTML = `<div>If there is an account for ${esc(email)}, an email to reset the password is on its way.</div>`; }
    catch (e){ fail(e.code === 'EMAIL_NOT_FOUND' ? `If there is an account for ${email}, an email to reset the password is on its way.` : e.message); }
  });
  el.querySelectorAll('[data-acct]').forEach(b => b.addEventListener('click', () => {
    const a = acctStore().list.find(x => x.id === b.dataset.acct);
    if (!a) return;
    buttons.hidden = true; form.hidden = false; setMode('in');
    el.querySelector('#ldMail').value = a.email; el.querySelector('#ldPass').focus();
  }));
  // Google (only where configured and not inside Claude)
  if (googleOK()) loadGoogle(el.querySelector('#ldGoogle'), async (cred, raw) => {
    if (FB.enabled){
      try {
        const u = await FB.signInGoogle(raw);
        u.name = cred.given_name || cred.name || '';
        if (!GW.profile.name && u.name){ GW.profile.name = u.name.slice(0, 20); GW.saveProfile(); }
        setCurrent(fbAcct(u));
        await fbSync({first:true});
        finish();
        GW.toast('<b>Signed in with Google</b><br>Your progress is saved to your account.');
      } catch (e){ buttons.hidden = false; GW.toast(esc(e.message)); }
      return;
    }
    const acct = {id:'google:' + cred.sub, provider:'google', email: cred.email || '', name: cred.given_name || cred.name || ''};
    if (!GW.profile.name && acct.name){ GW.profile.name = acct.name.slice(0, 20); GW.saveProfile(); }
    if (!current()){ setCurrent(acct); finish(); return; }
    switchTo(acct);
  });
  // Guest
  el.querySelector('#ldGuest').addEventListener('click', () => { setCurrent({id:'guest', provider:'guest', name:''}); finish(); });
  el.addEventListener('click', e => { const d = e.target.closest('[data-ldoc]'); if (d){ e.preventDefault(); GW.openLegal && GW.openLegal(d.dataset.ldoc); } });
  el.querySelector('#ldNote').textContent = keep ? 'Your progress on this device comes with you when you sign in.' : 'Sign in to keep your rating, trophies and games.';
}
function loadGoogle(host, onCred){
  if (!host) return;
  const s = document.createElement('script');
  s.src = 'https://accounts.google.com/gsi/client';
  s.onload = () => {
    try {
      google.accounts.id.initialize({client_id: CONFIG.googleClientId, callback: r => {
        try { const p = JSON.parse(decodeURIComponent(escape(atob(r.credential.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))))); onCred(p, r.credential); } catch (_) {}
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
  const how = {claude:'Claude account · synced', firebase:'Elite Chess account · synced', email:'Email profile on this device', google:'Google account on this device', guest:'Guest on this device'}[a.provider] || '';
  const sync = a.provider === 'firebase' ? (GW.syncError ? 'Couldn’t sync just now. It will try again.' : GW.syncedAt ? `Last synced ${new Date(GW.syncedAt).toLocaleTimeString()}` : 'Saves to your account while you play') : a.provider === 'claude' ? (GW.syncedAt ? `Last synced ${new Date(GW.syncedAt).toLocaleTimeString()}` : 'Syncs every few seconds while you play') : a.provider === 'guest' ? 'Sign in to keep your progress safe.' : 'Use a backup code (Settings) to move it to another device.';
  return `<div class="panel acct"><div class="row"><div class="grow"><div class="label">Account</div><b>${esc(a.name || a.email || (a.provider === 'guest' ? 'Guest' : 'Player'))}</b><div class="muted small">${esc(how)}${a.email ? ' · ' + esc(a.email) : ''}</div><div class="muted small">${esc(sync)}</div></div>
    ${a.provider === 'claude' || a.provider === 'firebase' ? '<button class="btn" type="button" id="acSync">Sync now</button>' : ''}${a.provider === 'guest' ? '<button class="btn pop" type="button" id="acSignIn">Sign in</button>' : '<button class="btn ghost" type="button" id="acOut">Sign out</button>'}</div>
    ${a.provider === 'firebase' ? '<button class="btn ghost" type="button" id="acDelete" style="margin-top:8px;color:var(--alarm)">Delete my account</button>' : ''}</div>`;
};
document.addEventListener('click', e => {
  const t = e.target.closest('#acSync,#acSignIn,#acOut,#acDelete');
  if (!t) return;
  if (t.id === 'acSync') GW.syncNow().then(() => GW.toast(GW.syncError ? esc(String(GW.syncError === true ? 'Couldn’t sync just now.' : GW.syncError)) : 'Synced'));
  if (t.id === 'acDelete'){
    const m = GW.modal(`<h2>Delete your account?</h2><div class="sub">Your Elite Chess account and the progress saved in it are deleted for good. This can’t be undone.</div><div class="feedback bad" id="delErr" hidden></div><div class="row"><button class="btn grow" id="delNo" type="button">Cancel</button><button class="btn danger grow" id="delYes" type="button">Delete account</button></div>`);
    m.querySelector('#delNo').addEventListener('click', () => GW.closeModal());
    m.querySelector('#delYes').addEventListener('click', async ev => {
      ev.target.disabled = true;
      try { await FB.deleteAccount(); }
      catch (er){ const d = m.querySelector('#delErr'); d.hidden = false; d.textContent = er.message; ev.target.disabled = false; return; }
      const was = current();
      try { if (was) localStorage.removeItem('gw-stash:' + was.id); localStorage.removeItem('gw-sync-t'); } catch (_) {}
      restore(null); setCurrent(null); location.reload();
    });
  }
  if (t.id === 'acSignIn'){ setCurrent(null); landing(); }
  if (t.id === 'acOut'){
    const m = GW.modal(`<h2>Sign out?</h2><div class="sub">Your progress stays saved with your account${['claude', 'firebase'].includes(current()?.provider) ? ' in the cloud' : ' on this device'}.</div><div class="row"><button class="btn grow" id="soNo" type="button">Cancel</button><button class="btn pop grow" id="soYes" type="button">Sign out</button></div>`);
    m.querySelector('#soNo').addEventListener('click', () => GW.closeModal());
    m.querySelector('#soYes').addEventListener('click', async () => { await pushCloud(true); await fbSync({force:true}); signOut(); });
  }
});
// Elite Chess account: sync when the app opens
setTimeout(() => fbSync({force:true}), 0);
// Keep a Claude account's cloud copy fresh when the app opens
GW.cloudReady.then(cloud => { const a = current(); if (cloud && cloud.me && a && a.provider === 'claude') pullCloud(cloud, {ask: true}).then(p => { if (!p) pushCloud(false); }); });
})();
