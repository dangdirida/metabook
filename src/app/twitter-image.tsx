import { ImageResponse } from "next/og";

export const alt = "OGQ";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
          position: "relative",
          fontFamily: "sans-serif",
        }}
      >
        {/* 별 장식들 */}
        {[
          { t: 80, l: 200, s: 14 },
          { t: 100, l: 500, s: 10 },
          { t: 60, l: 750, s: 16 },
          { t: 110, l: 950, s: 12 },
          { t: 150, l: 350, s: 8 },
          { t: 70, l: 1050, s: 10 },
          { t: 130, l: 150, s: 10 },
          { t: 90, l: 600, s: 14 },
        ].map((star, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: star.t,
              left: star.l,
              fontSize: star.s,
              color: "rgba(255,255,255,0.5)",
              display: "flex",
            }}
          >
            *
          </div>
        ))}

        {/* 작은 점 별 */}
        {[
          { t: 50, l: 300, s: 3 },
          { t: 140, l: 450, s: 2 },
          { t: 70, l: 850, s: 4 },
          { t: 160, l: 700, s: 2 },
          { t: 120, l: 1100, s: 3 },
          { t: 180, l: 250, s: 2 },
          { t: 500, l: 150, s: 3 },
          { t: 520, l: 400, s: 2 },
          { t: 480, l: 900, s: 3 },
          { t: 540, l: 1050, s: 2 },
        ].map((dot, i) => (
          <div
            key={`d${i}`}
            style={{
              position: "absolute",
              top: dot.t,
              left: dot.l,
              width: dot.s,
              height: dot.s,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.4)",
              display: "flex",
            }}
          />
        ))}

        {/* 빛 효과 */}
        <div
          style={{
            position: "absolute",
            top: 180,
            left: 400,
            width: 400,
            height: 250,
            borderRadius: "50%",
            background: "rgba(50, 210, 157, 0.06)",
            display: "flex",
          }}
        />

        {/* 로고 */}
        <div
          style={{
            display: "flex",
            fontSize: 72,
            fontWeight: 800,
            color: "white",
            letterSpacing: "-1px",
          }}
        >
          OGQ
        </div>

        {/* 슬로건 */}
        <div
          style={{
            fontSize: 24,
            color: "rgba(255, 255, 255, 0.55)",
            marginTop: 16,
            display: "flex",
          }}
        >
          Interactive Reading Platform
        </div>

        {/* 도메인 */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            fontSize: 18,
            color: "#32d29d",
            display: "flex",
          }}
        >
          metabook-dangdirida.vercel.app
        </div>
      </div>
    ),
    { ...size }
  );
}
