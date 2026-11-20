// Pure logic for the dot figure (build the dots, move them). No React in here.
// NOTE: this file must not be named dotFigure.ts: on Windows/macOS that clashes with DotFigure.tsx.

export const FIGURE_W = 160;
export const FIGURE_H = 160;

export type Dot = {
  hx: number; hy: number; // home spot, in figure units (0..160, 0..160)
  x: number; y: number;   // where the dot is on screen right now (px)
  vx: number; vy: number; // current speed
};

export type Pointer = { x: number; y: number; active: boolean };
export type Layout = { ox: number; oy: number; scale: number };

function line(g: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) {
  g.beginPath();
  g.moveTo(x1, y1);
  g.lineTo(x2, y2);
  g.stroke();
}

// Draw the sigil on a hidden canvas, then turn every 3rd filled pixel into a dot.
export function makeFigureDots(): Dot[] {
  const c = document.createElement("canvas");
  c.width = FIGURE_W;
  c.height = FIGURE_H;
  const g = c.getContext("2d");
  if (!g) return [];

  g.fillStyle = "#000";
  g.strokeStyle = "#000";
  g.lineCap = "round";
  // My own sigil: a ring, a cup inside it, a stem and a seed dot above.
  g.lineWidth = 10;
  g.beginPath(); g.arc(80, 80, 62, 0, Math.PI * 2); g.stroke();
  g.lineWidth = 12;
  g.beginPath(); g.arc(80, 88, 34, 0.1 * Math.PI, 0.9 * Math.PI); g.stroke();
  g.lineWidth = 10;
  line(g, 80, 48, 80, 122);
  g.beginPath(); g.arc(80, 34, 7, 0, Math.PI * 2); g.fill();

  const pixels = g.getImageData(0, 0, FIGURE_W, FIGURE_H).data;
  const dots: Dot[] = [];
  for (let y = 0; y < FIGURE_H; y += 3) {
    for (let x = 0; x < FIGURE_W; x += 3) {
      if (pixels[(y * FIGURE_W + x) * 4 + 3] > 128) {
        // small random offset so it doesn't look like a perfect grid
        dots.push({ hx: x + Math.random() * 1.6 - 0.8, hy: y + Math.random() * 1.6 - 0.8, x: 0, y: 0, vx: 0, vy: 0 });
      }
    }
  }
  return dots;
}

// Turn any image the visitor-owner supplies (e.g. /sigil.png) into dots. Non-white, non-transparent pixels become dots.
export function loadImageDots(src: string): Promise<Dot[] | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onerror = () => resolve(null);
    img.onload = () => {
      const c = document.createElement("canvas");
      const S = 2; // sample at 2x so thin strokes keep their shape
      const cw = FIGURE_W * S, ch = FIGURE_H * S;
      c.width = cw;
      c.height = ch;
      const g = c.getContext("2d");
      if (!g) return resolve(null);
      g.fillStyle = "#fff";
      g.fillRect(0, 0, cw, ch);
      const fit = Math.min(cw / img.width, ch / img.height);
      const w = img.width * fit, h = img.height * fit;
      g.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
      const px = g.getImageData(0, 0, cw, ch).data;
      const dots: Dot[] = [];
      for (let y = 0; y < ch; y += 2) {
        for (let x = 0; x < cw; x += 2) {
          const i = (y * cw + x) * 4;
          if (px[i + 3] > 128 && (px[i] + px[i + 1] + px[i + 2]) / 3 < 200) {
            dots.push({ hx: x / S + Math.random() * 0.8 - 0.4, hy: y / S + Math.random() * 0.8 - 0.4, x: 0, y: 0, vx: 0, vy: 0 });
          }
        }
      }
      resolve(dots.length > 50 ? dots : null);
    };
    img.src = src;
  });
}

export function getLayout(width: number, height: number): Layout {
  const scale = Math.min(width / FIGURE_W, height / FIGURE_H) * 0.92;
  return { ox: (width - FIGURE_W * scale) / 2, oy: (height - FIGURE_H * scale) / 2, scale };
}

// Where a dot wants to be: its home spot, with a slow breathing pulse and a tiny bob.
function target(d: Dot, l: Layout, time: number) {
  const pulse = 1 + Math.sin(time * 1.3) * 0.015;
  const cx = FIGURE_W / 2, cy = FIGURE_H / 2;
  const bob = Math.sin(time * 1.6 + d.hx * 0.05) * 1.2;
  return {
    tx: l.ox + (cx + (d.hx - cx) * pulse) * l.scale,
    ty: l.oy + (cy + (d.hy - cy) * pulse) * l.scale + bob,
  };
}

export function placeAtHome(dots: Dot[], l: Layout) {
  for (const d of dots) {
    const { tx, ty } = target(d, l, 0);
    d.x = tx; d.y = ty; d.vx = 0; d.vy = 0;
  }
}

export function scatter(dots: Dot[], width: number, height: number) {
  for (const d of dots) {
    d.x = Math.random() * width;
    d.y = Math.random() * height;
  }
}

// One animation step: spring back home, get pushed away by the pointer.
export function stepDots(dots: Dot[], l: Layout, time: number, pointer: Pointer, radius: number) {
  for (const d of dots) {
    const { tx, ty } = target(d, l, time);
    d.vx += (tx - d.x) * 0.06;
    d.vy += (ty - d.y) * 0.06;

    if (pointer.active) {
      const dx = d.x - pointer.x;
      const dy = d.y - pointer.y;
      const dist = Math.hypot(dx, dy) || 1;
      if (dist < radius) {
        const push = (1 - dist / radius) ** 2 * 6;
        d.vx += (dx / dist) * push;
        d.vy += (dy / dist) * push;
      }
    }

    d.vx *= 0.86;
    d.vy *= 0.86;
    d.x += d.vx;
    d.y += d.vy;
  }
}

// A click or tap blasts nearby dots outward.
export function burst(dots: Dot[], x: number, y: number, radius: number) {
  for (const d of dots) {
    const dx = d.x - x;
    const dy = d.y - y;
    const dist = Math.hypot(dx, dy) || 1;
    if (dist < radius) {
      const power = (1 - dist / radius) * 22;
      d.vx += (dx / dist) * power;
      d.vy += (dy / dist) * power;
    }
  }
}
