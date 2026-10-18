/* Elite Chess: Legal. Credits and licences for every third-party part of the app (with the full licence texts),
   and the notices about names and marks that belong to others. Opened from Settings and the More menu. */
(() => {
const GW = window.GW, {esc} = GW;
const LIC = () => window.GW_LICENSES || {};
const LIC_NAME = {'GPL-3.0':'GNU GPL v3', 'GPL-2.0':'GNU GPL v2', 'Apache-2.0':'Apache License 2.0', 'CC-BY-4.0':'Creative Commons Attribution 4.0',
  'MIT-Monge':'MIT License', 'OFL-Outfit':'SIL Open Font License 1.1', 'OFL-PlusJakartaSans':'SIL Open Font License 1.1', 'OFL-JetBrainsMono':'SIL Open Font License 1.1'};

// Every third-party work in the app: what it is, who made it, its licence, where its source lives, and what we changed
const CREDITS = [
  {group:'Chess engine', items:[
    {name:'Stockfish 17.1 (stockfish.js build)', by:'The Stockfish developers (T. Romstad, M. Costalba, J. Kiiski, G. Linscott and contributors); JavaScript/WebAssembly build © 2025 Chess.com, LLC; network by Linmiao Xu', lic:'GPL-3.0',
      src:'https://github.com/nmrugg/stockfish.js', more:'https://github.com/official-stockfish/Stockfish', note:'Used unmodified as a separate program that the app talks to with the standard UCI protocol.'},
    {name:'Stockfish (stockfish.js and stockfish.wasm builds, used on older devices)', by:'The Stockfish developers; multi-variant support by Daniel Dugovic and contributors; compiled by Niklas Fiekas', lic:'GPL-3.0',
      src:'https://github.com/niklasf/stockfish.js', more:'https://github.com/niklasf/stockfish.wasm', note:'Used unmodified as a separate program (UCI protocol).'}
  ]},
  {group:'Optional piece sets', items:[
    {name:'Classic (cburnett)', by:'Colin M.L. Burnett', lic:'GPL-2.0', src:'https://github.com/lichess-org/lila/tree/master/public/piece/cburnett', note:'Colours and a shading finish are added by the app at display time.'},
    {name:'Merida', by:'Armando Hernandez Marroquin', lic:'GPL-2.0', src:'https://github.com/lichess-org/lila/tree/master/public/piece/merida', note:'Colours and a shading finish are added by the app at display time.'},
    {name:'Bold (mpchess)', by:'Maxime Chupin', lic:'GPL-3.0', src:'https://github.com/lichess-org/lila/tree/master/public/piece/mpchess', note:'Colours and a shading finish are added by the app at display time.'},
    {name:'Celtic, Fantasy and Spatial', by:'Maurizio Monge', lic:'MIT-Monge', src:'https://github.com/lichess-org/lila/tree/master/public/piece', note:'Colours and a shading finish are added by the app at display time.'},
    {name:'Chessnut', by:'Alexis Luengas', lic:'Apache-2.0', src:'https://github.com/lichess-org/lila/tree/master/public/piece/chessnut', note:'Modified: colours and a shading finish are added by the app at display time.'},
    {name:'Papercut', by:'Nikolay Anzarov', lic:'CC-BY-4.0', src:'https://github.com/lichess-org/lila/tree/master/public/piece', note:'Changes: colours and a shading finish are added by the app at display time.'},
    {name:'Totoy', by:'Kosal Sen', lic:'CC-BY-4.0', src:'https://github.com/lichess-org/lila/tree/master/public/piece', note:'Changes: colours and a shading finish are added by the app at display time.'},
    {name:'Terracotta', by:'RhosGFX', lic:'CC0', note:'Public domain dedication (CC0 1.0); no conditions.'}
  ]},
  {group:'Data and sounds', items:[
    {name:'Puzzle bank', by:'lichess.org puzzle database', lic:'CC0', src:'https://database.lichess.org/#puzzles', note:'Public domain (CC0 1.0). A selection is included.'},
    {name:'Opening names', by:'lichess-org/chess-openings', lic:'CC0', src:'https://github.com/lichess-org/chess-openings', note:'Public domain (CC0 1.0).'},
    {name:'Recorded move sounds', by:'Amatsuuu (“Chess_foley”), simone_ds (“chess pieces”), JJTaynos (“Chess Pieces Move (Far)”), mh2o (“chess_move_on_alabaster”) on freesound.org', lic:'CC0', note:'Public domain (CC0 1.0); trimmed and mixed.'},
    {name:'World rankings', by:'Public FIDE rating lists', lic:'facts', note:'Ratings, results and the moves of games are facts and are shown for information.'}
  ]},
  {group:'Fonts', items:[
    {name:'Outfit', by:'The Outfit Project Authors', lic:'OFL-Outfit', src:'https://github.com/Outfitio/Outfit-Fonts'},
    {name:'Plus Jakarta Sans', by:'The Plus Jakarta Sans Project Authors (Tokotype)', lic:'OFL-PlusJakartaSans', src:'https://github.com/tokotype/PlusJakartaSans'},
    {name:'JetBrains Mono', by:'The JetBrains Mono Project Authors', lic:'OFL-JetBrainsMono', src:'https://github.com/JetBrains/JetBrainsMono'}
  ]},
  {group:'Online services', items:[
    {name:'PeerJS server', by:'PeerJS (peerjs.com)', lic:'service', note:'Connects players for online games; the games themselves run directly between the two devices.'},
    {name:'Firebase', by:'Google', lic:'service', note:'Optional accounts and saving progress across devices.'},
    {name:'Live sports scores', by:'ESPN public scoreboards and motogp.com', lic:'service', note:'Shown for information only. No logos are used.'}
  ]}
];
const licLabel = id => id === 'CC0' ? 'CC0 (public domain)' : id === 'facts' ? 'Facts (no licence needed)' : id === 'service' ? 'Online service' : LIC_NAME[id] || id;
const link = (u, t) => `<a href="${esc(u)}" target="_blank" rel="noopener noreferrer">${esc(t || u.replace(/^https:\/\//, ''))}</a>`;

const NOTICES = `
  <p><b>Original work.</b> The Elite Chess app, its code, its characters (the holiday and sports piece sets and their animated scenes), the Tournament Wood set, its boards, artwork, lessons and text are original work of Elite Chess. The third-party parts listed under Credits stay under their own licences, and nothing here limits the rights those licences give you.</p>
  <p><b>Not affiliated.</b> Elite Chess is independent. It is not affiliated with, sponsored or endorsed by FIDE, lichess.org, Chess.com, the Stockfish project, or any sports league, team, event, competition or organiser. Names of events, teams, leagues and players appear only to identify them (for example in live scores and rankings) and belong to their owners. The sports themes are generic and use no official logos.</p>
  <p><b>Open-source source code.</b> Stockfish is free software under the GNU GPL v3: you may use, change and share it under that licence. Its complete source code is at the links under Credits, and the exact engine files the app runs are published at elitechess.online.</p>`;

function render(tab){
  if (tab === 'notices') return NOTICES;
  return CREDITS.map(g => `<div class="lg-group"><div class="label">${esc(g.group)}</div>${g.items.map(it => `<div class="lg-item">
      <div class="lg-h"><b>${esc(it.name)}</b><span class="lg-lic">${esc(licLabel(it.lic))}</span></div>
      <div class="muted small">${esc(it.by)}</div>
      ${it.note ? `<div class="small">${esc(it.note)}</div>` : ''}
      ${it.src || it.more ? `<div class="small">Source: ${[it.src, it.more].filter(Boolean).map(u => link(u)).join(' · ')}</div>` : ''}
      ${LIC()[it.lic] ? `<details class="lg-text"><summary>Read the ${esc(LIC_NAME[it.lic])}</summary><pre>${esc(LIC()[it.lic])}</pre></details>` : ''}
    </div>`).join('')}</div>`).join('');
}
function openLegal(tab = 'credits'){
  const TABS = [['credits', 'Credits & licences'], ['notices', 'Notices']];
  const m = GW.modal(`<h2>Legal</h2>
    <div class="tabs" id="lgTabs">${TABS.map(([v, t]) => `<button type="button" data-lg="${v}" aria-pressed="${v === tab}">${t}</button>`).join('')}</div>
    <div class="lg-body" id="lgBody">${render(tab)}</div>
    <div class="row"><span class="grow"></span><button class="btn pop" type="button" id="lgDone">Done</button></div>`, {wide:true});
  m.addEventListener('click', e => { const b = e.target.closest('[data-lg]'); if (!b) return;
    m.querySelectorAll('[data-lg]').forEach(x => x.setAttribute('aria-pressed', String(x === b))); m.querySelector('#lgBody').innerHTML = render(b.dataset.lg); m.querySelector('#lgBody').scrollTop = 0; });
  m.querySelector('#lgDone').addEventListener('click', () => GW.closeModal());
}
GW.openLegal = openLegal;
GW.LEGAL_CREDITS = CREDITS;
})();
