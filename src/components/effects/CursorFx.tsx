"use client";

import { useEffect, useRef } from "react";

// A soft ring and dot that follow the mouse and grow over links, art and so on.
// Only for devices with a real mouse, and switched off for reduced motion.
// Give any element data-cursor="view" (and data-cursor-label="View") to change how it looks.
export default function CursorFx() {
  const ring = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const ringEl = ring.current, dotEl = dot.current, labelEl = label.current;
    const hasMouse = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!ringEl || !dotEl || !labelEl || !hasMouse || reduced) return;

    const root = document.documentElement;
    let x = 0, y = 0, rx = 0, ry = 0, frame = 0, visible = false;

    const place = () => { ringEl.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`; };
    // The ring eases towards the mouse; the loop stops by itself once it catches up.
    const follow = () => {
      rx += (x - rx) * 0.18;
      ry += (y - ry) * 0.18;
      place();
      frame = Math.abs(x - rx) + Math.abs(y - ry) > 0.2 ? requestAnimationFrame(follow) : 0;
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      x = e.clientX; y = e.clientY;
      dotEl.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
      if (!visible) { visible = true; rx = x; ry = y; place(); root.classList.add("cursorOn"); }
      const target = (e.target as Element | null)?.closest<HTMLElement>("[data-cursor], a, button, summary");
      root.dataset.cursor = target?.dataset.cursor ?? (target ? "link" : "");
      labelEl.textContent = target?.dataset.cursorLabel ?? "";
      if (!frame) frame = requestAnimationFrame(follow);
    };
    const onLeave = () => { visible = false; root.classList.remove("cursorOn"); };
    const onDown = () => root.classList.add("cursorDown");
    const onUp = () => root.classList.remove("cursorDown");

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    document.addEventListener("mouseleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("mouseleave", onLeave);
      root.classList.remove("cursorOn", "cursorDown");
      delete root.dataset.cursor;
    };
  }, []);

  return (
    <>
      <div ref={ring} className="cursorRing" aria-hidden="true"><span ref={label} /></div>
      <div ref={dot} className="cursorDot" aria-hidden="true" />
    </>
  );
}
