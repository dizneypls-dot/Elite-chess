/* Elite Chess: a player's progress as one bundle, and merging two copies of it (from the cloud and this device).
   The newer profile wins; games, solved puzzles, achievements and trophies from both are kept. Used by the account
   sync (auth.js) so that playing on two devices never throws work away. */
(() => {
const GW = window.GW;
const KEYS = ['gw-profile', 'gw-settings', 'gw-archive', 'gw-fav'];
const MEDAL = {gold:3, silver:2, bronze:1};
const mod = () => +(localStorage.getItem('gw-mod') || 0);

/* ---------- Progress as a bundle, merged from two devices ---------- */
function bundle(){
  const d = {};
  for (const k of KEYS){ try { const v = localStorage.getItem(k); if (v) d[k] = JSON.parse(v); } catch (_) {} }
  return {mod: mod(), data: d};
}
const summary = b => { const p = (b.data && b.data['gw-profile']) || {}; return {name: p.name || 'Player', rating: p.rating || 800, games: p.games || 0, puzzles: (p.solved || []).length, mod: b.mod}; };
// The winner's profile and settings, plus everything collected on either device
function merge(win, lose){
  const w = win.data || {}, l = lose.data || {}, out = {};
  const wp = w['gw-profile'], lp = l['gw-profile'];
  if (wp || lp){
    const p = Object.assign({}, lp || {}, wp || {});
    if (wp && lp){
      // sorted, so both devices end up with exactly the same copy (no saving back and forth)
      for (const k of ['solved', 'achievements']) p[k] = [...new Set([...(lp[k] || []), ...(wp[k] || [])])].sort();
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
  const fav = [...new Set([...((l['gw-fav'] || {}).ids || []), ...((w['gw-fav'] || {}).ids || [])])].sort();
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
const amount = b => { const p = (b && b.data && b.data['gw-profile']) || {}; return (p.games || 0) + (p.solved || []).length + Math.round((p.xp || 0) / 10); };
GW.progress = {bundle, merge, apply, amount, summary};
})();
