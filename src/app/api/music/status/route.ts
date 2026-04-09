import { NextRequest, NextResponse } from "next/server";

const BASE_URL = "https://api.apiframe.pro";

export async function GET(req: NextRequest) {
  const apiKey = process.env.APIFRAME_API_KEY;
  if (!apiKey) return NextResponse.json({ status: "error", error: "APIFRAME_API_KEY 없음" }, { status: 503 });

  const taskId = new URL(req.url).searchParams.get("taskId");
  if (!taskId) return NextResponse.json({ status: "error", error: "taskId required" }, { status: 400 });

  try {
    let data: Record<string, unknown> | null = null;

    // POST /suno-fetch 시도
    const res = await fetch(`${BASE_URL}/suno-fetch`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": apiKey },
      body: JSON.stringify({ task_id: taskId }),
    });

    if (res.ok) {
      data = await res.json();
    } else {
      // GET /task/{taskId} 폴백
      const res2 = await fetch(`${BASE_URL}/task/${taskId}`, {
        headers: { "Authorization": apiKey },
      });
      data = await res2.json();
    }

    console.log("[music/status] Apiframe:", JSON.stringify(data).slice(0, 300));

    const status = (data as Record<string, unknown>)?.status as string | undefined;

    if (status === "finished" || status === "done") {
      const songs = (data as Record<string, unknown>)?.songs as Record<string, unknown>[] | undefined;
      const song = Array.isArray(songs) ? songs[0] : null;
      return NextResponse.json({
        status: "done",
        audioUrl: song?.audio_url,
        imageUrl: song?.image_url || null,
        title: (song?.title as string) || "생성된 음악",
      });
    }

    if (status === "failed" || status === "error") {
      return NextResponse.json({ status: "failed", error: ((data as Record<string, unknown>)?.error as string) || "음악 생성에 실패했어요." });
    }

    return NextResponse.json({ status: "pending", percentage: ((data as Record<string, unknown>)?.percentage as number) || 0 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ status: "error", error: msg }, { status: 500 });
  }
}
