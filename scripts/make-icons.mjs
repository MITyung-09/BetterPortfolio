// Turns your logo into the tab icon files Next.js uses.
// Usage:  npm run icons -- path/to/your-logo.png
// Writes src/app/favicon.ico, icon.png and apple-icon.png, and removes the placeholder icon.svg.
import { existsSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const input = process.argv[2];
const outDir = process.argv[3] ?? "src/app";
if (!input || !existsSync(input)) {
  console.error("Usage: npm run icons -- path/to/your-logo.png");
  process.exit(1);
}

// Fit the logo into a square canvas with a little breathing room.
async function square(size, background = { r: 0, g: 0, b: 0, alpha: 0 }) {
  const inner = Math.round(size * 0.8);
  const logo = await sharp(input).resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background } })
    .composite([{ input: logo, gravity: "centre" }])
    .png()
    .toBuffer();
}

// An .ico file is a small header plus the PNG images one after another.
function makeIco(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = 6 + 16 * images.length;
  const entries = images.map(({ size, data }) => {
    const e = Buffer.alloc(16);
    e.writeUInt8(size, 0);
    e.writeUInt8(size, 1);
    e.writeUInt16LE(1, 4);
    e.writeUInt16LE(32, 6);
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += data.length;
    return e;
  });
  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)]);
}

const icoSizes = [16, 32, 48];
const ico = makeIco(await Promise.all(icoSizes.map(async (size) => ({ size, data: await square(size) }))));
writeFileSync(path.join(outDir, "favicon.ico"), ico);
writeFileSync(path.join(outDir, "icon.png"), await square(192));
// iOS fills transparent areas with black, so the Apple icon gets a solid dark background.
writeFileSync(path.join(outDir, "apple-icon.png"), await square(180, { r: 11, g: 6, b: 6, alpha: 1 }));
rmSync(path.join(outDir, "icon.svg"), { force: true });
console.log(`Wrote favicon.ico, icon.png and apple-icon.png to ${outDir}`);
