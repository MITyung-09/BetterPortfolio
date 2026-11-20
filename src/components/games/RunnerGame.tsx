"use client";

import { useEffect, useRef, useState } from "react";
import { GROUND, H, PLAYER_W, PLAYER_X, W, jump, newRun, playerHeight, runScore, setDuck, step, type RunnerState } from "@/games/runner/logic";
import { useHighScore } from "@/hooks/useHighScore";
import { play } from "@/lib/sound";

export default function RunnerGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const game = useRef<RunnerState>(newRun());
  const paused = useRef(false);
  const overHandled = useRef(false);
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [best, submitBest] = useHighScore("runnerBest");

  const setPause = (value: boolean) => { paused.current = value; setIsPaused(value); };
  const restart = () => { game.current = newRun(); overHandled.current = false; setScore(0); setPause(false); };
  const togglePause = () => { if (game.current.status === "playing") setPause(!paused.current); };
  const doJump = () => {
    if (game.current.status === "over") { restart(); return; }
    if (paused.current) { setPause(false); return; }
    const before = game.current;
    game.current = jump(before);
    if (game.current.vy < before.vy) play("flap");
  };
  const duck = (on: boolean) => { if (!paused.current) game.current = setDuck(game.current, on); };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    canvas.width = W * 2;
    canvas.height = H * 2;
    ctx.setTransform(2, 0, 0, 2, 0, 0);
    let frame = 0, last = performance.now(), acc = 0, lastHundred = 0;
    const FRAME_MS = 1000 / 60;

    const label = (text: string, y: number, size: number, color = "#f1e6dc") => {
      ctx.fillStyle = color; ctx.font = `bold ${size}px sans-serif`; ctx.textAlign = "center"; ctx.fillText(text, W / 2, y);
    };
    const draw = () => {
      const s = game.current;
      const sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, "#12060a"); sky.addColorStop(1, "#2a0d0d");
      ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "rgba(241,230,220,0.4)";
      for (let i = 0; i < 18; i++) ctx.fillRect(((i * 97 - s.distance * 0.2) % W + W) % W, (i * 31) % 110 + 10, 2, 2); // slow stars
      ctx.strokeStyle = "#5a2a2a"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, GROUND); ctx.lineTo(W, GROUND); ctx.stroke();
      ctx.fillStyle = "#5a2a2a";
      for (let i = 0; i < 24; i++) ctx.fillRect(((i * 53 - s.distance) % W + W) % W, GROUND + 8 + (i % 3) * 8, 14, 2); // ground specks

      for (const o of s.obstacles) {
        if (o.kind === "spike") {
          ctx.fillStyle = "#c92a2a";
          ctx.beginPath(); ctx.moveTo(o.x, o.y + o.h); ctx.lineTo(o.x + o.w / 2, o.y); ctx.lineTo(o.x + o.w, o.y + o.h); ctx.fill();
        } else {
          const flap = Math.floor(s.distance / 12) % 2 === 0 ? -8 : 6;
          ctx.fillStyle = "#ff8a3c";
          ctx.beginPath(); ctx.moveTo(o.x, o.y + o.h / 2); ctx.lineTo(o.x + o.w / 2, o.y + o.h / 2 + flap); ctx.lineTo(o.x + o.w, o.y + o.h / 2); ctx.lineTo(o.x + o.w / 2, o.y + o.h); ctx.fill();
        }
      }
      const h = playerHeight(s);
      ctx.fillStyle = "#ffd166"; ctx.beginPath(); ctx.roundRect(PLAYER_X, s.y, PLAYER_W, h - 6, 6); ctx.fill();
      ctx.fillStyle = "#12060a"; ctx.fillRect(PLAYER_X + PLAYER_W - 9, s.y + 6, 4, 4); // eye
      const stride = Math.floor(s.distance / 14) % 2 === 0; // two little legs, swapping while running
      ctx.fillStyle = "#ff5a2b";
      ctx.fillRect(PLAYER_X + 5, s.y + h - 6, 6, stride || s.y + h < GROUND ? 6 : 3);
      ctx.fillRect(PLAYER_X + PLAYER_W - 11, s.y + h - 6, 6, stride && s.y + h >= GROUND ? 3 : 6);

      ctx.fillStyle = "#f1e6dc"; ctx.font = "bold 18px sans-serif"; ctx.textAlign = "right"; ctx.fillText(String(runScore(s)).padStart(5, "0"), W - 14, 26);
      if (s.status === "ready") { label("ENDLESS RUNNER", 70, 26, "#ff8a3c"); label("Space / tap to jump, hold Down to duck", 100, 14); }
      if (paused.current && s.status === "playing") { ctx.fillStyle = "rgba(10,4,5,0.6)"; ctx.fillRect(0, 0, W, H); label("PAUSED", 100, 26); }
      if (s.status === "over") { ctx.fillStyle = "rgba(10,4,5,0.65)"; ctx.fillRect(0, 0, W, H); label("GAME OVER", 80, 28, "#ff5a5a"); label("Tap, Space or Enter to retry", 112, 14, "#ffd166"); }
    };
    const loop = (now: number) => {
      acc += Math.min(now - last, 100);
      last = now;
      while (acc >= FRAME_MS) { acc -= FRAME_MS; if (!paused.current) game.current = step(game.current); }
      const s = game.current;
      const points = runScore(s);
      setScore(points);
      if (Math.floor(points / 100) > lastHundred) { lastHundred = Math.floor(points / 100); play("eat"); }
      if (s.status === "ready") lastHundred = 0;
      if (s.status === "over" && !overHandled.current) { overHandled.current = true; play("over"); submitBest(points); }
      draw();
      frame = requestAnimationFrame(loop);
    };

    draw(); // show the first frame straight away, before the loop starts

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
    <div className="gameWrap wide">
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        className="gameCanvas wideCanvas"
        tabIndex={0}
        data-cursor="play"
        aria-label="Endless runner. Space or tap to jump, Down arrow to duck."
        onKeyDown={(e) => {
          if (e.key === " " || e.key === "ArrowUp" || e.key === "w" || e.key === "W") { e.preventDefault(); doJump(); }
          else if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") { e.preventDefault(); duck(true); }
          else if (e.key === "p" || e.key === "P") togglePause();
          else if (e.key === "Enter" && game.current.status === "over") restart();
        }}
        onKeyUp={(e) => { if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") duck(false); }}
        onPointerDown={doJump}
      />
      <div className="hud">
        <span>Score <b>{score}</b></span>
        <span>Best <b>{best}</b></span>
        <button type="button" className="btn small" onClick={togglePause} disabled={game.current.status !== "playing"}>{isPaused ? "Resume" : "Pause"}</button>
        <button type="button" className="btn small" onClick={restart}>Restart</button>
      </div>
      <div className="touchPad">
        <button type="button" className="btn" onPointerDown={doJump}>Jump</button>
        <button type="button" className="btn" onPointerDown={() => duck(true)} onPointerUp={() => duck(false)} onPointerLeave={() => duck(false)} onPointerCancel={() => duck(false)}>Duck (hold)</button>
      </div>
    </div>
  );
}
