import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");
  const format = searchParams.get("format") || "png";

  if (!url) {
    return NextResponse.json({ error: "url parameter required" }, { status: 400 });
  }

  try {
    if (format === "svg") {
      const svg = await QRCode.toString(url, { type: "svg", margin: 2 });
      return new NextResponse(svg, {
        headers: { "Content-Type": "image/svg+xml" },
      });
    }

    const dataUrl = await QRCode.toDataURL(url, {
      width: 512,
      margin: 2,
      color: { dark: "#212529", light: "#FFFFFF" },
    });

    // data URL에서 base64 추출 후 바이너리로 변환
    const base64 = dataUrl.split(",")[1];
    const buffer = Buffer.from(base64, "base64");

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `inline; filename="qr-${Date.now()}.png"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "QR 생성 실패" }, { status: 500 });
  }
}
