/* Elite Chess: the world's top sporting events while they are on, with live scores. Formula 1 and MotoGP race
   weekends, tennis Grand Slams, golf majors, the FIFA World Cup, Super Bowl, World Series, NBA Finals, Stanley Cup
   Final, Champions League final, AFL and NRL Grand Finals, big cricket tournaments, numbered UFC events and the
   Rugby World Cup. Scores come from ESPN's public scoreboards (read straight from the page); MotoGP comes from
   sports/motogp.json on the website, which a GitHub workflow refreshes on race weekends.
   Only the top events are shown: live first, then starting soon, then just finished, ordered by what matters in
   the player's country. Feeds are only read in their season, every 30 s while something is live, every 10 min
   otherwise, and only while Home or the Sport screen is on screen. */
(() => {
const GW = window.GW;
const {$, esc} = GW;
const framed = !!(window.claude && typeof window.claude.use === 'function');
const ESPN = 'https://site.web.api.espn.com/apis/site/v2/sports/', TICKER = 'https://site.web.api.espn.com/apis/v2/scoreboard/header?sport=';
const MOTOGP = /^https?:$/.test(location.protocol) && /elitechess\.online$/.test(location.hostname) ? 'sports/motogp.json' : 'https://elitechess.online/sports/motogp.json';
const H = 3600e3, DAY = 24 * H;
const notes = e => ((e.competitions && e.competitions[0] && e.competitions[0].notes) || []).map(n => n.headline).join(' ');
const postSeason = e => e.season && (e.season.type === 3 || /post/.test(e.season.slug || ''));

/* ---------- the top events, and how to recognise them in each feed ----------
   kind: match (two teams), race, golf, fights, tennis, cricket, motogp
   months: only read the feed in these months (1-12); lead: show this many days before it starts */
const FEEDS = [
  {id:'f1', name:'Formula 1', icon:'🏎️', kind:'race', url:ESPN + 'racing/f1/scoreboard', lead:4, top:() => true},
  {id:'motogp', name:'MotoGP', icon:'🏍️', kind:'motogp', url:MOTOGP, lead:4},
  {id:'tennis', name:'Tennis', icon:'🎾', kind:'tennis', url:TICKER + 'tennis', lead:1},
  {id:'golf', name:'Golf', icon:'⛳', kind:'golf', url:ESPN + 'golf/pga/scoreboard', months:[4, 5, 6, 7], lead:3, top:e => /^(Masters Tournament|PGA Championship|U\.S\. Open|The Open)\b/.test(e.name)},
  {id:'wc', name:'FIFA World Cup', icon:'🏆', kind:'match', url:ESPN + 'soccer/fifa.world/scoreboard', lead:2, top:() => true, many:true},
  {id:'wwc', name:'FIFA Women’s World Cup', icon:'🏆', kind:'match', url:ESPN + 'soccer/fifa.wwc/scoreboard', months:[6, 7, 8], lead:2, top:() => true, many:true},
  {id:'euro', name:'UEFA Euro', icon:'⚽', kind:'match', url:ESPN + 'soccer/uefa.euro/scoreboard', months:[6, 7], lead:2, top:() => true, many:true},
  {id:'copa', name:'Copa América', icon:'⚽', kind:'match', url:ESPN + 'soccer/conmebol.america/scoreboard', months:[6, 7], lead:2, top:() => true, many:true},
  {id:'ucl', name:'Champions League Final', icon:'⚽', kind:'match', url:ESPN + 'soccer/uefa.champions/scoreboard', months:[5, 6], lead:7, top:e => /final/.test((e.season || {}).slug || '')},
  {id:'nfl', name:'Super Bowl', icon:'🏈', kind:'match', url:ESPN + 'football/nfl/scoreboard', months:[1, 2], lead:10, top:e => /Super Bowl/i.test(notes(e))},
  {id:'afl', name:'AFL Grand Final', icon:'🏉', kind:'match', url:ESPN + 'australian-football/afl/scoreboard', months:[9, 10], lead:7, top:(e, all) => /\bGF\b|Grand Final/i.test(notes(e)) || (postSeason(e) && all.length === 1)},
  {id:'nrl', name:'NRL Grand Final', icon:'🏉', kind:'match', url:ESPN + 'rugby-league/3/scoreboard', months:[9, 10], lead:7, top:(e, all) => /Grand Final/i.test(notes(e)) || (postSeason(e) && all.length === 1)},
  {id:'mlb', name:'World Series', icon:'⚾', kind:'match', url:ESPN + 'baseball/mlb/scoreboard', months:[10, 11], lead:2, top:e => /World Series/i.test(notes(e))},
  {id:'nba', name:'NBA Finals', icon:'🏀', kind:'match', url:ESPN + 'basketball/nba/scoreboard', months:[5, 6], lead:2, top:e => /NBA Finals/i.test(notes(e))},
  {id:'nhl', name:'Stanley Cup Final', icon:'🏒', kind:'match', url:ESPN + 'hockey/nhl/scoreboard', months:[5, 6], lead:2, top:e => /Stanley Cup Final/i.test(notes(e))},
  {id:'rwc', name:'Rugby World Cup', icon:'🏉', kind:'match', url:ESPN + 'rugby/164205/scoreboard', months:[9, 10, 11], lead:2, top:() => true, many:true},
  {id:'ufc', name:'UFC', icon:'🥊', kind:'fights', url:ESPN + 'mma/ufc/scoreboard', lead:3, top:e => /^UFC \d+/.test(e.name)},
  {id:'cricket', name:'Cricket', icon:'🏏', kind:'cricket', url:TICKER + 'cricket', lead:1, league:/World Cup|Ashes|Champions Trophy|World Test Championship|Border-Gavaskar/i}
];
// what people follow most, by country (the rest come after)
const FAVS = {
  AU:['afl', 'nrl', 'cricket', 'motogp', 'tennis', 'f1', 'rwc', 'golf'], NZ:['rwc', 'cricket', 'nrl', 'f1'], US:['nfl', 'mlb', 'nba', 'nhl', 'golf', 'ufc', 'f1', 'wc'], CA:['nhl', 'nba', 'mlb', 'nfl'],
  GB:['wc', 'euro', 'ucl', 'cricket', 'f1', 'tennis', 'golf', 'rwc'], IE:['rwc', 'golf', 'ucl'], IN:['cricket', 'f1', 'tennis'], PK:['cricket'], ZA:['rwc', 'cricket', 'golf'],
  IT:['motogp', 'f1', 'ucl', 'euro'], ES:['motogp', 'f1', 'tennis', 'ucl', 'euro'], FR:['rwc', 'tennis', 'ucl', 'f1'], BR:['wc', 'copa', 'f1'], AR:['wc', 'copa'], MX:['f1', 'wc'], DE:['euro', 'ucl', 'f1'], NL:['f1', 'euro']
};
const SPORT_OF = id => FEEDS.find(f => f.id === id);

/* ---------- reading the feeds ---------- */
const S = {raw:{}, at:{}, live:{}, cards:[], later:[], updated:0, busy:false, err:false};
try { const c = JSON.parse(localStorage.getItem('gw-sports') || 'null'); if (c && Date.now() - c.updated < 6 * H){ S.cards = c.cards || []; S.later = c.later || []; S.updated = c.updated; } } catch (_) {}
const inSeason = f => !f.months || f.months.includes(new Date().getMonth() + 1);
async function getJSON(url){
  const ctl = typeof AbortController === 'function' ? new AbortController() : null;
  const t = setTimeout(() => ctl && ctl.abort(), 15000);
  try { const r = await fetch(url + (url.includes('?') ? '&' : '?') + '_=' + Math.floor(Date.now() / 30000), ctl ? {signal:ctl.signal} : {}); if (!r.ok) throw new Error(r.status); return await r.json(); }
  finally { clearTimeout(t); }
}
async function refresh(force = false){
  if (S.busy || framed || !navigator.onLine) return;
  S.busy = true;
  const now = Date.now();
  const due = FEEDS.filter(f => inSeason(f) && (force || !S.at[f.id] || now - S.at[f.id] > (S.live[f.id] ? 25000 : 10 * 60e3)));
  let ok = 0;
  await Promise.all(due.map(async f => { try { S.raw[f.id] = await getJSON(f.url); S.at[f.id] = Date.now(); ok++; } catch (_) {} }));
  if (due.length && !ok && !S.cards.length) S.err = true; else S.err = false;
  if (ok){
    build(); S.updated = Date.now();
    try { localStorage.setItem('gw-sports', JSON.stringify({cards:S.cards, later:S.later, updated:S.updated})); } catch (_) {}
    // a top event starting (or ending) switches the board theme, like the holidays do
    const p = GW.autoPack && GW.autoPack();
    if (p){ GW.applySettings(); GW.toast(`${p.icon} <b>${esc(p.name)} theme is on</b><br>${esc(p.line)} Change it any time in Customize.`); }
  }
  S.busy = false;
  paint();
}

/* ---------- turning feeds into cards ---------- */
const img = u => typeof u === 'string' && /^https:\/\/a\.espncdn\.com\//.test(u) ? u : '';
const stateOf = st => st === 'in' ? 'in' : st === 'post' ? 'post' : 'pre';
// show it if it's live, starts soon, or finished in the last day and a half
function relevant(state, start, lead, end){
  const now = Date.now();
  if (state === 'in') return true;
  if (state === 'pre') return start - now < lead * DAY && start - now > -12 * H;
  return now - (end || start) < 36 * H;
}
function teamMatch(e){
  const c = e.competitions[0], st = c.status.type;
  // long names ("Brisbane Lions") give way to the club name ("Lions") so scores stay readable on phones
  const side = t => ({name:(t.team.shortDisplayName || t.team.displayName || '').length > 11 ? (t.team.name || t.team.abbreviation || t.team.shortDisplayName) : (t.team.shortDisplayName || t.team.displayName), abbr:t.team.abbreviation, logo:img(t.team.logo), score:t.score, win:!!t.winner});
  const home = c.competitors.find(t => t.homeAway === 'home') || c.competitors[0], away = c.competitors.find(t => t !== home);
  return {a:side(away), b:side(home), state:stateOf(st.state), status:st.shortDetail, date:Date.parse(e.date), note:notes(e), venue:(c.venue || {}).fullName || ''};
}
function build(){
  const cards = [], later = [], country = (GW.profile && GW.profile.country) || '';
  for (const f of FEEDS){
    const d = S.raw[f.id];
    if (!d) continue;
    try {
      if (f.kind === 'match'){
        const evs = (d.events || []).filter(e => f.top(e, d.events)).map(teamMatch).filter(m => relevant(m.state, m.date, f.lead));
        if (!evs.length){ S.live[f.id] = false; continue; }
        evs.sort((x, y) => (x.state === 'in' ? -1 : 0) - (y.state === 'in' ? -1 : 0) || x.date - y.date);
        const title = f.many ? f.name : (evs[0].note.split(' - ')[0] || f.name).replace(/^GF\b.*/, f.name);
        cards.push({id:f.id, icon:f.icon, sport:f.name, title, kind:'match', state:best(evs), date:evs[0].date, matches:evs.slice(0, f.many ? 8 : 3)});
      } else if (f.kind === 'race'){
        for (const e of d.events || []){
          const sess = (e.competitions || []).map(c => ({label:(c.type || {}).abbreviation || 'Session', date:Date.parse(c.date), state:stateOf(c.status.type.state), status:c.status.type.shortDetail,
            rows:(c.competitors || []).slice().sort((x, y) => (x.order || 99) - (y.order || 99)).slice(0, 10).map(x => ({pos:x.order, name:(x.athlete || {}).displayName || '', team:((x.vehicle || {}).manufacturer) || (x.team || {}).displayName || '', flag:img(((x.athlete || {}).flag || {}).href)}))}));
          if (!sess.length) continue;
          const live = sess.find(s => s.state === 'in'), last = sess.filter(s => s.state === 'post').pop(), next = sess.find(s => s.state === 'pre');
          const state = live ? 'in' : next ? 'pre' : 'post', start = sess[0].date, end = sess[sess.length - 1].date + 3 * H;
          if (!relevant(state === 'pre' && last ? 'in' : state, next ? next.date : start, f.lead, end)) continue;
          cards.push({id:f.id, icon:f.icon, sport:f.name, title:e.name.replace(/^(MSC Cruises|Qatar Airways|Heineken|Aramco|Gulf Air|STC|Crypto\.com|Lenovo|Pirelli|Moët & Chandon|AWS|Tag Heuer|Singapore Airlines|Etihad Airways|Formula 1)\s+/i, ''),
            sub:(e.circuit || {}).fullName || '', kind:'race', state: live ? 'in' : state === 'pre' && last ? 'weekend' : state, date:(live || next || last || sess[0]).date, live, last, next, sessions:sess.map(({label, date, state}) => ({label, date, state}))});
        }
        for (const c of (d.leagues && d.leagues[0] && d.leagues[0].calendar) || []) if (c.startDate && Date.parse(c.startDate) > Date.now() + f.lead * DAY){ later.push({id:f.id, icon:f.icon, sport:f.name, title:String(c.label || '').replace(/^(MSC Cruises|Qatar Airways|Heineken|Aramco|Gulf Air|STC|Crypto\.com|Lenovo|Pirelli|Moët & Chandon|AWS|Tag Heuer|Singapore Airlines|Etihad Airways)\s+/i, ''), date:Date.parse(c.startDate)}); break; }
      } else if (f.kind === 'golf'){
        for (const e of (d.events || []).filter(f.top)){
          const c = e.competitions[0], st = c.status.type, state = stateOf(st.state);
          if (!relevant(state, Date.parse(e.date), f.lead, Date.parse(e.endDate || e.date) + DAY)) continue;
          cards.push({id:f.id, icon:f.icon, sport:'Golf major', title:e.name, kind:'golf', state, date:Date.parse(e.date), status:st.shortDetail,
            rows:(c.competitors || []).slice().sort((x, y) => (x.order || 999) - (y.order || 999)).slice(0, 6).map(x => ({pos:x.order, name:(x.athlete || {}).displayName || '', score:x.score, flag:img(((x.athlete || {}).flag || {}).href)}))});
        }
        for (const c of (d.leagues && d.leagues[0] && d.leagues[0].calendar) || []) if (f.top({name:c.label || ''}) && Date.parse(c.startDate) > Date.now() + f.lead * DAY){ later.push({id:f.id, icon:f.icon, sport:'Golf major', title:c.label, date:Date.parse(c.startDate)}); break; }
      } else if (f.kind === 'fights'){
        for (const e of (d.events || []).filter(f.top)){
          const comps = e.competitions || [], state = comps.some(c => c.status.type.state === 'in') ? 'in' : comps.every(c => c.status.type.state === 'post') ? 'post' : 'pre';
          if (!relevant(state, Date.parse(e.date), f.lead)) continue;
          cards.push({id:f.id, icon:f.icon, sport:'UFC', title:e.name, kind:'fights', state, date:Date.parse(e.date),
            fights:comps.slice(-4).reverse().map(c => ({weight:(c.type || {}).abbreviation || '', a:c.competitors.map(x => ({name:(x.athlete || {}).displayName || '', win:!!x.winner})), status:c.status.type.shortDetail, state:stateOf(c.status.type.state)}))});
        }
      } else if (f.kind === 'tennis'){
        // Grand Slams only: one card per tournament, singles matches, live ones first
        const byT = new Map();
        for (const l of (d.sports && d.sports[0] && d.sports[0].leagues) || []) for (const e of l.events || []){
          if (!e.major || !/singles/i.test((e.competitionType || {}).text || '')) continue;
          const t = byT.get(e.name) || []; t.push({tour:l.abbreviation || l.name, round:(e.round || {}).displayName || '', type:(e.competitionType || {}).text || '', state:stateOf(e.status), status:e.summary || ((e.fullStatus || {}).type || {}).shortDetail || '',
            date:Date.parse(e.date), p:(e.competitors || []).map(x => ({name:x.displayName || x.name || '', win:!!x.winner, sets:(x.linescores || []).map(s => s.value), flag:img(x.flag && x.flag.href || x.logo)}))}); byT.set(e.name, t);
        }
        for (const [name, ms] of byT){
          const rel = ms.filter(m => relevant(m.state, m.date, f.lead));
          if (!rel.length) continue;
          rel.sort((x, y) => (x.state === 'in' ? -1 : x.state === 'pre' ? 1 : 0) - (y.state === 'in' ? -1 : y.state === 'pre' ? 1 : 0) || x.date - y.date);
          cards.push({id:f.id, icon:f.icon, sport:'Grand Slam', title:name, kind:'tennis', state:best(rel), date:rel[0].date, matches:rel.slice(0, 8)});
        }
      } else if (f.kind === 'cricket'){
        for (const l of (d.sports && d.sports[0] && d.sports[0].leagues) || []){
          if (!f.league.test(l.name || '')) continue;
          const ms = (l.events || []).map(e => ({title:e.name, state:stateOf(e.status), status:((e.fullStatus || {}).longSummary) || e.summary || '', date:Date.parse(e.date), desc:e.description || '',
            t:(e.competitors || []).map(x => ({name:x.displayName || x.name || '', score:x.score || '', logo:img(x.logo), win:!!x.winner}))})).filter(m => relevant(m.state, m.date, f.lead, m.date + 4 * DAY));
          if (ms.length) cards.push({id:f.id, icon:f.icon, sport:'Cricket', title:l.name, kind:'cricket', state:best(ms), date:ms[0].date, matches:ms.slice(0, 4)});
        }
      } else if (f.kind === 'motogp'){
        const now = Date.now();
        for (const e of d.events || []){
          const sess = (e.sessions || []).map(s => ({label:s.label, type:s.type, date:Date.parse(s.date), status:s.status, rows:s.results || []}));
          const live = sess.find(s => s.status && !/NOT-STARTED|FINISHED/.test(s.status) && now - s.date < 3 * H && now >= s.date);
          const done = sess.filter(s => s.status === 'FINISHED'), next = sess.find(s => s.status === 'NOT-STARTED' && s.date > now - H);
          const start = Date.parse(e.start), end = Date.parse(e.end) + DAY;
          const state = live ? 'in' : done.length && next ? 'weekend' : done.length ? 'post' : 'pre';
          if (!relevant(state === 'weekend' ? 'in' : state, next ? next.date : start, f.lead, end)) { if (state === 'pre' && start > now && !later.some(x => x.id === 'motogp')) later.push({id:f.id, icon:f.icon, sport:f.name, title:titleCase(e.name), date:start}); continue; }
          const last = done.filter(s => s.rows.length).pop();
          cards.push({id:f.id, icon:f.icon, sport:f.name, title:titleCase(e.name), sub:e.circuit, kind:'race', state, date:(live || next || last || sess[0] || {date:start}).date,
            live: live && {label:live.label, rows:live.rows, status:'Live'}, last: last && {label:last.label, rows:last.rows, status:'Final'}, next, sessions:sess.map(({label, date, status}) => ({label, date, state:status === 'FINISHED' ? 'post' : 'pre'})), delayed:true});
        }
        if (d.last && !cards.some(c => c.id === 'motogp')){
          const race = (d.last.sessions || []).find(s => s.type === 'RAC' && (s.results || []).length);
          if (race && Date.now() - Date.parse(race.date) < 36 * H) cards.push({id:f.id, icon:f.icon, sport:f.name, title:titleCase(d.last.name), sub:d.last.circuit, kind:'race', state:'post', date:Date.parse(race.date), last:{label:'Race', rows:race.results, status:'Final'}, sessions:[]});
        }
      }
      S.live[f.id] = cards.some(c => c.id === f.id && (c.state === 'in' || c.state === 'weekend'));
    } catch (_) {}
  }
  const fav = FAVS[country] || [];
  const rank = c => (c.state === 'in' ? 0 : c.state === 'weekend' ? 1 : c.state === 'pre' ? 2 : 3) * 100 + (fav.includes(c.id) ? fav.indexOf(c.id) : 50);
  S.cards = cards.sort((a, b) => rank(a) - rank(b) || a.date - b.date);
  S.later = later.filter(l => !cards.some(c => c.id === l.id)).sort((a, b) => a.date - b.date);
}
const best = ms => ms.some(m => m.state === 'in') ? 'in' : ms.some(m => m.state === 'pre') ? (ms.some(m => m.state === 'post') ? 'weekend' : 'pre') : 'post';
const titleCase = s => String(s || '').toLowerCase().replace(/\b\w/g, ch => ch.toUpperCase()).replace(/\bOf\b/g, 'of').replace(/\bGp\b/g, 'GP');

/* ---------- drawing ---------- */
const fmtTime = t => { const d = new Date(t), now = new Date(), days = Math.round((new Date(d.toDateString()) - new Date(now.toDateString())) / DAY);
  const hm = d.toLocaleTimeString(undefined, {hour:'numeric', minute:'2-digit'});
  return days === 0 ? `Today ${hm}` : days === 1 ? `Tomorrow ${hm}` : days > 1 && days < 7 ? `${d.toLocaleDateString(undefined, {weekday:'long'})} ${hm}` : d.toLocaleDateString(undefined, {day:'numeric', month:'short'}) + ' ' + hm; };
const badge = st => st === 'in' ? '<span class="sp-live">● LIVE</span>' : st === 'weekend' ? '<span class="sp-on">ON NOW</span>' : st === 'post' ? '<span class="sp-done">RESULT</span>' : '<span class="sp-soon">SOON</span>';
const logo = u => u ? `<img src="${esc(u)}" alt="" loading="lazy" referrerpolicy="no-referrer">` : '';
function matchRow(m){
  const sc = (t, o) => m.state === 'pre' ? '' : `<b class="${t.win || (m.state === 'post' && +t.score > +o.score) ? 'w' : ''}">${esc(t.score || '0')}</b>`;
  return `<div class="sp-m"><span class="sp-t">${logo(m.a.logo)}${esc(m.a.name)}</span>${sc(m.a, m.b)}<span class="sp-st ${m.state}">${m.state === 'pre' ? esc(fmtTime(m.date)) : esc(m.status)}</span>${sc(m.b, m.a)}<span class="sp-t r">${esc(m.b.name)}${logo(m.b.logo)}</span></div>`;
}
function raceRows(s){ return `<ol class="sp-race">${s.rows.slice(0, 5).map(r => `<li><span class="sp-pos">${esc(r.pos || '')}</span>${logo(r.flag)}<b>${esc(r.name)}</b><span class="muted">${esc(r.team || '')}</span>${r.time ? `<span class="sp-gap">${esc(r.time)}</span>` : ''}</li>`).join('')}</ol>`; }
function detail(c){
  if (c.kind === 'match') return c.matches.map(m => `${!c.title.includes(m.note) && m.note && c.matches.length < 4 ? `<div class="sp-note">${esc(m.note)}</div>` : ''}${matchRow(m)}`).join('');
  if (c.kind === 'race'){
    let h = '';
    if (c.live && c.live.rows.length) h += `<div class="sp-note">${esc(c.live.label)} · live${c.delayed ? ' (updates every 15 min)' : ''}</div>${raceRows(c.live)}`;
    else if (c.live) h += `<div class="sp-note">${esc(c.live.label)} is on now</div>`;
    if (!c.live && c.last && c.last.rows.length) h += `<div class="sp-note">${esc(c.last.label)} result</div>${raceRows(c.last)}`;
    if (c.next && c.state !== 'post') h += `<div class="sp-next">Next: <b>${esc(c.next.label)}</b> · ${esc(fmtTime(c.next.date))}</div>`;
    if (c.state === 'pre' && c.sessions.length) h += `<div class="sp-sess">${c.sessions.map(s => `<span>${esc(s.label)} <b>${esc(fmtTime(s.date))}</b></span>`).join('')}</div>`;
    return h;
  }
  if (c.kind === 'golf') return `<div class="sp-note">${esc(c.state === 'pre' ? 'Starts ' + fmtTime(c.date) : c.status)}</div>${c.rows.length ? `<ol class="sp-race">${c.rows.map(r => `<li><span class="sp-pos">${esc(r.pos || '')}</span>${logo(r.flag)}<b>${esc(r.name)}</b><span class="sp-gap">${esc(r.score || '')}</span></li>`).join('')}</ol>` : ''}`;
  if (c.kind === 'fights') return c.fights.map(f => `<div class="sp-m fight"><span class="sp-t">${f.a[0] ? `${f.a[0].win ? '🏆 ' : ''}${esc(f.a[0].name)}` : ''}</span><span class="sp-st ${f.state}">${esc(f.state === 'pre' ? f.weight : f.status)}</span><span class="sp-t r">${f.a[1] ? `${esc(f.a[1].name)}${f.a[1].win ? ' 🏆' : ''}` : ''}</span></div>`).join('');
  if (c.kind === 'tennis') return c.matches.map(m => `<div class="sp-ten"><div class="sp-note">${esc(m.tour)} · ${esc(m.round)}${m.state === 'pre' ? ' · ' + esc(fmtTime(m.date)) : ''}</div>${m.p.map(p => `<div class="sp-tp${p.win ? ' w' : ''}">${logo(p.flag)}<span>${esc(p.name)}</span>${p.sets.map(v => `<b>${esc(v)}</b>`).join('')}</div>`).join('')}${m.state === 'in' && m.status ? `<div class="sp-note live">${esc(m.status)}</div>` : ''}</div>`).join('');
  if (c.kind === 'cricket') return c.matches.map(m => `<div class="sp-ten"><div class="sp-note">${esc(m.desc)}</div>${m.t.map(t => `<div class="sp-tp${t.win ? ' w' : ''}">${logo(t.logo)}<span>${esc(t.name)}</span><b>${esc(t.score)}</b></div>`).join('')}<div class="sp-note${m.state === 'in' ? ' live' : ''}">${esc(m.state === 'pre' ? fmtTime(m.date) : m.status)}</div></div>`).join('');
  return '';
}
// one line for the Home strip
function headline(c){
  if (c.kind === 'match'){ const m = c.matches[0]; return m.state === 'pre' ? `${m.a.name} v ${m.b.name} · ${fmtTime(m.date)}` : `${m.a.name} ${m.a.score} – ${m.b.score} ${m.b.name} · ${m.status}`; }
  if (c.kind === 'race'){ const s = c.live && c.live.rows.length ? c.live : c.last && c.last.rows.length && !c.live ? c.last : null;
    if (s) return `${s === c.live ? s.label + ': ' : s.label + ': '}${s.rows.slice(0, 3).map(r => `${r.pos} ${String(r.name).split(' ').pop()}`).join(' · ')}`;
    return c.next ? `${c.next.label} · ${fmtTime(c.next.date)}` : c.sub || ''; }
  if (c.kind === 'golf') return c.rows.length ? c.rows.slice(0, 3).map(r => `${r.pos} ${String(r.name).split(' ').pop()} ${r.score}`).join(' · ') : `Starts ${fmtTime(c.date)}`;
  if (c.kind === 'fights'){ const f = c.fights[0]; return f ? `${f.a.map(x => x.name).join(' v ')} · ${f.state === 'pre' ? fmtTime(c.date) : f.status}` : ''; }
  if (c.kind === 'tennis'){ const m = c.matches[0]; return `${m.p.map(p => p.name.split(' ').pop()).join(' v ')} · ${m.state === 'pre' ? fmtTime(m.date) : m.state === 'in' ? 'Live' : 'Final'}`; }
  if (c.kind === 'cricket'){ const m = c.matches[0]; return `${m.t.map(t => `${t.name} ${t.score}`).join(' v ')}`; }
  return '';
}
const updatedLine = () => S.updated ? `Updated ${new Date(S.updated).toLocaleTimeString(undefined, {hour:'numeric', minute:'2-digit'})}${Object.values(S.live).some(Boolean) ? ' · live scores refresh every 30 s' : ''}` : '';
GW.sportsStrip = () => {
  if (framed || !S.cards.length) return '';
  return `<section class="sp-strip"><div class="row"><div class="grow"><div class="kicker">Sport now</div></div><button class="btn ghost" type="button" data-go="sports">All sport →</button></div>
    <div class="sp-chips">${S.cards.slice(0, 3).map(c => `<button class="sp-chip" type="button" data-go="sports"><span class="sp-ico">${c.icon}</span><span class="grow"><span class="sp-k">${badge(c.state)} ${esc(c.sport)}</span><b>${esc(c.title)}</b><span class="muted small">${esc(headline(c))}</span></span></button>`).join('')}</div></section>`;
};
/* ---------- the score strip above the board during a game ---------- */
// short enough for a phone: team codes for matches ("BL 61–54 FRE · Q3 12:04")
function tickLine(c){
  if (c.kind !== 'match') return headline(c);
  const m = c.matches.find(x => x.state === 'in') || c.matches[0];
  return m.state === 'pre' ? `${m.a.abbr || m.a.name} v ${m.b.abbr || m.b.name} · ${fmtTime(m.date)}` : `${m.a.abbr || m.a.name} ${m.a.score}–${m.b.score} ${m.b.abbr || m.b.name} · ${m.status}`;
}
const T = {turn:0, shown:null};
const onNow = () => framed ? [] : S.cards.filter(c => c.state === 'in' || c.state === 'weekend');
function ticker(){
  const el = $('spTicker');
  if (!el) return;
  const live = onNow();
  if (!live.length){ el.hidden = true; T.shown = null; return; }
  const c = live[T.turn % live.length], line = tickLine(c), key = c.id + c.title;
  if (el.dataset.line !== key + line){
    el.innerHTML = `<span class="sp-ico">${c.icon}</span>${badge(c.state)}<span class="sp-tk"><b>${esc(c.title)}</b> <span>${esc(line)}</span></span>${live.length > 1 ? `<span class="sp-n">${T.turn % live.length + 1}/${live.length}</span>` : ''}`;
    // the same event with a new score flashes; a different event just slides in
    el.classList.remove('flash', 'swap'); void el.offsetWidth; el.classList.add(T.shown === key ? 'flash' : 'swap');
    el.dataset.line = key + line; T.shown = key;
  }
  el.dataset.card = S.cards.indexOf(c);
  el.hidden = false;
}
// tapping the strip shows the whole scorecard without leaving the game
document.addEventListener('click', e => {
  const t = e.target.closest('#spTicker');
  if (!t) return;
  const c = S.cards[+t.dataset.card];
  if (!c) return;
  const m = GW.modal(`<div class="sp-head"><span class="sp-ico big">${c.icon}</span><div class="grow"><div class="sp-k">${badge(c.state)} ${esc(c.sport)}</div><h2 style="margin:2px 0 0">${esc(c.title)}</h2>${c.sub ? `<div class="muted small">${esc(c.sub)}</div>` : ''}</div></div>
    <div class="sp-card" style="gap:8px">${detail(c)}</div><div class="muted small">${esc(updatedLine())}</div>
    <div class="row"><button class="btn grow" type="button" id="spAll">All sport</button><button class="btn pop grow" type="button" id="spBack">Back to the game</button></div>`);
  m.querySelector('#spBack').addEventListener('click', () => GW.closeModal());
  m.querySelector('#spAll').addEventListener('click', () => { GW.closeModal(); GW.show('sports'); });
});
function paint(){
  ticker();
  const scr = GW.currentScreen();
  if (scr === 'home'){ const el = document.querySelector('.sp-strip'), html = GW.sportsStrip(); if (el && html) el.outerHTML = html; else if (!el && html && GW.renderHome) GW.renderHome(); else if (el && !html) el.remove(); }
  if (scr !== 'sports') return;
  const live = S.cards.filter(c => c.state === 'in' || c.state === 'weekend'), soon = S.cards.filter(c => c.state === 'pre'), done = S.cards.filter(c => c.state === 'post');
  const sec = (title, list) => list.length ? `<h2 class="sp-h">${title}</h2><div class="sp-grid">${list.map(c => `<article class="panel sp-card ${c.state}"><div class="sp-head"><span class="sp-ico big">${c.icon}</span><div class="grow"><div class="sp-k">${badge(c.state)} ${esc(c.sport)}</div><h3>${esc(c.title)}</h3>${c.sub ? `<div class="muted small">${esc(c.sub)}</div>` : ''}</div></div>${detail(c)}</article>`).join('')}</div>` : '';
  $('scr-sports').innerHTML = `<div class="page-head"><div><div class="kicker">The world’s top events</div><h1>Sport</h1><div class="muted small">${esc(updatedLine())}</div></div><button class="btn" type="button" id="spRefresh">${S.busy ? 'Updating…' : 'Refresh'}</button></div>
    ${framed ? '<div class="panel">Live sport works in the Android app and on elitechess.online.</div>' : ''}
    ${sec('Live now', live)}${sec('Coming up', soon)}${sec('Results', done)}
    ${!S.cards.length && !framed ? `<div class="panel empty-state"><div style="font-size:44px">🏟️</div><h2>${S.busy ? 'Checking what’s on…' : S.err ? 'Can’t reach the scores right now' : 'No top events right now'}</h2><p class="muted">${S.err ? 'Check your internet connection.' : 'Big events appear here while they’re on: Grand Prix weekends, Grand Slams, golf majors, World Cups, the Super Bowl, Grand Finals and more.'}</p></div>` : ''}
    ${S.later.length ? `<h2 class="sp-h">Later</h2><div class="panel sp-later">${S.later.slice(0, 6).map(l => `<div class="row"><span class="sp-ico">${l.icon}</span><span class="grow"><b>${esc(l.title)}</b> <span class="muted small">${esc(l.sport)}</span></span><span class="muted small">${esc(new Date(l.date).toLocaleDateString(undefined, {day:'numeric', month:'short'}))}</span></div>`).join('')}</div>` : ''}
    <p class="muted small">Scores from ESPN; MotoGP from motogp.com (updates every 15 minutes on race weekends). Times are shown in your time zone.</p>`;
  $('spRefresh').addEventListener('click', () => { refresh(true); paint(); });
}
$('scr-sports').innerHTML = '';
// keep scores fresh only while they're on screen
const WATCH = ['home', 'sports', 'game'];
setInterval(() => { if (document.visibilityState === 'visible' && WATCH.includes(GW.currentScreen())) refresh(); }, 15000);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && WATCH.includes(GW.currentScreen())) refresh(); });
// several live events take turns in the game's score strip
setInterval(() => { if (GW.currentScreen() === 'game' && document.visibilityState === 'visible'){ T.turn++; ticker(); } }, 7000);
document.addEventListener('gw-screen', e => { ticker(); if (WATCH.includes(e.detail)) refresh(); });
GW.register('sports', {onShow: () => { paint(); refresh(); }});
setTimeout(() => refresh(), 3000);
GW.sports = {refresh, state: () => S, build};
})();
