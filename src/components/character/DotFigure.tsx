"use client";

import { useEffect, useRef } from "react";
import { profile } from "@/data/profile";
import { burst, getLayout, loadImageDots, makeFigureDots, placeAtHome, scatter, stepDots, type Layout, type Pointer } from "./figureDots";
import styles from "./DotFigure.module.css";

export default function DotFigure() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dots = makeFigureDots();
    const pointer: Pointer = { x: 0, y: 0, active: false };
    let width = 0, height = 0, layout: Layout = { ox: 0, oy: 0, scale: 1 };
    let colors = { base: "#c8ff3d", hot: "#ff5a7a" };
    let sizeFactor = 1.7; // image shapes use smaller, finer dots
    let frame = 0, startTime = performance.now(), placed = false;

    const readColors = () => {
      const css = getComputedStyle(document.documentElement);
      colors = { base: css.getPropertyValue("--dot").trim() || colors.base, hot: css.getPropertyValue("--dot-hot").trim() || colors.hot };
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      const size = Math.max(1.8, layout.scale * sizeFactor);
      // two passes: calm dots in the base colour, fast-moving dots in the hot colour
      for (const hotPass of [false, true]) {
        ctx.fillStyle = hotPass ? colors.hot : colors.base;
        for (const d of dots) {
          const moving = d.vx * d.vx + d.vy * d.vy > 1.5;
          if (moving === hotPass) ctx.fillRect(d.x - size / 2, d.y - size / 2, size, size);
        }
      }
    };

    const loop = () => {
      const time = (performance.now() - startTime) / 1000;
      stepDots(dots, layout, time, pointer, Math.max(70, layout.scale * 45));
      draw();
      frame = requestAnimationFrame(loop);
    };

    const resize = () => {
      const box = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      width = box.width; height = box.height;
      canvas.width = width * dpr; canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      layout = getLayout(width, height);
      if (!placed) {
        placed = true;
        if (reduced) placeAtHome(dots, layout); else scatter(dots, width, height); // dots fly in on load
      }
      if (reduced) { placeAtHome(dots, layout); draw(); }
    };

    const localPoint = (e: PointerEvent) => {
      const box = canvas.getBoundingClientRect();
      return { x: e.clientX - box.left, y: e.clientY - box.top };
    };
    const onMove = (e: PointerEvent) => { Object.assign(pointer, localPoint(e), { active: true }); };
    const onLeave = () => { pointer.active = false; };
    const onDown = (e: PointerEvent) => {
      const p = localPoint(e);
      burst(dots, p.x, p.y, Math.max(160, layout.scale * 90));
    };

    readColors();
    resize();

    // If profile.sigilImage is set, swap my sigil for that image's shape.
    let cancelled = false;
    if (profile.sigilImage) {
      loadImageDots(profile.sigilImage).then((imageDots) => {
        if (cancelled || !imageDots) return;
        sizeFactor = 0.95;
        dots.splice(0, dots.length, ...imageDots);
        if (reduced) { placeAtHome(dots, layout); draw(); } else scatter(dots, width, height);
      });
    }

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    const themeObserver = new MutationObserver(() => { readColors(); if (reduced) draw(); });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    // With reduced motion we draw one still picture and skip pointer physics and the loop.
    let visibility: IntersectionObserver | undefined;
    if (!reduced) {
      canvas.addEventListener("pointermove", onMove);
      canvas.addEventListener("pointerleave", onLeave);
      canvas.addEventListener("pointercancel", onLeave);
      canvas.addEventListener("pointerup", onLeave);
      canvas.addEventListener("pointerdown", onDown);
      // only animate while the canvas is on screen
      visibility = new IntersectionObserver(([entry]) => {
        cancelAnimationFrame(frame);
        if (entry.isIntersecting) frame = requestAnimationFrame(loop);
      });
      visibility.observe(canvas);
    }

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      themeObserver.disconnect();
      visibility?.disconnect();
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("pointercancel", onLeave);
      canvas.removeEventListener("pointerup", onLeave);
      canvas.removeEventListener("pointerdown", onDown);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={styles.canvas}
      data-cursor="play"
      role="img"
      aria-label="A sigil made of glowing ember dots. Move your pointer near it, or tap it, to scatter the dots."
    />
  );
}
