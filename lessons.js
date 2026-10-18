/* © 2026 Elite Chess. All rights reserved. Proprietary: no copying, reuse or AI training without written permission. See terms.html. */
/* Elite Chess learning content: courses, lessons, the book library and opening guides.
   All explanations are original writing. Puzzle drills draw from the lichess puzzle bank (CC0).
   Step types:
     info     {text, fen?, arrows?, marks?}            read and continue
     quiz     {q, options, answer, explain}            multiple choice
     mate     {text, fen, n}                           any move that forces mate in n
     line     {text, fen, line}                        follow a verified line
     accept   {text, fen, moves, hint}                 any listed move
     check    {text, fen}                              any move that gives check
     collect  {text, fen, par}                         kids: capture every star (black pawns) — black never moves
     classic  {text, id}                               a hand-built classic puzzle
     drill    {text, theme, min, max, count}           puzzles from the bank
     playout  {text, fen, goal:'mate'|'promote', limit} play it out against the engine
     opening  {text, line, side, name}                 play an opening's moves from memory */
(() => {
const COURSES = [
/* ============================== KIDS ============================== */
{id:'kids', title:'Kids Academy', icon:'wP', color:'#ff7eb3', kids:true, level:'Ages 5+',
 blurb:'Learn every piece with games, stars and friendly challenges.', lessons:[
  {id:'k-board', title:'Meet the board', steps:[
    {t:'info', text:'Welcome to chess! The board has 64 squares, light and dark. White always moves first, then the players take turns.', fen:'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'},
    {t:'info', text:'Each side has 16 pieces: 8 pawns, 2 rooks, 2 knights, 2 bishops, a queen and a king. The queen starts on her own colour: the white queen on a light square.', fen:'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', marks:['d1','d8']},
    {t:'quiz', q:'Who moves first in chess?', options:['Black', 'White', 'Whoever is youngest'], answer:1, explain:'White always makes the first move.'},
    {t:'quiz', q:'How many squares are on a chessboard?', options:['36', '64', '100'], answer:1, explain:'8 rows times 8 columns makes 64 squares.'}
  ]},
  {id:'k-rook', title:'The rook', steps:[
    {t:'info', text:'The rook moves in straight lines: up, down, left or right, as far as it likes. It cannot jump over pieces.', fen:'8/8/8/8/3R4/8/8/8 w - - 0 1', arrows:[['d4','d8'],['d4','a4'],['d4','h4'],['d4','d1']]},
    {t:'collect', text:'Collect all the stars with the rook! Try to do it in 3 moves.', fen:'4p3/8/8/p3p3/8/8/8/R7 w - - 0 1', par:3}
  ]},
  {id:'k-bishop', title:'The bishop', steps:[
    {t:'info', text:'The bishop moves diagonally, as far as it likes. A bishop always stays on the same colour of square.', fen:'8/8/8/8/3B4/8/8/8 w - - 0 1', arrows:[['d4','h8'],['d4','a7'],['d4','a1'],['d4','g1']]},
    {t:'collect', text:'Collect the stars with the bishop. Can you do it in 3 moves?', fen:'3p4/8/8/6p1/8/4p3/8/2B5 w - - 0 1', par:3}
  ]},
  {id:'k-queen', title:'The queen', steps:[
    {t:'info', text:'The queen is the strongest piece. She moves like a rook and a bishop together: straight lines and diagonals.', fen:'8/8/8/8/3Q4/8/8/8 w - - 0 1', arrows:[['d4','d8'],['d4','h8'],['d4','h4'],['d4','g1'],['d4','d1'],['d4','a1'],['d4','a4'],['d4','a7']]},
    {t:'collect', text:'Use the queen to collect all four stars in 4 moves.', fen:'p6p/8/8/3p4/8/8/8/3Q3p w - - 0 1', par:4}
  ]},
  {id:'k-knight', title:'The knight', steps:[
    {t:'info', text:'The knight jumps in an L shape: two squares one way, then one square to the side. It is the only piece that can jump over others!', fen:'8/8/8/8/3N4/8/8/8 w - - 0 1', arrows:[['d4','e6'],['d4','c6'],['d4','f5'],['d4','b5'],['d4','f3'],['d4','b3'],['d4','e2'],['d4','c2']]},
    {t:'collect', text:'Hop around and collect the stars with the knight. Par is 4 jumps.', fen:'8/8/5p2/7p/4p3/2p5/8/1N6 w - - 0 1', par:4}
  ]},
  {id:'k-king', title:'The king', steps:[
    {t:'info', text:'The king moves one square in any direction. He is the most important piece: if the king is trapped, the game is over.', fen:'8/8/8/8/3K4/8/8/8 w - - 0 1', arrows:[['d4','d5'],['d4','e5'],['d4','e4'],['d4','e3'],['d4','d3'],['d4','c3'],['d4','c4'],['d4','c5']]},
    {t:'collect', text:'Walk the king forward and collect the stars.', fen:'8/8/8/8/4p3/4p3/4p3/4K3 w - - 0 1', par:3}
  ]},
  {id:'k-pawn', title:'The pawn', steps:[
    {t:'info', text:'Pawns move straight forward one square, or two squares on their very first move. But they capture diagonally, one square forward.', fen:'8/8/8/3p4/4P3/8/8/8 w - - 0 1', arrows:[['e4','e5'],['e4','d5']]},
    {t:'collect', text:'Capture the stars with your pawn. Remember: pawns capture diagonally!', fen:'8/8/8/5p2/4p3/3p4/4P3/8 w - - 0 1', par:3},
    {t:'info', text:'When a pawn reaches the last row it turns into a queen, rook, bishop or knight. Most players choose a queen!', fen:'8/4P3/8/8/8/2k5/8/4K3 w - - 0 1', arrows:[['e7','e8']]},
    {t:'accept', text:'Push the pawn to the end and make a queen.', fen:'8/4P3/8/8/8/2k5/8/4K3 w - - 0 1', moves:['e7e8q'], hint:'e7e8q'}
  ]},
  {id:'k-values', title:'What pieces are worth', steps:[
    {t:'info', text:'Pieces have points: pawn 1, knight 3, bishop 3, rook 5, queen 9. The king is priceless. Trading a 3 for a 5 is a good deal!'},
    {t:'quiz', q:'Which piece is worth the most points?', options:['Rook', 'Queen', 'Knight'], answer:1, explain:'The queen is worth about 9 pawns.'},
    {t:'quiz', q:'Is it a good trade to give a knight (3) for a rook (5)?', options:['Yes', 'No'], answer:0, explain:'You win 2 points of material. That is called winning the exchange.'},
    {t:'accept', text:'Which black piece should you capture? Grab the most valuable one!', fen:'4k3/8/2r3b1/4N3/8/8/8/4K3 w - - 0 1', moves:['e5c6'], hint:'e5c6'}
  ]},
  {id:'k-check', title:'Check and checkmate', steps:[
    {t:'info', text:'When a king is attacked, it is in check. The player must get out of check straight away: move the king, block, or capture the attacker.', fen:'4k3/8/8/8/8/8/8/R3K3 w - - 0 1', arrows:[['a1','a8']]},
    {t:'check', text:'Give check to the black king with your queen.', fen:'4k3/8/8/8/8/8/8/3QK3 w - - 0 1'},
    {t:'info', text:'Checkmate means the king is in check and cannot escape. That wins the game!', fen:'7k/6Q1/6K1/8/8/8/8/8 b - - 0 1'},
    {t:'classic', text:'Your turn: checkmate the black king in one move.', id:'p08'},
    {t:'classic', text:'Two rooks work as a team. Find checkmate!', id:'p04'}
  ]},
  {id:'k-special', title:'Special moves', steps:[
    {t:'info', text:'Castling: the king moves two squares towards a rook, and the rook jumps over to the other side. It keeps the king safe. You can only castle if neither piece has moved and nothing is in between.', fen:'r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1', arrows:[['e1','g1']]},
    {t:'accept', text:'Castle! Move your king two squares towards a rook.', fen:'r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1', moves:['e1g1','e1c1'], hint:'e1g1'},
    {t:'info', text:'En passant: if a pawn jumps two squares and lands right beside your pawn, you may capture it as if it had moved only one square. You must do it straight away.', fen:'4k3/8/8/3pP3/8/8/8/4K3 w - d6 0 1', arrows:[['e5','d6']]},
    {t:'accept', text:'Black just played d7 to d5. Capture it en passant!', fen:'4k3/8/8/3pP3/8/8/8/4K3 w - d6 0 1', moves:['e5d6'], hint:'e5d6'},
    {t:'quiz', q:'If it is your turn, you are not in check, but you have no legal move, what happens?', options:['You lose', 'It is a draw (stalemate)', 'You skip your turn'], answer:1, explain:'That is stalemate, and the game is a draw.'}
  ]}
]},

/* ============================== BASICS ============================== */
{id:'basics', title:'Chess Basics', icon:'wK', color:'#22c55e', level:'400–900',
 blurb:'How games are won, piece values, safe moves and your first checkmates.', lessons:[
  {id:'b-win', title:'How games end', steps:[
    {t:'info', text:'You win by checkmate, when your opponent resigns, or when their clock runs out. A game is drawn by stalemate, by agreement, by repeating the same position three times, by fifty moves without a capture or pawn move, or when neither side has enough pieces to checkmate.'},
    {t:'quiz', q:'Which of these is NOT a draw?', options:['Stalemate', 'King and queen against king', 'Threefold repetition'], answer:1, explain:'King and queen easily checkmate a lone king, so that is a win.'},
    {t:'quiz', q:'Your opponent has only a king and a bishop left, you have only a king. What happens?', options:['They can still win', 'It is a draw: not enough material', 'You win'], answer:1, explain:'A king and a single bishop cannot force checkmate.'}
  ]},
  {id:'b-safety', title:'Don’t hang pieces', steps:[
    {t:'info', text:'Most games below 1200 are decided by pieces left unprotected. Before every move, ask two questions: what does my opponent’s last move attack, and is the square I’m moving to safe?'},
    {t:'quiz', q:'What is a "hanging" piece?', options:['A piece that is pinned', 'A piece that can be captured for free', 'A piece on the edge of the board'], answer:1, explain:'A hanging piece is attacked and not defended, so it can be taken for free.'},
    {t:'drill', text:'Practise: win the piece your opponent left hanging.', theme:'hangingPiece', min:600, max:1200, count:5}
  ]},
  {id:'b-principles', title:'Opening principles', steps:[
    {t:'accept', text:'Rule 1: take the centre. Pawns on e4 and d4 control key squares and free your pieces. Play a central pawn two squares.', fen:'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', moves:['e2e4','d2d4'], hint:'e2e4'},
    {t:'accept', text:'Rule 2: develop knights early, towards the centre. Bring out a knight.', fen:'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2', moves:['g1f3','b1c3'], hint:'g1f3'},
    {t:'accept', text:'Rule 3: castle early to tuck your king away and connect your rooks. Castle kingside.', fen:'r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4', moves:['e1g1'], hint:'e1g1'},
    {t:'quiz', q:'Which is usually a bad idea in the first five moves?', options:['Developing a knight', 'Moving the queen out early and often', 'Castling'], answer:1, explain:'An early queen gets chased around by your opponent’s pieces, and you lose time.'}
  ]},
  {id:'b-mates', title:'Your first checkmates', steps:[
    {t:'classic', text:'Queen and king together: checkmate in one.', id:'p08'},
    {t:'classic', text:'The ladder: two rooks take turns to push the king to the edge. Mate in one.', id:'p04'},
    {t:'info', text:'To mate with king and queen: use the queen to box the enemy king towards the edge, a knight’s move away so you don’t stalemate it. Then bring your king close and deliver mate.', fen:'8/8/8/4k3/8/8/8/3QK3 w - - 0 1'},
    {t:'playout', text:'Checkmate the lone king with king and queen. The computer defends. You have 25 moves.', fen:'8/8/8/4k3/8/8/8/3QK3 w - - 0 1', goal:'mate', limit:25},
    {t:'playout', text:'Now with king and rook: push the king to the edge with the rook and use your king to take away squares. 40 moves.', fen:'8/8/8/4k3/8/8/8/R3K3 w - - 0 1', goal:'mate', limit:40}
  ]}
]},

/* ============================== CHECKMATE PATTERNS ============================== */
{id:'mates', title:'Checkmate Patterns', icon:'wQ', color:'#ef476f', level:'600–1800',
 blurb:'Back rank, smothered, Arabian, Anastasia and every classic mating net.', lessons:[
  {id:'m-backrank', title:'Back-rank mate', steps:[
    {t:'info', text:'A king behind its own unmoved pawns has no escape square. A rook or queen landing on the back rank delivers mate. Defend by making "luft": a little escape square such as h3 or g3.', fen:'6k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1', arrows:[['e1','e8']]},
    {t:'classic', text:'Deliver the back-rank mate.', id:'p01'},
    {t:'drill', text:'Back-rank mates from real games.', theme:'backRankMate', min:700, max:1600, count:5}
  ]},
  {id:'m-smothered', title:'Smothered mate', steps:[
    {t:'info', text:'A king surrounded by its own pieces can be mated by a single knight. The famous version sacrifices the queen to force a rook onto the last free square.', fen:'6rk/6pp/8/4N3/8/8/8/6K1 w - - 0 1', arrows:[['e5','f7']]},
    {t:'classic', text:'The knight checks a king that cannot move.', id:'p05'},
    {t:'classic', text:'The queen sacrifice: force the rook to block its own king, then mate with the knight.', id:'m01'},
    {t:'drill', text:'Smothered mates.', theme:'smotheredMate', min:800, max:2000, count:4}
  ]},
  {id:'m-arabian', title:'Arabian and Anastasia mates', steps:[
    {t:'info', text:'In the Arabian mate a knight guards the rook as it checks a cornered king. In Anastasia’s mate a knight takes away escape squares while a rook or queen mates on the edge file.', fen:'7k/7R/5N2/8/8/8/8/6K1 b - - 0 1'},
    {t:'classic', text:'Arabian mate.', id:'p06'},
    {t:'classic', text:'Anastasia’s mate: sacrifice, then mate on the h-file.', id:'m04'},
    {t:'drill', text:'Arabian mates.', theme:'arabianMate', min:800, max:2000, count:3},
    {t:'drill', text:'Anastasia’s mates.', theme:'anastasiaMate', min:900, max:2100, count:3}
  ]},
  {id:'m-boden', title:'Boden, dovetail and hook mates', steps:[
    {t:'info', text:'Boden’s mate uses two bishops on crossing diagonals, often after queenside castling. The dovetail mate traps a king with a queen next to it diagonally, with its own pieces blocking the retreat. The hook mate combines a rook, a knight and a pawn.'},
    {t:'drill', text:'Boden’s mates.', theme:'bodenMate', min:900, max:2200, count:3},
    {t:'drill', text:'Dovetail mates.', theme:'dovetailMate', min:900, max:2200, count:3},
    {t:'drill', text:'Hook mates.', theme:'hookMate', min:900, max:2200, count:3}
  ]},
  {id:'m-mate2', title:'Mate in 2 and 3', steps:[
    {t:'info', text:'Longer mates follow a pattern: force the king into a box with checks, captures and threats, then land the final blow. Look at checks first, every time.'},
    {t:'classic', text:'Morphy’s Opera mate in 2.', id:'m02'},
    {t:'classic', text:'Légal’s mate in 2.', id:'m03'},
    {t:'drill', text:'Mate in 2.', theme:'mateIn2', min:900, max:1800, count:5},
    {t:'drill', text:'Mate in 3.', theme:'mateIn3', min:1300, max:2300, count:4}
  ]}
]},

/* ============================== TACTICS ============================== */
{id:'tactics', title:'Tactics Trainer', icon:'wN', color:'#f59e0b', level:'800–2200',
 blurb:'Forks, pins, skewers, discovered attacks and twenty more weapons.', lessons:[
  {id:'t-fork', title:'Forks', steps:[
    {t:'info', text:'A fork is one piece attacking two targets at once. Your opponent can only save one. Knights fork best because nothing can block them, but every piece can fork, even a pawn.', fen:'r1q3k1/1p3ppp/8/3N4/8/8/P4PPP/2B1R1K1 w - - 0 1', arrows:[['d5','e7']]},
    {t:'classic', text:'Knight fork: check the king and hit the queen.', id:'t01'},
    {t:'classic', text:'Queen fork.', id:'t05'},
    {t:'classic', text:'Pawn fork with check.', id:'t07'},
    {t:'drill', text:'Forks from real games.', theme:'fork', min:800, max:1700, count:6}
  ]},
  {id:'t-pin', title:'Pins', steps:[
    {t:'info', text:'A pin attacks a piece that cannot move without exposing something more valuable behind it. An absolute pin is against the king: the pinned piece may not legally move. Attack a pinned piece again, often with a pawn.', fen:'r3k2r/pp3ppp/4b3/8/3P4/2N5/PP3PPP/R3R1K1 w - - 0 1', arrows:[['e1','e8']]},
    {t:'classic', text:'The bishop is pinned to its king. Attack it.', id:'t03'},
    {t:'drill', text:'Pins.', theme:'pin', min:900, max:1800, count:6}
  ]},
  {id:'t-skewer', title:'Skewers and x-rays', steps:[
    {t:'info', text:'A skewer is a pin in reverse: the valuable piece is in front and must move, exposing what is behind. An x-ray is an attack or defence through another piece.'},
    {t:'classic', text:'Skewer the king and the queen.', id:'t02'},
    {t:'drill', text:'Skewers.', theme:'skewer', min:900, max:1900, count:5},
    {t:'drill', text:'X-ray attacks.', theme:'xRayAttack', min:1100, max:2100, count:3}
  ]},
  {id:'t-discovered', title:'Discovered attacks and double check', steps:[
    {t:'info', text:'Move one piece out of the way and the piece behind it suddenly attacks. If the moving piece makes its own threat, you have two threats at once. If both pieces give check, it is double check: the king must move.', fen:'2bq4/rp3p1p/7k/6p1/3NP3/8/PP3PPP/3Q1RK1 w - - 0 1', arrows:[['d1','d8']]},
    {t:'classic', text:'Knight check, uncovering the queen.', id:'t04'},
    {t:'drill', text:'Discovered attacks.', theme:'discoveredAttack', min:1000, max:2000, count:5},
    {t:'drill', text:'Double checks.', theme:'doubleCheck', min:1000, max:2200, count:3}
  ]},
  {id:'t-deflect', title:'Deflection and attraction', steps:[
    {t:'info', text:'Deflection forces a defender away from its job. Attraction (a decoy) lures a piece, often the king, onto a bad square. Both usually start with a sacrifice.'},
    {t:'drill', text:'Deflections.', theme:'deflection', min:1100, max:2100, count:5},
    {t:'drill', text:'Attraction and decoys.', theme:'attraction', min:1100, max:2200, count:4}
  ]},
  {id:'t-defender', title:'Removing the defender and overloading', steps:[
    {t:'info', text:'If one piece guards something important, capture or chase away that guard. A piece with two jobs is overloaded: make it choose.'},
    {t:'drill', text:'Capture the defender.', theme:'capturingDefender', min:1100, max:2100, count:5}
  ]},
  {id:'t-inter', title:'Interference and clearance', steps:[
    {t:'info', text:'Interference drops a piece between an enemy piece and what it protects. Clearance moves your own piece out of the way, often with tempo, to open a line or square for another.'},
    {t:'drill', text:'Interference.', theme:'interference', min:1300, max:2300, count:4},
    {t:'drill', text:'Clearance.', theme:'clearance', min:1300, max:2300, count:4}
  ]},
  {id:'t-zwischenzug', title:'Intermezzo (zwischenzug)', steps:[
    {t:'info', text:'Before making the expected recapture, look for an in-between move: a check, a capture or a bigger threat that improves your position first.'},
    {t:'drill', text:'In-between moves.', theme:'intermezzo', min:1300, max:2300, count:5}
  ]},
  {id:'t-trapped', title:'Trapped pieces', steps:[
    {t:'info', text:'A piece with no safe squares can be won by simply attacking it. Bishops grabbing a-pawns and knights on the rim are common victims.'},
    {t:'drill', text:'Trap a piece.', theme:'trappedPiece', min:1000, max:2100, count:5}
  ]},
  {id:'t-sacrifice', title:'Sacrifices and quiet moves', steps:[
    {t:'info', text:'A sacrifice gives up material for something bigger: mate, a winning attack or more material back. The hardest moves to see are quiet ones, which don’t check or capture but create an unstoppable threat.'},
    {t:'drill', text:'Sacrifices.', theme:'sacrifice', min:1200, max:2300, count:5},
    {t:'drill', text:'Quiet moves.', theme:'quietMove', min:1400, max:2400, count:4}
  ]},
  {id:'t-promotion', title:'Promotion tactics', steps:[
    {t:'info', text:'An advanced passed pawn is a tactical weapon. Deflect the blocker, sacrifice to break through, and sometimes promote to a knight (underpromotion) for a check.'},
    {t:'classic', text:'Three pawns against three: break through.', id:'t08'},
    {t:'drill', text:'Promotion.', theme:'promotion', min:1000, max:2100, count:4},
    {t:'drill', text:'Underpromotion.', theme:'underPromotion', min:1200, max:2400, count:2}
  ]},
  {id:'t-defence', title:'Defensive tactics and zugzwang', steps:[
    {t:'info', text:'Tactics work in defence too: find the only move that saves the game. Zugzwang is the opposite weapon: any move your opponent makes worsens their position.'},
    {t:'drill', text:'Find the saving move.', theme:'defensiveMove', min:1200, max:2300, count:4},
    {t:'drill', text:'Zugzwang.', theme:'zugzwang', min:1300, max:2400, count:3}
  ]}
]},

/* ============================== STRATEGY ============================== */
{id:'strategy', title:'Strategy & Planning', icon:'wB', color:'#3b82f6', level:'1200–2200',
 blurb:'Pawn structure, outposts, open files, bishops, weak squares and planning.', lessons:[
  {id:'s-activity', title:'Piece activity', steps:[
    {t:'info', text:'An active piece controls many squares and supports your plans; a passive one defends from a bad square. When you have no tactic, ask: which is my worst-placed piece, and where would it be happiest?'},
    {t:'quiz', q:'You have no immediate tactic. What is a strong general plan?', options:['Push a random pawn', 'Improve your worst-placed piece', 'Move your king to the centre'], answer:1, explain:'Improving your worst piece is a classic grandmaster technique when there is nothing forcing.'}
  ]},
  {id:'s-pawns', title:'Pawn structure', steps:[
    {t:'info', text:'Pawns can’t move backwards, so every pawn move changes the position for good. Weak pawns are isolated (no friendly pawns beside them), doubled, or backward. Fewer pawn islands is usually better.', fen:'4k3/pp3p1p/8/8/8/8/PPP2PPP/4K3 w - - 0 1'},
    {t:'info', text:'The isolated queen’s pawn (IQP) gives open lines and active pieces in the middlegame, but becomes a weakness in the endgame. The side with the IQP should attack; the other side should trade pieces and blockade the pawn.', fen:'r1bq1rk1/pp2bppp/2n1pn2/8/3P4/2NB1N2/PP3PPP/R1BQ1RK1 w - - 0 1', marks:['d4']},
    {t:'quiz', q:'You are playing against an isolated queen’s pawn. What do you want?', options:['Keep all the pieces on', 'Trade pieces and blockade the pawn', 'Push your own d-pawn'], answer:1, explain:'In simpler positions the isolated pawn is just a weakness. Blockade it, ideally with a knight, and trade pieces.'},
    {t:'info', text:'A passed pawn has no enemy pawns in front of it or on the files beside it. Passed pawns must be pushed, and must be blockaded when they are your opponent’s.', fen:'8/5k2/8/3P4/8/8/5K2/8 w - - 0 1', arrows:[['d5','d8']]}
  ]},
  {id:'s-outposts', title:'Outposts and weak squares', steps:[
    {t:'info', text:'An outpost is a square in enemy territory, protected by your pawn, that no enemy pawn can ever attack. A knight on an outpost can be worth more than a rook.', fen:'r1bq1rk1/pp2bppp/3p4/3Np3/4P3/8/PPP2PPP/R2QKB1R w KQ - 0 1', marks:['d5']},
    {t:'quiz', q:'Which piece usually benefits most from an outpost?', options:['A knight', 'A rook', 'The king'], answer:0, explain:'Knights are short-range pieces that need a stable forward base.'}
  ]},
  {id:'s-files', title:'Open files and the seventh rank', steps:[
    {t:'info', text:'Rooks belong on open files (no pawns) or half-open files. Double your rooks to control a file, then invade the seventh rank, where the enemy pawns and king live.', fen:'6k1/1R3ppp/8/8/8/8/5PPP/6K1 w - - 0 1', arrows:[['b7','f7']]},
    {t:'quiz', q:'Where are rooks usually strongest in the middlegame?', options:['Behind their own pawns', 'On open files and the seventh rank', 'In the corners'], answer:1, explain:'Open files let rooks penetrate; the seventh rank attacks pawns and confines the king.'}
  ]},
  {id:'s-bishops', title:'Bishops: good, bad and the pair', steps:[
    {t:'info', text:'A bishop is "bad" when its own pawns sit on its colour and block it. Two bishops working together (the bishop pair) are a lasting advantage in open positions.'},
    {t:'quiz', q:'Your pawns are on dark squares. Which of your bishops is likely to be bad?', options:['The light-squared bishop', 'The dark-squared bishop'], answer:1, explain:'The dark-squared bishop is blocked by pawns on dark squares.'},
    {t:'quiz', q:'In an open position with pawns on both wings, which is usually better?', options:['Knight', 'Bishop'], answer:1, explain:'Long-range bishops shine when the board is open and play happens on both sides.'}
  ]},
  {id:'s-king', title:'King safety and attacks', steps:[
    {t:'info', text:'Castled kings like their pawn shield intact. When kings castle on opposite sides, both players race to storm the other king with pawns. The attack needs more attackers than there are defenders.'},
    {t:'quiz', q:'Kings are castled on opposite sides. What is a typical plan?', options:['Push the pawns in front of your own king', 'Storm the enemy king with pawns', 'Trade queens immediately'], answer:1, explain:'With opposite castling you can throw pawns at the enemy king without weakening your own.'},
    {t:'drill', text:'Kingside attacks.', theme:'kingsideAttack', min:1300, max:2200, count:4}
  ]},
  {id:'s-prophylaxis', title:'Prophylaxis and imbalances', steps:[
    {t:'info', text:'Prophylaxis means asking "what does my opponent want to do?" and stopping it before it happens. Strong players also list the imbalances: material, pawn structure, minor pieces, space, development and king safety. Then they make a plan that uses theirs.'},
    {t:'quiz', q:'What is prophylactic thinking?', options:['Attacking as fast as possible', 'Preventing your opponent’s plan before it starts', 'Trading all the pieces'], answer:1, explain:'Prophylaxis takes away your opponent’s ideas, a hallmark of world champions.'}
  ]},
  {id:'s-exchanges', title:'When to trade', steps:[
    {t:'info', text:'Trade pieces when you are ahead in material, when it removes an attacker or a strong enemy piece, or when it leaves your opponent with a bad piece. Avoid trades when you are attacking or cramped.'},
    {t:'quiz', q:'You are a pawn up. Should you trade pieces?', options:['Yes, trade pieces (not pawns)', 'No, keep everything on'], answer:0, explain:'Every piece trade makes the extra pawn count for more.'}
  ]}
]},

/* ============================== ENDGAMES ============================== */
{id:'endgames', title:'Endgame Technique', icon:'wR', color:'#14b8a6', level:'900–2400',
 blurb:'Opposition, the square, Lucena, Philidor and how to convert.', lessons:[
  {id:'e-opposition', title:'The opposition', steps:[
    {t:'info', text:'Kings face each other with one square between them: whoever does not have to move "has the opposition" and makes the other king give way. In king and pawn endings, the opposition decides everything.', fen:'4k3/8/4K3/4P3/8/8/8/8 w - - 0 1'},
    {t:'quiz', q:'Kings on e6 and e8, one square apart, Black to move. Who has the opposition?', options:['White', 'Black'], answer:0, explain:'The side that does NOT have to move has the opposition.'},
    {t:'playout', text:'Your king is in front of the pawn on the sixth rank. Promote the pawn against the computer’s defence. 12 moves.', fen:'4k3/8/4K3/4P3/8/8/8/8 w - - 0 1', goal:'promote', limit:12}
  ]},
  {id:'e-square', title:'The rule of the square', steps:[
    {t:'info', text:'Draw a square from the pawn to its promotion row. If the defending king can step inside that square on its move, it catches the pawn. If not, the pawn runs home.', fen:'8/8/8/8/1P6/8/8/K5k1 w - - 0 1', marks:['b4','b8','f8','f4']},
    {t:'quiz', q:'White pawn on b4, Black king on g1, White to move. Does the king catch the pawn?', options:['Yes', 'No'], answer:1, explain:'After b5 the square is b5–e8. The king on g1 can’t step into it, so the pawn queens.'}
  ]},
  {id:'e-mates', title:'Basic mates', steps:[
    {t:'playout', text:'King and queen against king. 25 moves.', fen:'8/8/8/4k3/8/8/8/3QK3 w - - 0 1', goal:'mate', limit:25},
    {t:'playout', text:'King and rook against king. 40 moves.', fen:'8/8/8/4k3/8/8/8/R3K3 w - - 0 1', goal:'mate', limit:40}
  ]},
  {id:'e-lucena', title:'Lucena: building a bridge', steps:[
    {t:'info', text:'In the Lucena position your king is in front of your pawn on the seventh, and the enemy king is cut off. Bring your rook to the fourth rank to "build a bridge": it will block the checks when your king steps out.', fen:'2K5/2P1k3/8/8/8/8/1r6/3R4 w - - 0 1'},
    {t:'playout', text:'Win the Lucena position: promote the pawn. 20 moves.', fen:'2K5/2P1k3/8/8/8/8/1r6/3R4 w - - 0 1', goal:'promote', limit:20}
  ]},
  {id:'e-philidor', title:'Philidor: the drawing wall', steps:[
    {t:'info', text:'Defending rook against rook and pawn, keep your rook on the third rank from your side so the enemy king cannot advance. When the pawn steps onto that rank, swing the rook back and check from behind.', fen:'4k3/R7/1r6/4P3/3K4/8/8/8 b - - 0 1', arrows:[['b6','g6']]},
    {t:'quiz', q:'In the Philidor defence, when do you start checking from behind?', options:['Immediately', 'After the pawn advances to your third rank', 'Never'], answer:1, explain:'Once the pawn advances, the enemy king has no shelter from checks behind.'}
  ]},
  {id:'e-rooks', title:'Rook endgame rules', steps:[
    {t:'info', text:'Rooks belong behind passed pawns, both your own and your opponent’s. An active rook is worth a pawn. Cut the enemy king off along a rank or file.'},
    {t:'drill', text:'Rook endgames from real games.', theme:'rookEndgame', min:1200, max:2300, count:5},
    {t:'drill', text:'Pawn endgames.', theme:'pawnEndgame', min:1100, max:2300, count:4}
  ]}
]},

/* ============================== OPENINGS ============================== */
{id:'openings', title:'Opening Repertoire', icon:'wP', color:'#a855f7', level:'800–2400',
 blurb:'The ideas behind the main openings, with a trainer for each line.', lessons:[
  {id:'o-italian', title:'Italian Game', steps:[
    {t:'info', text:'1.e4 e5 2.Nf3 Nc6 3.Bc4 aims the bishop at f7, the weakest point near Black’s king. White often follows with c3 and d4 to build a big centre, or plays slowly with d3.'},
    {t:'opening', text:'Play the Giuoco Piano as White.', line:'e2e4 e7e5 g1f3 b8c6 f1c4 f8c5 c2c3 g8f6 d2d3', side:'w', name:'Italian Game'}
  ]},
  {id:'o-ruy', title:'Ruy Lopez', steps:[
    {t:'info', text:'3.Bb5 puts pressure on the knight that defends e5. It is one of the oldest and richest openings: White gets long-term pressure and Black needs precise play.'},
    {t:'opening', text:'Play the Morphy Defence main line as White.', line:'e2e4 e7e5 g1f3 b8c6 f1b5 a7a6 b5a4 g8f6 e1g1 f8e7 f1e1 b7b5 a4b3 d7d6 c2c3 e8g8', side:'w', name:'Ruy Lopez'}
  ]},
  {id:'o-sicilian', title:'Sicilian Defence', steps:[
    {t:'info', text:'1...c5 fights for d4 from the side and creates an unbalanced game. Black usually gets the half-open c-file and counterplay on the queenside; White often attacks on the kingside.'},
    {t:'opening', text:'Play the Najdorf as Black.', line:'e2e4 c7c5 g1f3 d7d6 d2d4 c5d4 f3d4 g8f6 b1c3 a7a6', side:'b', name:'Sicilian Najdorf'}
  ]},
  {id:'o-french', title:'French Defence', steps:[
    {t:'info', text:'1...e6 and 2...d5 build a solid wall. Black accepts a cramped light-squared bishop in return for counterattacks against White’s centre with ...c5 and ...f6.'},
    {t:'opening', text:'Play the Advance Variation as Black.', line:'e2e4 e7e6 d2d4 d7d5 e4e5 c7c5 c2c3 b8c6', side:'b', name:'French Advance'}
  ]},
  {id:'o-caro', title:'Caro-Kann Defence', steps:[
    {t:'info', text:'1...c6 prepares ...d5 while keeping the light-squared bishop free. It is solid, with a healthy pawn structure and fewer weaknesses than the French.'},
    {t:'opening', text:'Play the Classical Caro-Kann as Black.', line:'e2e4 c7c6 d2d4 d7d5 b1c3 d5e4 c3e4 c8f5', side:'b', name:'Caro-Kann Classical'}
  ]},
  {id:'o-qgd', title:'Queen’s Gambit', steps:[
    {t:'info', text:'1.d4 d5 2.c4 offers a pawn to deflect Black’s centre pawn. In the Declined version Black keeps a strong point on d5 and develops calmly.'},
    {t:'opening', text:'Play the Queen’s Gambit Declined as White.', line:'d2d4 d7d5 c2c4 e7e6 b1c3 g8f6 c1g5 f8e7 e2e3 e8g8', side:'w', name:'Queen’s Gambit Declined'}
  ]},
  {id:'o-london', title:'London System', steps:[
    {t:'info', text:'d4, Bf4, e3, Nf3, c3 and Bd3: a reliable set-up that White can play against almost anything. It is easy to learn and leads to solid middlegames.'},
    {t:'opening', text:'Play the London System as White.', line:'d2d4 d7d5 c1f4 g8f6 e2e3 c7c5', side:'w', name:'London System'}
  ]},
  {id:'o-kid', title:'King’s Indian Defence', steps:[
    {t:'info', text:'Black lets White build a big centre, then attacks it with ...e5 or ...c5. In many lines both sides attack on opposite wings: a fighting choice.'},
    {t:'opening', text:'Play the King’s Indian main line as Black.', line:'d2d4 g8f6 c2c4 g7g6 b1c3 f8g7 e2e4 d7d6 g1f3 e8g8 f1e2 e7e5', side:'b', name:'King’s Indian Defence'}
  ]},
  {id:'o-english', title:'English Opening', steps:[
    {t:'info', text:'1.c4 controls d5 from the side. It is flexible and often transposes to other openings; White plays positionally and fianchettoes the king’s bishop.'},
    {t:'opening', text:'Play the English as White.', line:'c2c4 e7e5 b1c3 g8f6 g1f3 b8c6', side:'w', name:'English Opening'}
  ]}
]},

/* ============================== MASTER CLASS ============================== */
{id:'master', title:'Road to 2500', icon:'wK', color:'#ffb627', level:'1600–2500',
 blurb:'How grandmasters think, calculate, attack, defend, convert and train.', lessons:[
  {id:'g-think', title:'How strong players think', steps:[
    {t:'info', text:'Every move, run the same checklist. 1) What changed with my opponent’s move? 2) Checks, captures and threats for both sides. 3) List two or three candidate moves. 4) Calculate them. 5) Blunder check before you move.'},
    {t:'quiz', q:'Which moves should you always look at first?', options:['Pawn moves', 'Checks, captures and threats', 'King moves'], answer:1, explain:'Forcing moves limit your opponent’s replies, so you can calculate them accurately.'},
    {t:'drill', text:'Calculate long, forcing lines.', theme:'long', min:1500, max:2200, count:5}
  ]},
  {id:'g-calc', title:'Calculation training', steps:[
    {t:'info', text:'Calculate a tree, not a single line: for each candidate, find your opponent’s best reply, not the one you hope for. Visualise the final position and evaluate it honestly. Practise with hard puzzles without moving pieces until you are sure.'},
    {t:'drill', text:'Very long combinations.', theme:'veryLong', min:1800, max:2600, count:5}
  ]},
  {id:'g-convert', title:'Converting an advantage', steps:[
    {t:'info', text:'When you are winning: remove your opponent’s counterplay first, trade pieces rather than pawns, improve slowly, and don’t hurry. A winning position is won one safe move at a time.'},
    {t:'quiz', q:'You are a piece up but your opponent has an attack. What comes first?', options:['Grab more material', 'Stop the counterplay', 'Push your passed pawn'], answer:1, explain:'Neutralise the opponent’s threats first; the extra piece will win later.'},
    {t:'drill', text:'Crushing positions: finish the job.', theme:'crushing', min:1600, max:2400, count:4}
  ]},
  {id:'g-weak', title:'The principle of two weaknesses', steps:[
    {t:'info', text:'One weakness can usually be defended. Masters attack a first weakness to tie the defender down, then open a second front on the other wing. The defender cannot cover both.'},
    {t:'quiz', q:'Your opponent defends their weak pawn perfectly. What next?', options:['Offer a draw', 'Create a second weakness elsewhere', 'Attack the same pawn with more pieces only'], answer:1, explain:'Stretching the defence across two weaknesses is the classic winning method.'}
  ]},
  {id:'g-attack', title:'Attacking the king', steps:[
    {t:'info', text:'Before attacking, count attackers against defenders near the king. Open lines with pawn breaks, bring every piece, and look for sacrifices on h7, g7, f7 or e6 that rip the shelter open.'},
    {t:'drill', text:'Exposed kings: go for it.', theme:'exposedKing', min:1500, max:2400, count:5}
  ]},
  {id:'g-defend', title:'Defence and counterattack', steps:[
    {t:'info', text:'Good defenders don’t panic. Trade the most dangerous attacker, give back material to break the attack, and counterattack in the centre when the opponent overextends.'},
    {t:'drill', text:'Find the only defence.', theme:'defensiveMove', min:1700, max:2500, count:5}
  ]},
  {id:'g-sacrifice', title:'Positional sacrifices', steps:[
    {t:'info', text:'Masters give up material for lasting advantages: an exchange for a dominant knight, a pawn for the initiative or open lines. Judge a sacrifice by what remains when the dust settles.'},
    {t:'drill', text:'Master-level sacrifices.', theme:'sacrifice', min:1900, max:2700, count:5}
  ]},
  {id:'g-endgame', title:'Endgame mastery', steps:[
    {t:'info', text:'At master level many games are decided in the endgame. Activate the king, create passed pawns, use zugzwang and remember: "the rook belongs behind the passed pawn".'},
    {t:'drill', text:'Hard endgames.', theme:'endgame', min:1900, max:2700, count:5}
  ]},
  {id:'g-plan', title:'A training plan to 2500', steps:[
    {t:'info', text:'Under 1200: tactics every day, play slower games, review every loss. 1200–1600: openings you understand, basic endgames, more tactics. 1600–2000: strategy, deeper calculation, annotated master games. 2000–2500: a full opening repertoire, endgame theory, competitive play and honest analysis of your own games.'},
    {t:'quiz', q:'What is the most important habit at every level?', options:['Memorising openings', 'Reviewing your own games and learning from mistakes', 'Playing only bullet'], answer:1, explain:'Analysing your own games shows exactly what to fix. Use Game Review after every game.'},
    {t:'quiz', q:'Roughly how should a 1300 player split training time?', options:['Mostly tactics, some endgames, a little openings', 'Mostly opening theory', 'Only playing games'], answer:0, explain:'Tactics decide most games at that level; endgames and opening ideas come next.'}
  ]},
  {id:'g-practical', title:'Practical play and psychology', steps:[
    {t:'info', text:'Manage your clock: spend time at critical moments, move faster in simple positions. After a mistake, reset and find the best move from here. Never resign too early and never relax when winning.'},
    {t:'quiz', q:'You just blundered a pawn. What should you do?', options:['Resign', 'Play fast to make up time', 'Take a breath and find the best practical move'], answer:2, explain:'Many games are saved by fighting on calmly after a mistake.'},
    {t:'drill', text:'Hard practical positions: find the strongest move.', theme:'long', min:1900, max:2700, count:4}
  ]}
]},

/* ============================== JUNIOR TACTICS ============================== */
{id:'junior', title:'Junior Tactics', icon:'wN', color:'#22b8b0', kids:true, level:'Ages 7+',
 blurb:'Your first checkmates and tricks, one small step at a time.', lessons:[
  {id:'j-mate1', title:'Checkmate in one', steps:[
    {t:'info', text:'Checkmate means the king is in check and has no way out: it cannot move, nothing can block, and the attacker cannot be captured. One move is all you need!', fen:'6k1/5ppp/8/8/8/8/8/R5K1 w - - 0 1', arrows:[['a1','a8']]},
    {t:'mate', text:'The black king is stuck behind its own pawns. Checkmate in one move!', fen:'6k1/5ppp/8/8/8/8/8/R5K1 w - - 0 1', n:1},
    {t:'mate', text:'Your king helps your queen. Find checkmate in one.', fen:'k7/8/1K6/8/8/8/8/7Q w - - 0 1', n:1},
    {t:'mate', text:'The king is surrounded by its own pieces. Which piece can jump in and give mate?', fen:'6rk/6pp/8/6N1/8/8/8/6K1 w - - 0 1', n:1}
  ]},
  {id:'j-ladder', title:'The rook ladder', steps:[
    {t:'info', text:'Two rooks can climb up the board like a ladder. One rook guards a row while the other gives check on the next row. Step by step, the king is pushed to the edge.', fen:'7k/8/8/8/8/8/R7/1R4K1 w - - 0 1', arrows:[['a2','a7'],['b1','b8']]},
    {t:'mate', text:'Use the ladder: checkmate in two moves.', fen:'7k/8/8/8/8/8/R7/1R4K1 w - - 0 1', n:2}
  ]},
  {id:'j-free', title:'Free pieces', steps:[
    {t:'info', text:'Before every move, look for pieces your opponent forgot to protect. A piece with no defender is free to take!'},
    {t:'quiz', q:'Your opponent’s knight is attacked by your bishop and nothing protects it. What should you usually do?', options:['Take it', 'Ignore it', 'Move your king'], answer:0, explain:'A free piece is free points. Take it, then check it really was free!'},
    {t:'drill', text:'Find the free piece and grab it.', theme:'hangingPiece', min:600, max:1000, count:5}
  ]},
  {id:'j-fork', title:'Fork tricks', steps:[
    {t:'info', text:'A fork attacks two things at once. Knights are the best forkers because they jump. Look for a square where your knight attacks the king and another piece!'},
    {t:'drill', text:'Find the fork.', theme:'fork', min:700, max:1100, count:5}
  ]},
  {id:'j-mate2', title:'Mate in two', steps:[
    {t:'info', text:'Sometimes you need two moves to checkmate. The first move often gives check or takes away the king’s last escape square.'},
    {t:'drill', text:'Checkmate in two moves.', theme:'mateIn2', min:600, max:1100, count:5}
  ]}
]},

/* ============================== ATTACKING THE KING ============================== */
{id:'attack', title:'Attacking the King', icon:'wQ', color:'#e5484d', level:'1200–2200',
 blurb:'When to attack, how to open lines, and the sacrifices that break a castle.', lessons:[
  {id:'a-when', title:'When to attack', steps:[
    {t:'info', text:'Attack the king when you have more pieces near it than your opponent has defending it. Count attackers and defenders on that side of the board. Three attackers against one defender usually means it is time to go.'},
    {t:'info', text:'An attack also needs open lines. Pawn moves, piece sacrifices and pawn breaks open files and diagonals toward the king. A closed position slows any attack down.'},
    {t:'quiz', q:'Which matters most before you launch a kingside attack?', options:['Having more pieces near the king than the defender', 'Having the bishop pair', 'Being ahead on the clock'], answer:0, explain:'Attacks succeed through local superiority: more attackers than defenders where it matters.'}
  ]},
  {id:'a-greek', title:'The Greek gift', steps:[
    {t:'info', text:'The Greek gift is the bishop sacrifice on h7 (or h2). It works when the defending knight has left f6, your bishop eyes h7, your knight can jump to g5 and your queen can reach the h-file. A pawn on e5 keeps the defender away.', fen:'r1bq1rk1/pppn1ppp/4p3/3pP3/1b1P4/2NB1N2/PPP2PPP/R1BQK2R w KQ - 0 1', arrows:[['d3','h7'],['f3','g5'],['d1','h5']]},
    {t:'accept', text:'All the conditions are there. Make the sacrifice that breaks open the black king.', fen:'r1bq1rk1/pppn1ppp/4p3/3pP3/1b1P4/2NB1N2/PPP2PPP/R1BQK2R w KQ - 0 1', moves:['d3h7'], hint:'d3h7'},
    {t:'quiz', q:'After Bxh7+ Kxh7 Ng5+, what usually follows?', options:['Qh5, threatening mate on h7', 'Castling', 'A quiet pawn move'], answer:0, explain:'The queen swings to h5. Together with the knight on g5 she threatens mate on h7, and Black’s king has no good square.'}
  ]},
  {id:'a-opposite', title:'Opposite-side castling', steps:[
    {t:'info', text:'When the kings castle on opposite sides, it becomes a race. Throw your pawns at the enemy king: your own king is not behind them, so pawn moves cost you nothing. Whoever opens lines first usually wins.', fen:'r4rk1/pp2ppbp/2np1np1/q7/3NP1P1/2N1BP2/PPPQ4/2KR1B1R w - - 0 1', arrows:[['h1','h7'],['g4','g5']]},
    {t:'quiz', q:'Kings castled on opposite sides. What is usually right?', options:['Defend carefully and wait', 'Attack fast with pawns toward the enemy king', 'Trade queens immediately'], answer:1, explain:'Speed decides these races. Every tempo spent defending is a tempo your opponent uses to attack.'}
  ]},
  {id:'a-kingside', title:'Kingside attacks', steps:[
    {t:'drill', text:'Kingside attacks from real games.', theme:'kingsideAttack', min:1200, max:2000, count:5},
    {t:'drill', text:'The king is exposed. Strike!', theme:'exposedKing', min:1300, max:2100, count:4}
  ]},
  {id:'a-sac', title:'Sacrifices that win', steps:[
    {t:'info', text:'A sacrifice gives up material to gain something bigger: open lines, time, or a king with no shelter. Before you sacrifice, calculate the forcing replies. If every defence loses, it is a winning sacrifice.'},
    {t:'drill', text:'Find the winning sacrifice.', theme:'sacrifice', min:1300, max:2200, count:6}
  ]},
  {id:'a-finish', title:'Finishing the attack', steps:[
    {t:'drill', text:'Mate in three.', theme:'mateIn3', min:1300, max:2100, count:5},
    {t:'drill', text:'Mate in four and longer.', theme:'mateIn4', min:1500, max:2400, count:3}
  ]}
]},

/* ============================== CALCULATION & DEFENCE ============================== */
{id:'calc', title:'Calculation & Defence', icon:'wB', color:'#0ea5e9', level:'1300–2500',
 blurb:'See further, spot quiet killers, and save the games you thought were lost.', lessons:[
  {id:'c-cct', title:'Checks, captures, threats', steps:[
    {t:'info', text:'Before every move, scan in this order: every check, every capture, every threat. Do it for your opponent too. Forcing moves come first because they limit your opponent’s answers, which makes them easier to calculate.'},
    {t:'quiz', q:'Which moves should you look at first when calculating?', options:['Developing moves', 'Checks, captures and threats', 'Pawn moves on the edge'], answer:1, explain:'Forcing moves narrow the tree of possibilities, so you can see further and more accurately.'},
    {t:'drill', text:'Warm-up: find the forcing win.', theme:'crushing', min:1300, max:1800, count:5}
  ]},
  {id:'c-quiet', title:'Quiet killer moves', steps:[
    {t:'info', text:'Not every winning move is a check or a capture. A quiet move can create an unstoppable threat, cut off a defender, or take away the last escape square. When the forcing moves do not work, look for the quiet one.'},
    {t:'drill', text:'Find the quiet move.', theme:'quietMove', min:1300, max:2300, count:6}
  ]},
  {id:'c-zwischenzug', title:'In-between moves', steps:[
    {t:'info', text:'An in-between move (a zwischenzug) is an unexpected move played before the "obvious" recapture. A check or a bigger threat first can change everything. Always ask: do I have to recapture right now?'},
    {t:'drill', text:'Spot the in-between move.', theme:'intermezzo', min:1300, max:2300, count:5}
  ]},
  {id:'c-defend', title:'Defending well', steps:[
    {t:'info', text:'Good defence starts with your opponent’s threat. Ask what they want to do, then look for the move that stops it while improving your position. Sometimes the best defence is a counter-attack.'},
    {t:'quiz', q:'Your opponent threatens mate. What do you check first?', options:['Whether you can stop the threat, or give checks that force a draw or win', 'Whether you can win a pawn', 'Whether you can castle'], answer:0, explain:'Deal with the biggest threat first. Forcing counter-play can also work, but only if it really is forcing.'},
    {t:'drill', text:'Find the only defence.', theme:'defensiveMove', min:1300, max:2400, count:5}
  ]},
  {id:'c-zugzwang', title:'Zugzwang', steps:[
    {t:'info', text:'Zugzwang is German for "compulsion to move". The side to move would love to pass, because every legal move makes things worse. It is common in endgames: take away the last good waiting move and the defence collapses.'},
    {t:'drill', text:'Put your opponent in zugzwang.', theme:'zugzwang', min:1300, max:2500, count:4}
  ]},
  {id:'c-trapped', title:'Trapping pieces', steps:[
    {t:'info', text:'A piece with no safe squares can be won even if it is not attacked yet. Bishops and knights that wander to the edge are the usual victims. Take away the squares first, then attack.'},
    {t:'drill', text:'Trap the piece.', theme:'trappedPiece', min:1200, max:2300, count:4}
  ]},
  {id:'c-long', title:'Long calculations', steps:[
    {t:'info', text:'For long lines, picture the board after each move rather than the moves in a list. Stop at quiet positions and evaluate them: material, king safety, and threats.'},
    {t:'drill', text:'Calculate to the end.', theme:'veryLong', min:1500, max:2500, count:4}
  ]}
]},

/* ============================== ENDGAME MASTERY ============================== */
{id:'endmaster', title:'Endgame Mastery', icon:'wR', color:'#8b5cf6', level:'1400–2500',
 blurb:'Breakthroughs, queen versus pawn, and the hardest basic mates.', lessons:[
  {id:'m-breakthrough', title:'The pawn breakthrough', steps:[
    {t:'info', text:'Three pawns against three on the fifth rank: a sacrifice breaks through. Push the middle pawn first. Whichever pawn takes, the next pawn steps forward and one of yours will promote.', fen:'7k/ppp5/8/PPP5/8/8/8/7K w - - 0 1', arrows:[['b5','b6']]},
    {t:'accept', text:'Find the breakthrough.', fen:'7k/ppp5/8/PPP5/8/8/8/7K w - - 0 1', moves:['b5b6'], hint:'b5b6'},
    {t:'quiz', q:'After b6 axb6, which move continues the breakthrough?', options:['c6', 'a6', 'Kg2'], answer:0, explain:'c6! If bxc6, then a6 and the a-pawn runs through. If Black leaves it, cxb7 and the pawn queens.'}
  ]},
  {id:'m-qvp', title:'Queen against a pawn on the seventh', steps:[
    {t:'info', text:'A queen beats a centre or knight pawn on the seventh. Use checks and pins to force the enemy king in front of its pawn, then bring your king one step closer. Repeat until you can win the pawn.', fen:'8/8/8/8/8/1Q6/3pk3/7K w - - 0 1'},
    {t:'quiz', q:'Why does the method work?', options:['Each time the king blocks its own pawn, you gain a free move for your king', 'The pawn cannot move on the seventh', 'Queens always win against pawns'], answer:0, explain:'When the defending king stands in front of its pawn, the pawn cannot promote, and you use that tempo to walk your king in.'},
    {t:'playout', text:'Stop the pawn and checkmate. The computer defends. 40 moves.', fen:'8/8/8/8/8/1Q6/3pk3/7K w - - 0 1', goal:'mate', limit:40}
  ]},
  {id:'m-bishops', title:'Mate with two bishops', steps:[
    {t:'info', text:'Two bishops side by side make a wall the king cannot cross. Use them together with your king to shrink the box, drive the king to a corner, then mate.', fen:'8/8/8/4k3/8/8/8/2B1KB2 w - - 0 1'},
    {t:'playout', text:'Checkmate with king and two bishops. 40 moves.', fen:'8/8/8/4k3/8/8/8/2B1KB2 w - - 0 1', goal:'mate', limit:40}
  ]},
  {id:'m-bn', title:'Bishop and knight mate', steps:[
    {t:'info', text:'The hardest basic mate. You can only mate in a corner the bishop controls. If the king runs to the wrong corner, use the knight and bishop together in a W-shaped route to push it along the edge.', fen:'8/8/8/4k3/8/8/8/1N2KB2 w - - 0 1'},
    {t:'quiz', q:'With a light-squared bishop, which corners can you mate in?', options:['h1 and a8', 'a1 and h8', 'Any corner'], answer:0, explain:'The bishop must control the corner square: a light-squared bishop covers h1 and a8.'},
    {t:'playout', text:'Checkmate with bishop and knight. The theoretical limit is 50 moves.', fen:'8/8/8/4k3/8/8/8/1N2KB2 w - - 0 1', goal:'mate', limit:50}
  ]},
  {id:'m-pawns', title:'Pawn endings that decide games', steps:[
    {t:'info', text:'In pawn endings, count. Count the moves for each pawn to promote, and the moves for each king to catch it. Small details such as the opposition and spare pawn moves decide the result.'},
    {t:'drill', text:'Pawn endgames.', theme:'pawnEndgame', min:1300, max:2400, count:5},
    {t:'drill', text:'Promote!', theme:'promotion', min:1300, max:2300, count:4}
  ]},
  {id:'m-minor', title:'Minor-piece and queen endings', steps:[
    {t:'drill', text:'Bishop endgames.', theme:'bishopEndgame', min:1100, max:2400, count:3},
    {t:'drill', text:'Knight endgames.', theme:'knightEndgame', min:1100, max:2500, count:3},
    {t:'drill', text:'Queen endgames.', theme:'queenEndgame', min:1200, max:2500, count:4}
  ]}
]}
];

/* ---------- Classic books (titles and authors for further reading; summaries are original) ---------- */
const BOOKS = [
  {title:'Logical Chess: Move by Move', author:'Irving Chernev', level:'Beginner', ideas:['Every single move of master games explained in plain words.', 'Shows how development, centre control and attacks fit together.'], lessons:['b-principles', 's-activity']},
  {title:'Bobby Fischer Teaches Chess', author:'Bobby Fischer, Stuart Margulies, Donn Mosenfelder', level:'Beginner', ideas:['Programmed questions that drill back-rank and basic mating patterns.', 'Builds pattern recognition one step at a time.'], lessons:['m-backrank', 'b-mates']},
  {title:'Chess Fundamentals', author:'José Raúl Capablanca', level:'Beginner–Intermediate', ideas:['Start with endgames to understand piece power.', 'Simplicity: trade into won positions and play clear, logical moves.'], lessons:['e-opposition', 'g-convert']},
  {title:'Chess Tactics for Champions', author:'Susan Polgar', level:'Beginner–Intermediate', ideas:['Tactics organised by theme so patterns stick.', 'Lots of practice positions for each motif.'], lessons:['t-fork', 't-pin', 't-skewer']},
  {title:'Chess: 5334 Problems, Combinations and Games', author:'László Polgár', level:'All levels', ideas:['A huge workbook of mates in one, two and three.', 'Volume of practice builds lightning-fast pattern recognition.'], lessons:['m-mate2']},
  {title:'The Woodpecker Method', author:'Axel Smith, Hans Tikkanen', level:'Intermediate–Advanced', ideas:['Solve the same set of puzzles in faster and faster cycles.', 'Repetition turns calculation into intuition.'], lessons:['g-calc']},
  {title:'My System', author:'Aron Nimzowitsch', level:'Intermediate–Advanced', ideas:['Open files, the seventh rank, blockade and outposts.', 'Prophylaxis: restrict your opponent’s plans.'], lessons:['s-files', 's-outposts', 's-prophylaxis']},
  {title:'How to Reassess Your Chess', author:'Jeremy Silman', level:'Intermediate', ideas:['Find the imbalances and plan around them.', 'Minor pieces, pawn structure, space and initiative.'], lessons:['s-prophylaxis', 's-bishops']},
  {title:'The Amateur’s Mind', author:'Jeremy Silman', level:'Intermediate', ideas:['Common thinking errors of club players.', 'Replace hope chess with plans based on the position.'], lessons:['g-think']},
  {title:'Pawn Power in Chess', author:'Hans Kmoch', level:'Intermediate–Advanced', ideas:['The vocabulary of pawn structures: chains, islands, levers.', 'Why pawn moves create permanent weaknesses.'], lessons:['s-pawns']},
  {title:'Think Like a Grandmaster', author:'Alexander Kotov', level:'Advanced', ideas:['Candidate moves and building a tree of analysis.', 'Calculate each branch once and evaluate honestly.'], lessons:['g-think', 'g-calc']},
  {title:'The Art of Attack in Chess', author:'Vladimir Vuković', level:'Advanced', ideas:['Classic attacking patterns against the castled king.', 'When a sacrifice on h7 or g7 works.'], lessons:['g-attack', 's-king']},
  {title:'Modern Chess Strategy', author:'Luděk Pachman', level:'Advanced', ideas:['A systematic tour of strategic elements.', 'Pieces, pawns and planning explained with clear examples.'], lessons:['s-pawns', 's-files']},
  {title:'Silman’s Complete Endgame Course', author:'Jeremy Silman', level:'All levels', ideas:['Endgames sorted by rating: learn only what you need now.', 'From basic mates to Lucena and Philidor.'], lessons:['e-mates', 'e-lucena', 'e-philidor']},
  {title:'Endgame Strategy', author:'Mikhail Shereshevsky', level:'Advanced', ideas:['Do not hurry, centralise the king, and the two weaknesses rule.', 'How masters convert small endgame advantages.'], lessons:['g-weak', 'g-endgame']},
  {title:'Dvoretsky’s Endgame Manual', author:'Mark Dvoretsky', level:'Master', ideas:['The essential theoretical positions every master must know.', 'Precise technique in rook and pawn endings.'], lessons:['e-rooks', 'g-endgame']},
  {title:'Zurich International Chess Tournament 1953', author:'David Bronstein', level:'Advanced', ideas:['A tournament book focused on ideas rather than variations.', 'Shows how world-class players plan and fight.'], lessons:['g-practical']},
  {title:'My 60 Memorable Games', author:'Bobby Fischer', level:'Advanced', ideas:['Deep, honest annotation of a world champion’s games.', 'Precision in the opening and relentless conversion.'], lessons:['g-convert']},
  {title:'The Life and Games of Mikhail Tal', author:'Mikhail Tal', level:'Advanced', ideas:['Initiative and sacrifices that create chaos.', 'Practical courage over the board.'], lessons:['g-sacrifice', 'g-attack']},
  {title:'Grandmaster Preparation (series)', author:'Jacob Aagaard', level:'Master', ideas:['Rigorous calculation and strategy training for 2200+ players.', 'Exercises that build master-level thinking.'], lessons:['g-calc', 'g-plan']},
  {title:'Winning Chess Strategies', author:'Yasser Seirawan', level:'Intermediate', ideas:['Friendly introduction to space, weak squares and pawn play.', 'Turn small advantages into wins.'], lessons:['s-activity', 's-outposts']},
  {title:'How to Beat Your Dad at Chess', author:'Murray Chandler', level:'Kids', ideas:['The 50 deadliest checkmate patterns, explained simply.', 'Perfect next step after learning the rules.'], lessons:['m-backrank', 'm-smothered']}
];

/* ---------- Opening guides shown in the explorer (descriptions are original) ---------- */
const OPENING_GUIDES = [
  {name:'Italian Game', line:'e2e4 e7e5 g1f3 b8c6 f1c4', idea:'Quick development and pressure on f7. Great for learning classical principles.'},
  {name:'Ruy Lopez', line:'e2e4 e7e5 g1f3 b8c6 f1b5', idea:'Long-term pressure on e5 and Black’s centre. A lifetime opening.'},
  {name:'Scotch Game', line:'e2e4 e7e5 g1f3 b8c6 d2d4', idea:'Opens the centre at once for active piece play.'},
  {name:'Sicilian Defence', line:'e2e4 c7c5', idea:'Unbalanced and ambitious. Black plays for a win.'},
  {name:'French Defence', line:'e2e4 e7e6', idea:'Solid pawn chain; counterattack the centre with ...c5.'},
  {name:'Caro-Kann Defence', line:'e2e4 c7c6', idea:'Rock-solid structure with a free light-squared bishop.'},
  {name:'Scandinavian Defence', line:'e2e4 d7d5', idea:'Challenges e4 immediately; simple plans for Black.'},
  {name:'Pirc Defence', line:'e2e4 d7d6 d2d4 g8f6 b1c3 g7g6', idea:'Hypermodern: let White build a centre, then strike it.'},
  {name:'Queen’s Gambit', line:'d2d4 d7d5 c2c4', idea:'Classical fight for the centre with pressure on d5.'},
  {name:'Slav Defence', line:'d2d4 d7d5 c2c4 c7c6', idea:'Supports d5 with the c-pawn and keeps the bishop free.'},
  {name:'London System', line:'d2d4 d7d5 c1f4', idea:'A reliable system: same set-up against nearly everything.'},
  {name:'King’s Indian Defence', line:'d2d4 g8f6 c2c4 g7g6 b1c3 f8g7 e2e4 d7d6', idea:'Dynamic counterattack against White’s big centre.'},
  {name:'Nimzo-Indian Defence', line:'d2d4 g8f6 c2c4 e7e6 b1c3 f8b4', idea:'Pins the knight and fights for e4; flexible and respected.'},
  {name:'Grünfeld Defence', line:'d2d4 g8f6 c2c4 g7g6 b1c3 d7d5', idea:'Gives White the centre, then attacks it with pieces.'},
  {name:'English Opening', line:'c2c4', idea:'Flexible flank opening that controls d5.'},
  {name:'Réti Opening', line:'g1f3 d7d5 c2c4', idea:'Hypermodern pressure on Black’s centre from the flank.'},
  {name:'Dutch Defence', line:'d2d4 f7f5', idea:'Fights for e4 and aims for a kingside attack.'},
  {name:'King’s Gambit', line:'e2e4 e7e5 f2f4', idea:'Romantic pawn sacrifice for rapid attack.'}
];

window.GW_LEARN = {COURSES, BOOKS, OPENING_GUIDES};
})();
