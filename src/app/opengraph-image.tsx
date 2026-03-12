import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "MetaBook";
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
          background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #064e3b 100%)",
          position: "relative",
        }}
      >
        {/* 별 장식 */}
        {[
          { top: 60, left: 150, size: 4 },
          { top: 120, left: 400, size: 3 },
          { top: 80, left: 700, size: 5 },
          { top: 50, left: 950, size: 3 },
          { top: 180, left: 1050, size: 4 },
          { top: 200, left: 200, size: 3 },
          { top: 500, left: 100, size: 4 },
          { top: 520, left: 350, size: 3 },
          { top: 480, left: 800, size: 5 },
          { top: 550, left: 1000, size: 3 },
          { top: 300, left: 80, size: 2 },
          { top: 350, left: 1100, size: 2 },
        ].map((star, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: star.top,
              left: star.left,
              width: star.size,
              height: star.size,
              borderRadius: "50%",
              background: "white",
              opacity: 0.6,
            }}
          />
        ))}

        {/* 빛 효과 */}
        <div
          style={{
            position: "absolute",
            bottom: 80,
            left: "50%",
            transform: "translateX(-50%)",
            width: 500,
            height: 300,
            background: "radial-gradient(ellipse, rgba(50, 210, 157, 0.15) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "40%",
            left: "50%",
            transform: "translateX(-50%)",
            width: 400,
            height: 200,
            background: "radial-gradient(ellipse, rgba(126, 90, 226, 0.12) 0%, transparent 70%)",
          }}
        />

        {/* 로고 */}
        <div
          style={{
            display: "flex",
            fontSize: 96,
            fontWeight: 800,
            color: "white",
            letterSpacing: "-2px",
          }}
        >
          Meta
          <span style={{ color: "#32d29d" }}>Book</span>
        </div>

        {/* 슬로건 */}
        <div
          style={{
            fontSize: 28,
            color: "rgba(255, 255, 255, 0.6)",
            marginTop: 20,
          }}
        >
          책 속 세계가 살아 움직이는 인터랙티브 독서 플랫폼
        </div>
      </div>
    ),
    { ...size }
  );
}
