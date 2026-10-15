/* Greenwood Chess core data: pieces, board themes, time controls, avatars, bots, cups and achievements. */
(() => {
/* ---------- Classic puzzles (hand-built, verified with Stockfish and a mate solver) ---------- */
const PUZZLES = [
  {id:'p01', theme:'Back-rank mate',   type:'mate', n:1, rating:600,  fen:'6k1/5ppp/1n6/8/8/8/1q3PPP/4R1K1 w - - 0 1', line:['e1e8']},
  {id:'p02', theme:'Fool’s mate', type:'mate', n:1, rating:500,  fen:'rnbqkbnr/pppp1ppp/8/4p3/6P1/5P2/PPPPP2P/RNBQKBNR b KQkq g3 0 2', line:['d8h4']},
  {id:'p03', theme:'Scholar’s mate', type:'mate', n:1, rating:550, fen:'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4', line:['h5f7']},
  {id:'p04', theme:'Ladder mate',      type:'mate', n:1, rating:650,  fen:'7k/R7/8/8/8/8/8/1R4K1 w - - 0 1', line:['b1b8']},
  {id:'p05', theme:'Smothered mate',   type:'mate', n:1, rating:800,  fen:'6rk/6pp/8/q3N3/8/8/5PPP/3R2K1 w - - 0 1', line:['e5f7']},
  {id:'p06', theme:'Arabian mate',     type:'mate', n:1, rating:850,  fen:'7k/1R6/5N2/8/8/8/8/6K1 w - - 0 1', line:['b7h7']},
  {id:'p07', theme:'Pawn-supported mate', type:'mate', n:1, rating:900, fen:'4r1k1/5p1p/5PpQ/8/8/8/5PPP/6K1 w - - 0 1', line:['h6g7']},
  {id:'p08', theme:'Queen and king mate', type:'mate', n:1, rating:600, fen:'7k/8/6K1/8/8/8/8/1Q6 w - - 0 1', line:['b1b8']},
  {id:'t01', theme:'Knight fork',      type:'tactic', rating:900,  fen:'r1q3k1/1p3ppp/8/3N4/8/8/P4PPP/2B1R1K1 w - - 0 1', line:['d5e7','g8f8','e7c8']},
  {id:'t02', theme:'Skewer',           type:'tactic', rating:950,  fen:'8/8/2k4q/8/8/8/5PPP/R5K1 w - - 0 1', line:['a1a6','c6b5','a6h6']},
  {id:'t03', theme:'Pin',              type:'tactic', rating:1100, fen:'r3k2r/pp3ppp/4b3/8/3P4/2N5/PP3PPP/R3R1K1 w - - 0 1', line:['d4d5']},
  {id:'t04', theme:'Discovered attack',type:'tactic', rating:1300, fen:'2bq4/rp3p1p/7k/6p1/3NP3/8/PP3PPP/3Q1RK1 w - - 0 1', line:['d4f5','c8f5','d1d8']},
  {id:'t05', theme:'Queen fork',       type:'tactic', rating:1000, fen:'r5k1/6pp/p7/8/4r3/8/PPP2PPP/3Q2K1 w - - 0 1', line:['d1d5']},
  {id:'t06', theme:'Knight fork',      type:'tactic', rating:1050, fen:'r2q1rk1/ppp2ppp/8/7Q/3n4/8/PP1P1PPP/R1B1KB1R b KQ - 0 1', line:['d4c2','e1d1','c2a1']},
  {id:'t07', theme:'Pawn fork',        type:'tactic', rating:1150, fen:'8/pp1r1kpp/2p5/2b1P3/8/3B4/PP3PPP/4R1K1 w - - 0 1', line:['e5e6']},
  {id:'t08', theme:'Pawn breakthrough',type:'tactic', rating:1500, fen:'6k1/ppp5/8/PPP5/8/8/8/6K1 w - - 0 1', line:['b5b6','a7b6','c5c6','b7c6','a5a6']},
  {id:'m01', theme:'Smothered mate',   type:'mate', n:2, rating:1400, fen:'4r2k/6pp/1q5N/8/2Q5/8/6PP/7K w - - 0 1', line:['c4g8','e8g8','h6f7']},
  {id:'m02', theme:'Opera mate',       type:'mate', n:2, rating:1350, fen:'4kb1r/p2n1ppp/4q3/4p1B1/4P3/1Q6/PPP2PPP/2KR4 w k - 1 17', line:['b3b8','d7b8','d1d8']},
  {id:'m03', theme:'Légal’s mate', type:'mate', n:2, rating:1250, fen:'rn1qkbnr/ppp2p1p/3p2p1/4N3/2B1P3/2N5/PPPP1PPP/R1BbK2R w KQkq - 0 6', line:['c4f7','e8e7','c3d5']},
  {id:'m04', theme:'Anastasia’s mate', type:'mate', n:2, rating:1450, fen:'1q3r1k/pp2Nppp/8/7Q/8/3R4/5PPP/6K1 w - - 0 1', line:['h5h7','h8h7','d3h3']}
];

/* ---------- Pieces: cburnett set (Colin M.L. Burnett, CC BY-SA 3.0) ---------- */
const PIECE_SVG = {"wK":"<svg xmlns=\"http://www.w3.org/2000/svg\" style=\"color-scheme:light only\" viewBox=\"0 0 45 45\"><g fill=\"none\" fill-rule=\"evenodd\" stroke=\"#000\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\"><path stroke-linejoin=\"miter\" d=\"M22.5 11.63V6M20 8h5\"/><path fill=\"#fff\" stroke-linecap=\"butt\" stroke-linejoin=\"miter\" d=\"M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5\"/><path fill=\"#fff\" d=\"M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V27v-3.5c-3.5-7.5-13-10.5-16-4-3 6 5 10 5 10z\"/><path d=\"M11.5 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0\"/></g></svg>","wQ":"<svg xmlns=\"http://www.w3.org/2000/svg\" style=\"color-scheme:light only\" width=\"45\" height=\"45\" viewBox=\"0 0 45 45\"><g fill=\"#fff\" fill-rule=\"evenodd\" stroke=\"#000\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\"><path d=\"M8 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0m16.5-4.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0M41 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0M16 8.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0M33 9a2 2 0 1 1-4 0 2 2 0 1 1 4 0\"/><path stroke-linecap=\"butt\" d=\"M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11V11l-5.5 13.5-3-15-3 15-5.5-14V25L7 14z\"/><path stroke-linecap=\"butt\" d=\"M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z\"/><path fill=\"none\" d=\"M11.5 30c3.5-1 18.5-1 22 0M12 33.5c6-1 15-1 21 0\"/></g></svg>","wR":"<svg xmlns=\"http://www.w3.org/2000/svg\" style=\"color-scheme:light only\" width=\"45\" height=\"45\" viewBox=\"0 0 45 45\"><g fill=\"#fff\" fill-rule=\"evenodd\" stroke=\"#000\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\"><path stroke-linecap=\"butt\" d=\"M9 39h27v-3H9zm3-3v-4h21v4zm-1-22V9h4v2h5V9h5v2h5V9h4v5\"/><path d=\"m34 14-3 3H14l-3-3\"/><path stroke-linecap=\"butt\" stroke-linejoin=\"miter\" d=\"M31 17v12.5H14V17\"/><path d=\"m31 29.5 1.5 2.5h-20l1.5-2.5\"/><path fill=\"none\" stroke-linejoin=\"miter\" d=\"M11 14h23\"/></g></svg>","wB":"<svg xmlns=\"http://www.w3.org/2000/svg\" style=\"color-scheme:light only\" width=\"45\" height=\"45\" viewBox=\"0 0 45 45\"><g fill=\"none\" fill-rule=\"evenodd\" stroke=\"#000\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\"><g fill=\"#fff\" stroke-linecap=\"butt\"><path d=\"M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.35.49-2.32.47-3-.5 1.35-1.94 3-2 3-2z\"/><path d=\"M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z\"/><path d=\"M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z\"/></g><path stroke-linejoin=\"miter\" d=\"M17.5 26h10M15 30h15m-7.5-14.5v5M20 18h5\"/></g></svg>","wN":"<svg xmlns=\"http://www.w3.org/2000/svg\" style=\"color-scheme:light only\" width=\"45\" height=\"45\" viewBox=\"0 0 45 45\"><g fill=\"none\" fill-rule=\"evenodd\" stroke=\"#000\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\"><path fill=\"#fff\" d=\"M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21\"/><path fill=\"#fff\" d=\"M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.042-.94 1.41-3.04 0-3-1 0 .19 1.23-1 2-1 0-4.003 1-4-4 0-2 6-12 6-12s1.89-1.9 2-3.5c-.73-.994-.5-2-.5-3 1-1 3 2.5 3 2.5h2s.78-1.992 2.5-3c1 0 1 3 1 3\"/><path fill=\"#000\" d=\"M9.5 25.5a.5.5 0 1 1-1 0 .5.5 0 1 1 1 0m5.433-9.75a.5 1.5 30 1 1-.866-.5.5 1.5 30 1 1 .866.5\"/></g></svg>","wP":"<svg xmlns=\"http://www.w3.org/2000/svg\" style=\"color-scheme:light only\" width=\"45\" height=\"45\" viewBox=\"0 0 45 45\"><path fill=\"#fff\" stroke=\"#000\" stroke-linecap=\"round\" stroke-width=\"1.5\" d=\"M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z\"/></svg>","bK":"<svg xmlns=\"http://www.w3.org/2000/svg\" style=\"color-scheme:light only\" viewBox=\"0 0 45 45\"><g fill=\"none\" fill-rule=\"evenodd\" stroke=\"#000\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\"><path stroke-linejoin=\"miter\" d=\"M22.5 11.6V6\"/><path fill=\"#000\" stroke-linecap=\"butt\" stroke-linejoin=\"miter\" d=\"M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5\"/><path fill=\"#000\" d=\"M11.5 37a22.3 22.3 0 0 0 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V27v-3.5c-3.5-7.5-13-10.5-16-4-3 6 5 10 5 10z\"/><path stroke-linejoin=\"miter\" d=\"M20 8h5\"/><path stroke=\"#ececec\" d=\"M32 29.5s8.5-4 6-9.7C34.1 14 25 18 22.5 24.6v2.1-2.1C20 18 9.9 14 7 19.9c-2.5 5.6 4.8 9 4.8 9\"/><path stroke=\"#ececec\" d=\"M11.5 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0\"/></g></svg>","bQ":"<svg xmlns=\"http://www.w3.org/2000/svg\" style=\"color-scheme:light only\" width=\"45\" height=\"45\" viewBox=\"0 0 45 45\"><g fill-rule=\"evenodd\" stroke=\"#000\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\"><g stroke=\"none\"><circle cx=\"6\" cy=\"12\" r=\"2.75\"/><circle cx=\"14\" cy=\"9\" r=\"2.75\"/><circle cx=\"22.5\" cy=\"8\" r=\"2.75\"/><circle cx=\"31\" cy=\"9\" r=\"2.75\"/><circle cx=\"39\" cy=\"12\" r=\"2.75\"/></g><path stroke-linecap=\"butt\" d=\"M9 26c8.5-1.5 21-1.5 27 0l2.5-12.5L31 25l-.3-14.1-5.2 13.6-3-14.5-3 14.5-5.2-13.6L14 25 6.5 13.5z\"/><path stroke-linecap=\"butt\" d=\"M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z\"/><path fill=\"none\" stroke-linecap=\"butt\" d=\"M11 38.5a35 35 1 0 0 23 0\"/><path fill=\"none\" stroke=\"#ececec\" d=\"M11 29a35 35 1 0 1 23 0m-21.5 2.5h20m-21 3a35 35 1 0 0 22 0m-23 3a35 35 1 0 0 24 0\"/></g></svg>","bR":"<svg xmlns=\"http://www.w3.org/2000/svg\" style=\"color-scheme:light only\" width=\"45\" height=\"45\" viewBox=\"0 0 45 45\"><g fill-rule=\"evenodd\" stroke=\"#000\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\"><path stroke-linecap=\"butt\" d=\"M9 39h27v-3H9zm3.5-7 1.5-2.5h17l1.5 2.5zm-.5 4v-4h21v4z\"/><path stroke-linecap=\"butt\" stroke-linejoin=\"miter\" d=\"M14 29.5v-13h17v13z\"/><path stroke-linecap=\"butt\" d=\"M14 16.5 11 14h23l-3 2.5zM11 14V9h4v2h5V9h5v2h5V9h4v5z\"/><path fill=\"none\" stroke=\"#ececec\" stroke-linejoin=\"miter\" stroke-width=\"1\" d=\"M12 35.5h21m-20-4h19m-18-2h17m-17-13h17M11 14h23\"/></g></svg>","bB":"<svg xmlns=\"http://www.w3.org/2000/svg\" style=\"color-scheme:light only\" width=\"45\" height=\"45\" viewBox=\"0 0 45 45\"><g fill=\"none\" fill-rule=\"evenodd\" stroke=\"#000\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\"><g fill=\"#000\" stroke-linecap=\"butt\"><path d=\"M9 36c3.4-1 10.1.4 13.5-2 3.4 2.4 10.1 1 13.5 2 0 0 1.6.5 3 2-.7 1-1.6 1-3 .5-3.4-1-10.1.5-13.5-1-3.4 1.5-10.1 0-13.5 1-1.4.5-2.3.5-3-.5 1.4-2 3-2 3-2z\"/><path d=\"M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z\"/><path d=\"M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z\"/></g><path stroke=\"#ececec\" stroke-linejoin=\"miter\" d=\"M17.5 26h10M15 30h15m-7.5-14.5v5M20 18h5\"/></g></svg>","bN":"<svg xmlns=\"http://www.w3.org/2000/svg\" style=\"color-scheme:light only\" width=\"45\" height=\"45\" viewBox=\"0 0 45 45\"><g fill=\"none\" fill-rule=\"evenodd\" stroke=\"#000\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\"><path fill=\"#000\" d=\"M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21\"/><path fill=\"#000\" d=\"M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.04-.94 1.41-3.04 0-3-1 0 .19 1.23-1 2-1 0-4 1-4-4 0-2 6-12 6-12s1.89-1.9 2-3.5c-.73-1-.5-2-.5-3 1-1 3 2.5 3 2.5h2s.78-2 2.5-3c1 0 1 3 1 3\"/><path fill=\"#ececec\" stroke=\"#ececec\" d=\"M9.5 25.5a.5.5 0 1 1-1 0 .5.5 0 1 1 1 0m5.43-9.75a.5 1.5 30 1 1-.86-.5.5 1.5 30 1 1 .86.5\"/><path fill=\"#ececec\" stroke=\"none\" d=\"m24.55 10.4-.45 1.45.5.15c3.15 1 5.65 2.49 7.9 6.75S35.75 29.06 35.25 39l-.05.5h2.25l.05-.5c.5-10.06-.88-16.85-3.25-21.34s-5.79-6.64-9.19-7.16z\"/></g></svg>","bP":"<svg xmlns=\"http://www.w3.org/2000/svg\" style=\"color-scheme:light only\" width=\"45\" height=\"45\" viewBox=\"0 0 45 45\"><path stroke=\"#000\" stroke-linecap=\"round\" stroke-width=\"1.5\" d=\"M22.5 9a4 4 0 0 0-3.22 6.38 6.48 6.48 0 0 0-.87 10.65c-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47a6.46 6.46 0 0 0-.87-10.65A4.01 4.01 0 0 0 22.5 9z\"/></svg>"};

/* ---------- Board themes ---------- */
const THEMES = [
  {id:'greenwood', name:'Greenwood', l:'#e9eedd', d:'#5b8d7a'},
  {id:'glass',     name:'Glass',     l:'rgba(255,255,255,.55)', d:'rgba(255,255,255,.14)', glass:true, bg:'linear-gradient(135deg,#7f6cf2,#3fb8c9)'},
  {id:'midnight',  name:'Midnight',  l:'rgba(205,210,255,.42)', d:'rgba(40,40,110,.42)', glass:true, bg:'linear-gradient(135deg,#1d1b4f,#4b2a7b)'},
  {id:'wood',      name:'Walnut',    l:'#f0d9b5', d:'#b58863'},
  {id:'marble',    name:'Marble',    l:'#ecebe7', d:'#a3a8b4'},
  {id:'ocean',     name:'Ocean',     l:'#dbe9f2', d:'#5f8fb3'},
  {id:'coral',     name:'Coral',     l:'#f7e6da', d:'#d9826a'},
  {id:'candy',     name:'Candy',     l:'#fde7f1', d:'#9ad7c9'},
  {id:'violet',    name:'Violet',    l:'#ece6f7', d:'#8d74c4'},
  {id:'sand',      name:'Sand',      l:'#f4eacf', d:'#c4a062'}
];

const TIME_CONTROLS = [
  {id:'0',      label:'No clock', group:'Casual'},
  {id:'60+0',   label:'1 min',    group:'Bullet'},
  {id:'120+1',  label:'2 | 1',    group:'Bullet'},
  {id:'180+0',  label:'3 min',    group:'Blitz'},
  {id:'180+2',  label:'3 | 2',    group:'Blitz'},
  {id:'300+0',  label:'5 min',    group:'Blitz'},
  {id:'600+0',  label:'10 min',   group:'Rapid'},
  {id:'900+10', label:'15 | 10',  group:'Rapid'},
  {id:'1800+0', label:'30 min',   group:'Rapid'}
];

/* ---------- Cartoon avatars (original characters, drawn as SVG) ---------- */
function avatar(a){
  if (a.robot) return robot(a);
  const hair = a.hair || '#3b2a20', skin = a.skin;
  let s = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="100" height="100" fill="${a.bg}"/>`;
  s += `<circle cx="84" cy="14" r="22" fill="#fff" opacity=".13"/><circle cx="10" cy="92" r="16" fill="#000" opacity=".05"/>`;
  // hair behind the head
  if (a.style === 'long') s += `<path d="M23 54C19 22 81 22 77 54L81 96H19Z" fill="${hair}"/>`;
  if (a.style === 'braids') s += `<rect x="20" y="44" width="9" height="30" rx="4.5" fill="${hair}"/><rect x="71" y="44" width="9" height="30" rx="4.5" fill="${hair}"/><circle cx="24.5" cy="76" r="4" fill="${a.accent || '#e05a7a'}"/><circle cx="75.5" cy="76" r="4" fill="${a.accent || '#e05a7a'}"/>`;
  if (a.style === 'pigtails') s += `<circle cx="20" cy="40" r="10" fill="${hair}"/><circle cx="80" cy="40" r="10" fill="${hair}"/><circle cx="26" cy="34" r="3" fill="${a.accent || '#ff5c8a'}"/><circle cx="74" cy="34" r="3" fill="${a.accent || '#ff5c8a'}"/>`;
  if (a.style === 'bun') s += `<circle cx="50" cy="18" r="10" fill="${hair}"/>`;
  if (a.style === 'ponytail') s += `<path d="M70 30c14 4 16 24 8 40-2-12-6-22-12-28z" fill="${hair}"/>`;
  if (a.style === 'afro') s += [[28,40,13],[36,26,14],[50,20,15],[64,26,14],[72,40,13],[24,54,9],[76,54,9]].map(([x,y,r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${hair}"/>`).join('');
  if (a.style === 'headscarf') s += `<path d="M22 52C20 20 80 20 78 52L84 100H16Z" fill="${a.scarf || '#5a4fcf'}"/>`;
  // shoulders, neck, ears, head
  s += `<path d="M13 100C15 80 31 72 50 72S85 80 87 100Z" fill="${a.shirt}"/>`;
  if (a.collar) s += `<path d="M40 73l10 10 10-10" fill="none" stroke="${a.collar}" stroke-width="3" stroke-linejoin="round"/>`;
  if (a.tie) s += `<path d="M48 76h4l2 4-4 14-4-14z" fill="${a.tie}"/>`;
  s += `<path d="M42 61h16v12c0 4-16 4-16 0z" fill="${skin}"/><path d="M42 67q8 5 16 0v-4H42z" fill="#000" opacity=".12"/>`;
  if (a.style !== 'headscarf') s += `<circle cx="28" cy="49" r="5" fill="${skin}"/><circle cx="72" cy="49" r="5" fill="${skin}"/>`;
  s += `<ellipse cx="50" cy="46" rx="22" ry="24" fill="${skin}"/>`;
  if (a.old) s += `<path d="M41 32q9-3 18 0M43 36q7-2 14 0M33 52q2 3 0 5M67 52q-2 3 0 5" stroke="#000" stroke-opacity=".16" stroke-width="1.3" fill="none" stroke-linecap="round"/>`;
  // hair in front
  switch (a.style){
    case 'short': s += `<path d="M27 46C24 22 42 15 54 17c14 2 23 13 19 29-3-11-11-17-23-16-11 0-19 6-23 16z" fill="${hair}"/>`; break;
    case 'side': s += `<path d="M27 46C25 22 44 14 58 18c12 4 18 14 15 28-4-8-9-13-15-15-8 4-20 5-31 15z" fill="${hair}"/>`; break;
    case 'buzz': s += `<path d="M28 42C28 24 40 20 50 20s22 4 22 22c-6-8-14-11-22-11s-16 3-22 11z" fill="${hair}" opacity=".85"/>`; break;
    case 'spiky': s += `<path d="M27 44l1-16 6 4 2-12 7 7 5-11 5 10 7-8 3 10 7-4v10l4 10c-6-10-14-13-24-13s-18 4-23 13z" fill="${hair}"/>`; break;
    case 'mohawk': s += `<path d="M44 30C44 10 56 10 56 30z" fill="${hair}"/><path d="M28 44c2-10 10-14 22-14s20 4 22 14" fill="none" stroke="${hair}" stroke-width="3" opacity=".5"/>`; break;
    case 'long': case 'braids': case 'ponytail': s += `<path d="M27 48c-2-24 13-30 23-30 12 0 26 7 23 30-3-12-9-18-15-19-4 5-14 7-24 6-4 3-6 7-7 13z" fill="${hair}"/>`; break;
    case 'pigtails': s += `<path d="M27 46c-1-20 12-27 23-27s24 7 23 27c-4-8-8-13-14-15-6 4-18 6-26 4-3 3-5 7-6 11z" fill="${hair}"/>`; break;
    case 'bob': s += `<path d="M25 60C19 26 40 18 50 18c12 0 32 8 25 42-2-8-3-18-7-24-10 2-24 0-34-4-4 8-6 18-9 28z" fill="${hair}"/>`; break;
    case 'bun': s += `<path d="M27 46c-2-20 13-25 23-25 12 0 26 6 23 25-3-10-11-15-23-15-10 0-19 5-23 15z" fill="${hair}"/>`; break;
    case 'bald': s += `<path d="M26 52c-1-10 1-15 5-18v14zM74 52c1-10-1-15-5-18v14z" fill="${hair}"/>`; break;
    case 'curly': s += [[30,37,7],[36,27,8],[46,22,8.5],[56,22,8.5],[65,27,8],[71,37,7],[41,30,6],[59,30,6]].map(([x,y,r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${hair}"/>`).join(''); break;
    case 'afro': s += `<path d="M30 40c4-8 12-10 20-10s16 2 20 10" fill="none" stroke="${hair}" stroke-width="6"/>`; break;
    case 'headscarf': s += `<path d="M26 50C24 24 40 18 50 18s26 6 24 32c-3-12-12-18-24-18S29 38 26 50z" fill="${a.scarf || '#5a4fcf'}"/><path d="M26 50c0 0 3-14 24-15" fill="none" stroke="#fff" stroke-opacity=".25" stroke-width="2"/>`; break;
  }
  if (a.flower) s += `<g transform="translate(66 26)">${[0,72,144,216,288].map(d => `<circle cx="${(5*Math.cos(d*Math.PI/180)).toFixed(1)}" cy="${(5*Math.sin(d*Math.PI/180)).toFixed(1)}" r="3.6" fill="${a.flower}"/>`).join('')}<circle r="2.6" fill="#ffd54a"/></g>`;
  if (a.headband) s += `<path d="M28 36q22-12 44 0" fill="none" stroke="${a.headband}" stroke-width="5" stroke-linecap="round"/>`;
  // face
  s += `<path d="M37 40q5-3 9 0M54 40q5-3 9 0" stroke="${a.brow || hair}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
  if (a.wink) s += `<ellipse cx="41.5" cy="47" rx="2.8" ry="3.4" fill="#1d1d1d"/><path d="M55.5 47.5q3 2 6 0" stroke="#1d1d1d" stroke-width="2" fill="none" stroke-linecap="round"/><circle cx="42.6" cy="45.7" r="1" fill="#fff"/>`;
  else s += `<ellipse cx="41.5" cy="47" rx="2.8" ry="3.4" fill="#1d1d1d"/><ellipse cx="58.5" cy="47" rx="2.8" ry="3.4" fill="#1d1d1d"/><circle cx="42.6" cy="45.7" r="1" fill="#fff"/><circle cx="59.6" cy="45.7" r="1" fill="#fff"/>`;
  s += `<circle cx="35.5" cy="55" r="3.8" fill="#ff6f6f" opacity=".26"/><circle cx="64.5" cy="55" r="3.8" fill="#ff6f6f" opacity=".26"/>`;
  if (a.freckles) s += `<g fill="#8a4b2a" opacity=".45"><circle cx="34" cy="53" r=".9"/><circle cx="37" cy="55" r=".9"/><circle cx="35" cy="57" r=".9"/><circle cx="66" cy="53" r=".9"/><circle cx="63" cy="55" r=".9"/><circle cx="65" cy="57" r=".9"/></g>`;
  s += `<path d="M50 49q-2.5 5 0 6" stroke="#000" stroke-opacity=".25" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;
  if (a.beard) s += `<path d="M28 48c1 24 12 33 22 33s21-9 22-33c-3 10-10 14-22 14S31 58 28 48z" fill="${a.beard}"/>`;
  if (a.goatee) s += `<path d="M45 62q5 10 10 0z" fill="${a.goatee}"/>`;
  if (a.mustache) s += `<path d="M40 59.5q10-7 20 0q-10 2.5-20 0z" fill="${a.mustache}"/>`;
  s += a.grin
    ? `<path d="M43 59q7 9 14 0z" fill="#6b2020"/><path d="M44.4 59.3h11.2v1.8H44.4z" fill="#fff"/>`
    : a.smirk ? `<path d="M45 61q6 2 11-2" stroke="#6b2a2a" stroke-width="2.2" fill="none" stroke-linecap="round"/>`
    : `<path d="M44 60q6 5 12 0" stroke="#6b2a2a" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
  if (a.glasses) s += `<g fill="none" stroke="${a.glasses}" stroke-width="2"><circle cx="41.5" cy="47" r="6.5"/><circle cx="58.5" cy="47" r="6.5"/><path d="M48 47h4M35 46l-6-2M65 46l6-2"/></g>`;
  if (a.shades) s += `<path d="M33 43h14l-1 7q-6 3-12 0zM53 43h14l-1 7q-6 3-12 0z" fill="${a.shades}"/><path d="M47 45h6" stroke="${a.shades}" stroke-width="2"/>`;
  if (a.earrings) s += `<circle cx="28" cy="56" r="2.3" fill="${a.earrings}"/><circle cx="72" cy="56" r="2.3" fill="${a.earrings}"/>`;
  if (a.headphones) s += `<path d="M24 50C24 22 76 22 76 50" fill="none" stroke="${a.headphones}" stroke-width="4"/><rect x="18" y="44" width="10" height="16" rx="4" fill="${a.headphones}"/><rect x="72" y="44" width="10" height="16" rx="4" fill="${a.headphones}"/>`;
  if (a.cap) s += `<path d="M26 41C25 18 75 18 74 41z" fill="${a.cap}"/><path d="M50 37c12-2 26-2 33 2-6 4-21 4-33 2z" fill="${a.cap}"/><path d="M26 41h48" stroke="#000" stroke-opacity=".2" stroke-width="2"/>`;
  if (a.beanie) s += `<path d="M25 43C24 15 76 15 75 43z" fill="${a.beanie}"/><rect x="23" y="36" width="54" height="9" rx="4.5" fill="${a.beanie}"/><rect x="23" y="36" width="54" height="9" rx="4.5" fill="#000" opacity=".15"/><circle cx="50" cy="15" r="5" fill="${a.beanie}"/>`;
  if (a.crown) s += `<path d="M32 26l6-14 6 9 6-12 6 12 6-9 6 14z" fill="#ffc531" stroke="#c98a00" stroke-width="1.5" stroke-linejoin="round"/><circle cx="50" cy="20" r="2" fill="#e5484d"/>`;
  if (a.wizard) s += `<path d="M22 37L52 1l26 36z" fill="${a.wizard}"/><path d="M17 37h66q0 7-7 7H24q-7 0-7-7z" fill="${a.wizard}"/><path d="M17 37h66q0 7-7 7H24q-7 0-7-7z" fill="#000" opacity=".18"/><path d="M46 20l1.5 3 3.3.4-2.4 2.3.6 3.3-3-1.6-3 1.6.6-3.3-2.4-2.3 3.3-.4z" fill="#ffe27a"/><circle cx="59" cy="29" r="1.8" fill="#ffe27a"/>`;
  return s + '</svg>';
}
function robot(a){
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="100" height="100" fill="${a.bg}"/>` +
    `<circle cx="84" cy="14" r="22" fill="#fff" opacity=".12"/><path d="M14 100c2-18 16-26 36-26s34 8 36 26z" fill="${a.shirt}"/>` +
    `<rect x="44" y="64" width="12" height="12" fill="#8a94a8"/><path d="M50 8v10" stroke="#c9d1df" stroke-width="3"/><circle cx="50" cy="7" r="4" fill="${a.glow}"/>` +
    `<rect x="24" y="18" width="52" height="48" rx="14" fill="#dfe5ef"/><rect x="24" y="18" width="52" height="48" rx="14" fill="none" stroke="#9aa6ba" stroke-width="2"/>` +
    `<rect x="31" y="30" width="38" height="18" rx="9" fill="#1b2035"/><circle cx="41" cy="39" r="4.5" fill="${a.glow}"/><circle cx="59" cy="39" r="4.5" fill="${a.glow}"/>` +
    `<path d="M40 56h20" stroke="#5c6680" stroke-width="3" stroke-linecap="round"/><rect x="18" y="34" width="6" height="14" rx="3" fill="#9aa6ba"/><rect x="76" y="34" width="6" height="14" rx="3" fill="#9aa6ba"/></svg>`;
}

/* ---------- Bots ---------- */
// Up to 1250 the built-in search plays (local); stronger bots use Stockfish with capped skill, depth and think time (sf).
const TIERS = ['Beginner', 'Club', 'Advanced', 'Expert', 'Master'];
const BOTS = [
  {name:'Pip', elo:250, tier:0, blurb:'Six years old and very excited.', style:'Moves anything that wiggles.',
   greet:'Hi!! Which ones are the horsies?', win:'I WON! I won I won!', lose:'That was fun! Again!',
   local:{depth:1, qd:0, noise:520}, look:{bg:'#ffd6e7', skin:'#f7d2b4', hair:'#f2b33d', style:'pigtails', shirt:'#ff7eb3', grin:true, freckles:true}},
  {name:'Sprout', elo:400, tier:0, blurb:'Still learning how the pieces move.', style:'Brave but random.',
   greet:'Hi! I just learned how the horsey moves. Be nice!', win:'I won? Wow! Can we play again?', lose:'Good game! You’re really good.',
   local:{depth:1, qd:0, noise:320}, look:{bg:'#9ad1f5', skin:'#f6cfae', hair:'#4a3020', style:'spiky', shirt:'#ff8a3d', freckles:true, grin:true}},
  {name:'Maple', elo:550, tier:0, blurb:'Loves the queen. Maybe too much.', style:'Early queen adventures.',
   greet:'My queen is coming for you!', win:'The queen did it again!', lose:'Oh no, my poor queen.',
   local:{depth:1, qd:1, noise:200}, look:{bg:'#ffcf9e', skin:'#e8b48c', hair:'#9b3b1f', style:'ponytail', shirt:'#e84c3d', headband:'#ffd23f'}},
  {name:'Acorn', elo:700, tier:0, blurb:'Grabs loose pieces, misses plenty.', style:'Greedy.',
   greet:'Let’s play! I love taking pieces.', win:'Yes! Free pieces for me.', lose:'Aw, you got me. Rematch?',
   local:{depth:1, qd:0, noise:90}, look:{bg:'#ffd27a', skin:'#c98a5a', hair:'#2a1a12', style:'short', shirt:'#3b82c4', cap:'#d64545', grin:true}},
  {name:'Juniper', elo:850, tier:1, blurb:'Plays fast and hopes for the best.', style:'Speedy, a bit careless.',
   greet:'Ready? I don’t like to think too long.', win:'Speed wins!', lose:'Okay, maybe I should slow down.',
   local:{depth:2, qd:2, noise:45}, look:{bg:'#c4f1e0', skin:'#f1c7a5', hair:'#20262e', style:'side', shirt:'#14b8a6', headphones:'#334155'}},
  {name:'Fern', elo:1000, tier:1, blurb:'Looks a move ahead and likes trades.', style:'Solid trader.',
   greet:'I think one move ahead. Can you think two?', win:'One move ahead was enough today!', lose:'You out-thought me. Nicely done.',
   local:{depth:2, qd:3, noise:12}, look:{bg:'#b9e3a8', skin:'#f3c9a6', hair:'#b5562b', style:'braids', shirt:'#2f9e77', accent:'#f2c94c', freckles:true}},
  {name:'Ivy', elo:1100, tier:1, blurb:'Knows her openings, gets lost later.', style:'Book-smart.',
   greet:'I studied the Italian Game all week.', win:'The opening prep worked!', lose:'I knew the opening... and then I didn’t.',
   local:{depth:3, qd:3, noise:30}, look:{bg:'#e3d5ff', skin:'#5e3b2a', hair:'#151012', style:'afro', shirt:'#6d4ad8', earrings:'#ffd166'}},
  {name:'Hazel', elo:1250, tier:1, blurb:'Careful, rarely hangs a piece.', style:'Careful defender.',
   greet:'Careful moves win games. Good luck!', win:'Patience pays off. Good game.', lose:'Well played. I’ll be more careful next time.',
   local:{depth:3, qd:4, noise:0}, look:{bg:'#f6c1cf', skin:'#8d5a3b', hair:'#1f1410', style:'bob', shirt:'#7b4fc4', glasses:'#2b2b2b'}},
  {name:'Rowan', elo:1350, tier:2, blurb:'Attacks the king at every chance.', style:'Aggressive attacker.',
   greet:'Your king looks a little lonely.', win:'Attack, attack, attack!', lose:'My attack ran out of steam.',
   sf:{skill:1, depth:4, ms:250}, look:{bg:'#ffb3a7', skin:'#f2c4a0', hair:'#2c1b12', style:'mohawk', shirt:'#1f2937', goatee:'#2c1b12'}},
  {name:'Willow', elo:1500, tier:2, blurb:'A club player who spots simple tactics.', style:'Tactical.',
   greet:'I play at my club every Tuesday. Show me what you’ve got.', win:'Club practice paid off!', lose:'Great game. You’d do well at my club.',
   sf:{skill:3, depth:5, ms:300}, look:{bg:'#c7d2fe', skin:'#f1d0b5', hair:'#e2c06b', style:'long', shirt:'#e66a8c', flower:'#ff8fb1'}},
  {name:'Aspen', elo:1650, tier:2, blurb:'Patient positional player.', style:'Squeezes slowly.',
   greet:'No rush. Chess is a long game.', win:'Small advantages add up.', lose:'You outplayed me positionally. Impressive.',
   sf:{skill:5, depth:7, ms:400}, look:{bg:'#d9f99d', skin:'#f0c9a8', hair:'#7c4a1e', style:'headscarf', scarf:'#0e7490', shirt:'#155e75'}},
  {name:'Birch', elo:1800, tier:2, blurb:'Solid, punishes loose play.', style:'Punisher.',
   greet:'Leave a piece loose and I’ll find it.', win:'Loose pieces, as promised.', lose:'Solid play. I couldn’t find a way in.',
   sf:{skill:7, depth:8, ms:500}, look:{bg:'#a7d8d0', skin:'#e6b08a', hair:'#6b4226', style:'short', shirt:'#55606e', beard:'#6b4226', beanie:'#2f6f5e'}},
  {name:'Linden', elo:1950, tier:3, blurb:'Endgame specialist.', style:'Trades into endgames.',
   greet:'Let’s see who knows their endgames.', win:'Endgames decide games.', lose:'Your technique was excellent.',
   sf:{skill:9, depth:10, ms:600}, look:{bg:'#fde68a', skin:'#c68c63', hair:'#3a2617', style:'buzz', shirt:'#b45309', glasses:'#111827'}},
  {name:'Elm', elo:2100, tier:3, blurb:'Expert strength, sees combinations.', style:'Combinational.',
   greet:'Tactics are just patterns. Let’s see yours.', win:'The pattern was there. Study it in review.', lose:'A fine combination. I tip my hat.',
   sf:{skill:11, depth:11, ms:800}, look:{bg:'#f3d9a4', skin:'#f0c6a2', hair:'#8e8e8e', style:'bald', shirt:'#8a5a2b', collar:'#f5f0e6', glasses:'#5a3a1a', mustache:'#8e8e8e', brow:'#7a7a7a'}},
  {name:'Sequoia', elo:2250, tier:3, blurb:'Sharp, loves sacrifices.', style:'Sacrificial.',
   greet:'Material is temporary. Initiative is forever.', win:'The sacrifice was sound!', lose:'You defended perfectly.',
   sf:{skill:13, depth:12, ms:900}, look:{bg:'#c7f0ff', skin:'#f3d1b6', hair:'#1e293b', style:'side', shirt:'#0f172a', shades:'#111', smirk:true}},
  {name:'Cedar', elo:2400, tier:3, blurb:'Master strength.', style:'Precise.',
   greet:'I don’t give away free moves. Shall we?', win:'Precision wins. Good game.', lose:'Impressive. That was master-level play.',
   sf:{skill:15, depth:14, ms:1000}, look:{bg:'#d6c4f0', skin:'#6e4630', hair:'#141010', style:'bun', shirt:'#c43d5a', earrings:'#f2c94c'}},
  {name:'Cypress', elo:2550, tier:4, blurb:'International master energy.', style:'Universal.',
   greet:'Every move matters at this level.', win:'You’ll get there. Review this one.', lose:'That was a real master performance.',
   sf:{skill:17, depth:16, ms:1200}, look:{bg:'#bbf7d0', skin:'#e9b896', hair:'#4b2e1a', style:'long', shirt:'#166534', glasses:'#14532d', wink:true}},
  {name:'Redwood', elo:2700, tier:4, blurb:'Grandmaster strength.', style:'Relentless.',
   greet:'Grandmaster chess today. Ready?', win:'A grandmaster rarely lets go. Good effort.', lose:'Remarkable. You beat a grandmaster-level bot!',
   sf:{skill:18, depth:18, ms:1500}, look:{bg:'#ffb59a', skin:'#f2c4a0', hair:'#b8401f', style:'curly', shirt:'#2e4a7d', beard:'#b8401f', grin:true}},
  {name:'Baobab', elo:2850, tier:4, blurb:'Super-grandmaster. Calm and deep.', style:'Deep calculator.',
   greet:'Take your time. I always do.', win:'Depth beats speed.', lose:'Extraordinary. Truly.',
   sf:{skill:19, depth:20, ms:2000}, look:{bg:'#fcd9a8', skin:'#4a2c1d', hair:'#d9d9d9', style:'buzz', shirt:'#7c2d12', beard:'#d9d9d9', tie:'#f59e0b', collar:'#fff7ed'}},
  {name:'Ancient Oak', elo:3000, tier:4, blurb:'Full-strength Stockfish. Good luck.', style:'Engine.',
   greet:'I have seen every position. Show me something new.', win:'As the old trees say: patience.', lose:'In a thousand years, few have done that.',
   sf:{skill:20, depth:0, ms:2500}, look:{bg:'#9fb59a', skin:'#efd2b8', hair:'#f2f2f2', style:'bald', shirt:'#4a3b7a', beard:'#f4f4f4', mustache:'#ffffff', brow:'#e8e8e8', old:true, wizard:'#3d4f8f'}}
];
const PEOPLE = {
  you:    {name:'You', look:{bg:'#cfd5ff', skin:'#f0c39e', hair:'#3a2a1e', style:'short', shirt:'#6c5ce7', grin:true}},
  white:  {name:'White', look:{bg:'#e9edf2', skin:'#f3cfb0', hair:'#5a3c26', style:'curly', shirt:'#f4f4f4', collar:'#9aa4ae'}},
  black:  {name:'Black', look:{bg:'#3a4048', skin:'#a8714c', hair:'#121212', style:'short', shirt:'#1e1e1e', collar:'#555'}},
  coach:  {name:'Coach Ada', look:{bg:'#ffe08a', skin:'#d79c72', hair:'#2b1d14', style:'bun', shirt:'#6c5ce7', glasses:'#2b2b2b', grin:true}},
  owl:    {name:'Professor Hoot', look:{bg:'#ffe7a3', robot:true, shirt:'#7c5cff', glow:'#7cf7c6'}}
};
// Pieces players can use to build their own avatar
const AVATAR_PARTS = {
  skin: ['#f7d7bd', '#f0c39e', '#e0ac85', '#c68c63', '#8d5a3b', '#5e3b2a'],
  hair: ['#151012', '#3a2a1e', '#7c4a1e', '#b5562b', '#e2c06b', '#d9d9d9', '#6c5ce7', '#ef476f'],
  style: ['short', 'side', 'buzz', 'spiky', 'curly', 'afro', 'long', 'bob', 'bun', 'ponytail', 'braids', 'pigtails', 'mohawk', 'bald', 'headscarf'],
  shirt: ['#6c5ce7', '#ffb627', '#14b8a6', '#ef476f', '#3b82c4', '#1f2937', '#22c55e', '#f97316'],
  bg: ['#cfd5ff', '#ffe08a', '#b9f3e4', '#ffd6e7', '#c7f0ff', '#e3d5ff', '#fde68a', '#d9f99d'],
  extra: ['none', 'glasses', 'shades', 'headphones', 'cap', 'beanie', 'crown', 'beard', 'freckles']
};

/* ---------- Cups (knockout tournaments vs bots) ---------- */
const CUPS = [
  {id:'seedling', name:'Seedling Cup',     color:'#7cc96b', min:0,    bots:[0, 1, 2, 3, 4, 5, 1],   tc:'0',      blurb:'Your first trophy. Friendly opponents only.'},
  {id:'acorn',    name:'Acorn Open',       color:'#d9a441', min:500,  bots:[3, 4, 5, 6, 2, 7, 4],   tc:'600+0',  blurb:'Club-level rivals who punish loose pieces.'},
  {id:'willow',   name:'Willow Classic',   color:'#4fa3d9', min:900,  bots:[6, 7, 8, 9, 5, 10, 8],  tc:'600+0',  blurb:'Tactical players and patient grinders.'},
  {id:'birch',    name:'Birch Masters',    color:'#9b7be8', min:1300, bots:[9, 10, 11, 12, 8, 13, 11], tc:'900+10', blurb:'Strong club players and experts.'},
  {id:'cedar',    name:'Cedar Championship', color:'#e5484d', min:1700, bots:[12, 13, 14, 15, 11, 16, 14], tc:'900+10', blurb:'Expert and master-level bots.'},
  {id:'oak',      name:'Ancient Oak Grand Prix', color:'#ffb627', min:2100, bots:[15, 16, 17, 18, 14, 19, 17], tc:'900+10', blurb:'The strongest bots in the forest.'}
];

/* ---------- Achievements ---------- */
const ACHIEVEMENTS = [
  {id:'first-game', name:'First steps',   desc:'Finish your first game.', icon:'♟'},
  {id:'first-win',  name:'First victory', desc:'Win a game against a bot.', icon:'♕'},
  {id:'beat-1000',  name:'Club ready',    desc:'Beat a bot rated 1000 or more.', icon:'♘'},
  {id:'beat-1500',  name:'Tactician',     desc:'Beat a bot rated 1500 or more.', icon:'♗'},
  {id:'beat-2000',  name:'Expert slayer', desc:'Beat a bot rated 2000 or more.', icon:'♖'},
  {id:'beat-2500',  name:'Master slayer', desc:'Beat a bot rated 2500 or more.', icon:'♕'},
  {id:'beat-3000',  name:'Legend',        desc:'Beat Ancient Oak.', icon:'♔'},
  {id:'rating-1200',name:'Rising star',   desc:'Reach a rating of 1200.', icon:'★'},
  {id:'rating-1600',name:'Strong player', desc:'Reach a rating of 1600.', icon:'★'},
  {id:'rating-2000',name:'Expert',        desc:'Reach a rating of 2000.', icon:'★'},
  {id:'puzzles-10', name:'Puzzle solver', desc:'Solve 10 puzzles.', icon:'✦'},
  {id:'puzzles-100',name:'Puzzle master', desc:'Solve 100 puzzles.', icon:'✦'},
  {id:'streak-10',  name:'On fire',       desc:'Solve 10 puzzles in a row.', icon:'✹'},
  {id:'rush-15',    name:'Speed demon',   desc:'Score 15 in Puzzle Rush.', icon:'⚡'},
  {id:'cup',        name:'Champion',      desc:'Win any cup.', icon:'☗'},
  {id:'kids',       name:'Little master', desc:'Finish Kids Academy.', icon:'☺'},
  {id:'lessons-10', name:'Scholar',       desc:'Complete 10 lessons.', icon:'✐'},
  {id:'review-5',   name:'Self-improver', desc:'Review 5 of your games.', icon:'⚐'}
];

window.GW_DATA = Object.assign(window.GW_DATA || {}, {PUZZLES, PIECE_SVG, THEMES, TIME_CONTROLS, TIERS, BOTS, PEOPLE, AVATAR_PARTS, CUPS, ACHIEVEMENTS, avatar});
})();
