import { NextRequest, NextResponse } from "next/server";

const SUNO_BASE = "https://apibox.erweima.ai";
const CALLBACK_URL = "https://metabook-dangdirida.vercel.app/api/webhook/suno";

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
        prompt: prompt || "beautiful emotional music",
        style: style || "ambient",
        title: "책 감성 음악",
        customMode: false,
        instrumental: !includeVocals,
        model: "V3_5",
        callBackUrl: CALLBACK_URL,
      }),
    });

    if (!generateRes.ok) {
      const err = await generateRes.text();
      console.error("[music/generate] Suno HTTP error:", generateRes.status, err);
      return NextResponse.json({ success: false, error: `Suno API 오류: ${generateRes.status}` }, { status: 500 });
    }

    const generateData = await generateRes.json();
    console.log("[music/generate] 생성 응답:", JSON.stringify(generateData).slice(0, 300));

    if (generateData.code !== 200) {
      return NextResponse.json({ success: false, error: generateData.msg || "Suno 생성 실패" }, { status: 500 });
    }

    const taskId = generateData?.data?.taskId;
    if (!taskId) {
      return NextResponse.json({ success: false, error: "taskId를 받지 못했어요." }, { status: 500 });
    }

    console.log("[music/generate] taskId:", taskId);

    // 2단계: record-info 폴링 (최대 3분 = 36회 x 5초)
    for (let i = 0; i < 36; i++) {
      await new Promise((r) => setTimeout(r, 5000));

      try {
        const statusRes = await fetch(
          `${SUNO_BASE}/api/v1/generate/record-info?taskId=${taskId}`,
          { headers: { "Authorization": `Bearer ${apiKey}` } }
        );
        if (!statusRes.ok) continue;

        const statusData = await statusRes.json();
        if (statusData.code !== 200) continue;

        const status = statusData?.data?.status;

        if (status === "FAILED" || status === "failed") {
          const errMsg = statusData?.data?.errorMessage || "음악 생성에 실패했어요.";
          return NextResponse.json({ success: false, error: errMsg }, { status: 500 });
        }

        if (status !== "SUCCESS" && status !== "completed") {
          console.log(`[music/generate] 폴링 ${i + 1}/36 — status: ${status}`);
          continue;
        }

        // SUCCESS — 오디오 URL 추출
        const sunoData = statusData?.data?.response?.sunoData;
        if (!sunoData || !Array.isArray(sunoData) || sunoData.length === 0) {
          console.log(`[music/generate] 폴링 ${i + 1}/36 — SUCCESS이지만 sunoData 없음`);
          continue;
        }

        const first = sunoData[0];
        const audioUrl = first.streamAudioUrl || first.audioUrl || first.sourceStreamAudioUrl;

        if (!audioUrl) {
          console.log(`[music/generate] 폴링 ${i + 1}/36 — sunoData 있지만 audioUrl 없음`);
          continue;
        }

        console.log("[music/generate] 완료:", first.title, audioUrl.slice(0, 80));
        return NextResponse.json({
          success: true,
          audioUrl,
          title: first.title || "생성된 음악",
          duration: first.duration,
          imageUrl: first.imageUrl || first.sourceImageUrl,
        });
      } catch { /* polling error, continue */ }
    }

    return NextResponse.json({ success: false, error: "음악 생성 시간이 초과됐어요 (3분). 다시 시도해주세요." }, { status: 500 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("[music/generate] error:", msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
