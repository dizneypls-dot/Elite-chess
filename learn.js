/* Elite Chess: home, puzzles, courses and lessons, library, opening explorer, analysis board, profile, settings. */
(() => {
const GW = window.GW;
const {C, D, LRN, $, esc, sleep, NAME, avatarSVG, sfx, moveKind, Board, slidesFor, profile, saveProfile, Task, clamp, ICON} = GW;
const {opp, legal, apply, san, uci, fromUci, inCheck, Engine} = C;

GW.copyText = async (text, msg) => {
  try { await navigator.clipboard.writeText(text); GW.toast(msg || 'Copied'); }
  catch (_) {
    const m = GW.modal(`<h2>Copy</h2><textarea class="textbox" rows="8" readonly>${esc(text)}</textarea><button class="btn pop" id="cpOk" type="button">Done</button>`);
    const ta = m.querySelector('textarea'); ta.focus(); ta.select();
    m.querySelector('#cpOk').addEventListener('click', () => GW.closeModal());
  }
};
const feedback = (el, kind, html) => { el.hidden = !kind; if (kind){ el.className = 'feedback ' + kind; el.innerHTML = html; } };
const OK = html => `<span class="ic">✓</span><div>${html}</div>`;
const BAD = html => `<span class="ic">✕</span><div>${html}</div>`;
const greeting = () => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'; };
const lessonCount = () => Object.entries(profile.lessons).filter(([id, n]) => { const L = findLesson(id); return L && n >= L.lesson.steps.length; }).length;
function findLesson(id){ for (const c of LRN.COURSES){ const l = c.lessons.find(x => x.id === id); if (l) return {course:c, lesson:l}; } return null; }
function ratingChart(w = 320, h = 90){
  const pts = [{r: profile.history.length ? profile.history[0].r : profile.rating}, ...profile.history].map(p => p.r);
  if (pts.length < 2) return `<svg class="chart" viewBox="0 0 ${w} ${h}"><text x="${w / 2}" y="${h / 2}" text-anchor="middle" fill="currentColor" opacity=".55" font-size="13">Play rated games to see your progress</text></svg>`;
  const lo = Math.min(...pts) - 20, hi = Math.max(...pts) + 20;
  const x = i => i / (pts.length - 1) * (w - 8) + 4, y = v => h - 6 - (v - lo) / (hi - lo) * (h - 12);
  const d = pts.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  return `<svg class="chart" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><defs><linearGradient id="cg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#8b7cff" stop-opacity=".45"/><stop offset="1" stop-color="#8b7cff" stop-opacity="0"/></linearGradient></defs>` +
    `<path d="${d} L${x(pts.length - 1).toFixed(1)},${h} L${x(0).toFixed(1)},${h} Z" fill="url(#cg)"/><path d="${d}" fill="none" stroke="#8b7cff" stroke-width="2.5" vector-effect="non-scaling-stroke"/></svg>`;
}
const dailyPuzzle = () => {
  const day = Math.floor(Date.now() / 86400000), pool = GW.BANK.filter(p => p.rating >= 1200 && p.rating <= 1900);
  return pool[(day * 7919) % pool.length];
};

/* ============================== HOME ============================== */
// Seasonal pack, the world title match and followed players, between the hero and the goals
function homeExtras(){
  const p = GW.currentPack(), on = p && GW.settings.fxPack === p.id;
  const sp = GW.worldSpotlight && GW.worldSpotlight();
  let out = '<div class="home-row">';
  if (p) out += `<button class="season-card" type="button" data-go="${on ? 'customize' : 'pack'}" data-pk="${p.id}"><span class="season-ico">${p.icon}</span><div class="grow"><div class="kicker">${on ? 'Theme on' : 'New theme'}</div><b>${esc(p.name)}</b><div class="muted small">${esc(p.line)}</div></div><span class="btn ${on ? 'ghost' : 'pop'}">${on ? 'Customize' : 'Try it'}</span></button>`;
  if (sp){
    const first = new Date(sp.firstGame + 'T12:00:00'), end = new Date(sp.to + 'T23:59:00'), now = new Date(), days = Math.ceil((first - now) / 86400000);
    if (now <= end) out += `<button class="season-card wc" type="button" data-go="world"><span class="season-ico">👑</span><div class="grow"><div class="kicker">${now >= first ? 'Live now' : `${days} day${days === 1 ? '' : 's'} to go`}</div><b>${esc(sp.players.map(x => x.name).join(' vs '))}</b><div class="muted small">World Championship · ${esc(sp.place.split(',').slice(-2).join(',').trim())}</div></div><span class="btn ghost">Follow</span></button>`;
  }
  out += '</div>';
  const fav = GW.followed ? GW.followed() : [];
  if (fav.length) out += `<section class="goals-card"><div class="row"><div class="grow"><div class="kicker">Players you follow</div></div><button class="btn ghost" type="button" data-go="world">Rankings →</button></div><div class="fav-row">${fav.map(f => `<div class="fav"><b>${f.flag} ${esc(f.name)}</b><span class="muted small">#${f.rank} · ${f.rating}</span></div>`).join('')}</div></section>`;
  return out;
}
function renderHome(){
  const g = GW.currentGame && GW.currentGame();
  const active = g && !g.over;
  const delta = profile.history.length >= 2 ? profile.rating - profile.history[Math.max(0, profile.history.length - 6)].r : 0;
  const nextLesson = (() => { for (const c of LRN.COURSES) for (const l of c.lessons) if ((profile.lessons[l.id] || 0) < l.steps.length) return {c, l}; return null; })();
  const dp = dailyPuzzle();
  const cupsWon = Object.values(profile.trophies).filter(m => m === 'gold').length;
  const goals = GW.dailyGoals(), lvl = GW.levelOf(profile.xp), base = GW.xpForLevel(lvl), next = GW.xpForLevel(lvl + 1);
  const lvlPct = Math.round(((profile.xp || 0) - base) / (next - base) * 100);
  const goalsDone = goals.filter(g => g.done).length;
  const goalGo = {win:'setup', game:'setup', puzzle:'puzzles', daily:'puzzles', lesson:'learn', rush:'rush', review:'history', online:'setup'};
  $('scr-home').innerHTML = `
  <div class="home">
    <section class="hero">
      <div class="hero-me"><div class="av big">${avatarSVG(GW.me())}</div><div><div class="muted">${greeting()},</div><h1>${esc(profile.name || 'Player')}</h1>
        <div class="hero-stats"><span class="rating-chip big"><b>${profile.rating}</b> rating ${delta ? `<i class="${delta > 0 ? 'up' : 'down'}">${delta > 0 ? '▲' : '▼'} ${Math.abs(delta)}</i>` : ''}</span><span class="pill">${profile.wins}W · ${profile.draws}D · ${profile.losses}L</span><span class="pill">🧩 ${profile.puzzleRating}</span><span class="pill lvl" title="${profile.xp || 0} XP">Level ${lvl}</span>${GW.dayStreak() ? `<span class="pill streak">🔥 ${GW.dayStreak()} day${GW.dayStreak() > 1 ? 's' : ''}</span>` : ''}</div></div></div>
      ${profile.history.length >= 2 ? `<div class="hero-chart">${ratingChart(360, 96)}</div>` : '<div class="hero-chart empty"><div class="hero-tip">Win rated games to climb. Your rating graph appears here.</div></div>'}
      <div class="hero-cta">${active ? '<button class="btn pop big" id="hmContinue" type="button">Continue game</button>' : ''}<button class="btn ${active ? 'violet' : 'pop'} big" id="hmPlay" type="button">Play a bot</button></div>
    </section>
    ${homeExtras()}
    <section class="goals-card">
      <div class="goals-head"><div><div class="kicker">Today’s goals</div><h2>${goalsDone === 3 ? 'All done. See you tomorrow!' : `${goalsDone} of 3 done`}</h2></div>
        <div class="xpbox"><div class="xpline"><b>Level ${lvl}</b><span>${(profile.xp || 0) - base} / ${next - base} XP</span></div><div class="bar"><div style="width:${lvlPct}%"></div></div></div></div>
      <div class="goal-list">${goals.map(g => `<button class="goal${g.done ? ' done' : ''}" type="button" data-go="${goalGo[g.id]}"><span class="goal-tick">${g.done ? '✓' : ''}</span><span class="grow"><b>${esc(g.text)}</b><span class="bar"><div style="width:${Math.round(g.n / g.need * 100)}%"></div></span></span><span class="goal-xp">+${g.xp}</span></button>`).join('')}</div>
      <div class="muted small">Finish all three for a 75 XP bonus. New goals every day.</div>
    </section>
    <section class="tiles">
      <button class="tile-card" data-go="puzzles" type="button"><div class="mini-wrap">${GW.miniBoard(dp.fen, dp.fen.split(' ')[1] === 'w')}</div><div><div class="kicker">Daily puzzle</div><h3>Rated ${dp.rating}</h3><p>${esc(dp.themes.filter(t => GW.THEME_LABEL[t]).slice(0, 2).map(t => GW.THEME_LABEL[t]).join(' · '))}</p></div></button>
      <button class="tile-card" data-go="rush" type="button"><div class="tile-ico" style="--c:#ef476f">⚡</div><div><div class="kicker">Puzzle Rush</div><h3>Best: ${profile.rushBest}</h3><p>Three minutes, three strikes.</p></div></button>
      <button class="tile-card" data-go="cups" type="button"><div class="tile-ico" style="--c:#ffb627">${GW.trophySVG('#ffb627')}</div><div><div class="kicker">Cups</div><h3>${cupsWon} / ${D.CUPS.length} won</h3><p>Knockout tournaments vs the bots.</p></div></button>
      <button class="tile-card" data-go="learn" type="button"><div class="tile-ico" style="--c:#22c55e">📘</div><div><div class="kicker">${nextLesson ? 'Next lesson' : 'Learn'}</div><h3>${nextLesson ? esc(nextLesson.l.title) : 'All done!'}</h3><p>${nextLesson ? esc(nextLesson.c.title) : 'Every lesson completed.'}</p></div></button>
      <button class="tile-card" data-go="kids" type="button"><div class="tile-ico" style="--c:#ff7eb3">⭐</div><div><div class="kicker">Kids Academy</div><h3>Learn with stars</h3><p>Games for young players.</p></div></button>
      <button class="tile-card" data-go="openings" type="button"><div class="tile-ico" style="--c:#a855f7">📖</div><div><div class="kicker">Openings</div><h3>${(window.GW_OPENINGS || []).length.toLocaleString()} lines</h3><p>Explore and practise.</p></div></button>
      <button class="tile-card" data-go="analysis" type="button"><div class="tile-ico" style="--c:#3b82f6">🔍</div><div><div class="kicker">Analysis board</div><h3>Best computer moves</h3><p>Stockfish lines for any position.</p></div></button>
      <button class="tile-card" data-go="world" type="button"><div class="tile-ico" style="--c:#0ea5e9">🌍</div><div><div class="kicker">World chess</div><h3>FIDE top 25</h3><p>Rankings, the title match and events.</p></div></button>
      <button class="tile-card" data-go="legends" type="button"><div class="tile-ico" style="--c:#b45309">🏛️</div><div><div class="kicker">Legends</div><h3>Stories & history</h3><p>Champions and the immortal games.</p></div></button>
      <button class="tile-card" data-go="customize" type="button"><div class="tile-ico" style="--c:#ec4899">🎨</div><div><div class="kicker">Customize</div><h3>Boards & pieces</h3><p>Seasonal themes and real sounds.</p></div></button>
      <button class="tile-card" data-go="profile" type="button"><div class="tile-ico" style="--c:#14b8a6">🏅</div><div><div class="kicker">Achievements</div><h3>${profile.achievements.length} / ${D.ACHIEVEMENTS.length}</h3><p>Badges and your trophy cabinet.</p></div></button>
    </section>
    <section class="bot-strip"><div class="row"><h2 class="grow">Challenge a bot</h2><button class="btn ghost" data-go="setup" type="button">All bots →</button></div>
      <div class="strip">${D.BOTS.filter(b => Math.abs(b.elo - profile.rating) < 450).slice(0, 8).map(b => `<button class="strip-bot" data-bot="${D.BOTS.indexOf(b)}" type="button"><div class="av">${avatarSVG(b)}</div><b>${b.name}</b><span>${b.elo}</span></button>`).join('')}</div></section>
  </div>`;
  $('hmContinue')?.addEventListener('click', () => GW.show('game'));
  $('hmPlay').addEventListener('click', () => GW.show('setup'));
}
$('scr-home').addEventListener('click', e => {
  const b = e.target.closest('[data-go],[data-bot]');
  if (!b) return;
  if (b.dataset.bot) return GW.show('setup', {bot:+b.dataset.bot});
  const go = b.dataset.go;
  if (go === 'rush') return GW.show('puzzles', {mode:'rush'});
  if (go === 'puzzles') return GW.show('puzzles', {mode:'daily'});
  if (go === 'kids') return GW.show('learn', {course:'kids'});
  if (go === 'pack'){ GW.applyPack(D.PACKS.find(p => p.id === b.dataset.pk)); GW.applySettings(); sfx.success(); return renderHome(); }
  GW.show(go);
});
GW.register('home', {onShow: renderHome});

/* ============================== PUZZLES ============================== */
$('scr-puzzles').innerHTML = `
<div class="play">
  <div class="board-col"><div class="pz-top" id="pzTop"></div><div id="puzzleBoard"></div></div>
  <aside class="panel">
    <div class="tabs" id="pzTabs"><button type="button" data-v="rated">Rated</button><button type="button" data-v="rush">Rush</button><button type="button" data-v="themes">Themes</button><button type="button" data-v="daily">Daily</button></div>
    <div id="pzBody"></div>
  </aside>
</div>`;
let PZ = {mode:'rated', task:null, puzzle:null, theme:null, rush:null};
const puzzleBoard = new Board($('puzzleBoard'), {canMove: () => PZ.task && PZ.task.canMove(), onMove: (m, d) => PZ.task && PZ.task.handle(m, d)});
function pzStats(){
  return `<div class="stat-row"><div class="stat"><b>${profile.puzzleRating}</b><span>Rating</span></div><div class="stat"><b>${profile.streak}</b><span>Streak</span></div><div class="stat"><b>${profile.solved.length}</b><span>Solved</span></div></div>`;
}
function prompt(side, p){
  const mate = p.themes.find(t => /^mateIn/.test(t));
  return `<div class="prompt"><span class="pc pc-${side}K"></span><div>${NAME[side]} to move<div class="muted" style="font-size:14px;font-weight:600">${mate ? `Find ${GW.THEME_LABEL[mate].toLowerCase()}` : 'Find the best move'}</div></div></div>`;
}
function renderPuzzles(){
  $('pzTabs').querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === PZ.mode)));
  if (PZ.mode === 'themes' && !PZ.theme) return renderThemes();
  if (PZ.mode === 'rush' && !PZ.rush) return renderRushStart();
  if (!PZ.task || PZ.needNew) loadNextPuzzle();
}
function rateSolve(p, won){
  const e = 1 / (1 + Math.pow(10, (p.rating - profile.puzzleRating) / 400));
  const d = Math.round(20 * ((won ? 1 : 0) - e));
  profile.puzzleRating = Math.max(100, profile.puzzleRating + d);
  return d;
}
function afterSolve(p, won){
  GW.markDay();
  if (won){ GW.track('puzzle'); if (PZ.mode === 'daily') GW.track('daily'); profile.xp = (profile.xp || 0) + 4; }
  profile.streak = won ? profile.streak + 1 : 0;
  profile.bestStreak = Math.max(profile.bestStreak || 0, profile.streak);
  if (won && !profile.solved.includes(p.id)){ profile.solved.push(p.id); if (profile.solved.length > 3000) profile.solved.shift(); }
  if (profile.solved.length >= 10) GW.unlock('puzzles-10');
  if (profile.solved.length >= 100) GW.unlock('puzzles-100');
  if (profile.streak >= 10) GW.unlock('streak-10');
  saveProfile();
}
function loadNextPuzzle(p){
  PZ.needNew = false;
  if (!p){
    if (PZ.mode === 'daily') p = dailyPuzzle();
    else if (PZ.mode === 'rush') p = GW.pickPuzzle({target: PZ.rush.level, skip: PZ.rush.seen});
    else p = GW.pickPuzzle({target: profile.puzzleRating, theme: PZ.mode === 'themes' ? PZ.theme : null, skip: profile.solved.slice(-1500)});
  }
  PZ.puzzle = p;
  let rated = PZ.mode === 'rated', counted = false;
  const body = $('pzBody');
  const head = PZ.mode === 'rush' ? rushHead() : PZ.mode === 'themes' ? `<div class="row"><button class="btn ghost" id="pzThemesBack" type="button">← Themes</button><b>${esc(GW.THEME_LABEL[PZ.theme])}</b></div>` : PZ.mode === 'daily' ? `<div class="kicker">Daily puzzle · ${new Date().toLocaleDateString()}</div>` : pzStats();
  body.innerHTML = `${head}<div id="pzPrompt"></div><div class="feedback info" id="pzFb"><div>Watch your opponent’s move, then find the best reply.</div></div>
    <div class="row"><button class="btn grow" id="pzHint" type="button">Hint</button><button class="btn grow" id="pzSol" type="button">Solution</button><button class="btn grow" id="pzRetry" type="button">Retry</button></div>
    <button class="btn pop big" id="pzNext" type="button">${PZ.mode === 'rush' ? 'Skip' : 'Next puzzle'}</button>
    <div class="muted small">Puzzle from the lichess.org open database (CC0) · rated ${p.rating}</div>`;
  const fb = $('pzFb');
  const count = won => {
    if (counted) return;
    counted = true;
    if (PZ.mode === 'rush') return rushResult(won);
    const d = rated ? rateSolve(p, won) : null;
    afterSolve(p, won);
    return d;
  };
  PZ.task = new Task(puzzleBoard, GW.bankSpec(p), {
    onReady: () => { $('pzPrompt').innerHTML = prompt(PZ.task.solver, p); },
    onWrong: () => { const d = count(false); feedback(fb, 'bad', BAD(`Not quite. Try again.${d != null ? ` <span class="muted">(${d})</span>` : ''}`)); },
    onProgress: () => { if (PZ.task.s.turn === PZ.task.solver) feedback(fb, 'ok', OK('Good move. Keep going!')); },
    onSolved: failed => {
      const d = count(!failed);
      const themes = p.themes.filter(t => GW.THEME_LABEL[t] && !['short', 'long', 'veryLong', 'oneMove', 'crushing', 'advantage', 'equality', 'middlegame', 'opening', 'endgame'].includes(t)).slice(0, 3).map(t => GW.THEME_LABEL[t]).join(' · ');
      feedback(fb, failed ? 'info' : 'ok', `<span class="ic" style="background:var(--good)">✓</span><div>${failed ? 'Solved with help.' : 'Correct!'} <span class="muted">${esc(themes)}${d != null && !failed ? ` · +${d}` : ''}</span></div>`);
      if (!failed) sfx.success();
      if (PZ.mode === 'rush') setTimeout(() => { if (PZ.rush && !PZ.rush.over) loadNextPuzzle(); }, 600);
      else renderTop();
      if (PZ.mode === 'rated') $('pzBody').querySelector('.stat-row').outerHTML = pzStats();
    }
  });
  $('pzHint').addEventListener('click', () => { count(false); PZ.task.hint(); });
  $('pzSol').addEventListener('click', () => { count(false); PZ.task.solution(); });
  $('pzRetry').addEventListener('click', () => loadNextPuzzle(p));
  $('pzNext').addEventListener('click', () => { if (PZ.mode === 'rush'){ count(false); if (PZ.rush && !PZ.rush.over) loadNextPuzzle(); } else loadNextPuzzle(); });
  $('pzThemesBack')?.addEventListener('click', () => { PZ.theme = null; PZ.task = null; renderPuzzles(); });
  if (PZ.mode === 'rush'){ $('pzHint').hidden = $('pzSol').hidden = $('pzRetry').hidden = true; }
  renderTop();
}
function renderTop(){
  const t = $('pzTop');
  if (PZ.mode === 'rush' && PZ.rush) t.innerHTML = `<div class="rush-bar"><span class="rush-score">${PZ.rush.score}</span><span class="rush-strikes">${'✕'.repeat(PZ.rush.strikes)}${'○'.repeat(3 - PZ.rush.strikes)}</span><span class="rush-time" id="rushTime"></span></div>`;
  else t.innerHTML = '';
}
function renderThemes(){
  puzzleBoard.set(C.initState());
  const counts = {};
  for (const p of GW.BANK) for (const t of p.themes) counts[t] = (counts[t] || 0) + 1;
  const list = Object.keys(GW.THEME_LABEL).filter(t => counts[t] >= 8 && !['short', 'long', 'veryLong', 'oneMove', 'crushing', 'advantage', 'equality', 'mate', 'master', 'superGM'].includes(t));
  $('pzBody').innerHTML = `<h2>Practise by theme</h2><div class="muted">Pick a motif. These puzzles don’t change your rating.</div><div class="theme-chips">${list.map(t => `<button class="chip-btn" type="button" data-t="${t}">${esc(GW.THEME_LABEL[t])} <span class="muted">${counts[t]}</span></button>`).join('')}</div>`;
  $('pzTop').innerHTML = '';
}
$('pzBody').addEventListener('click', e => { const b = e.target.closest('[data-t]'); if (b){ PZ.theme = b.dataset.t; loadNextPuzzle(); } });
/* --- Puzzle Rush --- */
function renderRushStart(){
  puzzleBoard.set(C.initState());
  $('pzTop').innerHTML = '';
  $('pzBody').innerHTML = `<div class="rush-intro"><div class="rush-ico">⚡</div><h2>Puzzle Rush</h2><p class="muted">Solve as many puzzles as you can in 3 minutes. They get harder as you go. Three mistakes and you’re out.</p><div class="stat-row one"><div class="stat"><b>${profile.rushBest}</b><span>Personal best</span></div></div><button class="btn pop big" id="rushGo" type="button">Start</button></div>`;
  $('rushGo').addEventListener('click', startRush);
}
function startRush(){
  PZ.rush = {score:0, strikes:0, level:600, seen:[], end:performance.now() + 180000, over:false};
  clearInterval(PZ.rushTimer);
  PZ.rushTimer = setInterval(() => {
    const r = PZ.rush;
    if (!r || r.over) return clearInterval(PZ.rushTimer);
    const left = Math.max(0, r.end - performance.now());
    const el = $('rushTime');
    if (el) el.textContent = `${Math.floor(left / 60000)}:${String(Math.floor(left / 1000) % 60).padStart(2, '0')}`;
    if (left <= 0) endRush();
  }, 200);
  loadNextPuzzle();
}
const rushHead = () => `<div class="kicker">Puzzle Rush</div>`;
function rushResult(won){
  const r = PZ.rush;
  r.seen.push(PZ.puzzle.id);
  if (won){ r.score++; r.level += 70; }
  else { r.strikes++; if (r.strikes >= 3) setTimeout(endRush, 500); else setTimeout(() => { if (!r.over) loadNextPuzzle(); }, 800); }
  renderTop();
}
function endRush(){
  const r = PZ.rush;
  if (!r || r.over) return;
  r.over = true;
  clearInterval(PZ.rushTimer);
  if (PZ.task) PZ.task.done = true;
  const best = r.score > profile.rushBest;
  profile.rushBest = Math.max(profile.rushBest, r.score);
  GW.track('rush', r.score);
  if (r.score >= 15) GW.unlock('rush-15');
  saveProfile();
  sfx.end();
  const m = GW.modal(`<h2>${best ? 'New best!' : 'Time!'}</h2><div class="sub">Puzzle Rush</div><div class="big-num">${r.score}</div><div class="muted" style="text-align:center">Personal best: ${profile.rushBest}</div><div class="row"><button class="btn grow" id="rushDone" type="button">Done</button><button class="btn pop grow" id="rushAgain" type="button">Play again</button></div>`);
  m.querySelector('#rushAgain').addEventListener('click', () => { GW.closeModal(); startRush(); });
  m.querySelector('#rushDone').addEventListener('click', () => { GW.closeModal(); PZ.rush = null; PZ.task = null; renderPuzzles(); });
}
$('pzTabs').addEventListener('click', e => {
  const b = e.target.closest('button');
  if (!b) return;
  if (PZ.rush && !PZ.rush.over){ PZ.rush.over = true; clearInterval(PZ.rushTimer); }   // leaving Rush quietly
  PZ = {mode:b.dataset.v, task:null, puzzle:null, theme:null, rush:null};
  renderPuzzles();
});
GW.register('puzzles', {onShow: arg => { if (arg && arg.mode){ PZ = {mode:arg.mode, task:null, puzzle:null, theme:null, rush:null}; } renderPuzzles(); },
  onHide: () => { if (PZ.rush && !PZ.rush.over){ PZ.rush.over = true; clearInterval(PZ.rushTimer); PZ.rush = null; PZ.task = null; } }});

/* ============================== LEARN: courses ============================== */
$('scr-learn').innerHTML = `<div id="learnBody"></div>`;
let learnCourse = null;
function courseProgress(c){
  let done = 0, total = 0;
  for (const l of c.lessons){ total += l.steps.length; done += Math.min(l.steps.length, profile.lessons[l.id] || 0); }
  return {done, total, pct: total ? done / total : 0};
}
function renderLearn(){
  const body = $('learnBody');
  if (learnCourse){
    const c = LRN.COURSES.find(x => x.id === learnCourse);
    body.innerHTML = `<div class="page-head"><div><button class="btn ghost" id="lrBack" type="button">← All courses</button><h1 style="margin-top:6px">${esc(c.title)}</h1><div class="muted">${esc(c.blurb)} · ${esc(c.level)}</div></div></div>
      <div class="lesson-list${c.kids ? ' kids' : ''}">${c.lessons.map((l, i) => { const d = Math.min(l.steps.length, profile.lessons[l.id] || 0); return `<button class="lesson-row" type="button" data-l="${l.id}" style="--c:${c.color}"><span class="num">${d >= l.steps.length ? '✓' : i + 1}</span><span class="grow"><b>${esc(l.title)}</b><span class="muted">${l.steps.length} steps${d && d < l.steps.length ? ` · ${d} done` : ''}</span></span><span class="bar"><div style="width:${d / l.steps.length * 100}%"></div></span></button>`; }).join('')}</div>`;
    $('lrBack').addEventListener('click', () => { learnCourse = null; renderLearn(); });
    return;
  }
  body.innerHTML = `<div class="page-head"><div><h1>Learn</h1><div class="muted">${LRN.COURSES.reduce((a, c) => a + c.lessons.length, 0)} interactive lessons, from your first move to grandmaster technique.</div></div><div class="pill">${lessonCount()} lessons completed</div></div>
    <div class="course-grid">${LRN.COURSES.map(c => { const p = courseProgress(c); return `<button class="course-card${c.kids ? ' kids' : ''}" type="button" data-c="${c.id}" style="--c:${c.color}"><div class="cc-top"><span class="cc-ico"><span class="pc pc-${c.icon}"></span></span><span class="pill">${esc(c.level)}</span></div><h3>${esc(c.title)}</h3><p>${esc(c.blurb)}</p><div class="bar"><div style="width:${p.pct * 100}%"></div></div><div class="muted small">${c.lessons.length} lessons · ${Math.round(p.pct * 100)}%</div></button>`; }).join('')}</div>
    <div class="page-head" style="margin-top:34px"><div><h2>The classic library</h2><div class="muted">The books strong players recommend, with their key ideas in a nutshell and the lessons that teach them.</div></div></div>
    <div class="book-grid">${LRN.BOOKS.map(b => `<div class="book"><div class="spine" style="--h:${(b.title.length * 37) % 360}"></div><div class="grow"><div class="kicker">${esc(b.level)}</div><h3>${esc(b.title)}</h3><div class="muted small">${esc(b.author)}</div><ul>${b.ideas.map(i => `<li>${esc(i)}</li>`).join('')}</ul><div class="chips">${b.lessons.map(id => { const f = findLesson(id); return f ? `<button class="chip-btn" type="button" data-l="${id}">${esc(f.lesson.title)}</button>` : ''; }).join('')}</div></div></div>`).join('')}</div>
    <p class="credit">Book titles are listed for further reading; the summaries are our own. Buy them from your favourite bookshop.</p>`;
}
$('learnBody').addEventListener('click', e => {
  const c = e.target.closest('[data-c]'), l = e.target.closest('[data-l]');
  if (c){ learnCourse = c.dataset.c; renderLearn(); window.scrollTo(0, 0); }
  else if (l) GW.show('lesson', l.dataset.l);
});
GW.register('learn', {onShow: arg => { if (arg && arg.course) learnCourse = arg.course; renderLearn(); }});

/* ============================== LESSON PLAYER ============================== */
$('scr-lesson').innerHTML = `
<div class="play">
  <div class="board-col"><div style="height:4px"></div><div id="lessonBoard"></div></div>
  <aside class="panel">
    <div class="row"><button class="btn ghost" id="lsBack" type="button">← Lessons</button><span class="grow"></span><span class="pill" id="lsCourse"></span></div>
    <h2 id="lsTitle"></h2>
    <div class="dots" id="lsDots"></div>
    <div class="coach small-coach" id="lsCoach"></div>
    <div id="lsQuiz"></div>
    <div class="feedback info" id="lsFb" hidden></div>
    <div class="row"><button class="btn" id="lsPrev" type="button">Back</button><button class="btn" id="lsHint" type="button">Hint</button><button class="btn" id="lsRetry" type="button">Retry</button><span class="grow"></span><button class="btn ghost" id="lsSkip" type="button">Skip</button></div>
    <button class="btn pop big" id="lsNext" type="button">Next</button>
  </aside>
</div>`;
let LS = null, LT = null;
const lessonBoard = new Board($('lessonBoard'), {canMove: () => LT && LT.canMove(), onMove: (m, d) => LT && LT.handle(m, d)});
function openLesson(id){
  const f = findLesson(id);
  if (!f) return GW.show('learn');
  LS = {course:f.course, lesson:f.lesson, step: Math.min(profile.lessons[id] || 0, f.lesson.steps.length - 1), solved:{}};
  document.body.classList.toggle('kids-mode', !!f.course.kids);
  renderStep();
}
function markStep(k){
  const id = LS.lesson.id;
  const wasDone = (profile.lessons[id] || 0) >= LS.lesson.steps.length;
  profile.lessons[id] = Math.max(profile.lessons[id] || 0, k + 1);
  saveProfile();
  if (!wasDone && profile.lessons[id] >= LS.lesson.steps.length){ GW.markDay(); GW.track('lesson'); GW.addXP(20, 'Lesson complete'); }
  if (lessonCount() >= 10) GW.unlock('lessons-10');
  const kids = LRN.COURSES.find(c => c.id === 'kids');
  if (kids && kids.lessons.every(l => (profile.lessons[l.id] || 0) >= l.steps.length)) GW.unlock('kids');
}
function stepSolved(extra){
  LS.solved[LS.step] = true;
  markStep(LS.step);
  $('lsNext').disabled = false;
  renderDots();
  if (extra) feedback($('lsFb'), 'ok', OK(extra));
}
function renderDots(){
  const L = LS.lesson;
  $('lsDots').innerHTML = L.steps.map((_, k) => `<i class="${k === LS.step ? 'cur' : k < (profile.lessons[L.id] || 0) ? 'done' : ''}"></i>`).join('');
}
function coachSay(text){
  const who = LS.course.kids ? D.PEOPLE.owl : D.PEOPLE.coach;
  $('lsCoach').innerHTML = `<div class="av">${avatarSVG(who)}</div><div class="grow"><b>${esc(who.name)}</b><p>${esc(text)}</p></div>`;
}
function renderStep(){
  const L = LS.lesson, st = L.steps[LS.step];
  LT = null;
  $('lsTitle').textContent = L.title;
  $('lsCourse').textContent = LS.course.title;
  renderDots();
  coachSay(st.text || st.q || '');
  $('lsQuiz').innerHTML = '';
  feedback($('lsFb'), null);
  $('lsPrev').disabled = LS.step === 0;
  const last = LS.step === L.steps.length - 1;
  $('lsNext').textContent = last ? 'Finish lesson' : 'Next';
  const interactive = !['info', 'quiz'].includes(st.t);
  $('lsHint').hidden = $('lsRetry').hidden = !interactive || st.t === 'drill';
  $('lsSkip').hidden = !interactive && st.t !== 'quiz';
  $('lsNext').disabled = !(LS.solved[LS.step] || st.t === 'info' || (profile.lessons[L.id] || 0) > LS.step);
  lessonBoard.host.classList.remove('kids-collect');
  if (st.t === 'info'){
    lessonBoard.flipped = false;
    lessonBoard.set(C.fromFEN(st.fen || C.START_FEN), {arrows:(st.arrows || []).map(([a, b]) => ({from:C.sqIndex(a), to:C.sqIndex(b), color:'g'})), marks:(st.marks || []).map(C.sqIndex)});
    return;
  }
  if (st.t === 'quiz'){
    if (!LS.quizShown) lessonBoard.set(C.fromFEN(st.fen || C.START_FEN));
    $('lsQuiz').innerHTML = `<div class="quiz">${st.options.map((o, i) => `<button class="quiz-opt" type="button" data-i="${i}">${esc(o)}</button>`).join('')}</div>`;
    return;
  }
  if (st.t === 'drill') return startDrill(st);
  let spec;
  if (st.t === 'classic') spec = GW.classicSpec(D.PUZZLES.find(p => p.id === st.id));
  else if (st.t === 'opening') spec = {type:'opening', line:st.line, side:st.side};
  else spec = Object.assign({type:st.t}, st);
  const cbs = {
    onWrong: () => feedback($('lsFb'), 'bad', BAD(st.t === 'opening' ? 'That’s not the book move. Try again.' : 'Not that one. Look again.')),
    onProgress: () => { if (st.t === 'collect') feedback($('lsFb'), 'info', `<div>Moves: ${LT.moves} · Stars left: ${LT.s.board.filter(p => p === 'bP').length}</div>`);
      else if (st.t === 'playout') feedback($('lsFb'), 'info', `<div>Move ${LT.moves} of ${st.limit}${LT.busy ? ' · computer thinking…' : ''}</div>`);
      else if (LT.s.turn === LT.solver) feedback($('lsFb'), 'ok', OK('Right. Keep going.')); },
    onSolved: (failed, info) => {
      let msg = 'Well done!';
      if (st.t === 'collect') msg = `${'⭐'.repeat(info.stars)}${'☆'.repeat(3 - info.stars)} All stars in ${info.moves} moves${info.moves <= st.par ? '. Perfect!' : ` (par ${st.par}).`}`;
      if (st.t === 'playout') msg = st.goal === 'mate' ? `Checkmate in ${info.moves} moves!` : `Promoted in ${info.moves} moves!`;
      if (st.t === 'opening') msg = 'You know this line!';
      stepSolved(msg);
      sfx.success();
    },
    onFail: msg => feedback($('lsFb'), 'bad', BAD(esc(msg) + ' Press Retry.'))
  };
  LT = new Task(lessonBoard, spec, cbs);
  if (st.t === 'collect') feedback($('lsFb'), 'info', `<div>Stars left: ${LT.s.board.filter(p => p === 'bP').length} · Par: ${st.par} moves</div>`);
  if (st.t === 'playout' && !Engine.ready) Engine.boot();
}
/* drills: a short run of bank puzzles on one theme */
function startDrill(st){
  LS.drill = {done:0, count:st.count, skip:[], st};
  nextDrill();
}
function nextDrill(){
  const dr = LS.drill, st = dr.st;
  const p = GW.pickPuzzle({target: clamp(profile.puzzleRating, st.min, st.max), theme: st.theme, min: st.min, max: st.max, skip: dr.skip});
  if (!p){ stepSolved('Drill complete.'); return; }
  dr.skip.push(p.id);
  $('lsQuiz').innerHTML = `<div class="drill-bar"><span>Puzzle ${dr.done + 1} of ${dr.count}</span><span class="muted">${esc(GW.THEME_LABEL[st.theme] || st.theme)} · ${p.rating}</span></div>`;
  feedback($('lsFb'), 'info', '<div>Watch the opponent’s move, then find the best reply.</div>');
  LT = new Task(lessonBoard, GW.bankSpec(p), {
    onWrong: () => feedback($('lsFb'), 'bad', BAD('Not quite. Try again, or use a hint.')),
    onProgress: () => { if (LT.s.turn === LT.solver) feedback($('lsFb'), 'ok', OK('Good. Keep going.')); },
    onSolved: failed => {
      afterSolve(p, !failed);
      dr.done++;
      if (dr.done >= dr.count){ stepSolved(`Drill complete! ${dr.count} puzzles solved.`); sfx.success(); return; }
      feedback($('lsFb'), 'ok', OK(failed ? 'Solved with help.' : 'Correct!'));
      setTimeout(() => { if (LS && LS.drill === dr) nextDrill(); }, 900);
    }
  });
  $('lsHint').hidden = false;
}
$('lsQuiz').addEventListener('click', e => {
  const b = e.target.closest('.quiz-opt');
  if (!b || !LS) return;
  const st = LS.lesson.steps[LS.step], i = +b.dataset.i;
  if (i === st.answer){
    b.classList.add('right');
    $('lsQuiz').querySelectorAll('.quiz-opt').forEach(x => x.disabled = true);
    sfx.correct();
    stepSolved(esc(st.explain));
  } else {
    b.classList.add('wrong'); b.disabled = true;
    sfx.wrong();
    feedback($('lsFb'), 'bad', BAD('Not quite. Try another answer.'));
  }
});
$('lsBack').addEventListener('click', () => { LT = null; document.body.classList.remove('kids-mode'); GW.show('learn'); });
$('lsPrev').addEventListener('click', () => { if (LS.step > 0){ LS.step--; renderStep(); } });
$('lsHint').addEventListener('click', () => { if (LT) LT.hint(); });
$('lsRetry').addEventListener('click', () => { if (LT){ LT.reset(); feedback($('lsFb'), null); } });
$('lsSkip').addEventListener('click', () => { if (LS.step < LS.lesson.steps.length - 1){ LS.step++; renderStep(); } else finishLesson(); });
$('lsNext').addEventListener('click', () => {
  if (LS.lesson.steps[LS.step].t === 'info') markStep(LS.step);
  if (LS.step < LS.lesson.steps.length - 1){ LS.step++; renderStep(); } else finishLesson();
});
function finishLesson(){
  markStep(LS.lesson.steps.length - 1);
  sfx.success();
  const c = LS.course, idx = c.lessons.indexOf(LS.lesson), next = c.lessons[idx + 1];
  const m = GW.modal(`<div class="celebrate"><div class="big-trophy">🎓</div><h2>Lesson complete!</h2><div class="sub">${esc(LS.lesson.title)}</div><div class="stack">${next ? `<button class="btn pop big" id="lnNext" type="button">Next: ${esc(next.title)}</button>` : ''}<button class="btn" id="lnBack" type="button">Back to ${esc(c.title)}</button></div></div>`);
  m.querySelector('#lnNext')?.addEventListener('click', () => { GW.closeModal(); openLesson(next.id); });
  m.querySelector('#lnBack').addEventListener('click', () => { GW.closeModal(); learnCourse = c.id; document.body.classList.remove('kids-mode'); GW.show('learn'); });
}
GW.register('lesson', {onShow: id => openLesson(id), onHide: () => { LT = null; document.body.classList.remove('kids-mode'); }});

/* ============================== OPENING EXPLORER ============================== */
$('scr-openings').innerHTML = `
<div class="play">
  <div class="board-col"><div style="height:4px"></div><div id="openBoard"></div>
    <div class="row" style="margin-top:6px"><button class="btn" id="opBack" type="button">${ICON.prev}Back</button><button class="btn" id="opReset" type="button">Start</button><button class="btn" id="opFlip" type="button">${ICON.flip}Flip</button><span class="grow"></span><button class="btn" id="opAnalyse" type="button">Analyse</button></div>
  </div>
  <aside class="panel">
    <div class="tabs" id="opView"><button type="button" data-v="rep" aria-pressed="true">Best openings</button><button type="button" data-v="exp" aria-pressed="false">Explorer</button></div>
    <input class="search" id="opSearch" type="search" placeholder="Search ${(window.GW_OPENINGS || []).length.toLocaleString()} openings by name or ECO code" autocomplete="off">
    <div id="opBody"></div>
  </aside>
</div>`;
const OP = {moves:[], flipped:false, practice:null, view:'rep', rep:null, filter:'all'};
const REP = window.GW_REPERTOIRE || [];
function repList(){
  const f = OP.filter, list = REP.filter(o => f === 'all' || (f === 'w' || f === 'b' ? o.side === f : o.level === f));
  return `<div class="chips" id="opFilter">${[['all', 'All'], ['w', 'For White'], ['b', 'For Black'], ['Beginner', 'Beginner'], ['Club', 'Club'], ['Advanced', 'Advanced']].map(([v, t]) => `<button class="chip-btn" type="button" data-f="${v}" aria-pressed="${v === f}">${t}</button>`).join('')}</div>
    <div class="op-list rep-list">${list.map(o => `<button class="op-item rep" type="button" data-rep="${o.id}"><span class="side-dot ${o.side}"></span><span class="grow"><b>${esc(o.name)}</b><span class="muted small">${esc(o.idea.split('. ')[0])}.</span></span><span class="tag">${esc(o.level)}</span></button>`).join('')}</div>`;
}
function repCard(o){
  return `<div class="rep-card"><div class="row"><span class="eco">${esc(o.eco)}</span><b class="grow">${esc(o.name)}</b><span class="tag">${o.side === 'w' ? 'White' : 'Black'} · ${esc(o.level)}</span></div>
    <p>${esc(o.idea)}</p>
    <div class="rep-plans"><div><div class="label">White’s plan</div><p>${esc(o.plans[0])}</p></div><div><div class="label">Black’s plan</div><p>${esc(o.plans[1])}</p></div></div>
    <div class="muted small">Played by ${esc(o.players)} · ${o.tags.map(esc).join(', ')}</div>
    ${o.trap ? `<div class="trap"><b>⚠️ Trap: ${esc(o.trap.name)}</b><p class="small">${esc(o.trap.text)}</p><button class="btn" type="button" data-trap="${o.id}">Show the trap</button></div>` : ''}
    <button class="btn ghost" type="button" data-replist="1">← All openings</button></div>`;
}
const loadSan = pgn => { OP.moves = C.parsePGN(pgn); $('opSearch').value = ''; syncOpen(null); };
const openBoard = new Board($('openBoard'), {
  canMove: () => OP.practice ? OP.practice.canMove() : true,
  onMove: (m, d) => { if (OP.practice) return OP.practice.handle(m, d); OP.moves.push(m); syncOpen(m, d); sfx.forMove(moveKind(m, openState()), true); }
});
function openState(){ let s = C.initState(); for (const m of OP.moves) s = apply(s, m); return s; }
function syncOpen(m, d){ openBoard.flipped = OP.flipped; openBoard.set(openState(), {last: OP.moves[OP.moves.length - 1] || null, slides: m ? slidesFor(m, d) : null}); renderOpen(); }
function renderOpen(){
  const q = $('opSearch').value.trim().toLowerCase();
  const body = $('opBody');
  if (OP.practice) return;
  if (q){
    const res = (window.GW_OPENINGS || []).filter(o => o[1].toLowerCase().includes(q) || o[0].toLowerCase() === q).slice(0, 60);
    body.innerHTML = `<div class="muted small">${res.length === 60 ? 'First 60 matches' : `${res.length} matches`}</div><div class="op-list">${res.map(o => `<button class="op-item" type="button" data-line="${o[2]}"><span class="eco">${o[0]}</span><span class="grow">${esc(o[1])}</span><span class="muted small">${o[2].split(' ').length} plies</span></button>`).join('')}</div>`;
    return;
  }
  if (OP.view === 'rep' && !OP.rep){ body.innerHTML = repList(); return; }
  const repO = OP.view === 'rep' && REP.find(o => o.id === OP.rep);
  const ucis = OP.moves.map(uci), seq = ucis.join(' ');
  const name = GW.openingName(ucis);
  const s = openState();
  // continuations seen in the opening list from here
  const next = new Map();
  for (const [line, o] of GW.OPEN_BY_LINE){
    if (seq && !line.startsWith(seq + ' ')) continue;
    const mv = line.split(' ')[ucis.length];
    if (!mv) continue;
    const e = next.get(mv) || {count:0, name:null, len:99};
    e.count++;
    const len = line.split(' ').length;
    if (len < e.len){ e.len = len; e.name = o.name; }
    next.set(mv, e);
  }
  const rows = [...next.entries()].sort((a, b) => b[1].count - a[1].count).slice(0, 14).map(([mv, e]) => { const m = fromUci(s, mv); return m ? `<button class="op-item" type="button" data-move="${mv}"><b class="san">${san(s, m)}</b><span class="grow">${esc(e.name)}</span><span class="muted small">${e.count} lines</span></button>` : ''; }).join('');
  let movesTxt = '', t = C.initState();
  OP.moves.forEach((m, k) => { if (k % 2 === 0) movesTxt += `${k / 2 + 1}. `; movesTxt += san(t, m) + ' '; t = apply(t, m); });
  body.innerHTML = (repO ? repCard(repO) : '') + `<div class="op-name">${name ? `<span class="eco">${name.eco}</span> ${esc(name.name)}` : OP.moves.length ? '<span class="muted">Out of the named lines</span>' : 'Starting position'}</div>
    <div class="op-moves">${movesTxt || '<span class="muted">Make a move on the board or pick one below.</span>'}</div>
    ${OP.moves.length >= 2 ? `<div class="row"><button class="btn violet grow" type="button" data-practice="w">Practise as White</button><button class="btn violet grow" type="button" data-practice="b">Practise as Black</button></div>` : ''}
    ${rows ? `<div class="label">Continuations</div><div class="op-list">${rows}</div>` : ''}
    ${!OP.moves.length ? `<div class="label">Popular openings</div><div class="guide-list">${LRN.OPENING_GUIDES.map(g => `<button class="guide" type="button" data-line="${g.line}"><b>${esc(g.name)}</b><span>${esc(g.idea)}</span></button>`).join('')}</div>` : ''}
    <p class="credit">Opening names: lichess-org/chess-openings (CC0).</p>`;
}
function loadLine(line){
  OP.moves = []; let s = C.initState();
  for (const u of line.split(' ')){ const m = fromUci(s, u); if (!m) break; OP.moves.push(m); s = apply(s, m); }
  $('opSearch').value = '';
  syncOpen(null);
}
function startPractice(side){
  const line = OP.moves.map(uci).join(' ');
  OP.practice = new Task(openBoard, {type:'opening', line, side}, {
    onWrong: () => feedback($('opFb'), 'bad', BAD('Not the book move. Try again.')),
    onProgress: () => feedback($('opFb'), 'ok', OK('Correct. Keep going.')),
    onSolved: failed => { feedback($('opFb'), 'ok', OK(failed ? 'Line complete (with mistakes). Go again to make it perfect.' : 'Perfect! You know this line.')); sfx.success(); }
  });
  $('opBody').innerHTML = `<div class="op-name">Practising: ${esc((GW.openingName(line.split(' ')) || {name:'this line'}).name)}</div><div class="muted">Play ${NAME[side]}’s moves from memory. The board plays the other side.</div><div class="feedback info" id="opFb"><div>Your move.</div></div><div class="row"><button class="btn grow" id="opPHint" type="button">Hint</button><button class="btn grow" id="opPRestart" type="button">Restart</button><button class="btn grow" id="opPStop" type="button">Stop</button></div>`;
  $('opPHint').addEventListener('click', () => OP.practice.hint());
  $('opPRestart').addEventListener('click', () => { OP.practice.reset(); feedback($('opFb'), 'info', '<div>Your move.</div>'); });
  $('opPStop').addEventListener('click', () => { OP.practice = null; syncOpen(null); });
}
$('opView').addEventListener('click', e => {
  const b = e.target.closest('[data-v]');
  if (!b || OP.practice) return;
  OP.view = b.dataset.v; OP.rep = null;
  $('opView').querySelectorAll('[data-v]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
  if (OP.view === 'rep'){ OP.moves = []; syncOpen(null); } else renderOpen();
});
$('opBody').addEventListener('click', e => {
  const r = e.target.closest('[data-rep],[data-f],[data-trap],[data-replist]');
  if (r){
    if (r.dataset.f){ OP.filter = r.dataset.f; return renderOpen(); }
    if (r.dataset.replist){ OP.rep = null; OP.moves = []; return syncOpen(null); }
    const o = REP.find(x => x.id === (r.dataset.rep || r.dataset.trap));
    if (!o) return;
    OP.rep = o.id;
    if (o.side !== (OP.flipped ? 'b' : 'w')){ OP.flipped = o.side === 'b'; }
    loadSan(r.dataset.trap ? o.trap.pgn : o.line);
    if (r.dataset.trap) GW.toast(`<b>${esc(o.trap.name)}</b><br>Step back with ← to see how it happens.`);
    return;
  }
  const b = e.target.closest('[data-line],[data-move],[data-practice]');
  if (!b) return;
  if (b.dataset.line) return loadLine(b.dataset.line);
  if (b.dataset.practice) return startPractice(b.dataset.practice);
  const m = fromUci(openState(), b.dataset.move);
  if (m){ OP.moves.push(m); syncOpen(m, false); sfx.forMove(moveKind(m, openState()), true); }
});
$('opSearch').addEventListener('input', () => { if (OP.practice) return; if (OP.view === 'rep' && $('opSearch').value.trim()){ OP.view = 'exp'; OP.rep = null; $('opView').querySelectorAll('[data-v]').forEach(x => x.setAttribute('aria-pressed', String(x.dataset.v === 'exp'))); } renderOpen(); });
$('opBack').addEventListener('click', () => { if (OP.practice) return; OP.moves.pop(); syncOpen(null); });
$('opReset').addEventListener('click', () => { OP.practice = null; OP.moves = []; OP.rep = null; syncOpen(null); });
$('opFlip').addEventListener('click', () => { OP.flipped = !OP.flipped; openBoard.flipped = OP.flipped; openBoard.render(); });
$('opAnalyse').addEventListener('click', () => GW.show('analysis', {moves: OP.moves.slice(), ply: OP.moves.length}));
GW.register('openings', {onShow: () => { if (!OP.practice) syncOpen(null); }});

/* ============================== ANALYSIS BOARD ============================== */
$('scr-analysis').innerHTML = `
<div class="play">
  <div class="board-col">
    <div style="height:4px"></div>
    <div class="board-with-bar"><div class="evalbar" id="anBar"><div class="fill"></div><div class="num top"></div><div class="num bot"></div></div><div id="anBoard"></div></div>
    <div class="navbar" style="margin-top:8px"><button class="btn" id="anFirst" type="button" aria-label="First">${ICON.first}</button><button class="btn" id="anPrev" type="button" aria-label="Back">${ICON.prev}</button><button class="btn" id="anNext" type="button" aria-label="Forward">${ICON.next}</button><button class="btn" id="anLast" type="button" aria-label="Last">${ICON.last}</button></div>
  </div>
  <aside class="panel">
    <div class="row"><h2 class="grow">Analysis</h2><div class="switch compact">Engine<button type="button" id="anEngine" aria-pressed="true" aria-label="Engine on"></button></div></div>
    <div class="opening-name" id="anOpening"></div>
    <div class="engine-lines" id="anLines"></div>
    <ol class="moves" id="anMoves"></ol>
    <div class="row"><button class="btn grow" id="anFlip" type="button">${ICON.flip}Flip</button><button class="btn grow" id="anUndo" type="button">${ICON.undo}Undo</button><button class="btn grow" id="anClear" type="button">New</button></div>
    <div class="row"><button class="btn grow" id="anImport" type="button">Import FEN / PGN</button><button class="btn grow" id="anExport" type="button">Copy PGN</button><button class="btn grow" id="anFen" type="button">Copy FEN</button></div>
    <div class="muted small">Tip: right-click and drag to draw arrows. Moves you make from an earlier position replace the moves after it.</div>
  </aside>
</div>`;
const AN = {startFen: C.START_FEN, moves:[], ply:0, flipped:false, engine:true, token:0};
const anBoard = new Board($('anBoard'), {canMove: () => true, onMove: (m, d) => {
  AN.moves = AN.moves.slice(0, AN.ply); AN.moves.push(m); AN.ply++; syncAn(m, d); sfx.forMove(moveKind(m, anState()), true);
}});
function anState(ply = AN.ply){ let s = C.fromFEN(AN.startFen); for (let i = 0; i < ply; i++) s = apply(s, AN.moves[i]); return s; }
function syncAn(m, d){
  anBoard.flipped = AN.flipped;
  anBoard.set(anState(), {last: AN.ply ? AN.moves[AN.ply - 1] : null, slides: m ? slidesFor(m, d) : null});
  renderAn();
  runEngine();
}
function renderAn(){
  let s = C.fromFEN(AN.startFen), out = '';
  const start = s.turn === 'b' ? 1 : 0;
  const sans = AN.moves.map(m => { const t = san(s, m); s = apply(s, m); return t; });
  for (let i = -start; i < sans.length; i += 2){
    const cell = j => j >= 0 && j < sans.length ? `<button type="button" class="mv${j === AN.ply - 1 ? ' cur' : ''}" data-ply="${j + 1}">${sans[j]}</button>` : '<span></span>';
    out += `<li><span class="n">${Math.floor((i + start) / 2) + 1}.</span>${cell(i)}${cell(i + 1)}</li>`;
  }
  $('anMoves').innerHTML = out || '<li class="empty">Make moves for both sides on the board.</li>';
  $('anMoves').querySelector('.mv.cur')?.scrollIntoView({block:'nearest'});
  const op = AN.startFen === C.START_FEN ? GW.openingName(AN.moves.slice(0, AN.ply).map(uci)) : null;
  $('anOpening').textContent = op ? `${op.eco} · ${op.name}` : '';
  $('anEngine').setAttribute('aria-pressed', String(AN.engine));
}
async function runEngine(){
  const tok = ++AN.token, s = anState();
  const linesEl = $('anLines');
  if (!AN.engine){ linesEl.innerHTML = '<div class="muted">Engine off.</div>'; setBar(null); return; }
  if (!legal(s).length){ linesEl.innerHTML = `<div class="feedback info"><div>${inCheck(s) ? `Checkmate. ${NAME[opp(s.turn)]} wins.` : 'Stalemate.'}</div></div>`; setBar(inCheck(s) ? (s.turn === 'w' ? -10000 : 10000) : 0); anBoard.auto = []; anBoard.drawArrows(); return; }
  linesEl.innerHTML = '<div class="muted">Thinking…</div>';
  if (!await Engine.boot()){
    const q = C.quickAnalyse(s);
    if (tok !== AN.token) return;
    const v = GW.whiteCp(q.score, s.turn);
    setBar(v);
    linesEl.innerHTML = `<div class="muted small">Stockfish unavailable: quick built-in analysis.</div>${q.best ? `<div class="eline"><span class="ev">${GW.fmtEval(v)}</span>${san(s, fromUci(s, q.best))}</div>` : ''}`;
    return;
  }
  const depths = Engine.fast ? [10, 14, 18] : [8, 11, 13];
  for (const depth of depths){
    const r = await Engine.search(`position fen ${C.toFEN(s)}`, {depth, ms:0, multipv:3});
    if (tok !== AN.token || !r) return;
    const v = GW.whiteCp(r.lines[0].score, s.turn);
    setBar(v);
    linesEl.innerHTML = `<div class="muted small">Stockfish · depth ${depth}</div>` + r.lines.map((l, i) => {
      let t = s, txt = '';
      for (const [k, u] of l.pv.slice(0, 8).entries()){ const m = fromUci(t, u); if (!m) break; if (t.turn === 'w') txt += `${t.full}. `; else if (k === 0) txt += `${t.full}… `; txt += san(t, m) + ' '; t = apply(t, m); }
      return `<button class="eline" type="button" data-pv="${l.pv.slice(0, 8).join(' ')}"><span class="ev ${i ? '' : 'top'}">${GW.fmtEval(GW.whiteCp(l.score, s.turn))}</span><span class="pv">${txt}</span></button>`;
    }).join('');
    anBoard.auto = r.lines.slice(0, 2).map((l, i) => { const m = fromUci(s, l.pv[0]); return m ? {from:m.from, to:m.to, color: i ? 'v' : 'g', opacity: i ? .5 : .85} : null; }).filter(Boolean);
    anBoard.drawArrows();
  }
}
function setBar(v){
  const bar = $('anBar'), fill = bar.querySelector('.fill');
  const wp = v == null ? 50 : GW.winPct(Math.max(-1500, Math.min(1500, v)));
  fill.style.height = wp + '%';
  fill.style.top = AN.flipped ? '0' : 'auto'; fill.style.bottom = AN.flipped ? 'auto' : '0';
  const txt = v == null ? '' : GW.fmtEval(v).replace('+', '');
  bar.querySelector('.num.top').textContent = (AN.flipped ? v >= 0 : v < 0) ? txt : '';
  bar.querySelector('.num.bot').textContent = (AN.flipped ? v < 0 : v >= 0) ? txt : '';
  bar.querySelector('.num.top').style.color = AN.flipped ? '#2b2950' : '#f4f4fb';
  bar.querySelector('.num.bot').style.color = AN.flipped ? '#f4f4fb' : '#2b2950';
}
const anGo = p => { AN.ply = clamp(p, 0, AN.moves.length); syncAn(null); };
$('anFirst').addEventListener('click', () => anGo(0));
$('anPrev').addEventListener('click', () => anGo(AN.ply - 1));
$('anNext').addEventListener('click', () => anGo(AN.ply + 1));
$('anLast').addEventListener('click', () => anGo(AN.moves.length));
$('anMoves').addEventListener('click', e => { const b = e.target.closest('[data-ply]'); if (b) anGo(+b.dataset.ply); });
$('anLines').addEventListener('click', e => {
  const b = e.target.closest('[data-pv]');
  if (!b) return;
  const u = b.dataset.pv.split(' ')[0], m = fromUci(anState(), u);
  if (m){ AN.moves = AN.moves.slice(0, AN.ply); AN.moves.push(m); AN.ply++; syncAn(m, false); sfx.forMove(moveKind(m, anState()), true); }
});
$('anEngine').addEventListener('click', () => { AN.engine = !AN.engine; if (!AN.engine){ anBoard.auto = []; anBoard.drawArrows(); } renderAn(); runEngine(); });
$('anFlip').addEventListener('click', () => { AN.flipped = !AN.flipped; syncAn(null); });
$('anUndo').addEventListener('click', () => { if (AN.ply){ AN.moves = AN.moves.slice(0, AN.ply - 1); AN.ply--; syncAn(null); } });
$('anClear').addEventListener('click', () => { AN.startFen = C.START_FEN; AN.moves = []; AN.ply = 0; syncAn(null); });
$('anExport').addEventListener('click', () => {
  if (AN.startFen !== C.START_FEN) return GW.copyText(`[FEN "${AN.startFen}"]\n\n` + AN.moves.map(m => uci(m)).join(' '), 'Copied');
  GW.copyText(C.toPGN(AN.moves, {Event:'Elite Chess analysis'}), 'PGN copied');
});
$('anFen').addEventListener('click', () => GW.copyText(C.toFEN(anState()), 'FEN copied'));
$('anImport').addEventListener('click', () => {
  const m = GW.modal(`<h2>Import position</h2><div class="muted">Paste a FEN (one line) or a PGN game.</div><textarea class="textbox" id="imText" rows="7" placeholder="rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1"></textarea><div class="feedback bad" id="imErr" hidden></div><div class="row"><button class="btn grow" id="imCancel" type="button">Cancel</button><button class="btn pop grow" id="imGo" type="button">Load</button></div>`);
  m.querySelector('#imCancel').addEventListener('click', () => GW.closeModal());
  m.querySelector('#imGo').addEventListener('click', () => {
    const t = m.querySelector('#imText').value.trim();
    const fenLike = /^[pnbrqkPNBRQK1-8]+(\/[pnbrqkPNBRQK1-8]+){7}\s+[wb]/.test(t);
    if (fenLike){
      try {
        const s = C.fromFEN(t);
        if (C.findKing(s.board, 'w') < 0 || C.findKing(s.board, 'b') < 0) throw new Error('both kings needed');
        AN.startFen = C.toFEN(s); AN.moves = []; AN.ply = 0;
        GW.closeModal(); syncAn(null);
      } catch (err) { feedback(m.querySelector('#imErr'), 'bad', `<div>That FEN doesn’t look valid (${esc(err.message)}).</div>`); }
      return;
    }
    const moves = C.parsePGN(t);
    if (!moves.length) return feedback(m.querySelector('#imErr'), 'bad', '<div>No moves found. Check the PGN or FEN.</div>');
    AN.startFen = C.START_FEN; AN.moves = moves; AN.ply = moves.length;
    GW.closeModal(); syncAn(null);
  });
});
document.addEventListener('keydown', e => {
  if (GW.currentScreen() !== 'analysis' || e.target.closest('input,textarea')) return;
  if (e.key === 'ArrowRight'){ anGo(AN.ply + 1); e.preventDefault(); }
  if (e.key === 'ArrowLeft'){ anGo(AN.ply - 1); e.preventDefault(); }
});
GW.register('analysis', {onShow: arg => {
  if (arg && arg.moves){ AN.startFen = C.START_FEN; AN.moves = arg.moves.slice(); AN.ply = arg.ply != null ? arg.ply : arg.moves.length; }
  syncAn(null);
}, onHide: () => { AN.token++; }});

/* ============================== PROFILE ============================== */
function renderProfile(){
  const P = D.AVATAR_PARTS, L = profile.look;
  const extraOf = () => P.extra.find(x => x !== 'none' && (L[x] || (x === 'beard' && L.beard))) || 'none';
  const sw = (key, list, cur) => `<div class="parts" data-part="${key}">${list.map(v => `<button type="button" data-v="${v}" aria-pressed="${v === cur}" style="--sw:${v}" class="${v.startsWith('#') ? 'sw' : 'txt'}">${v.startsWith('#') ? '' : esc(v)}</button>`).join('')}</div>`;
  const total = profile.wins + profile.draws + profile.losses;
  $('scr-profile').innerHTML = `
  <div class="page-head"><div><h1>Profile</h1><div class="muted">Your player card, progress and trophy cabinet.</div></div></div>
  <div class="profile-grid">
    <section class="panel">
      <div class="me-card"><div class="av huge" id="pfAv">${avatarSVG(GW.me())}</div><div class="grow"><input class="search name-in" id="pfName" maxlength="20" placeholder="Your name" value="${esc(profile.name)}"><div class="hero-stats"><span class="rating-chip big"><b>${profile.rating}</b> rating</span><span class="pill">Best ${profile.best || profile.rating}</span></div></div></div>
      <div class="label">Make your avatar</div>
      <div class="muted small">Skin</div>${sw('skin', P.skin, L.skin)}
      <div class="muted small">Hair style</div>${sw('style', P.style, L.style)}
      <div class="muted small">Hair colour</div>${sw('hair', P.hair, L.hair)}
      <div class="muted small">Eyes</div>${sw('eye', P.eye, L.eye || '#5b3a24')}
      <div class="muted small">Outfit</div>${sw('outfit', P.outfit, L.outfit || 'tee')}
      <div class="muted small">Outfit colour</div>${sw('shirt', P.shirt, L.shirt)}
      <div class="muted small">Background</div>${sw('bg', P.bg, L.bg)}
      <div class="muted small">Extra</div>${sw('extra', P.extra, extraOf())}
    </section>
    <section class="stack-lg">
      ${GW.accountCard ? GW.accountCard() : ''}
      <div class="panel"><div class="row"><h2 class="grow">Rating</h2><span class="muted">${profile.history.length} rated games</span></div>${ratingChart(560, 140)}
        <div class="stat-row four"><div class="stat"><b>${total}</b><span>Games</span></div><div class="stat"><b>${profile.wins}</b><span>Wins</span></div><div class="stat"><b>${profile.draws}</b><span>Draws</span></div><div class="stat"><b>${profile.losses}</b><span>Losses</span></div></div>
        <div class="stat-row four"><div class="stat"><b>${profile.puzzleRating}</b><span>Puzzle rating</span></div><div class="stat"><b>${profile.solved.length}</b><span>Puzzles</span></div><div class="stat"><b>${profile.rushBest}</b><span>Rush best</span></div><div class="stat"><b>${lessonCount()}</b><span>Lessons</span></div></div></div>
      <div class="panel"><h2>Trophy cabinet</h2><div class="cabinet">${D.CUPS.map(c => { const m = profile.trophies[c.id]; return `<div class="shelf-item${m ? '' : ' locked'}"><div class="trophy">${GW.trophySVG(m ? c.color : '#8a86b8', m)}</div><b>${esc(c.name)}</b><span class="muted small">${m ? m[0].toUpperCase() + m.slice(1) : 'Not won yet'}</span></div>`; }).join('')}</div></div>
      <div class="panel"><h2>Achievements <span class="muted">${profile.achievements.length}/${D.ACHIEVEMENTS.length}</span></h2><div class="ach-grid">${D.ACHIEVEMENTS.map(a => `<div class="ach${profile.achievements.includes(a.id) ? ' got' : ''}"><span class="ach-ico">${a.icon}</span><div><b>${esc(a.name)}</b><span class="muted small">${esc(a.desc)}</span></div></div>`).join('')}</div></div>
      <div class="panel"><h2>About and credits</h2><div class="muted small credits">
        <p>Piece sets: ${Object.values(GW.pieceSets()).filter(p => !p.themed).map(p => `${esc(p.name)} by ${esc(p.author)} (${esc(p.license)})`).join('; ')}. From the <a href="https://github.com/lichess-org/lila/blob/master/COPYING.md" target="_blank" rel="noopener">lichess.org collection</a>.</p>
        <p>Puzzles and opening names: <a href="https://database.lichess.org" target="_blank" rel="noopener">lichess.org open databases</a> (CC0). Engine: <a href="https://stockfishchess.org" target="_blank" rel="noopener">Stockfish 17.1</a> via <a href="https://github.com/nmrugg/stockfish.js" target="_blank" rel="noopener">stockfish.js</a> (GPLv3), with Stockfish 10 as a fallback for older browsers. Bots rated 1350 and up play at Stockfish’s calibrated strength (UCI_Elo).</p>
        <p>World rankings: <a href="https://ratings.fide.com" target="_blank" rel="noopener">FIDE ratings</a>. Recorded sounds: public-domain (CC0) recordings from <a href="https://freesound.org" target="_blank" rel="noopener">freesound.org</a> by Amatsuuu, simone_ds, JJTaynos and mh2o. Characters, seasonal character pieces and flyovers, boards, themes and lessons are original to Elite Chess. Bot ratings and performance estimates are approximate.</p></div></div>
    </section>
  </div>`;
}
$('scr-profile').addEventListener('input', e => { if (e.target.id === 'pfName'){ profile.name = e.target.value.trim().slice(0, 20); saveProfile(); } });
$('scr-profile').addEventListener('click', e => {
  const b = e.target.closest('.parts button');
  if (!b) return;
  const key = b.closest('.parts').dataset.part, v = b.dataset.v, L = profile.look;
  if (key === 'extra'){
    for (const x of D.AVATAR_PARTS.extra) delete L[x];
    if (v === 'beard' || v === 'mustache') L[v] = L.hair;
    else if (v === 'earrings') L[v] = '#ffd166';
    else if (v !== 'none') L[v] = v === 'glasses' || v === 'shades' ? '#1f2937' : ['freckles', 'crown', 'stubble'].includes(v) ? true : '#6c5ce7';
  }
  else L[key] = v;
  saveProfile();
  renderProfile();
});
GW.register('profile', {onShow: renderProfile});

/* ============================== SETTINGS ============================== */
function openSettings(){
  const s = GW.settings;
  const m = GW.modal(`<h2>Settings</h2>
    <button class="btn big-row" type="button" id="stLookBtn"><span class="grow" style="text-align:left">🎨 Boards, pieces, seasonal themes and sounds</span><span>›</span></button>
    <div><div class="label" style="margin-bottom:10px">Appearance</div><div class="tabs" id="stLook">${[['auto', 'Match device'], ['light', 'Light'], ['dark', 'Dark']].map(([v, t]) => `<button type="button" data-look="${v}" aria-pressed="${(s.appearance || 'auto') === v}">${t}</button>`).join('')}</div></div>
    <div class="stack">
      <div class="switch">Sound<button type="button" data-opt="sound" aria-pressed="${s.sound}" aria-label="Sound"></button></div>
      <div class="switch">Show legal moves<button type="button" data-opt="hints" aria-pressed="${s.hints}" aria-label="Show legal moves"></button></div>
      <div class="switch">Coordinates<button type="button" data-opt="coords" aria-pressed="${s.coords}" aria-label="Coordinates"></button></div>
      <div class="switch">Vibrate on moves (phones)<button type="button" data-opt="haptics" aria-pressed="${s.haptics}" aria-label="Vibrate on moves"></button></div>
      <div class="switch">Premoves (move during your opponent’s turn)<button type="button" data-opt="premove" aria-pressed="${s.premove !== false}" aria-label="Premoves"></button></div>
      <div class="switch">Always promote to a queen<button type="button" data-opt="autoQueen" aria-pressed="${!!s.autoQueen}" aria-label="Always promote to a queen"></button></div>
    </div>
    <div class="muted small">To castle, drag or swipe your king onto a rook (or two squares toward it). Right-click and drag on the board to draw arrows; right-click a square to highlight it. Hold Shift, Ctrl or Alt for other colours.</div>
    <div class="stack"><div class="label">Your progress</div>
      <div class="muted small">Progress is saved on this device. Copy a backup code to move it to a new phone or browser.</div>
      <div class="row"><button class="btn grow" id="stBackup" type="button">Copy backup code</button><button class="btn grow" id="stRestore" type="button">Restore from code</button></div></div>
    <div class="row"><button class="btn ghost" id="stReset" type="button">Reset all progress</button><span class="grow"></span>${GW.canExit() ? '<button class="btn" id="stExit" type="button">Exit app</button>' : ''}<button class="btn pop" id="stDone" type="button">Done</button></div>`, {wide:true});
  m.addEventListener('click', e => {
    const t = e.target.closest('.theme'), o = e.target.closest('[data-opt]'), lk = e.target.closest('[data-look]');
    if (lk){ s.appearance = lk.dataset.look; GW.applySettings(); m.querySelectorAll('[data-look]').forEach(x => x.setAttribute('aria-pressed', String(x.dataset.look === s.appearance))); }
    if (t){ s.theme = t.dataset.id; GW.applySettings(); m.querySelectorAll('.theme').forEach(x => x.setAttribute('aria-pressed', String(x.dataset.id === s.theme))); }
    if (o){ s[o.dataset.opt] = !s[o.dataset.opt]; o.setAttribute('aria-pressed', String(s[o.dataset.opt])); GW.applySettings(); if (o.dataset.opt === 'sound' && s.sound){ sfx.unlock(); sfx.forMove('move', true); } }
  });
  m.querySelector('#stDone').addEventListener('click', () => GW.closeModal());
  m.querySelector('#stExit')?.addEventListener('click', () => { GW.closeModal(); GW.confirmExit(); });
  m.querySelector('#stLookBtn').addEventListener('click', () => { GW.closeModal(); GW.show('customize'); });
  const KEYS = ['gw-profile', 'gw-settings', 'gw-setup', 'gw-archive', 'gw-fav'];
  m.querySelector('#stBackup').addEventListener('click', () => {
    const data = {};
    for (const k of KEYS){ try { const v = localStorage.getItem(k); if (v) data[k] = JSON.parse(v); } catch (_) {} }
    const code = 'GWC1:' + btoa(unescape(encodeURIComponent(JSON.stringify(data))));
    GW.copyText(code, 'Backup code copied. Keep it somewhere safe.');
  });
  m.querySelector('#stRestore').addEventListener('click', () => {
    const r = GW.modal(`<h2>Restore progress</h2><div class="sub">Paste your backup code. This replaces the progress on this device.</div>
      <textarea class="textbox" id="rsCode" rows="5" placeholder="GWC1:…"></textarea><div class="feedback bad" id="rsErr" hidden></div>
      <div class="row"><button class="btn grow" id="rsCancel" type="button">Cancel</button><button class="btn pop grow" id="rsGo" type="button">Restore</button></div>`);
    r.querySelector('#rsCancel').addEventListener('click', () => GW.closeModal());
    r.querySelector('#rsGo').addEventListener('click', () => {
      const raw = r.querySelector('#rsCode').value.trim(), err = r.querySelector('#rsErr');
      let data = null;
      try { if (raw.startsWith('GWC1:')) data = JSON.parse(decodeURIComponent(escape(atob(raw.slice(5))))); } catch (_) {}
      if (!data || !data['gw-profile']){ err.hidden = false; err.innerHTML = '<span class="ic">!</span><div>That doesn’t look like an Elite Chess backup code. Copy the whole code, starting with GWC1:</div>'; return; }
      try { for (const k of KEYS){ if (data[k]) localStorage.setItem(k, JSON.stringify(data[k])); else localStorage.removeItem(k); } localStorage.removeItem('gw-live'); } catch (_) {}
      location.reload();
    });
  });
  m.querySelector('#stReset').addEventListener('click', () => {
    const c = GW.modal(`<h2>Reset everything?</h2><div class="sub">Your rating, puzzles, lessons, cups and achievements will be cleared on this device.</div><div class="row"><button class="btn grow" id="rsNo" type="button">Cancel</button><button class="btn danger grow" id="rsYes" type="button">Reset</button></div>`);
    c.querySelector('#rsNo').addEventListener('click', () => GW.closeModal());
    c.querySelector('#rsYes').addEventListener('click', () => { try { localStorage.removeItem('gw-profile'); localStorage.removeItem('gw-setup'); localStorage.removeItem('gw-archive'); localStorage.removeItem('gw-live'); } catch (_) {} location.reload(); });
  });
}

/* ============================== ONBOARDING ============================== */
function onboarding(){
  const levels = [['New to chess', 400], ['Beginner', 800], ['Intermediate', 1200], ['Advanced', 1600], ['Expert', 2000]];
  let lvl = 1;
  const looks = [D.PEOPLE.you.look, D.BOTS[2].look, D.BOTS[6].look, D.BOTS[10].look, D.BOTS[4].look, D.BOTS[13].look];
  let look = 0;
  const m = GW.modal(`<div class="onboard"><div class="ob-logo"><svg viewBox="0 0 40 40" aria-hidden="true"><defs><linearGradient id="lgOb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6c5ce7"/><stop offset=".55" stop-color="#8b5cf6"/><stop offset="1" stop-color="#22b8b0"/></linearGradient></defs><rect width="40" height="40" rx="12" fill="url(#lgOb)"/><path d="M20 6l3 4h-6zM15 11h10l-2 3h-6zM17 15h6l1.5 10h-9zM12 27h16v3H12zM10 31h20v3H10z" fill="#fff"/><circle cx="30" cy="10" r="3" fill="#ffb627"/></svg></div><h2>Welcome to Elite Chess</h2><div class="sub">Play bots, win cups, solve puzzles and learn from first moves to grandmaster technique.</div>
    <input class="search" id="obName" maxlength="20" placeholder="What should we call you?" value="${esc(profile.name || '')}">
    <div class="label">Pick an avatar (you can customise it later)</div><div class="ob-looks">${looks.map((l, i) => `<button type="button" data-look="${i}" aria-pressed="${i === 0}"><div class="av">${D.avatar(l)}</div></button>`).join('')}</div>
    <div class="label">How well do you play?</div><div class="ob-levels">${levels.map(([n, r], i) => `<button type="button" data-lvl="${i}" aria-pressed="${i === lvl}"><b>${n}</b><span>${r}</span></button>`).join('')}</div>
    <button class="btn pop big" id="obGo" type="button">Let’s play</button></div>`, {wide:true, onClose: () => { if (!profile.onboarded){ profile.onboarded = true; saveProfile(); } }});
  m.addEventListener('click', e => {
    const a = e.target.closest('[data-look]'), b = e.target.closest('[data-lvl]');
    if (a){ look = +a.dataset.look; m.querySelectorAll('[data-look]').forEach(x => x.setAttribute('aria-pressed', String(+x.dataset.look === look))); }
    if (b){ lvl = +b.dataset.lvl; m.querySelectorAll('[data-lvl]').forEach(x => x.setAttribute('aria-pressed', String(+x.dataset.lvl === lvl))); }
  });
  m.querySelector('#obGo').addEventListener('click', () => {
    profile.name = m.querySelector('#obName').value.trim().slice(0, 20);
    profile.look = Object.assign({}, looks[look]);
    profile.rating = profile.puzzleRating = levels[lvl][1];
    profile.best = profile.rating;
    profile.onboarded = true;
    saveProfile();
    GW.closeModal();
    sfx.start();
    GW.show('home');
  });
}

/* ============================== MY GAMES ============================== */
const ago = t => { const d = (Date.now() - t) / 1000; return d < 3600 ? `${Math.max(1, Math.round(d / 60))} min ago` : d < 86400 ? `${Math.round(d / 3600)} h ago` : d < 86400 * 7 ? `${Math.round(d / 86400)} d ago` : new Date(t).toLocaleDateString(); };
function finalFen(g){ let st = C.initState(); for (const u of g.moves){ const m = fromUci(st, u); if (!m) break; st = apply(st, m); } return C.toFEN(st); }
let histFilter = 'all';
function renderHistory(){
  const all = GW.archive();
  const mine = g => g.mode === 'cpu' || g.mode === 'online';
  const out = g => !mine(g) ? 'none' : g.winner === g.human ? 'win' : g.winner ? 'loss' : 'draw';
  const list = all.filter(g => histFilter === 'all' || out(g) === histFilter);
  const n = k => all.filter(g => out(g) === k).length;
  $('scr-history').innerHTML = `
  <div class="page-head"><div><div class="kicker">Your archive</div><h1>My games</h1></div>
    <div class="tabs small" id="hsFilter" style="min-width:300px">${[['all', `All ${all.length}`], ['win', `Won ${n('win')}`], ['loss', `Lost ${n('loss')}`], ['draw', `Drawn ${n('draw')}`]].map(([v, t]) => `<button type="button" data-f="${v}" aria-pressed="${v === histFilter}">${t}</button>`).join('')}</div></div>
  ${list.length ? `<div class="hist-list">${list.map(g => {
      const k = all.indexOf(g), o = out(g), rival = mine(g) ? GW.playerOf(g, opp(g.human)) : null;
      const label = o === 'win' ? 'Won' : o === 'loss' ? 'Lost' : o === 'draw' ? 'Draw' : g.result;
      const who = mine(g) ? `vs ${esc(rival.name)} <span class="muted">${rival.elo || ''}${g.mode === 'online' ? ' · Online' : ''}</span>` : g.mode === 'pvp' ? 'Friend game' : `${esc(GW.playerOf(g, 'w').name)} vs ${esc(GW.playerOf(g, 'b').name)}`;
      return `<article class="hist-card ${o}"><div class="hist-mini">${GW.miniBoard(finalFen(g), g.human === 'b')}</div>
        <div class="hist-body"><div class="row" style="gap:8px"><span class="res-badge ${o}">${label}</span>${g.delta != null ? `<span class="${g.delta >= 0 ? 'up' : 'down'}" style="font-weight:800">${g.delta >= 0 ? '+' : ''}${g.delta}</span>` : ''}<span class="muted small grow" style="text-align:right">${ago(g.t)}</span></div>
          <div style="font-weight:800">${who}</div>
          <div class="muted small">${esc(g.reason[0].toUpperCase() + g.reason.slice(1))} · ${Math.ceil(g.moves.length / 2)} moves${g.opening ? ' · ' + esc(g.opening) : ''}</div>
          <div class="row" style="gap:8px;margin-top:4px"><button class="btn pop" type="button" data-rv="${k}">Review</button><button class="btn" type="button" data-pgn="${k}">Copy PGN</button>${g.mode === 'cpu' ? `<button class="btn ghost" type="button" data-rm="${k}">Rematch</button>` : ''}</div></div></article>`;
    }).join('')}</div>` : `<div class="panel empty-state"><div style="font-size:48px">♟️</div><h2>${all.length ? 'Nothing here yet' : 'No games yet'}</h2><p class="muted">Finished games are saved here so you can review them later.</p><button class="btn pop" type="button" id="hsPlay">Play a game</button></div>`}`;
  $('hsPlay')?.addEventListener('click', () => GW.show('setup'));
}
$('scr-history').addEventListener('click', e => {
  const all = GW.archive(), b = e.target.closest('button');
  if (!b) return;
  if (b.dataset.f){ histFilter = b.dataset.f; return renderHistory(); }
  if (b.dataset.rv) return GW.reviewArchived(all[+b.dataset.rv]);
  if (b.dataset.pgn) return GW.copyText(GW.archivedPGN(all[+b.dataset.pgn]), 'PGN copied');
  if (b.dataset.rm){ const g = all[+b.dataset.rm]; return GW.startGame({mode:'cpu', human:g.human, bots:g.bots, tc:g.tc, rated:g.rated}); }
});
GW.register('history', {onShow: renderHistory});

GW.renderRailMe = () => {
  const el = $('railMe');
  if (el) el.innerHTML = `<div class="av">${avatarSVG(GW.me())}</div><div style="min-width:0"><b>${esc(profile.name || 'Player')}</b><span>${profile.rating} · Lv ${GW.levelOf(profile.xp)}${GW.dayStreak() ? ` · 🔥${GW.dayStreak()}` : ''}</span></div>`;
};
$('railMe').addEventListener('click', () => GW.show('profile'));

/* ============================== NAVIGATION & START-UP ============================== */
// Keep page content clear of the bottom tab bar, whatever height it ends up (large fonts make it taller)
{
  const rail = document.querySelector('.rail');
  const fit = () => {
    const bottom = getComputedStyle(rail).position === 'fixed';
    document.documentElement.style.setProperty('--tabbar-h', bottom ? Math.ceil(rail.getBoundingClientRect().height) + 'px' : '0px');
  };
  try { new ResizeObserver(fit).observe(rail); } catch (_) {}
  addEventListener('resize', fit);
  fit();
}
document.querySelector('.rail').addEventListener('click', e => {
  const b = e.target.closest('.nav');
  if (!b) return;
  const n = b.dataset.nav;
  if (n === 'settings') return openSettings();
  if (n === 'more'){
    const items = [['cups', '🏆', 'Cups'], ['openings', '📖', 'Openings'], ['analysis', '🔍', 'Analysis'], ['world', '🌍', 'World chess'], ['legends', '🏛️', 'Legends'], ['history', '🕘', 'My games'], ['customize', '🎨', 'Customize'], ['profile', '🏅', 'Profile'], ['settings', '⚙️', 'Settings']].concat(GW.canExit() ? [['exit', '⏻', 'Exit app']] : []);
    const m = GW.modal(`<h2>More</h2><div class="more-grid">${items.map(([k, i, t]) => `<button class="more-item" type="button" data-more="${k}"><span>${i}</span>${t}</button>`).join('')}</div>`);
    m.addEventListener('click', ev => { const x = ev.target.closest('[data-more]'); if (!x) return; GW.closeModal(); if (x.dataset.more === 'settings') openSettings(); else if (x.dataset.more === 'exit') GW.confirmExit(); else GW.show(x.dataset.more); });
    return;
  }
  if (n === 'play'){ const g = GW.currentGame(); return GW.show(g && !g.over ? 'game' : 'setup'); }
  GW.show(n);
});
document.addEventListener('keydown', e => { if (e.key === 'Escape'){ GW.closeModal(); GW.boards.forEach(b => b.cancelPromo()); } });

let hiddenAt = 0;
document.addEventListener('visibilitychange', () => {
  if (document.hidden){ hiddenAt = Date.now(); return; }
  if (hiddenAt && Date.now() - hiddenAt > 60000 && !document.getElementById('landing')){ GW.closeModal(); if (GW.currentScreen() !== 'home') GW.show('home'); }
  hiddenAt = 0;
});
window.claude?.hot?.snapshot?.(() => ({screen: GW.currentScreen(), game: GW.snapshotGame ? GW.snapshotGame() : null}));
function boot(data){
  const pack = GW.autoPack();
  GW.applySettings();
  if (pack) setTimeout(() => GW.toast(`${pack.icon} <b>${esc(pack.name)} theme is on</b><br>${esc(pack.line)} Change it any time in Customize.`), 900);
  if (data && data.game && data.screen === 'game') return GW.restoreGame(data.game);
  // Resume a game left unfinished when the app was closed
  let live = null;
  try { live = JSON.parse(localStorage.getItem('gw-live') || 'null'); } catch (_) {}
  if (live && Array.isArray(live.moves) && live.moves.length && profile.onboarded){
    try { GW.restoreGame(live); setTimeout(() => GW.toast('<b>Your game is saved</b><br>Tap Continue game to carry on.'), 600); } catch (_) {}
  }
  GW.show('home');
  const next = () => { if (!profile.onboarded) setTimeout(onboarding, 300); else GW.show('home'); };
  if (GW.needsLanding && GW.needsLanding()) GW.landing({onDone: next}); else next();
}
window.claude?.hot?.ready ? window.claude.hot.ready(boot) : boot(window.claude?.hot?.data ?? {});
})();
