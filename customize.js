/* Greenwood Chess: Customize. Seasonal and holiday packs, boards, piece sets, colourways, sounds and effects,
   all previewed on a live board. */
(() => {
const GW = window.GW;
const {C, D, $, esc, settings, sfx, Board} = GW;
const PREVIEW_FEN = 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 1 5';

// Small boards that preview another style: their own squares, pieces drawn from their own CSS classes
const pvSheet = document.createElement('style');
document.head.appendChild(pvSheet);
const pvDone = new Set();
function pvClass(setId, cwId){
  const key = `pv-${setId}-${cwId}-${settings.finish === false ? 'flat' : 'fin'}`.replace(/[^a-z0-9-]/gi, '');
  if (!pvDone.has(key)){
    pvDone.add(key);
    pvSheet.textContent += GW.PIECE_KEYS.map(k => `.${key} .pc-${k}{background-image:${GW.pieceImg(k, setId, cwId)}!important}`).join('\n') + '\n';
  }
  return key;
}
const themeVars = t => `--sq-l:${t.l};--sq-d:${t.d};--board-bg:${t.bg || 'transparent'}`;
// A 4×2 strip of squares with king, queen, knight, pawn for each side
function strip(themeId, setId, cwId){
  const t = D.THEMES.find(x => x.id === themeId) || D.THEMES[0];
  const cls = pvClass(setId, cwId), row1 = ['bK', 'bQ', 'bN', 'bP'], row2 = ['wP', 'wN', 'wQ', 'wK'];
  const cells = [...row1, ...row2].map((p, i) => `<i class="${((i >> 2) + (i & 3)) % 2 ? 'd' : 'l'}"><b class="pc-${p}"></b></i>`).join('');
  return `<div class="mini strip ${cls}" style="${themeVars(t).replace(/"/g, '&quot;')}">${cells}</div>`;
}

let tab = 'packs', previewBoard = null;
function render(){
  const tabs = [['packs', 'Seasons & holidays'], ['boards', 'Boards'], ['pieces', 'Pieces'], ['colors', 'Colourways'], ['sound', 'Sound'], ['avatar', 'Character']];
  const now = D.packsFor(new Date(), settings.hemisphere), nowIds = now.map(p => p.id);
  let body = '';
  if (tab === 'packs'){
    const ordered = [...now, ...D.PACKS.filter(p => !nowIds.includes(p.id))];
    body = `<div class="muted small" style="margin-bottom:10px">Each pack sets the board, the pieces, the colours and a little weather on the board. ${settings.autoPack ? 'Auto mode switches packs for you as the holidays and seasons change.' : ''}</div>
      <div class="pack-grid"><button class="pack${!settings.fxPack ? ' on' : ''}" type="button" data-own="1">${strip(GW.ownLook().theme, GW.ownLook().pieces, GW.ownLook().colorway)}<div class="pack-txt"><b>My own look</b><span class="muted small">Your own board and pieces, with no seasonal theme.</span></div></button>${ordered.map(p => `<button class="pack${settings.fxPack === p.id ? ' on' : ''}" type="button" data-pack="${p.id}">
        ${strip(p.board, p.pieces, p.colorway)}<div class="pack-txt"><b>${p.icon} ${esc(p.name)}</b>${nowIds.includes(p.id) ? '<span class="tag gold">Now</span>' : ''}<span class="muted small">${esc(p.line)}</span></div></button>`).join('')}</div>`;
  } else if (tab === 'boards'){
    const groups = [...new Set(D.THEMES.map(t => t.group))];
    body = groups.map(g => `<div class="label">${esc(g)}</div><div class="themes">${D.THEMES.filter(t => t.group === g).map(t => `<button class="theme" type="button" data-theme="${t.id}" aria-pressed="${t.id === settings.theme}"><div class="sw" style="${themeVars(t).replace(/"/g, '&quot;')};background:var(--board-bg)"><i style="background:var(--sq-l)"></i><i style="background:var(--sq-d)"></i><i style="background:var(--sq-d)"></i><i style="background:var(--sq-l)"></i></div>${esc(t.name)}</button>`).join('')}</div>`).join('');
  } else if (tab === 'pieces'){
    const sets = Object.entries(GW.pieceSets()), card = ([id, s]) => `<button class="pset" type="button" data-set="${id}" aria-pressed="${id === settings.pieces}">${strip(s.themed ? (D.PACKS.find(p => p.id === s.pack) || {}).board || settings.theme : settings.theme, id, settings.colorway)}<b>${esc(s.name)}</b><span class="muted small">${s.themed ? 'Seasonal characters' : `${esc(s.author)} · ${esc(s.license)}`}</span></button>`;
    body = `<div class="label">Classic shapes</div><div class="set-grid">${sets.filter(([, s]) => !s.themed).map(card).join('')}</div>
      <div class="label">Seasonal characters</div><div class="muted small" style="margin-bottom:8px">Pawns as baubles, bishops as Christmas trees, knights as reindeer… every piece keeps its chess shape so the board stays easy to read.</div><div class="set-grid">${sets.filter(([, s]) => s.themed).map(card).join('')}</div>`;
  } else if (tab === 'colors'){
    const groups = [...new Set(D.COLORWAYS.map(c => c.group))];
    body = groups.map(g => `<div class="label">${esc(g)}</div><div class="set-grid">${D.COLORWAYS.filter(c => c.group === g).map(c => `<button class="pset" type="button" data-cw="${c.id}" aria-pressed="${c.id === settings.colorway}">${strip(settings.theme, settings.pieces, c.id)}<b>${esc(c.name)}</b></button>`).join('')}</div>`).join('');
  } else if (tab === 'sound'){
    body = `<div class="stack">${GW.SOUND_PACKS.map(p => `<div class="snd${settings.soundPack === p.id ? ' on' : ''}"><button class="grow snd-pick" type="button" data-snd="${p.id}" aria-pressed="${settings.soundPack === p.id}"><b>${esc(p.name)}</b><span class="muted small">${esc(p.desc)}</span></button><button class="btn" type="button" data-try="${p.id}">▶ Listen</button></div>`).join('')}
      <label class="switch">Sound<button type="button" data-opt="sound" aria-pressed="${settings.sound}" aria-label="Sound"></button></label>
      <label class="vol"><span>Volume</span><input type="range" id="csVol" min="0" max="1" step="0.05" value="${settings.volume == null ? 0.8 : settings.volume}"></label>
      <label class="switch">Vibrate on moves (phones)<button type="button" data-opt="haptics" aria-pressed="${settings.haptics}" aria-label="Vibrate on moves"></button></label></div>`;
  } else {
    body = `<div class="panel" style="box-shadow:none"><div class="row"><div class="av huge">${GW.avatarSVG(GW.me())}</div><div class="grow"><b>Your character</b><p class="muted small">Change your face, hair, eyes, outfit and accessories in your profile.</p><button class="btn pop" type="button" id="csAvatar">Edit character</button></div></div></div>`;
  }
  $('scr-customize').innerHTML = `
  <div class="page-head"><div><div class="kicker">Make it yours</div><h1>Customize</h1><div class="muted">Boards, pieces, seasonal themes and sounds. Changes apply everywhere straight away.</div></div></div>
  <div class="cz">
    <aside class="cz-prev panel"><div id="czBoard"></div>
      <div class="muted small" id="czNow"></div>
      <label class="switch compact">Auto seasons & holidays<button type="button" data-opt="autoPack" aria-pressed="${!!settings.autoPack}" aria-label="Auto seasons and holidays"></button></label>
      <label class="switch compact">Seasonal effects on the board<button type="button" data-opt="fx" aria-pressed="${!!settings.fx}" aria-label="Seasonal effects"></button></label>
      <label class="switch compact">Character pieces in seasonal themes<button type="button" data-opt="charPieces" aria-pressed="${settings.charPieces !== false}" aria-label="Character pieces in seasonal themes"></button></label>
      <label class="switch compact">Animated pieces<button type="button" data-opt="animPieces" aria-pressed="${settings.animPieces !== false}" aria-label="Animated pieces"></button></label>
      <label class="switch compact">Premium piece finish<button type="button" data-opt="finish" aria-pressed="${settings.finish !== false}" aria-label="Premium piece finish"></button></label>
      <label class="switch compact">Coordinates<button type="button" data-opt="coords" aria-pressed="${!!settings.coords}" aria-label="Coordinates"></button></label>
      <div class="row compact-row"><span class="small">Hemisphere</span><span class="grow"></span><div class="tabs small" id="czHemi">${[['auto', 'Auto'], ['north', 'North'], ['south', 'South']].map(([v, t]) => `<button type="button" data-hemi="${v}" aria-pressed="${(settings.hemisphere || 'auto') === v}">${t}</button>`).join('')}</div></div>
    </aside>
    <section class="cz-main"><div class="chips" style="margin-bottom:14px">${tabs.map(([k, t]) => `<button class="chip-btn" type="button" data-tab="${k}" aria-pressed="${k === tab}">${t}</button>`).join('')}</div>${body}</section>
  </div>`;
  previewBoard = new Board($('czBoard'), {canMove: () => true, onMove: m => { const s = C.apply(previewBoard.s, m); previewBoard.set(s, {last:m, slides:GW.slidesFor(m, false)}); sfx.forMove(GW.moveKind(m, s), true); }});
  previewBoard.set(C.fromFEN(PREVIEW_FEN));
  paintNow();
}
function paintNow(){
  const t = D.THEMES.find(x => x.id === settings.theme), s = GW.pieceSets()[settings.pieces], cw = D.COLORWAYS.find(x => x.id === settings.colorway);
  const el = $('czNow');
  if (el) el.innerHTML = `${esc(t ? t.name : '')} board · ${esc(s ? s.name : '')} pieces · ${esc(cw ? cw.name : '')}. Try a move on the board.`;
}
// Boards are kept in GW.boards for re-rendering; drop the old preview before making a new one
const dropPreview = () => { if (previewBoard){ const i = GW.boards.indexOf(previewBoard); if (i >= 0) GW.boards.splice(i, 1); previewBoard = null; } };
function changed(){ GW.applySettings(); dropPreview(); render(); }
$('scr-customize').addEventListener('click', e => {
  const b = e.target.closest('[data-tab],[data-own],[data-pack],[data-theme],[data-set],[data-cw],[data-snd],[data-try],[data-opt],[data-hemi],#csAvatar');
  if (!b) return;
  if (b.dataset.tab){ tab = b.dataset.tab; dropPreview(); return render(); }
  if (b.id === 'csAvatar') return GW.show('profile');
  if (b.dataset.own){ GW.restoreOwnLook(); return changed(); }
  if (b.dataset.pack){ GW.applyPack(D.PACKS.find(p => p.id === b.dataset.pack)); changed(); setTimeout(GW.flyNow, 400); return; }
  if (b.dataset.theme){ settings.theme = b.dataset.theme; settings.ownLook = Object.assign(GW.ownLook(), {theme: settings.theme}); return changed(); }
  if (b.dataset.set){ settings.pieces = b.dataset.set; settings.ownLook = Object.assign(GW.ownLook(), {pieces: settings.pieces}); return changed(); }
  if (b.dataset.cw){ settings.colorway = b.dataset.cw; settings.ownLook = Object.assign(GW.ownLook(), {colorway: settings.colorway}); return changed(); }
  if (b.dataset.snd){ settings.soundPack = b.dataset.snd; GW.applySettings(); sfx.preview(); dropPreview(); return render(); }
  if (b.dataset.try){ const was = settings.soundPack; settings.soundPack = b.dataset.try; sfx.preview(); setTimeout(() => { settings.soundPack = was; }, 1400); return; }
  if (b.dataset.hemi){ settings.hemisphere = b.dataset.hemi; return changed(); }
  if (b.dataset.opt){
    const k = b.dataset.opt;
    settings[k] = ['finish', 'charPieces', 'animPieces'].includes(k) ? settings[k] === false : !settings[k];
    if (k === 'charPieces' && settings.fxPack){ const p = D.PACKS.find(x => x.id === settings.fxPack); if (p) settings.pieces = settings.charPieces !== false && GW.pieceSets()[p.pieces] ? p.pieces : p.alt; }
    if (k === 'fx' && settings.fx) setTimeout(GW.flyNow, 400);
    if (k === 'autoPack' && settings.autoPack){ settings.lastAutoPack = ''; const p = GW.autoPack(); if (p) GW.toast(`${p.icon} <b>${esc(p.name)}</b> theme is on`); }
    if (k === 'sound' && settings.sound){ sfx.unlock(); sfx.preview(); }
    return changed();
  }
});
$('scr-customize').addEventListener('input', e => { if (e.target.id === 'csVol'){ settings.volume = +e.target.value; GW.applySettings(); } });
$('scr-customize').addEventListener('change', e => { if (e.target.id === 'csVol') sfx.forMove('capture', true); });
GW.register('customize', {onShow: arg => { if (arg && arg.tab) tab = arg.tab; dropPreview(); render(); }, onHide: dropPreview});
})();
