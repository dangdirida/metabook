import { NextRequest, NextResponse } from "next/server";

const SUNO_BASE = "https://apibox.erweima.ai";

export async function GET(req: NextRequest) {
  const apiKey = process.env.SUNOAPI_KEY;
  if (!apiKey) return NextResponse.json({ status: "error", error: "SUNOAPI_KEY 없음" }, { status: 503 });

  const taskId = new URL(req.url).searchParams.get("taskId");
  if (!taskId) return NextResponse.json({ status: "error", error: "taskId required" }, { status: 400 });

  try {
    const res = await fetch(`${SUNO_BASE}/api/v1/generate/record-info?taskId=${taskId}`, {
      headers: { "Authorization": `Bearer ${apiKey}` },
    });
    const data = await res.json();
    const status = data?.data?.status;

    if (status === "SUCCESS" || status === "completed") {
      const sunoData = data?.data?.response?.sunoData;
      const first = Array.isArray(sunoData) ? sunoData[0] : null;
      const audioUrl = first?.streamAudioUrl || first?.audioUrl;
      return NextResponse.json({ status: "done", audioUrl, title: first?.title || "생성된 음악", imageUrl: first?.imageUrl || null });
    }
    if (status === "FAILED" || status === "failed") {
      return NextResponse.json({ status: "failed", error: data?.data?.errorMessage || "생성 실패" });
    }
    return NextResponse.json({ status: "pending" });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ status: "error", error: msg }, { status: 500 });
  }
}
