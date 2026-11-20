import { useSyncExternalStore } from "react";

// Tiny sound effects made with the Web Audio API (no audio files). One mute switch for every game.
let audio: AudioContext | null = null;
let muted = false;
let loaded = false;
const listeners = new Set<() => void>();

export function isMuted(): boolean {
  if (!loaded && typeof window !== "undefined") {
    loaded = true;
    try {
      muted = localStorage.getItem("arcadeMuted") === "1";
    } catch {
      console.warn("Could not read the sound setting (storage blocked).");
    }
  }
  return muted;
}

export function setMuted(value: boolean) {
  muted = value;
  loaded = true;
  try {
    localStorage.setItem("arcadeMuted", value ? "1" : "0");
  } catch {
    console.warn("Could not save the sound setting.");
  }
  listeners.forEach((l) => l());
}

export function useMuted(): boolean {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => { listeners.delete(cb); }; },
    isMuted,
    () => false,
  );
}

function tone(freq: number, ms: number, type: OscillatorType = "square", volume = 0.04, delay = 0) {
  if (isMuted()) return;
  const AudioCtor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtor) return;
  audio ??= new AudioCtor();
  if (audio.state === "suspended") void audio.resume();
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  const start = audio.currentTime + delay;
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(volume, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + ms / 1000);
  osc.connect(gain).connect(audio.destination);
  osc.start(start);
  osc.stop(start + ms / 1000);
}

const sounds = {
  click: () => tone(420, 40),
  move: () => tone(240, 35, "triangle", 0.03),
  eat: () => { tone(660, 70); tone(880, 80, "square", 0.04, 0.07); },
  flap: () => tone(520, 60),
  merge: () => { tone(520, 80, "triangle"); tone(780, 90, "triangle", 0.04, 0.07); },
  hit: () => tone(150, 150, "sawtooth"),
  over: () => { tone(260, 180, "sawtooth"); tone(150, 320, "sawtooth", 0.05, 0.18); },
  win: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 120, "triangle", 0.04, i * 0.1)),
};

export type Sfx = keyof typeof sounds;
export const play = (name: Sfx) => sounds[name]();
