"use client";

import { play, setMuted, useMuted } from "@/lib/sound";

export default function MuteToggle() {
  const muted = useMuted();
  return (
    <button
      type="button"
      className="btn small"
      aria-pressed={muted}
      aria-label={muted ? "Turn game sounds on" : "Mute game sounds"}
      onClick={() => { setMuted(!muted); if (muted) play("click"); }}
    >
      Sound: {muted ? "off" : "on"}
    </button>
  );
}
