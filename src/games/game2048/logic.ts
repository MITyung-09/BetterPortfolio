// 2048 rules. Pure functions, no React, so they are easy to test.
export type Board = number[][]; // 4x4, 0 means empty
export type Dir = "up" | "down" | "left" | "right";
export const SIZE = 4;

export const emptyBoard = (): Board => Array.from({ length: SIZE }, () => Array<number>(SIZE).fill(0));

// Drop a 2 (90%) or a 4 (10%) onto a random empty square.
export function addTile(board: Board, rand: () => number = Math.random): Board {
  const empty: [number, number][] = [];
  board.forEach((row, y) => row.forEach((v, x) => { if (!v) empty.push([y, x]); }));
  if (!empty.length) return board;
  const [y, x] = empty[Math.floor(rand() * empty.length)];
  const next = board.map((r) => [...r]);
  next[y][x] = rand() < 0.9 ? 2 : 4;
  return next;
}

// Slide one row to the left. Each tile can merge only once per move.
export function slideRow(row: number[]): { row: number[]; gained: number } {
  const tiles = row.filter(Boolean);
  const out: number[] = [];
  let gained = 0;
  for (let i = 0; i < tiles.length; i++) {
    if (tiles[i] === tiles[i + 1]) { out.push(tiles[i] * 2); gained += tiles[i] * 2; i++; }
    else out.push(tiles[i]);
  }
  while (out.length < SIZE) out.push(0);
  return { row: out, gained };
}

const transpose = (b: Board): Board => b[0].map((_, x) => b.map((r) => r[x]));
const flip = (b: Board): Board => b.map((r) => [...r].reverse());

// Every direction is turned into "slide left", then turned back.
export function move(board: Board, dir: Dir): { board: Board; gained: number; moved: boolean } {
  const vertical = dir === "up" || dir === "down";
  const reversed = dir === "right" || dir === "down";
  let work = vertical ? transpose(board) : board;
  if (reversed) work = flip(work);
  let gained = 0;
  work = work.map((r) => { const s = slideRow(r); gained += s.gained; return s.row; });
  if (reversed) work = flip(work);
  if (vertical) work = transpose(work);
  const moved = work.some((r, y) => r.some((v, x) => v !== board[y][x]));
  return { board: work, gained, moved };
}

export const canMove = (board: Board): boolean => (["up", "down", "left", "right"] as Dir[]).some((d) => move(board, d).moved);
export const hasWon = (board: Board): boolean => board.some((r) => r.includes(2048));
