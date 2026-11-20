import type { Dir } from "@/games/snake/logic";

// On-screen arrows for touch devices. Hidden when a mouse is the main pointer (see .dpad in globals.css).
export default function DPad({ onPress }: { onPress: (dir: Dir) => void }) {
  const button = (dir: Dir, arrow: string, label: string) => (
    <button type="button" className={`btn dpadBtn dpad-${dir}`} aria-label={label} onClick={() => onPress(dir)}>{arrow}</button>
  );
  return (
    <div className="dpad">
      {button("up", "▲", "Up")}
      {button("left", "◀", "Left")}
      {button("down", "▼", "Down")}
      {button("right", "▶", "Right")}
    </div>
  );
}
