"use client";

import { useEffect, useRef, useState } from "react";
import { COLS, ENEMY_MAX_HP, ROWS, act, newDungeon, wait, type DungeonState } from "@/games/dungeon/logic";
import { useHighScore } from "@/hooks/useHighScore";
import { play } from "@/lib/sound";
import DPad from "./DPad";

const CELL = 28, W = COLS * CELL, H = ROWS * CELL;
const MOVES: Record<string, [number, number]> = {
  ArrowUp: [0, -1], w: [0, -1], W: [0, -1], ArrowDown: [0, 1], s: [0, 1], S: [0, 1],
  ArrowLeft: [-1, 0], a: [-1, 0], A: [-1, 0], ArrowRight: [1, 0], d: [1, 0], D: [1, 0],
};

export default function DungeonGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const swipeStart = useRef<{ x: number; y: number } | null>(null);
  const [state, setState] = useState<DungeonState>(() => newDungeon());
  const [best, submitBest] = useHighScore("dungeonBest");

  // Run one turn, then play a sound that matches what happened.
  const turn = (next: DungeonState) => {
    if (next === state) return;
    const sound = next.status === "over" ? "over" : next.floor > state.floor ? "win" : next.hero.hp < state.hero.hp ? "hit"
      : next.enemies.length < state.enemies.length ? "merge" : next.score > state.score ? "eat" : "move";
    play(sound);
    submitBest(next.score);
    setState(next);
  };
  const move = (dx: number, dy: number) => turn(act(state, dx, dy));
  const restart = () => setState(newDungeon());

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(2, 0, 0, 2, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "bold 16px sans-serif";
    const at = (x: number) => x * CELL + CELL / 2;

    state.map.forEach((row, y) => row.forEach((tile, x) => {
      ctx.fillStyle = tile === "#" ? "#3a2424" : (x + y) % 2 ? "#1a0d0d" : "#160a0a";
      ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
      if (tile === "#") { ctx.fillStyle = "#4d3030"; ctx.fillRect(x * CELL, y * CELL, CELL, 4); }
    }));
    ctx.fillStyle = "#f1e6dc"; ctx.fillText(">", at(state.stairs.x), at(state.stairs.y));
    for (const item of state.items) {
      ctx.fillStyle = item.kind === "potion" ? "#ff5a5a" : "#ffd166";
      ctx.beginPath(); ctx.arc(at(item.x), at(item.y), item.kind === "potion" ? 7 : 5, 0, Math.PI * 2); ctx.fill();
    }
    for (const e of state.enemies) {
      ctx.fillStyle = e.kind === "slime" ? "#7ed957" : "#e8e2d8";
      ctx.beginPath();
      if (e.kind === "slime") ctx.arc(at(e.x), at(e.y) + 2, 10, 0, Math.PI * 2);
      else { ctx.moveTo(at(e.x), at(e.y) - 11); ctx.lineTo(at(e.x) + 9, at(e.y)); ctx.lineTo(at(e.x), at(e.y) + 11); ctx.lineTo(at(e.x) - 9, at(e.y)); }
      ctx.fill();
      ctx.fillStyle = "#12060a"; ctx.fillRect(at(e.x) - 5, at(e.y) - 2, 3, 3); ctx.fillRect(at(e.x) + 2, at(e.y) - 2, 3, 3);
      ctx.fillStyle = "#5a2a2a"; ctx.fillRect(e.x * CELL + 4, e.y * CELL + 1, CELL - 8, 3);
      ctx.fillStyle = "#ff5a5a"; ctx.fillRect(e.x * CELL + 4, e.y * CELL + 1, ((CELL - 8) * e.hp) / ENEMY_MAX_HP[e.kind], 3);
    }
    ctx.fillStyle = state.status === "over" ? "#5a4a46" : "#ff8a3c";
    ctx.beginPath(); ctx.arc(at(state.hero.x), at(state.hero.y), 10, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#12060a"; ctx.fillRect(at(state.hero.x) + 1, at(state.hero.y) - 3, 4, 4);
    if (state.status === "over") {
      ctx.fillStyle = "rgba(10,4,5,0.65)"; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#ff5a5a"; ctx.font = "bold 30px sans-serif"; ctx.fillText("YOU DIED", W / 2, H / 2 - 14);
      ctx.fillStyle = "#f1e6dc"; ctx.font = "16px sans-serif"; ctx.fillText(`Floor ${state.floor}  ·  Score ${state.score}`, W / 2, H / 2 + 18);
    }
  }, [state]);

  return (
    <div className="gameWrap wide dungeon">
      <canvas
        ref={canvasRef}
        width={W * 2}
        height={H * 2}
        className="gameCanvas dungeonCanvas"
        tabIndex={0}
        data-cursor="play"
        aria-label="Mini Dungeon. Use the arrow keys or swipe to move. Walk into enemies to attack."
        onKeyDown={(e) => {
          const dir = MOVES[e.key];
          if (dir) { e.preventDefault(); move(dir[0], dir[1]); }
          else if (e.key === " " || e.key === ".") { e.preventDefault(); turn(wait(state)); }
          else if (e.key === "Enter" && state.status === "over") restart();
        }}
        onPointerDown={(e) => { swipeStart.current = { x: e.clientX, y: e.clientY }; }}
        onPointerUp={(e) => {
          const start = swipeStart.current;
          swipeStart.current = null;
          if (!start) return;
          const dx = e.clientX - start.x, dy = e.clientY - start.y;
          if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) { if (state.status === "over") restart(); return; }
          if (Math.abs(dx) > Math.abs(dy)) move(dx > 0 ? 1 : -1, 0); else move(0, dy > 0 ? 1 : -1);
        }}
      />
      <p className="dmsg" role="status">{state.message}</p>
      <div className="hud">
        <span>HP <b>{state.hero.hp}/{state.hero.maxHp}</b></span>
        <span>Floor <b>{state.floor}</b></span>
        <span>Score <b>{state.score}</b></span>
        <span>Best <b>{best}</b></span>
        <button type="button" className="btn small" onClick={() => turn(wait(state))} disabled={state.status !== "playing"}>Wait</button>
        <button type="button" className="btn small" onClick={restart}>Restart</button>
      </div>
      <DPad onPress={(d) => move(d === "left" ? -1 : d === "right" ? 1 : 0, d === "up" ? -1 : d === "down" ? 1 : 0)} />
    </div>
  );
}
