// Flappy-style game rules. Pure functions, no React or canvas, so they are easy to test.
export const W = 320, H = 480;
export const BIRD_X = 80, BIRD_R = 12;
export const GAP = 130, PIPE_W = 52;
export const PIPE_SPEED = 2.2;
const GRAVITY = 0.35, FLAP_SPEED = -6.2, PIPE_EVERY = 90; // frames

export type Pipe = { x: number; gapY: number; passed: boolean }; // gapY = top of the gap
export type State = { y: number; vy: number; pipes: Pipe[]; score: number; frames: number; status: "ready" | "playing" | "over" };

export const newGame = (): State => ({ y: H / 2, vy: 0, pipes: [], score: 0, frames: 0, status: "ready" });

export function flap(s: State): State {
  return s.status === "over" ? s : { ...s, status: "playing", vy: FLAP_SPEED };
}

// One frame of physics. Call it 60 times a second while playing.
export function step(s: State, rand: () => number = Math.random): State {
  if (s.status !== "playing") return s;
  const frames = s.frames + 1;
  const vy = s.vy + GRAVITY;
  const y = s.y + vy;
  let score = s.score;

  let pipes = s.pipes.map((p) => ({ ...p, x: p.x - PIPE_SPEED }));
  if (frames % PIPE_EVERY === 1) pipes.push({ x: W, gapY: 50 + rand() * (H - 100 - GAP), passed: false });
  pipes = pipes
    .map((p) => (!p.passed && p.x + PIPE_W < BIRD_X ? (score++, { ...p, passed: true }) : p))
    .filter((p) => p.x > -PIPE_W);

  const hitEdge = y - BIRD_R < 0 || y + BIRD_R > H;
  const hitPipe = pipes.some(
    (p) => BIRD_X + BIRD_R > p.x && BIRD_X - BIRD_R < p.x + PIPE_W && (y - BIRD_R < p.gapY || y + BIRD_R > p.gapY + GAP),
  );
  return { y, vy, pipes, score, frames, status: hitEdge || hitPipe ? "over" : "playing" };
}
