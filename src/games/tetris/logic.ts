// Tetris rules. Pure functions, no React or canvas, so they are easy to test.
export const COLS = 10, ROWS = 20;
export type PieceType = "I" | "O" | "T" | "S" | "Z" | "J" | "L";
export type Cell = PieceType | null;
export type Board = Cell[][];
export type Piece = { type: PieceType; rot: number; x: number; y: number };
export type TetrisState = {
  board: Board; piece: Piece; next: PieceType;
  score: number; lines: number; level: number;
  status: "ready" | "playing" | "over";
};

const SHAPES: Record<PieceType, number[][]> = {
  I: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
  O: [[1, 1], [1, 1]],
  T: [[0, 1, 0], [1, 1, 1], [0, 0, 0]],
  S: [[0, 1, 1], [1, 1, 0], [0, 0, 0]],
  Z: [[1, 1, 0], [0, 1, 1], [0, 0, 0]],
  J: [[1, 0, 0], [1, 1, 1], [0, 0, 0]],
  L: [[0, 0, 1], [1, 1, 1], [0, 0, 0]],
};
const TYPES: PieceType[] = ["I", "O", "T", "S", "Z", "J", "L"];
const LINE_POINTS = [0, 100, 300, 500, 800]; // for 0 to 4 lines at once, times the level

const rotateMatrix = (m: number[][]) => m[0].map((_, x) => m.map((row) => row[x]).reverse()); // clockwise

export function shapeOf(p: Piece): number[][] {
  let m = SHAPES[p.type];
  for (let i = 0; i < p.rot; i++) m = rotateMatrix(m);
  return m;
}
export function cellsOf(p: Piece): { x: number; y: number }[] {
  const out: { x: number; y: number }[] = [];
  shapeOf(p).forEach((row, dy) => row.forEach((v, dx) => { if (v) out.push({ x: p.x + dx, y: p.y + dy }); }));
  return out;
}
export const collides = (board: Board, p: Piece): boolean =>
  cellsOf(p).some((c) => c.x < 0 || c.x >= COLS || c.y >= ROWS || (c.y >= 0 && board[c.y][c.x] !== null));

const randomType = (rand: () => number): PieceType => TYPES[Math.floor(rand() * TYPES.length)];
const spawn = (type: PieceType): Piece => ({ type, rot: 0, x: type === "O" ? 4 : 3, y: type === "I" ? -1 : 0 });
export const dropInterval = (level: number): number => Math.max(90, 800 - (level - 1) * 70); // ms per row

export function newTetris(rand: () => number = Math.random): TetrisState {
  return {
    board: Array.from({ length: ROWS }, () => Array<Cell>(COLS).fill(null)),
    piece: spawn(randomType(rand)), next: randomType(rand),
    score: 0, lines: 0, level: 1, status: "ready",
  };
}

export function shift(s: TetrisState, dx: number): TetrisState {
  const moved = { ...s.piece, x: s.piece.x + dx };
  return s.status !== "playing" || collides(s.board, moved) ? s : { ...s, piece: moved };
}

// Rotate clockwise, trying a small sideways nudge ("wall kick") if it doesn't fit straight away.
export function rotateCw(s: TetrisState): TetrisState {
  if (s.status !== "playing") return s;
  const turned = { ...s.piece, rot: (s.piece.rot + 1) % 4 };
  for (const kick of [0, -1, 1, -2, 2]) {
    const t = { ...turned, x: turned.x + kick };
    if (!collides(s.board, t)) return { ...s, piece: t };
  }
  return s;
}

// Fix the piece in place, clear full lines, bring in the next piece.
function lockPiece(s: TetrisState, rand: () => number): TetrisState {
  const board = s.board.map((r) => [...r]);
  const stuckAbove = cellsOf(s.piece).some((c) => c.y < 0);
  for (const c of cellsOf(s.piece)) if (c.y >= 0) board[c.y][c.x] = s.piece.type;
  const kept = board.filter((row) => row.some((c) => c === null));
  const cleared = ROWS - kept.length;
  const filled = [...Array.from({ length: cleared }, () => Array<Cell>(COLS).fill(null)), ...kept];
  const lines = s.lines + cleared;
  const piece = spawn(s.next);
  return {
    ...s, board: filled, piece, next: randomType(rand), lines,
    level: 1 + Math.floor(lines / 10),
    score: s.score + LINE_POINTS[cleared] * s.level,
    status: stuckAbove || collides(filled, piece) ? "over" : "playing",
  };
}

// One step of gravity.
export function tick(s: TetrisState, rand: () => number = Math.random): TetrisState {
  if (s.status !== "playing") return s;
  const down = { ...s.piece, y: s.piece.y + 1 };
  return collides(s.board, down) ? lockPiece(s, rand) : { ...s, piece: down };
}

export function softDrop(s: TetrisState, rand: () => number = Math.random): TetrisState {
  const next = tick(s, rand);
  return next.status === "playing" && next.piece.y > s.piece.y && next.piece.type === s.piece.type && next.lines === s.lines
    ? { ...next, score: next.score + 1 } : next;
}

export function hardDrop(s: TetrisState, rand: () => number = Math.random): TetrisState {
  if (s.status !== "playing") return s;
  let piece = s.piece, rows = 0;
  while (!collides(s.board, { ...piece, y: piece.y + 1 })) { piece = { ...piece, y: piece.y + 1 }; rows++; }
  return lockPiece({ ...s, piece, score: s.score + rows * 2 }, rand);
}
