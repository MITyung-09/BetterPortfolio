"use client";

import { useEffect, useRef, useState } from "react";
import { play } from "@/lib/sound";
import { BIRD_R, BIRD_X, GAP, H, PIPE_SPEED, PIPE_W, W, flap, newGame, step, type State } from "@/games/flappy/logic";

type Spark = { x: number; y: number; life: number };
const STARS = Array.from({ length: 28 }, (_, i) => ({ x: (i * 97) % W, y: (i * 53) % (H - 40), r: (i % 3) * 0.5 + 0.6 }));

export default function FlappyGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const game = useRef<State>(newGame());
  const paused = useRef(false);
  const bestRef = useRef(0);
  const [best, setBest] = useState(0);

  useEffect(() => {
    try {
      const saved = Number(localStorage.getItem("emberFlapBest"));
      if (saved) { bestRef.current = saved; setBest(saved); }
    } catch {
      console.warn("Could not read best score (storage blocked).");
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    canvas.width = W * 2; // draw at 2x so it stays sharp when scaled up
    canvas.height = H * 2;
    ctx.setTransform(2, 0, 0, 2, 0, 0);
    let frame = 0, last = performance.now(), acc = 0, overPlayed = false;
    const FRAME_MS = 1000 / 60;
    const sparks: Spark[] = [];

    const saveBest = (score: number) => {
      bestRef.current = score;
      setBest(score);
      try { localStorage.setItem("emberFlapBest", String(score)); } catch { console.warn("Could not save best score."); }
    };

    const centerText = (text: string, y: number, size: number, color = "#f1e6dc") => {
      ctx.fillStyle = color; ctx.font = `bold ${size}px sans-serif`; ctx.textAlign = "center";
      ctx.fillText(text, W / 2, y);
    };

    const draw = () => {
      const s = game.current;
      const sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, "#12060a"); sky.addColorStop(1, "#32100e");
      ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "rgba(241,230,220,0.5)";
      for (const st of STARS) { ctx.beginPath(); ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2); ctx.fill(); }

      for (const p of s.pipes) {
        ctx.fillStyle = "#8f1218";
        ctx.fillRect(p.x, 0, PIPE_W, p.gapY);
        ctx.fillRect(p.x, p.gapY + GAP, PIPE_W, H - p.gapY - GAP);
        ctx.fillStyle = "#c92a2a"; // lighter caps
        ctx.fillRect(p.x - 4, p.gapY - 18, PIPE_W + 8, 18);
        ctx.fillRect(p.x - 4, p.gapY + GAP, PIPE_W + 8, 18);
      }
      ctx.fillStyle = "#3a1212"; ctx.fillRect(0, H - 10, W, 10);

      for (const sp of sparks) { // ember trail
        ctx.globalAlpha = sp.life;
        ctx.fillStyle = "#ff8a3c";
        ctx.beginPath(); ctx.arc(sp.x, sp.y, 4 * sp.life, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;

      ctx.save(); // bird, tilting with its speed
      ctx.translate(BIRD_X, s.y);
      ctx.rotate(Math.max(-0.5, Math.min(1, s.vy * 0.07)));
      ctx.fillStyle = "#ff8a3c"; ctx.beginPath(); ctx.arc(0, 0, BIRD_R, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#ffd166"; ctx.beginPath(); ctx.ellipse(-3, 3, 6, 4, -0.4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(5, -4, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#12060a"; ctx.beginPath(); ctx.arc(6, -4, 2, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#c92a2a"; ctx.beginPath(); ctx.moveTo(10, 0); ctx.lineTo(18, 3); ctx.lineTo(10, 6); ctx.fill();
      ctx.restore();

      if (s.status !== "ready") centerText(String(s.score), 64, 44);
      if (s.status === "ready") { centerText("EMBER FLAP", H / 2 - 70, 34, "#ff8a3c"); centerText("Tap, click or press Space", H / 2 + 80, 17); }
      if (s.status === "over") {
        ctx.fillStyle = "rgba(10,4,5,0.65)"; ctx.fillRect(0, 0, W, H);
        centerText("GAME OVER", H / 2 - 30, 34, "#ff5a5a");
        centerText(`Score ${s.score}  ·  Best ${bestRef.current}`, H / 2 + 8, 18);
        centerText("Tap to try again", H / 2 + 40, 16, "#ffd166");
      }
      if (paused.current && s.status === "playing") {
        ctx.fillStyle = "rgba(10,4,5,0.65)"; ctx.fillRect(0, 0, W, H);
        centerText("PAUSED", H / 2, 30);
        centerText("Tap or press Space to resume", H / 2 + 30, 15);
      }
    };

    const loop = (now: number) => {
      acc += Math.min(now - last, 100);
      last = now;
      while (acc >= FRAME_MS) {
        acc -= FRAME_MS;
        if (paused.current) continue;
        game.current = step(game.current);
        if (game.current.status === "playing") sparks.push({ x: BIRD_X - 6, y: game.current.y, life: 1 });
        for (const sp of sparks) { sp.x -= PIPE_SPEED; sp.life -= 0.05; }
        while (sparks.length && sparks[0].life <= 0) sparks.shift();
      }
      if (game.current.status === "over") {
        if (!overPlayed) { overPlayed = true; play("over"); }
        if (game.current.score > bestRef.current) saveBest(game.current.score);
      } else overPlayed = false;
      draw();
      frame = requestAnimationFrame(loop);
    };

    draw(); // show the first frame straight away, before the loop starts

    // Run only while on screen, and pause if the window loses focus mid-game.
    const visibility = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(frame);
      if (entry.isIntersecting) { last = performance.now(); frame = requestAnimationFrame(loop); }
    });
    visibility.observe(canvas);
    const onBlur = () => { if (game.current.status === "playing") paused.current = true; };
    window.addEventListener("blur", onBlur);
    return () => { cancelAnimationFrame(frame); visibility.disconnect(); window.removeEventListener("blur", onBlur); };
  }, []);

  const act = () => {
    if (paused.current) { paused.current = false; return; }
    if (game.current.status !== "over") play("flap");
    game.current = flap(game.current.status === "over" ? newGame() : game.current);
  };
  const restart = () => { paused.current = false; game.current = newGame(); };

  return (
    <div className="gameWrap">
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        className="gameCanvas"
        tabIndex={0}
        data-cursor="play"
        aria-label="Ember Flap game. Press Space or tap to flap."
        onPointerDown={act}
        onKeyDown={(e) => { if (e.key === " " || e.key === "ArrowUp") { e.preventDefault(); act(); } }}
      />
      <div className="hud">
        <span>Best <b>{best}</b></span>
        <button type="button" className="btn small" onClick={restart}>Restart</button>
      </div>
    </div>
  );
}
