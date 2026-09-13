import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = "image/png";

/**
 * One social card layout for every entry type, in both languages.
 *
 * Text-only and typographic on purpose: no fonts to fetch, no images to keep in
 * sync with content. `next/og`'s bundled face covers Latin; Hangul falls back
 * to the renderer's default, so Korean titles are sized more conservatively.
 */
export function entryCard({
  eyebrow,
  title,
  meta,
}: {
  eyebrow: string;
  title: string;
  meta?: string;
}) {
  const hasHangul = /[가-힣]/.test(title);
  const fontSize = hasHangul
    ? title.length > 32
      ? 52
      : 62
    : title.length > 60
      ? 58
      : 70;

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
            fontSize: 28,
            letterSpacing: 6,
            color: "#96351b",
            textTransform: "uppercase",
          }}
        >
          {eyebrow}
        </div>

        <div style={{ display: "flex", fontSize, lineHeight: 1.18, maxWidth: 980 }}>
          {title}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 24,
            color: "#5c5952",
          }}
        >
          <span>convoke.space</span>
          {meta ? <span>{meta}</span> : null}
        </div>
      </div>
    ),
    OG_SIZE,
  );
}
