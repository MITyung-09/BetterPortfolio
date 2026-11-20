import { useCallback, useEffect, useRef, useState } from "react";

// A high score saved in this browser only (no account needed).
export function useHighScore(key: string) {
  const [best, setBest] = useState(0);
  const bestRef = useRef(0);

  useEffect(() => {
    try {
      const saved = Number(localStorage.getItem(key));
      if (saved) { bestRef.current = saved; setBest(saved); }
    } catch {
      console.warn("Could not read the high score (storage blocked).");
    }
  }, [key]);

  const submit = useCallback((score: number) => {
    if (score <= bestRef.current) return;
    bestRef.current = score;
    setBest(score);
    try {
      localStorage.setItem(key, String(score));
    } catch {
      console.warn("Could not save the high score.");
    }
  }, [key]);

  return [best, submit] as const;
}
