/* Elite Chess: online play.
   Inside Claude, games run through the artifact's live room: everyone who has the app open is in one lobby,
   each game gets its own named room, and each player's messages travel in their room presence as a short
   numbered log (so a dropped update never loses a move).
   Anywhere else (the app hosted on its own), games run directly between the two devices over WebRTC, with a
   PeerJS server only introducing the players. */
(() => {
const GW = window.GW;

const randStr = (n, chars = 'abcdefghijklmnopqrstuvwxyz0123456789') => Array.from({length:n}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
const wait = ms => new Promise(r => setTimeout(r, ms));
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/* ---------- Who I am, and cleaning up who the other side says they are ---------- */
const me = () => ({name: String(GW.profile.name || 'Player').slice(0, 20), look: GW.profile.look, elo: GW.profile.rating});
// Avatars are drawn into SVG, so only plain colours, words, numbers and flags get through
function cleanLook(look){
  if (!look || typeof look !== 'object') return null;
  const out = {};
  for (const [k, v] of Object.entries(look)){
    if (!/^[a-z]{1,12}$/i.test(k)) continue;
    if (typeof v === 'boolean' || (typeof v === 'number' && isFinite(v))) out[k] = v;
    else if (typeof v === 'string' && /^#?[a-z0-9-]{1,20}$/i.test(v)) out[k] = v;
  }
  return Object.keys(out).length ? out : null;
}
const cleanWho = who => ({
  name: String((who && who.name) || 'Opponent').replace(/[\u0000-\u001f]/g, '').slice(0, 20) || 'Opponent',
  look: cleanLook(who && who.look) || GW.D.PEOPLE.black.look,
  elo: Math.round(+((who && who.elo) || 0)) || null
});
const validTc = tc => typeof tc === 'string' && GW.D.TIME_CONTROLS.some(t => t.id === tc && t.id !== '0');

/* ---------- Session state shared by both ways of connecting ---------- */
const S = {state:'idle', mode:null, conn:null, token:0, tc:'300+0', code:'', note:'', here:null, seeking:0, rooms:[], mm:null};
const view = () => { if (GW.renderOnline) GW.renderOnline(); };
const viewNow = () => { if (GW.renderOnlineNow) GW.renderOnlineNow(); };
function setState(state, note = ''){ S.state = state; S.note = note; view(); }

function reset(){
  S.token++;
  if (S.conn){ S.conn.close(true); S.conn = null; }
  for (const r of S.rooms) r.leave().catch(() => {});
  S.rooms = [];
  if (S.mm){ S.mm = null; L.lobbySet({seek:null, offer:null, accept:null}); }
  if (P.peer){ P.peer.destroy(); P.peer = null; }
  S.code = '';
}
function cancel(){ reset(); setState('idle'); }

// Both ways of connecting end here once the two players have agreed on a game
function begin(conn, color, tc, who){
  S.conn = conn;
  conn.on('data', d => { if (S.conn === conn && GW.onlineData) GW.onlineData(d); });
  conn.on('close', () => { if (S.conn === conn && GW.onlineClosed) GW.onlineClosed(); });
  conn.on('error', () => { if (S.conn === conn && GW.onlineClosed) GW.onlineClosed(); });
  setState('playing');
  GW.sfx.success();
  GW.startGame({mode:'online', human:color, bots:{w:null, b:null}, tc, rated:false, online:{opp: cleanWho(who)}});
}

/* =====================================================================
   1) Inside Claude: the artifact's live room
   ===================================================================== */
const framed = !!(window.claude && typeof window.claude.use === 'function');
const L = {
  room:null, me:null, peers:[],
  ready: framed ? window.claude.use('room').catch(() => null) : Promise.resolve(null),
  lobbySet(patch){ if (L.room) L.room.presence(patch).catch(() => {}); }
};
const isGW = p => p && !p.sameTab && p.kind === 'viewer' && p.presence && p.presence.gw === 1;
const roomName = s => /^[a-z0-9][a-z0-9_.-]{0,47}$/.test(s);

L.ready.then(room => {
  S.mode = room ? 'room' : 'p2p';
  if (!room) return viewNow();
  L.room = room;
  L.lobbySet({gw:1, who:me()});
  room.onPeers(ch => {
    L.peers = ch.peers;
    const mine = ch.peers.find(p => p.sameTab);
    if (mine) L.me = mine.peer;
    const others = ch.peers.filter(p => isGW(p) && !p.isMe);
    S.here = others.length;
    S.seeking = others.filter(p => validTc(p.presence.seek)).length;
    viewNow();
    matchmake();
  }, () => { L.room = null; S.here = null; viewNow(); });
});

// One game connection: a named room, with messages carried as a numbered log in each player's presence
class RoomLink {
  constructor(named, remote = null){
    Object.assign(this, {r:named, remote, h:{}, out:[], seq:0, seen:new Map(), closed:false, met:false, gone:null});
    this.unsub = named.onPeers(ch => this.peers(ch), () => this.close());
    named.presence({gw:1}).catch(() => {});
  }
  on(ev, fn){ this.h[ev] = fn; return this; }
  emit(ev, ...a){ if (this.h[ev]) this.h[ev](...a); }
  lock(peer){ this.remote = peer; this.met = true; }
  present(){ return !!this.remote && this.r.peers().some(p => p.peer === this.remote); }
  peers(ch){
    if (this.closed) return;
    for (const p of ch.peers){
      if (!isGW(p) || (this.remote && p.peer !== this.remote)) continue;
      this.read(p);
      if (this.closed) return;
    }
    if (this.remote){
      if (ch.peers.some(p => p.peer === this.remote)){ this.met = true; clearTimeout(this.gone); this.gone = null; }
      // a short grace period rides out a network blip; after that the opponent has gone
      else if (this.met && !this.gone) this.gone = setTimeout(() => this.close(), 15000);
    }
    this.emit('peers', ch.peers);
  }
  read(p){
    const log = Array.isArray(p.presence.out) ? p.presence.out.filter(e => e && typeof e.s === 'number' && e.d && typeof e.d === 'object' && typeof e.d.t === 'string') : [];
    log.sort((a, b) => a.s - b.s);
    let last = this.seen.get(p.peer) || 0;
    for (const e of log){
      if (e.s <= last) continue;
      last = e.s; this.seen.set(p.peer, last);
      this.emit('data', e.d, p);
      if (this.closed) return;
    }
  }
  send(d){
    if (this.closed) return false;
    this.out.push({s: ++this.seq, d});
    while (this.out.length > 1 && (this.out.length > 20 || JSON.stringify(this.out).length > 2800)) this.out.shift();
    this.r.presence({out: this.out.slice()}).catch(() => {});
    return !this.remote || this.present();
  }
  close(silent){
    if (this.closed) return;
    this.closed = true; clearTimeout(this.gone);
    try { this.unsub(); } catch (_) {}
    this.r.leave().catch(() => {});
    if (!silent) this.emit('close');
  }
}

async function joinRoom(name, token){
  const named = await L.room.join(name);
  if (token !== S.token){ named.leave().catch(() => {}); return null; }
  S.rooms.push(named);
  return named;
}
const dropRoom = named => { S.rooms = S.rooms.filter(r => r !== named); };

// Host side of a game room: wait for the guest's hello, then pick colours and start
function hostRoom(named, link, token, tc, onTimeout, ms){
  return new Promise(resolve => {
    const t = ms ? setTimeout(() => { link.close(true); resolve(false); if (onTimeout) onTimeout(); }, ms) : null;
    link.on('data', (d, p) => {
      if (d.t !== 'hello' || token !== S.token || S.conn) return;
      if (link.remote && p.peer !== link.remote) return;
      clearTimeout(t);
      link.lock(p.peer);
      named.presence({open:false}).catch(() => {});
      dropRoom(named);
      const hostColor = Math.random() < 0.5 ? 'w' : 'b';
      link.send({t:'start', to:p.peer, hostColor, tc, who: me()});
      begin(link, hostColor, tc, d.who);
      resolve(true);
    });
    link.on('close', () => { clearTimeout(t); resolve(false); });
  });
}
// Guest side: say hello to the host and wait for the start message addressed to this page
function guestRoom(named, link, token, ms){
  return new Promise(resolve => {
    const t = setTimeout(() => { link.close(true); resolve(false); }, ms);
    link.on('data', (d, p) => {
      if (d.t !== 'start' || d.to !== L.me || p.peer !== link.remote || token !== S.token || S.conn) return;
      clearTimeout(t);
      dropRoom(named);
      begin(link, d.hostColor === 'w' ? 'b' : 'w', validTc(d.tc) ? d.tc : S.tc, d.who);
      resolve(true);
    });
    link.on('close', () => { clearTimeout(t); resolve(false); });
    link.send({t:'hello', who: me()});
  });
}

/* Quick match. Everyone looking at a time control shows it in their lobby presence. Of the free seekers,
   the one with the lowest peer label offers a game to the next; the other accepts; both meet in a new room. */
function roomQuick(tc, token){
  S.mm = {tc, token, offer:null, offerAt:0, busy:false};
  L.lobbySet({gw:1, who:me(), seek:tc, offer:null, accept:null});
  setState('searching', 'Looking for an opponent…');
  const tick = setInterval(() => { if (!S.mm || S.mm.token !== token) return clearInterval(tick); matchmake(); }, 1500);
  matchmake();
}
function backToSeek(mm){
  if (S.mm !== mm || mm.token !== S.token) return;
  mm.busy = false; mm.offer = null;
  L.lobbySet({seek:mm.tc, offer:null, accept:null});
  setState('searching', 'Looking for an opponent…');
}
function matchmake(){
  const mm = S.mm;
  if (!mm || mm.busy || mm.token !== S.token || S.state !== 'searching' || !L.me) return;
  const others = L.peers.filter(isGW);
  // someone offered me a game: take it
  const inv = others.find(p => p.presence.seek === mm.tc && p.presence.offer && p.presence.offer.to === L.me && roomName(String(p.presence.offer.g)));
  if (inv){
    const g = inv.presence.offer.g;
    mm.busy = true;
    L.lobbySet({seek:null, offer:null, accept:{to:inv.peer, g}});
    setState('searching', 'Opponent found — connecting…');
    (async () => {
      try {
        const named = await joinRoom(g, mm.token);
        if (!named) return;
        const ok = await guestRoom(named, new RoomLink(named, inv.peer), mm.token, 12000);
        if (ok){ S.mm = null; L.lobbySet({accept:null}); } else { dropRoom(named); backToSeek(mm); }
      } catch (_) { backToSeek(mm); }
    })();
    return;
  }
  // my own offer: started, still waiting, or stale
  if (mm.offer){
    const x = others.find(p => p.peer === mm.offer.to);
    const acc = x && x.presence.accept;
    if (acc && acc.to === L.me && acc.g === mm.offer.g){
      mm.busy = true;
      L.lobbySet({seek:null, offer:null});
      setState('searching', 'Opponent found — connecting…');
      (async () => {
        try {
          const named = await joinRoom(mm.offer.g, mm.token);
          if (!named) return;
          named.presence({gw:1, role:'host'}).catch(() => {});
          const ok = await hostRoom(named, new RoomLink(named, x.peer), mm.token, mm.tc, null, 12000);
          if (ok) S.mm = null; else { dropRoom(named); backToSeek(mm); }
        } catch (_) { backToSeek(mm); }
      })();
      return;
    }
    if (!x || x.presence.seek !== mm.tc || acc || Date.now() - mm.offerAt > 6000){ mm.offer = null; L.lobbySet({offer:null}); }
    else return;
  }
  const free = others.filter(p => p.presence.seek === mm.tc && !p.presence.accept).map(p => p.peer);
  free.push(L.me);
  free.sort();
  if (free[0] === L.me && free.length > 1){
    mm.offer = {to: free[1], g: 'g-' + randStr(14)};
    mm.offerAt = Date.now();
    L.lobbySet({offer: mm.offer});
  }
}

// Play a friend: the host waits in a room named after a 5-character code
async function roomHostInvite(tc, token){
  for (let tries = 0; tries < 5; tries++){
    const code = randStr(5, CODE_CHARS);
    const named = await joinRoom('inv-' + code.toLowerCase(), token);
    if (!named) return;
    await wait(1200);
    if (token !== S.token) return;
    if (named.peers().some(p => isGW(p) && p.presence.role === 'host')){ named.leave().catch(() => {}); dropRoom(named); continue; }
    named.presence({gw:1, role:'host', open:true}).catch(() => {});
    S.code = code;
    setState('hosting', 'Waiting for your friend to join…');
    hostRoom(named, new RoomLink(named), token, tc);
    return;
  }
  setState('error', 'Couldn’t create a game code. Please try again.');
}
async function roomJoinCode(code, token){
  const named = await joinRoom('inv-' + code.toLowerCase(), token);
  if (!named) return;
  const link = new RoomLink(named);
  const result = await new Promise(resolve => {
    let t = setTimeout(() => resolve('none'), 9000);
    link.on('peers', peers => {
      if (link.remote) return;
      const h = peers.find(p => isGW(p) && p.presence.role === 'host');
      if (!h) return;
      clearTimeout(t);
      if (h.presence.open === false) return resolve('taken');
      link.lock(h.peer);
      guestRoom(named, link, token, 12000).then(ok => resolve(ok ? 'ok' : 'none'));
    });
  });
  if (result === 'ok' || token !== S.token) return;
  link.close(true); dropRoom(named);
  reset();
  setState('error', result === 'taken' ? `Game ${code} has already started with someone else.` : `No open game with the code ${code}. Check the code with your friend, and make sure they’re still on the code screen.`);
}

/* =====================================================================
   2) Outside Claude: direct WebRTC connections, introduced by a PeerJS server
   ===================================================================== */
const P = {peer:null};
const CFG = {host:'0.peerjs.com', port:443, secure:true, path:'/', key:'peerjs'};
try { const o = JSON.parse(localStorage.getItem('gw-peer') || 'null'); if (o) Object.assign(CFG, o); } catch (_) {}
const ICE = [
  {urls:'stun:stun.l.google.com:19302'}, {urls:'stun:stun1.l.google.com:19302'},
  {urls:['turn:openrelay.metered.ca:80', 'turn:openrelay.metered.ca:443', 'turn:openrelay.metered.ca:443?transport=tcp'], username:'openrelayproject', credential:'openrelayproject'}
];
const p2pSupported = () => typeof RTCPeerConnection === 'function' && typeof WebSocket === 'function';
const PREFIX = 'greenwood-chess-v1-';

class Peer {
  constructor(id){ this.id = id; this.h = {}; this.conns = new Map(); this.ws = null; }
  on(ev, fn){ this.h[ev] = fn; return this; }
  emit(ev, ...a){ if (this.h[ev]) this.h[ev](...a); }
  open(){
    return new Promise((resolve, reject) => {
      const url = `${CFG.secure ? 'wss' : 'ws'}://${CFG.host}:${CFG.port}${CFG.path}peerjs?key=${CFG.key}&id=${encodeURIComponent(this.id)}&token=${randStr(12)}&version=1.5.4`;
      let ws, opened = false;
      try { ws = new WebSocket(url); } catch (e) { return reject(Object.assign(new Error('network'), {network:true})); }
      this.ws = ws;
      const t = setTimeout(() => { if (!opened){ reject(Object.assign(new Error('timeout'), {network:true})); try { ws.close(); } catch (_) {} } }, 10000);
      ws.onmessage = ev => {
        let m; try { m = JSON.parse(ev.data); } catch (_) { return; }
        if (m.type === 'OPEN'){ opened = true; clearTimeout(t); this.hb = setInterval(() => this.send({type:'HEARTBEAT'}), 5000); resolve(this); }
        else if (m.type === 'ID-TAKEN'){ clearTimeout(t); reject(Object.assign(new Error('taken'), {taken:true})); }
        else if (m.type === 'ERROR' && !opened){ clearTimeout(t); reject(new Error((m.payload && m.payload.msg) || 'error')); }
        else this.signal(m);
      };
      ws.onerror = () => { if (!opened){ clearTimeout(t); reject(Object.assign(new Error('network'), {network:true})); } };
      ws.onclose = () => { clearInterval(this.hb); if (!opened){ clearTimeout(t); reject(Object.assign(new Error('closed'), {network:true})); } else this.emit('close'); };
    });
  }
  send(m){ if (this.ws && this.ws.readyState === 1) this.ws.send(JSON.stringify(m)); }
  connect(dst){ const c = new Conn(this, dst, true); this.conns.set(dst, c); c.start(); return c; }
  signal(m){
    if (m.type === 'EXPIRE'){ const c = this.conns.get(m.src); if (c) c.fail('unreachable'); return; }
    if (m.type === 'LEAVE'){ const c = this.conns.get(m.src); if (c) c.close(); return; }
    let c = this.conns.get(m.src);
    if (m.type === 'OFFER' && !c){ c = new Conn(this, m.src, false); this.conns.set(m.src, c); c.start(); this.emit('connection', c); }
    if (c) c.handle(m);
  }
  destroy(){
    clearInterval(this.hb);
    for (const c of [...this.conns.values()]) c.close(true);
    this.conns.clear();
    if (this.ws){ try { this.ws.close(); } catch (_) {} }
    this.ws = null;
    this.h = {};
  }
}

class Conn {
  constructor(peer, remote, initiator){ Object.assign(this, {peer, remote, initiator, h:{}, isOpen:false, closed:false, pending:[]}); }
  on(ev, fn){ this.h[ev] = fn; return this; }
  emit(ev, ...a){ if (this.h[ev]) this.h[ev](...a); }
  start(){
    const pc = this.pc = new RTCPeerConnection({iceServers: ICE});
    pc.onicecandidate = e => { if (e.candidate) this.peer.send({type:'CANDIDATE', dst:this.remote, payload:{candidate: e.candidate.toJSON ? e.candidate.toJSON() : e.candidate}}); };
    pc.onconnectionstatechange = () => { if (pc.connectionState === 'failed') this.fail('failed'); };
    if (this.initiator){
      this.bind(pc.createDataChannel('greenwood', {ordered:true}));
      pc.createOffer().then(o => pc.setLocalDescription(o))
        .then(() => this.peer.send({type:'OFFER', dst:this.remote, payload:{sdp: pc.localDescription}}))
        .catch(() => this.fail('offer'));
    } else pc.ondatachannel = e => this.bind(e.channel);
    this.timer = setTimeout(() => { if (!this.isOpen) this.fail('timeout'); }, 15000);
  }
  bind(ch){
    this.ch = ch;
    ch.onopen = () => {
      this.isOpen = true; clearTimeout(this.timer); this.seen = Date.now();
      this.beat = setInterval(() => {
        if (Date.now() - this.seen > 15000) return this.fail('silent');
        try { ch.send('{"t":"ping"}'); } catch (_) {}
      }, 3000);
      this.emit('open');
    };
    ch.onmessage = e => { this.seen = Date.now(); let d; try { d = JSON.parse(e.data); } catch (_) { return; } if (d.t !== 'ping') this.emit('data', d); };
    ch.onclose = () => this.close();
  }
  async handle(m){
    const pc = this.pc;
    try {
      if (m.type === 'OFFER'){
        await pc.setRemoteDescription(m.payload.sdp);
        await pc.setLocalDescription(await pc.createAnswer());
        this.peer.send({type:'ANSWER', dst:this.remote, payload:{sdp: pc.localDescription}});
        this.flush();
      } else if (m.type === 'ANSWER'){ await pc.setRemoteDescription(m.payload.sdp); this.flush(); }
      else if (m.type === 'CANDIDATE'){
        if (pc.remoteDescription) await pc.addIceCandidate(m.payload.candidate);
        else this.pending.push(m.payload.candidate);
      }
    } catch (_) {}
  }
  async flush(){ const p = this.pending; this.pending = []; for (const c of p){ try { await this.pc.addIceCandidate(c); } catch (_) {} } }
  send(d){ if (this.ch && this.ch.readyState === 'open'){ this.ch.send(JSON.stringify(d)); return true; } return false; }
  fail(why){ if (this.closed) return; const wasOpen = this.isOpen; this.shut(); this.emit(wasOpen ? 'close' : 'error', why); }
  close(silent){ if (this.closed) return; this.shut(); if (!silent) this.emit('close'); }
  shut(){
    this.closed = true; clearTimeout(this.timer); clearInterval(this.beat);
    try { if (this.ch) this.ch.close(); } catch (_) {}
    try { if (this.pc) this.pc.close(); } catch (_) {}
    this.peer.conns.delete(this.remote);
  }
}

function expect(conn, types, ms){
  return new Promise(resolve => {
    let done = false;
    const finish = v => { if (!done){ done = true; clearTimeout(t); resolve(v); } };
    const t = setTimeout(() => finish(null), ms);
    conn.on('data', d => { if (types.includes(d.t)) finish(d); });
    conn.on('close', () => finish(null));
    conn.on('error', () => finish(null));
  });
}
function dial(peer, dst, ms = 9000){
  return new Promise(resolve => {
    const c = peer.connect(dst);
    const t = setTimeout(() => { c.close(true); resolve(null); }, ms);
    c.on('open', () => { clearTimeout(t); resolve(c); });
    c.on('error', () => { clearTimeout(t); resolve(null); });
  });
}
function p2pError(e){
  if (framed) return 'Online play works when you’re signed in to Claude and this app has been shared with you. Sign in, or ask the person who shared it to invite you.';
  if (!p2pSupported()) return 'This browser can’t make direct connections, so online play isn’t available here. Try Chrome or Safari.';
  if (e && e.network) return 'Can’t reach the online server. Check your internet connection and try again.';
  return 'Something went wrong connecting. Please try again.';
}
function p2pHostAccept(conn, token, tc){
  conn.on('data', d => {
    if (d.t === 'probe'){ conn.send({t: S.conn || token !== S.token ? 'busy' : 'avail'}); return; }
    if (d.t !== 'hello') return;
    if (token !== S.token || S.conn){ conn.send({t:'busy'}); return; }
    const hostColor = Math.random() < 0.5 ? 'w' : 'b';
    conn.send({t:'start', hostColor, tc, who: me()});
    begin(conn, hostColor, tc, d.who);
  });
}
function refuseExtra(peer){
  peer.on('connection', c => { c.on('open', () => { if (c !== S.conn){ c.send({t:'busy'}); setTimeout(() => c.close(true), 400); } }); });
}
function findHost(peer, ids, token){
  return new Promise(resolve => {
    let left = ids.length, won = false;
    if (!left) return resolve(null);
    for (const id of ids){
      dial(peer, id).then(async c => {
        if (c && !won && token === S.token){
          const got = expect(c, ['avail', 'busy'], 5000);
          c.send({t:'probe'});
          const d = await got;
          if (d && d.t === 'avail' && !won && token === S.token){ won = true; resolve(c); return; }
          c.close(true);
        }
        if (--left === 0 && !won) resolve(null);
      });
    }
  });
}
async function tryJoin(peer, ids, token){
  const c = await findHost(peer, ids, token);
  if (!c || token !== S.token){ if (c) c.close(true); return false; }
  const got = expect(c, ['start', 'busy'], 6000);
  c.send({t:'hello', who: me()});
  const d = await got;
  if (!d || d.t !== 'start' || token !== S.token){ c.close(true); return false; }
  begin(c, d.hostColor === 'w' ? 'b' : 'w', validTc(d.tc) ? d.tc : S.tc, d.who);
  return true;
}
const SLOTS = 6;
const slotId = (tc, n) => `${PREFIX}qm-${tc.replace(/[^0-9a-z]/gi, '-')}-${n}`;
function p2pListen(host, token, tc){
  host.on('connection', c => {
    c.on('open', () => {
      if (S.conn || token !== S.token){ c.send({t:'busy'}); setTimeout(() => c.close(true), 400); return; }
      p2pHostAccept(c, token, tc);
    });
  });
}
async function p2pQuick(tc, token){
  if (!p2pSupported()) return setState('error', p2pError());
  try {
    const seeker = P.peer = new Peer(`${PREFIX}p-${randStr(10)}`);
    await seeker.open();
    const all = Array.from({length:SLOTS}, (_, n) => slotId(tc, n));
    if (await tryJoin(seeker, all, token)){ refuseExtra(seeker); return; }
    if (token !== S.token) return;
    seeker.destroy(); P.peer = null;
    for (let n = 0; n < SLOTS; n++){
      if (token !== S.token) return;
      const host = new Peer(slotId(tc, n));
      try { await host.open(); }
      catch (e){ if (e.taken) continue; throw e; }
      if (token !== S.token){ host.destroy(); return; }
      P.peer = host;
      setState('searching', 'Waiting for an opponent…');
      p2pListen(host, token, tc);
      (async () => {
        while (token === S.token && !S.conn){
          await wait(8000);
          const lower = Array.from({length:n}, (_, k) => slotId(tc, k));
          if (lower.length && token === S.token && !S.conn && await tryJoin(host, lower, token)) return;
        }
      })();
      return;
    }
    setState('error', 'Matchmaking is busy right now. Please try again in a moment.');
  } catch (e){ if (token === S.token){ reset(); setState('error', p2pError(e)); } }
}
async function p2pHostInvite(tc, token){
  if (!p2pSupported()) return setState('error', p2pError());
  try {
    for (let tries = 0; tries < 5; tries++){
      const code = randStr(5, CODE_CHARS);
      const host = new Peer(`${PREFIX}inv-${code}`);
      try { await host.open(); }
      catch (e){ if (e.taken) continue; throw e; }
      if (token !== S.token){ host.destroy(); return; }
      P.peer = host; S.code = code;
      p2pListen(host, token, tc);
      return setState('hosting', 'Waiting for your friend to join…');
    }
    setState('error', 'Couldn’t create a game code. Please try again.');
  } catch (e){ if (token === S.token){ reset(); setState('error', p2pError(e)); } }
}
async function p2pJoinCode(code, token){
  if (!p2pSupported()) return setState('error', p2pError());
  try {
    const guest = P.peer = new Peer(`${PREFIX}p-${randStr(10)}`);
    await guest.open();
    if (await tryJoin(guest, [`${PREFIX}inv-${code}`], token)){ refuseExtra(guest); return; }
    if (token === S.token){ reset(); setState('error', `No open game with the code ${code}. Check the code with your friend.`); }
  } catch (e){ if (token === S.token){ reset(); setState('error', p2pError(e)); } }
}

/* =====================================================================
   Public entry points: pick the room when Claude offers it, else WebRTC
   ===================================================================== */
async function start(state, note, run){
  reset();
  const token = S.token;
  setState(state, note);
  let room = null;
  try { room = await L.ready; } catch (_) {}
  if (token !== S.token) return;
  try { await run(token, !!(room && L.room)); }
  catch (_) { if (token === S.token){ reset(); setState('error', 'Something went wrong connecting. Please try again.'); } }
}
function quickMatch(tc){
  S.tc = tc;
  start('searching', 'Connecting…', (token, inRoom) => inRoom ? roomQuick(tc, token) : p2pQuick(tc, token));
}
function hostInvite(tc){
  S.tc = tc;
  start('hosting', 'Creating your game…', (token, inRoom) => inRoom ? roomHostInvite(tc, token) : p2pHostInvite(tc, token));
}
function joinCode(raw){
  const code = String(raw || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (code.length !== 5) return setState('error', 'Codes have 5 letters and numbers, like K7QXP.');
  start('joining', `Joining game ${code}…`, (token, inRoom) => inRoom ? roomJoinCode(code, token) : p2pJoinCode(code, token));
}

for (const ev of ['pagehide', 'beforeunload']) addEventListener(ev, () => { if (S.conn) S.conn.send({t:'bye'}); });

GW.Online = {
  state: () => S,
  quickMatch, hostInvite, joinCode, cancel,
  send: d => !!(S.conn && S.conn.send(d)),
  leave(){
    const c = S.conn;
    if (c){ c.send({t:'bye'}); S.conn = null; setTimeout(() => c.close(true), 600); }
    reset(); S.state = 'idle';
  },
  supported: () => S.mode === 'room' || p2pSupported()
};
})();
