import { NextRequest, NextResponse } from "next/server";

const BASE_URL = "https://api.apiframe.pro";

export async function GET(req: NextRequest) {
  const apiKey = process.env.APIFRAME_API_KEY;
  if (!apiKey) return NextResponse.json({ status: "error", error: "APIFRAME_API_KEY 없음" }, { status: 503 });

  const taskId = new URL(req.url).searchParams.get("taskId");
  if (!taskId) return NextResponse.json({ status: "error", error: "taskId required" }, { status: 400 });

  try {
    const res = await fetch(`${BASE_URL}/fetch/${taskId}`, {
      headers: { "Authorization": apiKey },
    });
    const data = await res.json();
    console.log("[music/status] Apiframe:", JSON.stringify(data).slice(0, 300));

    const status = data?.status;

    if (status === "finished") {
      const song = data?.songs?.[0];
      return NextResponse.json({
        status: "done",
        audioUrl: song?.audio_url,
        imageUrl: song?.image_url || null,
        title: song?.title || "생성된 음악",
      });
    }

    if (status === "failed" || status === "error") {
      return NextResponse.json({ status: "failed", error: data?.error || "음악 생성에 실패했어요." });
    }

    return NextResponse.json({ status: "pending", percentage: data?.percentage || 0 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ status: "error", error: msg }, { status: 500 });
  }
}
