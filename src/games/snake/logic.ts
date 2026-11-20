// Snake rules. Pure functions, no React or canvas, so they are easy to test.
export const COLS = 16, ROWS = 16;
export type Dir = "up" | "down" | "left" | "right";
export type Point = { x: number; y: number };
export type SnakeState = {
  snake: Point[];            // snake[0] is the head
  dir: Dir;                  // direction for the next step
  moved: Dir;                // direction of the last step taken (stops instant U-turns)
  food: Point | null;
  score: number;
  status: "ready" | "playing" | "over";
};

const DELTA: Record<Dir, Point> = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };
const OPPOSITE: Record<Dir, Dir> = { up: "down", down: "up", left: "right", right: "left" };

export function placeFood(snake: Point[], rand: () => number = Math.random): Point | null {
  const taken = new Set(snake.map((p) => `${p.x},${p.y}`));
  const free: Point[] = [];
  for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) if (!taken.has(`${x},${y}`)) free.push({ x, y });
  return free.length ? free[Math.floor(rand() * free.length)] : null;
}

export function newSnake(rand: () => number = Math.random): SnakeState {
  const snake = [{ x: 8, y: 8 }, { x: 7, y: 8 }, { x: 6, y: 8 }];
  return { snake, dir: "right", moved: "right", food: placeFood(snake, rand), score: 0, status: "ready" };
}

// Change direction. Turning straight back into yourself is ignored. The first turn starts the game.
export function turn(s: SnakeState, dir: Dir): SnakeState {
  if (s.status === "over" || OPPOSITE[dir] === s.moved) return s;
  return { ...s, dir, status: "playing" };
}

export function step(s: SnakeState, rand: () => number = Math.random): SnakeState {
  if (s.status !== "playing") return s;
  const d = DELTA[s.dir];
  const head = { x: s.snake[0].x + d.x, y: s.snake[0].y + d.y };
  const ate = s.food !== null && head.x === s.food.x && head.y === s.food.y;
  const body = ate ? s.snake : s.snake.slice(0, -1); // the tail moves out of the way unless we grow
  const hitWall = head.x < 0 || head.y < 0 || head.x >= COLS || head.y >= ROWS;
  const hitSelf = body.some((p) => p.x === head.x && p.y === head.y);
  if (hitWall || hitSelf) return { ...s, status: "over" };

  const snake = [head, ...body];
  const food = ate ? placeFood(snake, rand) : s.food;
  return { ...s, snake, moved: s.dir, food, score: s.score + (ate ? 1 : 0), status: food === null ? "over" : "playing" };
}
