import { describe, expect, it } from "vitest";
import { GROUND, PLAYER_X, STAND_H, jump, newRun, onGround, setDuck, step, type RunnerState } from "./logic";

const playing = (): RunnerState => ({ ...newRun(), status: "playing" });

describe("endless runner", () => {
  it("jump leaves the ground and the runner lands again", () => {
    let s = jump(playing());
    s = step(s);
    expect(onGround(s)).toBe(false);
    for (let i = 0; i < 80; i++) s = step(s);
    expect(onGround(s)).toBe(true);
  });
  it("cannot jump in mid-air", () => {
    let s = step(jump(playing()));
    const vy = s.vy;
    s = jump(s);
    expect(s.vy).toBe(vy);
  });
  it("ends on hitting a spike", () => {
    const s = { ...playing(), obstacles: [{ x: PLAYER_X + 5, y: GROUND - 40, w: 20, h: 40, kind: "spike" as const }] };
    expect(step(s).status).toBe("over");
  });
  it("jumping clears a spike", () => {
    let s: RunnerState = { ...jump(playing()), obstacles: [{ x: PLAYER_X + 150, y: GROUND - 30, w: 20, h: 30, kind: "spike" as const }], untilNext: 9999 };
    for (let i = 0; i < 60 && s.status === "playing"; i++) s = step(s);
    expect(s.status).toBe("playing");
  });
  it("ducking goes under a bat, standing does not", () => {
    const bat = { x: PLAYER_X, y: GROUND - 42, w: 30, h: 18, kind: "bat" as const };
    const standing = { ...playing(), obstacles: [bat], untilNext: 9999 };
    const ducking = setDuck(standing, true);
    expect(step(standing).status).toBe("over");
    expect(step(ducking).status).toBe("playing");
    expect(setDuck(ducking, false).y).toBe(GROUND - STAND_H);
  });
  it("spawns obstacles and speeds up over distance", () => {
    let s = playing();
    for (let i = 0; i < 200 && s.status === "playing"; i++) s = step({ ...s, y: GROUND - STAND_H, vy: 0 }, () => 0.5);
    expect(s.obstacles.length + (s.status === "over" ? 1 : 0)).toBeGreaterThan(0);
    expect(step({ ...playing(), distance: 6000 }).speed).toBeGreaterThan(step(playing()).speed);
  });
});
