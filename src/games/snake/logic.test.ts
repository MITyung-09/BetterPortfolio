import { describe, expect, it } from "vitest";
import { COLS, newSnake, step, turn, type SnakeState } from "./logic";

const half = () => 0.5;
const playing = (over: Partial<SnakeState> = {}): SnakeState => ({ ...newSnake(half), status: "playing", ...over });

describe("snake", () => {
  it("moves one cell in its direction", () => {
    const next = step(playing());
    expect(next.snake[0]).toEqual({ x: 9, y: 8 });
    expect(next.snake).toHaveLength(3);
  });
  it("does nothing until it has started", () => {
    expect(step(newSnake(half))).toEqual(newSnake(half));
  });
  it("ignores a U-turn, even after two quick key presses", () => {
    let s = playing();
    s = turn(s, "up");
    s = turn(s, "left"); // would reverse into the body if the last step was "right"
    expect(s.dir).toBe("up");
  });
  it("grows and scores when it eats", () => {
    const s = playing({ food: { x: 9, y: 8 } });
    const next = step(s, half);
    expect(next.score).toBe(1);
    expect(next.snake).toHaveLength(4);
    expect(next.food).not.toEqual({ x: 9, y: 8 });
  });
  it("ends when it hits a wall", () => {
    const s = playing({ snake: [{ x: COLS - 1, y: 3 }, { x: COLS - 2, y: 3 }], food: { x: 0, y: 0 } });
    expect(step(s).status).toBe("over");
  });
  it("ends when it runs into itself", () => {
    const loop = [{ x: 5, y: 5 }, { x: 5, y: 6 }, { x: 4, y: 6 }, { x: 4, y: 5 }, { x: 4, y: 4 }];
    expect(step(playing({ snake: loop, dir: "left", moved: "up", food: { x: 0, y: 0 } })).status).toBe("over");
  });
});
