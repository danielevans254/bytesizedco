import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Byte Sized Co. · Your world, simplified.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  const accent = "#6BFFA8";
  const ink = "#04130A";
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: "#08090B",
          backgroundImage:
            "radial-gradient(circle at 85% 0%, rgba(107,255,168,0.10), transparent 55%), radial-gradient(circle at 0% 100%, rgba(107,255,168,0.16), transparent 55%)",
          color: "#F4F6F9",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* top row: mark + wordmark + pill */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 14,
                background: accent,
                color: ink,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 38,
                fontWeight: 800,
                marginRight: 22,
              }}
            >
              B
            </div>
            <div style={{ display: "flex", fontSize: 30, fontWeight: 700, letterSpacing: -1 }}>
              Byte Sized Co.
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              border: "1px solid rgba(107,255,168,0.35)",
              color: accent,
              borderRadius: 999,
              padding: "12px 22px",
              fontSize: 20,
              letterSpacing: 2,
            }}
          >
            // PRE-LAUNCH · WAITLIST OPEN
          </div>
        </div>

        {/* headline */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 116, fontWeight: 800, letterSpacing: -5, lineHeight: 1 }}>
            Your world,
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 116,
              fontWeight: 800,
              letterSpacing: -5,
              lineHeight: 1.05,
              color: accent,
            }}
          >
            simplified.
          </div>
        </div>

        {/* bottom row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", fontSize: 26, color: "#B9BFC9", maxWidth: 760 }}>
            Small, considered things. Digital, physical, or both.
          </div>
          <div style={{ display: "flex", alignItems: "center", fontSize: 20, color: "#646B77", letterSpacing: 2 }}>
            <div style={{ width: 10, height: 10, borderRadius: 5, background: accent, marginRight: 12 }} />
            DROP 001 LOADING
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
