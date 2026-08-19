import { ImageResponse } from "next/og";

export const alt = "Luxe Roam — Luxury Safaris & Curated Travel";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background:
          "linear-gradient(135deg, #0f172a 0%, #1e293b 55%, #b08d57 100%)",
        padding: 72,
        color: "white",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: 30,
          letterSpacing: 6,
          opacity: 0.75,
        }}
      >
        LUXE ROAM
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ fontSize: 68, fontWeight: 600, lineHeight: 1.1 }}>
          Luxury safaris &amp; curated travel
        </div>
        <div style={{ fontSize: 30, opacity: 0.8 }}>
          Kenya · East Africa · Europe · USA · Asia · Australia
        </div>
      </div>
    </div>,
    size,
  );
}
