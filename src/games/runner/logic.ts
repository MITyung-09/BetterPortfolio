// Endless runner rules. Pure functions, no React or canvas, so they are easy to test.
export const W = 640, H = 200, GROUND = 164, PLAYER_X = 60, PLAYER_W = 26, STAND_H = 40, DUCK_H = 22;
const GRAVITY = 0.7, JUMP_SPEED = -12.5;

export type Obstacle = { x: number; y: number; w: number; h: number; kind: "spike" | "bat" };
export type RunnerState = {
  y: number; vy: number; ducking: boolean;   // y is the top of the runner
  obstacles: Obstacle[];
  distance: number; speed: number; untilNext: number; // untilNext: distance left before the next obstacle appears
  status: "ready" | "playing" | "over";
};

export const playerHeight = (s: RunnerState): number => (s.ducking ? DUCK_H : STAND_H);
export const onGround = (s: RunnerState): boolean => s.y + playerHeight(s) >= GROUND;
export const runScore = (s: RunnerState): number => Math.floor(s.distance / 10);

export const newRun = (): RunnerState => ({
  y: GROUND - STAND_H, vy: 0, ducking: false, obstacles: [], distance: 0, speed: 5, untilNext: 300, status: "ready",
});

export function jump(s: RunnerState): RunnerState {
  if (s.status === "over") return s;
  const started: RunnerState = s.status === "ready" ? { ...s, status: "playing" } : s;
  return onGround(started) ? { ...started, vy: JUMP_SPEED, ducking: false, y: Math.min(started.y, GROUND - STAND_H) } : started;
}

// Ducking only works on the ground. Bats fly at head height, so duck under them (or jump over).
export function setDuck(s: RunnerState, on: boolean): RunnerState {
  if (s.status === "over") return s;
  if (on && onGround(s) && !s.ducking) return { ...s, ducking: true, y: GROUND - DUCK_H };
  if (!on && s.ducking) return { ...s, ducking: false, y: GROUND - STAND_H };
  return s;
}

function spawnObstacle(distance: number, rand: () => number): Obstacle {
  if (distance > 3000 && rand() < 0.35) return { x: W + 20, y: GROUND - 42, w: 30, h: 18, kind: "bat" };
  const h = 28 + Math.floor(rand() * 26), w = 16 + Math.floor(rand() * 18);
  return { x: W + 20, y: GROUND - h, w, h, kind: "spike" };
}

// A little forgiveness: the hit boxes are a few pixels smaller than what you see.
function hits(s: RunnerState, o: Obstacle): boolean {
  const px = PLAYER_X + 4, py = s.y + 3, pw = PLAYER_W - 8, ph = playerHeight(s) - 6;
  return px < o.x + o.w - 3 && px + pw > o.x + 3 && py < o.y + o.h - 3 && py + ph > o.y + 3;
}

export function step(s: RunnerState, rand: () => number = Math.random): RunnerState {
  if (s.status !== "playing") return s;
  const h = playerHeight(s);
  let vy = s.vy + GRAVITY;
  let y = s.y + vy;
  if (y + h >= GROUND) { y = GROUND - h; vy = 0; }

  const speed = Math.min(13, 5 + s.distance / 1500); // gets faster the further you go
  let obstacles = s.obstacles.map((o) => ({ ...o, x: o.x - speed })).filter((o) => o.x + o.w > -10);
  let untilNext = s.untilNext - speed;
  if (untilNext <= 0) {
    obstacles = [...obstacles, spawnObstacle(s.distance, rand)];
    untilNext = 300 + rand() * 250 + speed * 20;
  }
  const next = { ...s, y, vy, obstacles, untilNext, speed, distance: s.distance + speed };
  return obstacles.some((o) => hits(next, o)) ? { ...next, status: "over" } : next;
}
