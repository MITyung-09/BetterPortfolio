"use client";

import { useEffect, useRef, useState } from "react";
import { addTile, canMove, emptyBoard, hasWon, move, type Board, type Dir } from "@/games/game2048/logic";
import { useHighScore } from "@/hooks/useHighScore";
import { play } from "@/lib/sound";
import DPad from "./DPad";

const KEYS: Record<string, Dir> = {
  ArrowUp: "up", w: "up", W: "up", ArrowDown: "down", s: "down", S: "down",
  ArrowLeft: "left", a: "left", A: "left", ArrowRight: "right", d: "right", D: "right",
};

function tileStyle(v: number) {
  if (!v) return undefined;
  const level = Math.log2(v);
  return {
    background: `hsl(${(level * 28 + 8) % 360} 62% ${Math.max(36, 70 - level * 3)}%)`,
    color: level < 3 ? "#2b1a17" : "#fff",
    fontSize: v >= 1024 ? "1.1rem" : v >= 128 ? "1.4rem" : "1.8rem",
  };
}

export default function Game2048() {
  const [board, setBoard] = useState<Board>(emptyBoard);
  const [score, setScore] = useState(0);
  const [over, setOver] = useState(false);
  const [won, setWon] = useState(false);
  const [best, submitBest] = useHighScore("game2048Best");
  const swipeStart = useRef<{ x: number; y: number } | null>(null);

  const newGame = () => { setBoard(addTile(addTile(emptyBoard()))); setScore(0); setOver(false); setWon(false); };
  // Deal the first two tiles after mounting so the server and browser agree.
  useEffect(newGame, []);

  const slide = (dir: Dir) => {
    if (over) return;
    const result = move(board, dir);
    if (!result.moved) return;
    const next = addTile(result.board);
    const total = score + result.gained;
    setBoard(next);
    setScore(total);
    submitBest(total);
    play(result.gained ? "merge" : "move");
    if (!won && hasWon(next)) { setWon(true); play("win"); }
    if (!canMove(next)) { setOver(true); play("over"); }
  };

  return (
    <div className="gameWrap" tabIndex={0} aria-label="2048 game. Use the arrow keys or swipe to slide the tiles."
      onKeyDown={(e) => { const dir = KEYS[e.key]; if (dir) { e.preventDefault(); slide(dir); } }}>
      <div
        className="board2048"
        data-cursor="play"
        onPointerDown={(e) => { swipeStart.current = { x: e.clientX, y: e.clientY }; }}
        onPointerUp={(e) => {
          const start = swipeStart.current;
          swipeStart.current = null;
          if (!start) return;
          const dx = e.clientX - start.x, dy = e.clientY - start.y;
          if (Math.max(Math.abs(dx), Math.abs(dy)) > 24) slide(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up"));
        }}
      >
        {board.flat().map((v, i) => <div key={i} className="tile" style={tileStyle(v)}>{v || ""}</div>)}
      </div>
      <p className="win" role="status">{over ? "No moves left. Game over!" : won ? "You made 2048! Keep going if you like." : ""}</p>
      <div className="hud">
        <span>Score <b>{score}</b></span>
        <span>Best <b>{best}</b></span>
        <button type="button" className="btn small" onClick={newGame}>New game</button>
      </div>
      <DPad onPress={slide} />
    </div>
  );
}
