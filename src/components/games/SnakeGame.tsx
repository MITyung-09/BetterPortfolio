"use client";

import { useEffect, useRef, useState } from "react";
import { COLS, newSnake, step, turn, type Dir, type SnakeState } from "@/games/snake/logic";
import { useHighScore } from "@/hooks/useHighScore";
import { play } from "@/lib/sound";
import DPad from "./DPad";

const CELL = 20, SIZE = COLS * CELL;
const KEYS: Record<string, Dir> = {
  ArrowUp: "up", w: "up", W: "up", ArrowDown: "down", s: "down", S: "down",
  ArrowLeft: "left", a: "left", A: "left", ArrowRight: "right", d: "right", D: "right",
};

export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const game = useRef<SnakeState>(newSnake());
  const paused = useRef(false);
  const overHandled = useRef(false);
  const swipeStart = useRef<{ x: number; y: number } | null>(null);
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [best, submitBest] = useHighScore("snakeBest");

  const setPause = (value: boolean) => { paused.current = value; setIsPaused(value); };
  const restart = () => { game.current = newSnake(); overHandled.current = false; setScore(0); setPause(false); };
  const steer = (dir: Dir) => {
    if (game.current.status === "over") return;
    if (paused.current) setPause(false);
    if (game.current.status === "ready") play("click");
    game.current = turn(game.current, dir);
  };
  // A tap (no swipe) starts, resumes or restarts.
  const tap = () => {
    if (game.current.status === "over") restart();
    else if (paused.current) setPause(false);
    else if (game.current.status === "ready") game.current = { ...game.current, status: "playing" };
  };
  const togglePause = () => { if (game.current.status === "playing") setPause(!paused.current); };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    canvas.width = SIZE * 2; // 2x so it stays sharp
    canvas.height = SIZE * 2;
    ctx.setTransform(2, 0, 0, 2, 0, 0);
    let timer = 0;

    const label = (text: string, y: number, size: number, color = "#f1e6dc") => {
      ctx.fillStyle = color; ctx.font = `bold ${size}px sans-serif`; ctx.textAlign = "center"; ctx.fillText(text, SIZE / 2, y);
    };
    const draw = () => {
      const s = game.current;
      ctx.fillStyle = "#12060a"; ctx.fillRect(0, 0, SIZE, SIZE);
      ctx.strokeStyle = "rgba(241,230,220,0.05)";
      for (let i = 1; i < COLS; i++) {
        ctx.beginPath(); ctx.moveTo(i * CELL, 0); ctx.lineTo(i * CELL, SIZE); ctx.moveTo(0, i * CELL); ctx.lineTo(SIZE, i * CELL); ctx.stroke();
      }
      if (s.food) { ctx.fillStyle = "#ff8a3c"; ctx.beginPath(); ctx.arc(s.food.x * CELL + CELL / 2, s.food.y * CELL + CELL / 2, CELL / 2 - 3, 0, Math.PI * 2); ctx.fill(); }
      s.snake.forEach((p, i) => {
        ctx.fillStyle = i === 0 ? "#ffd166" : "#ff5a2b";
        ctx.beginPath(); ctx.roundRect(p.x * CELL + 1, p.y * CELL + 1, CELL - 2, CELL - 2, 5); ctx.fill();
      });
      if (s.status === "ready") { ctx.fillStyle = "rgba(10,4,5,0.6)"; ctx.fillRect(0, 0, SIZE, SIZE); label("SNAKE", SIZE / 2 - 10, 32, "#ff8a3c"); label("Arrows, swipe or tap to start", SIZE / 2 + 22, 15); }
      if (paused.current && s.status === "playing") { ctx.fillStyle = "rgba(10,4,5,0.6)"; ctx.fillRect(0, 0, SIZE, SIZE); label("PAUSED", SIZE / 2, 28); label("Press P, Space or tap to resume", SIZE / 2 + 28, 14); }
      if (s.status === "over") { ctx.fillStyle = "rgba(10,4,5,0.7)"; ctx.fillRect(0, 0, SIZE, SIZE); label("GAME OVER", SIZE / 2 - 10, 30, "#ff5a5a"); label(`Score ${s.score}`, SIZE / 2 + 20, 18); label("Tap or press Enter to retry", SIZE / 2 + 48, 14, "#ffd166"); }
    };
    const tick = () => {
      if (!paused.current) {
        const before = game.current;
        game.current = step(game.current);
        if (game.current.score > before.score) play("eat");
        setScore(game.current.score);
        if (game.current.status === "over" && !overHandled.current) {
          overHandled.current = true;
          play("over");
          submitBest(game.current.score);
        }
      }
      draw();
      timer = window.setTimeout(tick, Math.max(70, 150 - game.current.score * 4)); // speeds up as you eat
    };

    draw(); // show the first frame straight away, before the loop starts

    // Only run while on screen, and pause if the window loses focus mid-game.
    const visibility = new IntersectionObserver(([entry]) => {
      window.clearTimeout(timer);
      if (entry.isIntersecting) tick();
    });
    visibility.observe(canvas);
    const onBlur = () => { if (game.current.status === "playing") { paused.current = true; setIsPaused(true); } };
    window.addEventListener("blur", onBlur);
    return () => { window.clearTimeout(timer); visibility.disconnect(); window.removeEventListener("blur", onBlur); };
  }, [submitBest]);

  return (
    <div className="gameWrap">
      <canvas
        ref={canvasRef}
        width={SIZE}
        height={SIZE}
        className="gameCanvas square"
        tabIndex={0}
        data-cursor="play"
        aria-label="Snake game. Use the arrow keys or swipe to steer."
        onKeyDown={(e) => {
          const dir = KEYS[e.key];
          if (dir) { e.preventDefault(); steer(dir); }
          else if (e.key === "p" || e.key === "P" || e.key === " ") { e.preventDefault(); if (game.current.status === "ready") tap(); else togglePause(); }
          else if (e.key === "Enter" && game.current.status === "over") restart();
        }}
        onPointerDown={(e) => { swipeStart.current = { x: e.clientX, y: e.clientY }; }}
        onPointerUp={(e) => {
          const start = swipeStart.current;
          swipeStart.current = null;
          if (!start) return;
          const dx = e.clientX - start.x, dy = e.clientY - start.y;
          if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) tap();
          else steer(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up"));
        }}
      />
      <div className="hud">
        <span>Score <b>{score}</b></span>
        <span>Best <b>{best}</b></span>
        <button type="button" className="btn small" onClick={togglePause} disabled={game.current.status !== "playing"}>{isPaused ? "Resume" : "Pause"}</button>
        <button type="button" className="btn small" onClick={restart}>Restart</button>
      </div>
      <DPad onPress={steer} />
    </div>
  );
}
