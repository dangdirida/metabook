import { NextRequest, NextResponse } from "next/server";

const SUNO_BASE = "https://apibox.erweima.ai";

export async function POST(req: NextRequest) {
  const apiKey = process.env.SUNOAPI_KEY;
  if (!apiKey) return NextResponse.json({ success: false, error: "SUNOAPI_KEY 없음" }, { status: 503 });

  try {
    const { prompt, style, includeVocals } = await req.json();

    const res = await fetch(`${SUNO_BASE}/api/v1/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
      body: JSON.stringify({
        prompt: prompt || "beautiful emotional music",
        style: style || "ambient",
        title: "책 감성 음악",
        customMode: false,
        instrumental: !includeVocals,
        model: "V3_5",
        callBackUrl: "https://metabook-dangdirida.vercel.app/api/webhook/suno",
      }),
    });

    const data = await res.json();
    if (data.code !== 200) {
      return NextResponse.json({ success: false, error: data.msg || "Suno 생성 실패" }, { status: 500 });
    }

    const taskId = data?.data?.taskId;
    if (!taskId) {
      return NextResponse.json({ success: false, error: "taskId 없음: " + JSON.stringify(data).slice(0, 200) }, { status: 500 });
    }

    return NextResponse.json({ success: true, taskId });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
