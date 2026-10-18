/* Elite Chess: sports themes. While one of the world's top events is on (sports.js finds them), its theme takes
   over the board the same way the holidays do: a board, character pieces, piece colours, a little weather and a
   flyover. Pieces keep their roles: pawn = the sport's ball, rook = a grandstand, bishop = the sport's tall
   item (flag, racket, posts, bat …), knight = a horse in the sport's headgear, queen = a crowned trophy,
   king = the sport's famous trophy under a cross. White pieces are light, black pieces deep. */
(() => {
const SEA = window.GW_SEASONAL || {}, K = SEA.kit, A = SEA.art, DATA = window.GW_DATA = window.GW_DATA || {};
if (!K || !A) return;
const {P, L, E, O, D, R, base, crown, cross, eye, register} = K;

/* ---------- shared pieces ---------- */
// rook: a grandstand with a roof, seat rows, flags and the sport's emblem
const stand = (c, emblem = '') => base(c, 60) + P('M27 84V46H73V84Z', c.body, c) + P('M21 47L28 33H72L79 47Z', c.a1, c) +
  L('M31 56H69M31 64H69M31 72H69', c.shade, 2.6) + P('M43 84V75a7 7 0 0 1 14 0v9Z', c.shade, c) +
  L('M29 33V21M71 33V21', c.ink, 2.2) + P('M29 21l10 3.4-10 3.4z', c.a2, c, ' stroke-width="1.2"') + P('M71 21l10 3.4-10 3.4z', c.a2, c, ' stroke-width="1.2"') + emblem;
// queen: a cup with a crown
const cup = (c, deco = '') => base(c, 46) + P('M39 84l3-9h16l3 9z', c.cupB, c) + R(46.5, 58, 7, 17, c.cup, c, 1) +
  L('M34 33C24 33 24 47 35 47M66 33C76 33 76 47 65 47', c.ink, 5.4) + L('M34 33C24 33 24 47 35 47M66 33C76 33 76 47 65 47', c.cup, 2.6) +
  P('M32 27h36c0 19-7 31-18 31S32 46 32 27z', c.cup, c) + L('M35 32h30', c.a2, 2.2) + E(43, 38, 3, 7, '#fff', c, ' stroke-width="0" opacity=".45"') + deco + crown(50, 15, c.a2, c, 20);
// knight: a horse's head; headgear goes on top
const horse = c => P('M70 86C72 72 71 60 65 50C61 40 53 33 44 31L41 22L36 30C29 32 23 38 19 46C17 50 19 55 23 55L31 55C34 55 37 53 40 55C42 63 38 75 34 86Z', c.body, c) +
  L('M57 37c4 6 7 12 8 18M62 42c3 5 4 10 4 15', c.shade, 2.4) + D(21.5, 50.5, 1.7, c.ink);
const HEAD = {
  helmet: c => P('M24 44C24 30 35 21 48 23C59 25 63 34 60 45L56 51H30C26 51 24 48 24 44Z', c.a1, c) + P('M27 38H51C53 38 53 45 51 45H28Z', c.visor, c, ' stroke-width="1.4"') + L('M33 26C42 24 52 26 58 32', c.a2, 3) + E(36, 40, 5, 1.4, '#fff', c, ' stroke-width="0" opacity=".5"'),
  cap: c => P('M30 37C30 27 40 22 50 26C55 28 57 33 56 38H30Z', c.a1, c) + P('M31 36C24 36 17 38 15 42C22 43 29 42 33 39Z', c.a1, c) + D(44, 25, 2, c.a2) + eye(38, 44, c),
  band: c => eye(36, 42, c) + L('M29 36C37 32 47 31 55 34', c.a1, 5.5) + L('M29 36C37 32 47 31 55 34', c.a2, 1.4),
  gridiron: c => P('M24 44C24 30 35 21 48 23C59 25 63 34 60 45L56 51H30C26 51 24 48 24 44Z', c.a1, c) + L('M44 22c2 10 2 20 0 29', c.a2, 3) + L('M18 42h14M18 48h14M23 38v14', c.mask, 2.4) + eye(37, 41, c),
  scrum: c => P('M27 42C26 30 36 23 47 24C57 25 61 33 59 43L54 47H31C28 47 27 45 27 42Z', c.a1, c) + L('M43 24v22M33 28c6 4 10 10 10 18M53 27c-4 4-8 10-10 18', c.ink, 1.2, ' opacity=".6"') + eye(36, 44, c),
  hockey: c => P('M25 42C25 30 35 22 47 23C58 24 62 33 59 43L55 48H30C27 48 25 46 25 42Z', c.a1, c) + P('M24 41H44V50H26Z', '#bfe3ff', c, ' stroke-width="1.2" opacity=".75"') + eye(35, 44, c),
  cricket: c => P('M30 37C30 27 40 22 50 26C55 28 57 33 56 38H30Z', c.a1, c) + P('M31 36C26 36 22 37 20 39C25 40 29 40 33 39Z', c.a1, c) + L('M18 42h14M18 47h14M22 40v12M27 40v12', c.mask, 1.6) + eye(38, 43, c),
  scarf: c => eye(36, 42, c) + P('M40 61c8 6 18 6 26 0l2 9c-10 6-20 6-30 0z', c.a1, c) + L('M48 64v8M56 64v8', c.a2, 3) + P('M60 68l4 12 6-10z', c.a1, c, ' stroke-width="1.4"'),
  guernsey: c => eye(36, 42, c) + P('M38 60c9 7 20 7 30 0l2 18H36z', c.a1, c) + L('M44 60l9 8 9-8', c.a2, 2.4)
};
const knight = (c, gear) => base(c, 56) + horse(c) + HEAD[gear](c);
// a mini ball for the grandstand roof
const emblem = (ball) => c => `<g transform="translate(50 40) scale(.32)">${ball(c)}</g>`;

/* ---------- the balls (centred on 0,0, radius about 19) ---------- */
const BALL = {
  tyre: c => O(0, 0, 20, c.ball, c) + O(0, 0, 14, 'none', c, ` stroke="${c.ball2}" stroke-width="3"`) + O(0, 0, 9, c.rim, c) + L('M0-9V9M-9 0H9M-6-6L6 6M6-6L-6 6', c.ink, 1.4) + D(0, 0, 2.6, c.ball2),
  helmet: c => P('M-19 6C-19-12-7-20 3-19 15-18 20-8 19 4L14 12H-15C-18 12-19 10-19 6Z', c.ball, c) + P('M-15-2H10C13-2 13 6 10 6H-15Z', c.visor, c, ' stroke-width="1.2"') + L('M-10-14C0-18 10-16 16-8', c.ball2, 3),
  tennis: c => O(0, 0, 18, c.ball, c) + L('M-15-10C-6-4-6 6-15 11M15-10C6-4 6 6 15 11', c.ball2, 2.6) + E(-6, -7, 4, 6, '#fff', c, ' stroke-width="0" opacity=".35"'),
  golf: c => O(0, 0, 16, c.ball, c) + [[-6, -6], [2, -8], [8, -2], [-8, 2], [0, 0], [6, 6], [-2, 8], [-9, -1]].map(([x, y]) => D(x, y, 1.6, c.ball2)).join(''),
  soccer: c => O(0, 0, 18, c.ball, c) + P('M0-6l6 4-2 7h-8l-2-7z', c.ball2, c, ' stroke-width="1.2"') + L('M0-6V-14M6-2l8-3M4 5l5 8M-4 5l-5 8M-6-2l-8-3', c.ink, 1.4) + P('M-6-17l6-1 6 1 0 4-6 2-6-2z', c.ball2, c, ' stroke-width="1"'),
  gridiron: c => E(0, 0, 21, 13, c.ball, c, ' transform="rotate(-30)"') + L('M-12 0h24', c.ball2, 1.6, ' transform="rotate(-30)"') + L('M-5-3v6M-1-3v6M3-3v6M7-3v6', c.ball2, 1.6, ' transform="rotate(-30)"') + L('M-16-4c-2 2-2 6 0 8M16-4c2 2 2 6 0 8', c.ball2, 1.6, ' transform="rotate(-30)"'),
  sherrin: c => E(0, 0, 21, 13, c.ball, c, ' transform="rotate(-30)"') + L('M-10-1h20', c.ball2, 1.6, ' transform="rotate(-30)"') + L('M-6-4v6M-2-4v6M2-4v6M6-4v6', c.ball2, 1.6, ' transform="rotate(-30)"') + L('M-20 0C-12-8 12-8 20 0', c.ink, 1.2, ' transform="rotate(-30)" opacity=".5"'),
  rugby: c => E(0, 0, 21, 13, c.ball, c, ' transform="rotate(-30)"') + L('M-12-10c4 6 4 14 0 20M12-10c-4 6-4 14 0 20', c.ball2, 3, ' transform="rotate(-30)"') + L('M-20 0h40', c.ink, 1, ' transform="rotate(-30)" opacity=".4"'),
  baseball: c => O(0, 0, 18, c.ball, c) + L('M-12-13C-5-6-5 6-12 13M12-13C5-6 5 6 12 13', c.ball2, 1.8) + L('M-10-9l-3 1M-8-4l-3 0M-8 2l-3 0M-10 8l-3-1M10-9l3 1M8-4l3 0M8 2l3 0M10 8l3-1', c.ball2, 1.4),
  basketball: c => O(0, 0, 18, c.ball, c) + L('M-18 0H18M0-18V18M-13-12C-6-6-6 6-13 12M13-12C6-6 6 6 13 12', c.ball2, 1.8),
  puck: c => E(0, 4, 19, 8, c.ball, c) + P('M-19 -2V4C-19 9-10 12 0 12S19 9 19 4V-2', c.ball, c) + E(0, -2, 19, 8, c.ball, c) + E(0, -2, 11, 4, 'none', c, ` stroke="${c.ball2}" stroke-width="1.4"`),
  cricket: c => O(0, 0, 17, c.ball, c) + L('M-12-12C-4-4 4 4 12 12', c.ball2, 3) + L('M-10-8l-3 3M-6-4l-3 3M-2 0l-3 3M2 4l-3 3M6 8l-3 3M-7-11l3-3M-3-7l3-3M1-3l3-3M5 1l3-3M9 5l3-3', c.ink, 1, ' opacity=".6"') + E(-6, -7, 3, 5, '#fff', c, ' stroke-width="0" opacity=".3"'),
  glove: c => P('M-16 2C-18-12-6-18 6-16C18-14 20-2 16 8L12 16H-10C-14 14-15 8-16 2Z', c.ball, c) + L('M-12 6C-8 2-2 2 2 6', c.ball2, 2) + R(-11, 12, 22, 8, c.ball2, c, 2)
};
const pawn = (c, ball, lift = 62) => base(c, 44) + `<g transform="translate(50 ${lift})">${BALL[ball](c)}</g>`;

/* ---------- the tall pieces (bishops) ---------- */
const BISHOP = {
  chequer: c => base(c, 40) + L('M50 84V12', c.ink, 4.6) + L('M50 84V12', c.cupB, 2.4) + P('M47 13l3-8 3 8z', c.a2, c) +
    P('M51 14c8-4 16 4 24 0v22c-8 4-16-4-24 0z', '#ffffff', c) + [[0, 0], [2, 0], [1, 1], [3, 1], [0, 2], [2, 2], [1, 3], [3, 3]].map(([i, j]) => P(`M${51 + i * 6} ${15 + j * 5.2}h6v5.2h-6z`, '#16181d', c, ' stroke-width="0"')).join(''),
  cone: c => base(c, 46) + P('M50 10L68 80H32Z', c.a1, c) + P('M44 34h12l3 12H41zM39 56h22l3 12H36z', '#fff', c, ' stroke-width="1.2"') + R(28, 78, 44, 6, c.shade, c, 2),
  racket: c => base(c, 40) + R(46.5, 58, 7, 26, c.a2, c, 2) + L('M48 64h4M48 70h4M48 76h4', c.ink, 1, ' opacity=".5"') + P('M50 60L41 48M50 60L59 48', 'none', c, ` stroke="${c.ink}" stroke-width="3"`) +
    E(50, 31, 14, 20, c.body, c, ` stroke="${c.a1}" stroke-width="4"`) + L('M41 22h18M38 28h24M38 34h24M40 40h20M44 14v34M50 11v40M56 14v34', c.a1, 1, ' opacity=".8"') + P('M47 9l3-5 3 5z', c.a1, c),
  flagstick: c => base(c, 46) + E(50, 84, 11, 3, c.ink, c, ' stroke-width="0" opacity=".5"') + L('M50 84V10', c.ink, 3.6) + L('M50 84V10', '#fff', 1.6) + P('M51 11l24 8-24 8z', c.a1, c) + D(50, 9, 2.2, c.a2),
  corner: c => base(c, 40) + L('M50 84V12', c.ink, 4.4) + L('M50 84V12', c.a2, 2) + P('M51 13l22 9-22 9z', c.a1, c) + L('M51 22l12 4', '#fff', 1.4) + P('M47 13l3-7 3 7z', c.a2, c),
  goalpost: c => base(c, 46) + L('M50 84V54M30 54H70M30 54V14M70 54V14', c.ink, 6) + L('M50 84V54M30 54H70M30 54V14M70 54V14', c.a2, 3.6) + P('M27 15l3-8 3 8zM67 15l3-8 3 8z', c.a2, c) + R(45, 66, 10, 12, c.a1, c, 2),
  afl: c => base(c, 50) + L('M40 84V8M60 84V8', c.ink, 6) + L('M40 84V8M60 84V8', '#ffffff', 3.4) + R(36, 60, 8, 22, c.a1, c, 2) + R(56, 60, 8, 22, c.a1, c, 2) + P('M37 9l3-7 3 7zM57 9l3-7 3 7z', c.a2, c),
  hposts: c => base(c, 46) + L('M32 84V10M68 84V10M32 50H68', c.ink, 6) + L('M32 84V10M68 84V10M32 50H68', '#ffffff', 3.4) + R(28, 62, 8, 20, c.a1, c, 2) + R(64, 62, 8, 20, c.a1, c, 2) + P('M29 11l3-7 3 7zM65 11l3-7 3 7z', c.a2, c),
  bat: c => base(c, 40) + P('M46 84c-2-24-1-50 2-70 1-4 3-4 4 0 3 20 4 46 2 70z', c.bat, c) + L('M48.5 20c-1 20-1 40 0 60', '#fff', 1.4, ' opacity=".5"') + R(45, 78, 10, 6, c.ink, c, 3) + P('M47 13l3-7 3 7z', c.a2, c),
  hoop: c => base(c, 46) + L('M60 84V20', c.ink, 4.4) + L('M60 84V20', c.cupB, 2.2) + R(30, 12, 34, 22, '#ffffff', c, 2) + R(40, 18, 14, 10, 'none', c, 0, ` stroke="${c.a1}" stroke-width="1.6"`) +
    E(44, 34, 10, 2.6, 'none', c, ` stroke="${c.a1}" stroke-width="2.4"`) + L('M35 35l3 12M41 36l1 12M47 36l-1 12M53 35l-3 12M37 41h14', c.ink, 1, ' opacity=".7"'),
  stick: c => base(c, 46) + P('M52 10c2 0 3 1 3 3l-4 58c-1 6-6 10-14 10h-8c-3 0-4-4-1-5l9-2c4-1 6-3 6-7l5-54c0-2 2-3 4-3z', c.bat, c) + L('M51 14l-4 48', c.a1, 2.4) + P('M50 9l3-6 3 6z', c.a2, c),
  cricketbat: c => base(c, 46) + L('M38 84V44M43 84V44M48 84V44', '#e9d6a6', 3) + L('M37 44h12', c.a2, 2) +
    P('M58 84c-5 0-8-2-8-6V36c0-3 2-4 5-4h6c3 0 5 1 5 4v42c0 4-3 6-8 6z', c.bat, c) + R(56.5, 10, 5, 23, c.ink, c, 2) + L('M57 14h4M57 18h4M57 22h4M57 26h4', c.a1, 1.4) + P('M56 10l3-6 3 6z', c.a2, c),
  post: c => base(c, 46) + R(42, 22, 16, 62, c.a1, c, 6) + L('M42 36h16M42 52h16M42 68h16', c.shade, 2) + P('M44 22l6-14 6 14z', c.a2, c) + L('M58 30h14M58 46h14M58 62h14', c.ink, 1.4, ' opacity=".6"')
};

/* ---------- the champions' trophies (kings: tallest, cross on top) ---------- */
const KING = {
  f1: c => base(c, 50) + P('M38 84l4-9h16l4 9z', c.cupB, c) + P('M44 75C38 58 37 42 50 22C63 42 62 58 56 75Z', c.cup, c) + L('M45 70C54 60 44 48 53 36', c.a2, 2.4) + O(50, 54, 6, 'none', c, ` stroke="${c.a1}" stroke-width="2"`) + cross(50, 4, c.a2, c),
  motogp: c => base(c, 50) + P('M38 84l4-9h16l4 9z', c.cupB, c) + R(46.5, 56, 7, 19, c.cup, c, 1) + P('M34 30h32c0 16-7 26-16 26S34 46 34 30z', c.cup, c) + P('M34 34C22 26 16 34 18 44c6-2 12-4 16-8zM66 34c12-8 18 0 16 10-6-2-12-4-16-8z', c.a2, c) + L('M38 35h24', c.a1, 2.4) + cross(50, 12, c.a2, c),
  tennis: c => base(c, 48) + P('M38 84l4-8h16l4 8z', c.cupB, c) + R(46.5, 62, 7, 14, c.cup, c, 1) + P('M33 34h34c0 16-7 28-17 28S33 50 33 34z', c.cup, c) + L('M33 40C24 40 24 52 34 52M67 40C76 40 76 52 66 52', c.ink, 5) + L('M33 40C24 40 24 52 34 52M67 40C76 40 76 52 66 52', c.cup, 2.4) + P('M35 34c0-8 7-12 15-12s15 4 15 12z', c.cup, c) + E(50, 18, 4, 5, c.a2, c) + L('M37 46h26', c.a1, 2.4) + cross(50, 1, c.a2, c),
  claret: c => base(c, 46) + P('M39 84l3-8h16l3 8z', c.cupB, c) + P('M41 76c-4-14-4-30 2-42l-4-8h22l-4 8c6 12 6 28 2 42z', c.cup, c) + L('M59 36c12 2 12 26 0 30', c.ink, 5) + L('M59 36c12 2 12 26 0 30', c.cup, 2.6) + P('M39 26l-7-3 9-1z', c.cup, c) + E(50, 25, 11, 3, c.a2, c) + L('M43 50h14M42 60h16', c.a2, 1.8) + cross(50, 8, c.a2, c),
  worldcup: c => base(c, 46) + P('M38 84l3-10h18l3 10z', c.a1, c) + P('M42 74c-4-10-2-20 4-28-8-6-8-14-4-20 4 4 8 6 8 10 0-4 4-6 8-10 4 6 4 14-4 20 6 8 8 18 4 28z', c.cup, c) + O(50, 18, 10, c.cup, c) + L('M41 15c6 3 12 3 18 0M41 21c6 3 12 3 18 0M50 8v20', c.a2, 1.2, ' opacity=".7"') + L('M44 50c4 4 8 4 12 0M44 60c4 4 8 4 12 0', c.a2, 1.6) + cross(50, 0, c.a2, c),
  lombardi: c => base(c, 46) + P('M38 84l3-8h18l3 8z', c.cupB, c) + P('M46 76l2-44h4l2 44z', c.cup, c) + `<g transform="translate(50 24) rotate(-60)">${E(0, 0, 13, 8, c.cup, c)}${L('M-4-2v4M0-2v4M4-2v4M-7 0h14', c.a2, 1.2)}</g>` + L('M44 70h12', c.a2, 2) + cross(50, 4, c.a2, c),
  premiership: c => base(c, 50) + P('M36 84l4-8h20l4 8z', c.cupB, c) + R(46, 60, 8, 16, c.cup, c, 1) + P('M30 30h40c0 18-8 30-20 30S30 48 30 30z', c.cup, c) + L('M30 34C18 30 16 46 30 48M70 34c12-4 14 12 0 14', c.ink, 5) + L('M30 34C18 30 16 46 30 48M70 34c12-4 14 12 0 14', c.cup, 2.6) + L('M34 38h32', c.a2, 2) + L('M36 44h28', c.a1, 2) + P('M40 30c0-6 4-10 10-10s10 4 10 10z', c.cup, c) + cross(50, 4, c.a2, c),
  webbellis: c => base(c, 48) + P('M38 84l4-9h16l4 9z', c.cupB, c) + R(46.5, 58, 7, 17, c.cup, c, 1) + P('M34 32h32c0 16-7 26-16 26S34 48 34 32z', c.cup, c) + L('M35 36C26 32 22 44 34 48M65 36c9-4 13 8 1 12', c.ink, 5) + L('M35 36C26 32 22 44 34 48M65 36c9-4 13 8 1 12', c.cup, 2.4) + P('M36 32c0-8 6-12 14-12s14 4 14 12z', c.cup, c) + E(50, 17, 4, 4, c.a2, c) + cross(50, 1, c.a2, c),
  commissioner: c => base(c, 50) + P('M36 84l4-10h20l4 10z', c.a1, c) + O(50, 52, 4, c.cup, c) + Array.from({length: 7}, (_, i) => { const x = 30 + i * 6.7; return L(`M${x.toFixed(1)} 72V${(30 + Math.abs(3 - i) * 4).toFixed(1)}`, c.cup, 2.2) + P(`M${(x + 1).toFixed(1)} ${(30 + Math.abs(3 - i) * 4).toFixed(1)}l6 3-6 3z`, c.a2, c, ' stroke-width=".8"'); }).join('') + E(50, 72, 20, 4, c.cup, c) + cross(50, 10, c.a2, c),
  obrien: c => base(c, 46) + P('M39 84l3-8h16l3 8z', c.cupB, c) + P('M45 76l1-34h8l1 34z', c.cup, c) + P('M38 44h24l-4 12H42z', c.cup, c) + L('M40 47l3 8M46 47l1 8M54 47l-1 8M60 47l-3 8', c.ink, 1, ' opacity=".6"') + `<g transform="translate(50 31)">${O(0, 0, 11, c.cup, c)}${L('M-11 0H11M0-11V11M-8-8c4 4 4 12 0 16M8-8c-4 4-4 12 0 16', c.a2, 1.2)}</g>` + cross(50, 10, c.a2, c),
  stanley: c => base(c, 52) + [[58, 26], [50, 22], [42, 18], [34, 14]].map(([y, w], i) => R(50 - w, y + 18, w * 2, 8, i % 2 ? c.cup : c.cupB, c, 1.5)).join('') + R(43, 30, 14, 12, c.cup, c, 2) + P('M36 24h28c0 6-6 9-14 9s-14-3-14-9z', c.cup, c) + L('M38 25h24', c.a2, 1.6) + cross(50, 6, c.a2, c),
  urn: c => base(c, 46) + R(38, 56, 24, 28, c.a1, c, 2) + L('M40 62h20M40 76h20', c.a2, 1.6) + P('M42 56c-6-8-6-18 2-24l-2-4h16l-2 4c8 6 8 16 2 24z', c.cup, c) + E(50, 27, 8, 2.4, c.cup, c) + P('M46 26c0-4 8-4 8 0z', c.cup, c) + cross(50, 9, c.a2, c),
  belt: c => base(c, 46) + R(46.5, 24, 7, 60, c.cupB, c, 2) + R(26, 32, 48, 18, c.a1, c, 4) + O(50, 41, 12, c.cup, c) + O(50, 41, 7, c.a2, c) + L('M30 35h6M64 35h6M30 47h6M64 47h6', c.cup, 1.6) + cross(50, 6, c.a2, c)
};

/* ---------- the fifteen themes ---------- */
// pal: body/shade/hi/ink for each side; a1/a2 accents; cup/cupB trophies; ball/ball2/rim for the pawn; visor, mask, bat
const pal = (w, b) => ({w:Object.assign({hi:'#ffffff', eye:'#1a1a1a', visor:'#2a2f3a', mask:'#9aa3b2', bat:'#e9cf9a', rim:'#c9ced8', cup:'#fff6d6', cupB:'#e3c46a'}, w),
  b:Object.assign({hi:'#4a5160', eye:'#ffffff', visor:'#9ad7ff', mask:'#c9ced8', bat:'#8a6a3a', rim:'#6b7280', cup:'#3a2f14', cupB:'#1f190a'}, b)});
const SPORTS = [
  {id:'f1', name:'Formula 1', icon:'🏎️', pawn:'tyre', bishop:'chequer', gear:'helmet', king:'f1', line:'Race weekend: lights out and away we go!', fx:'sp-chequer',
   board:{l:['chequer', '#16181d', '#e9eaee', .32], d:'#3b3f47', cl:'#3b3f47', cd:'#e9eaee'},
   pal:pal({body:'#ffffff', shade:'#e3e6ec', ink:'#1a1d24', a1:'#e10600', a2:'#f2c14e', ball:'#f2f3f5', ball2:'#e10600'}, {body:'#23272f', shade:'#0d0f13', ink:'#000000', a1:'#e10600', a2:'#f2c14e', ball:'#0f1014', ball2:'#f2c14e'}),
   cw:{w:{body:'#ffffff', ink:'#e10600'}, b:{body:'#1a1d24', ink:'#f2c14e'}}},
  {id:'motogp', name:'MotoGP', icon:'🏍️', pawn:'helmet', bishop:'cone', gear:'helmet', king:'motogp', line:'MotoGP race weekend: full throttle!', fx:'sp-chequer',
   board:{l:['helmet', '#b3121b', '#f1f1f1', .26], d:'#9e1b1e', cl:'#9e1b1e', cd:'#f6f6f6'},
   pal:pal({body:'#ffffff', shade:'#e6e6e6', ink:'#1a1a1a', a1:'#d50000', a2:'#f2c14e', ball:'#ffffff', ball2:'#d50000'}, {body:'#202020', shade:'#0a0a0a', ink:'#000000', a1:'#ff3b30', a2:'#f2c14e', ball:'#202020', ball2:'#ff3b30'}),
   cw:{w:{body:'#ffffff', ink:'#b3121b'}, b:{body:'#1a1a1a', ink:'#ff5a4f'}}},
  {id:'hardcourt', name:'Australian & US Open', icon:'🎾', pawn:'tennis', bishop:'racket', gear:'band', king:'tennis', line:'Grand Slam time on the blue hard courts.', fx:'sp-tennis',
   board:{l:['ball', '#c8e04a', '#7fb4e6', .5], d:'#1f5fa8', cl:'#174a85', cd:'#e8f3ff'},
   pal:pal({body:'#ffffff', shade:'#dce9f7', ink:'#123a6b', a1:'#1e6ec8', a2:'#c8e04a', ball:'#d9ec3c', ball2:'#ffffff'}, {body:'#0d2a52', shade:'#061833', ink:'#000814', a1:'#5aa9ff', a2:'#c8e04a', ball:'#3a4a0a', ball2:'#d9ec3c', hi:'#2a5a9a'}),
   cw:{w:{body:'#ffffff', ink:'#1e6ec8'}, b:{body:'#0d2a52', ink:'#d9ec3c'}}},
  {id:'clay', name:'Roland-Garros', icon:'🎾', pawn:'tennis', bishop:'racket', gear:'band', king:'tennis', line:'Red clay season in Paris.', fx:'sp-tennis',
   board:{l:['ball', '#ffffff', '#e8a77e', .4], d:'#b8552b', cl:'#8a3a18', cd:'#fff1e6'},
   pal:pal({body:'#fffaf5', shade:'#f1dccc', ink:'#5a2a10', a1:'#c4622d', a2:'#1f6b3a', ball:'#d9ec3c', ball2:'#ffffff'}, {body:'#4a1a08', shade:'#2a0c02', ink:'#000', a1:'#ff8a4f', a2:'#3fa65a', ball:'#3a4a0a', ball2:'#d9ec3c', hi:'#8a3a18'}),
   cw:{w:{body:'#fffaf5', ink:'#c4622d'}, b:{body:'#4a1a08', ink:'#ffd2b0'}}},
  {id:'grass', name:'Wimbledon', icon:'🎾', pawn:'tennis', bishop:'racket', gear:'band', king:'tennis', line:'Strawberries, cream and grass courts.', fx:'sp-tennis',
   board:{l:['ball', '#5b2c83', '#a7d88a', .32], d:'#4c8f3b', cl:'#2f6b24', cd:'#f2fbe9'},
   pal:pal({body:'#ffffff', shade:'#e6efe0', ink:'#2b1a40', a1:'#5b2c83', a2:'#2e7d32', ball:'#d9ec3c', ball2:'#ffffff'}, {body:'#2a1240', shade:'#160820', ink:'#000', a1:'#a77bd6', a2:'#5fbf63', ball:'#3a4a0a', ball2:'#d9ec3c', hi:'#5b2c83'}),
   cw:{w:{body:'#ffffff', ink:'#5b2c83'}, b:{body:'#2a1240', ink:'#9fe08a'}}},
  {id:'golf', name:'Golf major', icon:'⛳', pawn:'golf', bishop:'flagstick', gear:'cap', king:'claret', line:'A major championship: fairways and greens.', fx:'sparkles',
   board:{l:['flag', '#1f7a3a', '#c4e6a0', .35], d:'#5a9e3a', cl:'#2f6b24', cd:'#f4fbea'},
   pal:pal({body:'#ffffff', shade:'#e3eedb', ink:'#173a20', a1:'#1f7a3a', a2:'#f2c14e', ball:'#ffffff', ball2:'#c9d4c4'}, {body:'#12301a', shade:'#08180c', ink:'#000', a1:'#4fbf6a', a2:'#f2c14e', ball:'#20402a', ball2:'#78a882', hi:'#2f6b3a'}),
   cw:{w:{body:'#ffffff', ink:'#1f7a3a'}, b:{body:'#12301a', ink:'#f2c14e'}}},
  {id:'football', name:'World football', icon:'⚽', pawn:'soccer', bishop:'corner', gear:'scarf', king:'worldcup', line:'The beautiful game on the world stage.', fx:'confetti',
   board:{l:['soccer', '#1a3d1a', '#8fd07a', .3], d:'#3c8d3c', cl:'#255e25', cd:'#f2fbea'},
   pal:pal({body:'#ffffff', shade:'#e3eedb', ink:'#14301a', a1:'#1a73e8', a2:'#f2c14e', ball:'#ffffff', ball2:'#1a1a1a'}, {body:'#10261a', shade:'#06140c', ink:'#000', a1:'#ffd23f', a2:'#f2c14e', ball:'#1a1a1a', ball2:'#ffffff', hi:'#2a5a3a'}),
   cw:{w:{body:'#ffffff', ink:'#1a73e8'}, b:{body:'#10261a', ink:'#ffd23f'}}},
  {id:'gridiron', name:'Super Bowl', icon:'🏈', pawn:'gridiron', bishop:'goalpost', gear:'gridiron', king:'lombardi', line:'Super Bowl week: gridiron on the board.', fx:'confetti',
   board:{l:['football', '#5a2e12', '#a6d38a', .32], d:'#2e6b33', cl:'#1f4f24', cd:'#f2fbea'},
   pal:pal({body:'#ffffff', shade:'#e2e7ef', ink:'#0b1b33', a1:'#013369', a2:'#ffd23f', ball:'#b5743a', ball2:'#ffffff', cup:'#eef2f7', cupB:'#c9d1dc'}, {body:'#0b1b33', shade:'#040c1a', ink:'#000', a1:'#d50a0a', a2:'#ffd23f', ball:'#5a2e12', ball2:'#ffffff', hi:'#2a3f66'}),
   cw:{w:{body:'#ffffff', ink:'#013369'}, b:{body:'#0b1b33', ink:'#ff4a4a'}}},
  {id:'afl', name:'AFL Grand Final', icon:'🏉', pawn:'sherrin', bishop:'afl', gear:'guernsey', king:'premiership', line:'Grand Final day at the G!', fx:'confetti',
   board:{l:['sherrin', '#d71920', '#b6dd9a', .32], d:'#1f6b4a', cl:'#16503a', cd:'#f4fbea'},
   pal:pal({body:'#ffffff', shade:'#e2e9f2', ink:'#081a33', a1:'#003b73', a2:'#d71920', ball:'#d71920', ball2:'#ffffff'}, {body:'#081a33', shade:'#030c1a', ink:'#000', a1:'#ffb627', a2:'#d71920', ball:'#5a0a0e', ball2:'#ffd0d0', hi:'#23406b'}),
   cw:{w:{body:'#ffffff', ink:'#003b73'}, b:{body:'#081a33', ink:'#ffb627'}}},
  {id:'rugby', name:'Rugby', icon:'🏉', pawn:'rugby', bishop:'hposts', gear:'scrum', king:'webbellis', line:'Big rugby: scrums, tries and glory.', fx:'confetti',
   board:{l:['posts', '#ffffff', '#a9d9a0', .5], d:'#2d6f3f', cl:'#1f5230', cd:'#f2fbea'},
   pal:pal({body:'#ffffff', shade:'#e4ece2', ink:'#0d2a1a', a1:'#0b6e4f', a2:'#f2c14e', ball:'#ffffff', ball2:'#0b6e4f'}, {body:'#0d2a1a', shade:'#05160c', ink:'#000', a1:'#5fd39a', a2:'#f2c14e', ball:'#203a2a', ball2:'#f2c14e', hi:'#2a5a3a'}),
   cw:{w:{body:'#ffffff', ink:'#0b6e4f'}, b:{body:'#0d2a1a', ink:'#f2c14e'}}},
  {id:'baseball', name:'World Series', icon:'⚾', pawn:'baseball', bishop:'bat', gear:'cap', king:'commissioner', line:'World Series: batter up!', fx:'confetti',
   board:{l:['baseball', '#c8102e', '#e2c08f', .38], d:'#3d8b3d', cl:'#7a4a1a', cd:'#f6efe0'},
   pal:pal({body:'#ffffff', shade:'#e8e2d6', ink:'#0a1f44', a1:'#002d72', a2:'#c8102e', ball:'#ffffff', ball2:'#c8102e'}, {body:'#0a1f44', shade:'#040f24', ink:'#000', a1:'#c8102e', a2:'#ffd23f', ball:'#2a2a33', ball2:'#ff5a5a', hi:'#2a3f6b', bat:'#6a4a22'}),
   cw:{w:{body:'#ffffff', ink:'#002d72'}, b:{body:'#0a1f44', ink:'#ff5a5a'}}},
  {id:'basketball', name:'NBA Finals', icon:'🏀', pawn:'basketball', bishop:'hoop', gear:'band', king:'obrien', line:'NBA Finals: nothing but net.', fx:'confetti',
   board:{l:['basketball', '#c86a2e', '#ecd0a2', .35], d:'#c86a2e', cl:'#8a4210', cd:'#fff3e2'},
   pal:pal({body:'#ffffff', shade:'#f0e4d4', ink:'#1d2a4a', a1:'#1d428a', a2:'#ee6730', ball:'#ee6730', ball2:'#3a1a08'}, {body:'#1d1f2a', shade:'#0c0d14', ink:'#000', a1:'#ee6730', a2:'#ffd23f', ball:'#6a2a08', ball2:'#ffb37a', hi:'#3a3f55'}),
   cw:{w:{body:'#ffffff', ink:'#1d428a'}, b:{body:'#1d1f2a', ink:'#ee6730'}}},
  {id:'hockey', name:'Stanley Cup Final', icon:'🏒', pawn:'puck', bishop:'stick', gear:'hockey', king:'stanley', line:'Stanley Cup Final: on the ice.', fx:'snow',
   board:{l:['puck', '#0b3c7d', '#f2f8ff', .28], d:'#9fc4e8', cl:'#0b3c7d', cd:'#ffffff'},
   pal:pal({body:'#ffffff', shade:'#dfeaf5', ink:'#0b2a52', a1:'#0b3c7d', a2:'#c8102e', ball:'#e9eef5', ball2:'#0b3c7d', bat:'#d9b277', cup:'#eef2f7', cupB:'#c9d1dc'}, {body:'#0b1f3a', shade:'#040e1e', ink:'#000', a1:'#c8102e', a2:'#ffd23f', ball:'#0a0a0a', ball2:'#6a7a8a', hi:'#2a4a6b'}),
   cw:{w:{body:'#ffffff', ink:'#0b3c7d'}, b:{body:'#0b1f3a', ink:'#9fd0ff'}}},
  {id:'cricket', name:'Cricket', icon:'🏏', pawn:'cricket', bishop:'cricketbat', gear:'cricket', king:'urn', line:'Big cricket: the urn is on the line.', fx:'sparkles',
   board:{l:['cricket', '#a8141e', '#e3d79e', .35], d:'#5f9b3e', cl:'#3f6b24', cd:'#fffbe6'},
   pal:pal({body:'#fffdf4', shade:'#ede6cf', ink:'#173a20', a1:'#0b6e3a', a2:'#f2c14e', ball:'#ffffff', ball2:'#a8141e'}, {body:'#0f2e1a', shade:'#06180c', ink:'#000', a1:'#f2c14e', a2:'#f2c14e', ball:'#a8141e', ball2:'#ffffff', hi:'#2a5a3a', cup:'#6b4a1a'}),
   cw:{w:{body:'#fffdf4', ink:'#0b6e3a'}, b:{body:'#0f2e1a', ink:'#f2c14e'}}},
  {id:'ufc', name:'UFC', icon:'🥊', pawn:'glove', bishop:'post', gear:'band', king:'belt', line:'Fight night in the Octagon.', fx:'sparkles',
   board:{l:['octagon', '#1a1a1a', '#dcdcdc', .22], d:'#26262b', cl:'#26262b', cd:'#f2f2f2'},
   pal:pal({body:'#ffffff', shade:'#e2e2e2', ink:'#1a1a1a', a1:'#d20a0a', a2:'#c9a227', ball:'#d20a0a', ball2:'#ffffff'}, {body:'#1a1a1a', shade:'#0a0a0a', ink:'#000', a1:'#ff3b3b', a2:'#c9a227', ball:'#1a1a1a', ball2:'#c9a227', hi:'#3a3a3a'}),
   cw:{w:{body:'#ffffff', ink:'#d20a0a'}, b:{body:'#1a1a1a', ink:'#ff5a5a'}}}
];
const MOTION = {P:['spin', [50, 62, 8]], B:['sway', [50, 84, 3, 3.4]], N:['bob', [1.4, 2.4]], Q:['pulse', [50, 50, 1.04, 2.4]], K:['sway', [50, 86, 1.6, 4]]};
const SPARK = {Q:[[[34, 18, 3, 1.8], [66, 20, 3, 2.2]], '#fff6c8'], K:[[[36, 14, 3, 1.6], [64, 16, 3, 2]], '#fff6c8']};
const NO_SPIN = ['tyre', 'helmet', 'puck', 'glove', 'golf'];
for (const s of SPORTS){
  const set = {name:`${s.name} characters`, pal:s.pal, draw:{
    P: c => pawn(c, s.pawn, s.pawn === 'golf' ? 60 : 62) + (s.pawn === 'golf' ? P('M47 76h6l-2 8h-2z', '#ffffff', c, ' stroke-width="1.4"') : ''),
    R: c => stand(c, emblem(BALL[s.pawn])(c)),
    B: c => BISHOP[s.bishop](c),
    N: c => knight(c, s.gear),
    Q: c => cup(c, `<g transform="translate(50 42) scale(.3)">${BALL[s.pawn](c)}</g>`),
    K: c => KING[s.king](c)
  }};
  const mo = Object.assign({}, MOTION);
  if (NO_SPIN.includes(s.pawn)) mo.P = ['bob', [2, 1.6]];
  register('sp-' + s.id, set, mo, SPARK);
}

/* ---------- boards, colourways, falling weather ---------- */
const svgURL = svg => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
const MOTIF = {
  chequer: '<g stroke="none">' + [[0, 0], [2, 0], [1, 1], [3, 1], [0, 2], [2, 2], [1, 3], [3, 3]].map(([i, j]) => `<rect x="${12 + i * 4}" y="${12 + j * 4}" width="4" height="4"/>`).join('') + '</g><path d="M12 12h16v16H12z" fill="none" stroke-width="1"/>',
  helmet: '<path d="M11 24C11 15 17 10 24 11C30 12 31 18 30 24L28 27H14C12 27 11 26 11 24Z" stroke="none"/><path d="M13 20H25V24H14Z" fill="#fff" stroke="none" opacity=".6"/>',
  ball: '<circle cx="20" cy="20" r="7" stroke="none"/><path d="M14 15c3 3 3 7 0 10M26 15c-3 3-3 7 0 10" fill="none" stroke="#fff" stroke-width="1.2"/>',
  flag: '<path d="M18 30V10" fill="none" stroke-width="1.4"/><path d="M18 10l10 4-10 4z" stroke="none"/><ellipse cx="18" cy="30" rx="4" ry="1.2" stroke="none"/>',
  soccer: '<circle cx="20" cy="20" r="7" fill="#fff" stroke-width="1"/><path d="M20 17l3 2-1 3h-4l-1-3z" stroke="none"/>',
  football: '<ellipse cx="20" cy="20" rx="9" ry="5.5" stroke="none" transform="rotate(-30 20 20)"/><path d="M16 21l8-4M18 18l1 2M20 17l1 2M22 16l1 2" fill="none" stroke="#fff" stroke-width=".9"/>',
  sherrin: '<ellipse cx="20" cy="20" rx="9" ry="5.5" stroke="none" transform="rotate(-30 20 20)"/><path d="M16 21l8-4" fill="none" stroke="#fff" stroke-width="1"/>',
  posts: '<path d="M14 30V10M26 30V10M14 21h12" fill="none" stroke-width="1.8"/>',
  baseball: '<circle cx="20" cy="20" r="7" fill="#fff" stroke="none"/><path d="M15 15c2 3 2 7 0 10M25 15c-2 3-2 7 0 10" fill="none" stroke-width="1.2"/>',
  basketball: '<circle cx="20" cy="20" r="7" stroke="none"/><path d="M13 20h14M20 13v14M15 15c3 3 3 7 0 10M25 15c-3 3-3 7 0 10" fill="none" stroke="#fff" stroke-width=".9"/>',
  puck: '<ellipse cx="20" cy="22" rx="8" ry="3.4" stroke="none"/><path d="M12 20v2M28 20v2" stroke-width="1"/><ellipse cx="20" cy="19.5" rx="8" ry="3.4" stroke="none"/>',
  cricket: '<circle cx="20" cy="20" r="6.5" stroke="none"/><path d="M15.5 15.5l9 9" fill="none" stroke="#fff" stroke-width="1.2"/>',
  octagon: '<path d="M16 10h8l6 6v8l-6 6h-8l-6-6v-8z" fill="none" stroke-width="1.6"/>'
};
const motif = (key, color, base, op) => `${svgURL(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><g fill="${color}" stroke="${color}" opacity="${op}">${MOTIF[key]}</g></svg>`)} center/100% 100% no-repeat, ${base}`;
for (const s of SPORTS){
  const b = s.board;
  DATA.THEMES.push({id:'sp-' + s.id, group:'Sport', name:s.name, l:motif(b.l[0], b.l[1], b.l[2], b.l[3]), d:b.d, cl:b.cl, cd:b.cd});
  DATA.COLORWAYS.push({id:'sp-' + s.id, group:'Sport', name:s.name, w:s.cw.w, b:s.cw.b});
  DATA.PACKS.push({id:'sp-' + s.id, name:s.name, icon:s.icon, sport:true, board:'sp-' + s.id, pieces:'th-sp-' + s.id, alt:'cburnett', colorway:'sp-' + s.id, fx:s.fx, line:s.line});
}
DATA.FX_SHAPES = Object.assign(DATA.FX_SHAPES || {}, {
  'sp-chequer': ['<g><path d="M4 3v15" stroke="#555" stroke-width="1.2"/><path d="M4.5 3h12v9h-12z" fill="#fff"/><path d="M4.5 3h3v3h-3zM10.5 3h3v3h-3zM7.5 6h3v3h-3zM13.5 6h3v3h-3zM4.5 9h3v3h-3zM10.5 9h3v3h-3z" fill="#111"/></g>'],
  'sp-tennis': ['<circle cx="10" cy="10" r="7" fill="#d9ec3c"/><path d="M5 5c3 3 3 7 0 10M15 5c-3 3-3 7 0 10" fill="none" stroke="#fff" stroke-width="1.2"/>']
});

/* ---------- which theme is on: the top event sports.js found (cached between launches) ---------- */
const FEED_PACK = {f1:'sp-f1', motogp:'sp-motogp', golf:'sp-golf', wc:'sp-football', wwc:'sp-football', euro:'sp-football', copa:'sp-football', ucl:'sp-football',
  nfl:'sp-gridiron', afl:'sp-afl', nrl:'sp-rugby', rwc:'sp-rugby', mlb:'sp-baseball', nba:'sp-basketball', nhl:'sp-hockey', cricket:'sp-cricket', ufc:'sp-ufc'};
function packForCard(c){
  if (c.id === 'tennis') return /Wimbledon/i.test(c.title) ? 'sp-grass' : /Roland|French/i.test(c.title) ? 'sp-clay' : 'sp-hardcourt';
  return FEED_PACK[c.id] || null;
}
// the most important event that's on (live, on this weekend, or starting within its lead time); results don't count
function sportPackNow(){
  let cache = null;
  try { cache = JSON.parse(localStorage.getItem('gw-sports') || 'null'); } catch (_) {}
  if (!cache || !cache.cards || Date.now() - cache.updated > 12 * 3600e3) return null;
  const c = cache.cards.find(x => x.state !== 'post' && packForCard(x));
  return c ? DATA.PACKS.find(p => p.id === packForCard(c)) || null : null;
}
const holidays = DATA.packsFor;
DATA.packsFor = (d, hemi) => { const sp = sportPackNow(), rest = holidays(d, hemi); return sp ? [sp, ...rest] : rest; };
DATA.sportPackNow = sportPackNow;

/* ---------- flyovers: the high-detail artwork from sportart.js ---------- */
const ART = window.GW_SPORT_ART, {rep} = A;
const confettiBurst = A.svg('-50 -50 100 100', '', Array.from({length: 26}, (_, i) => { const a = i / 26 * Math.PI * 2, x = (42 * Math.cos(a)).toFixed(1), y = (42 * Math.sin(a)).toFixed(1), col = ['#ffd23f', '#e5484d', '#22b8b0', '#8b5cf6', '#ffffff'][i % 5];
  return `<rect x="-2" y="-4" width="4" height="8" rx="1" fill="${col}" opacity="0"><animate attributeName="opacity" values="0;1;0" dur="2.4s" fill="freeze"/><animateTransform attributeName="transform" type="translate" values="0 0;${x} ${y};${x} ${+y + 22}" dur="2.4s" fill="freeze"/></rect>`; }).join(''));
void rep;
if (ART){
  const fly = (key, tint, spin, y = [16, 66]) => ({motion:'ltr', w:36, dur:2.6, y, svg:ART.ballFly(key, tint, spin)});
  const burst = {motion:'burst', w:36, dur:2.4, count:3, svg:confettiBurst};
  Object.assign(SEA.FLY, {
    'sp-f1': [{motion:'ltr', w:70, dur:2.6, y:[26, 66], svg:ART.f1car}],
    'sp-motogp': [{motion:'ltr', w:46, dur:2.8, y:[22, 60], svg:ART.motoBike}],
    'sp-hardcourt': [fly('tennis', '#d9ec3c', .35)],
    'sp-clay': [Object.assign(fly('tennis', '#d9ec3c', .35), {motion:'rtl', flip:true})],
    'sp-grass': [fly('tennis', '#d9ec3c', .35)],
    'sp-golf': [{motion:'arc', w:84, dur:3.4, y:[16, 34], svg:ART.golfShot}],
    'sp-football': [{motion:'arc', w:84, dur:3, y:[14, 34], svg:ART.goalShot}, burst],
    'sp-gridiron': [fly('gridiron', '#a8662e', .7), burst],
    'sp-afl': [fly('sherrin', '#d71920', .7), burst],
    'sp-rugby': [fly('rugby', '#ffffff', .8), burst],
    'sp-baseball': [Object.assign(fly('baseball', '#ffffff', .22), {dur:2}), burst],
    'sp-basketball': [{motion:'arc', w:80, dur:2.8, y:[12, 28], svg:ART.hoopShot}],
    'sp-hockey': [{motion:'ltr', w:40, dur:2.4, y:[70, 76], svg:ART.puckSlide}],
    'sp-cricket': [Object.assign(fly('cricket', '#ff5a52', .25), {dur:2.2})],
    'sp-ufc': [{motion:'burst', w:52, dur:1.9, x:[12, 36], y:[24, 50], svg:ART.punch}]
  });
}
window.GW_SPORT_THEMES = {SPORTS, packForCard, sportPackNow};
})();
