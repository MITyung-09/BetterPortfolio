"use client";

import { useEffect, useRef, useState } from "react";
import { play } from "@/lib/sound";

const SYMBOLS = ["▲", "●", "■", "◆", "★", "☾", "✦", "☀"];
type Card = { id: number; sym: string; matched: boolean };

function deal(): Card[] {
  const cards = [...SYMBOLS, ...SYMBOLS].map((sym, id) => ({ id, sym, matched: false }));
  for (let i = cards.length - 1; i > 0; i--) { // Fisher-Yates shuffle
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}

export default function MemoryGame() {
  const [cards, setCards] = useState<Card[]>([]);
  const [open, setOpen] = useState<number[]>([]); // indexes of face-up, unmatched cards
  const [moves, setMoves] = useState(0);
  const [best, setBest] = useState<number | null>(null);
  const timer = useRef<number | undefined>(undefined);

  // Shuffle after mount so the server and browser don't disagree about the order.
  useEffect(() => {
    setCards(deal());
    try {
      const saved = Number(localStorage.getItem("memoryBest"));
      if (saved) setBest(saved);
    } catch {
      console.warn("Could not read best score (storage blocked).");
    }
    return () => window.clearTimeout(timer.current);
  }, []);

  const matchedCount = cards.filter((c) => c.matched).length / 2;
  const won = cards.length > 0 && matchedCount === SYMBOLS.length;

  function restart() {
    window.clearTimeout(timer.current);
    setCards(deal()); setOpen([]); setMoves(0);
  }

  function finish(finalMoves: number) {
    if (best === null || finalMoves < best) {
      setBest(finalMoves);
      try { localStorage.setItem("memoryBest", String(finalMoves)); } catch { console.warn("Could not save best score."); }
    }
  }

  function flip(i: number) {
    if (open.length === 2 || open.includes(i) || cards[i].matched) return;
    play("click");
    const next = [...open, i];
    setOpen(next);
    if (next.length < 2) return;
    const nowMoves = moves + 1;
    setMoves(nowMoves);
    const [a, b] = next;
    if (cards[a].sym === cards[b].sym) {
      setCards((cs) => cs.map((c, k) => (k === a || k === b ? { ...c, matched: true } : c)));
      setOpen([]);
      play("merge");
      if (matchedCount + 1 === SYMBOLS.length) { play("win"); finish(nowMoves); }
    } else {
      timer.current = window.setTimeout(() => setOpen([]), 750);
    }
  }

  return (
    <div className="gameWrap">
      <div className="memGrid">
        {cards.map((c, i) => {
          const up = c.matched || open.includes(i);
          return (
            <button key={c.id} type="button" className={`memCard ${up ? "up" : ""} ${c.matched ? "done" : ""}`} onClick={() => flip(i)} aria-label={up ? c.sym : "Hidden card"}>
              <span className="memInner">
                <span className="memFace memFront">?</span>
                <span className="memFace memBack">{c.sym}</span>
              </span>
            </button>
          );
        })}
      </div>
      {won && <p className="win" role="status">All pairs found in {moves} moves!</p>}
      <div className="hud">
        <span>Moves <b>{moves}</b></span>
        <span>Pairs <b>{matchedCount}/{SYMBOLS.length}</b></span>
        <span>Best <b>{best ?? "-"}</b></span>
        <button type="button" className="btn small" onClick={restart}>New game</button>
      </div>
    </div>
  );
}
