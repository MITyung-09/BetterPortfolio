"use client";

import { useEffect, useRef, useState } from "react";
import { COLS, ROWS, cellsOf, dropInterval, hardDrop, newTetris, rotateCw, shapeOf, shift, softDrop, tick, type PieceType, type TetrisState } from "@/games/tetris/logic";
import { useHighScore } from "@/hooks/useHighScore";
import { play } from "@/lib/sound";

const CELL = 24, BOARD_W = COLS * CELL, W = BOARD_W + 90, H = ROWS * CELL;
const COLORS: Record<PieceType, string> = { I: "#4cc9f0", O: "#ffd166", T: "#b388ff", S: "#8fc400", Z: "#ff5a5a", J: "#5b7cff", L: "#ff8a3c" };
type Action = "left" | "right" | "rotate" | "down" | "drop";
const KEYS: Record<string, Action> = {
  ArrowLeft: "left", a: "left", A: "left", ArrowRight: "right", d: "right", D: "right",
  ArrowUp: "rotate", w: "rotate", W: "rotate", x: "rotate", X: "rotate", ArrowDown: "down", s: "down", S: "down", " ": "drop",
};

export default function TetrisGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const game = useRef<TetrisState>(newTetris());
  const paused = useRef(false);
  const overHandled = useRef(false);
  const [hud, setHud] = useState({ score: 0, lines: 0, level: 1 });
  const [isPaused, setIsPaused] = useState(false);
  const [best, submitBest] = useHighScore("tetrisBest");

  const setPause = (value: boolean) => { paused.current = value; setIsPaused(value); };
  const restart = () => { game.current = newTetris(); overHandled.current = false; setPause(false); };
  const togglePause = () => { if (game.current.status === "playing") setPause(!paused.current); };
  const tap = () => {
    if (game.current.status === "over") restart();
    else if (paused.current) setPause(false);
    else if (game.current.status === "ready") game.current = { ...game.current, status: "playing" };
  };

  const handle = (action: Action) => {
    let s = game.current;
    if (s.status === "over") return;
    if (paused.current) { setPause(false); return; }
    if (s.status === "ready") { game.current = { ...s, status: "playing" }; if (action === "drop") return; s = game.current; }
    const lines = s.lines;
    if (action === "left" || action === "right") { s = shift(s, action === "left" ? -1 : 1); play("move"); }
    else if (action === "rotate") { s = rotateCw(s); play("move"); }
    else if (action === "down") s = softDrop(s);
    else { s = hardDrop(s); play("hit"); }
    if (s.lines > lines) play("merge");
    game.current = s;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    canvas.width = W * 2;
    canvas.height = H * 2;
    ctx.setTransform(2, 0, 0, 2, 0, 0);
    let frame = 0, last = performance.now(), acc = 0;

    const label = (text: string, y: number, size: number, color = "#f1e6dc") => {
      ctx.fillStyle = color; ctx.font = `bold ${size}px sans-serif`; ctx.textAlign = "center"; ctx.fillText(text, BOARD_W / 2, y);
    };
    const block = (x: number, y: number, color: string) => { ctx.fillStyle = color; ctx.fillRect(x * CELL + 1, y * CELL + 1, CELL - 2, CELL - 2); };
    const draw = () => {
      const s = game.current;
      ctx.fillStyle = "#12060a"; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#0b0405"; ctx.fillRect(0, 0, BOARD_W, H);
      ctx.strokeStyle = "rgba(241,230,220,0.05)";
      for (let i = 1; i < COLS; i++) { ctx.beginPath(); ctx.moveTo(i * CELL, 0); ctx.lineTo(i * CELL, H); ctx.stroke(); }
      for (let j = 1; j < ROWS; j++) { ctx.beginPath(); ctx.moveTo(0, j * CELL); ctx.lineTo(BOARD_W, j * CELL); ctx.stroke(); }
      s.board.forEach((row, y) => row.forEach((c, x) => { if (c) block(x, y, COLORS[c]); }));
      for (const c of cellsOf(s.piece)) if (c.y >= 0) block(c.x, c.y, COLORS[s.piece.type]);
      // side panel: the next piece
      ctx.fillStyle = "#a89a94"; ctx.font = "bold 12px sans-serif"; ctx.textAlign = "left"; ctx.fillText("NEXT", BOARD_W + 14, 24);
      shapeOf({ type: s.next, rot: 0, x: 0, y: 0 }).forEach((row, dy) => row.forEach((v, dx) => {
        if (v) { ctx.fillStyle = COLORS[s.next]; ctx.fillRect(BOARD_W + 14 + dx * 16, 36 + dy * 16, 14, 14); }
      }));
      const dim = () => { ctx.fillStyle = "rgba(10,4,5,0.7)"; ctx.fillRect(0, 0, BOARD_W, H); };
      if (s.status === "ready") { dim(); label("TETRIS", H / 2 - 20, 30, "#ff8a3c"); label("Press any control or tap", H / 2 + 12, 14); }
      if (paused.current && s.status === "playing") { dim(); label("PAUSED", H / 2, 28); label("Tap or press a key to resume", H / 2 + 28, 13); }
      if (s.status === "over") { dim(); label("GAME OVER", H / 2 - 16, 28, "#ff5a5a"); label(`Score ${s.score}`, H / 2 + 14, 18); label("Tap or press Enter to retry", H / 2 + 42, 13, "#ffd166"); }
    };
    const loop = (now: number) => {
      acc += Math.min(now - last, 100);
      last = now;
      const s = game.current;
      if (s.status === "playing" && !paused.current) {
        const interval = dropInterval(s.level);
        while (acc >= interval) {
          acc -= interval;
          const lines = game.current.lines;
          game.current = tick(game.current);
          if (game.current.lines > lines) play("merge");
        }
      } else acc = 0;
      const now2 = game.current;
      setHud({ score: now2.score, lines: now2.lines, level: now2.level });
      if (now2.status === "over" && !overHandled.current) { overHandled.current = true; play("over"); submitBest(now2.score); }
      draw();
      frame = requestAnimationFrame(loop);
    };

    draw(); // show the first frame straight away, before the loop starts

    // Only run while on screen, and pause if the window loses focus mid-game.
    const visibility = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(frame);
      if (entry.isIntersecting) { last = performance.now(); frame = requestAnimationFrame(loop); }
    });
    visibility.observe(canvas);
    const onBlur = () => { if (game.current.status === "playing") { paused.current = true; setIsPaused(true); } };
    window.addEventListener("blur", onBlur);
    return () => { cancelAnimationFrame(frame); visibility.disconnect(); window.removeEventListener("blur", onBlur); };
  }, [submitBest]);

  return (
    <div className="gameWrap">
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        className="gameCanvas tetris"
        tabIndex={0}
        data-cursor="play"
        aria-label="Tetris game. Arrow keys move and rotate, Space drops, P pauses."
        onKeyDown={(e) => {
          const action = KEYS[e.key];
          if (action) { e.preventDefault(); handle(action); }
          else if (e.key === "p" || e.key === "P") togglePause();
          else if (e.key === "Enter" && game.current.status === "over") restart();
        }}
        onPointerUp={tap}
      />
      <div className="hud">
        <span>Score <b>{hud.score}</b></span>
        <span>Lines <b>{hud.lines}</b></span>
        <span>Level <b>{hud.level}</b></span>
        <span>Best <b>{best}</b></span>
      </div>
      <div className="hud">
        <button type="button" className="btn small" onClick={togglePause} disabled={game.current.status !== "playing"}>{isPaused ? "Resume" : "Pause"}</button>
        <button type="button" className="btn small" onClick={restart}>Restart</button>
      </div>
      <div className="touchPad">
        <button type="button" className="btn" aria-label="Move left" onClick={() => handle("left")}>◀</button>
        <button type="button" className="btn" aria-label="Rotate" onClick={() => handle("rotate")}>⟳</button>
        <button type="button" className="btn" aria-label="Move right" onClick={() => handle("right")}>▶</button>
        <button type="button" className="btn" aria-label="Soft drop" onClick={() => handle("down")}>▼</button>
        <button type="button" className="btn" aria-label="Hard drop" onClick={() => handle("drop")}>⤓</button>
      </div>
    </div>
  );
}
