import { ImageResponse } from "next/og";

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
          { top: 60, left: 150, s: 4 },
          { top: 120, left: 400, s: 3 },
          { top: 80, left: 700, s: 5 },
          { top: 50, left: 950, s: 3 },
          { top: 180, left: 1050, s: 4 },
          { top: 200, left: 200, s: 3 },
          { top: 500, left: 100, s: 4 },
          { top: 520, left: 350, s: 3 },
          { top: 480, left: 800, s: 5 },
          { top: 550, left: 1000, s: 3 },
          { top: 300, left: 80, s: 2 },
          { top: 350, left: 1100, s: 2 },
        ].map((star, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: star.top,
              left: star.left,
              width: star.s,
              height: star.s,
              borderRadius: "50%",
              background: "white",
              opacity: 0.6,
            }}
          />
        ))}

        {/* 빛 효과 (단색 원형 — Satori는 radial-gradient 미지원) */}
        <div
          style={{
            position: "absolute",
            bottom: 80,
            left: 350,
            width: 500,
            height: 300,
            borderRadius: "50%",
            background: "rgba(50, 210, 157, 0.1)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 200,
            left: 400,
            width: 400,
            height: 200,
            borderRadius: "50%",
            background: "rgba(126, 90, 226, 0.08)",
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

        {/* 슬로건 — Satori 기본 폰트가 한글 미지원이므로 영문 사용 */}
        <div
          style={{
            fontSize: 28,
            color: "rgba(255, 255, 255, 0.6)",
            marginTop: 20,
          }}
        >
          Interactive Reading Platform
        </div>
      </div>
    ),
    { ...size }
  );
}
