import { describe, expect, it } from "vitest";
import { addTile, canMove, emptyBoard, move, slideRow } from "./logic";

describe("2048", () => {
  it("slides and merges a row once per pair", () => {
    expect(slideRow([2, 2, 2, 2])).toEqual({ row: [4, 4, 0, 0], gained: 8 });
    expect(slideRow([2, 0, 2, 4])).toEqual({ row: [4, 4, 0, 0], gained: 4 });
    expect(slideRow([4, 2, 0, 0])).toEqual({ row: [4, 2, 0, 0], gained: 0 });
  });
  it("moves in all four directions", () => {
    const b = [[2, 0, 0, 2], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
    expect(move(b, "left").board[0]).toEqual([4, 0, 0, 0]);
    expect(move(b, "right").board[0]).toEqual([0, 0, 0, 4]);
    expect(move(b, "down").board[3]).toEqual([2, 0, 0, 2]);
    expect(move(b, "up").moved).toBe(false);
  });
  it("reports when nothing moved", () => {
    const b = [[2, 4, 2, 4], [4, 2, 4, 2], [2, 4, 2, 4], [4, 2, 4, 2]];
    expect(move(b, "left").moved).toBe(false);
    expect(canMove(b)).toBe(false);
  });
  it("adds exactly one tile on an empty square", () => {
    const next = addTile(emptyBoard(), () => 0);
    expect(next.flat().filter(Boolean)).toEqual([2]);
  });
});
