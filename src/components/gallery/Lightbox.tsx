"use client";

import { useEffect, useRef } from "react";
import { artCategoryLabels } from "@/data/artworks";
import type { Artwork } from "@/types";

type Props = { items: Artwork[]; index: number; onClose: () => void; onChange: (i: number) => void };

export default function Lightbox({ items, index, onClose, onChange }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const touchStart = useRef(0);
  const item = items[index];

  const prev = () => onChange((index - 1 + items.length) % items.length);
  const next = () => onChange((index + 1) % items.length);

  // On open: focus the close button and stop the page scrolling behind. On close: undo both.
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    closeButton.current?.focus();
    document.body.style.overflow = "hidden";
    delete document.documentElement.dataset.cursor; // reset the cursor ring while the viewer is open
    return () => {
      document.body.style.overflow = "";
      opener?.focus();
    };
  }, []);

  // Keyboard: Esc closes, arrows move. Re-bound every render so it always sees the current index.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "Tab") { // keep keyboard focus inside the viewer
        const buttons = box.current?.querySelectorAll<HTMLElement>("button");
        if (!buttons?.length) return;
        const first = buttons[0], last = buttons[buttons.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const fullscreen = () => {
    box.current?.requestFullscreen?.().catch(() => console.warn("Fullscreen was not allowed."));
  };

  return (
    <div
      ref={box}
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
      onTouchStart={(e) => { touchStart.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        const dx = e.changedTouches[0].clientX - touchStart.current;
        if (Math.abs(dx) > 60) (dx > 0 ? prev : next)();
      }}
    >
      <button ref={closeButton} type="button" className="btn small lbClose" onClick={onClose}>Close ✕</button>
      <button type="button" className="btn small lbFull" onClick={fullscreen}>Fullscreen</button>
      {items.length > 1 && <button type="button" className="lbNav lbPrev" onClick={prev} aria-label="Previous artwork">‹</button>}
      <div className="lbBody">
        <img key={item.src} className="lbImg" src={item.src} alt={item.alt ?? item.title} />
        <aside>
          <p className="lbCount">{index + 1} / {items.length}</p>
          <h3>{item.title}</h3>
          <p className="lbMeta">
            {artCategoryLabels[item.category]}
            {item.medium && ` · ${item.medium}`}
            {item.year && ` · ${item.year}`}
          </p>
          {item.description && <p>{item.description}</p>}
          {item.caption && <p className="lbMeta">{item.caption}</p>}
        </aside>
      </div>
      {items.length > 1 && <button type="button" className="lbNav lbNext" onClick={next} aria-label="Next artwork">›</button>}
    </div>
  );
}
