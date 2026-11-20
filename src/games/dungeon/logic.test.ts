import { describe, expect, it } from "vitest";
import { COLS, ROWS, act, distances, newDungeon, wait, type DungeonState } from "./logic";

// A small seeded random generator so the tests give the same result every time.
function seeded(seed: number) {
  return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const open = (): DungeonState => ({
  ...newDungeon(seeded(1)),
  map: Array.from({ length: ROWS }, (_, y) => Array.from({ length: COLS }, (_, x) => (x === 0 || y === 0 || x === COLS - 1 || y === ROWS - 1 ? "#" : "."))),
  hero: { x: 5, y: 5, hp: 10, maxHp: 10 }, enemies: [], items: [], stairs: { x: 11, y: 9 },
});

describe("mini dungeon", () => {
  it("every generated floor has reachable stairs", () => {
    for (let seed = 1; seed <= 40; seed++) {
      const s = newDungeon(seeded(seed));
      expect(distances(s.map, s.hero)[s.stairs.y][s.stairs.x]).toBeGreaterThan(0);
    }
  });
  it("walking into a wall does not use a turn", () => {
    const s = { ...open(), hero: { x: 1, y: 1, hp: 10, maxHp: 10 } };
    expect(act(s, -1, 0)).toBe(s);
  });
  it("attacks an enemy in the way, then defeats it", () => {
    const s = { ...open(), enemies: [{ x: 6, y: 5, hp: 3, kind: "slime" as const }] };
    const hit = act(s, 1, 0, () => 0.9);
    expect(hit.hero.x).toBe(5);
    expect(hit.enemies[0].hp).toBe(1);
    const dead = act({ ...hit, hero: { ...hit.hero, hp: 10 } }, 1, 0, () => 0.9);
    expect(dead.enemies).toHaveLength(0);
    expect(dead.score).toBe(10);
  });
  it("a potion heals but never above the maximum", () => {
    const s = { ...open(), hero: { x: 5, y: 5, hp: 8, maxHp: 10 }, items: [{ x: 6, y: 5, kind: "potion" as const }] };
    expect(act(s, 1, 0).hero.hp).toBe(10);
  });
  it("coins add to the score", () => {
    const s = { ...open(), items: [{ x: 6, y: 5, kind: "coin" as const }] };
    expect(act(s, 1, 0).score).toBe(5);
  });
  it("stairs lead to a deeper floor", () => {
    const s = { ...open(), hero: { x: 10, y: 9, hp: 5, maxHp: 10 } };
    const next = act(s, 1, 0, seeded(3));
    expect(next.floor).toBe(2);
    expect(next.hero.hp).toBe(7);
  });
  it("enemies next to you hit you, and you can die", () => {
    const s = { ...open(), hero: { x: 5, y: 5, hp: 1, maxHp: 10 }, enemies: [{ x: 5, y: 6, hp: 3, kind: "slime" as const }] };
    const after = wait(s);
    expect(after.hero.hp).toBe(0);
    expect(after.status).toBe("over");
  });
  it("enemies walk towards you", () => {
    const s = { ...open(), enemies: [{ x: 9, y: 5, hp: 3, kind: "slime" as const }] };
    expect(wait(s).enemies[0].x).toBe(8);
  });
});
