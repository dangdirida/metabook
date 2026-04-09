import { NextRequest, NextResponse } from "next/server";

const BASE_URL = "https://api.apiframe.pro";

export async function POST(req: NextRequest) {
  const apiKey = process.env.APIFRAME_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ success: false, error: "APIFRAME_API_KEY가 설정되지 않았어요." }, { status: 503 });
  }

  try {
    const { prompt, style, includeVocals, lyrics, title } = await req.json();

    const sunoBody: Record<string, unknown> = {
      make_instrumental: !includeVocals,
      model: "V4_5",
      webhook_url: "https://metabook-two.vercel.app/api/music/callback",
      webhook_secret: "metabook-secret-2026",
    };

    if (lyrics && typeof lyrics === "string" && lyrics.trim()) {
      sunoBody.lyrics = lyrics;
      sunoBody.tags = style || "ambient";
      if (title) sunoBody.title = title;
    } else {
      sunoBody.prompt = prompt || "beautiful emotional music";
      sunoBody.tags = style || "ambient";
    }

    const res = await fetch(`${BASE_URL}/suno-imagine`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": apiKey,
      },
      body: JSON.stringify(sunoBody),
    });

    const data = await res.json();
    console.log("[music/generate] Apiframe response:", JSON.stringify(data).slice(0, 300));

    const taskId = data?.task_id;
    if (!taskId) {
      return NextResponse.json({ success: false, error: "task_id를 받지 못했어요: " + JSON.stringify(data).slice(0, 200) }, { status: 500 });
    }

    return NextResponse.json({ success: true, taskId });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("[music/generate] error:", msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
