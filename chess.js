/* Greenwood Chess: rules, notation, a small built-in search, a mate solver and a Stockfish wrapper.
   Squares are 0..63 with 0 = a8 and 63 = h1. Pieces are strings like 'wK' or 'bP'. */
(() => {
const FILES = 'abcdefgh';
const VAL = {P:100, N:320, B:330, R:500, Q:900, K:0};
const KN = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
const KG = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
const DIAG = [[-1,-1],[-1,1],[1,-1],[1,1]];
const ORTH = [[-1,0],[1,0],[0,-1],[0,1]];
const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
const opp = c => c === 'w' ? 'b' : 'w';
const sqName = i => FILES[i & 7] + (8 - (i >> 3));
const sqIndex = n => FILES.indexOf(n[0]) + (8 - +n[1]) * 8;
const inB = (r, c) => r >= 0 && r < 8 && c >= 0 && c < 8;

function fromFEN(fen){
  const [place, turn, cas, ep, half, full] = fen.trim().split(/\s+/);
  const board = Array(64).fill(null);
  let i = 0;
  for (const ch of place){
    if (ch === '/') continue;
    if (/\d/.test(ch)){ i += +ch; continue; }
    const color = ch === ch.toUpperCase() ? 'w' : 'b';
    board[i++] = color + ch.toUpperCase();
  }
  return {
    board, turn: turn || 'w',
    castle: {K:(cas||'').includes('K'), Q:(cas||'').includes('Q'), k:(cas||'').includes('k'), q:(cas||'').includes('q')},
    ep: ep && ep !== '-' ? sqIndex(ep) : -1,
    half: +half || 0, full: +full || 1
  };
}

function toFEN(s){
  let out = '';
  for (let r = 0; r < 8; r++){
    let empty = 0;
    for (let c = 0; c < 8; c++){
      const p = s.board[r * 8 + c];
      if (!p){ empty++; continue; }
      if (empty){ out += empty; empty = 0; }
      out += p[0] === 'w' ? p[1] : p[1].toLowerCase();
    }
    if (empty) out += empty;
    if (r < 7) out += '/';
  }
  const cas = (s.castle.K ? 'K' : '') + (s.castle.Q ? 'Q' : '') + (s.castle.k ? 'k' : '') + (s.castle.q ? 'q' : '');
  return `${out} ${s.turn} ${cas || '-'} ${s.ep >= 0 ? sqName(s.ep) : '-'} ${s.half} ${s.full}`;
}

const initState = () => fromFEN(START_FEN);

function attacked(b, sq, by){
  const r = sq >> 3, c = sq & 7;
  const pr = by === 'w' ? r + 1 : r - 1;
  for (const dc of [-1, 1]) if (inB(pr, c+dc) && b[pr*8+c+dc] === by+'P') return true;
  for (const [dr,dc] of KN) if (inB(r+dr, c+dc) && b[(r+dr)*8+c+dc] === by+'N') return true;
  for (const [dr,dc] of KG) if (inB(r+dr, c+dc) && b[(r+dr)*8+c+dc] === by+'K') return true;
  for (const [dirs, kinds] of [[DIAG,'BQ'],[ORTH,'RQ']]){
    for (const [dr,dc] of dirs){
      let rr = r+dr, cc = c+dc;
      while (inB(rr, cc)){
        const p = b[rr*8+cc];
        if (p){ if (p[0] === by && kinds.includes(p[1])) return true; break; }
        rr += dr; cc += dc;
      }
    }
  }
  return false;
}

const findKing = (b, color) => b.indexOf(color + 'K');
const inCheck = s => attacked(s.board, findKing(s.board, s.turn), opp(s.turn));

function pseudo(s){
  const b = s.board, me = s.turn, op = opp(me), out = [];
  const add = (from, to, extra) => out.push(Object.assign({from, to, piece:b[from], cap:b[to], promo:null, flag:null}, extra));
  for (let i = 0; i < 64; i++){
    const p = b[i];
    if (!p || p[0] !== me) continue;
    const t = p[1], r = i >> 3, c = i & 7;
    if (t === 'P'){
      const d = me === 'w' ? -1 : 1, start = me === 'w' ? 6 : 1, last = me === 'w' ? 0 : 7;
      const pawnAdd = (to, extra) => {
        if ((to >> 3) === last) for (const pr of 'QRBN') add(i, to, Object.assign({promo:pr}, extra));
        else add(i, to, extra);
      };
      const one = (r+d)*8 + c;
      if (inB(r+d, c) && !b[one]){
        pawnAdd(one);
        const two = (r+2*d)*8 + c;
        if (r === start && !b[two]) add(i, two, {flag:'double'});
      }
      for (const dc of [-1, 1]){
        if (!inB(r+d, c+dc)) continue;
        const to = (r+d)*8 + c + dc;
        if (b[to] && b[to][0] === op) pawnAdd(to);
        else if (to === s.ep) add(i, to, {flag:'ep', cap:op+'P'});
      }
    } else if (t === 'N' || t === 'K'){
      for (const [dr,dc] of (t === 'N' ? KN : KG)){
        if (!inB(r+dr, c+dc)) continue;
        const to = (r+dr)*8 + c + dc;
        if (!b[to] || b[to][0] === op) add(i, to);
      }
      if (t === 'K'){
        const home = me === 'w' ? 60 : 4, kk = me === 'w' ? 'K' : 'k', qq = me === 'w' ? 'Q' : 'q';
        if (i === home && !attacked(b, home, op)){
          if (s.castle[kk] && !b[home+1] && !b[home+2] && b[home+3] === me+'R' &&
              !attacked(b, home+1, op) && !attacked(b, home+2, op)) add(i, home+2, {flag:'K'});
          if (s.castle[qq] && !b[home-1] && !b[home-2] && !b[home-3] && b[home-4] === me+'R' &&
              !attacked(b, home-1, op) && !attacked(b, home-2, op)) add(i, home-2, {flag:'Q'});
        }
      }
    } else {
      const dirs = t === 'B' ? DIAG : t === 'R' ? ORTH : DIAG.concat(ORTH);
      for (const [dr,dc] of dirs){
        let rr = r+dr, cc = c+dc;
        while (inB(rr, cc)){
          const to = rr*8 + cc;
          if (b[to]){ if (b[to][0] === op) add(i, to); break; }
          add(i, to);
          rr += dr; cc += dc;
        }
      }
    }
  }
  return out;
}

function apply(s, m){
  const b = s.board.slice(), me = s.turn;
  b[m.to] = m.promo ? me + m.promo : m.piece;
  b[m.from] = null;
  if (m.flag === 'ep') b[m.to + (me === 'w' ? 8 : -8)] = null;
  if (m.flag === 'K'){ b[m.from+1] = b[m.from+3]; b[m.from+3] = null; }
  if (m.flag === 'Q'){ b[m.from-1] = b[m.from-4]; b[m.from-4] = null; }
  const castle = Object.assign({}, s.castle);
  if (m.piece[1] === 'K'){ if (me === 'w') castle.K = castle.Q = false; else castle.k = castle.q = false; }
  for (const sq of [m.from, m.to]){
    if (sq === 63) castle.K = false; if (sq === 56) castle.Q = false;
    if (sq === 7) castle.k = false;  if (sq === 0) castle.q = false;
  }
  return {
    board:b, turn:opp(me), castle,
    ep: m.flag === 'double' ? (m.from + m.to) / 2 : -1,
    half: (m.piece[1] === 'P' || m.cap) ? 0 : s.half + 1,
    full: s.full + (me === 'b' ? 1 : 0)
  };
}

function legal(s){
  const me = s.turn, op = opp(me);
  return pseudo(s).filter(m => {
    const n = apply(s, m);
    return !attacked(n.board, findKing(n.board, me), op);
  });
}

function san(s, m, moves){
  moves = moves || legal(s);
  let str;
  if (m.flag === 'K') str = 'O-O';
  else if (m.flag === 'Q') str = 'O-O-O';
  else {
    const t = m.piece[1];
    if (t === 'P'){
      str = (m.cap ? FILES[m.from & 7] + 'x' : '') + sqName(m.to) + (m.promo ? '=' + m.promo : '');
    } else {
      const amb = moves.filter(o => o.piece === m.piece && o.to === m.to && o.from !== m.from);
      let dis = '';
      if (amb.length){
        if (!amb.some(o => (o.from & 7) === (m.from & 7))) dis = FILES[m.from & 7];
        else if (!amb.some(o => (o.from >> 3) === (m.from >> 3))) dis = String(8 - (m.from >> 3));
        else dis = sqName(m.from);
      }
      str = t + dis + (m.cap ? 'x' : '') + sqName(m.to);
    }
  }
  const n = apply(s, m);
  if (inCheck(n)) str += legal(n).length ? '+' : '#';
  return str;
}

const uci = m => sqName(m.from) + sqName(m.to) + (m.promo ? m.promo.toLowerCase() : '');
function fromSan(s, str){
  const t = String(str).replace(/[+#!?]/g, '').replace(/0/g, 'O');
  const moves = legal(s);
  return moves.find(m => san(s, m, moves).replace(/[+#]/g, '') === t) || null;
}
// PGN text for a list of moves from the start position
function toPGN(moves, headers = {}){
  let s = initState(), out = '';
  moves.forEach((m, k) => { if (k % 2 === 0) out += `${k / 2 + 1}. `; out += san(s, m) + ' '; s = apply(s, m); });
  const head = Object.entries(headers).map(([k, v]) => `[${k} "${String(v).replace(/"/g, "'")}"]`).join('\n');
  return (head ? head + '\n\n' : '') + out.trim() + (headers.Result ? ' ' + headers.Result : '');
}
// Moves from PGN movetext (tags, comments, variations and results are skipped)
function parsePGN(text){
  const body = String(text).replace(/\[[^\]]*\]/g, ' ').replace(/\{[^}]*\}/g, ' ').replace(/;[^\n]*/g, ' ');
  let depth = 0, clean = '';
  for (const ch of body){ if (ch === '(') depth++; else if (ch === ')') depth--; else if (!depth) clean += ch; }
  const toks = clean.replace(/\d+\.(\.\.)?/g, ' ').split(/\s+/).filter(t => t && !/^(1-0|0-1|1\/2-1\/2|\*|\$\d+)$/.test(t));
  let s = initState(); const moves = [];
  for (const t of toks){ const m = fromSan(s, t); if (!m) break; moves.push(m); s = apply(s, m); }
  return moves;
}
const fromUci = (s, u) => u ? legal(s).find(m => uci(m) === u) || null : null;

const posKey = s => s.board.map(p => p || '.').join('') + s.turn +
  (s.castle.K?'K':'') + (s.castle.Q?'Q':'') + (s.castle.k?'k':'') + (s.castle.q?'q':'') + s.ep;

function insufficient(b){
  const rest = [];
  b.forEach((p, i) => { if (p && p[1] !== 'K') rest.push([p, i]); });
  if (rest.length === 0) return true;
  if (rest.length === 1 && 'NB'.includes(rest[0][0][1])) return true;
  if (rest.length === 2 && rest.every(([p]) => p[1] === 'B') && rest[0][0][0] !== rest[1][0][0]){
    const col = i => ((i >> 3) + (i & 7)) % 2;
    return col(rest[0][1]) === col(rest[1][1]);
  }
  return false;
}

/* ---------- Built-in search (bots up to ~1200, and the fallback when Stockfish can't load) ---------- */
const PST = {
  P:[0,0,0,0,0,0,0,0, 50,50,50,50,50,50,50,50, 10,10,20,30,30,20,10,10, 5,5,10,25,25,10,5,5,
     0,0,0,20,20,0,0,0, 5,-5,-10,0,0,-10,-5,5, 5,10,10,-20,-20,10,10,5, 0,0,0,0,0,0,0,0],
  N:[-50,-40,-30,-30,-30,-30,-40,-50, -40,-20,0,0,0,0,-20,-40, -30,0,10,15,15,10,0,-30, -30,5,15,20,20,15,5,-30,
     -30,0,15,20,20,15,0,-30, -30,5,10,15,15,10,5,-30, -40,-20,0,5,5,0,-20,-40, -50,-40,-30,-30,-30,-30,-40,-50],
  B:[-20,-10,-10,-10,-10,-10,-10,-20, -10,0,0,0,0,0,0,-10, -10,0,5,10,10,5,0,-10, -10,5,5,10,10,5,5,-10,
     -10,0,10,10,10,10,0,-10, -10,10,10,10,10,10,10,-10, -10,5,0,0,0,0,5,-10, -20,-10,-10,-10,-10,-10,-10,-20],
  R:[0,0,0,0,0,0,0,0, 5,10,10,10,10,10,10,5, -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5,
     -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5, 0,0,0,5,5,0,0,0],
  Q:[-20,-10,-10,-5,-5,-10,-10,-20, -10,0,0,0,0,0,0,-10, -10,0,5,5,5,5,0,-10, -5,0,5,5,5,5,0,-5,
     0,0,5,5,5,5,0,-5, -10,5,5,5,5,5,0,-10, -10,0,5,0,0,0,0,-10, -20,-10,-10,-5,-5,-10,-10,-20],
  K:[-30,-40,-40,-50,-50,-40,-40,-30, -30,-40,-40,-50,-50,-40,-40,-30, -30,-40,-40,-50,-50,-40,-40,-30, -30,-40,-40,-50,-50,-40,-40,-30,
     -20,-30,-30,-40,-40,-30,-30,-20, -10,-20,-20,-20,-20,-20,-20,-10, 20,20,0,0,0,0,20,20, 20,30,10,0,0,10,30,20]
};

function evaluate(s){
  let score = 0;
  const b = s.board;
  for (let i = 0; i < 64; i++){
    const p = b[i];
    if (!p) continue;
    const t = p[1];
    const idx = p[0] === 'w' ? i : ((7 - (i >> 3)) * 8 + (i & 7));
    const v = VAL[t] + PST[t][idx];
    score += p[0] === 'w' ? v : -v;
  }
  return s.turn === 'w' ? score : -score;
}

function order(moves){
  return moves.sort((a, b) => score(b) - score(a));
  function score(m){ return (m.cap ? 10 * VAL[m.cap[1]] - VAL[m.piece[1]] + 1000 : 0) + (m.promo ? VAL[m.promo] : 0); }
}

function quiesce(s, alpha, beta, qd){
  const stand = evaluate(s);
  if (stand >= beta) return stand;
  if (stand > alpha) alpha = stand;
  if (qd === 0) return alpha;
  for (const m of order(legal(s).filter(m => m.cap || m.promo))){
    const v = -quiesce(apply(s, m), -beta, -alpha, qd - 1);
    if (v >= beta) return v;
    if (v > alpha) alpha = v;
  }
  return alpha;
}

function search(s, depth, alpha, beta, qd){
  const moves = legal(s);
  if (!moves.length) return inCheck(s) ? -(100000 + depth) : 0;
  if (s.half >= 100) return 0;
  if (depth === 0) return qd ? quiesce(s, alpha, beta, qd) : evaluate(s);
  for (const m of order(moves)){
    const v = -search(apply(s, m), depth - 1, -beta, -alpha, qd);
    if (v >= beta) return v;
    if (v > alpha) alpha = v;
  }
  return alpha;
}

function bestMove(s, cfg){
  const moves = legal(s);
  if (!moves.length) return null;
  for (let i = moves.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [moves[i], moves[j]] = [moves[j], moves[i]]; }
  order(moves);
  let best = null, bestV = -Infinity, alpha = -Infinity;
  for (const m of moves){
    let v = -search(apply(s, m), cfg.depth - 1, -Infinity, -alpha, cfg.qd);
    if (cfg.noise) v += (Math.random() * 2 - 1) * cfg.noise;
    if (v > bestV){ bestV = v; best = m; }
    if (!cfg.noise && v > alpha) alpha = v;
  }
  return best;
}

// Quick analysis without Stockfish: score (side to move, centipawns) and best move at a shallow depth
function quickAnalyse(s){
  const moves = order(legal(s));
  if (!moves.length) return {best:null, score: inCheck(s) ? {mate:0} : {cp:0}};
  let best = moves[0], alpha = -Infinity;
  for (const m of moves){
    const v = -search(apply(s, m), 1, -Infinity, -alpha, 3);
    if (v > alpha){ alpha = v; best = m; }
  }
  if (Math.abs(alpha) > 90000) return {best: uci(best), score: {mate: alpha > 0 ? 1 : -1}};
  return {best: uci(best), score: {cp: alpha}};
}

/* ---------- Mate solver (puzzles and lessons accept any move that still forces mate) ---------- */
function givesCheck(s, m){ const n = apply(s, m); return inCheck(n); }

// Side to move can force mate within n of its own moves
function forcesMate(s, n){
  if (n <= 0) return false;
  let moves = legal(s);
  if (n === 1) moves = moves.filter(m => givesCheck(s, m));
  else moves.sort((a, b) => (givesCheck(s, b) ? 2 : b.cap ? 1 : 0) - (givesCheck(s, a) ? 2 : a.cap ? 1 : 0));
  for (const m of moves) if (isMatedWithin(apply(s, m), n - 1)) return true;
  return false;
}
// Side to move gets mated within n more moves of the attacker, whatever it plays
function isMatedWithin(s, n){
  const moves = legal(s);
  if (!moves.length) return inCheck(s);
  if (n <= 0) return false;
  for (const m of moves) if (!forcesMate(apply(s, m), n)) return false;
  return true;
}
const isMate = s => !legal(s).length && inCheck(s);

/* ---------- Stockfish wrapper ---------- */
// Tries, in order: Stockfish 17.1 lite (NNUE, with a calibrated strength setting, UCI_Elo), the same build embedded
// in a single-file copy of the app, then the older Stockfish 10 builds (WebAssembly, asm.js, blob, cdnjs) for
// browsers that can't run 17.1. Searches run one at a time.
const SF_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.2/stockfish.js';
const Engine = {
  status:'off', kind:null, worker:null, ready:null, queue:Promise.resolve(), onLine:null, listeners:[],
  onStatus(fn){ this.listeners.push(fn); },
  setStatus(st){ this.status = st; for (const fn of this.listeners) try { fn(st); } catch (_) {} },
  boot(){
    if (this.ready) return this.ready;
    // 'blob' fetches the local asm.js build and starts it from memory (for app wrappers whose
    // WebView won't start workers from local files)
    const spawn = async kind => {
      if (kind === 'sf17') return new Worker('sf17-lite.js');
      if (kind === 'sf17blob'){
        const js = document.getElementById('sf17-src'), wa = document.getElementById('sf17-wasm');
        if (!js || !wa) throw new Error('not embedded');
        // A page opened from a file can't let a worker fetch anything, so the worker gets the engine binary up front
        const pre = `self.__sfw=(()=>{const s=atob(${JSON.stringify(wa.textContent.trim())}),u=new Uint8Array(s.length);for(let i=0;i<s.length;i++)u[i]=s.charCodeAt(i);return u})();`;
        const src = js.textContent.split('r={locateFile:').join('r={wasmBinary:self.__sfw,locateFile:');
        return new Worker(URL.createObjectURL(new Blob([pre, src], {type:'text/javascript'})));
      }
      if (kind === 'wasm') return new Worker('stockfish.wasm.js');
      if (kind === 'asm') return new Worker('stockfish.js');
      if (kind === 'blob'){
        const r = await fetch('stockfish.js');
        if (!r.ok) throw new Error('no local engine');
        return new Worker(URL.createObjectURL(new Blob([await r.text()], {type:'text/javascript'})));
      }
      return new Worker(URL.createObjectURL(new Blob([`importScripts(${JSON.stringify(SF_CDN)});`], {type:'text/javascript'})));
    };
    const handshake = kind => new Promise(async (resolve, reject) => {
      let w;
      try { w = await spawn(kind); } catch (e) { reject(e); return; }
      const fail = () => { clearTimeout(timer); w.terminate(); reject(new Error('engine failed')); };
      const timer = setTimeout(fail, kind === 'wasm' ? 12000 : kind === 'sf17blob' ? 20000 : 30000);
      w.onerror = fail;
      w.onmessage = e => {
        const line = String(e.data).trim();
        if (line === 'uciok'){ clearTimeout(timer); w.onerror = null; resolve(w); }
        else if (/abort|CompileError|failed to asynchronously prepare/i.test(line)) fail();
      };
      w.postMessage('uci');
    });
    // `ready` must exist before any status listener runs, because listeners may call boot() again
    let settle;
    this.ready = new Promise(r => { settle = r; });
    this.setStatus('loading');
    (async () => {
      const kinds = (typeof WebAssembly === 'object' ? ['sf17', 'sf17blob', 'wasm'] : []).concat(['asm', 'blob', 'cdn']);
      for (const kind of kinds){
        try {
          const w = await handshake(kind);
          w.onmessage = e => { if (this.onLine) this.onLine(String(e.data)); };
          this.worker = w;
          this.kind = kind;
          settle(true);
          this.setStatus('ready');
          return;
        } catch (_) {}
      }
      settle(false);
      this.setStatus('failed');
    })();
    return this.ready;
  },
  newGame(){ if (this.worker) this.worker.postMessage('ucinewgame'); },
  // Stockfish 17.1 is the strong, calibrated engine; the older builds are fallbacks
  get modern(){ return this.kind === 'sf17' || this.kind === 'sf17blob'; },
  get fast(){ return this.modern || this.kind === 'wasm'; },
  // position: a full UCI 'position …' command. Returns {best, lines:[{score:{cp}|{mate}, pv:[uci…]}]} with scores for the side to move.
  // ms = 0 searches to `depth` with no time limit (complete iterations only, so scores are reliable).
  // elo (Stockfish 17.1 only): play at that calibrated strength (1320–3190); 0 = full strength.
  search(position, {skill = 20, depth = 0, ms = 1000, multipv = 1, searchmoves = null, elo = 0} = {}){
    const job = this.queue.then(() => new Promise(resolve => {
      const lines = [];
      const timer = setTimeout(() => { this.onLine = null; resolve(null); }, (ms || 60000) + 30000);
      this.onLine = line => {
        if (line.startsWith('info') && line.includes(' pv ') && line.includes(' score ')){
          const k = +(/ multipv (\d+)/.exec(line) || [0, 1])[1] - 1;
          const sc = / score (cp|mate) (-?\d+)/.exec(line);
          if (!sc || / (lowerbound|upperbound)/.test(line)) return;
          lines[k] = {score: sc[1] === 'cp' ? {cp:+sc[2]} : {mate:+sc[2]}, pv: line.split(' pv ')[1].trim().split(/\s+/)};
        } else if (line.startsWith('bestmove')){
          clearTimeout(timer);
          this.onLine = null;
          const mv = line.split(/\s+/)[1];
          resolve({best: mv && mv !== '(none)' ? mv : null, lines: lines.filter(Boolean)});
        }
      };
      const w = this.worker;
      if (this.modern){
        w.postMessage(`setoption name UCI_LimitStrength value ${elo ? 'true' : 'false'}`);
        // The lite build plays below its setting (measured against full Stockfish 17.1 at the same UCI_Elo:
        // about 55–110 points weaker up to 2400, about 190 weaker at 2800), so the setting is raised to match.
        if (elo) w.postMessage(`setoption name UCI_Elo value ${Math.max(1320, Math.min(3190, Math.round(elo + (elo < 2500 ? 80 : 80 + (elo - 2500) * 0.4))))}`);
      } else w.postMessage(`setoption name Skill Level value ${skill}`);
      w.postMessage(`setoption name MultiPV value ${multipv}`);
      w.postMessage(position);
      w.postMessage((ms ? `go movetime ${Math.max(30, Math.round(ms))}` + (depth ? ` depth ${depth}` : '') : `go depth ${depth || 10}`) +
                    (searchmoves ? ` searchmoves ${searchmoves}` : ''));
    }));
    this.queue = job.catch(() => {});
    return job;
  }
};

window.Chess = {
  FILES, VAL, START_FEN, opp, sqName, sqIndex, fromFEN, toFEN, initState, attacked, findKing, inCheck,
  legal, apply, san, uci, fromUci, fromSan, toPGN, parsePGN, posKey, insufficient, evaluate, bestMove, quickAnalyse,
  forcesMate, isMatedWithin, isMate, givesCheck, Engine
};
})();
