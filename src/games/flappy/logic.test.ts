import { describe, expect, it } from "vitest";
import { BIRD_X, H, PIPE_W, flap, newGame, step } from "./logic";

const half = () => 0.5;

describe("flappy", () => {
  it("falls and ends when nobody flaps", () => {
    let s = flap(newGame());
    for (let i = 0; i < 300 && s.status === "playing"; i++) s = step(s, half);
    expect(s.status).toBe("over");
  });
  it("a flap sends the bird upwards", () => {
    const s = flap(newGame());
    expect(s.vy).toBeLessThan(0);
  });
  it("scores when a pipe is passed safely", () => {
    const s = { ...flap(newGame()), vy: 0, pipes: [{ x: BIRD_X - PIPE_W - 5, gapY: 200, passed: false }] };
    const next = step(s, half);
    expect(next.score).toBe(1);
    expect(next.status).toBe("playing");
  });
  it("ends when the bird hits a pipe", () => {
    const s = { ...flap(newGame()), vy: 0, pipes: [{ x: BIRD_X - 10, gapY: 20, passed: false }] };
    expect(step(s, half).status).toBe("over");
  });
  it("ends at the floor", () => {
    expect(step({ ...flap(newGame()), y: H, vy: 5 }, half).status).toBe("over");
  });
});
