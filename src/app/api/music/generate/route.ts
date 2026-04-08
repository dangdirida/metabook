import { NextRequest, NextResponse } from "next/server";

const SUNO_BASE = "https://apibox.erweima.ai";

export async function POST(req: NextRequest) {
  const apiKey = process.env.SUNOAPI_KEY;
  if (!apiKey) {
    return NextResponse.json({ success: false, error: "SUNOAPI_KEY가 설정되지 않았어요." }, { status: 503 });
  }

  try {
    const body = await req.json();
    const { prompt, style, includeVocals } = body;

    // 1단계: 음악 생성 요청
    const generateRes = await fetch(`${SUNO_BASE}/api/v1/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        prompt: prompt || "A calm emotional piano piece",
        style: style || "pop",
        title: "AI Generated Music",
        instrumental: !includeVocals,
        model: "V3_5",
        callBackUrl: "",
      }),
    });

    if (!generateRes.ok) {
      const err = await generateRes.text();
      console.error("[music/generate] Suno error:", generateRes.status, err);
      return NextResponse.json({ success: false, error: `Suno API 오류: ${generateRes.status}` }, { status: 500 });
    }

    const generateData = await generateRes.json();
    const taskId = generateData?.data?.taskId || generateData?.data?.task_id || generateData?.taskId;

    if (!taskId) {
      console.error("[music/generate] No taskId:", JSON.stringify(generateData).slice(0, 500));
      return NextResponse.json({ success: false, error: "task_id를 받지 못했어요." }, { status: 500 });
    }

    // 2단계: 폴링으로 결과 대기 (최대 120초)
    for (let i = 0; i < 24; i++) {
      await new Promise((r) => setTimeout(r, 5000));

      try {
        const statusRes = await fetch(`${SUNO_BASE}/api/v1/generate/record?taskId=${taskId}`, {
          headers: { "Authorization": `Bearer ${apiKey}` },
        });
        if (!statusRes.ok) continue;

        const statusData = await statusRes.json();
        const status = statusData?.data?.status || statusData?.status;

        if (status === "completed" || status === "SUCCESS" || status === "COMPLETED") {
          const items = statusData?.data?.data || statusData?.data?.response?.sunoData || [];
          const first = Array.isArray(items) ? items[0] : items;
          const audioUrl = first?.audioUrl || first?.audio_url || first?.sourceUrl;

          if (audioUrl) {
            return NextResponse.json({
              success: true,
              audioUrl,
              title: first.title || "생성된 음악",
              duration: first.duration,
              imageUrl: first.imageUrl || first.image_url || first.coverUrl,
            });
          }
        }

        if (status === "failed" || status === "FAILED" || status === "ERROR") {
          return NextResponse.json({ success: false, error: "음악 생성에 실패했어요." }, { status: 500 });
        }
      } catch { /* polling error, continue */ }
    }

    return NextResponse.json({ success: false, error: "음악 생성 시간이 초과됐어요. 다시 시도해주세요." }, { status: 500 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("[music/generate] error:", msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
