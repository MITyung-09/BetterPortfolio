import { ImageResponse } from "next/og";

export const alt = "Mityung Rai: software, hardware, art and games";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// The picture shown when the site is shared (WhatsApp, X, Discord, LinkedIn...).
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 90, background: "#0b0606", color: "#f1e6dc" }}>
        <div style={{ fontSize: 124, fontWeight: 800, letterSpacing: -4 }}>Mityung Rai</div>
        <div style={{ fontSize: 40, color: "#a89a94", marginTop: 14 }}>Software · Hardware · Art · Games</div>
        <div style={{ width: 120, height: 6, background: "#ff3b3b", marginTop: 44 }} />
      </div>
    ),
    size,
  );
}
