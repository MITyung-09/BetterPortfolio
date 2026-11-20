// Mini Dungeon rules: a small turn-based adventure. Pure functions, no React, so they are easy to test.
export const COLS = 13, ROWS = 11;
export type Tile = "#" | ".";
export type Enemy = { x: number; y: number; hp: number; kind: "slime" | "skeleton" };
export type Item = { x: number; y: number; kind: "potion" | "coin" };
export type Hero = { x: number; y: number; hp: number; maxHp: number };
export type DungeonState = {
  floor: number; map: Tile[][]; hero: Hero; enemies: Enemy[]; items: Item[];
  stairs: { x: number; y: number }; score: number; message: string; status: "playing" | "over";
};

export const ENEMY_MAX_HP = { slime: 3, skeleton: 5 } as const;
const ENEMY_DAMAGE = { slime: 1, skeleton: 2 } as const;
const DIRS: [number, number][] = [[1, 0], [-1, 0], [0, 1], [0, -1]];

// How many steps from `from` to every cell (-1 = cannot be reached).
export function distances(map: Tile[][], from: { x: number; y: number }): number[][] {
  const dist = map.map((row) => row.map(() => -1));
  dist[from.y][from.x] = 0;
  const queue = [from];
  for (let i = 0; i < queue.length; i++) {
    const { x, y } = queue[i];
    for (const [dx, dy] of DIRS) {
      const nx = x + dx, ny = y + dy;
      if (map[ny]?.[nx] === "." && dist[ny][nx] === -1) { dist[ny][nx] = dist[y][x] + 1; queue.push({ x: nx, y: ny }); }
    }
  }
  return dist;
}

function randomMap(rand: () => number): Tile[][] {
  return Array.from({ length: ROWS }, (_, y) =>
    Array.from({ length: COLS }, (_, x): Tile => {
      const border = x === 0 || y === 0 || x === COLS - 1 || y === ROWS - 1;
      return border || (rand() < 0.18 && !(x === 1 && y === 1)) ? "#" : ".";
    }));
}

function buildFloor(floor: number, rand: () => number, hero: { hp: number; maxHp: number }, score: number, message: string): DungeonState {
  let map = randomMap(rand), dist = distances(map, { x: 1, y: 1 });
  for (let tries = 0; tries < 60 && dist.flat().filter((d) => d >= 0).length < 45; tries++) {
    map = randomMap(rand); dist = distances(map, { x: 1, y: 1 });
  }
  // keep only the cells the hero can walk to, so nothing is placed in a sealed-off pocket
  const free: { x: number; y: number; d: number }[] = [];
  map.forEach((row, y) => row.forEach((_, x) => { if (dist[y][x] > 0) free.push({ x, y, d: dist[y][x] }); }));
  const take = (filter: (c: { d: number }) => boolean) => {
    const options = free.filter(filter);
    const pool = options.length ? options : free;
    if (!pool.length) return null;
    const cell = pool[Math.floor(rand() * pool.length)];
    free.splice(free.indexOf(cell), 1);
    return cell;
  };
  const far = Math.max(...free.map((c) => c.d), 1);
  const stairs = take((c) => c.d >= Math.min(8, far)) ?? { x: 1, y: 2 };
  const enemies: Enemy[] = [];
  for (let i = 0; i < Math.min(2 + floor, 8); i++) {
    const c = take((cell) => cell.d >= 4);
    if (!c) break;
    const kind = floor >= 3 && rand() < 0.35 ? "skeleton" : "slime";
    enemies.push({ x: c.x, y: c.y, hp: ENEMY_MAX_HP[kind], kind });
  }
  const items: Item[] = [];
  const potions = rand() < 0.5 ? 2 : 1;
  for (let i = 0; i < potions + 3; i++) {
    const c = take(() => true);
    if (c) items.push({ x: c.x, y: c.y, kind: i < potions ? "potion" : "coin" });
  }
  return { floor, map, hero: { x: 1, y: 1, ...hero }, enemies, items, stairs: { x: stairs.x, y: stairs.y }, score, message, status: "playing" };
}

export const newDungeon = (rand: () => number = Math.random): DungeonState =>
  buildFloor(1, rand, { hp: 10, maxHp: 10 }, 0, "Find the stairs (>) and go as deep as you can.");

// Enemies that are close walk towards the hero; enemies next to the hero hit it.
function enemyTurn(s: DungeonState): DungeonState {
  let hp = s.hero.hp;
  let message = s.message;
  const out: Enemy[] = [];
  s.enemies.forEach((e, i) => {
    const dx = s.hero.x - e.x, dy = s.hero.y - e.y;
    const dist = Math.abs(dx) + Math.abs(dy);
    if (dist === 1) {
      hp -= ENEMY_DAMAGE[e.kind];
      message += ` The ${e.kind} hits you for ${ENEMY_DAMAGE[e.kind]}.`;
      out.push(e);
      return;
    }
    if (dist <= 7) {
      const tries: [number, number][] = Math.abs(dx) >= Math.abs(dy) ? [[Math.sign(dx), 0], [0, Math.sign(dy)]] : [[0, Math.sign(dy)], [Math.sign(dx), 0]];
      for (const [ox, oy] of tries) {
        if (!ox && !oy) continue;
        const nx = e.x + ox, ny = e.y + oy;
        const blocked = s.map[ny][nx] !== "." || (nx === s.hero.x && ny === s.hero.y)
          || out.some((o) => o.x === nx && o.y === ny) || s.enemies.slice(i + 1).some((o) => o.x === nx && o.y === ny);
        if (!blocked) { out.push({ ...e, x: nx, y: ny }); return; }
      }
    }
    out.push(e);
  });
  const dead = hp <= 0;
  return { ...s, enemies: out, hero: { ...s.hero, hp: Math.max(0, hp) }, message: (message + (dead ? " You died." : "")).trim(), status: dead ? "over" : "playing" };
}

// Move (or attack, if an enemy is in the way). Walking into a wall costs no turn.
export function act(s: DungeonState, dx: number, dy: number, rand: () => number = Math.random): DungeonState {
  if (s.status !== "playing") return s;
  const tx = s.hero.x + dx, ty = s.hero.y + dy;
  if (s.map[ty]?.[tx] !== ".") return s;

  const foe = s.enemies.find((e) => e.x === tx && e.y === ty);
  if (foe) {
    const hp = foe.hp - (2 + (rand() < 0.3 ? 1 : 0));
    const slain = hp <= 0;
    return enemyTurn({
      ...s,
      enemies: slain ? s.enemies.filter((e) => e !== foe) : s.enemies.map((e) => (e === foe ? { ...e, hp } : e)),
      score: s.score + (slain ? 10 : 0),
      message: slain ? `You defeated the ${foe.kind}.` : `You hit the ${foe.kind}.`,
    });
  }

  let hero: Hero = { ...s.hero, x: tx, y: ty };
  let score = s.score;
  let message = "";
  const item = s.items.find((i) => i.x === tx && i.y === ty);
  if (item?.kind === "potion") { hero = { ...hero, hp: Math.min(hero.maxHp, hero.hp + 4) }; message = "You drink a potion (+4 HP)."; }
  if (item?.kind === "coin") { score += 5; message = "You pick up a coin (+5)."; }
  if (tx === s.stairs.x && ty === s.stairs.y) {
    return buildFloor(s.floor + 1, rand, { hp: Math.min(hero.maxHp, hero.hp + 2), maxHp: hero.maxHp }, score + 50, `You descend to floor ${s.floor + 1}. (+2 HP)`);
  }
  return enemyTurn({ ...s, hero, score, message, items: item ? s.items.filter((i) => i !== item) : s.items });
}

export const wait = (s: DungeonState): DungeonState => (s.status === "playing" ? enemyTurn({ ...s, message: "You wait." }) : s);
