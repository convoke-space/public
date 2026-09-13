import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/** Wordmark initial. Generated so there is no binary asset to keep in sync. */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1a1917",
          color: "#fbfaf7",
          fontSize: 42,
          fontWeight: 600,
        }}
      >
        C
      </div>
    ),
    size,
  );
}
