import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site";

export const alt = `${siteConfig.name} — ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Site-wide social card. Per-entry cards live beside each [slug] route. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#fbfaf7",
          color: "#1a1917",
          padding: "72px 80px",
        }}
      >
        <div style={{ display: "flex", fontSize: 30, letterSpacing: 6, color: "#8b877e" }}>
          CONVOKE.SPACE
        </div>
        <div style={{ display: "flex", fontSize: 66, lineHeight: 1.15, maxWidth: 900 }}>
          {siteConfig.tagline}
        </div>
        <div style={{ display: "flex", fontSize: 26, color: "#5c5952" }}>
          Writing · Projects · Gatherings
        </div>
      </div>
    ),
    size,
  );
}
