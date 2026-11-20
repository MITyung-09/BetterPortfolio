"use client";

import { useEffect, useRef, useState } from "react";
import { play } from "@/lib/sound";

type Phase = "idle" | "waiting" | "go" | "early" | "result";

export default function ReactionGame() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [ms, setMs] = useState(0);
  const [history, setHistory] = useState<number[]>([]); // last 5 results
  const timer = useRef<number | undefined>(undefined);
  const startedAt = useRef(0);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  function press() {
    if (phase === "waiting") {
      window.clearTimeout(timer.current);
      play("hit");
      setPhase("early");
    } else if (phase === "go") {
      play("click");
      const time = Math.round(performance.now() - startedAt.current);
      setMs(time);
      setHistory((h) => [time, ...h].slice(0, 5));
      setPhase("result");
    } else {
      setPhase("waiting");
      timer.current = window.setTimeout(() => {
        startedAt.current = performance.now();
        setPhase("go");
      }, 1500 + Math.random() * 2500);
    }
  }

  const text: Record<Phase, string> = {
    idle: "Click to start",
    waiting: "Wait for green...",
    go: "CLICK NOW!",
    early: "Too early! Click to try again",
    result: `${ms} ms. Click to go again`,
  };
  const best = history.length ? Math.min(...history) : null;
  const avg = history.length ? Math.round(history.reduce((a, b) => a + b, 0) / history.length) : null;

  return (
    <div className="gameWrap">
      <button type="button" className={`reaction ${phase}`} onClick={press} data-cursor="play">{text[phase]}</button>
      <div className="hud">
        <span>Best <b>{best === null ? "-" : `${best} ms`}</b></span>
        <span>Average <b>{avg === null ? "-" : `${avg} ms`}</b></span>
        <span>Last 5 <b>{history.length ? history.join(" · ") : "-"}</b></span>
      </div>
    </div>
  );
}
