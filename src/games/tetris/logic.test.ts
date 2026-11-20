import { describe, expect, it } from "vitest";
import { COLS, ROWS, cellsOf, collides, hardDrop, newTetris, rotateCw, shift, tick, type Board, type Cell, type TetrisState } from "./logic";

const seq = (...values: number[]) => { let i = 0; return () => values[i++ % values.length]; };
const playing = (rand = () => 0.5): TetrisState => ({ ...newTetris(rand), status: "playing" });
const emptyRow = (): Cell[] => Array<Cell>(COLS).fill(null);

describe("tetris", () => {
  it("pieces fall one row per tick", () => {
    const s = playing();
    expect(tick(s).piece.y).toBe(s.piece.y + 1);
  });
  it("cannot move through the walls", () => {
    let s = playing();
    for (let i = 0; i < 12; i++) s = shift(s, -1);
    expect(Math.min(...cellsOf(s.piece).map((c) => c.x))).toBe(0);
  });
  it("rotating keeps the piece inside the board (wall kick)", () => {
    let s: TetrisState = { ...playing(), piece: { type: "I", rot: 1, x: -2, y: 5 } };
    s = rotateCw(s);
    expect(collides(s.board, s.piece)).toBe(false);
  });
  it("hard drop lands on the floor and scores", () => {
    const s = hardDrop(playing(), () => 0.5);
    expect(s.board[ROWS - 1].some((c) => c !== null)).toBe(true);
    expect(s.score).toBeGreaterThan(0);
  });
  it("clears a full line and scores it", () => {
    const board: Board = Array.from({ length: ROWS }, emptyRow);
    board[ROWS - 1] = Array<Cell>(COLS).fill("T").map((c, x) => (x >= 4 && x <= 7 ? null : c)); // gap of 4 in the bottom row
    const s: TetrisState = { ...playing(), board, piece: { type: "I", rot: 0, x: 4, y: ROWS - 3 } };
    const after = hardDrop(s, seq(0.5));
    expect(after.lines).toBe(1);
    expect(after.score).toBeGreaterThanOrEqual(100);
    expect(after.board[ROWS - 1].every((c) => c === null)).toBe(true);
  });
  it("game is over when a new piece has no room", () => {
    // a stack that reaches the top but has no full rows (column 9 stays empty)
    const board: Board = Array.from({ length: ROWS }, () => Array<Cell>(COLS).fill("T").map((c, x) => (x === COLS - 1 ? null : c)));
    const s: TetrisState = { ...playing(), board, piece: { type: "O", rot: 0, x: 4, y: 0 } };
    expect(tick(s).status).toBe("over");
  });
});
