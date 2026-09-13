import { ImageResponse } from "next/og";
import { LOCALES, siteConfig } from "../../../site.config";
import { getDictionary } from "@/lib/i18n";

export const alt = `${siteConfig.name} — 한국어 / English`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Card for the locale-neutral gateway: names both editions, favours neither. */
export default function GatewayOpengraphImage() {
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
        <div
          style={{
            display: "flex",
            fontSize: 30,
            letterSpacing: 6,
            color: "#8b877e",
          }}
        >
          CONVOKE.SPACE
        </div>
        <div style={{ display: "flex", fontSize: 64, lineHeight: 1.15, maxWidth: 940 }}>
          {getDictionary("en").tagline}
        </div>
        <div style={{ display: "flex", fontSize: 26, color: "#5c5952" }}>
          {LOCALES.map((locale) => getDictionary(locale).languageName).join("  ·  ")}
        </div>
      </div>
    ),
    size,
  );
}
