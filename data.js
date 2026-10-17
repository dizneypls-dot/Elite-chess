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

/* Board themes, piece colourways and seasonal packs live in themes.js */

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

/* ---------- Character portraits (original adult characters, drawn as SVG) ----------
   look: {bg, skin, hair, style, shirt, outfit, eye, brow, face, ...accessories}. mood: '' | 'happy' | 'sad' | 'think'.
   Flat shapes with translucent shading only (no gradient ids), so many portraits can share a page. Eyes blink. */
const shade = (hex, k) => {
  // k < 0 darkens, k > 0 lightens
  const n = parseInt(String(hex).replace('#', '').padEnd(6, '0').slice(0, 6), 16);
  if (isNaN(n)) return hex;
  const f = c => Math.round(k < 0 ? c * (1 + k) : c + (255 - c) * k);
  return '#' + [n >> 16 & 255, n >> 8 & 255, n & 255].map(f).map(c => c.toString(16).padStart(2, '0')).join('');
};
const hashStr = s => { let h = 2166136261; for (const ch of s) h = Math.imul(h ^ ch.charCodeAt(0), 16777619); return h >>> 0; };
const OUTFITS = ['tee', 'hoodie', 'blazer', 'turtleneck', 'jersey', 'jacket'];

function avatar(a, mood = ''){
  if (a.robot) return robot(a);
  const skin = a.skin || '#e0ac85', hair = a.hair || '#2b1d14', shirt = a.shirt || '#6c5ce7';
  const style = a.style || 'short', dark = shade(skin, -0.22), deep = shade(skin, -0.38);
  const outfit = a.outfit || (a.tie || a.collar ? 'blazer' : 'tee');
  const iris = a.eye || '#5b3a24', brow = a.brow || shade(hair, -0.15);
  const lip = a.lip || shade(skin, -0.3);
  const h = hashStr(JSON.stringify(a)), blinkDur = (3.6 + (h % 23) / 10).toFixed(1), blinkAt = ((h >> 5) % 30 / 10).toFixed(1);
  const covered = style === 'headscarf';
  let s = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="100" height="100" fill="${a.bg || '#cfd5ff'}"/>`;
  // backdrop: soft light, a diagonal band and a vignette for depth
  s += `<circle cx="78" cy="18" r="30" fill="#fff" opacity=".16"/><path d="M-10 70L70 -10H100L-10 100Z" fill="#fff" opacity=".07"/><path d="M0 84Q50 74 100 84V100H0Z" fill="#000" opacity=".06"/>`;

  // ----- hair behind the head
  const back = {
    long: `<path d="M29 46C25 20 75 20 71 46L75 88C66 95 34 95 25 88Z" fill="${hair}"/><path d="M29 60L27 86M71 60L73 86" stroke="#000" stroke-opacity=".12" stroke-width="2"/>`,
    bob: `<path d="M28 48C25 22 75 22 72 48L73 67C68 70 64 68 62 65H38C36 68 32 70 27 67Z" fill="${hair}"/>`,
    ponytail: `<path d="M63 26C80 27 83 52 74 74C73 58 69 45 61 35Z" fill="${hair}"/><path d="M66 30C76 36 77 50 74 62" stroke="#fff" stroke-opacity=".18" stroke-width="1.6" fill="none"/>`,
    bun: `<circle cx="50" cy="15" r="9" fill="${hair}"/><path d="M44 12Q50 8 56 12" stroke="#fff" stroke-opacity=".2" stroke-width="1.5" fill="none"/>`,
    pigtails: `<circle cx="29" cy="24" r="8" fill="${hair}"/><circle cx="71" cy="24" r="8" fill="${hair}"/>`,
    afro: [[30,36,14],[38,22,15],[50,17,16],[62,22,15],[70,36,14],[27,50,10],[73,50,10]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${hair}"/>`).join(''),
    locs: `<path d="M29 44C26 20 74 20 71 44L72 84H28Z" fill="${hair}"/>` + [31,36,41,59,64,69].map(x => `<path d="M${x} 50V${78 + (x % 7)}" stroke="#000" stroke-opacity=".18" stroke-width="1.4"/>`).join(''),
    headscarf: `<path d="M27 46C23 16 77 16 73 46L82 100H18Z" fill="${a.scarf || '#5a4fcf'}"/><path d="M27 46C23 16 77 16 73 46L82 100H18Z" fill="#000" opacity=".12"/>`
  };
  if (back[style]) s += back[style];
  if (style === 'braids') s += [33, 67].map(x => `<g fill="${hair}">${[50, 57, 64, 71, 78].map(y => `<ellipse cx="${x}" cy="${y}" rx="3.6" ry="4.2"/>`).join('')}</g><circle cx="${x}" cy="83" r="2.4" fill="${a.accent || '#e05a7a'}"/>`).join('');

  // ----- body and outfit
  const torso = 'M12 100C14 85 28 77 42 75L50 79L58 75C72 77 86 85 88 100Z';
  if (outfit === 'hoodie'){
    s += `<path d="M30 80C30 70 70 70 70 80L66 84H34Z" fill="${shade(shirt, -0.2)}"/><path d="${torso}" fill="${shirt}"/>`;
    s += `<path d="M42 76Q50 86 58 76" fill="none" stroke="${shade(shirt, -0.3)}" stroke-width="2.5"/><path d="M46 82V92M54 82V92" stroke="#fff" stroke-opacity=".75" stroke-width="1.3" stroke-linecap="round"/><path d="M38 94H62" stroke="#000" stroke-opacity=".12" stroke-width="5"/>`;
  } else if (outfit === 'blazer'){
    s += `<path d="${torso}" fill="${shirt}"/><path d="M42 75L50 79L58 75L56 100H44Z" fill="${a.collar || '#f5f3ee'}"/>`;
    s += `<path d="M42 75L50 88L45 100H34L40 86Z" fill="${shade(shirt, -0.18)}"/><path d="M58 75L50 88L55 100H66L60 86Z" fill="${shade(shirt, -0.18)}"/>`;
    if (a.tie) s += `<path d="M48.3 79H51.7L52.6 82L50 96L47.4 82Z" fill="${a.tie}"/>`;
    s += `<circle cx="61" cy="93" r="1" fill="#000" opacity=".3"/>`;
  } else if (outfit === 'turtleneck'){
    s += `<path d="${torso}" fill="${shirt}"/><path d="M41 70H59V79Q50 83 41 79Z" fill="${shade(shirt, -0.12)}"/><path d="M41 74H59M41 77H59" stroke="#000" stroke-opacity=".12" stroke-width="1"/>`;
  } else if (outfit === 'jersey'){
    s += `<path d="${torso}" fill="${shirt}"/><path d="M22 86L30 100M78 86L70 100" stroke="#fff" stroke-opacity=".7" stroke-width="3"/><path d="M42 75L50 82L58 75" fill="none" stroke="#fff" stroke-opacity=".8" stroke-width="2.4"/><path d="M47 90h6v6h-6z" fill="#fff" opacity=".8"/>`;
  } else if (outfit === 'jacket'){
    s += `<path d="${torso}" fill="${a.inner || '#f4f4f4'}"/><path d="M12 100C14 85 28 77 42 75L47 100Z" fill="${shirt}"/><path d="M88 100C86 85 72 77 58 75L53 100Z" fill="${shirt}"/><path d="M42 75L46 84L41 86M58 75L54 84L59 86" fill="none" stroke="${shade(shirt, -0.3)}" stroke-width="1.6"/><path d="M47 100V84M53 100V84" stroke="#000" stroke-opacity=".15" stroke-width="1"/>`;
  } else {
    s += `<path d="${torso}" fill="${shirt}"/><path d="M41 75.5Q50 84 59 75.5" fill="none" stroke="${shade(shirt, -0.25)}" stroke-width="2.2"/>`;
  }
  s += `<path d="M20 90Q24 84 30 82" stroke="#000" stroke-opacity=".1" stroke-width="2" fill="none"/><path d="M80 90Q76 84 70 82" stroke="#000" stroke-opacity=".1" stroke-width="2" fill="none"/>`;
  if (a.medal) s += `<path d="M46 78L50 88L54 78" fill="none" stroke="#e5484d" stroke-width="2"/><circle cx="50" cy="90" r="3.4" fill="#ffc531" stroke="#c98a00"/>`;

  // ----- neck, ears, face
  if (!covered || outfit !== 'hoodie') s += `<path d="M43.5 58V75Q50 80 56.5 75V58Z" fill="${skin}"/><path d="M43.5 62Q50 71 56.5 62V67Q50 73 43.5 67Z" fill="#000" opacity=".16"/>`;
  if (!covered) s += `<ellipse cx="31.6" cy="48" rx="3.4" ry="5.4" fill="${skin}"/><ellipse cx="68.4" cy="48" rx="3.4" ry="5.4" fill="${skin}"/><path d="M31 46q1.4 2 0 4M69 46q-1.4 2 0 4" stroke="${deep}" stroke-opacity=".5" stroke-width="1" fill="none"/>`;
  const face = {
    oval:   'M32 44C32 28 40 21.5 50 21.5S68 28 68 44C68 55 63.5 63 57.5 67.5C55 69.5 52.5 70.5 50 70.5S45 69.5 42.5 67.5C36.5 63 32 55 32 44Z',
    square: 'M32 43C32 28 40 21.5 50 21.5S68 28 68 43C68 53 66.5 60 62 65C58 69 54 70.5 50 70.5S42 69 38 65C33.5 60 32 53 32 43Z',
    round:  'M31.5 45C31.5 29 40 22 50 22S68.5 29 68.5 45C68.5 58 61 69 50 69S31.5 58 31.5 45Z',
    long:   'M33 44C33 27 41 20.5 50 20.5S67 27 67 44C67 57 62.5 66 56.5 70C54.5 71.4 52.3 72 50 72S45.5 71.4 43.5 70C37.5 66 33 57 33 44Z'
  }[a.face || (a.beard || a.goatee || a.mustache ? 'square' : 'oval')] || '';
  s += `<path d="${face}" fill="${skin}"/>`;
  // shading: right cheek and under the hairline, a cheekbone light on the left
  s += `<path d="M60 30C67 36 69 48 64 59C61 64 57 68 53 70C60 63 63 52 60 30Z" fill="#000" opacity=".08"/><path d="M36 50Q38 45 43 44" stroke="#fff" stroke-opacity=".22" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
  if (a.old) s += `<path d="M41 31.5q9-2.5 18 0M43 35q7-1.6 14 0M38.5 55q1.8 4 4.5 6.5M61.5 55q-1.8 4-4.5 6.5M36.5 47.5l-2-1M63.5 47.5l2-1" stroke="${deep}" stroke-opacity=".45" stroke-width="1" fill="none" stroke-linecap="round"/>`;
  if (a.freckles) s += `<g fill="${deep}" opacity=".3"><circle cx="38" cy="53" r=".7"/><circle cx="40.5" cy="54.5" r=".7"/><circle cx="38.5" cy="56" r=".7"/><circle cx="62" cy="53" r=".7"/><circle cx="59.5" cy="54.5" r=".7"/><circle cx="61.5" cy="56" r=".7"/><circle cx="50" cy="51" r=".6"/></g>`;
  if (a.blush) s += `<ellipse cx="39" cy="55" rx="3.6" ry="2" fill="#ff6b6b" opacity=".16"/><ellipse cx="61" cy="55" rx="3.6" ry="2" fill="#ff6b6b" opacity=".16"/>`;
  if (a.scar) s += `<path d="M62 38l-3 9" stroke="${deep}" stroke-width="1.1" opacity=".7"/>`;

  // ----- hair in front
  const H = (d, hl) => `<path d="${d}" fill="${hair}"/>` + (hl ? `<path d="${hl}" stroke="#fff" stroke-opacity=".2" stroke-width="1.6" fill="none" stroke-linecap="round"/>` : '');
  switch (style){
    case 'short': s += H('M31 44C29 26 40 18 51 18C63 18 71 26 69 44C67.5 36 64 31.5 59 29.5C52 31.5 42 30.5 36 33.5C33.5 36 32 40 31 44Z', 'M40 24Q50 20 60 23'); break;
    case 'side': s += H('M31 45C28 27 40 17 53 18C65 19 72 28 69 45C68 37 65 32 61 30C55 27.5 46 33 37 33.5C34 36 32 40 31 45Z', 'M45 22Q55 19 64 25') + `<path d="M40 22Q43 26 41 31" stroke="#000" stroke-opacity=".18" stroke-width="1.2" fill="none"/>`; break;
    case 'spiky': s += H('M31 44C29 30 34 22 42 19C44 12 55 10 63 14C68 17 67 21 63 22C69 26 71 34 69 44C67 36 63 31 58 30C50 31.5 40 30.5 35 34C33 37 32 40 31 44Z', 'M47 15Q56 13 62 17'); break;
    case 'buzz': s += `<path d="M32 42C32 27 41 21 50 21S68 27 68 42C65 34 58 30 50 30S35 34 32 42Z" fill="${hair}" opacity=".9"/>`; break;
    case 'mohawk': s += `<path d="M32.5 41C32.5 28 41 22 50 22S67.5 28 67.5 41C64 34 57.5 31 50 31S36 34 32.5 41Z" fill="${hair}" opacity=".45"/>` + H('M41 32C38 17 46 11 56 12C65 13 67 20 62 24C59 29 55 31 50 31C46 31 43 31.5 41 32Z', 'M47 15Q55 13 60 17'); break;
    case 'long': case 'ponytail': case 'locs':
      s += H('M31 47C29 26 40 19 50 19C62 19 71 26 69 47C67 38 62 31 56 29C52 34 42 36 34 37.5C32 40.5 31.5 43.5 31 47Z', 'M42 23Q52 19 62 24'); break;
    case 'braids': s += H('M31 46C30 26 40 20 50 20S70 26 69 46C67 37 62 31 56 30C50 31 44 31 38 33C34 36 32 41 31 46Z', 'M50 20V30'); break;
    case 'pigtails': case 'bun': s += H('M31 44C30 27 40 20 50 20S70 27 69 44C66 33 59 28.5 50 28.5S34 33 31 44Z', 'M42 23Q50 20 58 23'); break;
    case 'bob': s += H('M31 46C30 27 40 20 50 20C61 20 70 27 69 46C66 36 61 32 54 31C46 32 38 34 34 40C32.5 42 31.5 44 31 46Z', 'M44 23Q54 20 63 26'); break;
    case 'bald': s += `<path d="M31.5 50C31 42 32 37 34 35V48ZM68.5 50C69 42 68 37 66 35V48Z" fill="${hair}"/><ellipse cx="44" cy="27" rx="6" ry="2.6" fill="#fff" opacity=".22" transform="rotate(-18 44 27)"/>`; break;
    case 'curly': s += [[33,38,6.5],[38,28,7.5],[46,22.5,8],[55,22,8],[63,27,7.5],[67.5,37,6.5],[42,30,5.5],[58,30,5.5],[50,27,5]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${hair}"/>`).join('') + `<path d="M40 22q3-2 6 0M54 20q3-2 6 0" stroke="#fff" stroke-opacity=".22" stroke-width="1.4" fill="none"/>`; break;
    case 'afro': s += `<path d="M31 42C33 31 41 27 50 27S67 31 69 42C65 36 58 33.5 50 33.5S35 36 31 42Z" fill="${hair}"/>`; break;
    case 'pixie': s += H('M31 45C29 27 40 18 52 18C64 18 71 27 69 42C66 35 62 31 57 30C55 34 49 37 41 37C37 38 33 41 31 45Z', 'M46 22Q56 19 64 25'); break;
    case 'slick': s += H('M31.5 43C30 27 40 19 50 19S70 27 68.5 43C66 33 59 27.5 50 27.5S34 33 31.5 43Z', 'M38 30Q50 22 62 30M41 26Q50 20 59 26'); break;
    case 'headscarf': s += `<path d="M30.5 52C29 26 40 18 50 18S71 26 69.5 52C68 41 62 30.5 50 30.5S32 41 30.5 52Z" fill="${a.scarf || '#5a4fcf'}"/><path d="M31 48C33 37 40 31.5 50 31.5" stroke="#fff" stroke-opacity=".28" stroke-width="2" fill="none"/>`; break;
  }
  if (['long', 'bob', 'locs'].includes(style)) s += `<path d="M31.5 38C29 48 29 60 30.5 70L35 68C33.5 59 33.5 48 35 39ZM68.5 38C71 48 71 60 69.5 70L65 68C66.5 59 66.5 48 65 39Z" fill="${hair}"/>`;
  if (a.flower) s += `<g transform="translate(64 27)">${[0, 72, 144, 216, 288].map(d => `<circle cx="${(4.4 * Math.cos(d * Math.PI / 180)).toFixed(1)}" cy="${(4.4 * Math.sin(d * Math.PI / 180)).toFixed(1)}" r="3.1" fill="${a.flower}"/>`).join('')}<circle r="2.2" fill="#ffd54a"/></g>`;
  if (a.headband) s += `<path d="M31.5 37Q50 25 68.5 37" fill="none" stroke="${a.headband}" stroke-width="4" stroke-linecap="round"/>`;

  // ----- eyes and brows (mood changes the look)
  const look = mood === 'think' ? [-1.1, -1] : mood === 'sad' ? [0, 0.9] : [0, 0];
  const eye = (cx, flip) => {
    const x = v => (cx + v * flip).toFixed(1);
    const shape = `M${x(-4.6)} 46.4Q${cx} 42.4 ${x(4.6)} 46Q${cx} 48.9 ${x(-4.6)} 46.4Z`;
    let e = `<path d="${shape}" fill="#fbfaf7"/>`;
    e += `<circle cx="${(cx + look[0]).toFixed(1)}" cy="${(45.9 + look[1]).toFixed(1)}" r="2.35" fill="${iris}"/><circle cx="${(cx + look[0]).toFixed(1)}" cy="${(45.9 + look[1]).toFixed(1)}" r="1.15" fill="#111"/><circle cx="${(cx + look[0] + 0.8).toFixed(1)}" cy="${(45.1 + look[1]).toFixed(1)}" r=".65" fill="#fff"/>`;
    e += `<path d="M${x(-4.9)} 46.3Q${cx} 41.9 ${x(4.9)} 45.8" stroke="#1d1414" stroke-width="1.25" fill="none" stroke-linecap="round"/>`;
    if (a.lashes) e += `<path d="M${x(-4.9)} 46.3Q${x(-4.4)} 44.2 ${x(-3.6)} 44.3" stroke="#1d1414" stroke-width="1.5" fill="none" stroke-linecap="round"/><path d="M${x(-4.9)} 46.3l${(-1.6 * flip).toFixed(1)} -1.4" stroke="#1d1414" stroke-width="1" stroke-linecap="round"/>`;
    e += `<path d="M${x(-3.6)} 48.4Q${cx} 49.6 ${x(3.6)} 48.2" stroke="${deep}" stroke-opacity=".35" stroke-width=".7" fill="none"/>`;
    // eyelid that closes for a blink
    e += `<ellipse cx="${cx}" cy="45.4" rx="5.4" ry="0" fill="${skin}"><animate attributeName="ry" values="0;0;3.8;0" keyTimes="0;.93;.965;1" dur="${blinkDur}s" begin="${blinkAt}s" repeatCount="indefinite"/></ellipse>`;
    return e;
  };
  if (a.wink && mood !== 'sad' && mood !== 'think') s += eye(41.5, 1) + `<path d="M53.5 46.6Q58.5 49 63.5 46.4" stroke="#1d1414" stroke-width="1.5" fill="none" stroke-linecap="round"/>`;
  else s += eye(41.5, 1) + eye(58.5, -1);
  const browY = mood === 'happy' ? -1 : 0;
  const brows = mood === 'sad' ? ['M36.5 39.6Q41 39.6 46 37.6', 'M54 37.6Q59 39.6 63.5 39.6']
    : mood === 'think' ? ['M36.5 39.8Q41 37 46 39', 'M54 37.2Q59 35.2 63.5 37.8']
    : a.smirk ? ['M36.5 40.2Q41 37.6 46 39.2', 'M54 38.2Q59 36 63.5 38.6']
    : [`M36.5 ${40.3 + browY}Q41 ${37.8 + browY} 46 ${39.2 + browY}`, `M54 ${39.2 + browY}Q59 ${37.8 + browY} 63.5 ${40.3 + browY}`];
  s += brows.map(d => `<path d="${d}" stroke="${brow}" stroke-width="${a.thinBrow ? 1.5 : 2.3}" fill="none" stroke-linecap="round"/>`).join('');

  // ----- nose
  s += `<path d="M50.6 47.5L48.6 55Q50 56.5 52.2 55.4" stroke="${deep}" stroke-opacity=".55" stroke-width="1" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M47 55.5q1 1 2 .6M53 55.5q-1 1-2 .6" stroke="${deep}" stroke-opacity=".35" stroke-width=".8" fill="none"/>`;

  // ----- facial hair under the mouth layer
  if (a.stubble) s += `<path d="M33.5 52C35 63 42 70.5 50 70.5S65 63 66.5 52C64 59 59 62 50 62.5S36 59 33.5 52Z" fill="${hair}" opacity=".22"/>`;
  if (a.beard) s += `<path d="M32.5 49C33 63 40 72.5 50 72.5S67 63 67.5 49C66 57 62.5 61.5 58 61.8C55 58.6 45 58.6 42 61.8C37.5 61.5 34 57 32.5 49Z" fill="${a.beard}"/><path d="M45 66Q50 68 55 66" stroke="#fff" stroke-opacity=".15" stroke-width="1" fill="none"/>`;
  if (a.goatee) s += `<path d="M45 63.5Q50 72 55 63.5Q50 65.5 45 63.5Z" fill="${a.goatee}"/>`;

  // ----- mouth
  const m = mood || (a.grin ? 'grin' : a.smirk ? 'smirk' : 'smile');
  if (m === 'happy' || m === 'grin') s += `<path d="M44 59.4Q50 67 56 59.4Q50 60.8 44 59.4Z" fill="#5b1f22"/><path d="M45 59.8Q50 61.2 55 59.8L54.6 61.2Q50 62.3 45.4 61.2Z" fill="#fff"/><path d="M44 59.4Q50 67 56 59.4" stroke="${lip}" stroke-width="1" fill="none"/>`;
  else if (m === 'sad') s += `<path d="M45 62.4Q50 59.4 55 62.4" stroke="${lip}" stroke-width="2" fill="none" stroke-linecap="round"/>`;
  else if (m === 'think') s += `<path d="M46 61.2Q50 60.4 54 61.4" stroke="${lip}" stroke-width="1.9" fill="none" stroke-linecap="round"/>`;
  else if (m === 'smirk') s += `<path d="M45 61Q50 62.4 55.5 59.2" stroke="${lip}" stroke-width="2" fill="none" stroke-linecap="round"/>`;
  else s += `<path d="M44.2 59.2Q47.5 58.4 50 59.3Q52.5 58.4 55.8 59.2Q50 61.6 44.2 59.2Z" fill="${lip}"/><path d="M44.2 59.2Q50 64.4 55.8 59.2Q50 61.6 44.2 59.2Z" fill="${shade(lip, 0.14)}"/><path d="M44.2 59.2Q50 61.9 55.8 59.2M43.6 58.6l.8.7M56.4 58.6l-.8.7" stroke="${deep}" stroke-opacity=".7" stroke-width=".9" fill="none" stroke-linecap="round"/>`;
  if (a.mustache) s += `<path d="M42.5 59.4Q46 55.6 50 57.4Q54 55.6 57.5 59.4Q54 58.2 50 59Q46 58.2 42.5 59.4Z" fill="${a.mustache}"/>`;

  // ----- accessories
  if (a.glasses) s += `<g fill="none" stroke="${a.glasses}" stroke-width="1.6"><rect x="35.2" y="42" width="12.6" height="9" rx="3"/><rect x="52.2" y="42" width="12.6" height="9" rx="3"/><path d="M47.8 45.5Q50 44.2 52.2 45.5M35.2 45l-3.4-1.2M64.8 45l3.4-1.2"/></g><path d="M37 43.5h4" stroke="#fff" stroke-opacity=".5" stroke-width="1"/>`;
  if (a.shades) s += `<path d="M34 42.5H47.5L46.6 49Q41 52.5 35.2 49ZM52.5 42.5H66L64.8 49Q59 52.5 53.4 49Z" fill="${a.shades}"/><path d="M47.5 44.2Q50 43 52.5 44.2M34 43.2l-2.4-.8M66 43.2l2.4-.8" stroke="${a.shades}" stroke-width="1.5" fill="none"/><path d="M36.5 44.5l3 3M55 44.5l3 3" stroke="#fff" stroke-opacity=".35" stroke-width="1.2"/>`;
  if (a.earrings && !covered) s += `<circle cx="31.4" cy="55" r="1.7" fill="${a.earrings}"/><circle cx="68.6" cy="55" r="1.7" fill="${a.earrings}"/>`;
  if (a.headphones) s += `<path d="M29 48C29 20 71 20 71 48" fill="none" stroke="${a.headphones}" stroke-width="3.6"/><rect x="25" y="42" width="8" height="13" rx="3.4" fill="${a.headphones}"/><rect x="67" y="42" width="8" height="13" rx="3.4" fill="${a.headphones}"/><rect x="26.5" y="44" width="2" height="9" rx="1" fill="#fff" opacity=".25"/>`;
  if (a.cap) s += `<path d="M30.5 40C30 20 70 20 69.5 40Z" fill="${a.cap}"/><path d="M30.5 40H69.5" stroke="#000" stroke-opacity=".22" stroke-width="2"/><path d="M50 37C61 35 74 35.5 80 39C74 42 60 42 50 40Z" fill="${shade(a.cap, -0.15)}"/><circle cx="50" cy="21.5" r="1.6" fill="${shade(a.cap, -0.25)}"/>`;
  if (a.beanie) s += `<path d="M29.5 42C29 16 71 16 70.5 42Z" fill="${a.beanie}"/><rect x="28" y="35" width="44" height="8" rx="4" fill="${shade(a.beanie, -0.15)}"/><path d="M34 35V43M40 35V43M46 35V43M52 35V43M58 35V43M64 35V43" stroke="#000" stroke-opacity=".12" stroke-width="1.2"/><circle cx="50" cy="16.5" r="4.4" fill="${shade(a.beanie, 0.2)}"/>`;
  if (a.crown) s += `<path d="M35 24l5-12 5 8 5-11 5 11 5-8 5 12z" fill="#ffc531" stroke="#c98a00" stroke-width="1.3" stroke-linejoin="round"/><circle cx="50" cy="18.5" r="1.8" fill="#e5484d"/><circle cx="41" cy="20.5" r="1.2" fill="#3b82c4"/><circle cx="59" cy="20.5" r="1.2" fill="#3b82c4"/>`;
  if (a.wizard) s += `<path d="M27 37L53 1l22 36z" fill="${a.wizard}"/><path d="M22 37h58q0 6-6 6H28q-6 0-6-6z" fill="${shade(a.wizard, -0.2)}"/><path d="M47 18l1.4 2.8 3.1.4-2.3 2.1.6 3.1-2.8-1.5-2.8 1.5.6-3.1-2.3-2.1 3.1-.4z" fill="#ffe27a"/><circle cx="60" cy="29" r="1.6" fill="#ffe27a"/>`;
  return s + '</svg>';
}
function robot(a){
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="100" height="100" fill="${a.bg}"/>` +
    `<circle cx="78" cy="18" r="30" fill="#fff" opacity=".16"/><path d="M12 100c2-17 18-25 38-25s36 8 38 25z" fill="${a.shirt}"/><path d="M40 82h20v4H40z" fill="#fff" opacity=".25"/>` +
    `<rect x="44" y="63" width="12" height="12" fill="#8a94a8"/><path d="M50 8v10" stroke="#c9d1df" stroke-width="3"/><circle cx="50" cy="7" r="4" fill="${a.glow}"><animate attributeName="opacity" values="1;.35;1" dur="2.4s" repeatCount="indefinite"/></circle>` +
    `<rect x="25" y="18" width="50" height="47" rx="13" fill="#dfe5ef"/><rect x="25" y="18" width="50" height="47" rx="13" fill="none" stroke="#9aa6ba" stroke-width="2"/><path d="M30 24h22" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".7"/>` +
    `<rect x="31" y="30" width="38" height="18" rx="9" fill="#1b2035"/><g fill="${a.glow}"><ellipse cx="41" cy="39" rx="4.2" ry="4.2"><animate attributeName="ry" values="4.2;4.2;.6;4.2" keyTimes="0;.92;.96;1" dur="4.4s" repeatCount="indefinite"/></ellipse><ellipse cx="59" cy="39" rx="4.2" ry="4.2"><animate attributeName="ry" values="4.2;4.2;.6;4.2" keyTimes="0;.92;.96;1" dur="4.4s" repeatCount="indefinite"/></ellipse></g>` +
    `<path d="M40 56h20" stroke="#5c6680" stroke-width="3" stroke-linecap="round"/><rect x="19" y="34" width="6" height="14" rx="3" fill="#9aa6ba"/><rect x="75" y="34" width="6" height="14" rx="3" fill="#9aa6ba"/></svg>`;
}

/* ---------- Bots ---------- */
// Up to 1250 the built-in search plays (local), tuned by test matches against Stockfish 17.1 at its calibrated 1320
// level and a ladder of local settings below it. From 1350 up, Stockfish 17.1 plays at the bot's rating (UCI_Elo);
// the sf settings are only the fallback for browsers that can't run Stockfish 17.1.
const TIERS = ['Beginner', 'Club', 'Advanced', 'Expert', 'Master', 'Styles'];
const BOTS = [
  {name:'Pip', elo:250, tier:0, blurb:'Café barista who learned the moves last week.', style:'Moves anything that wiggles.',
   greet:'Hi! I only learned this on Tuesday. Which one’s the horse again?', win:'Wait, I won? I’m telling the whole café.', lose:'Ha, fair. Show me that trick afterwards?',
   local:{depth:1, qd:0, noise:900}, look:{bg:'#ffd6e7', skin:'#f7d2b4', hair:'#e8a93a', style:'bun', shirt:'#ff7eb3', outfit:'tee', eye:'#3d7bd9', grin:true, freckles:true, earrings:'#ffd166', lashes:true}},
  {name:'Sprout', elo:400, tier:0, blurb:'Landscape gardener. Brave, but a little random.', style:'Brave but random.',
   greet:'New to this. Go easy on me… or don’t.', win:'Beginner’s luck counts!', lose:'Good game. I’m learning heaps.',
   local:{depth:1, qd:0, noise:200}, look:{bg:'#9ad1f5', skin:'#f6cfae', hair:'#4a3020', style:'spiky', shirt:'#ff8a3d', outfit:'jacket', inner:'#f4f4f4', stubble:true, eye:'#4a7a3a', grin:true}},
  {name:'Maple', elo:550, tier:0, blurb:'Head chef. Loves the queen, maybe too much.', style:'Early queen adventures.',
   greet:'My queen is the special of the day.', win:'The queen delivers again!', lose:'Oh no, my poor queen.',
   local:{depth:1, qd:1, noise:120, blunder:.55}, look:{bg:'#ffcf9e', skin:'#e8b48c', hair:'#9b3b1f', style:'ponytail', shirt:'#e84c3d', outfit:'tee', headband:'#ffd23f', eye:'#6b4423', lashes:true}},
  {name:'Acorn', elo:700, tier:0, blurb:'Taxi driver. Grabs every loose piece, misses plenty.', style:'Greedy.',
   greet:'Free pieces? Don’t mind if I do.', win:'Yes! Free pieces for me.', lose:'You got me. Rematch?',
   local:{depth:1, qd:1, noise:120, blunder:.15}, look:{bg:'#ffd27a', skin:'#c98a5a', hair:'#2a1a12', style:'short', shirt:'#3b82c4', outfit:'jacket', inner:'#f4f4f4', cap:'#d64545', mustache:'#2a1a12', grin:true}},
  {name:'Juniper', elo:850, tier:1, blurb:'DJ and bullet addict. Plays fast, hopes for the best.', style:'Speedy, a bit careless.',
   greet:'Ready? I don’t do long thinks.', win:'Speed wins!', lose:'Okay, maybe I should slow down.',
   local:{depth:1, qd:1, noise:60}, look:{bg:'#c4f1e0', skin:'#f1c7a5', hair:'#20262e', style:'side', shirt:'#14b8a6', outfit:'hoodie', headphones:'#334155', eye:'#2f6f8f'}},
  {name:'Fern', elo:1000, tier:1, blurb:'Night-shift nurse. Looks a move ahead and loves trades.', style:'Solid trader.',
   greet:'I think one move ahead. Can you think two?', win:'One move ahead was enough today!', lose:'You out-thought me. Nicely done.',
   local:{depth:2, qd:2, noise:140}, look:{bg:'#b9e3a8', skin:'#f3c9a6', hair:'#b5562b', style:'braids', shirt:'#2f9e77', outfit:'tee', accent:'#f2c94c', freckles:true, eye:'#3c8a5c', lashes:true}},
  {name:'Ivy', elo:1100, tier:1, blurb:'Law student. Knows her openings, gets lost later.', style:'Book-smart.',
   greet:'I studied the Italian Game all week.', win:'The opening prep worked!', lose:'I knew the opening… and then I didn’t.',
   local:{depth:2, qd:2, noise:90}, look:{bg:'#e3d5ff', skin:'#5e3b2a', hair:'#151012', style:'afro', shirt:'#6d4ad8', outfit:'turtleneck', earrings:'#ffd166', eye:'#3a2414', lashes:true}},
  {name:'Hazel', elo:1250, tier:1, blurb:'Accountant. Careful, rarely hangs a piece.', style:'Careful defender.',
   greet:'Careful moves win games. Good luck.', win:'Patience pays off. Good game.', lose:'Well played. I’ll be more careful next time.',
   local:{depth:2, qd:2, noise:30}, look:{bg:'#f6c1cf', skin:'#8d5a3b', hair:'#1f1410', style:'bob', shirt:'#7b4fc4', outfit:'blazer', collar:'#f5f3ee', glasses:'#2b2b2b', eye:'#4a2c1d', lashes:true}},
  {name:'Rowan', elo:1350, tier:2, blurb:'Firefighter. Attacks the king at every chance.', style:'Aggressive attacker.',
   greet:'Your king looks a little lonely.', win:'Attack, attack, attack!', lose:'My attack ran out of steam.',
   sf:{skill:1, depth:4, ms:250}, look:{bg:'#ffb3a7', skin:'#f2c4a0', hair:'#2c1b12', style:'mohawk', shirt:'#1f2937', outfit:'jacket', inner:'#e5484d', goatee:'#2c1b12', scar:true, eye:'#5a7d9a', smirk:true}},
  {name:'Willow', elo:1500, tier:2, blurb:'Club captain who spots simple tactics.', style:'Tactical.',
   greet:'I play at my club every Tuesday. Show me what you’ve got.', win:'Club practice paid off!', lose:'Great game. You’d do well at my club.',
   sf:{skill:3, depth:5, ms:300}, look:{bg:'#c7d2fe', skin:'#f1d0b5', hair:'#e2c06b', style:'long', shirt:'#e66a8c', outfit:'tee', flower:'#ff8fb1', eye:'#4f86c6', lashes:true}},
  {name:'Aspen', elo:1650, tier:2, blurb:'Architect. A patient positional player.', style:'Squeezes slowly.',
   greet:'No rush. Chess is a long game.', win:'Small advantages add up.', lose:'You outplayed me positionally. Impressive.',
   sf:{skill:5, depth:7, ms:400}, look:{bg:'#d9f99d', skin:'#f0c9a8', hair:'#7c4a1e', style:'headscarf', scarf:'#0e7490', shirt:'#155e75', outfit:'blazer', collar:'#e8f4f6', eye:'#5b3a24', lashes:true}},
  {name:'Birch', elo:1800, tier:2, blurb:'Carpenter. Solid, and punishes loose play.', style:'Punisher.',
   greet:'Leave a piece loose and I’ll find it.', win:'Loose pieces, as promised.', lose:'Solid play. I couldn’t find a way in.',
   sf:{skill:7, depth:8, ms:500}, look:{bg:'#a7d8d0', skin:'#e6b08a', hair:'#6b4226', style:'short', shirt:'#55606e', outfit:'jacket', inner:'#d9d2c5', beard:'#6b4226', beanie:'#2f6f5e'}},
  {name:'Linden', elo:1950, tier:3, blurb:'Maths teacher and endgame specialist.', style:'Trades into endgames.',
   greet:'Let’s see who knows their endgames.', win:'Endgames decide games.', lose:'Your technique was excellent.',
   sf:{skill:9, depth:10, ms:600}, look:{bg:'#fde68a', skin:'#c68c63', hair:'#3a2617', style:'buzz', shirt:'#b45309', outfit:'turtleneck', glasses:'#111827', stubble:true}},
  {name:'Elm', elo:2100, tier:3, blurb:'Retired physics professor. Sees combinations.', style:'Combinational.',
   greet:'Tactics are just patterns. Let’s see yours.', win:'The pattern was there. Study it in review.', lose:'A fine combination. I tip my hat.',
   sf:{skill:11, depth:11, ms:800}, look:{bg:'#f3d9a4', skin:'#f0c6a2', hair:'#9a9a9a', style:'bald', shirt:'#8a5a2b', outfit:'blazer', collar:'#f5f0e6', glasses:'#5a3a1a', mustache:'#a3a3a3', brow:'#8a8a8a', old:true}},
  {name:'Sequoia', elo:2250, tier:3, blurb:'Chess streamer. Sharp, loves sacrifices.', style:'Sacrificial.',
   greet:'Material is temporary. Initiative is forever.', win:'The sacrifice was sound!', lose:'You defended perfectly.',
   sf:{skill:13, depth:12, ms:900}, look:{bg:'#c7f0ff', skin:'#f3d1b6', hair:'#1e293b', style:'side', shirt:'#0f172a', outfit:'jacket', inner:'#22b8b0', shades:'#111', smirk:true}},
  {name:'Cedar', elo:2400, tier:3, blurb:'Tournament professional. Master strength.', style:'Precise.',
   greet:'I don’t give away free moves. Shall we?', win:'Precision wins. Good game.', lose:'Impressive. That was master-level play.',
   sf:{skill:15, depth:14, ms:1000}, look:{bg:'#d6c4f0', skin:'#6e4630', hair:'#141010', style:'bun', shirt:'#c43d5a', outfit:'blazer', collar:'#fff7f0', earrings:'#f2c94c', eye:'#3a2414', lashes:true}},
  {name:'Cypress', elo:2550, tier:4, blurb:'International master and chess coach.', style:'Universal.',
   greet:'Every move matters at this level.', win:'You’ll get there. Review this one.', lose:'That was a real master performance.',
   sf:{skill:17, depth:16, ms:1200}, look:{bg:'#bbf7d0', skin:'#e9b896', hair:'#4b2e1a', style:'long', shirt:'#166534', outfit:'turtleneck', glasses:'#14532d', wink:true, lashes:true}},
  {name:'Redwood', elo:2700, tier:4, blurb:'Grandmaster. Relentless.', style:'Relentless.',
   greet:'Grandmaster chess today. Ready?', win:'A grandmaster rarely lets go. Good effort.', lose:'Remarkable. You beat a grandmaster-level bot!',
   sf:{skill:18, depth:18, ms:1500}, look:{bg:'#ffb59a', skin:'#f2c4a0', hair:'#b8401f', style:'curly', shirt:'#2e4a7d', outfit:'blazer', collar:'#f5f3ee', beard:'#b8401f', eye:'#4f7a52', grin:true}},
  {name:'Baobab', elo:2850, tier:4, blurb:'Super-grandmaster. Calm and deep.', style:'Deep calculator.',
   greet:'Take your time. I always do.', win:'Depth beats speed.', lose:'Extraordinary. Truly.',
   sf:{skill:19, depth:20, ms:2000}, look:{bg:'#fcd9a8', skin:'#4a2c1d', hair:'#d9d9d9', style:'buzz', shirt:'#7c2d12', outfit:'blazer', beard:'#d9d9d9', tie:'#f59e0b', collar:'#fff7ed', old:true}},
  {name:'Ancient Oak', elo:3200, tier:4, blurb:'Full-strength Stockfish 17. Good luck.', style:'Engine.',
   greet:'I have seen every position. Show me something new.', win:'As the old trees say: patience.', lose:'In a thousand years, few have done that.',
   sf:{skill:20, depth:0, ms:2500}, look:{bg:'#9fb59a', skin:'#efd2b8', hair:'#f2f2f2', style:'bald', shirt:'#4a3b7a', outfit:'hoodie', beard:'#f4f4f4', mustache:'#ffffff', brow:'#e8e8e8', eye:'#5b7fbf', old:true, wizard:'#3d4f8f'}}
  /* ---------- Styles: personalities with their own opening repertoire (tier 5) ---------- */
  ,{name:'Echo', elo:1000, tier:5, adaptive:true, blurb:'Always plays at your current rating.', style:'Your mirror.', greet:'I play exactly as strong as you. Let’s see who blinks first.',
    win:'Even match, but I edged it. Rematch?', lose:'You beat your own level. You’re getting stronger!',
    local:{depth:2, qd:3, noise:12}, look:{bg:'#c9f0ff', skin:'#d9c8f5', hair:'#6c5ce7', style:'slick', shirt:'#1c1a3a', outfit:'jacket', inner:'#6c5ce7', shades:'#1c1a3a', smirk:true}}
  ,{name:'Wattle', elo:1150, tier:5, blurb:'Surfer. Gambits everything; material is for later.', style:'Gambit lover.', greet:'A pawn? Take it. I dare you.',
    win:'Initiative beats pawns!', lose:'Okay, okay, maybe that pawn mattered.',
    local:{depth:2, qd:2, noise:75},
    book:['e2e4 e7e5 f2f4', 'e2e4 e7e5 d2d4 e5d4 c2c3', 'e2e4 c7c5 d2d4 c5d4 c2c3', 'e2e4 e7e6 d2d4 d7d5 b1c3', 'e2e4 c7c6 d2d4 d7d5 b1c3', 'd2d4 d7d5 c2c4 e7e5', 'd2d4 g8f6 c2c4 e7e5', 'e2e4 e7e5 g1f3 b8c6 f1c4 g8f6 f3g5 d7d5 e4d5 c6a5', 'e2e4 e7e5 g1f3 b8c6 f1c4 f8c5 b2b4', 'c2c4 e7e5', 'g1f3 d7d5 e2e4'],
    look:{bg:'#fff1a8', skin:'#f0c39e', hair:'#e2c06b', style:'curly', shirt:'#ffb627', outfit:'tee', grin:true, freckles:true, stubble:true, eye:'#3d7bd9'}}
  ,{name:'Banksia', elo:1400, tier:5, blurb:'Tattoo artist. Lives for sharp Sicilians and dragons.', style:'Dragon slayer.', greet:'Let’s make this complicated.',
    win:'The dragon breathes fire!', lose:'You tamed the dragon. Respect.',
    sf:{skill:2, depth:5, ms:250},
    book:['e2e4 c7c5 g1f3 d7d6 d2d4 c5d4 f3d4 g8f6 b1c3 g7g6', 'e2e4 c7c5 b1c3 b8c6 g2g3 g7g6', 'e2e4 c7c5 c2c3 g8f6 e4e5 f6d5', 'e2e4 e7e5 g1f3 b8c6 d2d4 e5d4 f3d4', 'e2e4 c7c5 g1f3 d7d6 d2d4 c5d4 f3d4 g8f6 b1c3 a7a6', 'd2d4 g8f6 c2c4 c7c5 d4d5 e7e6', 'd2d4 c7c5', 'c2c4 c7c5'],
    look:{bg:'#ffc9a9', skin:'#8d5a3b', hair:'#151012', style:'mohawk', shirt:'#ef476f', outfit:'jacket', inner:'#1c1a3a', earrings:'#ffd166', smirk:true}}
  ,{name:'Jarrah', elo:1600, tier:5, blurb:'Civil engineer. Rock-solid systems, hard to break.', style:'Fortress builder.', greet:'Same setup every game. Find the crack.',
    win:'Slow and steady.', lose:'You broke the fortress. Well played.',
    sf:{skill:4, depth:6, ms:350},
    book:['d2d4 d7d5 c1f4', 'd2d4 g8f6 c1f4', 'd2d4 g8f6 g1f3 g7g6 c1f4', 'e2e4 c7c6 d2d4 d7d5 e4e5 c8f5', 'e2e4 c7c6 d2d4 d7d5 b1c3 d5e4 c3e4 c8f5', 'd2d4 d7d5 c2c4 c7c6', 'c2c4 c7c6', 'g1f3 d7d5 g2g3 g8f6'],
    look:{bg:'#e7d3b5', skin:'#e0ac85', hair:'#3a2a1e', style:'short', shirt:'#1f2937', outfit:'hoodie', beard:'#3a2a1e', glasses:'#2b2b2b'}}
  ,{name:'Kauri', elo:1850, tier:5, blurb:'Retired diplomat. Classical Queen’s Gambit and Ruy Lopez.', style:'Classicist.', greet:'Centre, development, king safety. Let’s begin.',
    win:'The classics never go out of style.', lose:'A model game from you. Lovely.',
    sf:{skill:8, depth:9, ms:550},
    book:['d2d4 d7d5 c2c4 e7e6 b1c3 g8f6 c1g5', 'd2d4 g8f6 c2c4 e7e6 b1c3 f8b4', 'e2e4 e7e5 g1f3 b8c6 f1b5 a7a6 b5a4 g8f6 e1g1', 'e2e4 e7e5 g1f3 b8c6 f1b5 g8f6', 'e2e4 c7c5 g1f3 d7d6 d2d4', 'd2d4 d7d5 c2c4 e7e6', 'c2c4 e7e5 b1c3 g8f6'],
    look:{bg:'#cde7d0', skin:'#f7d7bd', hair:'#d9d9d9', style:'side', shirt:'#3b82c4', outfit:'blazer', collar:'#ffffff', tie:'#1f2937', glasses:'#5a3a1a', old:true}}
  ,{name:'Ghost Gum', elo:2050, tier:5, blurb:'Poet and hypermodernist: lets you take the centre, then attacks it.', style:'Hypermodern.', greet:'Take the centre. I’ll take it apart.',
    win:'The centre was a target all along.', lose:'Your centre held. Impressive.',
    sf:{skill:10, depth:11, ms:700},
    book:['g1f3 d7d5 g2g3', 'c2c4 e7e5 g2g3', 'd2d4 g8f6 c2c4 g7g6 b1c3 f8g7 e2e4 d7d6', 'd2d4 g8f6 c2c4 g7g6 b1c3 d7d5', 'e2e4 g8f6 e4e5 f6d5 d2d4 d7d6', 'e2e4 g7g6 d2d4 f8g7', 'e2e4 d7d6 d2d4 g8f6 b1c3 g7g6'],
    look:{bg:'#e4e9f2', skin:'#f0c39e', hair:'#f2f2f2', style:'long', shirt:'#55606e', outfit:'turtleneck', flower:'#ffffff', eye:'#6a8caf', lashes:true, old:true}}
  ,{name:'Bottlebrush', elo:2250, tier:5, blurb:'Rugby coach. All-out attacker; your king is the only target.', style:'King hunter.', greet:'I hope your king packed a lunch.',
    win:'Checkmate was always the plan.', lose:'You survived the storm. Bravo.',
    sf:{skill:13, depth:12, ms:900},
    book:['e2e4 e7e5 g1f3 b8c6 d2d4 e5d4 f3d4', 'e2e4 c7c5 g1f3 d7d6 d2d4 c5d4 f3d4 g8f6 b1c3 a7a6 c1g5', 'e2e4 e7e6 d2d4 d7d5 b1c3 g8f6 c1g5', 'd2d4 g8f6 c2c4 g7g6 b1c3 d7d5 c4d5 f6d5 e2e4', 'e2e4 c7c5 g1f3 d7d6 d2d4 c5d4 f3d4 g8f6 b1c3 a7a6', 'd2d4 g8f6 c2c4 g7g6 b1c3 d7d5', 'c2c4 e7e5 b1c3 b8c6 g2g3 f7f5'],
    look:{bg:'#ffb3b3', skin:'#c68c63', hair:'#b5562b', style:'spiky', shirt:'#d64545', outfit:'jersey', beard:'#b5562b', grin:true}}
];
const PEOPLE = {
  you:    {name:'You', look:{bg:'#cfd5ff', skin:'#f0c39e', hair:'#3a2a1e', style:'side', shirt:'#6c5ce7', outfit:'hoodie', eye:'#5b3a24', grin:true}},
  white:  {name:'White', look:{bg:'#e9edf2', skin:'#f3cfb0', hair:'#5a3c26', style:'curly', shirt:'#f4f4f4', outfit:'turtleneck'}},
  black:  {name:'Black', look:{bg:'#3a4048', skin:'#a8714c', hair:'#121212', style:'short', shirt:'#1e1e1e', outfit:'jacket', inner:'#55606e', stubble:true}},
  coach:  {name:'Coach Ada', look:{bg:'#ffe08a', skin:'#d79c72', hair:'#2b1d14', style:'bun', shirt:'#6c5ce7', outfit:'blazer', collar:'#fff', glasses:'#2b2b2b', earrings:'#ffd166', lashes:true, grin:true}},
  owl:    {name:'Professor Hoot', look:{bg:'#ffe7a3', robot:true, shirt:'#7c5cff', glow:'#7cf7c6'}}
};
// Pieces players can use to build their own avatar
const AVATAR_PARTS = {
  skin: ['#f7d7bd', '#f0c39e', '#e0ac85', '#c68c63', '#8d5a3b', '#5e3b2a', '#4a2c1d'],
  hair: ['#151012', '#3a2a1e', '#7c4a1e', '#b5562b', '#e2c06b', '#d9d9d9', '#6c5ce7', '#ef476f', '#22b8b0'],
  style: ['short', 'side', 'slick', 'buzz', 'spiky', 'mohawk', 'curly', 'afro', 'locs', 'long', 'bob', 'pixie', 'bun', 'ponytail', 'braids', 'pigtails', 'bald', 'headscarf'],
  eye: ['#5b3a24', '#3a2414', '#3d7bd9', '#4a7a3a', '#6a8caf', '#8a6a2a', '#7a7a7a'],
  outfit: OUTFITS,
  shirt: ['#6c5ce7', '#ffb627', '#14b8a6', '#ef476f', '#3b82c4', '#1f2937', '#22c55e', '#f97316', '#f4f4f4'],
  bg: ['#cfd5ff', '#ffe08a', '#b9f3e4', '#ffd6e7', '#c7f0ff', '#e3d5ff', '#fde68a', '#d9f99d', '#2b2950'],
  extra: ['none', 'glasses', 'shades', 'headphones', 'cap', 'beanie', 'crown', 'stubble', 'beard', 'mustache', 'earrings', 'freckles']
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

window.GW_DATA = Object.assign(window.GW_DATA || {}, {PUZZLES, PIECE_SVG, TIME_CONTROLS, TIERS, BOTS, PEOPLE, AVATAR_PARTS, CUPS, ACHIEVEMENTS, avatar});
})();
